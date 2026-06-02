---
title: Cortando o MTTR em 60% com um agente LLM de triagem de incidentes
date: 2026-05-12
category: IA & Operações
excerpt: Como uma memória de incidentes curada somada a consultas Splunk sob demanda levou a triagem tier-1 de 45 minutos para 10.
---

Quando entrei no time de operações de um provedor de pagamentos Tier-1, os incidentes recorrentes estavam consumindo a escala. As mesmas cinco classes de falha voltavam semana após semana, e cada uma começava de uma busca Splunk em branco.

Então construímos um agente.

## O problema dos runbooks

Runbooks apodrecem. Eles descrevem o sistema como ele era no dia em que alguém teve tempo de documentá-lo. O conhecimento de verdade, *qual consulta encontra esta falha, qual foi a causa-raiz da última vez*, vivia na cabeça das pessoas e em tickets fechados.

## O que construímos

O agente faz duas coisas bem:

1. **Gera consultas Splunk otimizadas sob demanda** a partir de uma descrição em linguagem natural do sintoma.
2. **Cruza um histórico curado** de incidentes e RCAs passados, de modo que o engenheiro de plantão veja "isto parece o INC-4471 de março" antes de começar a cavar.

> O ganho não foi substituir engenheiros. Foi eliminar a partida a frio.

## Resultados

- ~70% dos incidentes recorrentes resolvidos de forma quase automática em três meses
- MTTR na triagem tier-1 caiu de ~45min para ~10min
- O time foi liberado para trabalho de maior severidade e genuinamente novo

A lição à qual sempre volto: **agentes são mais valiosos onde o trabalho é repetitivo, mas o contexto está espalhado.** Operações é exatamente isso.
