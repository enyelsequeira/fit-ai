import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SessionItem } from "../utils";
import { groupSessionsByDate } from "../utils";

const FAKE_NOW = new Date("2026-02-25T12:00:00.000Z");

function makeSession(id: string, updatedAt: string): SessionItem {
  return { id, title: `Chat ${id}`, updatedAt, messageCount: 1 };
}

describe("groupSessionsByDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FAKE_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns empty array for empty sessions", () => {
    expect(groupSessionsByDate([])).toEqual([]);
  });

  it("groups sessions into Today, Yesterday, Previous 7 Days, and Older", () => {
    const sessions = [
      makeSession("1", "2026-02-25T10:00:00.000Z"), // Today
      makeSession("2", "2026-02-24T15:00:00.000Z"), // Yesterday
      makeSession("3", "2026-02-20T08:00:00.000Z"), // Previous 7 Days
      makeSession("4", "2026-02-10T12:00:00.000Z"), // Older
    ];

    const result = groupSessionsByDate(sessions);

    expect(result).toEqual([
      { label: "Today", sessions: [sessions[0]] },
      { label: "Yesterday", sessions: [sessions[1]] },
      { label: "Previous 7 Days", sessions: [sessions[2]] },
      { label: "Older", sessions: [sessions[3]] },
    ]);
  });

  it("places all sessions in Today when all are from today", () => {
    const sessions = [
      makeSession("1", "2026-02-25T08:00:00.000Z"),
      makeSession("2", "2026-02-25T11:30:00.000Z"),
      makeSession("3", "2026-02-25T00:00:00.000Z"),
    ];

    const result = groupSessionsByDate(sessions);

    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe("Today");
    expect(result[0]!.sessions).toHaveLength(3);
  });

  it("filters out empty groups", () => {
    const sessions = [
      makeSession("1", "2026-02-25T09:00:00.000Z"), // Today
      makeSession("2", "2026-01-01T12:00:00.000Z"), // Older
    ];

    const result = groupSessionsByDate(sessions);
    const labels = result.map((g) => g.label);

    expect(labels).toEqual(["Today", "Older"]);
    expect(labels).not.toContain("Yesterday");
    expect(labels).not.toContain("Previous 7 Days");
  });

  it("places sessions at the boundary of yesterday correctly", () => {
    // Start of yesterday (midnight) should be in Yesterday
    const sessions = [makeSession("1", "2026-02-24T00:00:00.000Z")];

    const result = groupSessionsByDate(sessions);

    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe("Yesterday");
  });

  it("places sessions at the boundary of 7 days ago correctly", () => {
    // Exactly 7 days ago from today's midnight should be in Previous 7 Days
    const sessions = [makeSession("1", "2026-02-18T00:00:00.000Z")];

    const result = groupSessionsByDate(sessions);

    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe("Previous 7 Days");
  });

  it("places sessions well before 7 days ago into Older", () => {
    const sessions = [makeSession("1", "2026-02-15T12:00:00.000Z")];

    const result = groupSessionsByDate(sessions);

    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe("Older");
  });
});
