from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.transaction import PaymentTxn
from app.config import settings

def fund():
    algod_client = algod.AlgodClient(settings.algod_token, settings.algod_url)
    private_key = mnemonic.to_private_key(settings.platform_wallet_mnemonic)
    sender = account.address_from_private_key(private_key)
    
    receiver = "77J5RQTFZEGE2JVL47CBFVPBJSXAIEARVXE46FIAAU3PW47HHSRJITCGUQ"
    amount = 2_000_000 # 2 ALGO
    
    params = algod_client.suggested_params()
    txn = PaymentTxn(sender, params, receiver, amount)
    signed_txn = txn.sign(private_key)
    
    txid = algod_client.send_transaction(signed_txn)
    print(f"Sent 2 ALGO to contract. TXID: {txid}")

if __name__ == "__main__":
    fund()
