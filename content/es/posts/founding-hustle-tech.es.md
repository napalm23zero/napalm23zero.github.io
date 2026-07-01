---
title: Fundando Hustle Tech: construyendo un SaaS self-sustaining en modo solo-first
date: 2025-11-20
category: Fundador
excerpt: Lo que realmente exige arquitectar, lanzar y operar un SaaS B2B con 12 clientes de pago mientras se mantiene un empleo senior de ingeniería.
---

Hustle Tech empezó como un portafolio de proyectos personales y se convirtió en algo que se paga solo. Aquí va la versión honesta.

## El stack

Nada exótico, todo deliberado:

- **Backend:** microservicios Java + Spring Boot en GCP
- **Frontend / móvil:** React, React Native
- **Datos:** PostgreSQL, Redis
- **Infra:** Terraform, CI/CD con GitHub Actions

La restricción que moldeó cada decisión: *tenía que poder operar esto solo, a la 1 de la madrugada, después de un día entero de trabajo para clientes.*

## Workflows asistidos por LLM como multiplicador de fuerza

Internamente me apoyo en workflows asistidos por LLM para generación de tests, revisión de arquitectura, escaneo de vulnerabilidades y enforcement de calidad de código. El tiempo de code review pasó de cuello de botella a no-evento, y eso es lo que hace sostenible el solo-first.

> No sigas tendencias. Créalas.

## Lo que aprendí

Cubrir sus propios costos es una función forzante. Me hizo implacable con el alcance y generoso con la confiabilidad, porque cada cliente de pago es una relación, no una métrica.
