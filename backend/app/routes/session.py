"""
Session status route.
Reads the se_ (session expiry) and sb_ (session balance) BoxMap entries
from the Algorand smart contract and returns the user's current session state.
"""
import base64
import time
from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["Session"])


def _read_box_uint64(app_id: int, prefix: bytes, wallet_address: str) -> int:
    """
    Generic helper to read a uint64 value from a BoxMap entry.
    The box key = prefix + raw 32-byte decoded wallet address.
    Returns 0 if the box does not exist or any error occurs.
    """
    import requests
    try:
        from algosdk.encoding import decode_address
        raw_addr = decode_address(wallet_address)
        box_key = prefix + raw_addr
        box_name_b64 = base64.b64encode(box_key).decode()

        resp = requests.get(
            f"{settings.algod_url}/v2/applications/{app_id}/box?name=b64:{box_name_b64}",
            timeout=5
        )
        if resp.status_code == 200:
            box_data = resp.json()
            val_b64 = box_data.get("value")
            if val_b64:
                return int.from_bytes(base64.b64decode(val_b64), "big")
        return 0
    except Exception:
        return 0


@router.get("/session/{wallet_address}/status")
async def get_session_status(wallet_address: str):
    """
    Returns the current on-chain session state for a wallet.
    Reads se_ (expiry timestamp) and sb_ (session balance cap) from the contract BoxMap.
    """
    app_id = settings.app_id_int

    expiry_timestamp = _read_box_uint64(app_id, b"se_", wallet_address)
    session_balance  = _read_box_uint64(app_id, b"sb_", wallet_address)

    now = int(time.time())
    has_session = expiry_timestamp > 0
    is_expired  = has_session and (expiry_timestamp <= now)
    seconds_remaining = max(0, expiry_timestamp - now) if has_session and not is_expired else 0

    return {
        "has_session": has_session,
        "expiry_timestamp": expiry_timestamp,
        "session_balance_microalgo": session_balance,
        "is_expired": is_expired,
        "seconds_remaining": seconds_remaining,
    }
