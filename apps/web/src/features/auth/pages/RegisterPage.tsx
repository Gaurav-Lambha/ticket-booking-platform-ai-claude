import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button, Card, Input } from '@repo/ui';
import { useAuth } from '../AuthContext.tsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      await register(form);
      void navigate('/events');
    } catch (err: unknown) {
      const apiErr = err as {
        response?: { data?: { error?: { message?: string; details?: Record<string, string[]> } } };
      };
      const details = apiErr.response?.data?.error?.details;
      if (details) {
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(details)) {
          mapped[key] = msgs[0] ?? '';
        }
        setErrors(mapped);
      } else {
        setErrors({ general: apiErr.response?.data?.error?.message ?? 'Registration failed' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
          <p className="mt-2 text-gray-600">Join TicketHub today</p>
        </div>

        <Card>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {errors['general'] && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
                {errors['general']}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                error={errors['firstName']}
                required
                autoComplete="given-name"
              />
              <Input
                label="Last name"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                error={errors['lastName']}
                required
                autoComplete="family-name"
              />
            </div>

            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              error={errors['email']}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              error={errors['password']}
              required
              autoComplete="new-password"
              helperText="Min 8 chars, one uppercase, one number"
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
