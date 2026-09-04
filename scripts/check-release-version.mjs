import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

const packageJson = JSON.parse(
  await readFile(new URL("package.json", root), "utf8"),
);
const tauriConfig = JSON.parse(
  await readFile(new URL("src-tauri/tauri.conf.json", root), "utf8"),
);
const cargoToml = await readFile(
  new URL("src-tauri/Cargo.toml", root),
  "utf8",
);
const citation = await readFile(new URL("CITATION.cff", root), "utf8");

const cargoVersion = cargoToml.match(/^version = "([^"]+)"/m)?.[1];
const citationVersion = citation.match(/^version: ([^\s]+)$/m)?.[1];
const expected = packageJson.version;

const versions = {
  "package.json": expected,
  "src-tauri/tauri.conf.json": tauriConfig.version,
  "src-tauri/Cargo.toml": cargoVersion,
  "CITATION.cff": citationVersion,
};

const mismatches = Object.entries(versions).filter(
  ([, version]) => version !== expected,
);

if (mismatches.length > 0) {
  console.error(`Release version mismatch; expected ${expected}:`);
  for (const [file, version] of mismatches) {
    console.error(`- ${file}: ${version ?? "missing"}`);
  }
  process.exit(1);
}

console.log(`Release version is consistent: ${expected}`);
