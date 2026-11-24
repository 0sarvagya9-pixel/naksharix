"""Optional offline fixture regeneration; not a production dependency."""
from pathlib import Path
import datetime as dt
import json
import swisseph as swe

root = Path(__file__).resolve().parents[1]
cases = json.loads((root / "fixtures/generated/provider-kundli-fixtures.json").read_text())
swe.set_sid_mode(swe.SIDM_LAHIRI)
flags = swe.FLG_MOSEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED
bodies = dict(zip(("Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu"),
                  (swe.SUN,swe.MOON,swe.MARS,swe.MERCURY,swe.JUPITER,swe.VENUS,swe.SATURN,swe.MEAN_NODE)))
for case in cases:
    i = case["input"]
    utc = dt.datetime.fromisoformat(i["date"]+"T"+i["time"]+i["timezone"]).astimezone(dt.timezone.utc)
    jd = swe.julday(utc.year,utc.month,utc.day,utc.hour+utc.minute/60+utc.second/3600)
    vals = {"ascendant": swe.houses_ex(jd,i["latitude"],i["longitude"],b"W",swe.FLG_SIDEREAL)[1][0]}
    for name, body in bodies.items():
        data, used = swe.calc_ut(jd, body, flags)
        assert used & swe.FLG_MOSEPH and used & swe.FLG_SIDEREAL
        vals[name] = data[0]
    vals["Ketu"] = (vals["Rahu"]+180)%360
    print(json.dumps({"id":case["id"],"longitudeDegrees":{k:round(v,6) for k,v in vals.items()}}))
