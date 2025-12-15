import { Droplets, Wind, Thermometer, Percent, TrendingUp, TrendingDown, TrendingRight } from 'lucide-react';
import { useRiverStatus } from '@/hooks/use-river-status';
import { useAirQuality } from '@/hooks/use-air-quality';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { RiverLevelStatus } from '@/types';
import { Button } from './ui/button';
import { FileText } from 'lucide-react';
import { exportEnvDataToCsv } from '@/utils/export-env';
import { toast } from 'sonner';
const statusColors: Record<RiverLevelStatus, string> = {
  normal: 'bg-green-500',
  action: 'bg-yellow-400',
  minor: 'bg-yellow-500',
  moderate: 'bg-orange-500',
  major: 'bg-red-600',
};
const aqiColors = (aqi: number) => {
  if (aqi <= 50) return 'bg-green-500 text-green-900';
  if (aqi <= 100) return 'bg-yellow-400 text-yellow-900';
  if (aqi <= 150) return 'bg-orange-500 text-orange-900';
  return 'bg-red-600 text-red-100';
};
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover p-2 border border-border rounded-md shadow-lg text-sm">
        <p className="label font-semibold text-popover-foreground mb-1">{label}</p>
        {payload.map((pld: any) => (
          <div key={pld.dataKey} style={{ color: pld.stroke }}>{`${pld.name}: ${pld.value.toFixed(2)}`}</div>
        ))}
      </div>
    );
  }
  return null;
};
export function ElementsView() {
  const { data: riverData, isLoading: isLoadingRiver, error: riverError } = useRiverStatus();
  const { data: airData, isLoading: isLoadingAir, error: airError } = useAirQuality();
  const mockRiverHistory = riverData?.map(r => ({
    name: r.name,
    data: Array.from({ length: 6 }).map((_, i) => ({
      time: `${(5 - i) * 10}m ago`,
      level: r.level - (Math.random() - 0.5) * (i / 5),
    })),
  }));
  const handleExport = () => {
    if (riverData && airData) {
      const csv = exportEnvDataToCsv(riverData, airData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lv-environmental-data.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Environmental data exported to CSV.');
    } else {
      toast.error('Data not available for export.');
    }
  };
  if (riverError || airError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load environmental data.</AlertDescription>
      </Alert>
    );
  }
  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <FileText className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>
      <section>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Droplets className="h-5 w-5 text-primary" /> River Status</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {isLoadingRiver ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />) :
            riverData?.map((station, index) => (
              <Card key={station.id}>
                <CardHeader>
                  <CardTitle className="text-base flex justify-between items-center">
                    {station.name}
                    <Badge className={`${statusColors[station.status]} text-white capitalize`}>{station.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-around text-center mb-4">
                    <div>
                      <p className="text-2xl font-bold">{station.level.toFixed(2)}<span className="text-sm font-normal text-muted-foreground"> ft</span></p>
                      <p className="text-xs text-muted-foreground">Level</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{Math.round(station.flow).toLocaleString()}<span className="text-sm font-normal text-muted-foreground"> cfs</span></p>
                      <p className="text-xs text-muted-foreground">Flow</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={mockRiverHistory?.[index]?.data}>
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="level" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ))
          }
        </div>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Wind className="h-5 w-5 text-primary" /> Air Quality</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {isLoadingAir ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />) :
            airData?.map(station => (
              <Card key={station.id}>
                <CardHeader>
                  <CardTitle className="text-base flex justify-between items-center">
                    {station.name}
                    <Badge className={aqiColors(station.aqi)}>{station.aqi} AQI</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p className="flex items-center gap-2"><TrendingRight className="h-4 w-4 text-muted-foreground" /> PM2.5: {station.pm25} µg/m³</p>
                  <p className="flex items-center gap-2"><Thermometer className="h-4 w-4 text-muted-foreground" /> Temp: {station.temp}°F</p>
                  <p className="flex items-center gap-2"><Percent className="h-4 w-4 text-muted-foreground" /> Humidity: {station.humidity}%</p>
                </CardContent>
              </Card>
            ))
          }
        </div>
      </section>
    </div>
  );
}