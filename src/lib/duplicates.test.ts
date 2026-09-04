import { describe, expect, it } from "vitest";
import { findDuplicateCandidates, normalizeName } from "@/lib/duplicates";
import type { Restaurant } from "@/types/restaurant";

function restaurant(
  overrides: Partial<Restaurant> & Pick<Restaurant, "id" | "name">,
): Restaurant {
  return {
    countryCodes: ["GE"],
    classification: "specialist",
    status: "open",
    borough: "Queens",
    neighborhood: "Sunnyside",
    descriptionZh: "测试",
    sources: [
      {
        type: "other",
        title: "source",
        url: "https://example.com/source",
        checkedAt: "2026-09-02",
      },
    ],
    lastVerifiedAt: "2026-09-02",
    ...overrides,
  };
}

describe("duplicates", () => {
  it("normalizes punctuation in names", () => {
    expect(normalizeName("Kartuli Table!")).toBe("kartuli table");
  });

  it("flags the same normalized name and address", () => {
    const matches = findDuplicateCandidates([
      restaurant({
        id: "a",
        name: "Kartuli Table",
        address: "41-20 Queens Blvd, Sunnyside, NY 11104",
      }),
      restaurant({
        id: "b",
        name: "kartuli table.",
        address: "41-20 Queens Boulevard, Sunnyside, NY 11104",
      }),
    ]);

    expect(matches.some((match) => match.kind === "same_name_and_address")).toBe(
      true,
    );
  });

  it("does not treat chain locations as exact duplicates", () => {
    const matches = findDuplicateCandidates([
      restaurant({
        id: "queens",
        name: "Kartuli Table",
        address: "41-20 Queens Blvd, Sunnyside, NY 11104",
        borough: "Queens",
        neighborhood: "Sunnyside",
      }),
      restaurant({
        id: "brooklyn",
        name: "Kartuli Table",
        address: "800 Nostrand Ave, Brooklyn, NY 11216",
        borough: "Brooklyn",
        neighborhood: "Crown Heights",
      }),
    ]);

    expect(matches.some((match) => match.kind === "same_name_and_address")).toBe(
      false,
    );
    expect(
      matches.some((match) => match.kind === "similar_name_different_location"),
    ).toBe(true);
  });
});
