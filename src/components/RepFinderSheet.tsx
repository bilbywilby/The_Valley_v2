import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, User, Phone, Link as LinkIcon, FileText, Copy } from 'lucide-react';
import { useRepLookup } from '@/hooks/use-rep-lookup';
import { useDebounce } from 'react-use';
import { repsToCsv } from '@/utils/export-reps';
import { toast } from 'sonner';
const partyColors: Record<string, string> = {
  Democratic: 'bg-blue-600 hover:bg-blue-700',
  Republican: 'bg-red-600 hover:bg-red-700',
  Independent: 'bg-green-600 hover:bg-green-700',
  Nonpartisan: 'bg-gray-500 hover:bg-gray-600',
  Unknown: 'bg-gray-400 hover:bg-gray-500',
};
export function RepFinderSheet() {
  const [address, setAddress] = useState('');
  const [debouncedAddress, setDebouncedAddress] = useState('');
  useDebounce(() => {
    setDebouncedAddress(address);
  }, 500, [address]);
  const { data: civicData, isLoading, error, isFetching } = useRepLookup(debouncedAddress);
  const handleExport = () => {
    if (civicData?.officials) {
      const csv = repsToCsv(civicData.officials);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'representatives.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Representatives exported to CSV.');
    }
  };
  const handleCopyDistrict = (districtName: string) => {
    navigator.clipboard.writeText(districtName);
    toast.success('District copied to clipboard.');
  };
  return (
    <div className="p-4 space-y-6">
      <div className="flex w-full items-center space-x-2">
        <Input
          id="address-input"
          type="search"
          placeholder="Enter an address (e.g., Allentown, PA)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Button type="submit" size="icon" disabled={isFetching}>
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div aria-live="polite" className="sr-only">
        {isFetching ? 'Loading representatives.' : `${civicData?.officials?.length || 0} representatives found.`}
      </div>
      {isFetching && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Could not fetch representative data.</AlertDescription>
        </Alert>
      )}
      {!isFetching && civicData && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing results for: <strong>{civicData.normalizedInput.line1}</strong>
            </p>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={!civicData.officials?.length}>
              <FileText className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
          {Object.entries(civicData.divisions).map(([id, division]) => (
            <div key={id}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
                {division.name}
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={() => handleCopyDistrict(division.name)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </h3>
              <div className="grid gap-4">
                {division.officeIndices.map(index => {
                  const rep = civicData.officials[index];
                  if (!rep) return null;
                  return (
                    <Card key={`${id}-${rep.name}`} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex justify-between items-start">
                          {rep.name}
                          <Badge className={partyColors[rep.party]}>{rep.party}</Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{rep.office}</p>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-4 text-sm">
                        {rep.phones?.map(phone => (
                          <a key={phone} href={`tel:${phone}`} className="flex items-center gap-2 hover:underline">
                            <Phone className="h-4 w-4" /> {phone}
                          </a>
                        ))}
                        {rep.urls?.map(url => (
                          <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                            <LinkIcon className="h-4 w-4" /> Website
                          </a>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}