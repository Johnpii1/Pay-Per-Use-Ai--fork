"""
OpenAI wrapper and service catalog provider.
"""
import openai
from openai import AsyncOpenAI
from app.config import settings

SERVICE_CATALOG = {
    "code_review": {
        "id": "code_review",
        "name": "Code Reviewer",
        "description": "Senior engineer reviews your code for bugs, security, and performance.",
        "price_algo": 0.5,
        "price_microalgo": 500_000,
        "example_prompt": "Review this Python function for bugs and improvements: ...",
        "system_prompt": (
            "You are a senior software engineer with 15 years of experience. "
            "Conduct a thorough code review analyzing: correctness, edge cases, "
            "security vulnerabilities, performance bottlenecks, and style. "
            "Structure your response with sections: 🐛 Bugs, 🔒 Security, "
            "⚡ Performance, ✅ What's Good, 📝 Suggestions. Be specific and actionable."
        )
    },
    "image_studio": {
        "id": "image_studio",
        "name": "AI Image Studio",
        "description": "Mint your imagination. Generate high-quality unique AI art and turn them into Algorand NFTs.",
        "price_algo": 2.0,
        "price_microalgo": 2_000_000,
        "example_prompt": "A cyberpunk street market in Neo-Tokyo with pink neon signs, 8k resolution, cinematic lighting.",
        "system_prompt": (
            "You are a master digital artist and prompt engineer. "
            "When a user provides a prompt, refine it for high-end AI image generation. "
            "Focus on: artistic style, lighting, composition, and technical details like '8k', 'unreal engine 5', or 'photorealistic'. "
            "Always return a descriptive visual prompt optimized for DALL-E 3."
        )
    },
    "business_evaluator": {
        "id": "business_evaluator",
        "name": "Business Idea Evaluator",
        "description": "Evaluate the viability, target audience, and monetization plan of your startup idea.",
        "price_algo": 2.0,
        "price_microalgo": 2_000_000,
        "example_prompt": "Evaluate this idea: A subscription box for exotic, rare houseplant seeds targeting millennials.",
        "system_prompt": (
            "You are a seasoned startup founder and venture capitalist. "
            "When given a business idea, provide a brutal, honest evaluation. "
            "Structure your response: 💡 Concept Viability, 🎯 Target Audience, "
            "💰 Monetization Strategy, ⚠️ Critical Risks, and 🏁 Final Verdict. "
            "Be specific, realistic, and commercially focused."
        )
    },
    "linkedin_post": {
        "id": "linkedin_post",
        "name": "LinkedIn Post Generator",
        "description": "Convert brief descriptions into highly engaging, professional LinkedIn posts.",
        "price_algo": 1.0,
        "price_microalgo": 1_000_000,
        "example_prompt": "Help me announce my new job as Senior Developer at Stripe.",
        "system_prompt": (
            "You are a master LinkedIn ghostwriter. Convert the user's brief into an engaging, "
            "professional, and slightly energetic LinkedIn post. "
            "Structure: Use a strong hook, break up paragraphs for readability, "
            "add a personal reflection or lesson learned, and end with an engaging question. "
            "Include 3-5 relevant hashtags at the bottom. Do not sound robotic or artificially enthusiastic."
        )
    },
    "cold_email": {
        "id": "cold_email",
        "name": "Cold Email Writer",
        "description": "Expert copywriter crafts high-converting cold outreach emails that get replies.",
        "price_algo": 0.5,
        "price_microalgo": 500_000,
        "example_prompt": "Write a cold email to a SaaS startup CEO pitching our design agency services.",
        "system_prompt": (
            "You are an elite cold email copywriter with a proven 40% open rate track record. "
            "Write compelling, personalized cold outreach emails that feel genuine, not spammy. "
            "Structure: attention-grabbing subject line, personalized hook, clear value proposition, "
            "social proof, and a soft CTA. Keep it under 150 words. Avoid salesy language. "
            "Always provide 3 variations: formal, casual, and ultra-short."
        )
    },
    "humanize_text": {
        "id": "humanize_text",
        "name": "Humanize Text",
        "description": "Transform AI-generated content into natural, human-sounding text that bypasses detectors.",
        "price_algo": 0.5,
        "price_microalgo": 500_000,
        "example_prompt": "Humanize this AI-generated paragraph about climate change to sound natural.",
        "system_prompt": (
            "You are an expert editor specializing in making AI-generated text sound naturally human. "
            "Rewrite the given text to: vary sentence lengths, add personal touches and colloquialisms, "
            "introduce subtle imperfections, use active voice, add transitional phrases, and maintain "
            "the original meaning while making it undetectable as AI-written. "
            "Preserve the core message but make it feel like a real person wrote it conversationally."
        )
    }
}

def get_services_list() -> list[dict]:
    """
    Returns array containing all services available in the catalog.
    """
    return list(SERVICE_CATALOG.values())

async def get_ai_response(service_id: str, user_prompt: str) -> tuple[str, int]:
    """
    Proxies query to OpenAI with the mapped system prompt.
    Returns the message text and token consumption.
    """
    if service_id not in SERVICE_CATALOG:
        raise ValueError("Invalid service_id provided for AI inference.")
        
    system_prompt = SERVICE_CATALOG[service_id]["system_prompt"]
    
    client = AsyncOpenAI(api_key=settings.openai_api_key)
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=800,
            temperature=0.7
        )
        
        reply_text = response.choices[0].message.content
        tokens_used = response.usage.total_tokens
        
        return reply_text, tokens_used
        
    except openai.RateLimitError as e:
        raise RuntimeError("OpenAI rate limit exceeded. Please try again later.") from e
    except openai.APIError as e:
        raise RuntimeError(f"OpenAI API error occurred: {e}") from e
    except Exception as e:
        raise RuntimeError(f"Unexpected error interfacing with OpenAI: {e}") from e


async def get_ai_response_with_context(service_id: str, messages: list[dict]) -> tuple[str, int]:
    """
    Multi-turn conversation support.
    Takes a list of {role, content} messages and returns AI response with full context.
    """
    if service_id not in SERVICE_CATALOG:
        raise ValueError("Invalid service_id provided for AI inference.")
        
    system_prompt = SERVICE_CATALOG[service_id]["system_prompt"]
    
    client = AsyncOpenAI(api_key=settings.openai_api_key)
    
    # Build full message array with system prompt + conversation history
    api_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        api_messages.append({"role": msg["role"], "content": msg["content"]})
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=api_messages,
            max_tokens=1500,
            temperature=0.7
        )
        
        reply_text = response.choices[0].message.content
        tokens_used = response.usage.total_tokens
        
        return reply_text, tokens_used
        
    except openai.RateLimitError as e:
        raise RuntimeError("OpenAI rate limit exceeded. Please try again later.") from e
    except openai.APIError as e:
        raise RuntimeError(f"OpenAI API error occurred: {e}") from e
    except Exception as e:
        raise RuntimeError(f"Unexpected error interfacing with OpenAI: {e}") from e
async def generate_ai_image(prompt: str) -> str:
    """
    Calls OpenAI DALL-E 3 to generate a high-quality image URL.
    """
    client = AsyncOpenAI(api_key=settings.openai_api_key)
    try:
        response = await client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        return response.data[0].url
    except Exception as e:
        raise RuntimeError(f"DALL-E 3 Image Generation failed: {str(e)}")
