import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { CommuteIncident } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Car, Construction, TrafficCone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
async function fetchCommuteData(): Promise<CommuteIncident[]> {
  return api('/api/commute');
}
const incidentIcons = {
  accident: <Car className="h-4 w-4" />,
  roadwork: <Construction className="h-4 w-4" />,
  congestion: <TrafficCone className="h-4 w-4" />,
};
const severityColors = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
};
export function CommuteOverlay() {
  const { data: incidents, isLoading, error } = useQuery({
    queryKey: ['commuteData'],
    queryFn: fetchCommuteData,
  });
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load commute data.</AlertDescription>
      </Alert>
    );
  }
  return (
    <div className="p-4 space-y-4">
      {incidents?.map(incident => (
        <Alert key={incident.id}>
          <div className={`absolute left-[-1.5px] top-[-1.5px] h-[calc(100%+3px)] w-1 rounded-l-lg ${severityColors[incident.severity]}`}></div>
          {incidentIcons[incident.type]}
          <AlertTitle className="capitalize flex justify-between items-center">
            {incident.type}
            <Badge variant={incident.severity === 'high' ? 'destructive' : 'secondary'}>{incident.severity}</Badge>
          </AlertTitle>
          <AlertDescription>
            <p className="mb-2">{incident.description}</p>
            <p className="text-xs text-muted-foreground">
              Reported {formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true })}
            </p>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}