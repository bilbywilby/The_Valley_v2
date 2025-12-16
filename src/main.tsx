import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { FinalValidator } from '@/components/FinalValidator';
import '@/index.css'
const HomePage = lazy(() => import('@/pages/HomePage').then(module => ({ default: module.HomePage })));
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      // In production, allow queries to run even if offline, relying on the service worker cache.
      // In development, stick to the default 'online' to avoid confusion.
      networkMode: import.meta.env.PROD ? 'always' : 'online',
    },
  },
});
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <FinalValidator>
          <RouterProvider router={router} />
        </FinalValidator>
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)