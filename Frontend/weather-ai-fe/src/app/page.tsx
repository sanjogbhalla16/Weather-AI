"use client";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

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

  const fetchWeather = async () => {
    if (!query) return;

    setLoading(true);
    setWeatherData(null);

    try {
      const response = await axios.post(
        "http://localhost:8000/weather",
        { query },
        { headers: { "Content-Type": "application/json" } }
      );
      setWeatherData(response.data);
    } catch (e) {
      console.log("error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[auto_1fr] items-center justify-items-center min-h-screen p-8 pb-20 gap-10 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Header with Toggle */}
      <div className="flex justify-between w-full max-w-4xl">
        <h1 className="text-4xl font-bold">Weather AI</h1>
        <ModeToggle />
      </div>

      {/* Search Input */}
      {!weatherdata && (
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Enter Your City Name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            type="submit"
            onClick={fetchWeather}
            disabled={!query || loading}
          >
            {loading ? "Loading..." : "Submit"}
          </Button>
        </div>
      )}

      {/* Back Button */}
      {weatherdata && (
        <Button
          onClick={() => setWeatherData(null)}
          className="absolute top-16 left-10 bg-gray-800 text-white px-4 py-2 rounded-lg"
        >
          ← Back
        </Button>
      )}

      {/* Skeleton Loader */}
      {loading && (
        <Card className="w-full max-w-xs rounded-xl shadow-2xl bg-gradient-to-b from-blue-500 to-purple-800 text-white border border-gray-300 p-6">
          <CardContent className="text-center space-y-4">
            <Skeleton className="h-10 w-10 mx-auto rounded-full" />
            <Skeleton className="h-8 w-1/2 mx-auto" />
            <Skeleton className="h-5 w-3/4 mx-auto" />
            <div className="flex justify-between mt-4">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather Card with Animation */}
      {!loading && weatherdata && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-xs rounded-xl shadow-2xl bg-gradient-to-b from-blue-500 to-purple-800 text-white border border-gray-300 p-6">
            <CardContent className="text-center space-y-4">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <span className="text-6xl">
                  {getWeatherIcon(weatherdata.weather_description)}
                </span>
              </motion.div>
              <p className="text-3xl font-bold">
                {weatherdata.weather_temperature}°C
              </p>
              <p className="text-lg">{weatherdata.location}</p>
              <div className="flex justify-between mt-4">
                <p className="text-sm flex items-center gap-1">
                  💧 {weatherdata.air_quality} Air Quality
                </p>
                <p className="text-sm flex items-center gap-1">
                  🌪️ {weatherdata.pollutant_values[0]} Wind Speed
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
