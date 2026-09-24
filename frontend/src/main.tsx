import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { MotionConfig } from 'motion/react';
import { AuthProvider } from '@/auth/AuthProvider';
import { statusOf } from '@/lib/http';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Don't hammer the API on "not found" / "forbidden" — those won't change by retrying.
      retry: (count, err) => {
        const s = statusOf(err);
        return count < 2 && (s === undefined || s >= 500);
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <MotionConfig reducedMotion="user">
            <App />
          </MotionConfig>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: { borderRadius: '16px', background: '#0f2a20', color: '#f7f2e9', fontSize: '14px', padding: '12px 16px', boxShadow: '0 18px 50px -20px rgba(15,42,32,.6)' },
              success: { iconTheme: { primary: '#edb041', secondary: '#0f2a20' } },
              error: { iconTheme: { primary: '#e86a4f', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
