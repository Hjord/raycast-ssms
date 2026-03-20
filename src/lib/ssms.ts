import { existsSync } from "fs";
import { exec } from "child_process";
import { getPreferenceValues } from "@raycast/api";
import type { SsmsConnection } from "./types";

interface Preferences {
  ssmsPath?: string;
}

export const AUTH_LABELS: Record<number, string> = {
  0: "Windows Auth",
  1: "SQL Server Auth",
};

const DEFAULT_PATHS = [
  "C:\\Program Files (x86)\\Microsoft SQL Server Management Studio 18\\Common7\\IDE\\Ssms.exe",
  "C:\\Program Files\\Microsoft SQL Server Management Studio 18\\Common7\\IDE\\Ssms.exe",
  "C:\\Program Files (x86)\\Microsoft SQL Server Management Studio 19\\Common7\\IDE\\Ssms.exe",
  "C:\\Program Files\\Microsoft SQL Server Management Studio 19\\Common7\\IDE\\Ssms.exe",
  "C:\\Program Files (x86)\\Microsoft SQL Server Management Studio 20\\Common7\\IDE\\Ssms.exe",
  "C:\\Program Files\\Microsoft SQL Server Management Studio 20\\Common7\\IDE\\Ssms.exe",
];

export function findSsmsExe(): string | null {
  const prefs = getPreferenceValues<Preferences>();
  if (prefs.ssmsPath && existsSync(prefs.ssmsPath)) {
    return prefs.ssmsPath;
  }
  for (const p of DEFAULT_PATHS) {
    if (existsSync(p)) return p;
  }
  return null;
}

export function openConnection(conn: SsmsConnection, exePath: string): void {
  const args = [`-S "${conn.server}"`];
  if (conn.database) {
    args.push(`-d "${conn.database}"`);
  }
  if (conn.authMethod === 1 && conn.userName) {
    args.push(`-U "${conn.userName}"`);
  }
  exec(`"${exePath}" ${args.join(" ")}`);
}
