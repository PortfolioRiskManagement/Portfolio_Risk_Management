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
