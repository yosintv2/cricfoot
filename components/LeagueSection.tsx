'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Match } from '@/types';
import { toSlug, getLeagueFlag } from '@/lib/utils';
import MatchCard from './MatchCard';

interface Props {
  league: string;
  matches: Match[];
  showLeague?: boolean;
  defaultOpen?: boolean;
  ymd?: string;
}

export default function LeagueSection({ league, matches, showLeague, defaultOpen = true, ymd }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="league-block">
      <div
        className="league-block-header"
        onClick={() => setOpen(o => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpen(o => !o)}
        aria-expanded={open}
        aria-label={`${league} — ${matches.length} matches`}
      >
        <span className="league-flag" aria-hidden="true">{getLeagueFlag(league)}</span>
        <span className="league-block-name">
          {league}
          <span className="league-block-count"> ({matches.length})</span>
        </span>
        <Link
          href={`/league/${toSlug(league)}`}
          className="league-view-all"
          onClick={e => e.stopPropagation()}
          aria-label={`View all ${league} matches`}
        >
          View all
        </Link>
        <span className={`league-block-arrow${open ? ' open' : ''}`} aria-hidden="true">▲</span>
      </div>

      {open && (
        <div className="league-block-body" role="list" aria-label={`${league} matches`}>
          {matches.map((m, i) => (
            <div key={i} role="listitem">
              <MatchCard match={m} showLeague={showLeague} ymd={ymd} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
