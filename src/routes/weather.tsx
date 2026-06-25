import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CloudSun, CloudRain, Wind, Droplets, Thermometer, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getWeather } from "@/lib/weather.functions";

export const Route = createFileRoute("/weather")({
  ssr: false,
  head: () => ({ meta: [{ title: "Weather — MultiSpace" }] }),
  component: WeatherPage,
});

function WeatherPage() {
  const [city, setCity] = useState("Delhi");
  const [query, setQuery] = useState("Delhi");
  const fetchWeather = useServerFn(getWeather);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["weather", query],
    queryFn: () => fetchWeather({ data: { city: query } }),
  });

  return (
    <AppShell title="Weather (India)" icon={<CloudSun className="h-5 w-5" />}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(city.trim() || "Delhi");
        }}
        className="glass mb-6 flex items-center gap-3 p-3"
      >
        <Search className="ml-2 h-4 w-4 text-muted-foreground" />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search Indian city (Delhi, Mumbai, Chennai…)"
          className="glass-input w-full"
        />
        <button className="glass glass-hover px-4 py-2 text-sm" type="submit">
          Go
        </button>
      </form>

      {isLoading && <div className="glass p-6 text-center">Loading weather…</div>}
      {error && (
        <div className="glass p-6 text-center text-destructive">
          {(error as Error).message}
          <div>
            <button onClick={() => refetch()} className="glass glass-hover mt-3 px-3 py-1.5 text-sm">
              Retry
            </button>
          </div>
        </div>
      )}

      {data && (
        <>
          <div className="glass p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-widest text-muted-foreground">
                  {data.city}, {data.country}
                </div>
                <div className="mt-1 text-6xl font-semibold tracking-tight">{data.temp}°C</div>
                <div className="capitalize text-muted-foreground">{data.desc}</div>
              </div>
              {data.icon && (
                <img
                  alt=""
                  src={`https://openweathermap.org/img/wn/${data.icon}@4x.png`}
                  className="h-32 w-32 drop-shadow-2xl"
                />
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat icon={<Thermometer className="h-4 w-4" />} label="Feels like" value={`${data.feels}°C`} />
              <Stat icon={<Droplets className="h-4 w-4" />} label="Humidity" value={`${data.humidity}%`} />
              <Stat icon={<Wind className="h-4 w-4" />} label="Wind" value={`${data.wind} km/h`} />
              <Stat
                icon={<CloudRain className="h-4 w-4" />}
                label="Rain soon?"
                value={data.rainSoon ? "Likely" : "Unlikely"}
              />
            </div>
          </div>

          <div className="glass mt-6 p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Next ~12 hours
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {data.next12.map((p) => (
                <div key={p.time} className="glass p-4 text-center">
                  <div className="text-xs text-muted-foreground">
                    {new Date(p.time).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Kolkata",
                    })}
                  </div>
                  {p.icon && (
                    <img
                      alt=""
                      src={`https://openweathermap.org/img/wn/${p.icon}@2x.png`}
                      className="mx-auto h-14 w-14"
                    />
                  )}
                  <div className="text-xl font-semibold">{p.temp}°</div>
                  <div className="text-xs capitalize text-muted-foreground">{p.desc}</div>
                  <div className="mt-1 text-xs">🌧 {p.rainProb}%</div>
                </div>
              ))}
            </div>
          </div>
          {isFetching && (
            <div className="mt-3 text-center text-xs text-muted-foreground">Refreshing…</div>
          )}
        </>
      )}
    </AppShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
