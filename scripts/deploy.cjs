const { spawnSync } = require("node:child_process");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
function git(args) {
  const result = spawnSync("git", args, {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  });
  if (result.status !== 0) throw Error(result.stderr.trim() || "Git command failed.");
  return result.stdout.trim();
}
try {
  const remote = git(["remote", "get-url", "origin"]);
  if (remote !== "https://github.com/OskarTrzaskawka/flick-launcher-site.git")
    throw Error("Unexpected remote; check the repository before deploying.");
  git(["add", "--", "site"]);
  if (git(["diff", "--cached", "--name-only"]))
    git(["commit", "-m", "Update Flick Launcher website"]);
  git(["push", "origin", "main"]);
  const commit = git(["subtree", "split", "--prefix", "site"]);
  git(["push", "origin", `${commit}:gh-pages`]);
  console.log("Website files pushed to gh-pages. Check GitHub Pages for deployment status.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
