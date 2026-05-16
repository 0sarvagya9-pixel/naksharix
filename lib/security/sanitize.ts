const dangerousHtmlPattern = /<\s*\/?\s*(script|iframe|object|embed|link|style|meta|base)[^>]*>/gi;
const eventHandlerPattern = /\son[a-z]+\s*=\s*(['"]).*?\1/gi;
const javascriptUrlPattern = /javascript\s*:/gi;

export function sanitizeString(value: string) {
  return value
    .replace(dangerousHtmlPattern, "")
    .replace(eventHandlerPattern, "")
    .replace(javascriptUrlPattern, "")
    .trim();
}

export function sanitizeInput<T>(value: T): T {
  if (typeof value === "string") return sanitizeString(value) as T;
  if (Array.isArray(value)) return value.map((item) => sanitizeInput(item)) as T;
  if (value && typeof value === "object" && value.constructor === Object) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeInput(item)])) as T;
  }
  return value;
}
