import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { EventItem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
async function fetchEventsData(): Promise<EventItem[]> {
  return api('/api/events');
}
export function UnifiedEventsOverlay() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['eventsData'],
    queryFn: fetchEventsData,
  });
  const filteredEvents = events?.filter(event => 
    !categoryFilter || event.category === categoryFilter
  ) ?? [];
  const handleIcalExport = () => {
    toast.info("iCal export feature is not yet implemented.");
  };
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load events data.</AlertDescription>
      </Alert>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <ToggleGroup 
          type="single" 
          variant="outline" 
          value={categoryFilter ?? ''} 
          onValueChange={(value) => setCategoryFilter(value || null)}
          className="justify-start"
        >
          <ToggleGroupItem value="">All</ToggleGroupItem>
          <ToggleGroupItem value="arts">Arts</ToggleGroupItem>
          <ToggleGroupItem value="civic">Civic</ToggleGroupItem>
          <ToggleGroupItem value="sports">Sports</ToggleGroupItem>
        </ToggleGroup>
        <Button variant="outline" size="sm" onClick={handleIcalExport}>
          <Calendar className="mr-2 h-4 w-4" /> Export iCal
        </Button>
      </div>
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map(event => (
            <Card key={event.id} className="hover:bg-accent transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="text-center w-16 flex-shrink-0">
                  <p className="font-bold text-lg">{format(new Date(event.date), 'd')}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(event.date), 'MMM')}</p>
                </div>
                <div className="flex-grow">
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                  <Badge variant="secondary" className="mt-1 capitalize">{event.category}</Badge>
                </div>
                <a href={event.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!isLoading && filteredEvents.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No events found for this category.</p>
      )}
    </div>
  );
}