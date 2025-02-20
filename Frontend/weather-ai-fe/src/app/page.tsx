"use client";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import axios from "axios";

// Function to get weather icon
const getWeatherIcon = (description: string) => {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes("clear")) return "☀️";
  if (lowerDesc.includes("rain")) return "🌧️";
  if (lowerDesc.includes("snow")) return "❄️";
  if (lowerDesc.includes("cloud")) return "☁️";
  if (lowerDesc.includes("storm")) return "⛈️";
  return "🌍"; // Default icon
};

type Weather = {
  location: string;
  weather_temperature: string;
  weather_description: string;
  latitude: number;
  longitude: number;
  pollutant_keys: string[];
  pollutant_values: string[];
  air_quality: string;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [weatherdata, setWeatherData] = useState<Weather | null>(null);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!query) return;

    setLoading(true);
    setError("");
    setWeatherData(null);

    try {
      const response = await axios.post(
        "http://localhost:8000/weather",
        { query },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log(response.data);
      setWeatherData(response.data);
    } catch (e) {
      console.log("this is the error message", e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex justify-between w-full max-w-4xl">
        <h1 className="text-4xl font-bold">Weather AI</h1>
        <ModeToggle />
      </div>

      {loading ? (
        <Skeleton className="w-full max-w-sm h-10 rounded-md" />
      ) : weatherdata ? null : (
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Enter Your Weather Query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            type="submit"
            onClick={fetchWeather}
            disabled={!query || loading}
          >
            Submit
          </Button>
        </div>
      )}

      {weatherdata && (
        <Card className="w-full max-w-sm text-center rounded-xl shadow-xl p-6 bg-gradient-to-b from-blue-600 to-indigo-900 text-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              {weatherdata.location}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-lg">
              📍 Coordinates: {weatherdata.latitude}, {weatherdata.longitude}
            </p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-4xl">
                {getWeatherIcon(weatherdata.weather_description)}
              </span>
            </div>
            <p className="text-lg">
              🌡️ Temperature: {weatherdata.weather_temperature}°C
            </p>
            <p className="text-lg">📝 {weatherdata.weather_description}</p>
            <p className="text-lg">💧 Air Quality: {weatherdata.air_quality}</p>
            <p className="text-lg font-semibold">💨 Pollutants:</p>
            <ul className="text-sm space-y-1">
              {weatherdata.pollutant_keys.map((key, index) => (
                <li key={key} className="text-gray-200">
                  {key}: {weatherdata.pollutant_values[index]}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
