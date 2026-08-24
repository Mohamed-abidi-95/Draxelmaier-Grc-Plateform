# Cahier des Charges v2.0.0 — GRC Avance
# Plateforme GRC Intelligente DRAXLMAIER — Phase 2 et au-dela

> **Version :** 2.0.0  
> **Date :** 2026-08-19  
> **Auteur :** Mohamed Abidi  
> **Statut :** DRAFT — necessite validation par l'encadreur  
> **Prerequis :** Ce document suppose que le Core GRC (Phase 1 / CdC v1.0.0) est integralement implemente, teste et stabilise.  
> **Hierarchie :** Ce document est un complement au CdC v1.0.0. En cas de contradiction, le CdC v1.0.0 prevaut pour tout ce qui concerne la Phase 1.

---

## 1. Contexte et justification

### 1.1 Etat des lieux

La Phase 1 (Core GRC MVP) a livre les fonctionnalites suivantes, considerees comme stabilisees :

- Identity et RBAC (authentification, JWT, roles Administrator et ComplianceOfficer)
- Organization Management (organisation unique DRAXLMAIER)
- Policy Management (import de politiques avec titre, proprietaire, date d'expiration)
- Compliance Framework Import (ISO 27001 via CSV)
- Control Management (creation et consultation de controles)
- Compliance Mapping et Status (lien politique/controle vers exigence, statut conforme/NC/NA)
- Evidence Management (upload et consultation de preuves)
- Audit Trail immuable (journalisation de toute operation CRUD)
- Notifications email (rappel avant expiration de politique)
- Risk Management basique (Risk, RiskAssessment avec score P x I)

### 1.2 Objectif du CdC v2

Ce document definit le perimetre, les exigences fonctionnelles et non fonctionnelles, les user stories et les criteres d'acceptation pour les phases suivantes :

| Phase | Contenu | Priorite |
|-------|---------|----------|
| Phase 2 — GRC Avance | Completion Risk module, Findings, Workflow, Multi-framework, SoA, Dashboard avance | MUST HAVE |
| Phase 3 — AI Foundation | Pipeline RAG, embeddings, stockage vectoriel, evaluation | MUST HAVE |
| Phase 4 — AI-GRC | Recherche semantique, detection d'ecarts, assistant documentaire | SHOULD HAVE |
| Phase 5 — MCP | Serveur MCP, exposition des donnees GRC a un agent externe | COULD HAVE |
| Phase 6 — Agents | Agents IA autonomes sous supervision humaine | FUTURE |

---

## 2. Perimetre

### 2.1 In Scope (Phase 2 — GRC Avance)

#### MUST HAVE

- FR-V2-001 : Completion du module Risk Management (entites Asset, RiskTreatment, RiskControl)
- FR-V2-002 : Module Finding et Actions Correctives
- FR-V2-003 : Workflow d'approbation de politique (circuit multi-niveaux)
- FR-V2-004 : Support multi-referentiels normatifs (ISO 27001 + au moins un second)
- FR-V2-005 : Generation du rapport Statement of Applicability (SoA)
- FR-V2-006 : Processus d'audit complet (planification, perimetre, execution, cloture)
- FR-V2-007 : Dashboard avance avec metriques de conformite et risques
- FR-V2-008 : Gestion hierarchique des Business Units
- FR-V2-009 : Roles et permissions avances (CISO, Auditor, Risk Owner, End User)
- FR-V2-010 : Alertes automatiques configurables (vers systemes externes)

#### SHOULD HAVE

- FR-V2-011 : Export de donnees (CSV, PDF) pour rapports hors-plateforme
- FR-V2-012 : Historique de versions des politiques (versionning)
- FR-V2-013 : Matrice de risques interactive (heatmap)
- FR-V2-014 : Filtres avances et recherche full-text sur tous les modules

#### COULD HAVE

- FR-V2-015 : Personnalisation du tableau de bord par utilisateur
- FR-V2-016 : Notifications in-app en plus de l'email
- FR-V2-017 : Import XLSX/JSON pour les referentiels (en plus du CSV)

### 2.2 In Scope (Phase 3 — AI Foundation)

- FR-V2-020 : Pipeline d'ingestion documentaire (extraction texte PDF/DOCX, chunking)
- FR-V2-021 : Generation d'embeddings et stockage vectoriel (pgvector)
- FR-V2-022 : Pipeline de retrieval avec filtrage par permission au niveau SQL
- FR-V2-023 : Evaluation de la qualite du retrieval sur jeu de questions de reference

### 2.3 In Scope (Phase 4 — AI-GRC)

- FR-V2-030 : Recherche semantique en langage naturel sur les politiques, avec citation obligatoire
- FR-V2-031 : Assistant documentaire (question/reponse avec sources)
- FR-V2-032 : Detection d'ecarts de conformite (gap analysis assistee par IA)
- FR-V2-033 : Proposition de mappings par l'IA (soumis a validation humaine)

### 2.4 In Scope (Phase 5 — MCP)

- FR-V2-040 : Serveur MCP exposant les donnees GRC structurees
- FR-V2-041 : Permissions MCP alignees sur le RBAC existant
- FR-V2-042 : Journalisation de toutes les requetes MCP

### 2.5 Out of Scope (ce CdC)

- Gestion des risques tiers / fournisseurs (Phase ulterieure non planifiee)
- Scanning de vulnerabilites
- Integration SIEM/ITSM sortante (sauf alertes configurables FR-V2-010)
- Multi-tenancy (organisations multiples independantes)
- Application mobile native
- Agents IA autonomes Phase 6 (fera l'objet d'un CdC v3 separe)

---

## 3. Modele de domaine etendu

### 3.1 Nouvelles entites (Phase 2)

| Entite | Attributs principaux | Relations | Source |
|--------|---------------------|-----------|--------|
| Asset | id, name, description, type, criticality, organizationId, ownerId | vers Risk (1:N), vers Organization (N:1) | ADR-004 |
| RiskTreatment | id, riskId, type (Accept/Mitigate/Transfer/Avoid), description, responsibleId, dueDate, status | vers Risk (N:1) | ADR-004 |
| RiskControl | riskId, controlId (table de liaison) | vers Risk (N:N via Control) | ADR-004 |
| Finding | id, title, description, type (non-conformite/observation/opportunite), status (open/in-progress/closed/accepted), severity, auditId, requirementId, detectedDate, closedDate | vers Audit (N:1), vers ComplianceRequirement (N:1) | CdC v1 Section 9.3 |
| CorrectiveAction | id, findingId, description, responsibleId, dueDate, status (assigned/in-progress/completed/overdue), completedDate, evidenceId | vers Finding (N:1), vers Evidence (N:1 optionnel) | User Stories Section 9 |
| PolicyVersion | id, policyId, versionNumber, documentId, approvedBy, approvedDate, status (draft/pending-approval/approved/archived) | vers Policy (N:1), vers Document (N:1) | CdC v1 Section 9.3 |
| ApprovalStep | id, policyVersionId, stepOrder, approverRoleId, approverId, status (pending/approved/rejected), comment, decidedDate | vers PolicyVersion (N:1) | CdC v1 Section 9.2 |
| BusinessUnit | id, name, parentId, organizationId | vers Organization (N:1), auto-referentiel (parent) | CdC v1 TBD-07 |
| AlertRule | id, name, conditionType, threshold, channel (email/webhook), recipientRoleId, isActive | vers Organization (N:1) | CdC v1 Section 9.3 |
| DashboardWidget | id, userId, widgetType, configuration, position | vers User (N:1) | Nouveau |

### 3.2 Entites modifiees

| Entite existante | Modification | Raison |
|-----------------|-------------|--------|
| Risk | Ajout de assetId (FK vers Asset), ajout de residualScore, treatmentStatus | Completion ADR-004 |
| Policy | Ajout de currentVersionId (FK vers PolicyVersion), ajout de approvalStatus | Workflow d'approbation |
| Audit | Ajout de scope, type (internal/external), findings (1:N), ajout de closedDate, closedBy | Processus d'audit complet |
| ComplianceFramework | Ajout de type (regulatory/standard/internal), source, isActive | Multi-referentiels |
| Control | Ajout de frequency (periodicity de verification), lastVerifiedDate, effectiveness | Audit complet |
| Organization | Ajout de relation vers BusinessUnit (1:N) | Hierarchie BU |

---

## 4. Exigences fonctionnelles detaillees

### 4.1 FR-V2-001 : Completion Risk Management

**Description :** Completer le module Risk Management selon le scope defini dans l'ADR-004, en ajoutant les entites Asset, RiskTreatment et RiskControl, ainsi que toutes les routes API manquantes.

**User Stories :**

**US-V2-001** : En tant que Risk Owner, je veux enregistrer un actif (asset) dans le systeme, afin de pouvoir y rattacher les risques associes.

Criteres d'acceptation :
- Un actif possede un nom, une description, un type et un niveau de criticite.
- Un actif est rattache a une organisation.
- Seuls les roles Administrator et RiskOwner peuvent creer un actif.

**US-V2-002** : En tant que Risk Owner, je veux rattacher un risque a un actif, afin de documenter quel actif est menace.

Criteres d'acceptation :
- Un risque existant peut etre lie a un actif existant.
- La suppression d'un actif est bloquee s'il a des risques actifs rattaches.

**US-V2-003** : En tant que Risk Owner, je veux definir un plan de traitement pour un risque (accepter, attenuer, transferer, eviter), afin de documenter la decision de traitement.

Criteres d'acceptation :
- Un plan de traitement comprend un type (Accept/Mitigate/Transfer/Avoid), une description, un responsable et une echeance.
- Le risque affiche son statut de traitement en cours.
- Un AuditLog est genere a la creation du traitement.

**US-V2-004** : En tant que Risk Owner, je veux lier un controle existant a un risque, afin de montrer que ce risque est couvert par un controle.

Criteres d'acceptation :
- Un risque peut etre lie a un ou plusieurs controles (relation N:N).
- Un controle peut etre lie a un ou plusieurs risques.
- La liaison est visible depuis la vue du risque et depuis la vue du controle.

**US-V2-005** : En tant que Risk Owner, je veux consulter le score de risque residuel apres application des traitements et controles, afin d'evaluer l'efficacite des mesures.

Criteres d'acceptation :
- Le score residuel est un calcul deterministe (jamais IA).
- Formule : Score residuel = Score inherent x (1 - facteur de reduction). Le facteur de reduction est saisi manuellement (MVP) ou calcule par nombre de controles effectifs (v2+).

**Routes API ajoutees :**

```
GET    /api/v1/assets
POST   /api/v1/assets
GET    /api/v1/assets/{id}
PUT    /api/v1/assets/{id}
DELETE /api/v1/assets/{id}
PUT    /api/v1/risks/{id}
DELETE /api/v1/risks/{id}
POST   /api/v1/risks/{id}/treatments
GET    /api/v1/risks/{id}/treatments
PUT    /api/v1/risks/{id}/treatments/{treatmentId}
POST   /api/v1/risks/{id}/controls
DELETE /api/v1/risks/{id}/controls/{controlId}
GET    /api/v1/risks/{id}/controls
```

---

### 4.2 FR-V2-002 : Module Finding et Actions Correctives

**Description :** Permettre de documenter formellement les constats (findings) issus d'un audit et de leur associer des actions correctives tracees.

**User Stories :**

**US-V2-006** : En tant que Compliance Officer, je veux creer un constat (finding) lorsqu'un ecart de conformite est confirme lors d'un audit, afin de le documenter formellement.

Criteres d'acceptation :
- Un constat est lie a un audit et optionnellement a une exigence de conformite.
- Un constat possede un type (non-conformite, observation, opportunite d'amelioration).
- Un constat possede une severite (critique, majeur, mineur, observation).
- Seuls les roles ComplianceOfficer et Administrator peuvent creer un constat.
- Un AuditLog est genere.

**US-V2-007** : En tant que Compliance Officer, je veux assigner une action corrective avec une echeance a un constat, afin de suivre sa resolution.

Criteres d'acceptation :
- Une action corrective a un responsable, une description, une echeance et un statut.
- Le statut evolue : Assigned -> In Progress -> Completed (ou Overdue si echeance depassee).
- Une preuve peut etre attachee a une action corrective comme justificatif de cloture.
- Un email de rappel est envoye au responsable si l'echeance approche (reutilisation du mecanisme de rappel existant).

**US-V2-008** : En tant que Compliance Officer, je veux consulter tous les constats ouverts et les actions correctives en cours, afin d'avoir une vue d'ensemble du plan de remediation.

Criteres d'acceptation :
- Vue filtrable par audit, par statut, par severite, par echeance.
- Export CSV de la liste.

**Routes API :**

```
GET    /api/v1/findings
POST   /api/v1/findings
GET    /api/v1/findings/{id}
PUT    /api/v1/findings/{id}
GET    /api/v1/audits/{auditId}/findings
POST   /api/v1/findings/{id}/actions
GET    /api/v1/findings/{id}/actions
PUT    /api/v1/actions/{id}
PATCH  /api/v1/actions/{id}/status
```

---

### 4.3 FR-V2-003 : Workflow d'approbation de politique

**Description :** Introduire un circuit de validation formel pour les politiques : une politique passe par des etapes d'approbation avant d'etre publiee.

**User Stories :**

**US-V2-009** : En tant que Compliance Officer, je veux soumettre une nouvelle version d'une politique pour approbation, afin de declencher le circuit de validation.

Criteres d'acceptation :
- La soumission cree une PolicyVersion avec statut "Pending Approval".
- Le workflow definit un ou plusieurs ApprobationSteps dans l'ordre.
- Chaque step est assigne a un role ou un utilisateur specifique.

**US-V2-010** : En tant qu'approbateur, je veux approuver ou rejeter une politique soumise, avec un commentaire, afin de formaliser ma decision.

Criteres d'acceptation :
- Si approuve : passe au step suivant ou (si dernier step) passe la politique en "Approved".
- Si rejete : la politique revient au statut "Draft" avec le commentaire de rejet.
- Chaque decision genere un AuditLog.
- Un email de notification est envoye a l'approbateur quand c'est son tour.

**US-V2-011** : En tant que Compliance Officer, je veux consulter l'historique des versions d'une politique, afin de voir toutes les versions passees et leur statut d'approbation.

Criteres d'acceptation :
- Chaque version est numerotee sequentiellement.
- L'historique affiche : numero de version, date, approbateur, decision, commentaire.
- La version active est clairement identifiee.

---

### 4.4 FR-V2-004 : Support multi-referentiels normatifs

**Description :** Permettre l'import et la gestion simultanee de plusieurs referentiels normatifs.

**User Stories :**

**US-V2-012** : En tant qu'Administrateur, je veux importer un second referentiel normatif (ex: ISO 9001, TISAX, BSI IT-Grundschutz), afin de gerer la conformite a plusieurs normes.

Criteres d'acceptation :
- Le systeme accepte plusieurs frameworks actifs simultanement.
- Chaque framework est independant avec ses propres exigences.
- Un controle ou une politique peut etre mappe a des exigences de frameworks differents.
- Le dashboard affiche les metriques par framework.

**US-V2-013** : En tant que Compliance Officer, je veux voir la vue croisee des mappings entre frameworks, afin d'identifier les controles qui couvrent plusieurs normes.

Criteres d'acceptation :
- Vue matricielle : controles en lignes, frameworks en colonnes.
- Identification visuelle des controles couvrant plusieurs frameworks.

---

### 4.5 FR-V2-005 : Generation du rapport SoA

**Description :** Generer automatiquement un Statement of Applicability (SoA) a partir des donnees de conformite presentes dans le systeme.

**User Stories :**

**US-V2-014** : En tant que Compliance Officer, je veux generer un rapport SoA pour un referentiel donne, afin de disposer d'un document exportable pour un audit externe.

Criteres d'acceptation :
- Le SoA liste toutes les exigences du referentiel selectionne.
- Pour chaque exigence : statut (applicable/non applicable), justification de non-applicabilite si NA, controles associes, statut de conformite, preuves rattachees.
- Export en PDF et CSV.
- Le rapport est genere a partir des donnees en base (deterministe, pas d'IA).
- La date de generation et l'utilisateur generateur sont enregistres.

---

### 4.6 FR-V2-006 : Processus d'audit complet

**Description :** Etendre le module d'audit simplifie en un processus complet : planification, definition du perimetre, execution, constats, cloture.

**User Stories :**

**US-V2-015** : En tant que Compliance Officer, je veux planifier un audit avec un perimetre defini (framework cible, controles concernes, periode), afin de structurer le processus d'evaluation.

Criteres d'acceptation :
- Un audit a un titre, une description, un type (interne/externe), un auditeur, un framework cible, une liste de controles dans le perimetre, des dates planifiees.
- Statuts de l'audit : Planned -> In Progress -> Completed -> Closed.

**US-V2-016** : En tant que Compliance Officer, je veux cloturer formellement un audit avec un resume et des recommandations, afin de finaliser le processus.

Criteres d'acceptation :
- La cloture enregistre la date, l'utilisateur, un resume et un statut global.
- Tous les findings rattaches doivent avoir un statut (pas de finding "draft" sans statut a la cloture).
- Un AuditLog est genere pour la cloture.

---

### 4.7 FR-V2-007 : Dashboard avance

**Description :** Fournir un tableau de bord complet avec des metriques de conformite, risques et audits.

**User Stories :**

**US-V2-017** : En tant que CISO/RSSI, je veux consulter un tableau de bord synthetique montrant l'etat de conformite global, le nombre de risques par niveau, et les actions correctives en retard, afin d'avoir une vision d'ensemble rapide.

Criteres d'acceptation :
- Widgets : taux de conformite par framework (%), repartition des risques par niveau (heatmap), nombre de findings ouverts par severite, actions correctives en retard, politiques expirant dans les 30 jours.
- Toutes les donnees sont calculees en temps reel depuis la base (deterministe).
- Filtrable par organisation / business unit.

---

### 4.8 FR-V2-008 : Gestion hierarchique des Business Units

**User Stories :**

**US-V2-018** : En tant qu'Administrateur, je veux creer des Business Units au sein de l'organisation, afin de structurer les politiques et les risques par departement.

Criteres d'acceptation :
- Une BU a un nom et un parent optionnel (hierarchie arborescente).
- Les politiques, risques et controles peuvent etre rattaches a une BU.
- Le dashboard peut filtrer par BU.

---

### 4.9 FR-V2-009 : Roles et permissions avances

**Description :** Ajouter les roles manquants identifies dans le CdC v1 comme "TO VALIDATE".

**Nouveaux roles :**

| Role | Permissions | Source |
|------|------------|--------|
| CISO / RSSI | Lecture globale, acces dashboard, validation decisions sensibles | CdC v1 Section 10 |
| Auditor | Consultation preuves et statuts, creation/modification findings, pas de modification des controles | CdC v1 Section 10 |
| Risk Owner | Gestion risques de son perimetre, evaluation, traitement | CdC v1 Section 10, ADR-004 |
| End User | Consultation des politiques publiees uniquement | CdC v1 Section 10 |
| Policy Approver | Approbation dans le workflow de politique | Nouveau (FR-V2-003) |

---

### 4.10 FR-V2-020 a FR-V2-023 : AI Foundation (Phase 3)

**Prerequis :** Phase 2 stabilisee + TBD-06 (LLM provider) et TBD-11 (data policy) resolus.

**US-V2-020** : En tant que systeme, je veux extraire le texte des documents de politique (PDF, DOCX), le decouper en chunks et generer des embeddings, afin de preparer la recherche semantique.

Criteres d'acceptation :
- Pipeline : Upload document -> extraction texte -> chunking (taille configurable) -> embedding -> stockage pgvector.
- Les metadonnees du chunk (documentId, section, page) sont conservees.
- Le filtrage par permission est applique au niveau SQL (REGLE IA-07).
- La re-indexation se declenche automatiquement quand une politique est mise a jour.

**US-V2-021** : En tant que Compliance Officer, je veux evaluer la qualite du retrieval sur un jeu de 20 questions de reference, afin de valider la pertinence avant mise en production.

Criteres d'acceptation :
- Jeu de questions pre-defini avec reponses attendues.
- Metriques : precision@5, recall@5, MRR (Mean Reciprocal Rank).
- Seuil minimum a definir (TBD) avant activation de la recherche en production.

---

### 4.11 FR-V2-030 a FR-V2-033 : AI-GRC (Phase 4)

**Prerequis :** Phase 3 evaluee et validee.

**US-V2-030** : En tant qu'utilisateur GRC, je veux poser une question en langage naturel sur les politiques et obtenir une reponse avec citation de la source (document, section), afin de retrouver rapidement les informations pertinentes.

Criteres d'acceptation :
- La reponse cite obligatoirement le document et la section source (REGLE IA-02).
- Si aucune information pertinente n'est trouvee, le systeme repond "Information non disponible dans le contexte fourni" (REGLE IA-03).
- Le temps de reponse est inferieur a 10 secondes (NFR-V2-002).
- L'interaction est journalisee (question, sources recuperees, reponse generee) (REGLE IA-06).

**US-V2-031** : En tant que Compliance Officer, je veux que le systeme propose automatiquement des ecarts potentiels entre une politique et les exigences d'un referentiel, afin de faciliter mon analyse de conformite.

Criteres d'acceptation :
- Les ecarts proposes sont clairement marques comme "Proposition IA - Non officiel".
- Chaque proposition est accompagnee de la source utilisee.
- L'utilisateur peut accepter (cree un finding) ou rejeter (journalise le rejet) chaque proposition.
- L'IA ne modifie jamais directement un statut de conformite (REGLE IA-01).

**US-V2-032** : En tant que Compliance Officer, je veux que le systeme propose des mappings entre politiques/controles et exigences, afin d'accelerer le travail initial de mappage.

Criteres d'acceptation :
- Les propositions ont un statut "AI_Proposed" distinct de "Manual".
- La validation humaine est obligatoire pour qu'un mapping AI_Proposed devienne officiel.
- Chaque proposition est journalisee avec les sources et le score de confiance.

---

## 5. Exigences non fonctionnelles (Phase 2+)

| ID | Categorie | Exigence | Priorite |
|----|-----------|----------|----------|
| NFR-V2-001 | Security | Tout endpoint applique le RBAC AVANT la logique metier. OrganizationId et UserId extraits du token JWT, jamais du body client. | MUST HAVE |
| NFR-V2-002 | Performance | Recherche semantique retourne un resultat en moins de 10 secondes pour un corpus de 500 documents. | SHOULD HAVE |
| NFR-V2-003 | Auditability | Toute operation CREATE/UPDATE/DELETE genere une entree AuditLog. Si l'AuditLog echoue, l'operation echoue. | MUST HAVE |
| NFR-V2-004 | Testability | Chaque module a un minimum de 80% de couverture de tests unitaires sur la couche Application. Tests d'integration sur les repositories. | MUST HAVE |
| NFR-V2-005 | Data Integrity | Toutes les FK sont enforced au niveau base de donnees. Contraintes NOT NULL sur les champs requis. | MUST HAVE |
| NFR-V2-006 | Observability | Journalisation applicative structuree (Serilog) avec correlation ID par requete. | SHOULD HAVE |
| NFR-V2-007 | Idempotency | L'import d'un referentiel deja present est detecte et refuse (ou propose une mise a jour). | MUST HAVE |
| NFR-V2-008 | Configuration | Toutes les valeurs metier configurables (N jours de rappel, intervalle du worker, seuils d'alerte) sont dans appsettings.json, jamais hardcodees. | MUST HAVE |
| NFR-V2-009 | API Documentation | Tous les endpoints documentes via OpenAPI/Swagger avec schemas de requete et reponse. | MUST HAVE |
| NFR-V2-010 | AI Safety | L'IA ne recoit que le contexte filtre par permission. Le LLM ne stocke rien. Citations obligatoires. Refus explicite si contexte insuffisant. | MUST HAVE |

---

## 6. Architecture technique

### 6.1 Stack confirmee (heritee de Phase 1)

| Composant | Technologie | Statut |
|-----------|------------|--------|
| Backend | ASP.NET Core 8 (C#) | CONFIRMED (ADR-001) |
| ORM | Entity Framework Core 9 | CONFIRMED (ADR-002) |
| Base de donnees | PostgreSQL 16 | CONFIRMED (ADR-002) |
| Base vectorielle | pgvector (extension PostgreSQL) | CONFIRMED (ADR-005) |
| Auth (dev) | ASP.NET Core Identity + JWT | CONFIRMED (ADR-003) |
| Auth (prod) | Keycloak 25 (OIDC) | CONFIRMED (ADR-003) |
| Frontend | React 19 + TypeScript + Vite | CONFIRMED |
| Stockage fichiers | MinIO (IFileStorage) | CONFIRMED (ADR-006) |
| Email | MailKit / SMTP (Mailpit en dev) | CONFIRMED (ADR-007) |

### 6.2 Ajouts techniques Phase 3

| Composant | Technologie | Statut |
|-----------|------------|--------|
| Modele d'embeddings | TBD (OpenAI text-embedding-3-small PROPOSE) | TBD-06 a resoudre |
| LLM provider | TBD (Azure OpenAI PROPOSE, Ollama local ALTERNATIVE) | TBD-06 a resoudre |
| Orchestration IA | Semantic Kernel (PROPOSE) | TBD |
| Extraction texte | Apache Tika ou iTextSharp (PROPOSE) | TBD |

### 6.3 Pattern architectural

Le Modular Monolith (Clean Architecture) est maintenu. Chaque nouveau module (Finding, Asset, Workflow) est un sous-dossier dans la couche Application avec ses Commands, Queries et DTOs.

```
Backend/
  Draxlmaier.GRC.Domain/
    Entities/
      Asset.cs          [NOUVEAU]
      RiskTreatment.cs  [NOUVEAU]
      RiskControl.cs    [NOUVEAU]
      Finding.cs        [NOUVEAU]
      CorrectiveAction.cs [NOUVEAU]
      PolicyVersion.cs  [NOUVEAU]
      ApprovalStep.cs   [NOUVEAU]
      BusinessUnit.cs   [NOUVEAU]
      AlertRule.cs      [NOUVEAU]
    Enums/
      FindingSeverity.cs  [NOUVEAU]
      FindingType.cs      [NOUVEAU]
      TreatmentType.cs    [NOUVEAU]
      ApprovalStatus.cs   [NOUVEAU]
  Draxlmaier.GRC.Application/
    Assets/              [NOUVEAU]
    Findings/            [NOUVEAU]
    CorrectiveActions/   [NOUVEAU]
    Workflows/           [NOUVEAU]
    Reporting/           [NOUVEAU]
    AI/                  [NOUVEAU - Phase 3]
  Draxlmaier.GRC.Infrastructure/
    AI/                  [NOUVEAU - Phase 3]
      EmbeddingService.cs
      VectorSearchService.cs
      RagOrchestrator.cs
  Draxlmaier.GRC.Api/
    Controllers/
      AssetsController.cs      [NOUVEAU]
      FindingsController.cs    [NOUVEAU]
      ActionsController.cs     [NOUVEAU]
      WorkflowController.cs    [NOUVEAU]
      ReportingController.cs   [NOUVEAU]
      AIController.cs          [NOUVEAU - Phase 3]
```

---

## 7. Sequence d'implementation

```
STEP 10 : Core GRC Stabilization       -> Phase 1 terminee (prerequis absolu)
STEP 11 : Asset Management             -> STEP 10 done
STEP 12 : Risk Completion              -> STEP 11 done (RiskTreatment, RiskControl)
STEP 13 : Business Unit Hierarchy      -> STEP 10 done
STEP 14 : Advanced Roles et RBAC       -> STEP 13 done
STEP 15 : Full Audit Process           -> STEP 14 done
STEP 16 : Finding et Corrective Actions -> STEP 15 done
STEP 17 : Policy Versioning            -> STEP 14 done
STEP 18 : Policy Approval Workflow     -> STEP 17 done
STEP 19 : Multi-Framework Support      -> STEP 14 done
STEP 20 : SoA Report Generation        -> STEP 19 done
STEP 21 : Advanced Dashboard           -> STEP 12, 16, 19 done
STEP 22 : Configurable Alerts          -> STEP 21 done
STEP 23 : Phase 2 Stabilization        -> STEP 11-22 done
---
STEP 24 : AI — Document Ingestion      -> STEP 23 done + TBD-06 resolved
STEP 25 : AI — Embeddings et Vector    -> STEP 24 done
STEP 26 : AI — Retrieval Pipeline      -> STEP 25 done
STEP 27 : AI — Evaluation              -> STEP 26 done
STEP 28 : Phase 3 Stabilization        -> STEP 24-27 done + evaluation reussie
---
STEP 29 : AI — Semantic Search         -> STEP 28 done
STEP 30 : AI — Gap Detection           -> STEP 29 done
STEP 31 : AI — Mapping Proposals       -> STEP 30 done
STEP 32 : Phase 4 Stabilization        -> STEP 29-31 done
---
STEP 33 : MCP Server                   -> STEP 32 done + decision explicite
STEP 34 : MCP Permissions et Logging   -> STEP 33 done
```

**Regle : aucune etape ne peut etre sautee ou inversee sans ADR approuve.**

---

## 8. Criteres d'acceptation globaux (Phase 2)

Le GRC Avance est considere comme DONE quand :

- [ ] Un administrateur peut creer des assets et y rattacher des risques.
- [ ] Un Risk Owner peut definir un traitement de risque et lier des controles a un risque.
- [ ] Le score de risque residuel est calcule et affiche.
- [ ] Un Compliance Officer peut creer un finding a partir d'un audit et y assigner une action corrective.
- [ ] Les actions correctives en retard sont identifiees automatiquement.
- [ ] Une politique peut etre soumise a un workflow d'approbation multi-etapes.
- [ ] Le systeme gere au moins 2 referentiels normatifs simultanement.
- [ ] Un rapport SoA est generable en PDF pour un referentiel donne.
- [ ] Le processus d'audit couvre planification, execution, findings et cloture.
- [ ] Le dashboard affiche les metriques de conformite, risques et remediations.
- [ ] Tous les nouveaux endpoints appliquent le RBAC avec OrganizationId extrait du token.
- [ ] Toute operation d'ecriture genere un AuditLog.
- [ ] La couverture de tests est d'au moins 80% sur la couche Application.
- [ ] L'API est entierement documentee via Swagger.

---

## 9. Criteres d'acceptation globaux (Phase 3-4 — IA)

- [ ] Le pipeline d'ingestion extrait, chunke et genere des embeddings pour au moins 50 documents.
- [ ] La recherche semantique retourne des resultats pertinents avec citation de source.
- [ ] Le retrieval est filtre par permission au niveau SQL (pas par le LLM).
- [ ] L'evaluation sur le jeu de reference atteint le seuil minimum defini.
- [ ] Le systeme repond "Information non disponible" si le contexte est insuffisant.
- [ ] Toute interaction IA est journalisee.
- [ ] Le systeme reste 100% fonctionnel si la couche IA est desactivee.

---

## 10. Risques du CdC v2

| ID | Description | Probabilite | Impact | Mitigation |
|----|-------------|------------|--------|------------|
| RSK-V2-01 | Sur-scope Phase 2 (12+ modules) deborde le temps disponible | Elevee | Eleve | Prioriser les MUST HAVE. Les SHOULD HAVE sont differables. |
| RSK-V2-02 | Complexite du workflow d'approbation sous-estimee | Moyenne | Moyen | Commencer par un workflow a 2 etapes maximum. Generaliser ensuite. |
| RSK-V2-03 | TBD-06 (LLM provider) non resolu bloque toute la Phase 3 | Elevee | Eleve | Commencer par un modele local (Ollama) en dev. Decider pour la prod separement. |
| RSK-V2-04 | Qualite du retrieval insuffisante pour la production | Moyenne | Eleve | Phase d'evaluation obligatoire (STEP 27) avant activation. |
| RSK-V2-05 | Migration de donnees Phase 1 vers schema Phase 2 | Moyenne | Moyen | Scripts de migration EF Core testes sur copie de la base avant application. |

---

## 11. Decisions ouvertes (TBD Phase 2)

| ID | Question | Bloque | Statut |
|----|---------|--------|--------|
| TBD-V2-01 | Nombre d'etapes dans le workflow d'approbation de politique (fixe ou configurable ?) | STEP 18 | OPEN |
| TBD-V2-02 | Formule exacte du score de risque residuel | STEP 12 | OPEN |
| TBD-V2-03 | Liste des referentiels normatifs a supporter en Phase 2 (ISO 9001 ? TISAX ? BSI ?) | STEP 19 | OPEN |
| TBD-V2-04 | Format du rapport SoA (template PDF personnalise ou generique ?) | STEP 20 | OPEN |
| TBD-V2-05 | Seuil quantitatif de qualite de retrieval (precision@5 minimum) | STEP 27 | OPEN |
| TBD-V2-06 | Modele LLM et modele d'embeddings (heritage de TBD-06 CdC v1) | STEP 24 | OPEN |
| TBD-V2-07 | Donnees autorisees a etre envoyees au LLM (heritage de TBD-11 CdC v1) | STEP 24 | OPEN |

---

## 12. Glossaire (ajouts Phase 2)

| Terme | Definition |
|-------|-----------|
| SoA | Statement of Applicability — rapport listant toutes les exigences d'un referentiel et leur statut d'applicabilite et de conformite |
| Finding | Constat formel issu d'un audit (non-conformite, observation, opportunite d'amelioration) |
| Corrective Action | Action assignee a un responsable pour remedier a un finding, avec echeance et suivi |
| Asset | Actif de l'organisation (systeme, processus, donnee) expose a des risques |
| Risk Treatment | Decision de traitement d'un risque (accepter, attenuer, transferer, eviter) |
| Business Unit | Unite organisationnelle (departement, equipe) au sein de l'organisation |
| Policy Version | Version numerotee d'un document de politique, avec historique d'approbation |
| Approval Workflow | Circuit de validation formel d'un document avant publication |
| Residual Risk Score | Score de risque apres application des mesures de traitement et des controles |
| Heatmap | Representation visuelle matricielle des risques par probabilite et impact |

---

## 13. Historique du document

| Version | Date | Auteur | Description |
|---------|------|--------|-------------|
| 2.0.0 | 2026-08-19 | Mohamed Abidi | Creation initiale — CdC Phase 2 (GRC Avance) + Phase 3-4 (AI) + Phase 5 (MCP) |

---

> **Fin du Cahier des Charges v2.0.0 — 2026-08-19**  
> Ce document necessite validation par l'encadreur avant toute implementation.
