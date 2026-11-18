from __future__ import annotations

import json
import os
import time
from typing import Any
from urllib.request import Request, urlopen

from dotenv import load_dotenv

try:
    from snaptrade_client import SnapTrade, SnapTradeAuth
except ImportError:
    SnapTrade = None
    SnapTradeAuth = None


load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


class SnapTradeUnavailable(RuntimeError):
    pass


def build_client() -> Any:
    client_id = os.getenv("SNAPTRADE_CLIENT_ID")
    consumer_key = os.getenv("SNAPTRADE_CONSUMER_KEY")
    if not client_id or not consumer_key:
        raise SnapTradeUnavailable("SnapTrade credentials are not configured")
    if SnapTrade is None or SnapTradeAuth is None:
        raise SnapTradeUnavailable("SnapTrade SDK is not installed")
    return SnapTrade(
        auth=SnapTradeAuth.personal_api_key(
            client_id=client_id,
            consumer_key=consumer_key,
        )
    )


def body(response: Any) -> Any:
    return getattr(response, "body", response)


_fx_cache: dict[str, tuple[float, float]] = {}


def cad_rate(currency: str) -> float:
    currency = currency.upper()
    if currency == "CAD":
        return 1.0
    if currency != "USD":
        raise SnapTradeUnavailable(f"Unsupported balance currency: {currency}")

    now = time.time()
    cached = _fx_cache.get(currency)
    if cached and now - cached[1] < 3600:
        return cached[0]

    request = Request(
        "https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=1",
        headers={"User-Agent": "FINAI portfolio dashboard"},
    )
    with urlopen(request, timeout=8) as response:
        payload = json.loads(response.read().decode("utf-8"))
    observations = payload.get("observations", [])
    rate = float(observations[-1]["FXUSDCAD"]["v"])
    _fx_cache[currency] = (rate, now)
    return rate


def get_account_value_cad() -> dict[str, Any]:
    client = build_client()
    response = client.account_information.list_user_accounts(timeout=20.0)
    payload = body(response)
    accounts = payload.get("data", payload.get("accounts", payload)) if isinstance(payload, dict) else payload

    cad_total = 0.0
    cad_accounts = 0
    usd_accounts = 0
    unknown_accounts = 0

    for account in accounts if isinstance(accounts, list) else []:
        balance = account.get("balance") if isinstance(account, dict) else None
        total = balance.get("total") if isinstance(balance, dict) else None
        if not isinstance(total, dict):
            unknown_accounts += 1
            continue
        try:
            amount = float(total.get("amount", 0))
            currency = str(total.get("currency", "")).upper()
            cad_total += amount * cad_rate(currency)
            if currency == "CAD":
                cad_accounts += 1
            elif currency == "USD":
                usd_accounts += 1
            else:
                unknown_accounts += 1
        except (TypeError, ValueError):
            unknown_accounts += 1

    return {
        "success": True,
        "accountValueCad": round(cad_total, 2),
        "accountCount": len(accounts) if isinstance(accounts, list) else 0,
        "cadAccountCount": cad_accounts,
        "usdAccountCount": usd_accounts,
        "unknownAccountCount": unknown_accounts,
    }


def normalize_account_category(account: dict[str, Any]) -> str:
    text = f"{account.get('account_category', '')} {account.get('raw_type', '')} {account.get('name', '')}".upper()
    for category in ("RRSP", "TFSA", "FHSA"):
        if category in text:
            return category
    if "PERSONAL" in text or "NONREGISTERED" in text or "TAXABLE" in text:
        return "PERSONAL"
    if "INVESTMENT" in text:
        return "PERSONAL"
    return "UNKNOWN"


def get_snaptrade_portfolio() -> dict[str, Any]:
    client = build_client()
    response = client.account_information.list_user_accounts(timeout=20.0)
    payload = body(response)
    accounts = payload.get("data", payload.get("accounts", payload)) if isinstance(payload, dict) else payload
    normalized_accounts: list[dict[str, Any]] = []
    normalized_holdings: list[dict[str, Any]] = []
    account_total_cad = 0.0

    for index, account in enumerate(accounts if isinstance(accounts, list) else [], start=1):
        account_id = str(account.get("id", ""))
        balance = account.get("balance") if isinstance(account, dict) else None
        total = balance.get("total") if isinstance(balance, dict) else None
        amount = float(total.get("amount", 0)) if isinstance(total, dict) else 0.0
        currency = str(total.get("currency", "CAD")).upper() if isinstance(total, dict) else "CAD"
        try:
            balance_cad = amount * cad_rate(currency)
        except (SnapTradeUnavailable, KeyError, TypeError, ValueError):
            balance_cad = amount if currency == "CAD" else 0.0
        account_total_cad += balance_cad
        local_account_id = f"account-{index}"
        normalized_accounts.append({
            "id": local_account_id,
            "name": str(account.get("name") or account.get("institution_name") or "Unknown account"),
            "type": normalize_account_category(account),
            "balance": balance_cad,
            "currency": "CAD",
        })

        if not account_id:
            continue
        try:
            positions_response = client.account_information.get_all_account_positions(
                account_id=account_id, timeout=15.0
            )
            positions_payload = body(positions_response)
            positions = positions_payload.get("results", []) if isinstance(positions_payload, dict) else []
        except Exception:
            positions = []

        for position_index, position in enumerate(positions if isinstance(positions, list) else [], start=1):
            instrument = position.get("instrument") if isinstance(position, dict) else None
            if not isinstance(instrument, dict):
                continue
            symbol = str(instrument.get("symbol") or instrument.get("raw_symbol") or "").upper()
            if not symbol:
                continue
            quantity = float(position.get("units", 0) or 0)
            price = float(position.get("price", 0) or 0)
            holding_currency = str(position.get("currency") or instrument.get("currency") or "CAD").upper()
            try:
                value_cad = quantity * price * cad_rate(holding_currency)
            except (SnapTradeUnavailable, KeyError, TypeError, ValueError):
                value_cad = quantity * price if holding_currency == "CAD" else 0.0
            normalized_holdings.append({
                "id": f"{local_account_id}-holding-{position_index}",
                "accountId": local_account_id,
                "accountType": normalize_account_category(account),
                "symbol": symbol,
                "name": str(instrument.get("description") or symbol),
                "quantity": quantity,
                "price": price,
                "value": value_cad,
                "currency": holding_currency,
                "platform": "Wealthsimple",
                "kind": str(instrument.get("kind") or "asset"),
            })

    return {
        "success": True,
        "accountValueCad": round(account_total_cad, 2),
        "accountCount": len(normalized_accounts),
        "accounts": normalized_accounts,
        "holdings": normalized_holdings,
        "source": "live",
    }


def get_snaptrade_history(days: int) -> dict[str, Any]:
    client = build_client()
    accounts_response = client.account_information.list_user_accounts(timeout=20.0)
    payload = body(accounts_response)
    accounts = payload.get("data", payload.get("accounts", payload)) if isinstance(payload, dict) else payload
    combined: dict[str, float] = {}

    for account in accounts if isinstance(accounts, list) else []:
        account_id = str(account.get("id", ""))
        if not account_id:
            continue
        try:
            history_response = client.account_information.get_account_balance_history(
                account_id=account_id, timeout=15.0
            )
            history_payload = body(history_response)
        except Exception:
            continue
        history_currency = str(history_payload.get("currency", "CAD")).upper() if isinstance(history_payload, dict) else "CAD"
        history = history_payload.get("history", []) if isinstance(history_payload, dict) else []
        for point in history if isinstance(history, list) else []:
            if not isinstance(point, dict):
                continue
            date = str(point.get("date", ""))
            total_value = point.get("total_value")
            if isinstance(total_value, dict):
                amount = float(total_value.get("amount", 0) or 0)
                point_currency = str(total_value.get("currency") or history_currency).upper()
            else:
                amount = float(total_value or 0)
                point_currency = history_currency
            try:
                amount_cad = amount * cad_rate(point_currency)
            except (SnapTradeUnavailable, KeyError, TypeError, ValueError):
                amount_cad = amount if point_currency == "CAD" else 0.0
            combined[date] = combined.get(date, 0.0) + amount_cad

    cutoff = time.time() - max(1, days) * 86400
    points: list[dict[str, Any]] = []
    for date, value in sorted(combined.items()):
        try:
            timestamp = __import__("datetime").datetime.strptime(date[:10], "%Y-%m-%d").replace(
                tzinfo=__import__("datetime").timezone.utc
            ).timestamp()
        except ValueError:
            continue
        if timestamp >= cutoff:
            points.append({"time": int(timestamp * 1000), "value": round(value, 2)})

    return {"success": True, "points": points, "source": "live"}
