import { describe, it, expect } from 'vitest';
import { parseTeamLookupCsv } from '../teamLookupParser';

describe('parseTeamLookupCsv', () => {
  it('parses a valid CSV correctly', () => {
    const csv = `login,enterprise_team_name\nuser1,team-a\nuser2,team-b`;
    const result = parseTeamLookupCsv(csv);
    expect(result.get('user1')).toBe('team-a');
    expect(result.get('user2')).toBe('team-b');
    expect(result.size).toBe(2);
  });

  it('handles values with surrounding double quotes', () => {
    const csv = `login,enterprise_team_name\n"abhi-singhs_octocps","all-the-india-ses"`;
    const result = parseTeamLookupCsv(csv);
    expect(result.get('abhi-singhs_octocps')).toBe('all-the-india-ses');
  });

  it('throws if the header is missing login column', () => {
    const csv = `username,enterprise_team_name\nuser1,team-a`;
    expect(() => parseTeamLookupCsv(csv)).toThrow(/login/);
  });

  it('throws if the header is missing enterprise_team_name column', () => {
    const csv = `login,team\nuser1,team-a`;
    expect(() => parseTeamLookupCsv(csv)).toThrow(/enterprise_team_name/);
  });

  it('returns an empty map for a header-only file', () => {
    const csv = `login,enterprise_team_name`;
    const result = parseTeamLookupCsv(csv);
    expect(result.size).toBe(0);
  });

  it('strips extra whitespace from values', () => {
    const csv = `login,enterprise_team_name\n  user1  ,  team-a  `;
    const result = parseTeamLookupCsv(csv);
    expect(result.get('user1')).toBe('team-a');
  });

  it('skips empty lines', () => {
    const csv = `login,enterprise_team_name\nuser1,team-a\n\nuser2,team-b\n`;
    const result = parseTeamLookupCsv(csv);
    expect(result.size).toBe(2);
  });

  it('handles Windows line endings (CRLF)', () => {
    const csv = `login,enterprise_team_name\r\nuser1,team-a\r\nuser2,team-b`;
    const result = parseTeamLookupCsv(csv);
    expect(result.get('user1')).toBe('team-a');
    expect(result.get('user2')).toBe('team-b');
  });
});
