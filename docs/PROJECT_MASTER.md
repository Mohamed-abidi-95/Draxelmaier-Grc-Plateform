# PROJECT_MASTER.md
# DRÄXLMAIER GRC Platform — Single Source of Truth

> **Version:** 1.2.0
> **Date:** 2026-08-13
> **Statut:** ACCEPTED — validé par le responsable du projet
> **Auteur initial:** Mohamed Abidi
> **Encadrement:** TBD
> **Révision v1.1.0:** Correction des conflits CONFLICT-01 à CONFLICT-05 identifiés lors de l'analyse du 2026-08-13. Alignement strict sur le Cahier des Charges v1.0.0 et les User Stories validées.
> **Révision v1.2.0:** Enregistrement des décisions ADR-001 à ADR-005 : backend (ASP.NET Core 8), base de données (PostgreSQL + pgvector), authentification (Keycloak), Risk module inclus au MVP, base vectorielle (pgvector).
- Authentication: Keycloak (OIDC) - Port 8081
- Database: PostgreSQL (avec l'extension `pgvector`) - Port 5432
- File Storage (S3-compatible): MinIO - Port 9000 (Console: 9001)

### Ports configurés

- `5298` : Backend API
- `5432` : PostgreSQL
- `8081` : Keycloak
- `9000` : MinIO API
- `9001` : MinIO Console

> ⚠️ **RÈGLE D'OR**
> Ce document est la Source de Vérité Unique (SSOT) du projet.
> Tout développeur et toute IA travaillant sur ce projet DOIT lire ce document avant toute proposition ou implémentation.
> En cas de contradiction entre ce document et toute autre source, ce document prévaut — **sauf** s'il entre en contradiction avec le Cahier des Charges v1.0.0, auquel cas le Cahier des Charges prévaut.

---

## 1. Project Identity

| Champ | Valeur |
|-------|--------|
| **Nom du projet** | DRÄXLMAIER GRC Platform |
| **Codename UI** | ShieldGRC (désignation provisoire du prototype Figma — non décidé pour la production) |
| **Organisation** | DRÄXLMAIER Group |
| **Type** | Application web interne — Enterprise B2B |
| **Version document** | 1.1.0 |
| **Statut** | ACCEPTED — Phase 0 (Cadrage terminé, implémentation en attente des TBDs) |
| **Date** | 2026-08-13 |
| **Owner** | Mohamed Abidi |
| **Encadrement** | TBD |
| **Contrainte temporelle** | ~16 semaines (projet académique PFE) — **source : CdC Section 25** |

---

## 2. Executive Summary

Le projet DRÄXLMAIER GRC Platform est une plateforme de Gouvernance, Risques et Conformité (GRC) développée sur mesure pour DRÄXLMAIER. Il s'agit d'un projet académique (PFE) en 6 mois, conçu comme une preuve de valeur.

Le périmètre du MVP se concentre volontairement sur un sous-ensemble restreint des fonctionnalités GRC classiques, centré sur la **gestion de la conformité ISO 27001** : import de politiques, import du référentiel normatif, mappage contrôle/politique ↔ exigence, collecte de preuves, piste d'audit, et RBAC.

Une couche d'intelligence artificielle (recherche sémantique documentaire avec citation, assistance à la détection d'écarts) est prévue **après** la stabilisation du socle GRC déterministe, sous réserve de la disponibilité du temps et de la résolution des choix techniques encore ouverts.

> **Source :** Cahier des Charges v1.0.0, Sections 5, 9, 12, 23.

---

## 3. Business Context

### 3.1 Problématique

**HYPOTHÈSE DE TRAVAIL — À VALIDER AVEC DRÄXLMAIER** (source : CdC Section 3) :

- Les équipes de conformité s'appuient sur des documents, tableurs et outils partiels.
- Il n'existe pas, à la connaissance du projet, de plateforme interne centralisant politiques, exigences normatives, preuves et statuts de conformité.
- La démonstration de conformité ISO 27001 repose sur un travail manuel chronophage.

> Ces éléments sont des **hypothèses de travail génériques**, pas des constats établis sur l'organisation réelle de DRÄXLMAIER. La validation avec des interlocuteurs DRÄXLMAIER reste ouverte.

### 3.2 Utilisateurs

| Persona | Rôle | Statut |
|---------|------|--------|
| Compliance Officer | Utilisateur principal — vérifie et documente la conformité | **CONFIRMED — MVP** |
| Administrateur | Gère les comptes, rôles et configuration | **CONFIRMED — MVP** |
| Responsable de politique | Propriétaire d'une politique — reçoit les rappels | **CONFIRMED — MVP** |
| CISO / RSSI | Vision globale de la conformité | **TO VALIDATE** — CdC Section 10 |
| Risk Owner | Responsable d'un risque | **TO VALIDATE** — dépend de la décision Risk module |
| Auditeur | Évalue les contrôles de façon indépendante | **TO VALIDATE** — CdC Section 10 |
| Collaborateur standard | Consultation des politiques | **TO VALIDATE** — hors MVP selon CdC |

### 3.3 Objectifs

> Tous les objectifs ci-dessous sont des **PROPOSITIONS** issues du CdC, pas des engagements mesurés validés.

- Centraliser politiques et exigences de conformité dans un référentiel unique.
- Réduire le temps consacré à la recherche documentaire lors des audits.
- Améliorer la traçabilité des décisions et statuts de conformité.
- Fournir une assistance IA à la détection d'écarts (après stabilisation du socle GRC).

### 3.4 Limites du projet

- L'IA ne prend **jamais** de décision de conformité de façon autonome.
- Le système reste **100% fonctionnel** si la couche IA est indisponible.
- Le projet ne remplace pas un outil GRC établi (Eramba, verinice) — il apporte une valeur différenciante sur la couche IA documentaire.

---

## 4. Project Vision

> Source : Cahier des Charges v1.0.0, Section 5.

> *Construire une plateforme GRC destinée à DRÄXLMAIER, structurée autour d'un socle de gouvernance, de gestion des risques et de conformité fonctionnel et auditable, puis enrichie progressivement d'une couche d'intelligence artificielle sécurisée assistant la recherche documentaire, l'analyse de conformité et l'identification d'écarts — cette couche IA opérant sous supervision humaine systématique et sans jamais se substituer aux mécanismes déterministes qui demeurent la source de vérité du système.*

**Deux principes structurants retenus (source : CdC Section 5) :**
1. Le socle GRC déterministe précède et conditionne la couche IA.
2. La supervision humaine reste systématique sur toute capacité IA touchant un statut de conformité officiel.

---

## 5. Scope

### 5.1 In Scope (MVP — ACCEPTED)

> Source : Cahier des Charges v1.0.0, Section 9.1 et Section 12.

**MUST HAVE :**
- Gestion documentaire des politiques (import, métadonnées, consultation).
- Import d'un référentiel normatif unique : **ISO 27001 en priorité** (à valider avec DRÄXLMAIER).
- Mappage manuel entre politique/contrôle et exigence normative.
- Collecte de preuves rattachées à un élément de conformité.
- Piste d'audit des actions effectuées dans le système (immuable).
- Contrôle d'accès basé sur les rôles (RBAC) — minimum 2 rôles : Compliance Officer, Administrateur.
- Rappel automatique par email avant l'expiration d'une politique.

**SHOULD HAVE (MVP — si le temps le permet) :**
- Statut d'évaluation d'un contrôle (conforme / non conforme / non applicable).
- Recherche sémantique en langage naturel sur les politiques, avec citation vérifiable de la source.
- Assistance à la détection d'écarts entre une politique et une exigence, sous forme de proposition soumise à validation humaine.

**COULD HAVE (MVP — optionnel) :**
- Tableau de bord synthétique de conformité.

### 5.2 Out of Scope (Version initiale — ACCEPTED)

> Source : Cahier des Charges v1.0.0, Section 9.2.

- **Module de gestion des risques complet** — ⚠️ CONFLICT-01 RÉSOLU : ce module N'EST PAS dans le MVP. Décision d'inclusion reportée (voir TBD-RISK).
- Workflow d'approbation formel multi-niveaux.
- Support simultané de plusieurs référentiels normatifs.
- Génération automatisée de rapports de conformité formels (type SoA).
- Gestion des risques tiers / fournisseurs.
- Intégration MCP.
- Agents IA autonomes.
- Module Incidents — ⚠️ CONFLICT-04 RÉSOLU : aucune exigence validée dans le CdC ou les User Stories.
- Scanning de vulnérabilités.
- Intégration sortante vers systèmes tiers (SIEM, ITSM) — sauf le rappel email qui est MUST HAVE.

### 5.3 Future Scope (Post-MVP)

> Source : Cahier des Charges v1.0.0, Section 9.3.

- Extension à d'autres référentiels normatifs (ISO 9001, ISO 14001, BSI IT-Grundschutz, etc.).
- Module de gestion des risques complet (si confirmé nécessaire).
- Workflow d'approbation formel.
- Génération de rapports de conformité formels.
- Intégration MCP.
- Agents IA autonomes sous supervision humaine renforcée.
- Module de gestion des constats et actions correctives (dépend de la décision Risk module).

---

## 6. Functional Requirements

> Source : Cahier des Charges v1.0.0, Section 15.
> Format : chaque exigence conserve le statut ACCEPTED / PROPOSED / TBD.

| ID | Nom | Description | Priorité | Statut |
|----|-----|-------------|----------|--------|
| FR-001 | Ingestion de politiques | Upload d'un document de politique avec titre, propriétaire, date d'expiration, association à une organisation | MUST HAVE | ACCEPTED |
| FR-002 | Import référentiel de conformité | Import d'un catalogue d'exigences (ISO 27001), format à déterminer | MUST HAVE | ACCEPTED |
| FR-003 | Recherche sémantique avec citation | Question en langage naturel sur les politiques, réponse citant document et section source | SHOULD HAVE | ACCEPTED |
| FR-004 | Assistance détection d'écart | Comparaison politique ↔ exigence, écarts présentés comme propositions non officielles | SHOULD HAVE | ACCEPTED |
| FR-005 | Collecte de preuves | Associer un fichier de preuve à un élément de conformité | MUST HAVE | ACCEPTED |
| FR-006 | Piste d'audit | Journaliser de façon immuable toute création, modification, suppression | MUST HAVE | ACCEPTED |
| FR-007 | Contrôle d'accès RBAC | Minimum 2 rôles : Compliance Officer et Administrateur | MUST HAVE | ACCEPTED |
| FR-008 | Rappel email avant expiration | Email automatique au propriétaire d'une politique, N jours avant expiration (N configurable) | MUST HAVE | ACCEPTED |

> ⚠️ **Note CONFLICT-01 (résolu) :** La version précédente du PROJECT_MASTER.md (v1.0.0) incluait un FR-003 "Risk Register" comme CRITICAL/MUST HAVE. Ce requirement a été **supprimé** car il contredit explicitement le CdC Section 9 et les User Stories Section 8. Le module Risk Management est **hors MVP** jusqu'à validation de l'encadreur.

---

## 7. Non-Functional Requirements

> Source : Cahier des Charges v1.0.0, Section 16.

| ID | Catégorie | Exigence | Statut |
|----|-----------|----------|--------|
| NFR-001 | Security | Chiffrement des données sensibles au repos et en transit | PROPOSED — mécanisme TBD |
| NFR-002 | Performance | Recherche sémantique retourne un résultat dans un délai interactif acceptable | PROPOSED — seuil chiffré TBD |
| NFR-003 | Auditability | Toute action affectant un statut de conformité est tracée (user, timestamp, nature) | ACCEPTED |
| NFR-004 | Maintainability | Code suivant des conventions permettant la prise en main par un tiers | PROPOSED |
| NFR-005 | Reliability | Système fonctionnel même si la couche IA est indisponible | ACCEPTED |
| NFR-006 | Availability | TBD — aucun SLA défini à ce stade | TBD |
| NFR-007 | Scalability | Absorber la croissance documentaire sans dégradation majeure | PROPOSED — sans seuil chiffré |
| NFR-008 | Data Protection | Documents traités selon exigences de confidentialité applicables | PROPOSED — cadre précis TBD avec DRÄXLMAIER |
| NFR-009 | Testability | Fonctionnalités MUST HAVE couvertes par tests automatisés sur scénarios d'acceptation | PROPOSED |
| NFR-010 | Observability | TBD — stratégie de journalisation applicative non définie | TBD |
| NFR-011 | Accessibility | TBD — aucune exigence définie | TBD |

---

## 8. GRC Domain Model

> Source : Cahier des Charges v1.0.0, Section 13.

### Entités retenues au MVP

| Entité | Responsabilité | Relations clés |
|--------|---------------|----------------|
| Organization | Racine du périmètre | → Policy, ComplianceFramework |
| User | Compte utilisateur | ↔ Role (N:N) |
| Role | Ensemble de permissions | ↔ User (N:N) |
| Policy | Document de politique — source du RAG futur | → Organization ; → ControlMapping (1:N) |
| ComplianceFramework | Référentiel normatif (ISO 27001 au MVP) | → ComplianceRequirement (1:N) |
| ComplianceRequirement | Exigence individuelle | → ControlMapping (N:N) |
| ControlMapping | Lien Policy/Control ↔ Requirement | Statut : conforme / NC / NA ; Origin : manual / ai_proposed |
| Control | Contrôle interne | → ComplianceRequirement via ControlMapping |
| Evidence | Preuve de conformité | → ControlMapping (N:1) |
| Document | Fichier source (politique ou preuve) | → Policy ou Evidence |
| AuditLog | Trace immuable | → User (N:1) |

### Entités HORS MVP (non définies)

> Source : CdC Section 13 — *"non retenues au MVP dans l'attente de confirmation"*

- Asset
- Risk / Risk Assessment / Risk Treatment
- Finding (constat formel)
- Action (remédiation formelle)
- Business Unit (entité hiérarchique distincte)

---

## 9. Functional Architecture

> Source : Cahier des Charges v1.0.0, Section 11.

| Module | Objectif | Priorité MVP |
|--------|---------|-------------|
| Identity & Access | Authentification, RBAC | MUST HAVE |
| Organization Management | Structure organisationnelle (simplifiée) | MUST HAVE |
| Policy Management | Cycle de vie des politiques | MUST HAVE |
| Compliance Management | Import référentiel, mappage, statuts | MUST HAVE |
| Control Management | Contrôles internes | MUST HAVE |
| Evidence Management | Preuves de conformité | MUST HAVE |
| Document Management | Stockage et métadonnées | MUST HAVE |
| Audit Trail | Piste d'audit immuable | MUST HAVE |
| Notifications | Rappels email | MUST HAVE |
| Audit Management | Résultat simple (conforme/NC/NA) | SHOULD HAVE |
| Reporting / Dashboard | Tableau de bord synthétique | COULD HAVE |
| AI Layer | RAG, recherche sémantique, gap detection | SHOULD HAVE (si temps) |
| Risk Management | **HORS MVP — TBD** | Future / TBD |
| Finding & Remediation | **HORS MVP — TBD** | Future / TBD |

---

## 10. Technical Architecture

> ⚠️ **CONFLICT-02 RÉSOLU :** La version précédente du PROJECT_MASTER.md (v1.0.0) présentait des choix techniques comme décidés (ASP.NET Core 8, PostgreSQL, pgvector, Azure OpenAI, Python/FastAPI). Ces choix sont des **PROPOSITIONS non validées**. Le Cahier des Charges Section 19 marque **tous les choix technologiques comme TBD**.

### Architecture logique retenue (ACCEPTED)

> Source : CdC Section 19 — principe retenu.

```
Frontend → API → Application Layer → Domain Layer → Infrastructure → Database
```

```
AI Layer (additive, découplée) → RAG → LLM → [MCP — Future] → [Agents — Future]
```

### Pattern architectural — PROPOSED (non validé)

L'analyse préliminaire suggère un **Modular Monolith** (Clean Architecture) comme pattern adapté au contexte :
- Simplicité de déploiement (équivalent à un monolithe).
- Frontières logiques strictes (équivalent à des microservices).
- Évolutivité vers des services distincts si nécessaire.

> **Statut : PROPOSED — NOT VALIDATED.** Ce choix doit faire l'objet d'une validation avec l'encadreur avant implémentation.

### Couches applicatives — PROPOSED

| Couche | Responsabilité | Statut |
|--------|---------------|--------|
| Presentation (API) | Endpoints REST, controllers, validation entrée | PROPOSED |
| Application | Use Cases, CQRS (MediatR ou équivalent) | PROPOSED |
| Domain | Entités métier pures, interfaces, règles | PROPOSED |
| Infrastructure | ORM, stockage fichiers, email, clients externes | PROPOSED |
| AI Subsystem | Orchestration RAG, embeddings, LLM (découplé) | PROPOSED |

---

## 11. Technology Stack

> ⚠️ **CONFLICT-02 RÉSOLU :** Tous les choix listés ici ont le statut TBD ou PROPOSED. Aucun n'est décidé.

| Composant | Décision | ADR | Statut |
|-----------|----------|-----|--------|
| Backend framework | **ASP.NET Core 8 (C#)** | [ADR-001](adr/ADR-001-backend-framework.md) | ✅ ACCEPTED |
| ORM | **Entity Framework Core 9** | [ADR-002](adr/ADR-002-database-postgresql.md) | ✅ ACCEPTED |
| Base de données relationnelle | **PostgreSQL 16** | [ADR-002](adr/ADR-002-database-postgresql.md) | ✅ ACCEPTED |
| Base vectorielle (Phase 3) | **pgvector** (extension PostgreSQL) | [ADR-005](adr/ADR-005-vector-database-pgvector.md) | ✅ ACCEPTED |
| Authentification (MVP dev) | **ASP.NET Core Identity + JWT local** | [ADR-003](adr/ADR-003-authentication-keycloak.md) | ✅ ACCEPTED |
| Authentification (production) | **Keycloak 25** (OIDC) | [ADR-003](adr/ADR-003-authentication-keycloak.md) | ✅ ACCEPTED |
| Frontend framework | **React 19 + TypeScript + Vite** (prototype existant) | — | ACCEPTED (prototype existant) |
| Conteneurisation | **Docker + Docker Compose** | — | PROPOSED → à valider |
| Stockage fichiers | **IFileStorage / MinIO** | [ADR-006](adr/ADR-006-file-storage-minio.md) | ✅ ACCEPTED |
| Service email | **MailKit / SMTP (Mailpit en dev)** | [ADR-007](adr/ADR-007-email-service.md) | ✅ ACCEPTED |
| Modèle d'embeddings | TBD | — | **TBD** (Phase 3) |
| LLM provider | TBD | — | **TBD** (Phase 3-4) |
| Orchestration IA | TBD (Semantic Kernel PROPOSED) | — | **TBD** (Phase 3) |
| CI/CD | TBD (GitHub Actions PROPOSED) | — | **TBD** |
| Infrastructure prod | TBD | — | **TBD** |

---

## 12. Data Architecture

> Source : CdC Section 13 pour les entités ; Section 19 pour les choix techniques (TBD).

### Données relationnelles (SQL)
Toutes les entités GRC métier DOIVENT être stockées dans une base relationnelle garantissant ACID :
- Organization, User, Role, Policy, ComplianceFramework, ComplianceRequirement, ControlMapping, Control, Evidence, AuditLog.

### Stockage documentaire
Les fichiers (PDF, DOCX, XLSX) DOIVENT être stockés dans un service de stockage dédié (mécanisme TBD). Seules les métadonnées et références sont stockées en base SQL.

### Stockage vectoriel (Phase 3 uniquement)
Les chunks de documents et leurs embeddings seront stockés dans une base vectorielle (TBD). Le mécanisme doit inclure un filtrage par permission au niveau de la requête SQL/vectorielle — **jamais confié au LLM**.

### Journalisation
Les AuditLogs sont stockés dans une table append-only. Aucun utilisateur standard ne peut les modifier.

---

## 13. AI Architecture

> Source : Cahier des Charges v1.0.0, Sections 20, 21, 22.

### Règle fondamentale
**L'IA est un assistant, pas une autorité. La base de données est la source de vérité.**

### 13.1 GRC déterministe (MVP — ACCEPTED)
```
Utilisateur → Interface React → API → Application → Domain → Base de données
```
Fonctionne de façon synchrone. Indépendant de la couche IA.

### 13.2 Fonctionnalités AI-assistées (SHOULD HAVE — si temps)
```
Utilisateur → Interface React → Orchestrateur IA → RAG → LLM → Proposition
                                                              ↓
                                                    Validation humaine requise
                                                              ↓
                                                    Statut officiel en base
```

### 13.3 Frontière GRC / IA — ACCEPTED

> Source : CdC Section 21.

| Capacité | Déterministe | IA-assistée | Approbation humaine | Justification |
|----------|-------------|-------------|---------------------|---------------|
| Mappage conformité (initial) | Non | Oui | Requise avant statut officiel | Capacité différenciante |
| Analyse politique (résumé, recherche) | Non | Oui | Recommandée | Risque d'imprécision moindre |
| Statut de conformité officiel | Oui | Non | N/A — déterministe uniquement | Source de vérité |
| Scoring de risque | Oui (si module inclus) | Non recommandé sans validation | Requise | Impact décisionnel direct |
| Rapport formel | Oui (données factuelles) | Assistance mise en forme | Recommandée | Valeur d'audit formelle |

### 13.4 RAG (Phase 3 — DO NOT IMPLEMENT YET)

Pipeline prévu :
```
Upload document → Extraction texte → Chunking → Embeddings → Stockage vectoriel (filtré par permission)
       ↓
Question utilisateur → Embedding requête → Recherche vectorielle (filtrée) → Reranking
       ↓
Contexte → LLM → Réponse avec citations obligatoires
```

**Citations obligatoires :** Chaque réponse DOIT citer le DocumentID et la section source.
**Refus explicite :** Si le contexte est insuffisant, le LLM DOIT répondre qu'il ne dispose pas de l'information dans le contexte fourni — jamais inventer.

### 13.5 MCP — DO NOT IMPLEMENT YET (Future)

> Source : CdC Section 23, Phase 5.

### 13.6 Agents — DO NOT IMPLEMENT YET (Future)

> Source : CdC Section 23, Phase 5 ; CdC Section 20.

---

## 14. Security Architecture

> Source : CdC Section 17.

| Mécanisme | Description | Statut |
|-----------|-------------|--------|
| Authentication | Mécanisme à définir — IdP TBD | **TBD** |
| Authorization | RBAC, minimum 2 rôles au MVP | ACCEPTED |
| Least privilege | Principe retenu — application concrète TBD | PROPOSED |
| Isolation Organisation | MVP = organisation unique. Multi-organisation : TBD | PROPOSED |
| Secrets management | Stratégie TBD | **TBD** |
| Encryption | Au repos et en transit — mécanisme TBD | **TBD** |
| Data access control | Accès conditionné au rôle — filtrage vectoriel TBD | PROPOSED |
| Prompt injection | Sanitisation des inputs — mécanisme précis TBD | **TBD** |
| LLM data leakage | Dépend du choix LLM interne/externe | **TBD** |

---

## 15. AI Safety & Governance

> Source : CdC Section 22.

| Risque IA | Mitigation retenue | Détection | Contrôle humain | Logging | Statut |
|-----------|-------------------|-----------|-----------------|---------|--------|
| Hallucination | Citation systématique source ; vérification TBD | TBD | Validation humaine obligatoire | Interaction journalisée | ACCEPTED (principe) |
| Prompt injection (document ingéré) | TBD | TBD | — | — | TBD |
| Retrieval non autorisé | Filtrage permission au niveau SQL | TBD | — | Journalisation requêtes | PROPOSED |
| Data leakage (LLM externe) | Dépend du choix LLM TBD | — | — | — | TBD |
| Information périmée | Mécanisme MAJ index lors révision politique | TBD | — | — | TBD |
| Documents contradictoires | TBD | TBD | Signalement soumis à validation | — | TBD |
| Autonomie excessive (agents) | Non applicable au MVP | — | — | — | N/A MVP |
| Abus MCP | Non applicable au MVP | — | — | — | N/A MVP |

---

## 16. Audit Trail

> Source : CdC Section 18.

**Événements DEVANT être journalisés (ACCEPTED) :**

- Création d'un élément (politique, mappage, preuve, contrôle).
- Modification d'un élément.
- Suppression d'un élément (si autorisée).
- Changement de statut d'un ControlMapping.
- Approbation ou rejet d'une proposition (y compris proposition IA).
- Action d'un utilisateur (identité, horodatage, nature).
- Action système automatisée (rappel email envoyé).
- Interaction IA ayant conduit à une proposition soumise à validation (question, sources citées, décision humaine).

**Format de journalisation :** User, Timestamp, Action, Entity type, Entity ID, Previous value, New value.
**Caractère immuable :** Non modifiable a posteriori par un utilisateur standard.

---

## 17. API Architecture

> Source : CdC Section 19 (architecture en couches retenue).

Architecture RESTful avec versioning. Contrat architectural (pas les routes finales) :

| Domaine | Exemples de endpoints | Protégé par |
|---------|-----------------------|-------------|
| Auth | `POST /api/v1/auth/login` | — |
| Users | `POST /api/v1/users`, `GET /api/v1/users` | Admin |
| Organizations | `POST /api/v1/organizations` | Admin |
| Policies | `GET /api/v1/policies`, `POST /api/v1/policies` | Auth + Role |
| Documents | `POST /api/v1/documents`, `GET /api/v1/documents/{id}` | Auth + Role |
| Frameworks | `POST /api/v1/frameworks/import`, `GET /api/v1/frameworks` | Auth + Role |
| Requirements | `GET /api/v1/requirements` | Auth |
| Controls | `POST /api/v1/controls`, `GET /api/v1/controls` | Auth + Role |
| Mappings | `POST /api/v1/mappings`, `PATCH /api/v1/mappings/{id}/status` | Auth + Role |
| Evidence | `POST /api/v1/evidence`, `GET /api/v1/evidence/{id}` | Auth + Role |
| Audit Logs | `GET /api/v1/audit-logs` | Admin |
| AI | `POST /api/v1/ai/search`, `POST /api/v1/ai/gaps` | Auth + Role (Phase 3-4) |
| Health | `GET /api/v1/health` | Public |

---

## 18. Testing Strategy

> Source : CdC Section 16 (NFR Testability).

| Type | Description | Priorité |
|------|-------------|----------|
| Unit Tests | Domain et Application layers — framework TBD | MUST (MUST HAVE features) |
| Integration Tests | Repositories et use cases avec DB réelle | MUST (MUST HAVE features) |
| API Tests | Validation endpoints avec auth | MUST (MUST HAVE features) |
| Security Tests | Vérification RBAC sur chaque endpoint | MUST |
| RAG Evaluation | Précision/rappel sur jeu de questions de référence | Phase 3 — TBD |
| E2E Tests | Flux complet utilisateur | PROPOSED — framework TBD |

---

## 19. Deployment Architecture

> Source : CdC Section 26 — infrastructure TBD.

| Environnement | Description | Statut |
|---------------|-------------|--------|
| Local / développement | Docker Compose (backend + DB + frontend) | PROPOSED |
| Production | TBD — on-premise, cloud ou hybride | **TBD** |
| CI/CD | TBD — pipeline de build et déploiement | **TBD** |

---

## 20. Roadmap

> Source : Cahier des Charges v1.0.0, Section 23.

| Phase | Description | Dépendances | Statut |
|-------|-------------|-------------|--------|
| Phase 0 — Cadrage | CdC, User Stories, Architecture | — | ✅ DONE |
| Phase 1 — Core GRC MVP | Foundation, Auth, RBAC, Org, Policy, Framework, Controls, Mapping, Evidence, Audit Trail, Email | TBD-01/02/03 résolus | ⬜ PLANNED |
| Phase 1b — GRC SHOULD HAVE | Statut conformité, résultat audit simplifié, dashboard optionnel | Phase 1 stable | ⬜ PLANNED |
| Phase 2 — Advanced GRC | Workflows, multi-référentiels, SoA report | Phase 1b stable | ⬜ FUTURE |
| Phase 3 — AI Foundation / RAG | Ingestion, embeddings, vector storage, retrieval, évaluation | Phase 1 stable + TBDs 5/6/10/11 | ⬜ FUTURE |
| Phase 4 — AI-GRC | Recherche sémantique, gap detection | Phase 3 stable | ⬜ FUTURE |
| Phase 5 — MCP | MCP Server, GRC tools, permissions | Phase 4 stable | ⬜ FUTURE |
| Phase 6 — Agents | Agents IA sous supervision humaine | Phase 5 stable | ⬜ FUTURE |

---

## 21. Definition of Done (DoD)

> Source : CdC Section 24 (Critères d'acceptation MVP).

Une fonctionnalité est **DONE** quand :
- [ ] Code complet et relu.
- [ ] Critères d'acceptation de la User Story correspondante satisfaits.
- [ ] Tests unitaires et d'intégration passent.
- [ ] API documentée (OpenAPI/Swagger).
- [ ] RBAC vérifié sur tous les endpoints concernés.
- [ ] AuditLog entries générées pour toutes les opérations d'écriture.
- [ ] Pas de données du LLM conservées côté client (pour les fonctionnalités IA).
- [ ] Validation humaine obligatoire vérifiée (pour les propositions IA).

---

## 22. Current Project Status

> Mis à jour le 2026-08-13.

| Feature | Priorité | Statut | Owner | Notes |
|---------|---------|--------|-------|-------|
| Prototype UI React (PFE1) | High | 🟢 Completed | M. Abidi | Preuve de concept visuelle — données fictives, pas de backend |
| Cahier des Charges v1.0.0 | Critical | 🟢 Completed | M. Abidi | Draft — validation encadreur en attente |
| User Stories | Critical | 🟢 Completed | M. Abidi | Validées pour analyse |
| PROJECT_MASTER.md v1.2.0 | High | 🟢 Completed | M. Abidi | Conflits corrigés + décisions ADR-001–005 |
| PROJECT_RULES.md v1.0.0 | High | 🟢 Completed | M. Abidi | Voir `docs/PROJECT_RULES.md` |
| ADR-001 Backend (ASP.NET Core 8) | Critical | 🟢 Completed | M. Abidi | ✅ TBD-01 résolu |
| ADR-002 Database (PostgreSQL + EF Core) | Critical | 🟢 Completed | M. Abidi | ✅ TBD-02 résolu |
| ADR-003 Auth (Keycloak / ASP.NET Identity) | Critical | 🟢 Completed | M. Abidi | ✅ TBD-03 résolu |
| ADR-004 Risk module dans MVP | Critical | 🟢 Completed | M. Abidi | ✅ TBD-RISK résolu |
| ADR-005 pgvector (Phase 3) | Medium | 🟢 Completed | M. Abidi | ✅ TBD-05 résolu |
| Backend Foundation (STEP 01) | Critical | 🟢 Completed | M. Abidi | Base projet, DbContext, NuGet, Docker compose |
| Identity & RBAC (STEP 02) | Critical | 🟢 Completed | — | Entités User/Role et Use Cases Auth |
| Risk Management (STEP 02b) | High | 🟡 Ready to start | — | Inclus MVP — dépend STEP 02 |
| Policy Management (STEP 04) | High | 🟡 Ready to start | — | Dépend STEP 02 |
| Compliance Framework (STEP 06) | High | ⬜ Planned | — | Dépend STEP 03 |
| AI / RAG Pipeline (Phase 3) | Medium | ⬜ Future | — | Après Phase 1 stable + TBDs 06/11 |

---

## 23. Open Questions / TBD

> Source : Cahier des Charges v1.0.0, Section 26.

| ID | Question | Bloque | Statut |
|----|---------|--------|--------|
| TBD-01 | Choix du framework backend | Toute implémentation backend | ✅ **RESOLVED → ADR-001** (ASP.NET Core 8) |
| TBD-02 | Choix de la base de données relationnelle | Schema, ORM, migrations | ✅ **RESOLVED → ADR-002** (PostgreSQL 16 + EF Core 9) |
| TBD-03 | Choix du fournisseur d'identité / mécanisme d'auth | RBAC, tous les endpoints protégés | ✅ **RESOLVED → ADR-003** (Keycloak prod / ASP.NET Identity dev) |
| TBD-04 | Service d'envoi email | Rappels automatiques (FR-008) | ✅ **RESOLVED → ADR-007** (SMTP) |
| TBD-05 | Base vectorielle | Phase 3 — RAG | ✅ **RESOLVED → ADR-005** (pgvector dans PostgreSQL) |
| TBD-06 | Fournisseur LLM (interne vs externe) | Phase 3-4 — AI | **OPEN** |
| TBD-07 | Hiérarchie BU nécessaire au MVP ? | Scope STEP 03 | **OPEN** |
| TBD-08 | Stratégie de stockage de fichiers | STEP 04 (politiques), STEP 09 (preuves) | ✅ **RESOLVED → ADR-006** (MinIO) |
| TBD-09 | Format d'import ISO 27001 (JSON/CSV/XLSX) | STEP 06 | **OPEN** |
| TBD-RISK | Module Risk Management inclus en Phase 1 ? | Scope global, US-017/018/019 | ✅ **RESOLVED → ADR-004** (Inclus dans MVP) |
| TBD-11 | Données autorisées à être envoyées à un LLM externe | Phase 3-4 — data policy | **OPEN** |
| TBD-12 | Infrastructure d'hébergement (cloud/on-premise/hybride) | Déploiement production | **OPEN** |
| TBD-13 | Référentiel normatif prioritaire confirmé par DRÄXLMAIER | STEP 06 | **OPEN** |

---

## 24. Risks Register

> Source : Cahier des Charges v1.0.0, Section 25.
> Les évaluations de probabilité/impact marquées *(CdC)* viennent de la source. Les autres sont **MODEL ANALYSIS — NOT SOURCE DECISION**.

| ID | Description | Prob | Impact | Mitigation | Owner | Statut |
|----|-------------|------|--------|-----------|-------|--------|
| RSK-01 | Sur-scope par rapport au temps (16 sem.) | Élevée *(CdC)* | Élevé *(CdC)* | Périmètre restreint au MVP, exclusion Risk module et MCP/Agents | TBD | Ouvert |
| RSK-02 | Hallucination IA sur sujet de conformité | Élevée *(CdC)* | Élevé *(CdC)* | Citation obligatoire, validation humaine systématique | TBD | Ouvert |
| RSK-03 | Qualité retrieval insuffisante | Moyenne à élevée *(CdC)* | Moyen à élevé *(CdC)* | Évaluation sur jeu de questions de référence | TBD | Ouvert |
| RSK-04 | Stack technique non validée bloque tout démarrage | Élevée *(CdC)* | Moyen *(CdC)* | Revue architecture technique à programmer | TBD | Ouvert |
| RSK-05 | Confidentialité données si LLM externe | Moyenne *(CdC)* | Élevé *(CdC)* | Décision LLM à trancher avec DRÄXLMAIER | TBD | Ouvert |
| RSK-06 | Absence de validation processus réels DRÄXLMAIER | Moyenne *(CdC)* | Moyen *(CdC)* | Entretiens de validation à programmer | TBD | Ouvert |
| RSK-07 | PROJECT_MASTER.md utilisé comme spec malgré conflits | Élevée *(MODEL)* | Élevé *(MODEL)* | Corrections v1.1.0 appliquées dans ce document | M. Abidi | **Résolu v1.1.0** |

---

## 25. Success Criteria

> ⚠️ **CONFLICT-05 RÉSOLU :** La version v1.0.0 du PROJECT_MASTER.md incluait des critères de succès non présents dans le CdC ("100% of regulatory frameworks mapped", "50% reduction", ">90% citation rate"). Ces critères ont été **remplacés** par les critères d'acceptation officiels du CdC Section 24.

**Critères d'acceptation du MVP (source : CdC Section 24) :**
- Un utilisateur autorisé peut importer une politique et la consulter.
- Un utilisateur autorisé peut importer un référentiel ISO 27001 et consulter ses exigences.
- Un utilisateur autorisé peut créer un mappage entre une politique/contrôle et une exigence.
- Une preuve peut être associée à un mappage de conformité.
- Un mappage peut recevoir un statut (conforme / non conforme / non applicable).
- Les opérations de création, modification et suppression sont journalisées de façon vérifiable.
- Les permissions empêchent un utilisateur non autorisé d'accéder aux fonctions d'administration.
- Un rappel automatique par email est envoyé au propriétaire d'une politique avant son expiration.

**Critères IA (source : CdC Section 24) — TBD sur les métriques :**
- Une requête sémantique retourne une réponse accompagnée d'au moins une citation identifiable.
- Une proposition de gap est marquée comme non officielle jusqu'à validation humaine.
- **TBD :** Seuil quantitatif de qualité de retrieval et taux d'hallucination acceptable — à définir lors des tests RAG.

---

## 26. Glossary

| Terme | Définition |
|-------|-----------|
| GRC | Governance, Risk and Compliance |
| RAG | Retrieval-Augmented Generation |
| MCP | Model Context Protocol |
| RBAC | Role-Based Access Control |
| IdP | Identity Provider |
| ControlMapping | Entité liant une politique ou un contrôle à une exigence de conformité |
| SoA | Statement of Applicability — rapport de conformité formel |
| MVP | Minimum Viable Product — périmètre minimal fonctionnel |
| MUST HAVE | Exigence obligatoire pour le MVP |
| SHOULD HAVE | Exigence fortement souhaitée, incluse si le temps le permet |
| COULD HAVE | Exigence optionnelle, incluse en dernier |
| FUTURE | Hors périmètre MVP, prévu pour une phase ultérieure |
| TBD | To Be Decided — décision ouverte, ne pas inventer |
| ACCEPTED | Décision validée |
| PROPOSED | Proposition formulée, pas encore validée |

---

## 27. Architecture Decision Records

> Format officiel pour les futures décisions.

```
ADR-XXX
Titre     :
Statut    : Proposed / Accepted / Rejected / Superseded
Contexte  : Le problème à résoudre
Décision  : La solution retenue
Alternatives : Ce qui a été considéré
Justification : Pourquoi cette décision
Conséquences : Trade-offs et impacts
Date      :
```

> Aucun ADR n'est encore enregistré. Les décisions TBD listées en Section 23 doivent produire chacune un ADR lorsqu'elles sont résolues.

---

## 28. Change Log

| Version | Date | Auteur | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2026-08-12 | AI (non validé) | Création initiale — contient des conflits avec le CdC |
| 1.1.0 | 2026-08-13 | M. Abidi / Analyse | Correction CONFLICT-01 à CONFLICT-05 — alignement strict CdC v1.0.0 |
| 1.2.0 | 2026-08-13 | M. Abidi | ADR-001 (ASP.NET Core 8) · ADR-002 (PostgreSQL + EF Core 9) · ADR-003 (Keycloak) · ADR-004 (Risk MVP) · ADR-005 (pgvector) · ADR-006 (File Storage) |
