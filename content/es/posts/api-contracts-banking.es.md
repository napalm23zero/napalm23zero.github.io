---
title: Dueño del contrato: diseño de APIs para compliance bancario
date: 2026-03-04
category: Ingeniería
excerpt: Notas sobre diseñar APIs RESTful para compliance fiscal y contable en Brasil y LATAM, y por qué ser dueño del contrato importa.
---

Las APIs de compliance no tienen glamour y no perdonan. Equivócate en el contrato y no recibes un reporte de bug, recibes un regulador.

## OpenAPI primero, código después

Cada endpoint empezó como una definición OpenAPI revisada con los equipos consumidores *antes* de escribir una sola línea de handler. La spec es la superficie de negociación. Cuando el contrato es el artefacto que todos aprueban, la integración deja de ser una sorpresa.

## Siendo el dueño del contrato

Entre equipos multifuncionales, alguien tiene que ser dueño de la forma de la cosa. Era yo. Eso significaba:

- Decir no a campos convenientes-pero-con-fugas
- Versionar de forma deliberada, nunca silenciosa
- Tratar la compatibilidad hacia atrás como una feature, no como una idea tardía

```json
{
  "transactionId": "uuid",
  "fiscalDocument": { "type": "NFe", "status": "authorized" },
  "compliance": { "jurisdiction": "BR", "ruleset": "2026.1" }
}
```

## La recompensa

Los contratos limpios hacen que los sistemas sean aburridos en el mejor sentido. Los equipos consumidores integran sin war room, y la traza de auditoría se escribe sola.
