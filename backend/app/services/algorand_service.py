"""
Algorand blockchain interaction service focusing on REST fetching and validation.
Supports both individual transaction IDs and group transaction IDs.
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

def _fetch_transactions_by_group(tx_id: str) -> list:
    """Try fetching transactions by group ID securely using AlgoKit."""
    from algosdk.v2client import indexer as indexer_v2
    indexer = indexer_v2.IndexerClient("", settings.indexer_url, "")
    try:
        resp = indexer.search_transactions(note_prefix=b"", tx_type="pay")
        # indexer client doesn't explicitly expose 'group' loosely in older v2 typed wrappers sometimes,
        # but pure rest search works. Let's use pure indexer search_transactions method.
        # Fallback to direct requests if algokit wrapper misses group argument directly in its signature for this version
        url = f"{settings.indexer_url}/v2/transactions?group={tx_id}"
        return requests.get(url, timeout=10).json().get("transactions", [])
    except:
        return []

def _fetch_transaction_by_id(tx_id: str) -> list:
    """Fetch a single transaction by its individual transaction ID using AlgoKit."""
    try:
        from algosdk.v2client import indexer as indexer_v2
        indexer = indexer_v2.IndexerClient("", settings.indexer_url, "")
        resp = indexer.transaction(tx_id)
        tx = resp.get("transaction")
        if tx:
            return [tx]
    except Exception as e:
        # 404 from algosdk indexer throws an exception
        pass
    return []
    
async def verify_payment_transaction(tx_group_id: str, service_id: str, buyer_wallet: str) -> tuple[bool, str]:
    """
    Validates the payment against the Algorand blockchain indexer.
    Supports both group transaction IDs and individual transaction IDs.
    """
    txns = []
    try:
        import asyncio
        # The indexer can sometimes take 3-10 seconds to catch up with ALGOD node.
        # We retry fetching the transaction up to 6 times (12 seconds)
        for attempt in range(6):
            # First try as individual transaction ID (most common from Pera Wallet)
            txns = _fetch_transaction_by_id(tx_group_id)
            
            # If not found, try as group ID
            if not txns:
                txns = _fetch_transactions_by_group(tx_group_id)
                
            if txns:
                break
                
            await asyncio.sleep(2)
            
    except requests.Timeout:
        return False, "TIMEOUT_ALGORAND_INDEXER"
    except Exception as e:
        return False, f"NETWORK_ERROR_ALGORAND_INDEXER: {e}"
        
    if not txns:
        return False, "TRANSACTION_NOT_FOUND. It may take a few seconds for the transaction to appear on the indexer. Please wait and try again."
        
    app_id = settings.app_id_int
    contract_addr = get_app_address(app_id)
    expected_price = get_service_price_from_contract(service_id)
    
    if expected_price < 0:
        return False, "SERVICE_NOT_FOUND_ON_CONTRACT"
        
    has_payment = False
    has_app_call = (app_id == 0)  # Skip app call check if no smart contract deployed
    
    for tx in txns:
        if tx.get("confirmed-round", 0) == 0:
            return False, "TRANSACTION_NOT_CONFIRMED"
            
        txtype = tx.get("tx-type")
        
        if txtype == "pay":
            pay_details = tx.get("payment-transaction", {})
            receiver = pay_details.get("receiver", "")
            amount = pay_details.get("amount", 0)
            sender = tx.get("sender", "")
            
            # Check receiver matches platform/contract address
            if receiver == contract_addr:
                # Check sender matches buyer wallet
                if sender != buyer_wallet:
                    return False, f"SENDER_MISMATCH: Payment was sent from {sender[:8]}... but session was created with {buyer_wallet[:8]}..."
                # Check amount
                if amount >= expected_price:
                    has_payment = True
                else:
                    return False, f"INSUFFICIENT_PAYMENT (Expected {expected_price} microAlgo, got {amount})"
                    
        if txtype == "appl":
            appl_details = tx.get("application-transaction", {})
            if appl_details.get("application-id") == app_id:
                if tx.get("sender") == buyer_wallet:
                    has_app_call = True
                else:
                    return False, "APP_CALL_SENDER_MISMATCH"
                    
    if has_payment and has_app_call:
        return True, ""
        
    if not has_payment:
        return False, f"PAYMENT_NOT_FOUND: No payment transaction to {contract_addr[:12]}... was found. Make sure you sent ALGO to the correct address."
    
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
        box_name = base64.b64encode(service_id.encode('utf-8')).decode()
        box_resp = requests.get(f"{settings.algod_url}/v2/applications/{app_id}/box?name=b64:{box_name}", timeout=5)
        if box_resp.status_code == 200:
            box_data = box_resp.json()
            val_b64 = box_data.get("value")
            return int.from_bytes(base64.b64decode(val_b64), 'big')
            
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

async def mint_image_nft(buyer_wallet: str, image_url: str, prompt: str) -> int:
    """
    Creates a unique ASA (NFT) on Algorand Testnet.
    Returns the new Asset ID.
    """
    from algosdk import account, transaction, mnemonic
    from algosdk.v2client import algod
    import json
    import asyncio

    if not settings.platform_wallet_mnemonic:
        raise ValueError("PLATFORM_WALLET_MNEMONIC not set in .env")

    # Initialize Algod
    algod_client = algod.AlgodClient(settings.algod_token, settings.algod_url)
    
    # Get creator account
    private_key = mnemonic.to_private_key(settings.platform_wallet_mnemonic)
    creator_addr = account.address_from_private_key(private_key)

    # Get suggested params
    params = algod_client.suggested_params()
    
    # Define NFT properties (ARC-69 style metadata in note)
    asset_name = f"PPAI {prompt[:15]}..."
    unit_name = "PPAI"
    
    metadata = {
        "standard": "arc69",
        "description": f"AI Generated Art by PayPerAI: {prompt}",
        "external_url": "https://payperai.io",
        "mime_type": "image/png"
    }
    note = json.dumps(metadata).encode()

    import uuid
    image_uuid = str(uuid.uuid4())
    stable_url = f"{settings.platform_base_url}/static/nfts/{image_uuid}.png"

    # Create the AssetConfigTxn
    txn = transaction.AssetConfigTxn(
        sender=creator_addr,
        sp=params,
        total=1,
        default_frozen=False,
        unit_name=unit_name,
        asset_name=asset_name,
        manager=creator_addr,
        reserve=None,
        freeze=None,
        clawback=None,
        url=stable_url,
        decimals=0,
        note=note,
        strict_empty_address_check=False
    )



    # Sign and Send
    stxn = txn.sign(private_key)
    txid = algod_client.send_transaction(stxn)
    
    # Wait for confirmation
    results = await asyncio.to_thread(transaction.wait_for_confirmation, algod_client, txid, 4)
    asset_id = results.get("asset-index")

    # Persistent Storage: Download from OpenAI and save to our static folder
    # This allows Pera Wallet to see the image forever (OpenAI URLs expire in 1h)
    if asset_id:
        try:
            import requests
            import os
            
            # Ensure directory exists
            os.makedirs("static/nfts", exist_ok=True)
            
            image_data = requests.get(image_url).content
            file_path = f"static/nfts/{image_uuid}.png"
            with open(file_path, "wb") as f:
                f.write(image_data)
        except Exception as e:
            print(f"Failed to persist image: {e}")

    return asset_id



async def send_on_chain_proof(receiver_wallet: str, content: str):
    """
    Sends a 0-ALGO transaction to the user with a SHA-256 hash of the AI content in the note field.
    Provides immutable "Proof of Response".
    """
    from algosdk import account, transaction, mnemonic
    from algosdk.v2client import algod
    import hashlib

    if not settings.platform_wallet_mnemonic:
        return # Skip if no mnemonic

    algod_client = algod.AlgodClient(settings.algod_token, settings.algod_url)
    private_key = mnemonic.to_private_key(settings.platform_wallet_mnemonic)
    sender = account.address_from_private_key(private_key)

    content_hash = hashlib.sha256(content.encode()).hexdigest()
    note = f"PayPerAI Proof of Intelligence: SHA-256={content_hash}".encode()

    params = algod_client.suggested_params()
    txn = transaction.PaymentTxn(sender, params, receiver_wallet, 0, note=note)
    stxn = txn.sign(private_key)
    algod_client.send_transaction(stxn)

async def transfer_asset(receiver_wallet: str, asset_id: int):
    """
    Transfers the minted NFT from Platform Wallet to the User's Wallet.
    Assumes the user has already opted-in.
    """
    from algosdk import account, transaction, mnemonic
    from algosdk.v2client import algod
    import asyncio

    if not settings.platform_wallet_mnemonic:
        raise ValueError("PLATFORM_WALLET_MNEMONIC not set")

    algod_client = algod.AlgodClient(settings.algod_token, settings.algod_url)
    private_key = mnemonic.to_private_key(settings.platform_wallet_mnemonic)
    sender = account.address_from_private_key(private_key)

    params = algod_client.suggested_params()
    
    # Create transfer transaction
    txn = transaction.AssetTransferTxn(
        sender=sender,
        sp=params,
        receiver=receiver_wallet,
        amt=1,
        index=asset_id
    )

    # Sign and Send
    stxn = txn.sign(private_key)
    txid = algod_client.send_transaction(stxn)
    
    # Wait for confirmation
    await asyncio.to_thread(transaction.wait_for_confirmation, algod_client, txid, 4)
    return txid



