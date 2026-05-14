'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Activity, Github } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();

  // If already logged in, go straight to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Activity className="h-9 w-9 text-primary-foreground" />
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2">InsightaLabs</h1>
        <p className="text-muted-foreground mb-8">
          AI-powered demographic profile analytics. Predict age, gender, and
          nationality from names with high accuracy.
        </p>

        <Button size="lg" className="w-full sm:w-auto gap-2" onClick={login}>
          <Github className="h-5 w-5" />
          Sign in with GitHub
        </Button>

        {/* Show error from failed auth if redirected back with ?error */}
        {typeof window !== 'undefined' &&
          new URLSearchParams(window.location.search).get('error') && (
            <p className="mt-4 text-sm text-destructive">
              Authentication failed. Please try again.
            </p>
          )}
      </div>
    </div>
  );
}
