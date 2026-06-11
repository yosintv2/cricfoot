export interface TVChannelGroup {
  country: string;
  channels: string[];
}

export interface Match {
  fixture: string;
  league: string;
  kickoff: number;
  venue: string;
  tv_channels: TVChannelGroup[];
}

export interface ChannelEntry {
  name: string;
  matchCount: number;
  countries: string[];
}
