import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import type { SsmsConnection } from "./types";

function getUserSettingsPath(): string {
  const appData = process.env.APPDATA ?? join(homedir(), "AppData", "Roaming");
  return join(appData, "Microsoft", "SQL Server Management Studio", "18.0", "UserSettings.xml");
}

function extractTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return match?.[1] ?? "";
}

export function readAllConnections(): SsmsConnection[] {
  const xml = readFileSync(getUserSettingsPath(), "utf-8");

  const blocks = xml.split("<ServerConnectionSettings>");
  blocks.shift(); // Remove content before first match

  const seen = new Set<string>();
  const connections: SsmsConnection[] = [];

  for (const block of blocks) {
    const server = extractTag(block, "Instance");
    const userName = extractTag(block, "UserName");
    const authMethod = parseInt(extractTag(block, "AuthenticationMethod") || "0", 10);
    const database = extractTag(block, "Database") || undefined;

    if (!server) continue;

    const key = `${server}|${userName}|${database ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);

    connections.push({ server, userName, authMethod, database });
  }

  return connections.sort((a, b) => a.server.localeCompare(b.server));
}
