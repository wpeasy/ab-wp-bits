---
description: Create a WordPress Zip file for plugin installation
---

Create a WordPress plugin ZIP file with proper UNIX/Linux-compatible directory structure.

**What it does:**
- Creates ZIP file in `plugin/` subfolder with forward-slash paths for UNIX/Linux compatibility
- Uses permanent script: `create-plugin-zip.ps1` (included in plugin root)
- Includes all production files, excludes: .md files, node_modules, src-svelte, build configs, .git

**Steps:**
1. Execute the permanent PowerShell script: `create-plugin-zip.ps1`
2. Done! The script handles everything and outputs: `plugin/{plugin-name}-{plugin-version}.zip`

**Note:** The script automatically:
- Creates `plugin/` subfolder if needed
- Removes old ZIP files
- Converts all paths to forward slashes for UNIX/Linux
- Excludes plugin/ folder itself (prevents nested ZIPs)
- Names ZIP after current directory name
