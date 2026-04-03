from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid

from app.services.ai_service import generate_ai_image, SERVICE_CATALOG
from app.services.algorand_service import mint_image_nft, transfer_asset
from app.database import deduct_wallet_balance, get_wallet_balance, add_message, create_conversation, get_conversation

router = APIRouter(tags=["Images"])

class ImageGenerateIn(BaseModel):
    wallet_address: str
    prompt: str
    conversation_id: Optional[str] = None

class ImageMintIn(BaseModel):
    wallet_address: str
    image_url: str
    prompt: str

class ImageTransferIn(BaseModel):
    wallet_address: str
    asset_id: int

@router.post("/images/generate")
async def generate_image_endpoint(data: ImageGenerateIn):
    service_id = "image_studio"
    
    # 1. Check Balance (2.0 ALGO = 2,000_000 microAlgo)
    balance = await get_wallet_balance(data.wallet_address)
    cost = SERVICE_CATALOG[service_id]["price_microalgo"]
    
    if balance < cost:
        raise HTTPException(status_code=402, detail="Insufficient balance to generate AI image. 2.0 ALGO required.")
        
    # 2. Setup Conversation
    conv_id = data.conversation_id or str(uuid.uuid4())
    if not data.conversation_id:
        await create_conversation(conv_id, service_id, data.wallet_address)
    
    # 3. Deduct Balance
    await deduct_wallet_balance(data.wallet_address, cost)
    
    # 4. Generate Image
    try:
        # Save user prompt
        await add_message(conv_id, "user", data.prompt)
        
        image_url = await generate_ai_image(data.prompt)
        
        # Save AI response (the URL)
        # Note: We prefix with [IMAGE] so frontend knows how to render it
        await add_message(conv_id, "assistant", f"[IMAGE]{image_url}", tokens_used=1000, cost_usd=0.04)
        
        return {
            "conversation_id": conv_id,
            "image_url": image_url,
            "status": "success"
        }
    except Exception as e:
        # Refund on failure
        await deduct_wallet_balance(data.wallet_address, -cost)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/images/mint")
async def mint_image_endpoint(data: ImageMintIn):
    try:
        asset_id = await mint_image_nft(data.wallet_address, data.image_url, data.prompt)
        return {
            "asset_id": asset_id,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/images/transfer")
async def transfer_image_endpoint(data: ImageTransferIn):
    try:
        txid = await transfer_asset(data.wallet_address, data.asset_id)
        return {
            "txid": txid,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
