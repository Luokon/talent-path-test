import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const client = join(root, "dist", "client");
const server = join(root, "dist", "server");
const output = join(root, "pages-output");
const modules = join(output, "_worker_modules");

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(client, output, { recursive: true });
mkdirSync(modules, { recursive: true });
cpSync(server, modules, {
  recursive: true,
  filter(source) {
    const relative = source.slice(server.length + 1).replaceAll("\\", "/");
    return !["wrangler.json", ".wrangler", ".vite"].some(
      (entry) => relative === entry || relative.startsWith(`${entry}/`),
    );
  },
});

writeFileSync(join(output, "_worker.js"), 'export { default } from "./_worker_modules/index.js";');
writeFileSync(
  join(output, "_routes.json"),
  JSON.stringify({ version: 1, include: ["/*"], exclude: ["/_next/static/*", "/favicon.svg"] }),
);

if (!readFileSync(join(output, "_worker.js"), "utf8").includes("_worker_modules/index.js")) {
  throw new Error("Pages Worker entry was not created correctly");
}
