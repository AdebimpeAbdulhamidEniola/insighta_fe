'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgeGroupChart } from '@/components/charts/age-group-chart';
import { CountryChart } from '@/components/charts/country-chart';
import { GenderChart } from '@/components/charts/gender-chart';
import { RecentProfiles } from '@/components/recent-profiles';
import { Users, Globe, Activity, Search } from 'lucide-react';
import useSWR from 'swr';
import { api, type ProfilesListResponse } from '@/lib/api';

// Individual fetchers that return the total for a given filter
const fetchMale   = () => api.getProfiles({ gender: 'male',   limit: 1 });
const fetchFemale = () => api.getProfiles({ gender: 'female', limit: 1 });
const fetchChild  = () => api.getProfiles({ age_group: 'child',     limit: 1 });
const fetchTeen   = () => api.getProfiles({ age_group: 'teenager',  limit: 1 });
const fetchAdult  = () => api.getProfiles({ age_group: 'adult',     limit: 1 });
const fetchSenior = () => api.getProfiles({ age_group: 'senior',    limit: 1 });
const fetchAll    = () => api.getProfiles({ limit: 1 });
// Country sample — fetch 50 profiles and aggregate client-side
const fetchCountrySample = () => api.getProfiles({ limit: 50, sort_by: 'created_at', order: 'desc' });

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/');
  }, [isAuthenticated, isLoading, router]);

  const enabled = isAuthenticated;

  const { data: allData }    = useSWR<ProfilesListResponse>(enabled ? 'total'   : null, fetchAll);
  const { data: maleData }   = useSWR<ProfilesListResponse>(enabled ? 'male'    : null, fetchMale);
  const { data: femaleData } = useSWR<ProfilesListResponse>(enabled ? 'female'  : null, fetchFemale);
  const { data: childData }  = useSWR<ProfilesListResponse>(enabled ? 'child'   : null, fetchChild);
  const { data: teenData }   = useSWR<ProfilesListResponse>(enabled ? 'teen'    : null, fetchTeen);
  const { data: adultData }  = useSWR<ProfilesListResponse>(enabled ? 'adult'   : null, fetchAdult);
  const { data: seniorData } = useSWR<ProfilesListResponse>(enabled ? 'senior'  : null, fetchSenior);
  const { data: countryData }= useSWR<ProfilesListResponse>(enabled ? 'country-sample' : null, fetchCountrySample);

  const genderChartData = [
    { gender: 'male',   count: maleData?.total   ?? 0 },
    { gender: 'female', count: femaleData?.total  ?? 0 },
  ];

  const ageGroupChartData = [
    { age_group: 'child',     count: childData?.total  ?? 0 },
    { age_group: 'teenager',  count: teenData?.total   ?? 0 },
    { age_group: 'adult',     count: adultData?.total  ?? 0 },
    { age_group: 'senior',    count: seniorData?.total ?? 0 },
  ];

  // Aggregate country counts from the sample
  const countryMap: Record<string, { country_id: string; country_name: string | null; count: number }> = {};
  for (const profile of countryData?.data ?? []) {
    const key = profile.country_id;
    if (!countryMap[key]) {
      countryMap[key] = { country_id: key, country_name: profile.country_name, count: 0 };
    }
    countryMap[key].count++;
  }
  const countryChartData = Object.values(countryMap);

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

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back{user?.username ? `, ${user.username}` : ''}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s an overview of your demographic data.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Profiles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{allData?.total?.toLocaleString() ?? '—'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Male</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{maleData?.total?.toLocaleString() ?? '—'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Female</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{femaleData?.total?.toLocaleString() ?? '—'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Role</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold capitalize">{user?.role ?? '—'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gender Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <GenderChart data={genderChartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Age Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <AgeGroupChart data={ageGroupChartData} />
            </CardContent>
          </Card>
        </div>

        {/* Charts row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Top Countries</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CountryChart data={countryChartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Profiles</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <RecentProfiles />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}