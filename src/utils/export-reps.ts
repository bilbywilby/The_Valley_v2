import { Rep } from '@/types';
/**
 * Converts an array of representative objects to a CSV string.
 * @param reps - An array of Rep objects.
 * @returns A string in CSV format.
 */
export function repsToCsv(reps: Rep[]): string {
  const header = ['Name', 'Office', 'Party', 'Phone', 'URL'];
  const rows = reps.map(rep => [
    `"${(rep.name || '').replace(/"/g, '""')}"`,
    `"${(rep.office || '').replace(/"/g, '""')}"`,
    `"${(rep.party || '').replace(/"/g, '""')}"`,
    `"${(rep.phones?.join(', ') || '').replace(/"/g, '""')}"`,
    `"${(rep.urls?.join(', ') || '').replace(/"/g, '""')}"`
  ].join(','));
  return [header.join(','), ...rows].join('\r\n');
}