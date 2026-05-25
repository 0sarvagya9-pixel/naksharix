# Panchang Activation Requirements

Naksharix Panchang is now allowed as a limited `provider_verified` public feature after deterministic regression fixtures passed against the selected internal provider. A static, seeded, or partially complete Panchang must not be presented as a production result. External accuracy claims still require trusted cross-check fixtures.

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
fixtures/generated/provider-panchang-fixtures.json
```

Each fixture must include date, timezone, latitude, longitude, place, source details, expected fields, and tolerance. Generated provider fixtures may be `provider_verified`; trusted cross-source fixtures must use `verified_external`. Fixtures with null expected values must remain `needs_external_validation`.

## Activation Checklist

1. Generate deterministic provider fixtures with `npm run fixtures:generate`.
2. Pass `npm run qa:provider-panchang`.
3. Keep `/api/panchang` on the real `calculatePremiumPanchang` path with date/location/timezone validation.
4. Keep `/panchang` limitation copy clear: provider verified, not external verified.
5. Mark fixtures `verified_external` only after cross-checking date, location, timezone, and ayanamsa/lunar calculation assumptions.
6. Make `npm run qa:ephemeris` assert external Panchang fixtures before stronger accuracy claims.
7. Add clear public limitation text whenever the UI is updated.

## Trusted Sources

- Swiss Ephemeris-backed Panchang output with reproducible configuration.
- Drik Panchang or equivalent only when exact date/location/timezone values are captured.
- Manual astrologer verification with source screenshots or exported values.

## Do Not Activate If

- Moonrise/moonset are unavailable without clear caveat.
- Rahu Kaal, Yamaganda, Gulika, or Abhijit are missing.
- Sunrise/sunset are approximate without documented tolerance.
- Tithi/nakshatra/yoga/karana are neither provider-verified nor externally verified.
- The same Panchang appears for different locations.
