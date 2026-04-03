"""
Deployment script for PayPerAI smart contract.
"""
import os
import json
from pathlib import Path
from dotenv import load_dotenv
from algokit_utils import get_algod_client, get_account_from_mnemonic, ApplicationClient

def deploy():
    """
    Deploys or updates the PayPerAI smart contract to Algorand Testnet.
    Loads environment variables, creates clients, and applies the compiled artifact.
    """
    load_dotenv()
    
    mnemonic = os.getenv("PLATFORM_WALLET_MNEMONIC")
    algod_url = os.getenv("ALGOD_URL", "https://testnet-api.algonode.cloud")
    algod_token = os.getenv("ALGOD_TOKEN", "")
    existing_app_id = os.getenv("ALGORAND_APP_ID", "0")
    
    if not mnemonic:
        raise ValueError("PLATFORM_WALLET_MNEMONIC is missing in .env")

    # Connect to the network
    algod_client = get_algod_client(node_url=algod_url, node_token=algod_token)
    deployer = get_account_from_mnemonic(mnemonic)
    
    # Needs matching path to compiled JSON artifact from algokit
    artifact_path = Path("artifacts") / "PayPerAI.arc32.json"
    
    if not artifact_path.exists():
        raise FileNotFoundError(f"Contract artifact not found at {artifact_path}. Please run `algokit compile` first.")
        
    with open(artifact_path, "r") as f:
        app_spec = json.load(f)

    # Setup the Application Client
    app_client = ApplicationClient(
        algod_client=algod_client,
        app_spec=app_spec,
        signer=deployer,
        app_id=int(existing_app_id) if existing_app_id and existing_app_id.isdigit() else 0
    )
    
    try:
        # Deploy on-chain
        response = app_client.deploy(
            on_schema_break="append",
            on_update="update",
            allow_delete=True,
            allow_update=True
        )
        print("✅ Contract deployed successfully!")
        print(f"APP_ID: {response.app.app_id}")
        print(f"Contract Address: {response.app.app_address}")
        print("→ Add APP_ID to backend/.env as ALGORAND_APP_ID")
    except Exception as e:
        print(f"Deployment failed: {e}")

if __name__ == "__main__":
    deploy()
