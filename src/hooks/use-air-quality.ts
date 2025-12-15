import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AirQuality } from '@/types';
async function fetchAirQuality(): Promise<AirQuality[]> {
  return api('/api/env/air');
}
export function useAirQuality() {
  return useQuery({
    queryKey: ['airQuality'],
    queryFn: fetchAirQuality,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}