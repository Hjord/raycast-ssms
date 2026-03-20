# SSMS for Raycast

Search and open your SQL Server Management Studio connections directly from Raycast.

## Features

- **Search & filter** connections by server name, username, or database
- **Open in SSMS** — launch directly with the right server and credentials
- **Copy** server name or username to clipboard
- Shows authentication method and database for each connection

## Prerequisites

- [SQL Server Management Studio](https://learn.microsoft.com/en-us/sql/ssms/) installed on Windows
- [Raycast](https://raycast.com/) for Windows

## Setup

```bash
git clone https://github.com/hjord/raycast-ssms.git
cd raycast-ssms
npm install
npx ray develop
```

## How It Works

The extension reads recent connections from the SSMS `UserSettings.xml` file located in:

```
%APPDATA%\Microsoft\SQL Server Management Studio\<version>\UserSettings.xml
```

Each connection's details (server, authentication method, username, database) are parsed and displayed in a searchable Raycast list. Selecting a connection launches SSMS with the appropriate command-line arguments.
