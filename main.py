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

@dataclass
class Deps:
    client: AsyncClient
    weather_api_key: str|None
    geo_api_key: str|None
    openweather_api_key: str|None

model = GeminiModel(model_name="gemini-2.0-flash-exp",api_key=os.getenv("GEMINI_API_KEY"))

agent = Agent(model=model)

@agent.system_prompt
def system_prompt(context: RunContext):
    return "You are a math expert"

@agent.tool
async def get_lat_lng(ctx:RunContext[Deps],location_Description:str)->dict[str,float]:
    return {"lat":0.0,"lng":0.0}
    

result = agent.run_sync("What is the square root of 144?")

logfire.info("The result is: {result}",result=result.data)

