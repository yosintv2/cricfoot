'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Match } from '@/types';
import { toSlug, toYMD, todayYMD, matchSlug } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import LocalTime, { MatchStatus } from './LocalTime';

interface Props {
  match: Match;
  showLeague?: boolean;
  ymd?: string;
}

export default function MatchCard({ match, showLeague, ymd }: Props) {
  const router = useRouter();
  const { t } = useLang();
  const tvChs = match.tv_channels ?? [];
  const totalCh = tvChs.reduce((a, tv) => a + (tv.channels ?? []).length, 0);
  const kickoffISO = match.kickoff ? new Date(match.kickoff * 1000).toISOString() : '';

  // The API groups matches into per-date files; fall back to kickoff date when
  // the parent doesn't pass the file's ymd down.
  const dayYmd = ymd ?? (match.kickoff ? toYMD(new Date(match.kickoff * 1000)) : todayYMD());
  const href = match.fixture ? `/match/${matchSlug(dayYmd, match.fixture)}` : null;

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

  function openMatch() {
    if (href) router.push(href);
  }

  return (
    <article itemScope itemType="https://schema.org/SportsEvent">
      <div
        className="match-row"
        onClick={openMatch}
        role="link"
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && openMatch()}
        aria-label={`${match.fixture || 'Match'} — view all TV channels`}
      >
        <div
          className="match-row-time"
          itemProp="startDate"
          content={kickoffISO}
        >
          <LocalTime unix={match.kickoff} />
        </div>

        <MatchStatus unix={match.kickoff} />

        <div className="match-row-fixture" itemProp="name">
          {match.fixture || (t?.tba ?? 'TBA')}
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

        {previewChannels.length === 0 ? (
          <div className="match-row-channels" aria-label="TV channels updating soon">
            <span className="match-ch-arrow">▶</span>
            <span className="match-ch-soon">{t?.tvChannelsUpdatingSoon ?? 'TV Channels updating soon'}</span>
          </div>
        ) : (
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
        )}
      </div>
    </article>
  );
}
