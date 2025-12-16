import React, { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import { Download } from 'lucide-react';
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
export function FinalValidator({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.info('The app can be installed from your browser\'s menu.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast.success('App installed successfully!');
    }
    setDeferredPrompt(null);
  };
  return (
    <>
      <Suspense fallback={<div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center"><div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>}>
        {children}
      </Suspense>
      {deferredPrompt && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button onClick={handleInstallClick} size="lg" className="shadow-lg animate-fade-in">
            <Download className="mr-2 h-5 w-5" />
            Install App
          </Button>
        </div>
      )}
      <Toaster richColors position="bottom-right" />
    </>
  );
}