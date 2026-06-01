---
title: Reduciendo el MTTR un 60% con un agente LLM de triaje de incidentes
date: 2026-05-12
category: IA & Operaciones
excerpt: Cómo una memoria de incidentes curada más consultas Splunk bajo demanda llevó el triaje tier-1 de 45 minutos a 10.
---

Cuando me uní al equipo de operaciones de un proveedor de pagos Tier-1, los incidentes recurrentes se estaban comiendo la guardia. Las mismas cinco clases de fallo volvían semana tras semana, y cada una empezaba desde una búsqueda Splunk en blanco.

Así que construimos un agente.

## El problema de los runbooks

Los runbooks se pudren. Describen el sistema como era el día en que alguien tuvo tiempo de documentarlo. El conocimiento real — *qué consulta encuentra este fallo, cuál resultó ser la causa raíz la última vez* — vivía en la cabeza de las personas y en tickets cerrados.

## Qué construimos

El agente hace dos cosas bien:

1. **Genera consultas Splunk optimizadas bajo demanda** a partir de una descripción en lenguaje natural del síntoma.
2. **Cruza un historial curado** de incidentes y RCAs pasados, de modo que el ingeniero de guardia vea "esto se parece al INC-4471 de marzo" antes de empezar a cavar.

> La victoria no fue reemplazar ingenieros. Fue eliminar el arranque en frío.

## Resultados

- ~70% de los incidentes recurrentes resueltos de forma casi automática en tres meses
- El MTTR en el triaje tier-1 bajó de ~45min a ~10min
- El equipo quedó libre para trabajo de mayor severidad y genuinamente nuevo

La lección a la que siempre vuelvo: **los agentes son más valiosos donde el trabajo es repetitivo, pero el contexto está disperso.** Operaciones es exactamente eso.
