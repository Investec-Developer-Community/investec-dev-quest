# Windows Setup

Use this guide before your first game run on Windows.

---

## Prerequisites

1. Install Node.js 20+ from https://nodejs.org
2. Install pnpm:

```powershell
npm install -g pnpm
```

3. Verify tools:

```powershell
node -v
pnpm -v
```

---

## Clone and install

From your repo root:

```powershell
pnpm install
Copy-Item .env.example .env
```

---

## PowerShell execution policy fix (important)

If you see errors like:

- `... cannot be loaded because running scripts is disabled on this system`
- `PSSecurityException`

set your user-level execution policy:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then close and reopen your terminal.

Check the active policy:

```powershell
Get-ExecutionPolicy
```

`RemoteSigned`, `Bypass`, or `Unrestricted` usually work for local dev commands.
`Restricted` and `AllSigned` commonly block npm/pnpm script shims.

---

## First run checks

```powershell
pnpm game level 1 --season 1
pnpm game test
```

If the CLI detects a blocking PowerShell policy, it will stop early and print the exact fix command.

---

## Security note

`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` only changes policy for your current user profile, not the whole machine.
If your organization enforces policy via Group Policy, check with your admin.
