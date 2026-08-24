# ADR 007: Email Service Strategy

## Status
Accepted

## Context
Le système GRC doit envoyer des rappels automatiques aux propriétaires de politiques avant leur expiration (FR-008). Étant donné que l'application est conçue pour évoluer vers un produit SaaS, il est nécessaire de choisir une stratégie d'envoi d'emails qui soit hautement délivrable, scalable, et isolable pour le développement local. 
Le TBD-04 laissait ouverte la question du fournisseur d'envoi (SMTP local, SendGrid, AWS SES, etc.).

## Decision
Nous adoptons une architecture basée sur l'abstraction et le protocole SMTP standard :
1. **Abstraction** : Une interface `IEmailService` est créée dans la couche Application. Le domaine métier ne se préoccupe pas des détails techniques d'envoi.
2. **Implémentation** : Un service générique `SmtpEmailService` basé sur `MailKit` est utilisé dans la couche Infrastructure.
3. **Développement Local (MVP)** : Nous intégrons **Mailpit** (remplaçant moderne de MailHog) via Docker Compose. Cela permet d'intercepter les emails générés sans nécessiter de clés API ni risquer l'envoi de faux emails à de vraies adresses.
4. **Production** : La configuration s'appuiera sur des fournisseurs tiers (ex: AWS SES ou SendGrid) via SMTP, configurés de manière transparente via des variables d'environnement (`appsettings.json`).

## Consequences
- **Avantage** : L'environnement de développement est complètement isolé et gratuit, avec une UI (sur le port 8025) pour inspecter les emails envoyés.
- **Avantage** : Aucune réécriture de code ne sera nécessaire pour passer en production. Il suffira de modifier le host, le port et les credentials SMTP.
- **Inconvénient** : Ajout de la dépendance `MailKit` (qui est le standard recommandé par Microsoft à la place de `SmtpClient` obsolète).
