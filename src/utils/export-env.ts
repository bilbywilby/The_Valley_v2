import { RiverStatus, AirQuality } from '@/types';
function escapeCsvField(field: string | number): string {
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
export function exportEnvDataToCsv(riverData: RiverStatus[], airData: AirQuality[]): string {
  const riverHeader = ['Station Name', 'Type', 'Level (ft)', 'Flow (cfs)', 'Status', 'Timestamp'];
  const riverRows = riverData.map(r => [
    escapeCsvField(r.name),
    'River',
    escapeCsvField(r.level.toFixed(2)),
    escapeCsvField(Math.round(r.flow)),
    escapeCsvField(r.status),
    escapeCsvField(new Date(r.timestamp).toISOString()),
  ].join(','));
  const airHeader = ['Station Name', 'Type', 'AQI', 'PM2.5 (µg/m³)', 'Temp (°F)', 'Humidity (%)', 'Timestamp'];
  const airRows = airData.map(a => [
    escapeCsvField(a.name),
    'Air Quality',
    escapeCsvField(a.aqi),
    escapeCsvField(a.pm25),
    escapeCsvField(a.temp),
    escapeCsvField(a.humidity),
    escapeCsvField(new Date(a.timestamp).toISOString()),
  ].join(','));
  return [
    '# River Data',
    riverHeader.join(','),
    ...riverRows,
    '',
    '# Air Quality Data',
    airHeader.join(','),
    ...airRows,
  ].join('\r\n');
}