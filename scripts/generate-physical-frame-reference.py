"""Freeze independent nonlunar longitude and speed controls using Swiss Moshier."""
import calendar
import json
import random
from datetime import datetime, timezone
from pathlib import Path

import swisseph as swe

root = Path(__file__).resolve().parents[1] / "fixtures/astrology"
common = json.loads((root / "independent-dasha-lunar-frames.json").read_text())
cases = [{k: row[k] for k in ["id", "group", "utc", "local", "zone"]} for row in common["reference"]]
rng = random.Random(702613)
# Independent epochs chosen before examining any nonlunar error. Use UTC dates
# for this second reserve because civil boundary coverage is in the common set.
for i in range(24):
    year = 1907 + i * 8
    month = rng.randint(1, 12)
    day = rng.randint(1, calendar.monthrange(year, month)[1])
    utc = datetime(year, month, day, rng.randrange(24), rng.randrange(60), tzinfo=timezone.utc)
    cases.append(dict(id=f"physical-{i+1:02}", group="nonlunar_reserve", zone="UTC",
                      local=utc.strftime("%Y-%m-%d %H:%M"), utc=utc.strftime("%Y-%m-%dT%H:%M:%SZ")))

bodies = ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"]
flags = swe.FLG_MOSEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED
swe.set_sid_mode(swe.SIDM_LAHIRI)
for row in cases:
    utc = datetime.fromisoformat(row["utc"])
    jd = swe.julday(utc.year, utc.month, utc.day, utc.hour + utc.minute / 60 + utc.second / 3600)
    pairs = []
    for body in bodies:
        position, returned = swe.calc_ut(jd, getattr(swe, body.upper()), flags)
        assert returned & flags == flags
        pairs.append([round(position[0], 10), round(position[3], 10)])
    row["longitudeAndSpeed"] = pairs

out = root / "independent-physical-frame.json"
header = dict(source="Swiss/Moshier 2.10.03, Lahiri mode 1, geocentric apparent of date; calc_ut with longitude speed in degrees/day.",
              sourceURL="https://www.astro.com/swisseph/swephprg.htm", bindingVersion=swe.version,
              originalAngularToleranceDegrees=0.02, originalSpeedToleranceDegreesPerDay=0.02,
              reservedSeed=702613, planets=bodies)
# Keep each chart on one line for review and reproducible, compact diffs.
out.write_text(json.dumps(header, indent=2)[:-2] + ',\n  "reference": [\n' +
               ',\n'.join('    ' + json.dumps(row, separators=(',', ':')) for row in cases) + '\n  ]\n}\n')
