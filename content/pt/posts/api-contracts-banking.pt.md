---
title: Dono do contrato: design de APIs para compliance bancário
date: 2026-03-04
category: Engenharia
excerpt: Notas sobre projetar APIs RESTful para compliance fiscal e contábil no Brasil e na América Latina, e por que ser dono do contrato importa.
---

APIs de compliance não têm glamour e não perdoam. Erre o contrato e você não recebe um relatório de bug, você recebe um regulador.

## OpenAPI primeiro, código depois

Cada endpoint começou como uma definição OpenAPI revisada com os times consumidores *antes* de uma única linha de handler ser escrita. A spec é a superfície de negociação. Quando o contrato é o artefato que todo mundo aprova, a integração deixa de ser surpresa.

## Sendo o dono do contrato

Entre times multifuncionais, alguém precisa ser dono do formato da coisa. Era eu. Isso significava:

- Dizer não a campos convenientes-mas-vazados
- Versionar de forma deliberada, nunca silenciosa
- Tratar compatibilidade retroativa como feature, não como pensamento tardio

```json
{
  "transactionId": "uuid",
  "fiscalDocument": { "type": "NFe", "status": "authorized" },
  "compliance": { "jurisdiction": "BR", "ruleset": "2026.1" }
}
```

## O retorno

Contratos limpos deixam sistemas chatos no melhor sentido. Times consumidores integram sem war room, e a trilha de auditoria se escreve sozinha.
