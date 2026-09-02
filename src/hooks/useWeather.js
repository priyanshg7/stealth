import { useState, useEffect, useCallback } from 'react';
import { fetchWeatherIntelligence, getWeatherImpactOnCrop } from '../utils/weatherService';

export function useWeather(activeFarm, profile) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = useCallback(async () => {
    if (!activeFarm) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherIntelligence(activeFarm, profile);
      setWeatherData(data);
    } catch (err) {
      console.error('[useWeather] Error fetching weather:', err);
      setError(err.message || 'Failed to load weather intelligence');
    } finally {
      setLoading(false);
    }
  }, [activeFarm?.district, activeFarm?.state, activeFarm?.crop?.name, profile?.district, profile?.state]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const weatherImpact = weatherData && activeFarm?.crop?.name
    ? getWeatherImpactOnCrop(weatherData, activeFarm.crop.name, activeFarm.crop.stage)
    : null;

  return {
    weatherData,
    loading,
    error,
    refetch: fetchWeather,
    weatherImpact
  };
}
