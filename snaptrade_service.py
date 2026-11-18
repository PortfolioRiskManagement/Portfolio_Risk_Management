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
