---
title: Cutting MTTR by 60% with an LLM incident-triage agent
date: 2026-05-12
category: AI & Operations
excerpt: How a curated incident memory plus on-demand Splunk queries took tier-1 triage from 45 minutes to 10.
---

When I joined the operations team at a Tier-1 payments provider, recurring incidents were eating the roster alive. The same five classes of failure came back week after week, and each one started from a blank Splunk search.

So we built an agent.

## The problem with runbooks

Runbooks rot. They describe the system as it was the day someone had time to write them down. The actual knowledge, *which query finds this failure, what the root cause turned out to be last time*, lived in people's heads and in closed tickets.

## What we built

The agent does two things well:

1. **Generates optimized Splunk queries on demand** from a plain-language description of the symptom.
2. **Cross-references a curated history** of past incidents and RCAs, so the on-call engineer sees "this looks like INC-4471 from March" before they start digging.

> The win wasn't replacing engineers. It was deleting the cold-start.

## Results

- ~70% of recurring incidents resolved near-automatically within three months
- MTTR on tier-1 triage dropped from ~45min to ~10min
- The team was freed for higher-severity, genuinely novel work

The lesson I keep coming back to: **agents are most valuable where the work is repetitive but the context is scattered.** Operations is exactly that.
