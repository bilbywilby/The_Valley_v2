import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { CivicLayer, GeoTag } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CanvasPins } from './CanvasPins';
async function fetchGeoLayers(): Promise<CivicLayer[]> {
  return api('/api/geo/layers');
}
export function CivicMapOverlay() {
  const [selectedLayers, setSelectedLayers] = useState<string[]>(['parks']);
  const { data: layers, isLoading, error } = useQuery({
    queryKey: ['geoLayers'],
    queryFn: fetchGeoLayers,
  });
  const geoDataForCanvas: GeoTag[] = (layers ?? [])
    .filter(layer => selectedLayers.includes(layer.id))
    .flatMap(layer =>
      layer.geoData.features.map((feature, index) => ({
        id: `${layer.id}-${index}`,
        lon: feature.geometry.coordinates[0],
        lat: feature.geometry.coordinates[1],
        confidence: 0.8, // Mock confidence
        source: layer.name,
      }))
    );
  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load map layers.</AlertDescription>
      </Alert>
    );
  }
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground">Map Layers</h3>
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <ToggleGroup
          type="multiple"
          variant="outline"
          value={selectedLayers}
          onValueChange={setSelectedLayers}
          className="justify-start flex-wrap"
        >
          {layers?.map(layer => (
            <ToggleGroupItem key={layer.id} value={layer.id} aria-label={`Toggle ${layer.name} layer`}>
              {layer.name}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
      <div className="aspect-video w-full bg-muted rounded-md center text-xs text-muted-foreground overflow-hidden">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <CanvasPins
            geoData={geoDataForCanvas}
            title="Civic map overlay"
            ariaLabel="Map showing selected civic data layers for Lehigh Valley."
          />
        )}
      </div>
    </div>
  );
}