# Agent trace logs are written here by agents/orchestrator.py at runtime.
# Each line is a JSON object (JSONL format) containing:
#   ts          – UTC timestamp
#   signal_id   – UUID of the incoming signal
#   agent       – orchestrator | detector | planner | executor
#   event       – pipeline stage label
#   ... additional agent-specific fields

# This file is intentionally left empty at init time.
# It will be populated when the orchestrator processes its first signal.
# Submit this file as part of the Antigravity trace evidence [cite: 391].
