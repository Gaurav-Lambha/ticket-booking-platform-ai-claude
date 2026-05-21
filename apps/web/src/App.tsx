import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Spinner } from '@repo/ui';
import { AuthProvider } from '@/features/auth/AuthContext.tsx';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute.tsx';
import { MainLayout } from '@/layouts/MainLayout.tsx';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage.tsx'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage.tsx'));
const EventsPage = lazy(() => import('@/features/events/pages/EventsPage.tsx'));
const EventDetailPage = lazy(() => import('@/features/events/pages/EventDetailPage.tsx'));
const BookingPage = lazy(() => import('@/features/booking/pages/BookingPage.tsx'));
const MyBookingsPage = lazy(() => import('@/features/booking/pages/MyBookingsPage.tsx'));
const CreateEventPage = lazy(() => import('@/features/events/pages/CreateEventPage.tsx'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: (failureCount, error) => {
        if ((error as { status?: number }).status === 401) return false;
        return failureCount < 2;
      },
    },
  },
});

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Spinner size="xl" />
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Navigate to="/events" replace />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/:id" element={<EventDetailPage />} />
                  <Route path="/events/:id/book" element={<BookingPage />} />
                  <Route path="/bookings" element={<MyBookingsPage />} />
                  <Route
                    path="/events/create"
                    element={
                      <ProtectedRoute roles={['admin', 'organizer']}>
                        <CreateEventPage />
                      </ProtectedRoute>
                    }
                  />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/events" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
