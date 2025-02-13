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
    
class WeatherResponse(BaseModel):
    location:str
    weather_temperature:float
    weather_description:str
    air_quality:int
    pollutant_keys:List[str]
    pollutant_values:List[int]
    latitude:float
    longitude:float
    
#we need to provides these Deps into our agent using params 

model = GeminiModel(model_name="gemini-2.0-flash-exp",api_key=os.getenv("GEMINI_API_KEY"))

agent = Agent(model=model,deps_type=Deps,result_type=WeatherResponse)

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
    #print("is this giving output",ctx.deps.geo_api_key)
    if ctx.deps.geo_api_key is None:
        return {'lat':51.1,'lng':10.3}
    
    params={
        'q':location_Description,
        'api_key':ctx.deps.geo_api_key
    }
    with logfire.span('Calling geocode API',params=params) as span:
        response = await ctx.deps.client.get('https://geocode.maps.co/search',params=params)
        response.raise_for_status()
        data = response.json()
        span.set_attribute('response69',data)
        
        return {'lat':data[0]['lat'], 'lng':data[0]['lon']}

@agent.tool
async def get_weather(ctx:RunContext[Deps],lat:float,lng:float)->dict[str,any]:
    """Get the weather at a location

    Args:
        ctx (RunContext[Deps]): the run context
        lat (float): the latitude of the location
        lng (float): the longitude of the location
    """
    print("is this giving output",ctx.deps.weather_api_key)
    if ctx.deps.weather_api_key is None:
        return {'temp':10,'humidity':10}
    
    #these are the order and which parameters does the below link accepts
    params = {
        'location': f'{lat},{lng}',
        'apikey': ctx.deps.weather_api_key,
        'units': 'metric'
    }
    with logfire.span('Calling weather API',params=params) as span:
        response = await ctx.deps.client.get('https://api.tomorrow.io/v4/weather/realtime',params=params)
        response.raise_for_status()
        data = response.json() #this will give the data in json format
        print(data)
        span.set_attribute('response33',data)
        
        values = data['data']['values']
        
    code_lookup = {
          0: "Unknown",
          1000: "Clear, Sunny",
          1100: "Mostly Clear",
          1101: "Partly Cloudy",
          1102: "Mostly Cloudy",
          1001: "Cloudy",
          2000: "Fog",
          2100: "Light Fog",
          4000: "Drizzle",
          4001: "Rain",
          4200: "Light Rain",
          4201: "Heavy Rain",
          5000: "Snow",
          5001: "Flurries",
          5100: "Light Snow",
          5101: "Heavy Snow",
          6000: "Freezing Drizzle",
          6001: "Freezing Rain",
          6200: "Light Freezing Rain",
          6201: "Heavy Freezing Rain",
          7000: "Ice Pellets",
          7101: "Heavy Ice Pellets",
          7102: "Light Ice Pellets",
          8000: "Thunderstorm"
        } 
        
    return {
            'temperature': f'{values['temperatureApparent']}°C',
            'description': code_lookup.get(values['weatherCode'], "Unknown")
        }


@agent.tool
async def get_air_quality(ctx:RunContext[Deps],lat:float,lng:float)->dict[str,any]:
    """Get the air quality at a location

    Args:
        ctx (RunContext[Deps]): the run context
        lat (float): the latitude of the location
        lng (float): the longitude of the location
    """
    
    if ctx.deps.openweather_api_key is None:
        return {'air_quality': 0, 'air_pollutants': []}
    
    params={
        'lat': lat,
        'lon': lng,
        'appid':ctx.deps.openweather_api_key
    }
    with logfire.span('Calling weather API',params=params) as span:
        response = await ctx.deps.client.get('http://api.openweathermap.org/data/2.5/air_pollution',params=params)
        response.raise_for_status()
        data = response.json() #this will give the data in json format
        print(data)
        span.set_attribute('response',data)
    
    return {
        'air_quality': data['list'][0]['main']['aqi'],
        'pollutants': data['list'][0]['components']
    }
    
    
async def main():
    geo_api_key = os.getenv('GEO_API_KEY')
    weather_api_key = os.getenv('WEATHER_API_KEY')
    openweather_api_key = os.getenv('OPENWEATHER_API_KEY')
    
    
    async with AsyncClient() as client:
        deps = Deps(
            client=client,
            geo_api_key = geo_api_key,
            weather_api_key=weather_api_key,
            openweather_api_key=openweather_api_key    
        )
        print("Deps:", deps)  # Debugging print
        result = await agent.run("what are the exact coordinates and weather of london",deps=deps)
        

asyncio.run(main())

