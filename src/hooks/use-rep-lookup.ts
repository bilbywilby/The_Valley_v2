import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { getMockToken } from '@/lib/auth';
import { CivicResponse } from '@/types';
async function fetchReps(address: string): Promise<CivicResponse> {
  if (!address.trim()) {
    return Promise.reject(new Error("Address cannot be empty."));
  }
  try {
    const response = await api<CivicResponse>('/api/civic/lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getMockToken()}`,
      },
      body: JSON.stringify({ address }),
    });
    return response;
  } catch (error) {
    toast.error('Failed to fetch representative data.');
    // Return a default empty state on error to prevent crashes
    return {
      normalizedInput: { line1: '', city: '', state: '', zip: '' },
      divisions: {},
      officials: [],
    };
  }
}
export function useRepLookup(address: string) {
  return useQuery({
    queryKey: ['reps', address],
    queryFn: () => fetchReps(address),
    enabled: !!address, // Only run the query if an address is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}