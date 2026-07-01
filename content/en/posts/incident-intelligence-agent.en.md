---
title: Killing the cold-start in incident triage with an LLM-assisted tool
date: 2026-05-12
category: AI & Operations
excerpt: How a curated incident memory plus on-demand Splunk queries took average tier-1 triage from about an hour to about twenty minutes.
---

When I joined the operations team at a Tier-1 payments provider, recurring incidents were eating the roster alive. The same five classes of failure came back week after week, and each one started from a blank Splunk search.

So, on my own initiative, I built a tool (and later taught the team to use it).

## The problem with runbooks

Runbooks rot. They describe the system as it was the day someone had time to write them down. The actual knowledge, *which query finds this failure, what the root cause turned out to be last time*, lived in people's heads and in closed tickets.

## What I built

An LLM-assisted triage tool, running over the internal GitHub Copilot API and a curated, indexed knowledge base of past incidents and RCAs. It does two things well:

1. **Generates Splunk queries on demand** from a plain-language description of the symptom.
2. **Surfaces related prior incidents**, so the on-call engineer sees "this looks like INC-4471 from March" before they start digging.

> The tool investigates and recommends. A human decides and acts. The win wasn't replacing engineers, it was deleting the cold-start.

## Results

- Average triage time dropped from ~1h to ~20min (based on JIRA metrics)
- The scattered incident memory became searchable instead of tribal
- The team was freed for higher-severity, genuinely novel work

The lesson I keep coming back to: **LLM assistance is most valuable where the work is repetitive but the context is scattered.** Operations is exactly that.
