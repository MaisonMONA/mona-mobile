import { describe, expect, beforeEach, it, vi } from "vitest";
import { UserData } from "@/internal/databases/UserData";

vi.mock("@capacitor/filesystem", () => ({
  Filesystem: {
    writeFile: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn(),
  },
  Directory: {
    Data: "Data",
    Cache: "Cache",
  },
  Encoding: {
    UTF8: "utf8",
  },
}));

describe("UserData.addCollectedBadge", () => {
  beforeEach(() => {
    (UserData as any).data = {
      collected: {
        badges: [],
      },
    };
  });

  it("adds a new badge when it does not exist", () => {
    const badge = { id: 1, count: 1, src: "locked.svg" };

    UserData.addCollectedBadge(badge);

    const storedBadges = UserData.getCollectedBadges();
    expect(storedBadges).toHaveLength(1);
    expect(storedBadges[0]).toMatchObject(badge);
  });

  it("updates an existing badge instead of duplicating it", () => {
    const initialBadge = { id: 1, count: 1, src: "locked.svg" };
    UserData.addCollectedBadge(initialBadge);

    const updatedBadge = { id: 1, count: 3, src: "unlocked.svg", gridSrc: "grid.svg" };
    UserData.addCollectedBadge(updatedBadge);

    const storedBadges = UserData.getCollectedBadges();
    expect(storedBadges).toHaveLength(1);
    expect(storedBadges[0]).toMatchObject(updatedBadge);
  });
});
