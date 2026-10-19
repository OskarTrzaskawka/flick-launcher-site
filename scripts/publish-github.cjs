// Uses the existing Git Credential Manager session. Credentials stay in process memory.
// Run intentionally: this creates a PUBLIC repository if it does not already exist.
const { spawnSync } = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");
const directory = path.resolve(__dirname, "..");
const repoName = "flick-launcher-site";
function git(args) {
  const r = spawnSync("git", args, {
    cwd: directory,
    encoding: "utf8",
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GCM_INTERACTIVE: "Never" },
  });
  if (r.status !== 0)
    throw Error(
      `Git ${args[0]} failed: ${r.stderr.replace(/https:\/\/[^\s]+@/g, "https://[redacted]@").slice(-1000)}`,
    );
  return r.stdout.trim();
}

async function publish() {
  const r = spawnSync("git", ["credential", "fill"], {
    cwd: directory,
    input: "protocol=https\nhost=github.com\nusername=KaivskyDev\n\n",
    encoding: "utf8",
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GCM_INTERACTIVE: "Never" },
  });
  if (r.status !== 0) throw Error("No saved GitHub credential is available.");
  const values = Object.fromEntries(
    r.stdout
      .trim()
      .split("\n")
      .map((line) => {
        const i = line.indexOf("=");
        return [line.slice(0, i), line.slice(i + 1)];
      }),
  );
  const headers = {
    Authorization: "Bearer " + values.password,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "FlickLauncher-Site",
  };
  async function request(route, method = "GET", body) {
    const response = await fetch("https://api.github.com" + route, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    const json = text ? JSON.parse(text) : {};
    return { status: response.status, json };
  }
  const user = await request("/user");
  if (user.status !== 200) throw Error("Saved GitHub authentication was rejected.");
  const owner = user.json.login;
  if (owner !== "OskarTrzaskawka")
    throw Error("The active GitHub account changed; refusing publication.");
  const route = `/repos/${owner}/${repoName}`;
  let repository = await request(route);
  if (repository.status === 404) {
    repository = await request("/user/repos", "POST", {
      name: repoName,
      description:
        "Independent Flick Launcher project website — features, development status and screenshots.",
      private: false,
      auto_init: false,
      has_issues: true,
    });
    if (repository.status !== 201)
      throw Error(`Repository creation failed (${repository.status}): ${repository.json.message}`);
    await fs.writeFile(
      path.join(directory, "artifacts", "repository.json"),
      JSON.stringify({ owner, name: repoName, url: repository.json.html_url }, null, 2),
    );
  } else if (repository.status === 200) {
    try {
      const known = JSON.parse(
        await fs.readFile(path.join(directory, "artifacts", "repository.json"), "utf8"),
      );
      if (known.url !== repository.json.html_url) throw Error();
    } catch {
      throw Error(
        "A repository with this name already exists and was not created by this checkout. No files were changed remotely.",
      );
    }
  } else throw Error(`Repository lookup failed (${repository.status}).`);
  await fs.writeFile(
    path.join(directory, "site", "config.json"),
    JSON.stringify(
      {
        repository: `https://github.com/${owner}/${repoName}`,
        issues: `https://github.com/${owner}/${repoName}/issues`,
      },
      null,
      2,
    ) + "\n",
  );
  const web = `https://${owner.toLowerCase()}.github.io/${repoName}/`;
  const readme = await fs.readFile(path.join(directory, "README.md"), "utf8");
  if (!readme.includes(web))
    await fs.writeFile(
      path.join(directory, "README.md"),
      readme +
        `\n## Published project\n\nWebsite: ${web}\n\nRepository: https://github.com/${owner}/${repoName}\n`,
    );
  try {
    await fs.access(path.join(directory, ".git"));
  } catch {
    git(["init", "-b", "main"]);
    git(["remote", "add", "origin", `https://github.com/${owner}/${repoName}.git`]);
  }
  if (git(["remote", "get-url", "origin"]) !== `https://github.com/${owner}/${repoName}.git`)
    throw Error("Unexpected Git remote.");
  git(["add", "--", ".github", ".gitignore", "LICENSE", "README.md", "site", "scripts"]);
  git([
    "-c",
    "user.name=" + owner,
    "-c",
    `user.email=${user.json.id}+${owner}@users.noreply.github.com`,
    "commit",
    "-m",
    "Create Flick Launcher project website for GitHub Pages",
  ]);
  git(["-c", "credential.username=KaivskyDev", "push", "-u", "origin", "main"]);
  let pages = await request(route + "/pages");
  if (pages.status === 404)
    pages = await request(route + "/pages", "POST", { build_type: "workflow" });
  if (![200, 201].includes(pages.status))
    throw Error(
      `Files pushed, but Pages configuration failed (${pages.status}): ${pages.json.message}`,
    );
  await request(route, "PATCH", { homepage: pages.json.html_url || web });
  console.log(
    JSON.stringify({
      repository: `https://github.com/${owner}/${repoName}`,
      website: pages.json.html_url || web,
      commit: git(["rev-parse", "HEAD"]),
      pagesStatus: pages.json.status || "configured",
    }),
  );
}
publish().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
