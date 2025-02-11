import asyncio
import os
from dataclasses import dataclass
import logfire
from httpx import AsyncClient
from pydantic import BaseModel
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.gemini import GeminiModel
from pydantic_ai.exceptions import UserError
from dotenv import load_dotenv
import time
from typing import List,Union
from fastapi import FastAPI
import uvicorn

load_dotenv()
logfire.configure()


logfire.info("Starting Gemini Agent")
