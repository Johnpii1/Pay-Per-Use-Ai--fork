"""
Algorand blockchain interaction service focusing on REST fetching and validation.
No full transaction building SDK needed for reads.
"""
import requests
import base64
from algosdk.logic import get_application_address
from app.config import settings

# In-memory cache for app address
_cached_app_address = None

def get_app_address(app_id: int) -> str:
    """
    Derives deterministic contract address from Algorand APP_ID.
    Falls back to platform wallet address if no app_id is provided.
    """
    global _cached_app_address
    if not _cached_app_address and app_id > 0:
        _cached_app_address = get_application_address(app_id)
    return _cached_app_address or settings.platform_wallet_address

def decode_global_state(state_array: list) -> dict:
    """
    Decodes Algorand's base64 encoded global state array into a friendly dictionary.
    """
    decoded = {}
    for item in state_array:
        key_b64 = item.get("key", "")
        key = base64.b64decode(key_b64).decode("utf-8")
        
        value = item.get("value", {})
        if value.get("type") == 1:
            val_b64 = value.get("bytes", "")
            decoded[key] = base64.b64decode(val_b64)
        elif value.get("type") == 2:
            decoded[key] = value.get("uint", 0)
    return decoded
    
async def verify_payment_transaction(tx_group_id: str, service_id: str, buyer_wallet: str) -> tuple[bool, str]:
    """
    Validates the payment against the Algorand blockchain indexer.
    """
    try:
        url = f"{settings.indexer_url}/v2/transactions?group={tx_group_id}"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        txns = data.get("transactions", [])
    except requests.Timeout:
        return False, "TIMEOUT_ALGORAND_INDEXER"
    except Exception as e:
        return False, f"NETWORK_ERROR_ALGORAND_INDEXER: {e}"
        
    if not txns:
        return False, "TRANSACTION_GROUP_NOT_FOUND"
        
    app_id = settings.app_id_int
    contract_addr = get_app_address(app_id)
    expected_price = get_service_price_from_contract(service_id)
    
    if expected_price < 0:
        return False, "SERVICE_NOT_FOUND_ON_CONTRACT"
        
    has_payment = False
    has_app_call = (app_id == 0)
    
    for tx in txns:
        if tx.get("confirmed-round", 0) == 0:
            return False, "TRANSACTION_NOT_CONFIRMED"
            
        txtype = tx.get("tx-type")
        
        if txtype == "pay":
            pay_details = tx.get("payment-transaction", {})
            if pay_details.get("receiver") == contract_addr:
                if pay_details.get("amount", 0) >= expected_price:
                    has_payment = True
                else:
                    return False, f"INSUFFICIENT_PAYMENT (Expected {expected_price})"
                    
        if txtype == "appl":
            appl_details = tx.get("application-transaction", {})
            if appl_details.get("application-id") == app_id:
                if tx.get("sender") == buyer_wallet:
                    has_app_call = True
                else:
                    return False, "APP_CALL_SENDER_MISMATCH"
                    
    if has_payment and has_app_call:
        return True, ""
        
    return False, "INVALID_TRANSACTION_STRUCTURE"

def get_service_price_from_contract(service_id: str) -> int:
    """
    Reads the contract global state to determine current real-time service price.
    Returns fallback static price if not found.
    """
    app_id = settings.app_id_int
    if app_id <= 0:
        from app.services.ai_service import SERVICE_CATALOG
        return SERVICE_CATALOG.get(service_id, {}).get("price_microalgo", -1)
        
    try:
        # Check Box storage since Puya stores BoxMap there
        box_name = base64.b64encode(service_id.encode('utf-8')).decode()
        box_resp = requests.get(f"{settings.algod_url}/v2/applications/{app_id}/box?name=b64:{box_name}", timeout=5)
        if box_resp.status_code == 200:
            box_data = box_resp.json()
            val_b64 = box_data.get("value")
            return int.from_bytes(base64.b64decode(val_b64), 'big')
            
        # Fallback to Global-state format as requested by project specs
        resp = requests.get(f"{settings.algod_url}/v2/applications/{app_id}", timeout=5)
        if resp.status_code != 200:
            return -1
            
        data = resp.json()
        global_state = data.get("params", {}).get("global-state", [])
        decoded_state = decode_global_state(global_state)
        
        if service_id in decoded_state:
            return decoded_state[service_id]
            
        return -1
    except Exception:
        return -1

def get_contract_info() -> dict:
    """
    Fetches the base smart contract app properties.
    """
    app_id = settings.app_id_int
    contract_addr = get_app_address(app_id)
    is_reachable = False
    
    try:
        resp = requests.get(f"{settings.algod_url}/versions", timeout=3)
        is_reachable = resp.status_code == 200
    except:
        pass
        
    return {
        "app_id": app_id,
        "contract_address": contract_addr,
        "network": settings.algorand_network,
        "is_reachable": is_reachable
    }
