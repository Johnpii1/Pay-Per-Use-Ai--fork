<div align="center">
  <h1>🌌 PayPerAI</h1>
  <p><b>Blockchain-Gated AI Services & One-Click NFT Studio</b></p>
  
  <p>
    <img src="https://img.shields.io/badge/Blockchain-Algorand-black?style=for-the-badge&logo=algorand&logoColor=white" alt="Algorand" />
    <img src="https://img.shields.io/badge/Frontend-React.js-blue?style=for-the-badge&logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/AI-OpenAI%20DALL--E%203-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
  </p>
</div>

<br />

## 📖 About The Project

**PayPerAI** is a cutting-edge platform bridging the gap between premium Web2 AI tools and Web3 decentralized finance. It solves the issue of bloated monthly AI subscriptions by introducing a **Pay-Per-Use** model powered by the **Algorand Blockchain**. 

Users can connect their wallets, deposit ALGO for credits, and instantly use advanced AI services without handing over their credit card details.

---

## ✨ Standout Features

### 🎨 🧠 AI Image Studio (DALL-E 3)
Generate world-class, high-fidelity AI art directly within the platform. Our seamless integration with OpenAI's DALL-E 3 ensures every prompt you write results in an absolute masterpiece.

### 💎 🔗 1-Click High-Speed NFT Minting
Transform your generated AI creations into permanent, tradable on-chain assets with zero technical friction.
- **ARC-69 Metadata Compliance:** Fully standardized metadata for maximum marketplace compatibility (e.g., Rand Gallery, ALGOxNFT).
- **Automated Transfers:** Assets are minted instantly and delivered directly to your connected Pera Wallet.
- **Persistent Visibility:** Fully optimized for Pera Wallet rendering and AlgoExplorer tracking.

### 💳 🔐 Prepaid Blockchain Gating (No Subscriptions)
Say goodbye to complex, recurring subscriptions. Pay for only what you use with lightning speed.
- **Decentralized Deposits:** Add ALGO to your app-hosted escrow securely via Pera Wallet.
- **Instant Flow Verification:** Real-time balance checks happen seamlessly before every AI execution.
- **Algorand TestNet Ready:** Fully optimized for the Algorand TestNet (Chain ID 416001) for safe and transparent development.

## 🚦 For Judges — Start Here (Live Demo)

> **Deployed at:** 🔗 **[https://debuggers-united.sandy.vercel.app](https://debuggers-united.sandy.vercel.app)**
>
> **No setup required.** Open the link, connect Pera Wallet, and follow the steps below.

### Prerequisites for Judges

- **Pera Wallet** app on your phone ([iOS](https://apps.apple.com/app/pera-algo-wallet/id1459898174) / [Android](https://play.google.com/store/apps/details?id=com.algorand.android))
- **Free Testnet ALGO** — switch Pera to Testnet (`Settings → Developer Settings → Node → TestNet`), then claim free ALGO at [bank.testnet.algorand.network](https://bank.testnet.algorand.network/)

---

### Step 1 — Connect Your Wallet

1. Open the deployed link → click **"Connect Wallet"** (top-right navbar)
2. A WalletConnect **QR code** appears
3. Open Pera Wallet on your phone → tap **Scan** → scan the QR
4. Approve the connection in Pera
5. ✅ Navbar now shows your wallet address

> **Note:** The QR scan works on MainNet by default — that is fine. The app internally uses **Algorand Testnet**, so all transactions use your TestNet account. No real money is spent.

---

### Step 2 — Browse & Choose a Service

1. Click **"Explore Services"** → pick any AI service (e.g., 🔍 Code Reviewer — 0.5 ALGO)
2. Click **"Use Service"** → you enter the **Workspace**

---

### Step 3 — Deposit ALGO to Your Prepay Balance

> ⚠️ **UI Note — Easy to Miss:** The deposit control is in the **Balance card** at the top-right of the Workspace. It shows your balance (e.g., `0.0000`) with a **small number input** (default: `1`) and a **`+` button** right next to it. The `+` button appears small — look for it on the right edge of the Balance card.

1. In the **Balance card**, find the small number input field — change it to the amount you want to deposit (e.g., type `2` for 2 ALGO)
2. Click the **`+` button** (the small button immediately to the right of the input)
3. **Pera Wallet** prompts you to approve the transaction on TestNet → approve it
4. Wait ~5 seconds for on-chain confirmation → balance updates automatically

> 💡 Deposit at least **0.5 ALGO** for text services, **2.0 ALGO** for Image Studio.

---

### Step 4 — Chat with AI

1. Type your prompt in the input at the bottom (e.g., _"Review this function for bugs: def add(a,b): return a+b"_)
2. Click **"Pay & Send"** (first message) or **"Send ▶"** (follow-ups)
3. Token cost is **auto-deducted** from your balance — no extra signatures needed
4. Full multi-turn conversation context is preserved

---

### Step 5 — Generate AI Art & Mint as NFT (Image Studio)

1. Navigate to **🎨 Image Studio** → deposit **2.0 ALGO** using the `+` button
2. Type an image prompt → click **"Pay & Send"** → DALL-E 3 generates the image
3. Click **"✨ Mint as NFT"** → approve the Opt-In transaction in Pera → NFT transfers to your wallet
4. View on [Pera Testnet Explorer](https://testnet.explorer.perawallet.app) by searching your wallet address

---

### Step 6 — Verify On-Chain (Optional)

Go to [testnet.explorer.perawallet.app](https://testnet.explorer.perawallet.app) and search your wallet address to see:

- **Payment transactions** to the platform contract
- **Note field** with `PayPerAI:` proof-of-intelligence data
- **ARC-69 NFT assets** if you minted art

---

## 🏗️ What is PayPerAI?

PayPerAI is a **fully functional, deployed prototype** that demonstrates how AI services can be securely monetized on Algorand's blockchain using a pay-per-use model. Instead of subscriptions or platform lock-in, creators expose premium AI endpoints and users pay **only for what they consume** — every cent tracked on-chain.

**It is not a concept or a wireframe.** The smart contract is deployed, payments are verified on-chain, AI responses are generated in real-time, and every interaction is immutably logged.

---

## 🚀 Key Innovations

### 1. Prepaid Deposit Model with Real-Time Token Accounting

Unlike one-shot payment gateways, PayPerAI uses a **prepaid balance system**. Users deposit ALGO into the platform via Pera Wallet, and costs are **deducted per-token in real time** during AI conversations. This enables:

- Multi-turn chat sessions without re-signing transactions per message
- Sub-cent granularity (cost tracked to 13 decimal places)
- Immediate balance reflection in the UI after every AI response

### 2. On-Chain Proof of Intelligence 🧠

Every AI response triggers a **fire-and-forget Algorand note transaction** that embeds a hash of the AI output on-chain. This creates an immutable, timestamped ledger proving:

- Which wallet requested the AI response
- What was generated and when
- Verifiable on any Algorand block explorer (Testnet)

### 3. AI-Generated Art → Algorand NFT Pipeline (ARC-69)

Users can generate images using **DALL-E 3**, then with one click:

1. Backend mints the artwork as an **ARC-69 NFT** on Algorand (platform wallet as creator)
2. User performs an **Opt-In** transaction from Pera Wallet
3. Backend automatically **transfers the NFT** to the user's wallet
4. The NFT metadata includes the original prompt stored in the ARC-69 JSON note

### 4. Smart Contract with BoxMap Dynamic Pricing

The Algorand smart contract (written in **Puya/Python**) uses `BoxMap` to store service prices on-chain. Key capabilities:

- `purchase_access()` — validates payment amount against on-chain price
- `update_price()` — owner-only dynamic price adjustment
- `withdraw()` — platform owner withdraws collected ALGO
- `get_service_price()` — publicly readable pricing
- Emits buyer-address + service-id logs for indexer-based analytics

### 5. Frictionless Pera Wallet Integration

The entire payment flow is handled without any manual copy-pasting of transaction IDs:

- **Pera Wallet SDK** builds, signs, and submits transactions in 1 click
- Automatic reconnection on page refresh via WalletConnect session persistence
- Balance, deposit, NFT Opt-In, and payment — all signed natively in the Pera app

---

## 🧱 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                      │
│  ┌──────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│  │  Home    │  │  Services  │  │ Workspace  │  │  Result    │      │
│  │  Page    │  │  Catalog   │  │ (Chat/Art) │  │  Display   │      │
│  └────┬─────┘  └─────┬──────┘  └──────┬─────┘  └────────────┘      │
│       │              │               │                              │
│  ┌────┴──────────────┴───────────────┴──────────────────────┐      │
│  │              Pera Wallet SDK (WalletConnect)              │      │
│  │   ┌─────────────┐   ┌──────────────┐  ┌──────────────┐  │      │
│  │   │Connect/Sign │   │ Deposit ALGO │  │ NFT Opt-In   │  │      │
│  │   └─────────────┘   └──────────────┘  └──────────────┘  │      │
│  └───────────────────────────────────────────────────────────┘      │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ REST API
┌─────────────────────────────┴───────────────────────────────────────┐
│                        BACKEND (FastAPI)                             │
│                                                                     │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────────────┐  │
│  │ /api/v1/chat  │  │/api/v1/images │  │ /api/v1/wallet/deposit │  │
│  │ Multi-turn AI │  │ DALL-E 3 Gen  │  │ On-chain verification  │  │
│  │ GPT-4o + ctx  │  │ + NFT Mint    │  │ Indexer-based proof    │  │
│  └───────┬───────┘  └───────┬───────┘  └──────────┬─────────────┘  │
│          │                  │                     │                 │
│  ┌───────┴──────────────────┴─────────────────────┴─────────┐      │
│  │              Algorand Service Layer                       │      │
│  │  • Indexer transaction lookup & verification              │      │
│  │  • Proof-of-Intelligence note transactions                │      │
│  │  • ARC-69 NFT minting (platform wallet signs)             │      │
│  │  • Asset transfer to user wallet                          │      │
│  └──────────────────────────────┬────────────────────────────┘      │
│                                 │                                   │
│  ┌──────────────────────────────┴────────────────────────────┐      │
│  │  SQLite Database (aiosqlite)                               │      │
│  │  • services, wallet_balances, conversations, messages      │      │
│  │  • query_log (blockchain-verified audit trail)             │      │
│  └────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
┌─────────────────────────────────┴───────────────────────────────────┐
│                  ALGORAND TESTNET BLOCKCHAIN                        │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  PayPerAI Smart Contract (Puya/Python ARC4)                  │   │
│  │  • BoxMap[service_id → price_microalgo]                      │   │
│  │  • purchase_access() — validates payment amount              │   │
│  │  • withdraw() — ITXN to owner                                │   │
│  │  • ABI-compliant, indexer-readable                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Pera Wallet Connection Flow (Important for Demo)

Since no real money is involved, we use Algorand **Testnet**. However, Pera Wallet's QR scanner on the web operates on **MainNet by default**. Here is the precise connection workflow:

### Step-by-Step Wallet Connection

| Step  | Action                                                                                         | Where                  |
| ----- | ---------------------------------------------------------------------------------------------- | ---------------------- |
| **1** | Open PayPerAI in browser → Click **"Connect Wallet"**                                          | 🖥️ Browser             |
| **2** | QR code appears (WalletConnect)                                                                | 🖥️ Browser             |
| **3** | Open **Pera Wallet app** → Scan the QR code                                                    | 📱 Mobile (on MainNet) |
| **4** | Approve the connection request in Pera                                                         | 📱 Mobile              |
| **5** | After connecting, switch Pera to **Testnet**: `Settings → Developer Settings → Node → TestNet` | 📱 Mobile              |
| **6** | Wallet is now connected on the web and operating on Testnet                                    | ✅ Ready               |

### For Payments and Deposits

| Step  | Action                                                           | Where               |
| ----- | ---------------------------------------------------------------- | ------------------- |
| **1** | Choose a service → Click **Deposit ALGO** in the Workspace       | 🖥️ Browser          |
| **2** | Transaction is built automatically by the SDK                    | 🖥️ Browser          |
| **3** | **Approve the transaction** from the Testnet account in Pera app | 📱 Mobile (TestNet) |
| **4** | Transaction is submitted → verified on-chain via Indexer         | ⛓️ Algorand Testnet |
| **5** | Balance is updated in the UI → Start chatting with AI            | 🖥️ Browser          |

> **Why this works:** WalletConnect (the underlying protocol) only establishes a communication channel between the browser and Pera app. It does not enforce a specific network. The actual network is determined by the SDK's `algodClient` configuration (we point to `testnet-api.algonode.cloud`), so even though you scan on MainNet, all transactions are built and signed against Testnet.

---

## 💻 Tech Stack

| Layer               | Technology                               | Purpose                                                       |
| ------------------- | ---------------------------------------- | ------------------------------------------------------------- |
| **Smart Contract**  | Algorand Puya/Python (ARC4)              | On-chain service pricing, payment validation, fund withdrawal |
| **Backend API**     | Python FastAPI + aiosqlite               | AI orchestration, blockchain verification, NFT minting        |
| **Frontend**        | React 18 + Vite 5                        | Premium dark UI with real-time balance tracking               |
| **Wallet SDK**      | @perawallet/connect + algosdk v3         | QR scan, transaction signing, WalletConnect sessions          |
| **AI Models**       | OpenAI GPT-4o (chat) + DALL-E 3 (images) | Multi-turn conversations, AI art generation                   |
| **NFT Standard**    | ARC-69 (mutable JSON metadata)           | On-chain art ownership with prompt provenance                 |
| **Blockchain Node** | Algonode (Testnet)                       | Free public algod + indexer endpoints                         |
| **Database**        | SQLite (async)                           | Service catalog, wallet balances, conversation logs           |

---

## 📂 Project Structure

```
PayPerAI/
├── contract/                         # Algorand Smart Contract
│   └── smart_contracts/
│       └── pay_per_ai/
│           └── contract.py           # Puya/Python ARC4 contract
│
├── backend/                          # FastAPI Server
│   ├── app/
│   │   ├── main.py                   # App initialization + CORS + health
│   │   ├── config.py                 # Environment configuration
│   │   ├── database.py               # SQLite schema + queries (async)
│   │   ├── routes/
│   │   │   ├── services.py           # GET /api/v1/services — catalog listing
│   │   │   ├── payment.py            # POST /api/v1/payment/initiate — session
│   │   │   ├── query.py              # POST /api/v1/query/execute — pay+AI
│   │   │   ├── chat.py               # POST /api/v1/chat — multi-turn AI
│   │   │   ├── wallet.py             # GET/POST wallet balance + deposit
│   │   │   └── image.py              # DALL-E 3 gen + ARC-69 NFT mint
│   │   └── services/
│   │       ├── ai_service.py         # OpenAI GPT-4o + DALL-E integration
│   │       └── algorand_service.py   # Indexer, Proof-of-Intelligence, NFT
│   └── .env                          # Secrets (not committed)
│
└── frontend/                         # React + Vite Frontend
    └── src/
        ├── App.jsx                   # Route definitions
        ├── api/client.js             # Axios API client
        ├── hooks/usePeraPay.js       # Pera Wallet transaction builder
        ├── components/
        │   ├── Navbar.jsx            # Wallet connect/disconnect
        │   └── Footer.jsx            # Site footer
        └── pages/
            ├── Home.jsx              # Landing page
            ├── ServicesPage.jsx      # AI service catalog
            ├── WorkspacePage.jsx     # Chat/Image workspace + deposit
            ├── PaymentPage.jsx       # Legacy per-query payment
            └── ResultPage.jsx        # Response display
```

---

## ⚙️ Setup & Run Instructions

### Prerequisites

- **Python 3.10+** with `pip`
- **Node.js 18+** with `npm`
- **Pera Wallet** app on mobile (iOS/Android)
- **Algorand Testnet** ALGO (free from [Testnet Dispenser](https://bank.testnet.algorand.network/))
- **OpenAI API Key** with GPT-4o and DALL-E 3 access

### 1. Clone & Setup Backend

```bash
git clone https://github.com/Adity00/Debuggers_United.git
cd Debuggers_United

# Backend
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

### 2. Configure `.env`

```env
# OpenAI
OPENAI_API_KEY=sk-proj-your-key-here

# Algorand
ALGORAND_NETWORK=testnet
ALGOD_URL=https://testnet-api.algonode.cloud
ALGOD_TOKEN=
INDEXER_URL=https://testnet-idx.algonode.cloud

# Platform Wallet (create in Pera → get address + 25-word mnemonic)
PLATFORM_WALLET_ADDRESS=YOUR_58_CHAR_ALGO_ADDRESS
PLATFORM_WALLET_MNEMONIC=word1 word2 ... word25

# Smart Contract (set after deploying)
ALGORAND_APP_ID=YOUR_APP_ID

# App
APP_SECRET_KEY=any-random-64-char-string
SESSION_EXPIRY_SECONDS=600
CORS_ORIGINS=http://localhost:5173
```

### 3. Deploy Smart Contract

```bash
cd ../contract
algokit compile
python deploy_config.py
# Copy the APP_ID → paste into backend/.env as ALGORAND_APP_ID
```

### 4. Fund the Contract Address

Send **0.3 ALGO** from your Pera Wallet (Testnet) to the **Contract Address** printed during deployment. This covers the Minimum Balance Requirement for BoxMap storage.

### 5. Start Backend

```bash
cd ../backend
venv\Scripts\activate
python -m uvicorn app.main:app --reload --port 8000
# API docs → http://localhost:8000/docs
```

### 6. Start Frontend

```bash
cd ../frontend
npm install
npm run dev
# Open → http://localhost:5173
```

---

## 🎯 User Workflow (End-to-End Demo)

```
┌──────────────────────────────────────────────────────────────────┐
│  1. CONNECT  →  Scan QR with Pera (MainNet), switch to TestNet  │
│  2. BROWSE   →  Choose from 6 AI services on the Services page  │
│  3. DEPOSIT  →  Click "Deposit ALGO" → Approve on Pera (TestNet)│
│  4. USE      →  Chat with AI / Generate Images → costs deducted │
│  5. MINT     →  One-click: AI Art → ARC-69 NFT → your wallet   │
│  6. VERIFY   →  Check Testnet Explorer for Proof-of-Intelligence│
└──────────────────────────────────────────────────────────────────┘
```

### Available AI Services

| Service                 | Model    | Price    | Description                                                  |
| ----------------------- | -------- | -------- | ------------------------------------------------------------ |
| 🔍 Code Reviewer        | GPT-4o   | 0.5 ALGO | Senior engineer reviews code for bugs, security, performance |
| 🎨 Image Studio         | DALL-E 3 | 2.0 ALGO | Premium AI art generation with NFT minting capability        |
| 💡 Business Evaluator   | GPT-4o   | 0.5 ALGO | Evaluates startup ideas with market analysis                 |
| 📧 Cold Email Writer    | GPT-4o   | 0.5 ALGO | Expert sales copywriter for outbound campaigns               |
| 🤖 Text Humanizer       | GPT-4o   | 0.5 ALGO | Makes AI-generated text sound naturally human                |
| 📝 LinkedIn Post Writer | GPT-4o   | 0.5 ALGO | Professional LinkedIn thought leadership content             |

---

## 🔐 Security Features

| Feature                       | Implementation                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| **Payment Verification**      | Algorand Indexer validates every transaction on-chain before granting AI access     |
| **Replay Protection**         | Transaction IDs are logged in `query_log` — same TxID cannot be reused              |
| **Wallet Authentication**     | Pera WalletConnect ensures only the wallet owner can sign transactions              |
| **Smart Contract Validation** | `purchase_access()` asserts correct receiver, service existence, and minimum amount |
| **Owner-Only Admin**          | `update_price()` and `withdraw()` require `Txn.sender == owner` assertion           |
| **CORS Whitelisting**         | Backend only accepts requests from configured frontend origins                      |

---

## 📊 API Endpoints

| Method | Endpoint                        | Purpose                                 |
| ------ | ------------------------------- | --------------------------------------- |
| `GET`  | `/api/v1/services`              | List all AI services with pricing       |
| `POST` | `/api/v1/chat`                  | Multi-turn AI conversation (GPT-4o)     |
| `POST` | `/api/v1/images/generate`       | DALL-E 3 image generation               |
| `POST` | `/api/v1/images/mint`           | Mint AI art as ARC-69 NFT               |
| `POST` | `/api/v1/images/transfer`       | Transfer NFT to user's wallet           |
| `GET`  | `/api/v1/wallet/{addr}/balance` | Check prepaid deposit balance           |
| `POST` | `/api/v1/wallet/deposit`        | Verify on-chain deposit, credit balance |
| `POST` | `/api/v1/payment/initiate`      | Create payment session                  |
| `POST` | `/api/v1/query/execute`         | Verify payment + execute AI query       |
| `GET`  | `/health`                       | System health + blockchain status       |

Full interactive API documentation available at `/docs` (Swagger UI).

---

## 🧪 Verification on Block Explorer

After any transaction, verify it on the Algorand Testnet Explorer:

🔗 **[Pera Testnet Explorer](https://testnet.explorer.perawallet.app)**

Look for:

- **Payment transactions** from your wallet to the contract address
- **Note field** containing `PayPerAI:` prefixed data (Proof-of-Intelligence)
- **ARC-69 NFTs** minted with DALL-E prompts in the JSON note

---

## 👥 Team

**Team Debuggers United**

---

## 📄 License

Built for the Algorand Hackathon. MIT License.
