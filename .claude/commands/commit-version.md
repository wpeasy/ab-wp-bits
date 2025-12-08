---
description: If this is a Wordpress plugin, increment the version, do an automatic Commit and Sync
---

**Version Bump and Commit Workflow**

This command automates the version increment and deployment process:

1. Increment the version by 0.0.1 in the main plugin file
2. If a package.json exists, update its version to match the plugin version
3. Update CHANGELOG.md, adding the new version with notes on significant fixes, changes, and new features
4. If it makes sense to do so, add additional notes to CLAUDE.md
5. Run /zip-plugin
6. Do a GIT commit with a meaningful but short message
7. Sync GIT to the repo
