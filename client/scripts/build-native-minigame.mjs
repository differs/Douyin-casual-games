import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const templateDir = path.join(root, "minigame-template");
const outputDir = path.join(root, "dist-minigame-native");

const appId = process.env.VITE_DOUYIN_APP_ID || "touristappid";
const adUnitId = process.env.VITE_DOUYIN_REWARDED_AD_UNIT_ID || "";
const apiBase = process.env.VITE_API_BASE || "http://127.0.0.1:8080/api";

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });
await copyDir(templateDir, outputDir);

const config = {
  appId,
  apiBase,
  rewardedAdUnitId: adUnitId,
};

await fs.writeFile(
  path.join(outputDir, "app.config.json"),
  `${JSON.stringify(config, null, 2)}\n`,
);

await fs.writeFile(
  path.join(outputDir, "project.config.json"),
  `${JSON.stringify(
    {
      projectname: "deep-sea-devour",
      appid: appId,
      compileType: "game",
      setting: {
        es6: true,
        minified: true,
      },
    },
    null,
    2,
  )}\n`,
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
