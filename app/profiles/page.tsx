'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { api, type Profile } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Users,
  ArrowUpDown,
  X,
} from 'lucide-react';

interface Filters {
  gender: string;
  age_group: string;
  country_id: string;
  sort_by: 'age' | 'created_at' | 'gender_probability';
  // Backend param is "order" not "sort_order"
  order: 'asc' | 'desc';
}

export default function ProfilesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({
    gender: '',
    age_group: '',
    country_id: '',
    sort_by: 'created_at',
    order: 'desc',
  });

  const limit = 10;

  const { data, isLoading, error, mutate } = useSWR(
    ['profiles', page, filters],
    () =>
      api.getProfiles({
        page,
        limit,
        gender: filters.gender || undefined,
        age_group: filters.age_group || undefined,
        country_id: filters.country_id || undefined,
        sort_by: filters.sort_by,
        order: filters.order, // correct param name
      }),
    { keepPreviousData: true }
  );

  // Response shape: { status, page, limit, total, total_pages, links, data: Profile[] }
  const profiles: Profile[] = data?.data ?? [];
  const totalPages = data ? data.total_pages : 0;
  const hasActiveFilters = filters.gender || filters.age_group || filters.country_id;

  const clearFilters = () => {
    setFilters({
      gender: '',
      age_group: '',
      country_id: '',
      sort_by: 'created_at',
      order: 'desc',
    });
    setPage(1);
  };

  const filteredProfiles = search
    ? profiles.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : profiles;

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Profiles</h1>
            <p className="text-muted-foreground">Browse and filter demographic profiles</p>
          </div>
          <Button asChild>
            <Link href="/lookup">
              <Search className="mr-2 h-4 w-4" />
              Lookup Query
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Filters</CardTitle>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={filters.gender}
                onValueChange={(value) => {
                  setFilters({ ...filters, gender: value === 'all' ? '' : value });
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.age_group}
                onValueChange={(value) => {
                  setFilters({ ...filters, age_group: value === 'all' ? '' : value });
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Age Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="teenager">Teenager</SelectItem>
                  <SelectItem value="adult">Adult</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>

              {/* Only sort options the backend actually supports */}
              <Select
                value={`${filters.sort_by}-${filters.order}`}
                onValueChange={(value) => {
                  const [sort_by, order] = value.split('-') as [
                    'age' | 'created_at' | 'gender_probability',
                    'asc' | 'desc',
                  ];
                  setFilters({ ...filters, sort_by, order });
                }}
              >
                <SelectTrigger>
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="age-asc">Age: Low to High</SelectItem>
                  <SelectItem value="age-desc">Age: High to Low</SelectItem>
                  <SelectItem value="gender_probability-desc">Confidence: High to Low</SelectItem>
                  <SelectItem value="gender_probability-asc">Confidence: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                {isLoading ? 'Loading...' : `${data?.total ?? 0} Profiles`}
              </CardTitle>
            </div>
            <CardDescription>
              {hasActiveFilters ? 'Filtered results' : 'All profiles in the database'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8 text-destructive">
                Failed to load profiles. Please try again.
                <Button variant="outline" size="sm" className="ml-4" onClick={() => mutate()}>
                  Retry
                </Button>
              </div>
            ) : isLoading ? (
              <ProfilesTableSkeleton />
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No profiles found. Try adjusting your filters.
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead className="hidden sm:table-cell">Age Group</TableHead>
                        <TableHead className="hidden md:table-cell">Country</TableHead>
                        <TableHead className="hidden lg:table-cell">Confidence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.map((profile) => (
                        <ProfileRow key={profile.id} profile={profile} />
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function ProfileRow({ profile }: { profile: Profile }) {
  return (
    <TableRow className="cursor-pointer hover:bg-secondary/50">
      <TableCell>
        <Link href={`/profiles/${profile.id}`} className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-primary">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </span>
          </div>
          <span className="font-medium">{profile.name}</span>
        </Link>
      </TableCell>
      <TableCell>
        <Badge variant={profile.gender === 'male' ? 'default' : 'secondary'} className="capitalize">
          {profile.gender}
        </Badge>
      </TableCell>
      <TableCell>{profile.age}</TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant="outline" className="capitalize">
          {profile.age_group}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex items-center gap-1">
          <span className="text-lg">{getFlagEmoji(profile.country_id)}</span>
          <span>{profile.country_name || profile.country_id}</span>
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${profile.gender_probability * 100}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {(profile.gender_probability * 100).toFixed(0)}%
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ProfilesTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Age</TableHead>
            <TableHead className="hidden sm:table-cell">Age Group</TableHead>
            <TableHead className="hidden md:table-cell">Country</TableHead>
            <TableHead className="hidden lg:table-cell">Confidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(10)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Skeleton className="h-2 w-16" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
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
