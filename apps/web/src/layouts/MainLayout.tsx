import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import { Button } from '@repo/ui';
import { useAuth } from '@/features/auth/AuthContext.tsx';
import { useAuthStore } from '@/features/auth/authStore.ts';

export function MainLayout() {
  const { logout } = useAuth();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    void navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/events" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                TicketHub
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <NavLink
                  to="/events"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`
                  }
                >
                  Events
                </NavLink>
                <NavLink
                  to="/bookings"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`
                  }
                >
                  My Bookings
                </NavLink>
                {(user?.role === 'admin' || user?.role === 'organizer') && (
                  <NavLink
                    to="/events/create"
                    className={({ isActive }) =>
                      `text-sm font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`
                    }
                  >
                    Create Event
                  </NavLink>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <span className="hidden sm:block text-sm text-gray-600">
                  {user.firstName} {user.lastName}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleLogout()}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
