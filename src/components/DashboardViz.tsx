import { useMemo, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Sankey, Tooltip as SankeyTooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedItemWithStats } from '@/types';
import { TrendingUp, Clock, Share2, Smile } from 'lucide-react';
import { useFeedStore } from '@/store/feed-store';
/** Props for the DashboardViz component. */
interface DashboardVizProps {
  /** The array of feed items with their statistics. */
  feeds: FeedItemWithStats[];
  /** Callback function to filter feeds by category when a chart slice is clicked. */
  onFilter: (category: string | null) => void;
}
/** Color palette for the charts, defined as a constant for type safety. */
const COLORS = ['#A7D8E0', '#D4F1D9', '#E2E8F0', '#CBD5E1', '#a7e0d0', '#F5F9FA', '#EDF2F7'] as const;
/** Color palette for the sentiment chart, defined as a constant. */
const SENTIMENT_COLORS = ['#22c55e', '#ef4444', '#94a3b8'] as const; // Green, Red, Slate
/**
 * A custom tooltip component for Recharts to provide a consistent look and feel.
 * @param {object} props - The props passed by Recharts.
 * @param {boolean} props.active - Whether the tooltip is active.
 * @param {any[]} props.payload - The data payload for the tooltip.
 * @param {string} props.label - The label for the tooltip.
 * @returns {JSX.Element | null} The rendered tooltip or null.
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover p-2 border border-border rounded-md shadow-lg text-sm">
        <p className="label font-semibold text-popover-foreground mb-1">{label}</p>
        {payload.map((pld: any) => (
          <div key={pld.dataKey || pld.name} style={{ color: pld.color || pld.fill }}>{`${pld.name || pld.dataKey}: ${pld.value}`}</div>
        ))}
      </div>
    );
  }
  return null;
};
/**
 * A component that renders a dashboard of visualizations based on feed data.
 * It includes charts for category distribution, data velocity, sentiment, and entity networks.
 * @param {DashboardVizProps} props - The component props.
 * @returns {JSX.Element} The rendered dashboard visualization component.
 */
export function DashboardViz({ feeds, onFilter }: DashboardVizProps) {
  const velocityWindow = useFeedStore(s => s.present.velocityWindow);
  /**
   * Memoized computation of feed distribution by category.
   * This prevents recalculation on every render unless the feeds data changes.
   */
  const categoryData = useMemo(() => {
    const categoryCount = feeds.reduce((acc, feed) => {
      acc[feed.category] = (acc[feed.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(categoryCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [feeds]);
  /**
   * Memoized computation of mock data velocity over a specified time window.
   * This recalculates only when feeds or the velocity window changes.
   */
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
  /** Memoized mock sentiment data. */
  const sentimentData = useMemo(() => [
    { name: 'Positive', value: Math.floor(Math.random() * 40) + 50 },
    { name: 'Negative', value: Math.floor(Math.random() * 20) + 5 },
    { name: 'Neutral', value: Math.floor(Math.random() * 15) + 10 },
  ], []);
  /**
   * Memoized computation of a mock entity network for Sankey diagram.
   * This recalculates only when the feeds data changes.
   */
  const networkData = useMemo(() => {
    const nodes = [
      ...Array.from(new Set(feeds.map(f => f.category))).map((name, i) => ({ name, id: i })),
    ];
    const linkMap = new Map<string, number>();
    feeds.slice(0, 20).forEach(feed => {
      const idx = nodes.findIndex(n => n.name === feed.category);
      if (idx !== -1) {
        const key = `${idx}-${idx}`;
        const val = (feed.stats.upvotes + feed.stats.downvotes) || 1;
        linkMap.set(key, (linkMap.get(key) ?? 0) + val);
      }
    });
    const links = Array.from(linkMap.entries()).map(([k, v]) => {
      const [source, target] = k.split('-').map(Number);
      return { source, target, value: v };
    });
    return { nodes, links };
  }, [feeds]);
  /**
   * Callback to handle clicks on pie chart slices, triggering a category filter.
   * Wrapped in useCallback to stabilize the function reference.
   */
  const handleSliceClick = useCallback((data: any) => {
    onFilter(data.name);
  }, [onFilter]);
  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mb-8">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Data Velocity (Last {velocityWindow}h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
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
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
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
            <Smile className="h-5 w-5 text-muted-foreground" />
            Overall Sentiment (Mock)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Share2 className="h-5 w-5 text-muted-foreground" />
            Entity Network (Mock)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <Sankey
              data={networkData}
              nodePadding={50}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
              link={{ stroke: '#A7D8E0' }}
            >
              <SankeyTooltip />
            </Sankey>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}