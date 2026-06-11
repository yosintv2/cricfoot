'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Match } from '@/types';
import { fmtKick, toSlug, countryFlag } from '@/lib/utils';

interface Props {
  match: Match;
  showLeague?: boolean;
}

export default function MatchCard({ match, showLeague }: Props) {
  const [open, setOpen] = useState(false);
  const tvChs = match.tv_channels ?? [];
  const totalCh = tvChs.reduce((a, tv) => a + (tv.channels ?? []).length, 0);
  const kickoffISO = match.kickoff ? new Date(match.kickoff * 1000).toISOString() : '';

  // Collect up to 3 unique preview channels across all countries
  const previewChannels: string[] = [];
  for (const tv of tvChs) {
    for (const ch of (tv.channels ?? [])) {
      if (previewChannels.length >= 3) break;
      if (!previewChannels.includes(ch)) previewChannels.push(ch);
    }
    if (previewChannels.length >= 3) break;
  }
  const hasMore = totalCh > previewChannels.length;

  const sorted = [...tvChs].sort((a, b) => (a.country ?? '').localeCompare(b.country ?? ''));

  return (
    <article itemScope itemType="https://schema.org/SportsEvent">

      {/* ── Match row ── */}
      <div
        className={`match-row${open ? ' expanded' : ''}`}
        onClick={() => setOpen(o => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpen(o => !o)}
        aria-expanded={open}
        aria-label={`${match.fixture || 'Match'} — click to see TV channels`}
      >
        <div
          className="match-row-time"
          itemProp="startDate"
          content={kickoffISO}
        >
          {fmtKick(match.kickoff)}
        </div>

        <div className="match-row-fixture" itemProp="name">
          {match.fixture || 'TBA'}
          {showLeague && match.league && (
            <Link
              href={`/league/${toSlug(match.league)}`}
              className="match-league-inline-tag"
              onClick={e => e.stopPropagation()}
            >
              {match.league}
            </Link>
          )}
        </div>

        {previewChannels.length > 0 ? (
          <div className="match-row-channels" aria-label={`Available on ${previewChannels.join(', ')}`}>
            <span className="match-ch-arrow">▶</span>
            {previewChannels.map((ch, i) => (
              <span key={ch}>
                <Link
                  href={`/channel/${toSlug(ch)}`}
                  className="match-ch-name"
                  onClick={e => e.stopPropagation()}
                  title={`View ${ch} schedule`}
                >
                  {ch}
                </Link>
                {i < previewChannels.length - 1 && <span className="match-ch-sep">, </span>}
              </span>
            ))}
            {hasMore && <span className="match-ch-more">...</span>}
          </div>
        ) : totalCh === 0 ? (
          <span className="match-row-no-tv">No TV info</span>
        ) : null}
      </div>

      {/* ── Expandable country/channel table (image 2 style) ── */}
      {open && (
        <div className="match-detail-wrap">
          <div className="match-detail-header">
            <div className="match-detail-title">
              {match.fixture} Live Stream and TV Schedule
            </div>
            <div className="match-detail-meta">
              {match.league && <>{match.league}</>}
              {match.league && match.venue && ' · '}
              {match.venue && (
                <span itemProp="location" itemScope itemType="https://schema.org/Place">
                  <span itemProp="name">📍 {match.venue}</span>
                </span>
              )}
              {' · '}{fmtKick(match.kickoff)}
            </div>
          </div>

          {sorted.length === 0 ? (
            <p style={{ padding: '14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No broadcast information available for this match.
            </p>
          ) : (
            <table className="country-table" aria-label="TV channels by country">
              <tbody>
                {sorted.map((tv, ti) => (
                  <tr key={ti}>
                    <td className="ct-flag-name">
                      <span className="ct-flag-icon" aria-hidden="true">
                        {countryFlag(tv.country ?? '')}
                      </span>
                      {tv.country || 'International'}
                    </td>
                    <td className="ct-channels">
                      {(tv.channels ?? []).map((ch, i) => (
                        <span key={ch}>
                          <Link
                            href={`/channel/${toSlug(ch)}`}
                            className="ct-ch-link"
                            onClick={e => e.stopPropagation()}
                            title={`View all matches on ${ch}`}
                          >
                            {ch}
                          </Link>
                          {i < (tv.channels ?? []).length - 1 && ', '}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </article>
  );
}
