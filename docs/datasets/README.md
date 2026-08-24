# Dataset immédiat — Organization + Risk + RiskAssessment

**Périmètre :** uniquement les entités réellement présentes dans le `ApplicationDbContext` au 2026-03-14, selon `PROJECT_STATE.md` (STEP 01 complet, STEP 02b partiel).

**Ne pas utiliser** pour Policy, Control, Compliance, Evidence — ces tables n'existent pas encore en base.

## Fichiers

| Fichier | Contenu | Nb lignes |
|---|---|---|
| `01_organizations.csv` | 1 organisation fictive : "Demo Manufacturing Company" | 1 |
| `02_risks.csv` | 8 risques, statuts variés (Open, Mitigated, Accepted) | 8 |
| `03_risk_assessments.csv` | 7 évaluations — **volontairement 1 risque sans évaluation** | 7 |

## Scénarios de test volontairement inclus

| Scénario | Où le trouver | Ce que ça teste |
|---|---|---|
| Risque critique (score élevé) | Risk 1 — score 20 | Affichage/tri des risques les plus critiques |
| Risque avec statut "Mitigated" mais évaluation ancienne (>3 mois) | Risk 3 — évalué le 2025-11-13 | Gestion des données périmées, alerte de re-évaluation éventuelle |
| Risque "Accepted" avec score modéré | Risk 6 | Filtrage par statut, cohérence score/statut |
| **Risque SANS AUCUNE évaluation** | Risk 8 (`3c3a3692...`) | **Comportement de l'app quand `RiskAssessments` est vide pour un risque — ne doit pas planter, doit afficher un état "non évalué"** |
| Deux Risk Owners différents | `risk_owner_1` / `risk_owner_2` | Filtrage par propriétaire, RBAC (un Risk Owner ne devrait voir/gérer que ses propres risques si cette règle existe) |

## Comment importer

Ces fichiers ne sont **pas** conçus pour un import via une fonctionnalité applicative (aucun endpoint d'import CSV n'existe pour Risk). Utilisation prévue :
- soit un script de seed manuel (`dotnet ef` seeding, ou script SQL `COPY`/`INSERT` généré à partir de ces CSV) ;
- soit import direct via un outil d'administration PostgreSQL (pgAdmin, DBeaver) pointant sur la base de développement.

**Attention aux types :** `Status` doit correspondre exactement aux valeurs de l'enum `RiskStatus` côté backend (`Open`, `Mitigated`, `Accepted`, `Closed` d'après le rapport d'implémentation STEP 02b — vérifier la casse exacte avant import).

## Utilisateurs référencés (non inclus dans ce dataset — à créer via `/api/v1/auth/register` ou seeding Identity)

| Rôle | GUID utilisé dans ce dataset |
|---|---|
| Administrateur | `48691bb6-5d93-5dbf-a6d5-f1012e520043` |
| Compliance Officer | `d00f9045-3f5f-5693-9b44-17d4f0e06b18` |
| Risk Owner 1 | `f798fefa-0532-5741-87de-210e40d1fd73` |
| Risk Owner 2 | `3fa29e44-72db-5894-be0a-df7d2066ff2e` |

Ces GUID sont fixes (générés par hachage déterministe du nom), pas aléatoires — si vous recréez ces comptes utilisateurs manuellement, utilisez ces mêmes GUID pour que les clés étrangères des risques restent valides.
