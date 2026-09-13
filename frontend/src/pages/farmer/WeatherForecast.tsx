import React, { useState } from 'react';
import { CloudRain, MapPin } from 'lucide-react';

interface ForecastDay {
  day: string;
  temp: string;
  condition: string;
  rainProb: string;
  humidity: string;
  wind: string;
  advisory: string;
}

const districtForecasts: Record<string, ForecastDay[]> = {
  Mandya: [
    { day: 'Today', temp: '29°C / 21°C', condition: 'Partly Cloudy', rainProb: '25%', humidity: '68%', wind: '12 km/h', advisory: 'Favorable conditions for Ragi weeding and organic spray.' },
    { day: 'Tomorrow', temp: '28°C / 20°C', condition: 'Scattered Showers', rainProb: '65%', humidity: '78%', wind: '16 km/h', advisory: 'Postpone pesticide spraying due to high probability of rainfall.' },
    { day: 'Day 3', temp: '30°C / 21°C', condition: 'Sunny & Clear', rainProb: '10%', humidity: '60%', wind: '10 km/h', advisory: 'Optimal day for sugarcane field irrigation.' },
    { day: 'Day 4', temp: '31°C / 22°C', condition: 'Clear Sky', rainProb: '15%', humidity: '58%', wind: '9 km/h', advisory: 'Good conditions for harvest drying and APMC transit.' },
    { day: 'Day 5', temp: '29°C / 21°C', condition: 'Cloudy', rainProb: '40%', humidity: '70%', wind: '14 km/h', advisory: 'Moderate humidity; inspect for early leaf blast.' }
  ],
  Haveri: [
    { day: 'Today', temp: '31°C / 22°C', condition: 'Sunny', rainProb: '15%', humidity: '55%', wind: '10 km/h', advisory: 'Good for Cotton picking and drying.' },
    { day: 'Tomorrow', temp: '32°C / 23°C', condition: 'Hot & Dry', rainProb: '10%', humidity: '50%', wind: '8 km/h', advisory: 'Ensure adequate drip watering for Maize crops.' },
    { day: 'Day 3', temp: '29°C / 21°C', condition: 'Overcast', rainProb: '45%', humidity: '72%', wind: '15 km/h', advisory: 'Light showers expected; protect harvested heaps.' },
    { day: 'Day 4', temp: '28°C / 20°C', condition: 'Light Rain', rainProb: '70%', humidity: '80%', wind: '18 km/h', advisory: 'Soil moisture adequate; halt artificial irrigation.' },
    { day: 'Day 5', temp: '30°C / 21°C', condition: 'Partly Cloudy', rainProb: '20%', humidity: '62%', wind: '11 km/h', advisory: 'Ideal for sowing pulses.' }
  ],
  Shivamogga: [
    { day: 'Today', temp: '26°C / 19°C', condition: 'Heavy Rain', rainProb: '85%', humidity: '88%', wind: '20 km/h', advisory: 'Clear drainage channels in Arecanut and Paddy fields.' },
    { day: 'Tomorrow', temp: '27°C / 19°C', condition: 'Moderate Showers', rainProb: '75%', humidity: '85%', wind: '18 km/h', advisory: 'Prevent water stagnation around roots.' },
    { day: 'Day 3', temp: '28°C / 20°C', condition: 'Light Rain', rainProb: '50%', humidity: '80%', wind: '14 km/h', advisory: 'Apply anti-fungal drenching if soil is saturated.' },
    { day: 'Day 4', temp: '29°C / 21°C', condition: 'Cloudy with Breaks', rainProb: '30%', humidity: '72%', wind: '12 km/h', advisory: 'Check paddy nursery beds for stem borer.' },
    { day: 'Day 5', temp: '28°C / 20°C', condition: 'Passing Showers', rainProb: '60%', humidity: '76%', wind: '15 km/h', advisory: 'Avoid chemical fertilizer dispersion.' }
  ]
};

export default function WeatherForecast() {
  const [district, setDistrict] = useState<string>('Mandya');
  const forecasts = districtForecasts[district] || districtForecasts['Mandya'];

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <CloudRain size={22} />
          </div>
          <div>
            <h2>Karnataka Agricultural Weather Advisory</h2>
            <p>5-day precision forecast and farm advisories powered by IMD Karnataka data.</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} color="var(--primary)" /> Select Your District:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['Mandya', 'Haveri', 'Shivamogga'].map((d) => (
              <button
                key={d}
                type="button"
                className={`btn btn-sm ${district === d ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setDistrict(d)}
              >
                {d} District
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {forecasts.map((f, i) => (
          <div key={i} className="card" style={{ borderTop: i === 0 ? '4px solid var(--primary)' : '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <strong style={{ fontSize: '1.1rem' }}>{f.day}</strong>
              <span className="badge badge-green">{f.condition}</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', margin: '0 0 0.75rem' }}>{f.temp}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Rain Probability:</span>
                <strong style={{ color: 'var(--text-main)' }}>{f.rainProb}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Humidity:</span>
                <strong style={{ color: 'var(--text-main)' }}>{f.humidity}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Wind Speed:</span>
                <strong style={{ color: 'var(--text-main)' }}>{f.wind}</strong>
              </div>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--primary)', lineHeight: 1.4 }}>
              <strong>Advisory:</strong> {f.advisory}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
