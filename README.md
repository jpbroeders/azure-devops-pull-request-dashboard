# Pull Request Dashboard

**Cross-project PR overview for Azure DevOps. All your PRs in one place.**

## What is this?

An Azure DevOps extension that shows pull requests from ALL projects in a single dashboard. No more hopping between projects to find PRs that need your review.

## Features

- **Needs My Review** - PRs where you're a reviewer (not yet voted)
- **Created by Me** - Your open PRs across all projects
- **All PRs** - Complete overview of all active PRs
- **Project Filter** - Focus on specific projects
- **Direct Links** - One click to open PR in Azure DevOps

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.3 | UI Framework |
| Fluent UI v9 | 9.54+ | Microsoft Design System |
| Azure DevOps SDK | 4.0+ | Extension API |
| Webpack | 5.x | Build Tool |
| TypeScript | 5.5+ | Type Safety |

## Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Package as .vsix
npm run package
```

## Project Structure

```
azure-devops-pull-request-dashboard/
├── src/
│   ├── main.tsx              # Entry point + SDK init
│   ├── App.tsx               # Main component
│   ├── types.ts              # TypeScript types
│   ├── version.ts            # Version info
│   ├── components/
│   │   ├── PRDashboard.tsx   # Dashboard with tabs
│   │   └── PRCard.tsx        # PR card component
│   └── services/
│       └── azureDevOps.ts    # Azure DevOps API
├── vss-extension.json        # Extension manifest
├── webpack.config.js         # Webpack configuration
└── package.json
```

## Permissions

The extension requires:
- `vso.code` - Read source code and PRs
- `vso.project` - Read project info

---

*Published by FreelyIT*
