import asyncio
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.abi import Method
from algosdk.atomic_transaction_composer import AtomicTransactionComposer, AccountTransactionSigner
from algosdk.encoding import decode_address

from app.config import settings
from app.services.ai_service import SERVICE_CATALOG

async def main():
    algod_client = algod.AlgodClient(settings.algod_token, settings.algod_url)
    private_key = mnemonic.to_private_key(settings.platform_wallet_mnemonic)
    sender = account.address_from_private_key(private_key)
    
    app_id = settings.app_id_int
    method = Method.from_signature("register_service(string,uint64,address)bool")
    
    sender_addr = decode_address(sender)

    for service_id, details in SERVICE_CATALOG.items():
        try:
            print(f"Registering {service_id}...")
            params = algod_client.suggested_params()
            params.fee = 2000
            params.flat_fee = True
            
            atc = AtomicTransactionComposer()
            signer = AccountTransactionSigner(private_key)
            
            # price is in microalgo
            price = details["price_microalgo"]
            
            creator_wallet = details.get("creator_address", settings.platform_wallet_address)
            creator_addr = decode_address(creator_wallet)
            
            boxes = [
                (app_id, b"p_" + service_id.encode('utf-8')),
                (app_id, b"c_" + service_id.encode('utf-8'))
            ]
            
            atc.add_method_call(
                app_id=app_id,
                method=method,
                sender=sender,
                sp=params,
                signer=signer,
                method_args=[service_id, price, creator_wallet],
                boxes=boxes
            )
            
            result = atc.execute(algod_client, 4)
            print(f"Success for {service_id}: {result.tx_ids}")
        except Exception as e:
            print(f"Failed for {service_id}: {e}")

if __name__ == "__main__":
    asyncio.run(main())
