# Guide : Comment utiliser un AI Coding Assistant pour implementer le CdC v2
# DRAXLMAIER GRC — Implementation Step by Step

> **Date :** 2026-08-20  
> **Cible :** Ce guide est destine a Mohamed Abidi pour utiliser Gemini ou tout autre AI coding assistant  
> **Prerequis :** Avoir le Core GRC (Phase 1) stabilise et les bugs bloquants corriges avant de commencer Phase 2

---

## Regle numero 1 : Un STEP a la fois

Ne jamais donner tout le CdC v2 a l'IA en une seule fois.
L'IA doit recevoir exactement : **1 STEP + le contexte minimal necessaire**.

---

## Comment structurer un prompt pour l'IA

Chaque prompt doit contenir 5 blocs dans cet ordre :

```
[BLOC 1 — CONTEXTE PROJET]
Description du projet, stack technique, architecture.

[BLOC 2 — ETAT ACTUEL]
Ce qui existe deja (fichiers, entites, routes).

[BLOC 3 — TACHE DU STEP]
Ce que tu dois implementer exactement dans ce STEP.

[BLOC 4 — CONTRAINTES ABSOLUES]
Regles que tu ne dois jamais violer.

[BLOC 5 — LIVRABLE ATTENDU]
Ce que tu dois produire et dans quel format.
```

---

## Prompts prets a l'emploi — Phase 2

---

### STEP 11 : Asset Management

**Prompt a copier-coller dans Gemini :**

```
[CONTEXTE PROJET]
Je travaille sur une plateforme GRC (Governance Risk Compliance) en ASP.NET Core 8 / C#.
Architecture : Clean Architecture 4 couches (Domain / Application / Infrastructure / Api).
Pattern : CQRS avec MediatR. ORM : Entity Framework Core 9 + PostgreSQL.
Auth : JWT Bearer tokens. RBAC : roles Administrator, ComplianceOfficer, RiskOwner.

[ETAT ACTUEL]
Les entites suivantes existent deja dans Domain/Entities :
- Organization (Id Guid, Name, Description)
- Risk (Id Guid, Title, Description, OrganizationId Guid, OwnerId Guid, Status RiskStatus, CreatedAt)
- RiskAssessment (Id Guid, RiskId Guid, Probability int, Impact int, Score int, AssessorId Guid, AssessedAt DateTime)

Les DbSets dans IApplicationDbContext : Organizations, Risks, RiskAssessments.
L'ApplicationDbContext implemente IApplicationDbContext.

[TACHE DU STEP 11 — Asset Management]
Implementer le module Asset Management complet :

1. Creer l'entite Domain : Asset
   - Id : Guid
   - Name : string (required)
   - Description : string
   - Type : string (ex: "System", "Process", "Data", "People")
   - Criticality : enum AssetCriticality { Low, Medium, High, Critical }
   - OrganizationId : Guid (FK vers Organization)
   - OwnerId : Guid (FK vers AspNetUsers)
   - CreatedAt : DateTime
   - Risks : ICollection<Risk> (navigation)

2. Modifier l'entite Risk : ajouter AssetId Guid? (nullable FK vers Asset)

3. Creer le fichier AssetCriticality.cs dans Domain/Enums

4. Ajouter DbSet<Asset> Assets dans IApplicationDbContext et ApplicationDbContext

5. Creer la migration EF Core : AddAssetEntity

6. Creer les CQRS dans Application/Assets/Commands :
   - CreateAssetCommand (Title, Description, Type, Criticality string, OrganizationId, OwnerId) → retourne Guid
   - CreateAssetCommandHandler

7. Creer Application/Assets/Queries :
   - GetAssetsQuery (OrganizationId) → retourne List<AssetDto>
   - AssetDto : Id, Name, Description, Type, Criticality, OwnerId, CreatedAt

8. Creer AssetsController dans Api/Controllers :
   - POST /api/v1/assets → [Authorize(Roles = "Administrator,RiskOwner")]
   - GET  /api/v1/assets?organizationId=[guid] → [Authorize]
   - GET  /api/v1/assets/{id} → [Authorize]

[CONTRAINTES ABSOLUES]
- OrganizationId est TOUJOURS extrait du JWT claim (pas du body client).
  Dans le controller : var orgId = Guid.Parse(User.FindFirst("OrganizationId")!.Value);
- Tout endpoint est protege par [Authorize] au niveau classe au minimum.
- Aucune logique metier dans les Controllers. Tout passe par MediatR Send().
- Ne pas modifier les fichiers existants Risk.cs ou ApplicationDbContext.cs sans montrer le diff complet.
- Generer un AuditLog apres chaque CreateAsset (meme si AuditLog n'est pas encore implemente,
  ajouter un commentaire // TODO: AuditLog - CreateAsset).

[LIVRABLE ATTENDU]
Produire exactement les fichiers suivants (un par un avec le contenu complet) :
1. Domain/Entities/Asset.cs
2. Domain/Enums/AssetCriticality.cs
3. Domain/Entities/Risk.cs (diff par rapport a l'existant)
4. Application/Common/Interfaces/IApplicationDbContext.cs (diff)
5. Infrastructure/Data/ApplicationDbContext.cs (diff)
6. Application/Assets/Commands/CreateAssetCommand.cs
7. Application/Assets/Queries/GetAssetsQuery.cs
8. Application/Assets/DTOs/AssetDto.cs
9. Api/Controllers/AssetsController.cs
10. Infrastructure/Data/Migrations/[timestamp]_AddAssetEntity.cs (schema uniquement, pas le Designer)

Apres chaque fichier, confirme : "Fichier X — OK"
A la fin, donne la liste des tests unitaires a ecrire pour CreateAssetCommandHandler.
```

---

### STEP 12 : Risk Completion (RiskTreatment + RiskControl)

**Prompt a copier-coller :**

```
[CONTEXTE PROJET]
ASP.NET Core 8, Clean Architecture, CQRS MediatR, EF Core 9, PostgreSQL, JWT RBAC.
Roles : Administrator, ComplianceOfficer, RiskOwner.

[ETAT ACTUEL — apres STEP 11]
Entites existantes : Organization, Risk (avec AssetId nullable), RiskAssessment, Asset.
DbSets : Organizations, Risks, RiskAssessments, Assets.

Entites existantes dans le projet (Non modifiees) : Control (Id, Title, Description, OrganizationId).

[TACHE DU STEP 12 — Risk Completion]
1. Creer Domain/Entities/RiskTreatment.cs :
   - Id : Guid
   - RiskId : Guid (FK Risk)
   - Type : enum TreatmentType { Accept, Mitigate, Transfer, Avoid }
   - Description : string
   - ResponsibleId : Guid (FK AspNetUsers)
   - DueDate : DateTime?
   - Status : enum TreatmentStatus { Planned, InProgress, Completed }
   - CreatedAt : DateTime
   - Risk : Risk (navigation)

2. Creer Domain/Entities/RiskControl.cs (table de liaison N:N) :
   - RiskId : Guid (PK composite + FK Risk)
   - ControlId : Guid (PK composite + FK Control)
   - LinkedAt : DateTime
   - LinkedBy : Guid

3. Creer les enums TreatmentType.cs et TreatmentStatus.cs dans Domain/Enums

4. Ajouter dans IApplicationDbContext et ApplicationDbContext :
   DbSet<RiskTreatment> RiskTreatments
   DbSet<RiskControl> RiskControls

5. Configurer la PK composite de RiskControl dans OnModelCreating :
   modelBuilder.Entity<RiskControl>().HasKey(rc => new { rc.RiskId, rc.ControlId });

6. Creer Application/Risks/Commands :
   - CreateRiskTreatmentCommand (RiskId, Type string, Description, ResponsibleId, DueDate) → Guid
   - LinkControlToRiskCommand (RiskId, ControlId, LinkedBy Guid) → bool

7. Creer Application/Risks/Queries :
   - GetRiskTreatmentsQuery (RiskId) → List<RiskTreatmentDto>
   - GetRiskControlsQuery (RiskId) → List<ControlDto>

8. Ajouter dans RisksController :
   POST /api/v1/risks/{id}/treatments → [Authorize(Roles = "Administrator,RiskOwner")]
   GET  /api/v1/risks/{id}/treatments → [Authorize]
   POST /api/v1/risks/{id}/controls   → [Authorize(Roles = "Administrator,RiskOwner")]
   DELETE /api/v1/risks/{id}/controls/{controlId} → [Authorize(Roles = "Administrator,RiskOwner")]
   GET  /api/v1/risks/{id}/controls   → [Authorize]

9. Creer la migration : AddRiskTreatmentAndRiskControl

[CONTRAINTES ABSOLUES]
- OrganizationId et UserId TOUJOURS extraits du token JWT.
- PK composite de RiskControl configuree via Fluent API (pas d'annotation).
- Validation : Probability et Impact dans les AssessRiskCommand doivent etre valides entre 1 et 5.
  Si hors plage, retourner une ValidationException.

[LIVRABLE ATTENDU]
Meme format que STEP 11. Lister tous les fichiers produits.
```

---

### STEP 16 : Finding et Actions Correctives

**Prompt a copier-coller :**

```
[CONTEXTE PROJET]
ASP.NET Core 8, Clean Architecture, CQRS MediatR, EF Core 9, PostgreSQL, JWT RBAC.

[ETAT ACTUEL — apres STEP 15]
Module Audit complet existe :
- Audit (Id, Title, Description, OrganizationId, AuditorId, Status AuditStatus, Result AuditResult,
         PlannedDate, CompletedDate, TargetFrameworkId)
- ComplianceRequirement (Id, Identifier, Title, Description, FrameworkId)

[TACHE DU STEP 16 — Finding et Actions Correctives]
1. Creer Domain/Entities/Finding.cs :
   - Id : Guid
   - AuditId : Guid (FK Audit)
   - RequirementId : Guid? (FK ComplianceRequirement, nullable)
   - Title : string
   - Description : string
   - Type : enum FindingType { NonConformity, Observation, ImprovementOpportunity }
   - Severity : enum FindingSeverity { Critical, Major, Minor, Observation }
   - Status : enum FindingStatus { Open, InProgress, Closed, Accepted }
   - DetectedDate : DateTime
   - ClosedDate : DateTime?
   - DetectedBy : Guid (FK AspNetUsers)
   - CorrectiveActions : ICollection<CorrectiveAction> (navigation)

2. Creer Domain/Entities/CorrectiveAction.cs :
   - Id : Guid
   - FindingId : Guid (FK Finding)
   - Description : string
   - ResponsibleId : Guid (FK AspNetUsers)
   - DueDate : DateTime
   - Status : enum ActionStatus { Assigned, InProgress, Completed, Overdue }
   - CompletedDate : DateTime?
   - EvidenceId : Guid? (FK Evidence, nullable — preuve de resolution)
   - CreatedAt : DateTime
   - Finding : Finding (navigation)

3. Creer tous les enums dans Domain/Enums

4. Ajouter DbSets : Findings, CorrectiveActions

5. Commands a creer :
   - CreateFindingCommand (AuditId, RequirementId?, Title, Description, Type string, Severity string) → Guid
   - UpdateFindingStatusCommand (FindingId, Status string) → bool
   - CreateCorrectiveActionCommand (FindingId, Description, ResponsibleId, DueDate) → Guid
   - UpdateActionStatusCommand (ActionId, Status string, CompletedDate?) → bool

6. Queries a creer :
   - GetFindingsQuery (AuditId?, OrganizationId, Status?) → List<FindingDto>
   - GetCorrectiveActionsQuery (FindingId) → List<CorrectiveActionDto>

7. Controllers :
   POST /api/v1/findings → [Authorize(Roles = "Administrator,ComplianceOfficer")]
   GET  /api/v1/findings?auditId=[guid]&organizationId=[guid]&status=[string] → [Authorize]
   GET  /api/v1/findings/{id} → [Authorize]
   PATCH /api/v1/findings/{id}/status → [Authorize(Roles = "Administrator,ComplianceOfficer")]
   POST /api/v1/findings/{id}/actions → [Authorize(Roles = "Administrator,ComplianceOfficer")]
   GET  /api/v1/findings/{id}/actions → [Authorize]
   PATCH /api/v1/actions/{id}/status → [Authorize(Roles = "Administrator,ComplianceOfficer")]

8. Logique metier : un job background (ou calcul a la lecture) marque les actions comme "Overdue"
   si DueDate < DateTime.UtcNow et Status != Completed.

[CONTRAINTES ABSOLUES]
- Meme contraintes que les autres STEPs.
- Un Finding ne peut pas etre Closed si ses CorrectiveActions ont le statut Assigned ou InProgress.
  Retourner une BadRequest avec message explicite.

[LIVRABLE ATTENDU]
Liste complete des fichiers produits.
```

---

### STEP 24-25 : AI Foundation (Phase 3)

**Prompt a copier-coller (a utiliser APRES stabilisation Phase 2) :**

```
[CONTEXTE PROJET]
ASP.NET Core 8, Clean Architecture, CQRS, EF Core 9, PostgreSQL avec extension pgvector.
Les politiques sont stockees dans l'entite Policy avec un DocumentId lie a Document.
Les Documents ont un StorageKey dans MinIO (IFileStorage).

[TACHE DU STEP 24 — Document Ingestion Pipeline]
Implementer le pipeline d'ingestion de documents pour la recherche semantique :

1. Creer Domain/Entities/DocumentChunk.cs :
   - Id : Guid
   - DocumentId : Guid (FK Document)
   - ChunkIndex : int
   - Content : string (le texte du chunk)
   - Embedding : vector(1536) [type pgvector]
   - PageNumber : int?
   - Section : string?
   - TokenCount : int

2. Creer Infrastructure/AI/DocumentIngestionService.cs :
   - Methode IngestDocumentAsync(Guid documentId) :
     a. Telecharger le fichier depuis MinIO via IFileStorage
     b. Extraire le texte (PDF via iTextSharp OU PdfPig, DOCX via DocumentFormat.OpenXml)
     c. Decouper en chunks de 512 tokens avec overlap de 50 tokens
     d. Pour chaque chunk : generer un embedding via IEmbeddingService
     e. Sauvegarder les DocumentChunks avec leurs embeddings

3. Creer Application/Common/Interfaces/IEmbeddingService.cs :
   - Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken ct)

4. Creer Infrastructure/AI/OpenAIEmbeddingService.cs (ou OllamaEmbeddingService.cs) :
   - Appel API embeddings avec modele text-embedding-3-small
   - Retourne float[] de dimension 1536

5. Creer Application/Common/Interfaces/IVectorSearchService.cs :
   - Task<List<DocumentChunkResult>> SearchAsync(float[] queryEmbedding, Guid organizationId,
                                                   int topK, CancellationToken ct)

6. Creer Infrastructure/AI/PgVectorSearchService.cs :
   - Requete SQL : SELECT ... FROM "DocumentChunks" dc
     JOIN "Documents" d ON dc."DocumentId" = d."Id"
     JOIN "Policies" p ON d."Id" = p."DocumentId"
     WHERE p."OrganizationId" = @orgId
     ORDER BY dc."Embedding" <=> @queryEmbedding  [cosine distance pgvector]
     LIMIT @topK

IMPORTANT : Le filtrage OrganizationId est dans la requete SQL (pas dans le LLM).

7. Modifier DocumentsController : apres upload reussi, declencher en background :
   _backgroundJobService.Enqueue(() => ingestionService.IngestDocumentAsync(documentId))

[CONTRAINTES ABSOLUES IA]
- Le filtrage par permission est TOUJOURS au niveau SQL — jamais confie au LLM.
- Les embeddings ne sont generes que pour les documents de l'organisation du user.
- Ne jamais envoyer le contenu de plusieurs organisations dans le meme prompt LLM.
- Journaliser chaque appel embedding (documentId, tokenCount, timestamp).

[LIVRABLE ATTENDU]
Fichiers + migration pour ajouter la colonne vector a DocumentChunks + configuration pgvector.
```

---

## Template de rapport de STEP (a demander a l'IA a la fin de chaque STEP)

Ajoute toujours cette instruction a la fin de ton prompt :

```
A la fin de ton implementation, genere un rapport de STEP au format suivant :

## Rapport STEP [numero]

### Fichiers crees
- [liste]

### Fichiers modifies
- [fichier] : [ce qui a change]

### Routes API ajoutees
| Methode | Route | Role requis |
|---------|-------|-------------|
| POST | /api/v1/... | Administrator,RiskOwner |

### Migration EF Core
- Nom : [NomDeLaMigration]
- Tables creees : [liste]
- Tables modifiees : [liste avec colonnes ajoutees]

### Tests unitaires a ecrire
- [Handler] : cas nominal, cas entite introuvable, cas permission refusee

### TBD tranches dans ce STEP
- [si applicable]

### Bugs ou limitations connues
- [si applicable]
```

---

## Checklist avant de passer au STEP suivant

Avant de commencer le STEP N+1, verifier :

- [ ] Le projet compile sans erreur (`dotnet build`)
- [ ] La migration s'applique sans erreur (`dotnet ef database update`)
- [ ] Les nouveaux endpoints repondent via Swagger
- [ ] Les endpoints protected retournent 401 sans token
- [ ] Les endpoints protected retournent 403 avec le mauvais role
- [ ] Les AuditLog sont generes (une fois implementes)
- [ ] Mettre a jour PROJECT_STATE.md : passer le STEP de `[/]` a `[x]`

---

## Conseils pour bien utiliser Gemini (ou autre IA)

### Ce qui marche bien

1. **Donner le code existant** : copier-coller le contenu exact des fichiers concernes dans le prompt (pas juste le nom du fichier).
2. **Demander un fichier a la fois** : si le STEP produit 10 fichiers, demander "montre-moi d'abord Asset.cs, je confirme, puis passe a AssetCriticality.cs".
3. **Corriger explicitement** : si l'IA fait une erreur, ecrire "Non — tu as mis OwnerId en string, ca doit etre Guid. Refais uniquement Asset.cs avec cette correction."
4. **Valider avant de continuer** : coller le resultat dans Visual Studio et compiler AVANT de demander le fichier suivant.

### Ce qui ne marche pas

- "Implemente le module Risk complet" → trop vague, l'IA invente.
- "Continue" sans contexte → l'IA oublie les contraintes architecturales.
- Donner le CdC v2 entier → l'IA essaie de tout faire, produit du code incompatible.

### Format de session recommande

```
Session 1 : STEP 11 complet (Asset Management)
  → Valider, compiler, tester
  → Mettre a jour PROJECT_STATE.md

Session 2 : STEP 12 (Risk Completion)
  → Meme processus

Session 3 : STEP 13 (Business Units)
  → Meme processus

... etc.
```

Une session = un STEP = une journee de travail maximum.

---

## Ordre des sessions recommande (Phase 2)

| Session | STEP | Duree estimee | Prerequis |
|---------|------|--------------|-----------|
| 1 | STEP 10 — Corriger les bugs bloquants Phase 1 | 1-2j | Aucun |
| 2 | STEP 11 — Asset Management | 1j | STEP 10 |
| 3 | STEP 12 — Risk Completion | 1-2j | STEP 11 |
| 4 | STEP 13 — Business Units | 0.5j | STEP 10 |
| 5 | STEP 14 — Roles avances | 0.5j | STEP 13 |
| 6 | STEP 15 — Full Audit Process | 1j | STEP 14 |
| 7 | STEP 16 — Finding & Actions | 1-2j | STEP 15 |
| 8 | STEP 17 — Policy Versioning | 1j | STEP 14 |
| 9 | STEP 18 — Approval Workflow | 1-2j | STEP 17 |
| 10 | STEP 19 — Multi-Framework | 0.5j | STEP 14 |
| 11 | STEP 20 — SoA Report | 1j | STEP 19 |
| 12 | STEP 21 — Advanced Dashboard | 1j | STEP 12, 16, 19 |
| 13 | STEP 22 — Alertes configurables | 0.5j | STEP 21 |
| 14 | STEP 23 — Phase 2 Stabilization + Tests | 2-3j | Tous |

---

> **Document genere le 2026-08-20**  
> Ce guide est vivant : le mettre a jour au fur et a mesure des sessions.
