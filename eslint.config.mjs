import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[property.name='$queryRawUnsafe']",
          message: "Use Prisma parameterized queries or ORM methods instead of $queryRawUnsafe."
        },
        {
          selector: "MemberExpression[property.name='$executeRawUnsafe']",
          message: "Use Prisma parameterized queries or ORM methods instead of $executeRawUnsafe."
        }
      ]
    }
  },
  {
    ignores: [".next/**", "node_modules/**", "mobile-app/**", "public/sw.js", "next-env.d.ts"]
  }
];

export default eslintConfig;


