import { existsSync, readFileSync, readdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import type { SsmsConnection } from "./types";

function getSettingsRoot(): string {
  const appData = process.env.APPDATA ?? join(homedir(), "AppData", "Roaming");
  return join(appData, "Microsoft", "SQL Server Management Studio");
}

function findUserSettingsFiles(): string[] {
  const root = getSettingsRoot();
  if (!existsSync(root)) return [];

  return readdirSync(root)
    .filter((name) => /^\d+(\.\d+)*$/.test(name))
    .map((name) => ({
      path: join(root, name, "UserSettings.xml"),
      sortKey: name.split(".").map((n) => parseInt(n, 10)),
    }))
    .filter((v) => existsSync(v.path))
    .sort((a, b) => {
      for (let i = 0; i < Math.max(a.sortKey.length, b.sortKey.length); i++) {
        const diff = (b.sortKey[i] ?? 0) - (a.sortKey[i] ?? 0);
        if (diff !== 0) return diff;
      }
      return 0;
    })
    .map((v) => v.path);
}

function extractTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return match?.[1] ?? "";
}

// Each connection in UserSettings.xml is wrapped in:
//   <Element><Time><long>TICKS</long></Time><Item><ServerConnectionSettings>...
// SSMS stores -DateTime.Ticks, so the smallest (most negative) value is the
// most recently used connection.
const ELEMENT_RE =
  /<Element>\s*<Time>\s*<long>(-?\d+)<\/long>\s*<\/Time>\s*<Item>\s*<ServerConnectionSettings>([\s\S]*?)<\/ServerConnectionSettings>/g;

function parseFile(path: string): { conn: SsmsConnection; ticks: number }[] {
  const xml = readFileSync(path, "utf-8");
  const out: { conn: SsmsConnection; ticks: number }[] = [];

  for (const match of xml.matchAll(ELEMENT_RE)) {
    const ticks = Number(match[1]);
    const block = match[2];
    const server = extractTag(block, "Instance");
    if (!server) continue;

    out.push({
      ticks,
      conn: {
        server,
        userName: extractTag(block, "UserName"),
        authMethod: parseInt(
          extractTag(block, "AuthenticationMethod") || "0",
          10,
        ),
        database: extractTag(block, "Database") || undefined,
      },
    });
  }

  return out;
}

export function readAllConnections(): SsmsConnection[] {
  const files = findUserSettingsFiles();
  if (files.length === 0) {
    throw new Error(
      "No SSMS UserSettings.xml found. Has SSMS been launched at least once?",
    );
  }

  // Merge across versions; keep the entry with the most-recent timestamp per unique connection.
  const byKey = new Map<string, { conn: SsmsConnection; ticks: number }>();
  for (const file of files) {
    for (const entry of parseFile(file)) {
      const key = `${entry.conn.server}|${entry.conn.userName}|${entry.conn.database ?? ""}`;
      const prev = byKey.get(key);
      if (!prev || entry.ticks < prev.ticks) byKey.set(key, entry);
    }
  }

  return [...byKey.values()]
    .sort((a, b) => a.ticks - b.ticks)
    .map((e) => e.conn);
}
