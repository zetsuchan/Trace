# TRACE — Submission Summary

TRACE is a sickle cell causal intelligence tool that traces symptoms to biological root causes across body systems. I built it because I have sickle cell disease, and no tool connects the dots my body forces me to — why cold weather led to congestion led to a pain crisis.

TRACE addresses Problem Statement 2: Break the Barriers. Expert hematology knowledge is locked behind specialist visits. TRACE puts causal reasoning directly in the patient's hands.

Three Claude agents power the pipeline. A Sonnet 4.5 Symptom Analyzer parses natural language into structured symptoms. An Opus 4.6 Causal Chain Builder uses extended thinking and tool use to trace pathophysiology chains, autonomously searching Exa and scraping FireCrawl for medical evidence. A Sonnet 4.5 Recommendation Agent generates urgency-rated suggestions.

Results render in three visualization modes: interactive branching cards, React Flow timeline graphs, and animated linear chain reveals. Six years of Apple Health data — 2.5 million records — provide personal baselines. Traces save to PostgreSQL and Obsidian via MCP integrations.

This is patient-centered AI.
