/** Internal qualification evidence. A numerical comparison is not an expert
 * approval, and inherited house errors are not independent formula failures.
 * The original acceptance tolerance is deliberately not caller-configurable.
 */
export const STRENGTH_REFERENCE_TOLERANCE_VIRUPAS = 0.25;
export const REFERENCE_GRAHAS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;
export const PLANET_COMPONENTS = ["sthana", "dig", "kala", "cheshta", "naisargika", "drik", "total"] as const;
export const HOUSE_COMPONENTS = ["lord", "direction", "aspect", "total"] as const;
type Graha = typeof REFERENCE_GRAHAS[number];
type PlanetComponent = typeof PLANET_COMPONENTS[number];
type HouseComponent = typeof HOUSE_COMPONENTS[number];
export type StrengthReferenceSnapshot = {
  planets: Record<PlanetComponent, readonly number[]>;
  houses: Record<HouseComponent, readonly number[]>;
  houseLords: readonly Graha[];
};
type Comparison = {
  id: string; scope: "planet" | "house"; point: Graha | number;
  component: PlanetComponent | HouseComponent;
  actual: number; expected: number; delta: number; pass: boolean;
  dependencies: string[]; rootDiscrepancies: string[];
  disposition: "matched" | "primary" | "inherited" | "unattributed_composite";
};

function validate(snapshot: StrengthReferenceSnapshot) {
  for (const [kind, keys, size] of [
    ["planets", PLANET_COMPONENTS, 7], ["houses", HOUSE_COMPONENTS, 12]
  ] as const) {
    for (const key of keys) {
      const values = (snapshot?.[kind] as Record<string, unknown>)?.[key];
      if (!Array.isArray(values) || values.length !== size || !values.every(Number.isFinite)) {
        throw Error(`INCOMPLETE_STRENGTH_REFERENCE:${kind}/${key}`);
      }
    }
  }
  if (!Array.isArray(snapshot.houseLords) || snapshot.houseLords.length !== 12 ||
    !snapshot.houseLords.every(g => REFERENCE_GRAHAS.includes(g))) {
    throw Error("INCOMPLETE_STRENGTH_REFERENCE:houseLords");
  }
}

/** Residual attribution follows the actual sum and lord dependencies. It never
 * substitutes reference values into a calculation or removes failed cells.
 * A source printed to two decimals may have at most (n+1)*0.005 error in a sum.
 */
export function qualifyStrengthReference(actual: StrengthReferenceSnapshot, expected: StrengthReferenceSnapshot) {
  validate(actual); validate(expected);
  const rows: Comparison[] = [];
  const byId = new Map<string, Comparison>();
  const sourceConsistency: {id: string; actualResidual: number; sourceResidual: number; sourceRoundingBound: number;
    actualSumMatches: boolean; sourceSumMatches: boolean; lordIdentityMatches: boolean; pass: boolean}[] = [];
  function add(scope: "planet" | "house", point: Graha | number, component: PlanetComponent | HouseComponent,
    value: number, reference: number, dependencies: string[] = []) {
    const id = `${scope}/${point}/${component}`;
    const row: Comparison = {id, scope, point, component, actual: value, expected: reference,
      delta: value - reference, pass: Math.abs(value - reference) <= STRENGTH_REFERENCE_TOLERANCE_VIRUPAS,
      dependencies, rootDiscrepancies: [], disposition: "matched"};
    rows.push(row); byId.set(id, row);
  }
  for (const [i, g] of REFERENCE_GRAHAS.entries()) {
    for (const key of PLANET_COMPONENTS) {
      add("planet", g, key, actual.planets[key][i], expected.planets[key][i],
        key === "total" ? PLANET_COMPONENTS.filter(k => k !== "total").map(k => `planet/${g}/${k}`) : []);
    }
  }
  for (let i = 0; i < 12; i++) {
    for (const key of HOUSE_COMPONENTS) {
      const dependencies = key === "lord" ? [`planet/${actual.houseLords[i]}/total`] :
        key === "total" ? ["lord", "direction", "aspect"].map(k => `house/${i + 1}/${k}`) : [];
      add("house", i + 1, key, actual.houses[key][i], expected.houses[key][i], dependencies);
    }
  }
  for (const row of rows) {
    let consistent = true;
    if (row.dependencies.length) {
      const dependencies = row.dependencies.map(id => byId.get(id)!);
      const actualResidual = row.actual - dependencies.reduce((sum, r) => sum + r.actual, 0);
      const sourceDependencies = row.scope === "house" && row.component === "lord" ?
        [byId.get(`planet/${expected.houseLords[Number(row.point) - 1]}/total`)!] : dependencies;
      const sourceResidual = row.expected - sourceDependencies.reduce((sum, r) => sum + r.expected, 0);
      const sourceRoundingBound = (dependencies.length + 1) * 0.005 + 1e-9;
      const sameLord = row.scope !== "house" || row.component !== "lord" ||
        actual.houseLords[Number(row.point) - 1] === expected.houseLords[Number(row.point) - 1];
      const actualSumMatches = Math.abs(actualResidual) <= 1e-8;
      const sourceSumMatches = Math.abs(sourceResidual) <= sourceRoundingBound;
      consistent = sameLord && actualSumMatches && sourceSumMatches;
      sourceConsistency.push({id: row.id, actualResidual, sourceResidual, sourceRoundingBound,
        actualSumMatches, sourceSumMatches, lordIdentityMatches: sameLord, pass: consistent});
    }
    if (row.pass) continue;
    if (!row.dependencies.length) {
      row.disposition = "primary"; row.rootDiscrepancies = [row.id];
    } else {
      const roots = [...new Set(row.dependencies.flatMap(id => byId.get(id)!.rootDiscrepancies))];
      if (consistent && roots.length) {
        row.disposition = "inherited"; row.rootDiscrepancies = roots;
      } else {
        row.disposition = "unattributed_composite"; row.rootDiscrepancies = [row.id];
      }
    }
  }
  const failures = rows.filter(r => !r.pass);
  const primary = failures.filter(r => r.disposition === "primary");
  const inherited = failures.filter(r => r.disposition === "inherited");
  const unattributed = failures.filter(r => r.disposition === "unattributed_composite");
  const inconsistentSums = sourceConsistency.filter(r => !r.pass);
  const numericalParity = failures.length === 0 && inconsistentSums.length === 0;
  return {
    toleranceVirupas: STRENGTH_REFERENCE_TOLERANCE_VIRUPAS,
    compared: rows.length, passed: rows.length - failures.length, failed: failures.length,
    primaryDiscrepancies: primary.length, inheritedDiscrepancies: inherited.length,
    unattributedDiscrepancies: unattributed.length, inconsistentSums: inconsistentSums.length,
    numericalParity, qualification: numericalParity ? "NUMERICAL_PARITY_ONLY" as const : "BLOCKED" as const,
    publicEnabled: false as const, expertCertified: false as const,
    primary, inherited, unattributed, rows, sourceConsistency
  };
}
