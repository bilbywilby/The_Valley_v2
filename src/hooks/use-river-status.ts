import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { RiverStatus } from '@/types';
async function fetchRiverStatus(): Promise<RiverStatus[]> {
  return api('/api/env/river');
}
export function useRiverStatus() {
  return useQuery({
    queryKey: ['riverStatus'],
    queryFn: fetchRiverStatus,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
}