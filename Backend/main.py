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
    
#we need to provides these Deps into our agent using params 

model = GeminiModel(model_name="gemini-2.0-flash-exp",api_key=os.getenv("GEMINI_API_KEY"))

agent = Agent(model=model,deps_type=Deps)

@agent.system_prompt
def system_prompt(context: RunContext):
    return "You are a weather expert and an expert for air quality"

@agent.tool
async def get_lat_lng(ctx:RunContext[Deps],location_Description:str)->dict[str,float]:
    """Get the latitude and longitude of a location

    Args:
        ctx (RunContext[Deps]): the run context
        location_Description (str): A description of the location
    """
    print("is this giving output",ctx.deps.geo_api_key)
    if ctx.deps.geo_api_key is None:
        return {'lat':51.1,'lng':10.3}
    
    params={
        'q':location_Description,
        'api_key':ctx.deps.geo_api_key
    }
    with logfire.span('Calling geocode API',params=params) as span:
        response = await ctx.deps.client.get('https://geocode.maps.co/search',params)
        response.raise_for_status()
        data = response.json()
        span.set_attribute('response69',data)
        
        return {'lat':data[0]['lat'], 'lng':data[0]['lon']}
    
async def main():
    geo_api_key = os.getenv('GEO_API_KEY')
    #print(geo_api_key)
    weather_api_key = os.getenv('WEATHER_API_KEY')
    openweather_api_key = os.getenv('OPENWEATHER_API_KEY')
    
    
    async with AsyncClient() as client:
        deps = Deps(
            client=client,
            geo_api_key = geo_api_key,
            weather_api_key=weather_api_key,
            openweather_api_key=openweather_api_key    
        )

        result = await agent.run("what are the exact coordinates of london",deps=deps)
        

asyncio.run(main())

