#!/usr/bin/env node
import Ajv from "ajv";
import { readFileSync } from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// ✅ Load schema
const schemaPath = path.resolve(__dirname, "../config/stage.config.schema.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

// ✅ Load config (JS or JSON)
const configPath = path.resolve(__dirname, "../stage.config.js");
const config = (await import(configPath)).default;

// ✅ Validate
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

if (!validate(config)) {
    console.error("❌ stage.config.js validation failed:");
    console.error(validate.errors);
    process.exit(1);
}

console.log("✅ stage.config.js is valid.");
