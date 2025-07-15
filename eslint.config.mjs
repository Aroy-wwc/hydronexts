// eslint.config.js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // This is the new configuration object for ignores
  {
    ignores: [
      "node_modules/",         // Standard: ignore installed packages
      ".next/",                // Standard: ignore Next.js build output
      "app/generated/prisma/", // <--- THIS IS THE CRUCIAL LINE FOR YOUR PRISMA CLIENT
      // Add any other directories or files you want ESLint to ignore, e.g.,
      // "dist/",
      // "build/",
    ],
  },
  // Your existing Next.js configurations
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;