const { execSync } = require("child_process");
const { existsSync, rmSync, mkdirSync, readdirSync, copyFileSync } = require("fs");
const { join } = require("path");

const tempOutput = "C:\\Temp\\iris-builder-output";
const distOutput = join(process.cwd(), "dist");
const publish = process.argv.includes("--publish");

if (existsSync(tempOutput)) {
  console.log(`Removing existing temp output: ${tempOutput}`);
  rmSync(tempOutput, { recursive: true, force: true });
}

console.log("Running app build...");
execSync("npm run build", { stdio: "inherit" });

const publishArgs = publish ? " --publish always" : "";
const builderCmd = `set "PATH=%SystemRoot%\\system32;%PATH%" && set "ComSpec=%SystemRoot%\\system32\\cmd.exe" && electron-builder --win nsis${publishArgs}`;
console.log(`Running electron-builder: ${builderCmd}`);
execSync(builderCmd, { stdio: "inherit", shell: true });

mkdirSync(distOutput, { recursive: true });
for (const file of readdirSync(tempOutput)) {
  if (file.endsWith(".exe") || file.endsWith(".blockmap")) {
    const src = join(tempOutput, file);
    const dest = join(distOutput, file);
    copyFileSync(src, dest);
    console.log(`Copied ${file} -> dist`);
  }
}

console.log(`Build complete. Installer files copied to ${distOutput}`);
