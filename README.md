# SSMS for Raycast

Search and launch your SQL Server Management Studio connections directly from Raycast.

![Search SSMS connections](metadata/ssms-1.png)

## Features

- **Search & filter** connections by server, username, or database
- **Most-recently-used first** — connections are sorted by SSMS's own last-used timestamp
- **Open in SSMS** — launches with the right server, database, and login pre-filled
- **Copy** server name (`⌘S`) or username (`⌘U`) to the clipboard
- Shows the authentication method and database for each connection
- Auto-detects SSMS 18/19/20 from the default install location, with a preference to override

## Requirements

- [SQL Server Management Studio](https://learn.microsoft.com/en-us/sql/ssms/) on Windows. SSMS must have been launched at least once so that `UserSettings.xml` exists.
- [Raycast for Windows](https://raycast.com/)

> Tested with **SSMS 18.x** on Windows 11. Newer versions (19/20) should also work — the extension scans every version folder under `%APPDATA%\Microsoft\SQL Server Management Studio\` and uses the most recent timestamp per connection.

## How it works

Connections are read from SSMS's settings file:

```
%APPDATA%\Microsoft\SQL Server Management Studio\<version>\UserSettings.xml
```

Each entry is parsed for server, authentication method, username, database, and last-used timestamp. Selecting one runs `Ssms.exe -S <server> [-d <database>] [-U <user>]`.

## Preferences

| Setting | Description |
| --- | --- |
| **SSMS Executable Path** | Optional. Set if `Ssms.exe` is not in the default Program Files location. |

## Development

```bash
git clone https://github.com/hjord/raycast-ssms.git
cd raycast-ssms
npm install
npm run dev
```
