import manifest from "./manifest";

describe("manifest", () => {
  it("returns name and short_name as FluxQR", () => {
    const m = manifest();
    expect(m.name).toBe("FluxQR");
    expect(m.short_name).toBe("FluxQR");
  });

  it("returns display as standalone and orientation as portrait", () => {
    const m = manifest();
    expect(m.display).toBe("standalone");
    expect(m.orientation).toBe("portrait");
  });

  it("returns correct background_color and theme_color", () => {
    const m = manifest();
    expect(m.background_color).toBe("#0F172A");
    expect(m.theme_color).toBe("#6366F1");
  });

  it("returns start_url as /", () => {
    const m = manifest();
    expect(m.start_url).toBe("/");
  });

  it("returns icons array with 3 entries with correct src paths", () => {
    const m = manifest();
    expect(Array.isArray(m.icons)).toBe(true);
    expect(m.icons).toHaveLength(3);
    expect(m.icons![0].src).toBe("/icon-192x192.png");
    expect(m.icons![1].src).toBe("/icon-512x512.png");
    expect(m.icons![2].src).toBe("/icon-maskable.png");
  });

  it("returns icons with correct sizes", () => {
    const m = manifest();
    expect(m.icons![0].sizes).toBe("192x192");
    expect(m.icons![1].sizes).toBe("512x512");
    expect(m.icons![2].sizes).toBe("512x512");
  });

  it("returns icons with correct purpose values", () => {
    const m = manifest();
    expect(m.icons![0].purpose).toBe("any");
    expect(m.icons![1].purpose).toBe("any");
    expect(m.icons![2].purpose).toBe("maskable");
  });

  it("returns a non-empty description string", () => {
    const m = manifest();
    expect(typeof m.description).toBe("string");
    expect(m.description!.length).toBeGreaterThan(0);
  });
});
