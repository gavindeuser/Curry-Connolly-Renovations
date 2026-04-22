import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const nextBin = join(__dirname, "..", "node_modules", ".bin", process.platform === "win32" ? "next.cmd" : "next");

console.log("");
console.log("Local routes:");
console.log("  Skin + structure:  http://localhost:3000/");
console.log("  HVAC options:      http://localhost:3000/hvac");
console.log("");

const child = spawn(nextBin, ["dev"], {
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
