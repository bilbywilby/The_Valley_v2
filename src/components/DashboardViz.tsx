import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedItemWithStats } from '@/types';
import { TrendingUp, CheckCircle, XCircle } from 'lucide-react';
interface DashboardVizProps {
  feeds: FeedItemWithStats[];
  onFilter: (category: string | null) => void;
}
const COLORS = ['#A7D8E0', '#D4F1D9', '#E2E8F0', '#CBD5E1', '#a7e0d0'];
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover p-2 border border-border rounded-md shadow-lg">
        <p className="label text-popover-foreground">{`${payload[0].name} : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};
export function DashboardViz({ feeds, onFilter }: DashboardVizProps) {
  const categoryData = useMemo(() => {
    const categoryCount = feeds.reduce((acc, feed) => {
      acc[feed.category] = (acc[feed.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(categoryCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [feeds]);
  const healthData = useMemo(() => {
    const active = feeds.filter(f => f.stats.status === 'active').length;
    const inactive = feeds.length - active;
    return [
      { name: 'Active', value: active, icon: CheckCircle },
      { name: 'Inactive', value: inactive, icon: XCircle },
    ];
  }, [feeds]);
  const totalVotes = useMemo(() => {
    return feeds.reduce((acc, feed) => acc + feed.stats.upvotes + feed.stats.downvotes, 0);
  }, [feeds]);
  const handleSliceClick = (data: any) => {
    onFilter(data.name);
  };
  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
            Feed Health Status
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center pt-6">
          {healthData.map((item, index) => (
            <div key={item.name} className="flex flex-col items-center px-4">
              <item.icon className={`h-10 w-10 mb-2 ${index === 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-2xl font-bold">{item.value}</span>
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            Community Engagement
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center pt-6">
            <div className="flex flex-col items-center px-4">
              <span className="text-4xl font-extrabold text-primary">{totalVotes.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground mt-2">Total Votes Cast</span>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}