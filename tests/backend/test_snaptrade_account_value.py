import app as app_module


def test_account_value_endpoint_returns_aggregate(monkeypatch) -> None:
    monkeypatch.setattr(
        app_module,
        "get_account_value_cad",
        lambda: {
            "success": True,
            "accountValueCad": 72248.94,
            "accountCount": 17,
            "cadAccountCount": 12,
            "usdAccountCount": 5,
            "unknownAccountCount": 0,
        },
    )

    response = app_module.app.test_client().get("/api/snaptrade/account-value")

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["success"] is True
    assert payload["accountValueCad"] == 72248.94
    assert payload["accountCount"] == 17


def test_portfolio_and_history_routes(monkeypatch) -> None:
    monkeypatch.setattr(
        app_module,
        "get_snaptrade_portfolio",
        lambda: {
            "success": True,
            "accountValueCad": 72029.72,
            "accountCount": 17,
            "accounts": [],
            "holdings": [],
            "source": "live",
        },
    )
    monkeypatch.setattr(
        app_module,
        "get_snaptrade_history",
        lambda days: {
            "success": True,
            "source": "live",
            "points": [{"time": 1760000000000, "value": 72029.72}],
        },
    )

    portfolio = app_module.app.test_client().get("/api/snaptrade/portfolio")
    history = app_module.app.test_client().get("/api/snaptrade/history?days=182")

    assert portfolio.status_code == 200
    assert portfolio.get_json()["accountCount"] == 17
    assert history.status_code == 200
    assert history.get_json()["points"][0]["value"] == 72029.72
