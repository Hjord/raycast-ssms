import {
  Action,
  ActionPanel,
  closeMainWindow,
  Icon,
  List,
  openExtensionPreferences,
  showToast,
  Toast,
} from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useEffect } from "react";
import { readAllConnections } from "./lib/user-settings";
import { authLabel, findSsmsExe, openConnection } from "./lib/ssms";
import type { SsmsConnection } from "./lib/types";

function ConnectionListItem({
  conn,
  exePath,
}: {
  conn: SsmsConnection;
  exePath: string | null;
}) {
  return (
    <List.Item
      title={conn.server}
      subtitle={authLabel(conn.authMethod)}
      keywords={[conn.server, conn.userName, conn.database ?? ""]}
      accessories={[
        conn.userName ? { text: conn.userName, icon: Icon.Person } : {},
        conn.database ? { text: conn.database, icon: Icon.HardDrive } : {},
      ].filter((a) => a.text)}
      actions={
        <ActionPanel>
          {exePath ? (
            <Action
              title="Open in Ssms"
              icon={Icon.ArrowRight}
              onAction={async () => {
                openConnection(conn, exePath);
                await closeMainWindow();
              }}
            />
          ) : (
            <Action
              title="Set Ssms Path in Preferences"
              icon={Icon.Gear}
              onAction={openExtensionPreferences}
            />
          )}
          <Action.CopyToClipboard
            title="Copy Server Name"
            content={conn.server}
            shortcut={{ modifiers: ["cmd"], key: "s" }}
          />
          {conn.userName && (
            <Action.CopyToClipboard
              title="Copy Username"
              content={conn.userName}
              shortcut={{ modifiers: ["cmd"], key: "u" }}
            />
          )}
        </ActionPanel>
      }
    />
  );
}

export default function SearchConnections() {
  const exePath = findSsmsExe();
  const {
    data: connections,
    isLoading,
    error,
  } = usePromise(async () => readAllConnections());

  useEffect(() => {
    if (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to load connections",
        message: String(error),
      });
    }
  }, [error]);

  useEffect(() => {
    if (!exePath) {
      showToast({
        style: Toast.Style.Failure,
        title: "SSMS not found",
        message: "Set the path in extension preferences",
      });
    }
  }, [exePath]);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search connections...">
      {(connections ?? []).map((conn) => (
        <ConnectionListItem
          key={`${conn.server}|${conn.userName}|${conn.database ?? ""}`}
          conn={conn}
          exePath={exePath}
        />
      ))}
    </List>
  );
}
