# ADR-004 — Inclusion du module Risk Management dans le MVP

| Champ | Valeur |
|-------|--------|
| **ADR-ID** | ADR-004 |
| **Titre** | Inclusion du module Risk Management dans la Phase 1 (MVP) |
| **Statut** | **ACCEPTED** |
| **Date** | 2026-08-13 |
| **Décidé par** | Mohamed Abidi (project owner) |
| **Remplace** | TBD-RISK |

---

## Contexte

Le Cahier des Charges v1.0.0 Section 9 indique explicitement que l'inclusion du module Risk Management dans le périmètre initial "n'est pas encore décidée" et requiert une validation de l'encadreur. La même section signale un risque de sur-scope (CdC Section 25 : RSK-01 — "Sur-scope par rapport au temps disponible, probabilité élevée, impact élevé"). Le project owner a confirmé l'inclusion dans le MVP.

## Décision

**Le module Risk Management est inclus dans le MVP (Phase 1).**

> ⚠️ **Risque documenté (source : CdC Section 25) :** L'inclusion de ce module ajoute une charge estimée à 30-40% sur un projet de 16 semaines. Ce risque est **accepté** par le project owner.

## Scope du module Risk Management — Phase 1

Basé sur les User Stories US-017, US-018, US-019 (User Stories Section 8) :

| User Story | Description | Priorité | MVP |
|------------|-------------|----------|-----|
| US-017 | Risk Owner enregistre un risque | Confirmé MVP | Oui |
| US-018 | Risk Owner évalue un risque (probabilité × impact) | Confirmé MVP | Oui |
| US-019 | Risk Owner lie un contrôle à un risque | Confirmé MVP | Oui |

## Entités ajoutées au Domain Model

| Entité | Attributs principaux | Relations |
|--------|---------------------|----------|
| `Asset` | id, name, description, organizationId | → Risk (1:N) |
| `Risk` | id, title, description, ownerId, assetId, status | → RiskAssessment (1:N), → Control via RiskControl |
| `RiskAssessment` | id, riskId, probability (1-5), impact (1-5), score, assessedBy, assessedAt | → Risk (N:1) |
| `RiskTreatment` | id, riskId, type (Accept/Mitigate/Transfer/Avoid), description, dueDate | → Risk (N:1) |
| `RiskControl` | riskId, controlId (table de liaison) | → Risk ↔ Control (N:N) |

## Score de risque

```
Score = Probability (1-5) × Impact (1-5)
Échelle : 1-4 Low · 5-9 Medium · 10-14 High · 15-25 Critical
```

> **Note :** Le scoring est **déterministe** (calcul SQL). L'IA ne calcule pas les scores de risque (source : CdC Section 21).

## Routes API ajoutées

```
GET    /api/v1/assets
POST   /api/v1/assets
GET    /api/v1/risks
POST   /api/v1/risks
GET    /api/v1/risks/{id}
PUT    /api/v1/risks/{id}
POST   /api/v1/risks/{id}/assessments
POST   /api/v1/risks/{id}/treatments
POST   /api/v1/risks/{id}/controls          (lier contrôle à risque)
```

## Impact sur le planning

| Impact | Détail |
|--------|--------|
| Entités supplémentaires | +5 entités (Asset, Risk, RiskAssessment, RiskTreatment, RiskControl) |
| Migrations EF Core | +5 migrations |
| Use Cases supplémentaires | ~8 use cases additionnels |
| Tests supplémentaires | ~20 tests unitaires + intégration |
| Charge estimée | +3 à 5 semaines sur 16 |

## Risque accepté

> **RSK-01 (CdC Section 25)** : Sur-scope par rapport au temps disponible — Probabilité élevée, Impact élevé.
> **Mitigation décidée :** Prioriser les MUST HAVE du module Risk. Les fonctionnalités SHOULD HAVE/COULD HAVE du Risk module sont différées si le temps manque.

## Conséquences

- Les routes `/risks` et `/risks/:id` du prototype peuvent désormais être développées.
- Le rôle `RiskOwner` est ajouté au RBAC (ADR-003).
- La route `/incidents` reste **hors scope** — aucune User Story validée.
- Les entités Finding et Action corrective restent **hors scope Phase 1** (CdC Section 9.2).
- AuditLog DOIT couvrir toutes les opérations Risk (CREATE/UPDATE/DELETE).

## Dépendances

- ADR-001, ADR-002, ADR-003 — tous confirmés.
- US-017, US-018, US-019 — User Stories validées.
