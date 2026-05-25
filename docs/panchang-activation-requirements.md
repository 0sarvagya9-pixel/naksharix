# Panchang Activation Requirements

Naksharix Panchang must remain Coming Soon until the calculation is externally verified. A static, seeded, or partially complete Panchang must not be presented as a production result.

## Required Inputs

- Date
- Location name
- Latitude
- Longitude
- Timezone

## Required Output Fields

- Date
- Location
- Timezone
- Sunrise
- Sunset
- Moonrise, if available from the verified engine
- Moonset, if available from the verified engine
- Tithi
- Nakshatra
- Yoga
- Karana
- Vaar
- Rahu Kaal
- Yamaganda
- Gulika Kaal
- Abhijit Muhurat

## Required Fixtures

Panchang fixtures live in:

```text
fixtures/astrology/panchang-accuracy-samples.json
```

Each fixture must include date, timezone, latitude, longitude, place, source details, expected fields, and tolerance. Fixtures with null expected values must remain `needs_external_validation`.

## Activation Checklist

1. Add trusted expected Panchang values from a reliable source.
2. Mark fixtures `verified_external` only after cross-checking date, location, timezone, and ayanamsa/lunar calculation assumptions.
3. Add a CI-safe Panchang comparison adapter.
4. Make `npm run qa:ephemeris` assert Panchang fixtures instead of skipping them.
5. Keep `/api/panchang` disabled until all required fields pass.
6. Keep `/panchang` noindex/Coming Soon until the API and UI are verified.
7. Add clear public limitation text when activated.

## Trusted Sources

- Swiss Ephemeris-backed Panchang output with reproducible configuration.
- Drik Panchang or equivalent only when exact date/location/timezone values are captured.
- Manual astrologer verification with source screenshots or exported values.

## Do Not Activate If

- Moonrise/moonset are unavailable without clear caveat.
- Rahu Kaal, Yamaganda, Gulika, or Abhijit are missing.
- Sunrise/sunset are approximate without documented tolerance.
- Tithi/nakshatra/yoga/karana are not externally verified.
- The same Panchang appears for different locations.
