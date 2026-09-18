import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { karnatakaDistricts } from '../../data/karnatakaLocations';
import {
  CloudRain,
  MapPin,
  RefreshCw,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Wind,
  Droplets,
  Search,
  Info
} from 'lucide-react';

interface LocationOption {
  name: string;
  lat: number;
  lon: number;
  admin1?: string;
  admin2?: string;
}

interface DailyForecastItem {
  date: string;
  weatherCode: number | null;
  tempMax: number | null;
  tempMin: number | null;
  precipSum: number | null;
  precipProbMax: number | null;
  windSpeedMax: number | null;
}

interface HourlyForecastItem {
  time: string;
  temp: number | null;
  precip: number | null;
  precipProb: number | null;
}

interface WeatherData {
  daily: DailyForecastItem[];
  hourly: HourlyForecastItem[];
  retrievedAt: string;
  retrievedDateIST: string;
  isStale?: boolean;
}

interface WeatherCacheEntry {
  data: WeatherData;
  retrievedAt: string;
  retrievedDateIST: string;
  lat: number;
  lon: number;
  locationName: string;
}

const DISTRICT_SEARCH_QUERY: Record<string, string> = {
  'Bengaluru Rural': 'Devanahalli',
  'Bengaluru Urban': 'Bengaluru',
  'Dakshina Kannada': 'Mangaluru',
  'Uttara Kannada': 'Karwar',
  'Kodagu': 'Madikeri',
  'Vijayapura': 'Bijapur',
};

// Documented WMO Weather interpretation codes (WW) from Open-Meteo
function getWeatherDescription(code: number | null | undefined): string {
  if (code === null || code === undefined) return 'Unavailable';
  switch (code) {
    case 0: return 'Clear Sky';
    case 1: return 'Mainly Clear';
    case 2: return 'Partly Cloudy';
    case 3: return 'Overcast';
    case 45: return 'Fog';
    case 48: return 'Depositing Rime Fog';
    case 51: return 'Light Drizzle';
    case 53: return 'Moderate Drizzle';
    case 55: return 'Dense Drizzle';
    case 56: return 'Light Freezing Drizzle';
    case 57: return 'Dense Freezing Drizzle';
    case 61: return 'Slight Rain';
    case 63: return 'Moderate Rain';
    case 65: return 'Heavy Rain';
    case 66: return 'Light Freezing Rain';
    case 67: return 'Heavy Freezing Rain';
    case 71: return 'Slight Snow';
    case 73: return 'Moderate Snow';
    case 75: return 'Heavy Snow';
    case 77: return 'Snow Grains';
    case 80: return 'Slight Rain Showers';
    case 81: return 'Moderate Rain Showers';
    case 82: return 'Violent Rain Showers';
    case 85: return 'Slight Snow Showers';
    case 86: return 'Heavy Snow Showers';
    case 95: return 'Thunderstorm';
    case 96: return 'Thunderstorm with Slight Hail';
    case 99: return 'Thunderstorm with Heavy Hail';
    default: return `Weather Code ${code}`;
  }
}

function getCurrentDateIST(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const yr = parts.find((p) => p.type === 'year')?.value;
  const mo = parts.find((p) => p.type === 'month')?.value;
  const da = parts.find((p) => p.type === 'day')?.value;
  return `${yr}-${mo}-${da}`;
}

function getCacheKey(lat: number, lon: number): string {
  return `agro_weather_${lat.toFixed(4)}_${lon.toFixed(4)}_Asia_Kolkata_5d`;
}

function readWeatherCache(lat: number, lon: number): WeatherCacheEntry | null {
  try {
    const raw = sessionStorage.getItem(getCacheKey(lat, lon));
    if (!raw) return null;
    return JSON.parse(raw) as WeatherCacheEntry;
  } catch (e) {
    console.warn('Weather cache read failed:', e);
    return null;
  }
}

function writeWeatherCache(
  lat: number,
  lon: number,
  locationName: string,
  data: WeatherData,
  retrievedAt: string,
  retrievedDateIST: string
): void {
  try {
    const entry: WeatherCacheEntry = {
      data,
      retrievedAt,
      retrievedDateIST,
      locationName,
      lat,
      lon,
    };
    sessionStorage.setItem(getCacheKey(lat, lon), JSON.stringify(entry));
  } catch (e) {
    console.warn('Weather cache write failed:', e);
  }
}

function formatCalendarDate(dateStr: string): string {
  if (!dateStr) return 'Unavailable';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

function formatHourTime(isoString: string): string {
  if (!isoString) return 'Unavailable';
  const parts = isoString.split('T');
  if (parts.length < 2) return isoString;
  const [hourStr, minStr] = parts[1].split(':');
  const hour = parseInt(hourStr, 10);
  if (isNaN(hour)) return parts[1];
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(formattedHour).padStart(2, '0')}:${minStr || '00'} ${period} IST`;
}

export default function WeatherForecast() {
  const { user } = useAuth();

  // Location selection state
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationOption[]>([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Forecast state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staleNotice, setStaleNotice] = useState<string | null>(null);

  // Hourly breakdown accordion
  const [showHourly, setShowHourly] = useState(false);

  // Request cancellation ref to prevent out-of-order race conditions
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initial geocoding on mount: prefer farmer's saved district if available
  useEffect(() => {
    const defaultDistrict = user?.district ? user.district.trim() : '';
    if (defaultDistrict) {
      setSelectedDistrict(defaultDistrict);
      resolveAndSetDistrict(defaultDistrict);
    }
  }, [user]);

  async function resolveAndSetDistrict(districtName: string) {
    if (!districtName) return;
    setSearchingLocation(true);
    setSearchError('');
    try {
      const q = DISTRICT_SEARCH_QUERY[districtName] || districtName;
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=10&language=en&format=json`
      );
      if (!res.ok) throw new Error(`Geocoding HTTP ${res.status}`);
      const d = await res.json();
      const results = (d.results || []) as any[];
      const match = results.find(
        (r) => r.country_code === 'IN' && (r.admin1 === 'Karnataka' || r.admin2?.toLowerCase().includes('karnataka'))
      ) || results[0];

      if (match) {
        const loc: LocationOption = {
          name: districtName,
          lat: match.latitude,
          lon: match.longitude,
          admin1: match.admin1,
          admin2: match.admin2,
        };
        setSelectedLocation(loc);
        fetchForecast(loc);
      } else {
        setSearchError(`Could not find coordinates for ${districtName}. Please select another Karnataka district.`);
      }
    } catch (err: any) {
      console.error('Failed to geocode district:', err);
      setSearchError('Location lookup service unavailable. Please check your network and retry.');
    } finally {
      setSearchingLocation(false);
    }
  }

  async function handleManualSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setSearchingLocation(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=10&language=en&format=json`
      );
      if (!res.ok) throw new Error(`Search HTTP ${res.status}`);
      const d = await res.json();
      const results = (d.results || []) as any[];
      const karnatakaMatches = results.filter(
        (r) => r.country_code === 'IN' && (r.admin1 === 'Karnataka' || r.admin2?.toLowerCase().includes('karnataka'))
      );

      if (karnatakaMatches.length === 0) {
        setSearchError(`No Karnataka locations found for "${q}". Please search for a Karnataka district or town.`);
      } else {
        setSearchResults(
          karnatakaMatches.map((r) => ({
            name: r.name,
            lat: r.latitude,
            lon: r.longitude,
            admin1: r.admin1,
            admin2: r.admin2,
          }))
        );
      }
    } catch (err: any) {
      console.error('Location search failed:', err);
      setSearchError('Location search failed. Please verify your internet connection.');
    } finally {
      setSearchingLocation(false);
    }
  }

  function handleSelectSearchResult(loc: LocationOption) {
    setSelectedLocation(loc);
    setSelectedDistrict('');
    setSearchResults([]);
    setSearchQuery('');
    fetchForecast(loc);
  }

  async function fetchForecast(loc: LocationOption) {
    // Abort any prior in-flight request so outdated responses are ignored
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setStaleNotice(null);

    const todayIST = getCurrentDateIST();

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&hourly=temperature_2m,precipitation,precipitation_probability&timezone=Asia%2FKolkata&forecast_days=5`;

      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`Open-Meteo returned HTTP ${response.status}`);
      }

      const json = await response.json();

      const retrievalTimestamp = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(new Date());

      const dailyItems: DailyForecastItem[] = (json.daily?.time || []).map((dateStr: string, idx: number) => ({
        date: dateStr,
        weatherCode: json.daily.weather_code?.[idx] ?? null,
        tempMax: json.daily.temperature_2m_max?.[idx] ?? null,
        tempMin: json.daily.temperature_2m_min?.[idx] ?? null,
        precipSum: json.daily.precipitation_sum?.[idx] ?? null,
        precipProbMax: json.daily.precipitation_probability_max?.[idx] ?? null,
        windSpeedMax: json.daily.wind_speed_10m_max?.[idx] ?? null,
      }));

      // Find current hour in Asia/Kolkata to show the next 24 forecast hours
      const nowParts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false,
      }).formatToParts(new Date());
      const yr = nowParts.find((p) => p.type === 'year')?.value;
      const mo = nowParts.find((p) => p.type === 'month')?.value;
      const da = nowParts.find((p) => p.type === 'day')?.value;
      let hr = nowParts.find((p) => p.type === 'hour')?.value || '00';
      if (hr === '24') hr = '00';
      const currentPrefix = `${yr}-${mo}-${da}T${hr}:00`;

      const hourlyTimes = json.hourly?.time || [];
      let startIndex = hourlyTimes.findIndex((t: string) => t >= currentPrefix);
      if (startIndex < 0) startIndex = 0;

      const hourlyItems: HourlyForecastItem[] = hourlyTimes
        .slice(startIndex, startIndex + 24)
        .map((t: string, offset: number) => {
          const globalIdx = startIndex + offset;
          return {
            time: t,
            temp: json.hourly.temperature_2m?.[globalIdx] ?? null,
            precip: json.hourly.precipitation?.[globalIdx] ?? null,
            precipProb: json.hourly.precipitation_probability?.[globalIdx] ?? null,
          };
        });

      const weatherResult: WeatherData = {
        daily: dailyItems,
        hourly: hourlyItems,
        retrievedAt: retrievalTimestamp,
        retrievedDateIST: todayIST,
        isStale: false,
      };

      setWeatherData(weatherResult);
      writeWeatherCache(loc.lat, loc.lon, loc.name, weatherResult, retrievalTimestamp, todayIST);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request was cancelled due to a newer user selection; ignore
        return;
      }

      console.error('Forecast request failed:', err);

      // Attempt fallback to valid cached data for this exact location from today
      const cached = readWeatherCache(loc.lat, loc.lon);
      if (cached && cached.retrievedDateIST === todayIST && cached.data?.daily?.length > 0) {
        setWeatherData(cached.data);
        setStaleNotice(`Network request failed. Displaying cached forecast retrieved at ${cached.retrievedAt} IST.`);
      } else {
        setWeatherData(null);
        setError('Unable to retrieve weather forecast from Open-Meteo. Please verify your connection and click Retry.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <CloudRain size={22} />
          </div>
          <div>
            <h2>Weather Forecast</h2>
            <p>5-day atmospheric weather forecasts powered by the Open-Meteo API.</p>
          </div>
        </div>
      </div>

      {/* Location Selector Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} color="var(--primary)" />
              <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Select Karnataka District:</label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                className="input"
                style={{ minWidth: '220px', padding: '0.45rem 0.75rem', fontSize: '0.9rem' }}
                value={selectedDistrict}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedDistrict(val);
                  setSearchResults([]);
                  resolveAndSetDistrict(val);
                }}
              >
                <option value="" disabled>Choose a Karnataka district...</option>
                {karnatakaDistricts.map((d) => (
                  <option key={d} value={d}>{d} District</option>
                ))}
              </select>

              {selectedLocation && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fetchForecast(selectedLocation)}
                  disabled={loading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
              )}
            </div>
          </div>

          {/* Search any Karnataka town / taluk */}
          <form onSubmit={handleManualSearch} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <input
                className="input"
                type="text"
                placeholder="Or search any Karnataka town/taluk (e.g. Maddur, Sirsi, Channapatna)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2rem' }}
              />
              <Search size={15} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm" disabled={searchingLocation || !searchQuery.trim()}>
              {searchingLocation ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchError && (
            <div style={{ color: '#b91c1c', fontSize: '0.85rem', background: '#fef2f2', padding: '0.5rem 0.75rem', borderRadius: 6 }}>
              {searchError}
            </div>
          )}

          {/* Search Results Picker */}
          {searchResults.length > 0 && (
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                Matching Karnataka Locations (Click to select):
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {searchResults.map((r, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleSelectSearchResult(r)}
                  >
                    📍 {r.name} ({r.admin2 || r.admin1 || 'Karnataka'})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Location Details */}
          {selectedLocation ? (
            <div
              style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                fontSize: '0.86rem',
              }}
            >
              <div>
                <strong>Active Place:</strong> {selectedLocation.name}
                {selectedLocation.admin2 ? `, ${selectedLocation.admin2}` : ''}, Karnataka, India
                <span style={{ marginLeft: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                  ({selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lon.toFixed(4)}°E)
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>
                * Forecast represents the district/town center, which may differ from conditions at your individual field.
              </div>
            </div>
          ) : (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', color: '#64748b', fontSize: '0.88rem' }}>
              Please select or search your Karnataka location above to load the weather forecast.
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)' }}>Fetching Live Forecast</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Retrieving atmospheric model data from Open-Meteo for {selectedLocation?.name}...
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div
          className="card animate-fadeIn"
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '2rem',
            textAlign: 'center',
            color: '#991b1b',
          }}
        >
          <AlertCircle size={36} style={{ color: '#dc2626', margin: '0 auto 0.75rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: '#991b1b' }}>Weather Request Failed</h3>
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.92rem' }}>{error}</p>
          {selectedLocation && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => fetchForecast(selectedLocation)}
            >
              Retry Forecast
            </button>
          )}
        </div>
      )}

      {/* Stale Cache Notice */}
      {!loading && staleNotice && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fcd34d',
            borderRadius: 8,
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.84rem',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} style={{ color: '#d97706', flexShrink: 0 }} />
          <span>{staleNotice}</span>
        </div>
      )}

      {/* Main 5-Day Forecast Grid */}
      {!loading && weatherData && weatherData.daily.length > 0 && (
        <>
          {/* Metadata & Source Attribution */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              fontSize: '0.82rem',
              color: '#64748b',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={14} />
              <span>Retrieved at {weatherData.retrievedAt} IST</span>
            </div>
            <div>
              <span>Weather data provided by </span>
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
              >
                Open-Meteo <ExternalLink size={12} />
              </a>
              <span> (CC BY 4.0)</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {weatherData.daily.map((f, i) => (
              <div
                key={f.date}
                className="card"
                style={{
                  borderTop: i === 0 ? '4px solid var(--primary)' : '1px solid var(--border)',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-main)', display: 'block' }}>
                      {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : formatCalendarDate(f.date).split(',')[0]}
                    </strong>
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      {formatCalendarDate(f.date)}
                    </span>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                    {getWeatherDescription(f.weatherCode)}
                  </span>
                </div>

                <div style={{ margin: '0.75rem 0' }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {f.tempMax !== null && f.tempMin !== null
                      ? `${Math.round(f.tempMax)}°C / ${Math.round(f.tempMin)}°C`
                      : f.tempMax !== null
                      ? `${Math.round(f.tempMax)}°C`
                      : 'Unavailable'}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Max / Min Temp</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem', color: 'var(--text-muted)', borderTop: '1px solid #edf2f7', paddingTop: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Rainfall:</span>
                    <strong style={{ color: 'var(--text-main)' }}>
                      {f.precipSum !== null ? `${f.precipSum.toFixed(1)} mm` : 'Unavailable'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Max Hourly Rain Prob:</span>
                    <strong style={{ color: 'var(--text-main)' }}>
                      {f.precipProbMax !== null ? `${f.precipProbMax}%` : 'Unavailable'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Max Wind Speed:</span>
                    <strong style={{ color: 'var(--text-main)' }}>
                      {f.windSpeedMax !== null ? `${f.windSpeedMax.toFixed(1)} km/h` : 'Unavailable'}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Expandable Hourly Forecast Strip */}
          {weatherData.hourly.length > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setShowHourly((prev) => !prev)}
                style={{
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} color="var(--primary)" />
                  <span>Next 24 Hours: Hourly Precipitation & Probability Breakdown</span>
                </div>
                {showHourly ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {showHourly && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                    Model interval steps in <strong>Asia/Kolkata (IST)</strong>. Values indicate precipitation amount (mm) and rain probability (%) for each 1-hour period.
                  </p>

                  <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.65rem', minWidth: 'max-content' }}>
                      {weatherData.hourly.map((h, idx) => (
                        <div
                          key={idx}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                            padding: '0.65rem 0.75rem',
                            minWidth: '105px',
                            background: '#f8fafc',
                            textAlign: 'center',
                            fontSize: '0.8rem',
                          }}
                        >
                          <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.35rem', fontSize: '0.78rem' }}>
                            {formatHourTime(h.time)}
                          </div>
                          <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                            {h.temp !== null ? `${Math.round(h.temp)}°C` : 'Unavailable'}
                          </div>
                          <div style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.76rem' }}>
                            ☔ {h.precipProb !== null ? `${h.precipProb}%` : 'Unavailable'}
                          </div>
                          <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: '0.15rem' }}>
                            {h.precip !== null ? `${h.precip.toFixed(1)} mm` : 'Unavailable'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Operational Advisory Disclaimer */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              padding: '1rem 1.25rem',
              fontSize: '0.82rem',
              color: '#475569',
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', color: '#0f172a' }}>
              <Info size={16} style={{ color: 'var(--primary)' }} />
              <strong style={{ fontSize: '0.88rem' }}>General Weather Advisory Notice:</strong>
            </div>
            Forecasts indicate computer atmospheric model simulations and can change rapidly. Individual farm micro-climates, soil moisture saturation, and elevation can create significant variance from town-center readings. This information is provided for situational awareness and does not constitute a verified prescription or guarantee for spraying, irrigation, or harvest operations.
          </div>
        </>
      )}
    </div>
  );
}
