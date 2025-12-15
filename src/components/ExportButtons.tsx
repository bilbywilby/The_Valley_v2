import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FeedItem } from '@/types';
interface ExportButtonsProps {
  feeds: FeedItem[];
}
function feedsToOpml(feeds: FeedItem[]): string {
  const outlines = feeds
    .map(feed => `    <outline type="rss" text="${escapeXml(feed.title)}" title="${escapeXml(feed.title)}" xmlUrl="${escapeXml(feed.url)}"/>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Lehigh Valley Master Intelligence Feeds</title>
  </head>
  <body>
${outlines}
  </body>
</opml>`;
}
function feedsToCsv(feeds: FeedItem[]): string {
  const header = ['Title', 'URL', 'Category'];
  const rows = feeds.map(f => [
    `"${(f.title ?? '').replace(/"/g, '""')}"`,
    `"${(f.url ?? '').replace(/"/g, '""')}"`,
    `"${(f.category ?? '').replace(/"/g, '""')}"`
  ].join(','));
  return [header.join(','), ...rows].join('\r\n');
}
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
export function ExportButtons({ feeds }: ExportButtonsProps) {
  const handleOpmlExport = () => {
    const opmlContent = feedsToOpml(feeds);
    downloadFile(opmlContent, 'lv-feeds.opml', 'application/xml');
  };
  const handleCsvExport = () => {
    const csvContent = feedsToCsv(feeds);
    downloadFile(csvContent, 'lv-feeds.csv', 'text/csv;charset=utf-8;');
  };
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={handleOpmlExport}>
              <Download className="mr-2 h-4 w-4" />
              OPML
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export for RSS Readers (Feedly, etc.)</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={handleCsvExport}>
              <FileText className="mr-2 h-4 w-4" />
              CSV
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export for Spreadsheets (Excel, etc.)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}