import { describe, it, expect } from 'vitest';
import { computeTeamSummaries } from '../teamSummaryUtils';
import type { UserSummary } from '../../types/metrics';

const makeUser = (overrides: Partial<UserSummary> & { user_login: string; user_id: number }): UserSummary => ({
  total_user_initiated_interactions: 0,
  total_code_generation_activities: 0,
  total_code_acceptance_activities: 0,
  total_loc_added: 0,
  total_loc_deleted: 0,
  total_loc_suggested_to_add: 0,
  total_loc_suggested_to_delete: 0,
  days_active: 0,
  used_agent: false,
  used_chat: false,
  used_cli: false,
  ...overrides,
});

describe('computeTeamSummaries', () => {
  it('correctly groups users by team and sums numeric fields', () => {
    const users: UserSummary[] = [
      makeUser({ user_login: 'alice', user_id: 1, team: 'team-a', total_user_initiated_interactions: 10, total_loc_added: 100 }),
      makeUser({ user_login: 'bob', user_id: 2, team: 'team-a', total_user_initiated_interactions: 5, total_loc_added: 50 }),
      makeUser({ user_login: 'carol', user_id: 3, team: 'team-b', total_user_initiated_interactions: 20, total_loc_added: 200 }),
    ];

    const result = computeTeamSummaries(users);
    const teamA = result.find((t) => t.team_name === 'team-a');
    const teamB = result.find((t) => t.team_name === 'team-b');

    expect(teamA).toBeDefined();
    expect(teamA!.user_count).toBe(2);
    expect(teamA!.total_user_initiated_interactions).toBe(15);
    expect(teamA!.total_loc_added).toBe(150);

    expect(teamB).toBeDefined();
    expect(teamB!.user_count).toBe(1);
    expect(teamB!.total_user_initiated_interactions).toBe(20);
  });

  it('users without a team are grouped under "(No team)"', () => {
    const users: UserSummary[] = [
      makeUser({ user_login: 'alice', user_id: 1, team: undefined, total_user_initiated_interactions: 5 }),
      makeUser({ user_login: 'bob', user_id: 2, team: undefined, total_user_initiated_interactions: 3 }),
    ];

    const result = computeTeamSummaries(users);
    const noTeam = result.find((t) => t.team_name === '(No team)');

    expect(noTeam).toBeDefined();
    expect(noTeam!.user_count).toBe(2);
    expect(noTeam!.total_user_initiated_interactions).toBe(8);
  });

  it('result is sorted descending by total_user_initiated_interactions', () => {
    const users: UserSummary[] = [
      makeUser({ user_login: 'alice', user_id: 1, team: 'team-low', total_user_initiated_interactions: 5 }),
      makeUser({ user_login: 'bob', user_id: 2, team: 'team-high', total_user_initiated_interactions: 100 }),
      makeUser({ user_login: 'carol', user_id: 3, team: 'team-mid', total_user_initiated_interactions: 50 }),
    ];

    const result = computeTeamSummaries(users);

    expect(result[0].team_name).toBe('team-high');
    expect(result[1].team_name).toBe('team-mid');
    expect(result[2].team_name).toBe('team-low');
  });

  it('chat_users, agent_users, cli_users counts are correct', () => {
    const users: UserSummary[] = [
      makeUser({ user_login: 'alice', user_id: 1, team: 'team-a', used_chat: true, used_agent: false, used_cli: false }),
      makeUser({ user_login: 'bob', user_id: 2, team: 'team-a', used_chat: true, used_agent: true, used_cli: false }),
      makeUser({ user_login: 'carol', user_id: 3, team: 'team-a', used_chat: false, used_agent: false, used_cli: true }),
    ];

    const result = computeTeamSummaries(users);
    const teamA = result.find((t) => t.team_name === 'team-a');

    expect(teamA!.chat_users).toBe(2);
    expect(teamA!.agent_users).toBe(1);
    expect(teamA!.cli_users).toBe(1);
  });

  it('returns empty array for empty input', () => {
    expect(computeTeamSummaries([])).toEqual([]);
  });
});
