/** A complete A–Z spelling is required; never interpret only the ASCII fragment of a mixed-script name. */
export function isFullRomanNumerologyName(value:unknown):value is string {
  return typeof value==="string"&&/^[A-Za-z][A-Za-z .’'-]*$/.test(value.trim());
}
