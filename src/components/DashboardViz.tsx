import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { FeedItemWithStats } from '@/types';
import { TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useFeedStore } from '@/store/feed-store';
interface DashboardVizProps {
  feeds: FeedItemWithStats[];
  onFilter: (category: string | null) => void;
}
const COLORS = ['#A7D8E0', '#D4F1D9', '#E2E8F0', '#CBD5E1', '#a7e0d0', '#F5F9FA', '#EDF2F7'];
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover p-2 border border-border rounded-md shadow-lg text-sm">
        <p className="label font-semibold text-popover-foreground mb-1">{label}</p>
        {payload.map((pld: any) => (
          <div key={pld.dataKey} style={{ color: pld.color }}>{`${pld.dataKey}: ${pld.value}`}</div>
        ))}
      </div>
    );
  }
  return null;
};
export function DashboardViz({ feeds, onFilter }: DashboardVizProps) {
  const velocityWindow = useFeedStore(s => s.present.velocityWindow);
  const categoryData = useMemo(() => {
    const categoryCount = feeds.reduce((acc, feed) => {
      acc[feed.category] = (acc[feed.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(categoryCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [feeds]);
  const velocityData = useMemo(() => {
    const data: any[] = [];
    const categories = Array.from(new Set(feeds.map(f => f.category)));
    for (let i = velocityWindow - 1; i >= 0; i--) {
      const entry: { name: string, [key: string]: any } = { name: `${i}h ago` };
      categories.forEach(cat => {
        entry[cat] = Math.floor(Math.random() * 20) + 5;
      });
      data.push(entry);
    }
    return { data, categories };
  }, [feeds, velocityWindow]);
  const handleSliceClick = (data: any) => {
    onFilter(data.name);
  };
  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mb-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Data Velocity (Last {velocityWindow}h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={velocityData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend iconSize={10} />
              {velocityData.categories.slice(0, 5).map((cat, index) => (
                <Area key={cat} type="monotone" dataKey={cat} stackId="1" stroke={COLORS[index % COLORS.length]} fill={COLORS[index % COLORS.length]} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            Feeds by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                onClick={handleSliceClick}
                className="cursor-pointer"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            Temporal Filter (Mock)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Slider
            defaultValue={[0, 100]}
            max={100}
            step={1}
            aria-label="Temporal filter slider"
          />
        </CardContent>
      </Card>
    </div>
  );
}