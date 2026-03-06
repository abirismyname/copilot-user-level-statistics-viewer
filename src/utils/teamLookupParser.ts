/**
 * Parses a team lookup CSV with columns: login, enterprise_team_name
 * Returns a Map<login, enterprise_team_name>.
 */
export function parseTeamLookupCsv(text: string): Map<string, string> {
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) {
    return new Map();
  }

  const headerLine = lines[0].trim();
  const headerCols = headerLine.split(',').map((col) => stripQuotes(col).trim());

  const loginIndex = headerCols.indexOf('login');
  const teamIndex = headerCols.indexOf('enterprise_team_name');

  if (loginIndex === -1 || teamIndex === -1) {
    throw new Error(
      `Invalid header: expected columns "login" and "enterprise_team_name", got "${headerLine}"`
    );
  }

  const result = new Map<string, string>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(',').map((col) => stripQuotes(col).trim());
    const login = cols[loginIndex];
    const team = cols[teamIndex];

    if (login) {
      result.set(login, team ?? '');
    }
  }

  return result;
}

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}
