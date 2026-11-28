import assert from "node:assert/strict";
import fs from "node:fs";

export function verifyPublishedAshtakavarga(calculate, reduce) {
  const receipts = [];
  const fixtures = JSON.parse(fs.readFileSync("fixtures/astrology/ashtakvarga-basic.json", "utf8"));
  assert.ok(fixtures.length >= 2, "published examples from both software packages");
  for (const fixture of fixtures) {
    const input = JSON.parse(fs.readFileSync(fixture, "utf8"));
    const planets = Object.keys(input.grahas).map(planet => ({planet, sign: input.referenceSigns[planet]}));
    const chart = calculate(planets, input.referenceSigns.Ascendant);
    const occupancy = planets.map(planet => planet.sign);
    const counts = {};
    const check = (kind, label, actual, expected) => {
      const values = Array.from(expected, Number);
      assert.equal(values.length, 12, label);
      assert.deepEqual(actual, values, `${input.title} / ${label}`);
      counts[kind] = (counts[kind] || 0) + values.length;
    };

    assert.equal(chart.method, "brihat_jataka_aiyar_raw");
    assert.equal(chart.scores.length, 7);
    for (const score of chart.scores) {
      const planet = score.planet;
      const published = input.grahas[planet];
      assert.equal(score.contributions.length, 8);
      for (const row of score.contributions) {
        check("prastara", `${planet} / ${row.reference}`, row.bindus, published.contributions[row.reference]);
      }
      check("bhinna", planet, score.bhinna, published.raw);
      if (published.trikona) {
        const reduced = reduce(score.bhinna, occupancy);
        check("trikona", `${planet} / Trikona`, reduced.trikona, published.trikona);
        check("ekadhipatya", `${planet} / Ekadhipatya`, reduced.ekadhipatya, published.ekadhipatya);
      }
    }
    check("sarva", "Sarva", chart.sarva, input.sarva);
    receipts.push({fixture, method: chart.method, counts});
  }
  return receipts;
}
