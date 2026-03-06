import type { UserSummary, TeamSummary } from '../types/metrics';

const NO_TEAM_LABEL = '(No team)';

/**
 * Groups UserSummary entries by team and computes per-team aggregated metrics.
 * Users without a team are grouped under "(No team)".
 * Returns the array sorted descending by total_user_initiated_interactions.
 */
export function computeTeamSummaries(users: UserSummary[]): TeamSummary[] {
  const teamMap = new Map<string, TeamSummary>();

  for (const user of users) {
    const teamName = user.team || NO_TEAM_LABEL;

    if (!teamMap.has(teamName)) {
      teamMap.set(teamName, {
        team_name: teamName,
        user_count: 0,
        total_user_initiated_interactions: 0,
        total_code_generation_activities: 0,
        total_code_acceptance_activities: 0,
        total_loc_added: 0,
        total_loc_deleted: 0,
        total_loc_suggested_to_add: 0,
        total_loc_suggested_to_delete: 0,
        days_active: 0,
        chat_users: 0,
        agent_users: 0,
        cli_users: 0,
      });
    }

    const summary = teamMap.get(teamName)!;
    summary.user_count += 1;
    summary.total_user_initiated_interactions += user.total_user_initiated_interactions;
    summary.total_code_generation_activities += user.total_code_generation_activities;
    summary.total_code_acceptance_activities += user.total_code_acceptance_activities;
    summary.total_loc_added += user.total_loc_added;
    summary.total_loc_deleted += user.total_loc_deleted;
    summary.total_loc_suggested_to_add += user.total_loc_suggested_to_add;
    summary.total_loc_suggested_to_delete += user.total_loc_suggested_to_delete;
    summary.days_active += user.days_active;
    if (user.used_chat) summary.chat_users += 1;
    if (user.used_agent) summary.agent_users += 1;
    if (user.used_cli) summary.cli_users += 1;
  }

  return Array.from(teamMap.values()).sort(
    (a, b) => b.total_user_initiated_interactions - a.total_user_initiated_interactions
  );
}
