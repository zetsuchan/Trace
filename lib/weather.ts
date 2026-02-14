import type { WeatherContext } from "./types";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export async function fetchWeather(
  lat: number,
  lon: number,
): Promise<WeatherContext | null> {
  if (!OPENWEATHER_API_KEY) return null;

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=imperial`,
    );

    if (!res.ok) return null;

    const data = await res.json();

    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      airQualityIndex: 0, // TODO: separate AirNow API call
      conditions: data.weather?.[0]?.description || "unknown",
    };
  } catch {
    return null;
  }
}
