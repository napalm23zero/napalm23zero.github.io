---
title: Owning the contract: API design for banking compliance
date: 2026-03-04
category: Engineering
excerpt: Notes on designing RESTful APIs for fiscal and accounting compliance across Brazil and LATAM — and why being the contract owner matters.
---

Compliance APIs are unglamorous and unforgiving. Get the contract wrong and you don't get a bug report — you get a regulator.

## OpenAPI first, code second

Every endpoint started as an OpenAPI definition reviewed with the downstream teams *before* a single handler was written. The spec is the negotiation surface. When the contract is the artifact everyone signs off on, integration stops being a surprise.

## Being the contract owner

Across cross-functional teams, someone has to own the shape of the thing. That was me. It meant:

- Saying no to convenient-but-leaky fields
- Versioning deliberately, never silently
- Treating backward compatibility as a feature, not an afterthought

```json
{
  "transactionId": "uuid",
  "fiscalDocument": { "type": "NFe", "status": "authorized" },
  "compliance": { "jurisdiction": "BR", "ruleset": "2026.1" }
}
```

## The payoff

Clean contracts make systems boring in the best way. Downstream teams integrate without a war room, and the audit trail writes itself.
