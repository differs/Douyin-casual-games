import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const shellDir = path.join(root, "dist-minigame");
const shellWebDir = path.join(shellDir, "web");

await fs.rm(shellDir, { recursive: true, force: true });
await fs.mkdir(shellWebDir, { recursive: true });
await copyDir(distDir, shellWebDir);

await fs.writeFile(
  path.join(shellDir, "game.js"),
  `// Placeholder shell for Douyin Mini Game packaging.\n// Current playable build lives in ./web and should be migrated to native minigame runtime next.\nconsole.log("Deep Sea shell prepared");\n`,
);

await fs.writeFile(
  path.join(shellDir, "game.json"),
  JSON.stringify(
    {
      deviceOrientation: "portrait",
      networkTimeout: {
        request: 10000,
      },
    },
    null,
    2,
  ),
);

await fs.writeFile(
  path.join(shellDir, "project.config.json"),
  JSON.stringify(
    {
      projectname: "deep-sea-devour",
      appid: "touristappid",
      compileType: "game",
      setting: {
        es6: true,
        minified: true,
      },
    },
    null,
    2,
  ),
);

await fs.writeFile(
  path.join(shellDir, "README.md"),
  [
    "# Mini Game Shell",
    "",
    "This directory provides Douyin Mini Game root files:",
    "- game.js",
    "- game.json",
    "- project.config.json",
    "",
    "Current gameplay build is copied into `web/` as a transitional shell.",
    "Next step is replacing the web runtime with native minigame rendering APIs or a Cocos export.",
    "",
  ].join("\n"),
);

async function copyDir(from, to) {
  const entries = await fs.readdir(from, { withFileTypes: true });
  for (const entry of entries) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) {
      await fs.mkdir(target, { recursive: true });
      await copyDir(source, target);
    } else {
      await fs.copyFile(source, target);
    }
  }
}
