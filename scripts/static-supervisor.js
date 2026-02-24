import { execSync } from "child_process";
import fs from "fs";
import "./static-server.js";
import { startGitPoll } from "./git-poll.js";

const BRANCH = process.env.PREVIEW_BRANCH || "main";
const REPO_URL = process.env.REPO_URL;
const CWD = "/app";

process.chdir(CWD); // 🔑 FORCE cwd

if (!REPO_URL) {
  console.error("[supervisor] REPO_URL env var is required");
  process.exit(1);
}

function run(cmd, inherit = true) {
  const result = execSync(cmd, {
    cwd: CWD,
    stdio: inherit ? "inherit" : "pipe",
  });

  if (inherit) return "";
  return result.toString().trim();
}

console.log("[supervisor] ensuring git repo");

if (!fs.existsSync(".git")) {
  run("git init");
  run(`git remote add origin ${REPO_URL}`);
} else {
  try {
    const currentUrl = run("git remote get-url origin", false);
    if (currentUrl !== REPO_URL) {
      run(`git remote set-url origin ${REPO_URL}`);
    }
  } catch {
    run(`git remote add origin ${REPO_URL}`);
  }
}

run(`git fetch origin ${BRANCH} --depth=1 --prune`);
run(`git reset --hard origin/${BRANCH}`);
run("git clean -fd");

console.log("[supervisor] static preview running on :8080");

// 🔑 start polling ONLY after git is ready
startGitPoll();
