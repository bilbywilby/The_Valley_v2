import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MarketListing } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ExternalLink } from 'lucide-react';
async function fetchMarketData(): Promise<MarketListing[]> {
  return api('/api/market');
}
export function ValleyMarketOverlay() {
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['marketData'],
    queryFn: fetchMarketData,
  });
  const filteredListings = listings?.filter(listing => 
    !locationFilter || listing.location.toLowerCase().includes(locationFilter)
  ) ?? [];
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load market data.</AlertDescription>
      </Alert>
    );
  }
  return (
    <div className="space-y-6">
      <ToggleGroup 
        type="single" 
        variant="outline" 
        value={locationFilter ?? ''} 
        onValueChange={(value) => setLocationFilter(value || null)}
        className="justify-start"
      >
        <ToggleGroupItem value="">All</ToggleGroupItem>
        <ToggleGroupItem value="allentown">Allentown</ToggleGroupItem>
        <ToggleGroupItem value="bethlehem">Bethlehem</ToggleGroupItem>
        <ToggleGroupItem value="easton">Easton</ToggleGroupItem>
      </ToggleGroup>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredListings.map(listing => (
            <a href={listing.url} target="_blank" rel="noopener noreferrer" key={listing.id} className="block">
              <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-transform duration-200">
                <CardHeader>
                  <CardTitle className="text-base">{listing.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-muted-foreground">{listing.location}</p>
                    <Badge variant="secondary" className="mt-2">${listing.price.toLocaleString()}</Badge>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
      {!isLoading && filteredListings.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No listings found for this location.</p>
      )}
    </div>
  );
}