'use client';

import { useState } from 'react';
import { api, type Profile, type ProfilesListResponse } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  Loader2,
  Users,
  Calendar,
  Globe,
  TrendingUp,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function LookupPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ProfilesListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const handleLookup = async (e: React.FormEvent, overridePage?: number) => {
    e.preventDefault();
    if (!query.trim()) return;

    const targetPage = overridePage ?? 1;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.searchProfiles(query.trim(), {
        page: targetPage,
        limit: 10,
      });
      setResults(response);
      setPage(targetPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search profiles');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    handleLookup(
      { preventDefault: () => {} } as React.FormEvent,
      newPage
    );
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight">Profile Lookup</h1>
          <p className="text-muted-foreground mt-1">
            Search existing profiles using natural language
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Natural Language Search</CardTitle>
            </div>
            <CardDescription>
              Try queries like &quot;young males from ghana&quot; or &quot;adult women in nigeria&quot;
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="e.g. young males from ghana"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading || !query.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="max-w-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && (
          <div className="space-y-4">
            <div className="flex items-center justify-between max-w-4xl">
              <p className="text-sm text-muted-foreground">
                {results.total} profile{results.total !== 1 ? 's' : ''} found
                {results.total_pages > 1 && ` — page ${results.page} of ${results.total_pages}`}
              </p>
            </div>

            {results.data.length === 0 ? (
              <Card className="max-w-2xl border-dashed">
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">No profiles matched</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Try adjusting your query. For example: &quot;males from nigeria&quot;, &quot;elderly women&quot;, &quot;adults between 25 and 35&quot;.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4 max-w-4xl">
                  {results.data.map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>

                {results.total_pages > 1 && (
                  <div className="flex items-center gap-2 max-w-4xl">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      Page {page} of {results.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= results.total_pages || isLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!results && !error && !isLoading && (
          <Card className="max-w-2xl border-dashed">
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold mb-2">Search existing profiles</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Use plain English to search. Supported filters: gender, age group, age range, and country.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {[
                  'young males from ghana',
                  'adult women in nigeria',
                  'elderly people',
                  'men between 25 and 35',
                ].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setQuery(example)}
                    className="text-xs px-3 py-1 rounded-full border border-dashed text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-base font-bold text-primary">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold truncate">{profile.name}</h3>
              <Badge
                variant={profile.gender === 'male' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {profile.gender}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {profile.age_group}
              </Badge>
            </div>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Age {profile.age}
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                {profile.country_name || profile.country_id}{' '}
                {getFlagEmoji(profile.country_id)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {(profile.gender_probability * 100).toFixed(0)}% gender confidence
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                {(profile.country_probability * 100).toFixed(0)}% country confidence
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}