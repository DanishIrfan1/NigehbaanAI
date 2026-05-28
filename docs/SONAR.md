# SonarQube / SonarCloud

## MCP (Cursor)

The SonarQube MCP server (`user-sonarqube`) is **not connected** in this workspace. To enable it:

1. Open **Cursor Settings → MCP** and add the SonarQube server.
2. Configure `SONAR_TOKEN` and host URL (SonarCloud: `https://sonarcloud.io`).
3. Reload Cursor; confirm `mcps/user-sonarqube/tools/` appears.

Until MCP is available, use SonarLint (connected in `.vscode/settings.json`) or the scanner below.

## Local scan (SonarCloud)

```bash
export SONAR_TOKEN=your_sonarcloud_token
make sonar-scan
```

Project key: `DanishIrfan1_NigehbaanAI` (see [`sonar-project.properties`](../sonar-project.properties)).

## Excluded from analysis

- `.agents/skills/` — markdown guidance only
- `scripts/legacy/` — baseline stub
- `agents/traces/` — runtime JSONL logs
- `mobile-app/`, `docs/`, `.venv*`

## Quick lint (no Sonar server)

```bash
pip install ruff
make lint
```
