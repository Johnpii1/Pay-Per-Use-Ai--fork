# PayPerAI

Pay-per-use AI API platform using Algorand blockchain for payment verification.

## Prerequisites

- Python 3.11+
- Node.js 18+
- AlgoKit CLI: `pip install algokit`
- Pera Wallet (mobile app) switched to Testnet
- Testnet ALGO from https://bank.testnet.algorand.network/

## Step 1 — Fill in environment variables

- Copy backend/.env.example to backend/.env
- Fill: OPENAI_API_KEY, PLATFORM_WALLET_ADDRESS,
  PLATFORM_WALLET_MNEMONIC, ALGORAND_APP_ID (after deploy)

## Step 2 — Deploy Smart Contract

cd contract
python -m venv .venv
.venv\Scripts\activate (Windows) or source .venv/bin/activate (Mac/Linux)
pip install -r requirements.txt
algokit compile smart_contracts/pay_per_ai/contract.py
python deploy_config.py
→ Copy the printed APP_ID into backend/.env as ALGORAND_APP_ID

## Step 3 — Start Backend

cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

## Step 4 — Start Frontend

cd frontend
npm install
npm run dev
→ Opens at http://localhost:5173
