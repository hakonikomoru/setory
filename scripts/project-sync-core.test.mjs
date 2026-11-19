import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import prettier from "prettier";
import { describe, expect, it } from "vitest";

import { generateMetaLine, replaceMarkedSection, runSync } from "./project-sync-core.mjs";

const REPO_ROOT = join(import.meta.dirname, "..");
const PRETTIER_CONFIG_NAMES = [
  "prettier.config.mjs",
  "prettier.config.js",
  "prettier.config.cjs",
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.mjs",
];

// マーカーの外に「桁が揃っていない表」を置く。prettier を通せば必ず桁が揃うので、
// 整形を省いていないことの歯止めになる。
const DOC_TEMPLATE = `# テスト — Project Sync

> 説明の段落。

<!-- sync:auto:meta:start -->
旧い meta 行
<!-- sync:auto:meta:end -->

## 構成

<!-- sync:auto:directory-tree:start -->
旧いツリー
<!-- sync:auto:directory-tree:end -->

## 手で書く表

| パス | 種別 |
|------|------|
| \`src/index.ts\` | file |
`;

const SYNC_CONFIG = {
  repo: "hakonikomoru/test-repo",
  rootLabel: "test-repo",
  markers: ["meta", "directory-tree"],
  treeEntries: ["src"],
  treeMaxDepth: 2,
};

/** prettier 設定ごと一時リポジトリを作る */
function createFixtureRepo() {
  const root = mkdtempSync(join(tmpdir(), "project-sync-"));
  mkdirSync(join(root, "docs"), { recursive: true });
  mkdirSync(join(root, "src", "lib"), { recursive: true });
  writeFileSync(join(root, "src", "index.ts"), "export const a = 1;\n", "utf8");
  writeFileSync(
    join(root, "src", "lib", "very-long-file-name-for-alignment.ts"),
    "export const b = 2;\n",
    "utf8",
  );
  for (const name of PRETTIER_CONFIG_NAMES) {
    if (existsSync(join(REPO_ROOT, name))) {
      copyFileSync(join(REPO_ROOT, name), join(root, name));
      break;
    }
  }
  const docPath = join(root, "docs", "project-sync.md");
  writeFileSync(docPath, DOC_TEMPLATE, "utf8");
  return { root, docPath };
}

function syncOptions(root) {
  return { ...SYNC_CONFIG, root, docPath: "docs/project-sync.md" };
}

async function formatLikePrettier(text, docPath) {
  const options = (await prettier.resolveConfig(docPath)) ?? {};
  return prettier.format(text, { ...options, filepath: docPath, parser: "markdown" });
}

describe("runSync の出力と prettier の整形", () => {
  it("書き出した docs/project-sync.md は prettier の整形と一致する", async () => {
    const { root, docPath } = createFixtureRepo();

    expect(await runSync(syncOptions(root))).toBe(true);

    const written = readFileSync(docPath, "utf8");
    expect(written).toBe(await formatLikePrettier(written, docPath));
  });

  it("prettier を通さない生の生成結果とは違う（整形を省いていないことの歯止め）", async () => {
    const { root, docPath } = createFixtureRepo();

    expect(await runSync(syncOptions(root))).toBe(true);

    const written = readFileSync(docPath, "utf8");
    expect(written).not.toBe(replaceMarkedSection(DOC_TEMPLATE, "meta", "x"));
    // 表の区切り行が桁揃えされた跡
    expect(written).toMatch(/\| -{4,} \|/);
    // マーカー直後には空行が入る
    expect(written).toContain("<!-- sync:auto:meta:start -->\n\n");
  });

  it("2 回目の実行は中身が変わらない", async () => {
    const { root, docPath } = createFixtureRepo();

    expect(await runSync(syncOptions(root))).toBe(true);
    const first = readFileSync(docPath, "utf8");

    expect(await runSync(syncOptions(root))).toBe(true);
    expect(readFileSync(docPath, "utf8")).toBe(first);
  });

  it("--check は整形済みの出力なら通り、prettier で整形し直しても通る", async () => {
    const { root, docPath } = createFixtureRepo();

    expect(await runSync(syncOptions(root))).toBe(true);
    expect(await runSync(syncOptions(root), { check: true })).toBe(true);

    // `npm run format` 相当
    writeFileSync(
      docPath,
      await formatLikePrettier(readFileSync(docPath, "utf8"), docPath),
      "utf8",
    );
    expect(await runSync(syncOptions(root), { check: true })).toBe(true);
  });

  it("--check は中身が古いと落ちる", async () => {
    const { root, docPath } = createFixtureRepo();

    expect(await runSync(syncOptions(root))).toBe(true);
    writeFileSync(
      docPath,
      replaceMarkedSection(readFileSync(docPath, "utf8"), "directory-tree", "古いツリー\n"),
      "utf8",
    );
    expect(await runSync(syncOptions(root), { check: true })).toBe(false);
  });
});

describe("meta 行は実行のたびに変わらない", () => {
  it("commit ハッシュも生成日も入らない", () => {
    const line = generateMetaLine("hakonikomoru/test-repo");

    expect(line).toContain("`hakonikomoru/test-repo`");
    expect(line).not.toMatch(/\d{4}-\d{2}-\d{2}/); // 生成日
    expect(line).not.toMatch(/`[0-9a-f]{7,40}`/); // commit ハッシュ
    expect(line).toBe(generateMetaLine("hakonikomoru/test-repo"));
  });

  it("同期のあとにコミットして HEAD が変わっても --check が通る", async () => {
    const { root } = createFixtureRepo();
    const git = (...args) =>
      execFileSync(
        "git",
        [
          "-c",
          "user.email=t@example.com",
          "-c",
          "user.name=t",
          "-c",
          "commit.gpgsign=false",
          ...args,
        ],
        {
          cwd: root,
          stdio: "ignore",
          env: { ...process.env, HOME: root },
        },
      );

    git("init", "-q", "-b", "main");
    git("add", "-A");
    git("commit", "-q", "-m", "first");

    expect(await runSync(syncOptions(root))).toBe(true);
    expect(await runSync(syncOptions(root), { check: true })).toBe(true);

    git("add", "-A");
    git("commit", "-q", "-m", "second");

    expect(await runSync(syncOptions(root), { check: true })).toBe(true);
  });
});
