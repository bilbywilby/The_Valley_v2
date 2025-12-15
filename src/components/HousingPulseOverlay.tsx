import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { HousingTrend } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Home, Warehouse } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, LineChart, Line } from 'recharts';
async function fetchHousingData(): Promise<HousingTrend[]> {
  return api('/api/economy/housing');
}
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover p-2 border border-border rounded-md shadow-lg text-sm">
        <p className="label font-semibold text-popover-foreground mb-1">{label}</p>
        {payload.map((pld: any) => (
          <div key={pld.dataKey} style={{ color: pld.fill }}>{`${pld.name}: ${pld.value.toLocaleString()}`}</div>
        ))}
      </div>
    );
  }
  return null;
};
export function HousingPulseOverlay() {
  const { data: trends, isLoading, error } = useQuery({
    queryKey: ['housingData'],
    queryFn: fetchHousingData,
  });
  const priceData = trends?.filter(t => t.metric === 'price').map(t => ({ name: t.period, value: t.value, trend: t.trend })) ?? [];
  const inventoryData = trends?.filter(t => t.metric === 'inventory').map(t => ({ name: t.period, value: t.value, trend: t.trend })) ?? [];
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load housing pulse data.</AlertDescription>
      </Alert>
    );
  }
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="h-5 w-5 text-muted-foreground" /> Median Sale Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${priceData[0]?.value.toLocaleString()}</p>
            <Badge variant={priceData[0]?.trend > 0 ? 'default' : 'destructive'} className={priceData[0]?.trend > 0 ? 'bg-green-600' : ''}>
              {priceData[0]?.trend > 0 ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
              {priceData[0]?.trend}% (1mo)
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-muted-foreground" /> Housing Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{inventoryData[0]?.value} Units</p>
            <Badge variant={inventoryData[0]?.trend > 0 ? 'default' : 'destructive'} className={inventoryData[0]?.trend > 0 ? 'bg-green-600' : ''}>
              {inventoryData[0]?.trend > 0 ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
              {inventoryData[0]?.trend}% (1mo)
            </Badge>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trend Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[...priceData, ...inventoryData]}>
              <XAxis dataKey="name" fontSize={12} />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" fontSize={12} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="value" fill="#8884d8" name="Price" />
              <Bar yAxisId="right" dataKey="value" fill="#82ca9d" name="Inventory" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">LVPC Data Source (Mock)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">LVPC PDF Report Embed Placeholder</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}