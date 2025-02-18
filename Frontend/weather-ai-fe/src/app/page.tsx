"use client";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle"; // Import the toggle button
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import axios from "axios";

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
  //first we make the use of useState to see if the state changes here
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [weatherdata, setWeatherData] = useState<Weather | null>(null);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!city) return;

    setLoading(true);
    setError("");
    setWeatherData(null);

    try {
      const response = await axios.post("http://localhost:8000/weather", {
        city,
      });
      setWeatherData(response.data); // Set the weather data
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex justify-between w-full max-w-4xl">
        <h1 className="text-4xl font-bold">Weather AI</h1>
        <ModeToggle /> {/* Dark mode toggle button */}
      </div>
      {/* Input Form or Skeleton Loader */}
      {loading ? (
        <Skeleton className="w-full max-w-sm h-10 rounded-md" />
      ) : weatherdata ? null : (
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Enter Your Weather Query"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Button
            type="submit"
            onClick={fetchWeather}
            disabled={!city || loading}
          >
            Submit
          </Button>
        </div>
      )}

      {/*now we display the weather card*/}
      {weatherdata && (
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>{weatherdata.location}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {" "}
              Coordinates: {weatherdata.latitude}, {weatherdata.longitude}
            </p>
            <p>🌡️ Temperature: {weatherdata.weather_temperature}</p>
            <p>☀️ Description: {weatherdata.weather_description}</p>
            <p>💧 Air Quality: {weatherdata.air_quality}</p>
            <p>
              💨 Pollutant:{" "}
              <ul>
                {weatherdata.pollutant_keys.map((key, index) => (
                  <li key={key}>
                    {key}: {weatherdata.pollutant_values[index]}
                  </li>
                ))}
              </ul>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
