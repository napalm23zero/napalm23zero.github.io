---
title: Matando a partida a frio na triagem de incidentes com uma ferramenta assistida por LLM
date: 2026-05-12
category: IA & Operações
excerpt: Como uma memória de incidentes curada somada a consultas Splunk sob demanda levou a triagem média tier-1 de cerca de uma hora para cerca de vinte minutos.
---

Quando entrei no time de operações de um provedor de pagamentos Tier-1, os incidentes recorrentes estavam consumindo a escala. As mesmas cinco classes de falha voltavam semana após semana, e cada uma começava de uma busca Splunk em branco.

Então, por iniciativa própria, construí uma ferramenta (e depois ensinei o time a usá-la).

## O problema dos runbooks

Runbooks apodrecem. Eles descrevem o sistema como ele era no dia em que alguém teve tempo de documentá-lo. O conhecimento de verdade, *qual consulta encontra esta falha, qual foi a causa-raiz da última vez*, vivia na cabeça das pessoas e em tickets fechados.

## O que construí

Uma ferramenta de triagem assistida por LLM, rodando sobre a API interna do GitHub Copilot e uma base curada e indexada de incidentes e RCAs passados. Ela faz duas coisas bem:

1. **Gera consultas Splunk sob demanda** a partir de uma descrição em linguagem natural do sintoma.
2. **Traz à tona incidentes anteriores relacionados**, de modo que o engenheiro de plantão veja "isto parece o INC-4471 de março" antes de começar a cavar.

> A ferramenta investiga e recomenda. Um humano decide e age. O ganho não foi substituir engenheiros, foi eliminar a partida a frio.

## Resultados

- Tempo médio de triagem caiu de ~1h para ~20min (com base em métricas do JIRA)
- A memória espalhada de incidentes virou algo pesquisável, não mais tribal
- O time foi liberado para trabalho de maior severidade e genuinamente novo

A lição à qual sempre volto: **a assistência de LLM é mais valiosa onde o trabalho é repetitivo, mas o contexto está espalhado.** Operações é exatamente isso.
