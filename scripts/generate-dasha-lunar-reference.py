"""Freeze independently calculated UTC and Swiss/Moshier positions and fixed-year Vimshottari epochs."""
from datetime import datetime,timedelta,timezone
from zoneinfo import ZoneInfo
from pathlib import Path
from hashlib import sha256
import json,random,calendar,swisseph as swe
swe.set_sid_mode(swe.SIDM_LAHIRI)
YEARS=(7,20,6,10,7,18,16,19,17)
NAMES=('Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury')
anchor=(('Delhi','Asia/Kolkata','1992-05-18 08:15'),('London','Europe/London','1987-07-05 14:40'),('Kathmandu','Asia/Kathmandu','1998-12-21 22:55'))
zones=['America/New_York','Australia/Lord_Howe','Pacific/Chatham','Asia/Kathmandu','Europe/London','Asia/Kolkata','Australia/Adelaide','Asia/Tokyo','Pacific/Kiritimati','Europe/Paris','America/St_Johns','America/Sao_Paulo']
cases=[(n,z,t,'reproduction') for n,z,t in anchor]
for i,(z,t) in enumerate([('America/New_York','2024-03-10 01:59'),('America/New_York','2024-03-10 03:00'),('Australia/Lord_Howe','2024-10-06 01:59'),('Australia/Lord_Howe','2024-10-06 02:30'),('Pacific/Chatham','2024-09-29 02:44'),('Pacific/Chatham','2024-09-29 03:45'),('Europe/London','2024-10-27 00:59'),('Europe/London','2024-10-27 02:00'),('Pacific/Kiritimati','1994-12-30 23:59'),('Pacific/Kiritimati','1995-01-01 00:00'),('Asia/Kathmandu','1986-01-01 00:15'),('Asia/Kolkata','2000-02-29 12:00')]):cases.append((f'civil-{i+1}',z,t,'civil_boundary'))
# Draws and ranges frozen before inspection. Last 20 reserve a held-out slice.
rng=random.Random(26072017)
for i in range(72):
 year=rng.randrange(1905,2041);month=rng.randrange(1,13);day=rng.randrange(1,calendar.monthrange(year,month)[1]+1)
 hour,minute=rng.randrange(4,22),rng.randrange(60);zone=zones[i%len(zones)]
 local=datetime(year,month,day,hour,minute)
 # Historical seconds-granularity civil offsets are outside the minute-resolution API.
 if local.replace(tzinfo=ZoneInfo(zone)).utcoffset().total_seconds()%60:zone='Etc/UTC'
 cases.append((f'sampled-{i+1:03}',zone,local.strftime('%Y-%m-%d %H:%M'),'held_out' if i>=52 else 'development'))
# A further untouched holdout, chosen after the UTC->TT change, before evaluating
# any of these positions. One date per year, alternating hemispheres/time zones.
reserve=random.Random(472901)
for i in range(36):
 year=1906+i*3;month=reserve.randint(1,12);day=reserve.randint(1,calendar.monthrange(year,month)[1])
 local=datetime(year,month,day,reserve.randint(5,20),reserve.randrange(60));zone=zones[(5*i+2)%len(zones)]
 if local.replace(tzinfo=ZoneInfo(zone)).utcoffset().total_seconds()%60:zone='Etc/UTC'
 cases.append((f'final-{i+1:02}',zone,local.strftime('%Y-%m-%d %H:%M'),'untouched_final'))
# Independent distribution leap-second file (IANA/IERS). It supplies TT for
# civil UTC from 1972. Historic dates also retain a independent UT reference.
leaps=[]
for line in Path('/usr/share/zoneinfo/leap-seconds.list').read_text().splitlines():
 if not line or line.startswith('#'):continue
 ntp,tai=line.split()[:2]
 leaps.append((datetime(1900,1,1,tzinfo=timezone.utc)+timedelta(seconds=int(ntp)),int(tai)))
rows=[]
for name,z,t,group in cases:
 local=datetime.fromisoformat(t).replace(tzinfo=ZoneInfo(z));utc=local.astimezone(timezone.utc)
 assert utc.astimezone(ZoneInfo(z)).replace(tzinfo=None)==local.replace(tzinfo=None)
 jd=swe.julday(utc.year,utc.month,utc.day,utc.hour+utc.minute/60+utc.second/3600)
 tropical=swe.calc_ut(jd,swe.MOON,swe.FLG_MOSEPH)[0][0]
 mean_tropic=swe.calc_ut(jd,swe.MOON,swe.FLG_MOSEPH|swe.FLG_NONUT)[0][0]
 lon,returned=swe.calc_ut(jd,swe.MOON,swe.FLG_MOSEPH|swe.FLG_SIDEREAL)
 assert returned&swe.FLG_MOSEPH and returned&swe.FLG_SIDEREAL
 lunar=lon[0];index=int(lunar*27/360);lord=YEARS[index%9];frac=lunar*27/360-index
 first=utc-timedelta(days=frac*lord*365.2425)
 end=first+timedelta(days=lord*365.2425)
 ttMoon=None; ttSeconds=None
 if utc>=leaps[0][0]:
  ttSeconds=32.184+max(k for when,k in leaps if when<=utc)
  ttMoon=swe.calc(jd+ttSeconds/86400,swe.MOON,swe.FLG_MOSEPH|swe.FLG_SIDEREAL)[0][0]
 rows.append(dict(civilTtMoon=ttMoon,ttMinusUtc=ttSeconds,id=name,group=group,zone=z,local=t,utc=utc.isoformat(timespec='seconds').replace('+00:00','Z'),jdu=jd,meanAyanamsa=swe.get_ayanamsa_ut(jd),trueAyanamsa=swe.get_ayanamsa_ex_ut(jd,swe.FLG_MOSEPH)[1],tropical=tropical,tropicalMean=mean_tropic,moon=lunar,star=index+1,pada=int(lunar*108/360)%4+1,lord=NAMES[index%9],durationYears=lord,firstStartUtc=first.isoformat(timespec='milliseconds').replace('+00:00','Z'),firstEndUtc=end.isoformat(timespec='milliseconds').replace('+00:00','Z')))
out=Path(__file__).resolve().parents[1]/'fixtures/astrology/independent-dasha-lunar-frames.json'
d=dict(source='Swiss Ephemeris 2.10.03, Moshier, default Lahiri mode 1; separate Python timezone and 365.2425-day/120-year Dasha arithmetic. UTC-hour and leap-day conversion use Python Gregorian civil calendar. Birth epochs selected with fixed seed 26072017. Moon is geocentric; reference coordinates use the ecliptic of date.',sourceURL='https://www.astro.com/swisseph/swephprg.htm',referenceCount=len(rows),heldOut=20,untouchedFinal=36,reference=rows)
out.write_text(json.dumps(d,indent=2)+'\n')
print(sha256(out.read_bytes()).hexdigest(),len(rows))
