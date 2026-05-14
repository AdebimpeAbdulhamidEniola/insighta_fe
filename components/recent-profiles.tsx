'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { api, type Profile } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

async function fetchRecentProfiles(): Promise<Profile[]> {
  // Response is flat: { status, page, limit, total, total_pages, links, data[] }
  // sort_order -> order, and data.data not data.profiles
  const response = await api.getProfiles({ limit: 5, sort_by: 'created_at', order: 'desc' });
  return response.data;
}

export function RecentProfiles() {
  const { data: profiles, isLoading, error } = useSWR('recent-profiles', fetchRecentProfiles);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !profiles?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No profiles found. Try adding some profiles first.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {profiles.map((profile) => (
        <Link
          key={profile.id}
          href={`/profiles/${profile.id}`}
          className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-primary">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{profile.name}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
              <span className="capitalize">{profile.gender}</span>
              <span className="text-border">|</span>
              <span>{profile.age} years</span>
              <span className="text-border">|</span>
              <span>{profile.country_name || profile.country_id}</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {profile.age_group}
            </Badge>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      ))}

      <Link
        href="/profiles"
        className="flex items-center justify-center gap-2 p-3 text-sm text-primary hover:text-primary/80 transition-colors"
      >
        View all profiles
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
