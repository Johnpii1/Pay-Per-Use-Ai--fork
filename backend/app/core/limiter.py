"""
Shared limiter instance to avoid circular imports.
Import this in both main.py and any route that needs rate limiting.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
