import { createServerFn } from "@tanstack/react-start";

export const getWeather = createServerFn({ method: "GET" })
  .inputValidator((data: { city: string }) => ({ city: String(data?.city ?? "Delhi") }))
  .handler(async ({ data }) => {
    const key = process.env.OPENWEATHERMAP_API_KEY;
    if (!key) throw new Error("OPENWEATHERMAP_API_KEY not configured");
    const city = encodeURIComponent(`${data.city},IN`);

    const [curRes, fcRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${key}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${key}`),
    ]);
    if (!curRes.ok) throw new Error("City not found");
    const current = await curRes.json();
    const forecast = await fcRes.json();

    const next12: Array<{ time: string; temp: number; rainProb: number; desc: string; icon: string }> =
      (forecast.list ?? []).slice(0, 4).map((s: any) => ({
        time: s.dt_txt,
        temp: Math.round(s.main.temp),
        rainProb: Math.round((s.pop ?? 0) * 100),
        desc: s.weather?.[0]?.description ?? "",
        icon: s.weather?.[0]?.icon ?? "",
      }));

    const rainSoon = next12.some((p) => p.rainProb >= 40);

    return {
      city: current.name,
      country: current.sys?.country,
      temp: Math.round(current.main.temp),
      feels: Math.round(current.main.feels_like),
      humidity: current.main.humidity,
      wind: Math.round(current.wind.speed * 3.6),
      desc: current.weather?.[0]?.description ?? "",
      icon: current.weather?.[0]?.icon ?? "",
      rainSoon,
      next12,
    };
  });
