import { describe, expect, it } from "vitest";
import {
  baseRegion,
  meshNames,
  regionDetails,
  regionDetailsEnglish,
  systemForRegion,
  systems,
} from "../src/brain-data";

describe("FlyVista brain atlas data", () => {
  it("contains 78 unique neuropil meshes", () => {
    expect(meshNames).toHaveLength(78);
    expect(new Set(meshNames).size).toBe(meshNames.length);
  });

  it("maps every mesh to exactly one functional system", () => {
    for (const meshName of meshNames) {
      const region = baseRegion(meshName);
      const matches = systems.filter((system) => system.regions.includes(region));
      expect(matches, meshName).toHaveLength(1);
      expect(systemForRegion(region).id).toBe(matches[0].id);
    }
  });

  it("provides Chinese and English details for every region", () => {
    const regions = new Set(meshNames.map(baseRegion));
    for (const region of regions) {
      expect(regionDetails[region], `${region} Chinese details`).toBeDefined();
      expect(regionDetailsEnglish[region], `${region} English details`).toBeDefined();
    }
  });
});
