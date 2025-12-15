import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { GovWatchResult } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDebounce } from 'react-use';
async function searchGovDocs(query: string): Promise<GovWatchResult[]> {
  if (!query) return [];
  return api(`/api/gov/search?q=${encodeURIComponent(query)}`);
}
export function GovWatchSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useDebounce(() => setDebouncedQuery(query), 500, [query]);
  const { data: results, isLoading } = useQuery({
    queryKey: ['govSearch', debouncedQuery],
    queryFn: () => searchGovDocs(debouncedQuery),
    enabled: !!debouncedQuery,
  });
  return (
    <div className="p-4 space-y-4">
      <div className="flex w-full items-center space-x-2">
        <Input
          type="search"
          placeholder="Search council minutes, agendas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        {isLoading && (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))
        )}
        {results?.map(result => (
          <Card key={result.id}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {result.document}
              </CardTitle>
              <CardDescription>{new Date(result.date).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">"...{result.excerpt}..."</p>
            </CardContent>
          </Card>
        ))}
        {debouncedQuery && !isLoading && results?.length === 0 && (
          <p className="text-center text-muted-foreground">No results found for "{debouncedQuery}".</p>
        )}
      </div>
    </div>
  );
}