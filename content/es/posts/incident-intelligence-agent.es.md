---
title: Matando el arranque en frío en el triaje de incidentes con una herramienta asistida por LLM
date: 2026-05-12
category: IA & Operaciones
excerpt: Cómo una memoria de incidentes curada más consultas Splunk bajo demanda llevó el triaje medio tier-1 de cerca de una hora a cerca de veinte minutos.
---

Cuando me uní al equipo de operaciones de un proveedor de pagos Tier-1, los incidentes recurrentes se estaban comiendo la guardia. Las mismas cinco clases de fallo volvían semana tras semana, y cada una empezaba desde una búsqueda Splunk en blanco.

Así que, por iniciativa propia, construí una herramienta (y luego enseñé al equipo a usarla).

## El problema de los runbooks

Los runbooks se pudren. Describen el sistema como era el día en que alguien tuvo tiempo de documentarlo. El conocimiento real, *qué consulta encuentra este fallo, cuál resultó ser la causa raíz la última vez*, vivía en la cabeza de las personas y en tickets cerrados.

## Qué construí

Una herramienta de triaje asistida por LLM, corriendo sobre la API interna de GitHub Copilot y una base curada e indexada de incidentes y RCAs pasados. Hace dos cosas bien:

1. **Genera consultas Splunk bajo demanda** a partir de una descripción en lenguaje natural del síntoma.
2. **Trae a la superficie incidentes anteriores relacionados**, de modo que el ingeniero de guardia vea "esto se parece al INC-4471 de marzo" antes de empezar a cavar.

> La herramienta investiga y recomienda. Un humano decide y actúa. La victoria no fue reemplazar ingenieros, fue eliminar el arranque en frío.

## Resultados

- El tiempo medio de triaje bajó de ~1h a ~20min (según métricas de JIRA)
- La memoria dispersa de incidentes se volvió consultable en vez de tribal
- El equipo quedó libre para trabajo de mayor severidad y genuinamente nuevo

La lección a la que siempre vuelvo: **la asistencia de LLM es más valiosa donde el trabajo es repetitivo, pero el contexto está disperso.** Operaciones es exactamente eso.
