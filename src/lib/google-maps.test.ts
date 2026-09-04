import { describe, expect, it } from "vitest";
import { googleMapsSearchUrl } from "@/lib/google-maps";

describe("googleMapsSearchUrl", () => {
  it("encodes name and address when coordinates are missing", () => {
    const url = googleMapsSearchUrl({
      name: "Kartuli Table",
      address: "41-20 Queens Blvd, Sunnyside, NY 11104",
    });

    expect(url.startsWith("https://www.google.com/maps/search/?api=1&query=")).toBe(
      true,
    );
    expect(url).toContain(encodeURIComponent("Kartuli Table"));
    expect(url).toContain(encodeURIComponent("41-20 Queens Blvd, Sunnyside, NY 11104"));
    expect(url).not.toContain(" ");
  });

  it("prefers real coordinates over the address", () => {
    const url = googleMapsSearchUrl({
      name: "Lagos Kitchen",
      address: "200 E 161st St, Bronx, NY 10451",
      latitude: 40.827,
      longitude: -73.922,
    });

    expect(url).toBe(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("40.827,-73.922")}`,
    );
  });
});
