# PROJECT_RULES.md
# DRÄXLMAIER GRC Platform — Règles de développement

> **Version :** 1.0.0
> **Date :** 2026-08-13
> **Statut :** ACCEPTED — validé par le responsable du projet
> **Scope :** Ce fichier s'applique à tout développeur humain et à toute IA (ChatGPT, Claude, Gemini, ou autre) travaillant sur ce projet.
> **Hiérarchie :** Ce fichier est subordonné au Cahier des Charges v1.0.0, qui reste la source de vérité principale.

---

## RÈGLE #0 — Lire avant d'agir

Tout contributeur (humain ou IA) doit lire les documents suivants **avant toute proposition ou implémentation** :

1. `docs/PROJECT_MASTER.md` — Architecture et décisions.
2. `docs/PROJECT_RULES.md` — Ce fichier.
3. `docs/Cahier_des_Charges_GRC_Draxlmaier_v1.0.0.pdf` — Source de vérité.
4. `docs/User_Stories_GRC_Draxlmaier_Simple.pdf` — Exigences fonctionnelles.

Si un agent IA propose une modification architecturale sans avoir consulté ces documents, la proposition est **invalide**.

---

## PARTIE 1 — DÉCISIONS ACCEPTÉES

> Statut : ACCEPTED = validé par le project owner.
> Ces éléments ne peuvent pas être modifiés sans Architecture Decision Record (ADR).

### 1.1 Vision et principes

| Décision | Source |
|----------|--------|
| Le socle GRC déterministe précède et conditionne la couche IA | CdC Section 5 |
| La supervision humaine est systématique sur toute capacité IA touchant un statut de conformité officiel | CdC Section 5, 21 |
| L'IA est un assistant — jamais une autorité | CdC Section 21 |
| Le système reste fonctionnel à 100% si la couche IA est indisponible | CdC Section 3, NFR-005 |
| Toute proposition IA doit être validée par un utilisateur autorisé avant de devenir un statut officiel | CdC Section 14.2, 21 |
| Les citations sont obligatoires dans toute réponse IA faisant référence à un document | CdC Section 15 FR-003, Section 22 |

### 1.2 Architecture logique

| Décision | Source |
|----------|--------|
| Architecture en couches : Frontend → API → Application → Domain → Infrastructure → DB | CdC Section 19 |
| Couche IA strictement découplée du socle GRC | CdC Section 19, 20 |
| Aucune connexion directe de la couche IA à la base de données | CdC Section 21 |

### 1.3 Périmètre MVP

| Décision | Source |
|----------|--------|
| RBAC minimum 2 rôles : Compliance Officer, Administrateur | CdC Section 12, FR-007 |
| Organisation unique au MVP (DRÄXLMAIER) — pas de hiérarchie BU confirmée | CdC Section 9, US-004 |
| Référentiel normatif prioritaire : ISO 27001 (un seul au MVP) | CdC Section 9.1 |
| Toutes les opérations CRUD génèrent une entrée immuable dans l'AuditLog | CdC Section 18, FR-006 |
| Email automatique au propriétaire d'une politique avant son expiration | CdC FR-008 |

### 1.4 Sécurité

| Décision | Source |
|----------|--------|
| Tout endpoint API requiert une authentification | CdC Section 17 |
| Tout endpoint API applique le RBAC avant exécution de la logique métier | CdC Section 17 |
| Le filtrage vectoriel (RAG) est réalisé au niveau SQL/DB — jamais délégué au LLM | CdC Section 22 |
| Le LLM ne reçoit que le contexte explicitement récupéré et filtré par permission | CdC Section 22 |

### 1.5 AI Safety

| Décision | Source |
|----------|--------|
| Citations obligatoires dans chaque réponse IA référençant un document | CdC FR-003, Section 22 |
| Si contexte insuffisant : le LLM répond "Je ne dispose pas de l'information dans le contexte fourni" | CdC Section 22 |
| Chaque interaction IA ayant conduit à une proposition est journalisée (question, sources, décision humaine) | CdC Section 18 |
| Les opérations IA utilisent les permissions déléguées de l'utilisateur invocateur | CdC Section 22 |

---

## PARTIE 2 — CONTRAINTES MVP

> Ces contraintes délimitent le périmètre de la Phase 1 (Core GRC MVP).
> Toute feature non listée ici DOIT être justifiée par un User Story validé avant d'être implémentée.

### 2.1 MUST HAVE (obligatoire)

| Feature | User Stories | Source |
|---------|-------------|--------|
| Authentification et gestion des sessions | US-002 | CdC FR-007 |
| Création de compte utilisateur par l'admin | US-001 | CdC FR-007 |
| Attribution de rôle par l'admin | US-001, US-003 | CdC FR-007 |
| Gestion d'une organisation unique | US-004 | CdC Section 11 |
| Import de politiques (PDF/DOCX) avec titre, propriétaire, date d'expiration | US-005 | CdC FR-001 |
| Consultation de la liste des politiques | US-006 | CdC FR-001 |
| Email de rappel avant expiration d'une politique | US-007, US-022 | CdC FR-008 |
| Import d'un référentiel de conformité (ISO 27001) | US-008 | CdC FR-002 |
| Consultation des exigences du référentiel | US-009 | CdC FR-002 |
| Création de contrôles internes | US-012 | CdC Section 11 |
| Consultation des contrôles par exigence | US-013 | CdC Section 11 |
| Mappage politique/contrôle ↔ exigence (ControlMapping) | US-010 | CdC FR-001, FR-002 |
| Dépôt de preuve liée à un mappage | US-014 | CdC FR-005 |
| Consultation et téléchargement d'une preuve | US-015 | CdC FR-005 |
| Piste d'audit immuable de toutes les opérations d'écriture | — | CdC FR-006, Section 18 |

### 2.2 SHOULD HAVE (MVP — si le temps le permet)

| Feature | User Stories | Source |
|---------|-------------|--------|
| Statut de conformité (conforme / NC / NA) sur un ControlMapping | US-011 | CdC Section 12 |
| Résultat simplifié d'audit (conforme / NC / NA) | US-016 | CdC Section 12 |
| Recherche sémantique sur les politiques avec citation source | US-024, US-025 | CdC FR-003 |
| Assistance à la détection d'écarts (propositions non officielles) | US-026 | CdC FR-004 |

### 2.3 COULD HAVE (MVP — optionnel)

| Feature | User Stories | Source |
|---------|-------------|--------|
| Tableau de bord synthétique de conformité | US-023 | CdC Section 12 |
| Alerte sortante vers système externe en cas d'écart critique | — | CdC Section 12 |

---

## PARTIE 3 — HORS PÉRIMÈTRE MVP

> Ces éléments sont **EXPLICITEMENT EXCLUS** du MVP.
> Toute tentative d'implémentation avant validation constitue du scope creep.

| Feature | Raison | Source |
|---------|--------|--------|
| **Module Risk Management complet** | Non décidé — validation encadreur requise | CdC Section 9.2, US Section 8 |
| Module Incidents | Aucune exigence validée dans le CdC ou les User Stories | Analyse conflits — CONFLICT-04 |
| Workflow d'approbation multi-niveaux | Post-MVP | CdC Section 9.2 |
| Multi-framework (ISO 9001, TISAX, BSI, GDPR, NIST, SOC2...) | Post-MVP — MVP = ISO 27001 uniquement | CdC Section 9.2 |
| Génération de rapport SoA | Post-MVP | CdC Section 9.2 |
| Gestion des risques tiers | Post-MVP | CdC Section 9.2 |
| Intégration MCP | Future — Phase 5 | CdC Section 20 |
| Agents IA autonomes | Future — Phase 6 | CdC Section 20 |
| Finding et Actions correctives | Dépend de la décision Risk module | CdC Section 9.2 |
| Asset Management | Dépend de la décision Risk module | CdC Section 13 |
| Business Unit hiérarchique | Non confirmé pour MVP | CdC Section 9, US-004 note |
| Scanning de vulnérabilités | Hors scope projet | CdC Section 9.2 |
| Intégration SIEM/ITSM | Hors scope MVP | CdC Section 9.2 |
| Multi-tenancy | Future | CdC Section 9.3 |

---

## PARTIE 4 — RÈGLES IA

> Ces règles s'appliquent à toute fonctionnalité IA du système, quand elle sera implémentée.

### 4.1 Règles fondamentales

```
RÈGLE IA-01 : L'IA NE PREND PAS DE DÉCISION DE CONFORMITÉ.
              L'IA propose. L'utilisateur décide. La base de données enregistre.

RÈGLE IA-02 : CITATIONS OBLIGATOIRES.
              Chaque réponse IA référençant un document DOIT citer le document et la section.

RÈGLE IA-03 : REFUS EXPLICITE.
              Si le contexte est insuffisant, le LLM DOIT répondre qu'il ne dispose
              pas de l'information — jamais inventer, jamais extrapoler.

RÈGLE IA-04 : PERMISSIONS DÉLÉGUÉES.
              L'IA opère avec les permissions de l'utilisateur qui l'invoque.
              Elle ne peut pas accéder à des données inaccessibles à cet utilisateur.

RÈGLE IA-05 : DRAFT OBLIGATOIRE AVANT ÉCRITURE.
              Toute opération d'écriture proposée par l'IA doit être retournée
              comme DRAFT nécessitant une validation humaine explicite.

RÈGLE IA-06 : JOURNALISATION COMPLÈTE.
              Chaque interaction IA produisant une proposition doit être journalisée :
              question posée, sources récupérées, proposition générée, décision humaine.

RÈGLE IA-07 : FILTRAGE CÔTÉ DB.
              Le filtrage des données par permission est réalisé au niveau DB/SQL.
              Le LLM ne reçoit jamais de données qu'il doit "filtrer lui-même".
```

### 4.2 Ordre d'implémentation IA

```
JAMAIS commencer la couche IA avant que le Core GRC (Phase 1) soit stabilisé.

Phase 1 Core GRC → terminée et testée
      ↓ seulement si
TBD-05 (vecteur DB) + TBD-06 (LLM) + TBD-11 (data policy) résolus
      ↓ seulement si
Phase 3 AI Foundation (ingestion, embeddings, RAG, évaluation)
      ↓ seulement si
Phase 3 évaluée sur jeu de questions de référence
      ↓ seulement si
Phase 4 AI-GRC (recherche sémantique, gap detection)
      ↓ seulement si — décision explicite
Phase 5 MCP
      ↓ seulement si — décision explicite
Phase 6 Agents
```

### 4.3 Règles pour les LLMs partenaires (ChatGPT, Claude, Gemini, etc.)

Ces règles s'appliquent aux IAs qui participent à la **conception du projet**, pas aux fonctionnalités IA du produit :

1. **Lire PROJECT_MASTER.md** avant toute proposition architecturale.
2. **Pas de modification silencieuse** : si une IA est en désaccord avec ce document, elle DOIT formuler explicitement la contradiction et proposer un ADR.
3. **Pas de décision sur les TBDs** : les éléments marqués TBD restent TBD jusqu'à validation humaine.
4. **Sécurité en priorité** : toute proposition IA doit vérifier qu'elle n'introduit pas de fuite de données ou de bypass RBAC.
5. **Traçabilité** : toute proposition doit être reliée à une User Story ou un FR du CdC.

---

## PARTIE 5 — RÈGLES GRC

> Ces règles gouvernent l'implémentation des fonctionnalités GRC déterministes.

```
RÈGLE GRC-01 : RBAC AVANT TOUT.
               Chaque endpoint vérifie l'autorisation AVANT d'exécuter
               la logique métier. Aucune exception.

RÈGLE GRC-02 : AUDIT TRAIL COMPLET.
               Toute opération CREATE / UPDATE / DELETE génère
               une entrée immuable dans l'AuditLog.
               Si l'audit trail échoue, l'opération échoue.

RÈGLE GRC-03 : STATUT OFFICIEL = HUMAIN UNIQUEMENT.
               Un statut de conformité officiel ne peut être attribué
               que par un utilisateur humain autorisé.
               Une proposition IA ne change jamais directement un statut.

RÈGLE GRC-04 : DONNÉES RÉELLES ≠ DONNÉES DE DEMO.
               Les données de démonstration du prototype UI (SOC2, GDPR, NIST,
               273 risques, etc.) ne représentent pas le périmètre réel.
               ISO 27001 est le seul référentiel du MVP.

RÈGLE GRC-05 : SÉQUENCE RESPECTÉE.
               Aucune phase ne peut démarrer avant que la précédente
               soit terminée et stabilisée. Voir Section 5 de ce document.

RÈGLE GRC-06 : STOCKAGE DÉTERMINISTE.
               Toutes les données de conformité (statuts, mappages, preuves)
               sont stockées en base relationnelle SQL.
               Le LLM ne stocke rien. Le vecteur DB ne stocke que les embeddings.

RÈGLE GRC-07 : STOCKAGE DE FICHIERS ABSTRAIT.
               Ne jamais stocker de fichiers binaires directement dans PostgreSQL.
               Utiliser l'interface `IFileStorage` et MinIO (MVP).
               PostgreSQL ne stocke que les métadonnées (DocumentId, OrganizationId, Hash, etc).
```

---

## PARTIE 6 — ÉLÉMENTS TBD

> Ces éléments doivent être résolus par le project owner avant d'être implémentés.
> Un agent IA NE PEUT PAS résoudre un TBD par hypothèse.

| ID | Question ouverte | Impact | Statut |
|----|-----------------|--------|--------|
| TBD-01 | Framework backend | Bloque toute implémentation backend | **OPEN** |
| TBD-02 | Base de données relationnelle | Bloque schema, ORM, migrations | **OPEN** |
| TBD-03 | Mécanisme d'authentification / IdP | Bloque RBAC et tous les endpoints protégés | **OPEN** |
| TBD-04 | Service email | Bloque rappels automatiques (FR-008) | **OPEN** |
| TBD-05 | Base vectorielle | Bloque Phase 3 — RAG | **OPEN** |
| TBD-06 | Fournisseur LLM (interne vs externe) | Bloque Phase 3-4 — AI | **OPEN** |
| TBD-07 | BU hiérarchique nécessaire au MVP ? | Scope STEP 03 | **OPEN** |
| TBD-08 | Stockage de fichiers (local/S3/Blob) | Bloque upload politiques et preuves | ✅ **RESOLVED** (MinIO) |
| TBD-09 | Format import ISO 27001 (JSON/CSV/XLSX) | Bloque STEP 06 | **OPEN** |
| TBD-RISK | Module Risk Management dans Phase 1 ? | Scope global — validation encadreur | **OPEN** |
| TBD-11 | Données autorisées à un LLM externe | Bloque Phase 3-4 | **OPEN** |
| TBD-12 | Infrastructure hébergement prod | Bloque déploiement | **OPEN** |
| TBD-13 | Référentiel normatif prioritaire confirmé DRÄXLMAIER | Bloque STEP 06 | **OPEN** |

---

## PARTIE 7 — RÈGLES DE DÉVELOPPEMENT

### 7.1 Traçabilité obligatoire

Avant d'implémenter toute fonctionnalité, le développeur ou l'agent DOIT répondre à :

```
1. Quelle User Story est implémentée ? (US-XXX)
2. Quels sont les critères d'acceptation de cette story ?
3. Quelle est sa priorité (Must Have / Should Have / Could Have) ?
4. Est-elle confirmée pour la phase en cours ?
5. Quelles dépendances doivent être complètes avant ?
6. Qu'est-ce qui est encore TBD ?
```

Si une de ces questions ne peut pas être répondue → **STOP. Rapporter. Attendre.**

### 7.2 Séquence d'implémentation

```
STEP 01: Platform Foundation           → TBD-01, TBD-02, TBD-03 requis
STEP 02: Identity & RBAC              → STEP 01 done
STEP 03: Organization Management      → STEP 02 done
STEP 04: Policy & Document Mgmt       → STEP 03 done + TBD-08
STEP 05: Email Reminder               → STEP 04 done + TBD-04
STEP 06: Framework Import             → STEP 03 done + TBD-09
STEP 07: Control Management           → STEP 06 done
STEP 08: Compliance Mapping & Status  → STEP 04, 06, 07 done
STEP 09: Evidence Management          → STEP 08 done + TBD-08
STEP 10: Core GRC Stabilization       → STEP 01–09 done
STEP 11: Audit Result (simplifié)     → STEP 10 done + validation encadreur
STEP 12: Dashboard (optionnel)        → STEP 11 done + si temps
STEP 13: AI Foundation / RAG          → STEP 10 done + TBD-05/06/11
STEP 14: AI Gap Detection             → STEP 13 évalué
STEP 15: MCP                          → STEP 14 done + décision explicite
STEP 16: Agents                       → STEP 15 done + décision explicite
```

**Aucune étape ne peut être sautée ou inversée sans ADR approuvé.**

### 7.3 Ne rien inventer

Un agent ou développeur NE DOIT PAS inventer :

- Une exigence fonctionnelle absente des User Stories validées.
- Une règle métier absente du CdC.
- Un rôle ou une permission non définis dans les sources.
- Un choix technologique non encore validé (= TBD).
- Une métrique ou critère de succès absent du CdC.
- Une contrainte attribuée à DRÄXLMAIER sans source explicite.

Si l'information est manquante : **STOP. Rapporter l'information manquante. Ne pas remplir le vide.**

### 7.4 Pas de modification silencieuse

Un agent NE DOIT PAS modifier silencieusement :

- Une exigence validée.
- Le scope d'une User Story.
- Une décision d'architecture.
- Un modèle de données.
- Un concept du domaine GRC.

En cas de besoin de modification, formuler explicitement :

```
PROPOSED CHANGE: [Ce que vous voulez changer]
Reason: [Pourquoi c'est nécessaire]
Impact: [Ce qui est affecté]
Source conflict (si applicable): [Ce qui dans les sources entre en contradiction]
```

Attendre validation avant implémentation.

### 7.5 Hypothèses explicites

Toute hypothèse faite lors d'une implémentation DOIT être déclarée explicitement dans le rapport d'implémentation. Une hypothèse non déclarée est une erreur de processus.

Format :
```
HYPOTHESIS: [Hypothèse formulée]
Reason: [Pourquoi cette hypothèse est nécessaire]
Validation required from: [Qui doit valider]
Impact if wrong: [Ce qui change si l'hypothèse est incorrecte]
```

### 7.6 Rapport d'implémentation obligatoire

Après toute tâche d'implémentation significative :

```markdown
## Implementation Report: [Nom de la feature]

### User Stories couvertes
- US-XXX : [Statut des critères d'acceptation]

### Ce qui a été implémenté
[Description précise]

### Fichiers créés ou modifiés
[Liste]

### Tests ajoutés
[Liste avec statut : passing / failing]

### Ce qui reste à faire
[Liste explicite]

### Hypothèses formulées
[Liste EXPLICITE de toutes les hypothèses]

### Problèmes identifiés
[Ce qui ne fonctionne pas ou est ambigu]
```

---

## PARTIE 8 — DONNÉES DE DÉMONSTRATION

> ⚠️ CONFLICT-03 RÉSOLU

Le prototype UI (`src/data/mockData.ts`) contient des données fictives incluant :
- SOC 2, GDPR, NIST CSF, ISO 27001 comme frameworks avec des scores
- 273 risques ouverts, 12 critiques
- 45 findings
- Données de compliance pour plusieurs frameworks

**Ces données de démonstration ne représentent PAS le périmètre du projet.**

Règles :
- Le MVP utilise **ISO 27001 uniquement** comme référentiel de conformité.
- SOC 2, GDPR, NIST CSF ne font pas partie du périmètre Phase 1.
- Les chiffres de mock data ne constituent pas des métriques cibles.
- Ces données ne doivent pas être utilisées comme base pour des décisions de features.

---

## PARTIE 9 — DOCUMENTS DE RÉFÉRENCE

| Document | Rôle | Localisation |
|----------|------|-------------|
| Cahier des Charges v1.0.0 | **Source de vérité principale** | `docs/Cahier_des_Charges_GRC_Draxlmaier_v1.0.0.pdf` |
| User Stories GRC | Exigences fonctionnelles validées | `docs/User_Stories_GRC_Draxlmaier_Simple.pdf` |
| PROJECT_MASTER.md v1.1.0 | Architecture et décisions — SSOT | `docs/PROJECT_MASTER.md` |
| PROJECT_RULES.md | Règles de développement — CE FICHIER | `docs/PROJECT_RULES.md` |
| Comparaison Eramba/verinice | Benchmark uniquement — pas une source de requirements | `docs/Grc comparaison draxlmaier eramba verinice.pdf` |
| ADRs | Décisions d'architecture enregistrées | `docs/adr/` (à créer) |

---

## Change Log

| Version | Date | Auteur | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2026-08-13 | M. Abidi / Analyse | Création initiale — basé sur CdC v1.0.0 et User Stories validées |
