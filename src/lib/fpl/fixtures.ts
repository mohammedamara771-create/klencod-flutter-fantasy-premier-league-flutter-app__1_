import type { Fixture, RawFixture } from "./types";

export function mapRawFixtures(raw: RawFixture[]): Fixture[] {
  return raw.map((fixture) => {
    const goalStats = fixture.stats?.find((stat) => stat.identifier === "goals_scored");
    const assistStats = fixture.stats?.find((stat) => stat.identifier === "assists");
    const scorers: Fixture["scorers"] = [];

    for (const side of ["h", "a"] as const) {
      const goals = goalStats?.[side] ?? [];
      for (const goal of goals) {
        const assists = assistStats?.[side]?.find((row) => row.element === goal.element);
        scorers.push({
          element: goal.element,
          side,
          goals: goal.value,
          assists: assists?.value ?? 0,
        });
      }
      for (const assist of assistStats?.[side] ?? []) {
        if (!scorers.some((row) => row.side === side && row.element === assist.element)) {
          scorers.push({ element: assist.element, side, goals: 0, assists: assist.value });
        }
      }
    }

    return {
      id: fixture.id,
      event: fixture.event,
      kickoff: fixture.kickoff_time,
      started: Boolean(fixture.started),
      finished: Boolean(fixture.finished),
      teamH: fixture.team_h,
      teamA: fixture.team_a,
      scoreH: fixture.team_h_score,
      scoreA: fixture.team_a_score,
      difficultyH: fixture.team_h_difficulty ?? 3,
      difficultyA: fixture.team_a_difficulty ?? 3,
      scorers,
    };
  });
}
