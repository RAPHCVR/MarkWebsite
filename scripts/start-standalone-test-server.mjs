import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const standaloneDir = join(root, ".next", "standalone");

function copyDirectory(source, destination) {
  if (!existsSync(source)) {
    throw new Error(`Missing required standalone asset source: ${source}`);
  }

  rmSync(destination, { recursive: true, force: true });
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
}

copyDirectory(join(root, ".next", "static"), join(standaloneDir, ".next", "static"));
copyDirectory(join(root, "public"), join(standaloneDir, "public"));

process.env.PORT ||= "3100";
process.env.HOSTNAME ||= "127.0.0.1";
process.chdir(standaloneDir);

await import(pathToFileURL(join(standaloneDir, "server.js")).href);
