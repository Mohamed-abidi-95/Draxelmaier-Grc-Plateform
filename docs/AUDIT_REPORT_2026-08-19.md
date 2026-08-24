# RAPPORT D'AUDIT GRC — DRAXLMAIER GRC Platform (PFE1)

> **Auditeur :** Senior GRC Software Auditor  
> **Date de l'audit :** 2026-08-19  
> **Source de verite :** PROJECT_MASTER.md v1.2.0, PROJECT_RULES.md v1.0.0, CdC v1.0.0, ADR-001 a ADR-007  
> **Methode :** Lecture directe du code source — 100% des controleurs, handlers, entites Domain, DbContext, Workers  
> **Regle absolue :** Aucune conclusion basee sur un commentaire ou un nom de fonction. Chaque verdict vient de la lecture du code.

---

# 1. TABLEAU DE CONFORMITE AU CAHIER DES CHARGES

## 1.1 MUST HAVE (FR-001 a FR-008)

| ID | Fonctionnalite | Statut CdC | Code existe ? | Conforme criteres acceptation ? | Ecart |
|----|---------------|-----------|--------------|--------------------------------|-------|
| FR-001 | Ingestion de politiques (upload PDF/DOCX, titre, proprietaire, date expiration, organisation) | MUST HAVE | OUI — PoliciesController, DocumentsController, CreatePolicyCommandHandler | PARTIEL | CreatePolicyCommand accepte OwnerId en string sans verifier que l'utilisateur existe en base. OrganizationId provient du client sans re-verification. DocumentsController.UploadDocument a un hardcode UserId = "user-from-claims" — l'ID utilisateur reel n'est jamais extrait des claims. |
| FR-002 | Import referentiel de conformite (ISO 27001, format TBD) | MUST HAVE | OUI — FrameworksController, ImportFrameworkCsvCommand | PARTIEL | L'import CSV fonctionne logiquement. Cependant TBD-09 (format d'import) est marque OPEN dans les docs mais le code a tranche silencieusement pour CSV. Absence de validation de doublons. |
| FR-003 | Recherche semantique en langage naturel sur les politiques | SHOULD HAVE | UI uniquement | NON CONFORME | AIAssistantView.tsx est une maquette avec reponses hardcodees via setTimeout(), sans aucun appel backend reel. Aucun endpoint /api/v1/ai/search cote backend. |
| FR-004 | Assistance a la detection d'ecarts | SHOULD HAVE | ABSENT | NON APPLICABLE | Aucun code backend. L'UI mentionne GDPR dans les suggestions — hors scope MVP. |
| FR-005 | Collecte de preuves rattachees a un element de conformite | MUST HAVE | OUI — EvidenceController, UploadEvidenceCommand | PARTIEL | Logique coherente. Mais OrganizationId provient du formulaire client, jamais re-verifie cote serveur. Aucun AuditLog genere apres upload. Pas d'endpoint de telechargement individuel (US-015 non satisfait). |
| FR-006 | Piste d'audit immuable | MUST HAVE | **ABSENT** | **NON CONFORME — BLOQUANT** | L'entite AuditLog est totalement inexistante dans le Domain, le DbContext, et l'interface IApplicationDbContext. Aucun handler ne genere d'entree de trace. La recherche AuditLog dans tous les .cs retourne zero resultat. |
| FR-007 | Controle d'acces RBAC — minimum 2 roles | MUST HAVE | PARTIEL | **NON CONFORME — BLOQUANT** | Les roles sont crees en seed (Administrator, ComplianceOfficer, RiskOwner, PolicyOwner). Mais POST /auth/register est entierement public et permet a n'importe qui de creer un compte avec n'importe quel role, y compris Administrator. |
| FR-008 | Rappel email N jours avant expiration (N configurable) | MUST HAVE | OUI — PolicyReminderWorker, SendPolicyRemindersCommandHandler | PARTIEL | Le mecanisme existe. Mais N est hardcode a 30 jours (non configurable). Le lookup email proprietaire utilise un fallback fragile : policy.OwnerId.Contains("@") — en ASP.NET Identity OwnerId est un GUID, donc tous les emails iront a "owner@draxlmaier.local" (adresse fictive). |

## 1.2 SHOULD HAVE

| ID | Fonctionnalite | Code existe ? | Conforme ? | Ecart |
|----|---------------|--------------|-----------|-------|
| SHOULD-1 | Statut conformite (conforme / NC / NA) sur ControlMapping | OUI — UpdateControlMappingStatusCommand, PATCH /mappings/{id}/status | PARTIEL | Logique enum correcte. Aucun AuditLog genere lors du changement de statut. Un mapping peut passer a Compliant sans Evidence associee. |
| SHOULD-2 | Resultat simplifie d'audit | OUI — AuditsController, UpdateAuditResultCommand | PARTIEL | Auto-remplissage CompletedDate si Status == Completed. Mais AuditorId provient du client, non verifie cote serveur. |

## 1.3 COULD HAVE

| ID | Fonctionnalite | Code existe ? | Conforme ? | Ecart |
|----|---------------|--------------|-----------|-------|
| COULD-1 | Tableau de bord synthetique | OUI — DashboardController, GetDashboardMetricsQuery | A verifier | Controller present. Aucun role specifique impose au niveau de l'action GetMetrics(). |

## 1.4 HORS SCOPE MVP — mais implemente (ecart de scope)

| Fonctionnalite | Statut documentaire | Implemente | Ecart |
|---------------|--------------------|-----------|----|
| Risk Management | HORS MVP CdC (mais inclus via ADR-004) | Partiellement | ADR-004 ACCEPTED — inclusion legitimee. Mais le scope ADR-004 (Asset, RiskTreatment, RiskControl) n'est pas implemente. |
| AI Assistant (UI) | Phase 3 — FUTURE | UI maquette (non fonctionnelle) | AIAssistantView.tsx viole la sequence REGLE GRC-05. Tolere si purement decoratif. |

---

# 2. REVUE DE LOGIQUE METIER PAR MODULE

---

## 2.1 Module : Identity et RBAC

**Ce que le code est cense faire (CdC FR-007, REGLE GRC-01) :**
- Permettre a l'admin de creer des comptes utilisateurs avec roles definis
- Authentifier les utilisateurs via JWT
- Proteger tous les endpoints avec RBAC verifie avant execution

**Ce que le code fait REELLEMENT :**

- `POST /api/v1/auth/register` — entierement public, sans [Authorize] — accepte request.Role en clair depuis le corps HTTP. N'importe quel client non authentifie peut s'inscrire avec le role Administrator.
- La logique cree meme le role s'il n'existe pas encore (roleManager.CreateAsync(new ApplicationRole(request.Role))), ce qui signifie qu'un attaquant peut creer un role arbitraire non prevu.
- `POST /api/v1/auth/login` — correct, produit un JWT valide avec claims roles issus de la base.
- Le seed dans Program.cs cree 4 roles (Administrator, ComplianceOfficer, RiskOwner, PolicyOwner) — le role PolicyOwner n'est pas defini dans le CdC.

**Incoherences detectees :**

1. AuthController appelle directement ApplicationDbContext (violation Clean Architecture)
2. AuthController instancie Organization directement — bypass couche Application/CQRS
3. OrganizationId dans le JWT est inclus, mais aucun handler ne le re-verifie depuis les claims : les handlers recoivent OrganizationId depuis le body/form du client
4. L'endpoint register ne genere aucune entree AuditLog

**Severite :** BLOQUANT (faille de securite critique sur /register)

**Verifie comment :** Lecture directe de AuthController.cs L77-113 + Program.cs L109

---

## 2.2 Module : Organization Management

**Ce que le code est cense faire (CdC Section 11, US-004) :**
- Gerer une organisation unique (DRAXLMAIER) au MVP
- L'admin cree et liste les organisations

**Ce que le code fait REELLEMENT :**

- OrganizationsController : POST et GET proteges par [Authorize(Roles = "Administrator")] — correct.
- Le seed dans Program.cs cree automatiquement l'organisation DRAXLMAIER si elle n'existe pas — coherent avec le choix organisation unique.
- AuthController.Register cree aussi une organisation si elle n'existe pas — duplication de logique sans passer par le Use Case CreateOrganizationCommand.

**Incoherences detectees :**

1. Deux chemins de creation d'organisation : via OrganizationsController (correct) et via AuthController.Register (bypass CQRS)
2. Aucun AuditLog pour CreateOrganization

**Severite :** IMPORTANT

**Verifie comment :** Lecture de OrganizationsController.cs, AuthController.cs, Program.cs

---

## 2.3 Module : Policy Management

**Ce que le code est cense faire (CdC FR-001, US-005, US-006, US-007) :**
- Import de politique avec titre, proprietaire, date d'expiration, organisation
- Consultation de la liste
- Rappel email automatique N jours avant expiration

**Ce que le code fait REELLEMENT :**

- CreatePolicyCommand : accepte OwnerId (string), OrganizationId (Guid), ExpiryDate (nullable), DocumentId (Guid). Le handler cree l'entite sans valider que l'OwnerId correspond a un utilisateur reel en base, ni que l'OrganizationId correspond a l'organisation de l'utilisateur authentifie.
- PoliciesController.CreatePolicy : le commentaire lui-meme dit "Typically, we would get the OrganizationId and OwnerId from the authenticated user's claims. For MVP, we can assume it's passed in the command" — confirme que OrganizationId provient du client sans re-verification.
- PoliciesController.GetPolicies : filtre par organizationId passe en query param — toujours depuis le client.
- DocumentsController.UploadDocument : UserId = "user-from-claims" est une chaine hardcodee litterale — l'ID reel de l'utilisateur connecte n'est jamais transmis au handler.

**Incoherences detectees :**

1. OwnerId non valide contre la table AspNetUsers
2. OrganizationId jamais extrait du JWT — vient du client
3. UserId = "user-from-claims" — string litteral, non substitue par User.FindFirst(...)?.Value
4. Aucun AuditLog sur CREATE/UPDATE Policy
5. Le rappel email est envoye a "owner@draxlmaier.local" si OwnerId ne contient pas "@", ce qui est le cas si OwnerId est un GUID (format standard ASP.NET Identity)

**Severite :** BLOQUANT (donnees client non verifiees utilisees comme autorite ; email envoye a une adresse fictive)

**Verifie comment :** Lecture directe de PoliciesController.cs, DocumentsController.cs L44, CreatePolicyCommandHandler.cs, SendPolicyRemindersCommandHandler.cs L46

---

## 2.4 Module : Compliance Framework et Requirements

**Ce que le code est cense faire (CdC FR-002, US-008, US-009) :**
- Import d'un referentiel ISO 27001 via CSV
- Consultation des frameworks et de leurs exigences

**Ce que le code fait REELLEMENT :**

- ImportFrameworkCsvCommand : parse un CSV a 3 colonnes (Identifier, Title, Description). Logique correcte.

**Incoherences detectees :**

1. FrameworksController — [Authorize] au niveau classe uniquement. L'action POST /import n'a pas d'[Authorize(Roles="...")] — tout utilisateur authentifie, quel que soit son role, peut importer un referentiel.
2. Absence de verification de doublon : importer le meme framework deux fois cree deux entrees distinctes avec les memes requirements en double.
3. Aucun AuditLog sur l'import.
4. GET /frameworks et GET /frameworks/{id}/requirements — pas de [Authorize(Roles="...")] — OK seulement si tout utilisateur authentifie peut consulter.

**Severite :** IMPORTANT (droits d'import trop larges)

**Verifie comment :** Lecture de FrameworksController.cs, ImportFrameworkCsvCommand.cs

---

## 2.5 Module : Control Management

**Ce que le code est cense faire (CdC Section 11, US-012, US-013) :**
- Creer des controles internes
- Consulter les controles par exigence ou par organisation

**Ce que le code fait REELLEMENT :**

- ControlsController : [Authorize] au niveau classe. HttpPost et HttpGet n'ont aucun [Authorize(Roles="...")] — tout utilisateur authentifie peut creer un controle.
- GetControlsQuery filtre par OrganizationId provenant du query param client.

**Incoherences detectees :**

1. Aucune restriction de role sur la creation de controles
2. OrganizationId en query param — non re-verifie depuis le token
3. Aucun AuditLog

**Severite :** IMPORTANT

**Verifie comment :** Lecture de ControlsController.cs

---

## 2.6 Module : Compliance Mapping et Status

**Ce que le code est cense faire (CdC FR-001, FR-002, Section 12, US-010, US-011) :**
- Creer un lien Policy/Control vers Requirement
- Mettre a jour le statut (conforme / NC / NA)
- Origin: Manual (MVP)

**Ce que le code fait REELLEMENT :**

- CreateControlMappingCommand : valide qu'au moins PolicyId ou ControlId est fourni — correct. Origin = MappingOrigin.Manual hardcode — correct pour MVP.
- UpdateControlMappingStatusCommand : parse un enum ComplianceStatus depuis une string client — si la valeur est invalide, leve une ArgumentException (non encapsulee en 400 Bad Request propre).

**Incoherences detectees :**

1. MappingsController n'a aucun [Authorize] au niveau classe. Pattern fragile — si une nouvelle action est ajoutee sans annotation, elle sera publique par defaut.
2. Pas de verification que le RequirementId existe en base avant de creer le mapping
3. Un mapping peut recevoir le statut "Compliant" sans qu'aucune Evidence lui soit associee
4. Aucun AuditLog lors de changement de statut (violation NFR-003 et REGLE GRC-02)
5. ComplianceStatus parse depuis string client sans validation stricte

**Severite :** BLOQUANT (NFR-003 AuditLog absent sur changement statut conformite)

**Verifie comment :** Lecture de MappingsController.cs, CreateControlMappingCommand.cs, UpdateControlMappingStatusCommand.cs

---

## 2.7 Module : Evidence Management

**Ce que le code est cense faire (CdC FR-005, US-014, US-015) :**
- Upload d'un fichier de preuve lie a un ControlMapping
- Consultation et telechargement

**Ce que le code fait REELLEMENT :**

- UploadEvidenceCommand : verifie que le ControlMappingId existe en base avant de creer l'Evidence — correct. Utilise IFileStorage (MinIO) — conforme ADR-006/REGLE GRC-07.

**Incoherences detectees :**

1. OrganizationId dans UploadEvidenceCommand vient du formulaire client — non re-verifie contre le claim du token
2. UploadedBy = User.Identity?.Name ?? "system" — c'est l'email et non un UserId
3. EvidenceController : pas de [Authorize] au niveau classe — seules les actions individuelles ont des annotations. Pattern fragile.
4. Aucun endpoint GET /evidence/{id} pour telecharger un fichier individuel — seul GET /evidence/mapping/{mappingId} existe (liste). Le critere d'acceptation US-015 "telechargement d'une preuve" n'est PAS satisfait.
5. Aucun AuditLog a l'upload

**Severite :** BLOQUANT (US-015 non satisfait ; AuditLog absent)

**Verifie comment :** Lecture de EvidenceController.cs, UploadEvidenceCommand.cs

---

## 2.8 Module : Audit Trail (Piste d'audit immuable)

**Ce que le code est cense faire (CdC FR-006, NFR-003, REGLE GRC-02, Section 18) :**
- Journaliser de facon immuable toute creation, modification, suppression
- Format : User, Timestamp, Action, Entity type, Entity ID, Previous value, New value
- Caractere immuable : non modifiable par un utilisateur standard

**Ce que le code fait REELLEMENT :**

L'entite AuditLog est **totalement absente** du projet. Preuves :

- Aucun fichier AuditLog.cs dans Domain/Entities
- Aucune reference a AuditLog dans ApplicationDbContext.cs
- Aucune reference a AuditLog dans IApplicationDbContext.cs
- La recherche PowerShell sur tous les .cs du backend retourne zero resultat pour "AuditLog"
- Le commentaire dans CreateRiskCommand.cs ligne 44 ("// Normally we would also log to AuditTrail here") confirme que la feature est connue mais non implementee.

Cette absence rend chaque operation MUST HAVE non verifiable au sens du CdC Section 24.

**Severite :** BLOQUANT (FR-006 MUST HAVE, REGLE GRC-02, NFR-003)

**Verifie comment :** Recherche exhaustive PowerShell + lecture directe de tous les fichiers Domain et Infrastructure

---

## 2.9 Module : Risk Management

**Ce que le code est cense faire (ADR-004, US-017, US-018, US-019) :**
- Enregistrer un risque (US-017)
- Evaluer un risque probabilite x impact, score = PxI (US-018)
- Lier un controle a un risque (US-019)
- Entites : Asset, Risk, RiskAssessment, RiskTreatment, RiskControl

**Ce que le code fait REELLEMENT :**

- Risk.cs : modelise (Id, Title, Description, OrganizationId, OwnerId, Status, Assessments). FK vers AspNetUsers configuree.
- RiskAssessment.cs : modelise avec Score = Probability * Impact — le calcul est effectue dans le handler AssessRiskCommand — conforme ADR-004.

**Entites manquantes (violation ADR-004) :**

- Asset : ABSENT du Domain et du DbContext — search PowerShell retourne zero resultat
- RiskTreatment : ABSENT — idem
- RiskControl (table de liaison N:N Risk vers Control) : ABSENT — idem

**Routes API manquantes (specifiees dans ADR-004 mais non implementees) :**

- GET /api/v1/assets, POST /api/v1/assets — absents
- PUT /api/v1/risks/{id} — absent (seul POST et GET implementes)
- POST /api/v1/risks/{id}/treatments — absent
- POST /api/v1/risks/{id}/controls — absent (US-019 non satisfait)

**Incoherence de validation :**

- AssessRiskCommand accepte Probability et Impact sans les valider dans la plage [1-5] — un client peut envoyer Probability = 100, Impact = 100, Score = 10000
- OwnerId dans CreateRiskCommand provient du client — non re-verifie cote serveur

**Severite :** IMPORTANT (ADR-004 partiellement non respecte)

**Verifie comment :** Lecture de Risk.cs, RiskAssessment.cs, RisksController.cs, CreateRiskCommand.cs, AssessRiskCommand.cs, ApplicationDbContext.cs + recherche PowerShell

---

## 2.10 Module : Audit Management (Simplifie)

**Ce que le code est cense faire (CdC SHOULD HAVE, US-016) :**
- Creer un audit lie a un framework
- Mettre a jour le resultat (conforme / NC / NA)

**Ce que le code fait REELLEMENT :**

- UpdateAuditResultCommand : gere correctement la transition Status vers Completed avec auto-remplissage de CompletedDate. Logique coherente.

**Incoherences detectees :**

1. AuditorId provient du body client (CreateAuditCommand.AuditorId) — non extrait du token
2. Pas d'AuditLog sur creation/modification d'audit
3. Le role Auditor mentionne dans PROJECT_MASTER.md Section 3.2 comme persona "TO VALIDATE" n'est pas dans le seed

**Severite :** IMPORTANT

**Verifie comment :** Lecture de AuditsController.cs, CreateAuditCommand.cs, UpdateAuditResultCommand.cs

---

## 2.11 Module : Notifications (Email Reminder)

**Ce que le code est cense faire (CdC FR-008, US-007, US-022) :**
- Email automatique au proprietaire N jours avant expiration (N configurable)

**Ce que le code fait REELLEMENT :**

- PolicyReminderWorker appelle SendPolicyRemindersCommand { DaysBeforeExpiration = 30 } — N = 30 hardcode.
- SendPolicyRemindersCommandHandler : recupere les politiques dont ExpiryDate est dans la fenetre [targetDate, targetDate+1j]. Logique de fenetre exacte a une journee — correct pour un worker quotidien, mais le worker tourne toutes les minutes avec Task.Delay(TimeSpan.FromMinutes(1)).
- Resolution de l'email : policy.OwnerId.Contains("@") — en ASP.NET Identity, OwnerId est un GUID (ex: "a3f4b2..."), donc cette condition sera toujours fausse en production. Resultat : tous les emails de rappel iront a "owner@draxlmaier.local" — adresse fictive.

**Severite :** BLOQUANT (FR-008 ne peut pas fonctionner correctement ; N non configurable ; adresse email incorrecte)

**Verifie comment :** Lecture de PolicyReminderWorker.cs L37-51, SendPolicyRemindersCommandHandler.cs L46

---

# 3. STATUTS D'AVANCEMENT SUREVALUES

## STEP 01 : Platform Foundation — statut [x] (Completed)

**Observation :** Le DbContext, les NuGet, Docker Compose sont en place. Mais context.Database.Migrate() est commente dans Program.cs ligne 101. La migration n'est pas appliquee automatiquement. **Statut partiellement surestime** — le "Completed" ne peut pas etre "Tested" si les migrations ne s'appliquent pas automatiquement.

## STEP 02 : Identity et RBAC — statut [/] (In Progress)

**Ce que le PROJECT_STATE.md dit :** "Entites creees, mais faille de securite sur l'inscription et manque l'AuditLog"  
**Ce que le code confirme :** Exact — la faille POST /register public est presente. AuditLog absent. **Statut correctement evalue a [/].**

## STEP 02b : Risk Management — statut [/] (Partial)

**Ce que le PROJECT_STATE.md dit :** "Risk partiellement present, mais entites Asset, RiskTreatment, RiskControl manquantes"  
**Ce que le code confirme :** Exact et verifie — les 3 entites manquent. Les routes API ADR-004 (treatments, controls sur risk, assets) ne sont pas implementees. **Statut correctement evalue a [/].**

## STEP 13 : AI Foundation / RAG — statut [/]

**Ce que le PROJECT_STATE.md dit :** "VIOLE LA SEQUENCE ACTUELLEMENT : AIAssistantView.tsx anticipe dans le frontend"  
**Ce que le code confirme :** Exact — AIAssistantView.tsx est une maquette avec reponses hardcodees (setTimeout, pas de backend). Auto-identification correcte de la violation.

## Modules marques [ ] (Planned) — STEP 03 a STEP 09

Coherent avec le code. Aucun handler specifique a ces steps n'est pleinement operationnel.

**Note generale :** Le PROJECT_STATE.md est remarquablement honnete sur les anomalies detectees. Son contenu est corrobore par le code source. Il n'y a pas de cas ou un STEP est marque [x] de facon injustifiee (hormis STEP 01 qui est legerement surestime).

---

# 4. TBD TRANCHES SANS MISE A JOUR DOCUMENTAIRE

| TBD | Statut PROJECT_RULES.md | Statut PROJECT_MASTER.md | Realite dans le code | Verdict |
|-----|------------------------|--------------------------|---------------------|---------|
| TBD-01 (framework backend) | OPEN (Partie 6, L260) | RESOLVED (ADR-001) | ASP.NET Core 8 implemente | INCOHERENCE : PROJECT_RULES.md non mis a jour |
| TBD-02 (base de donnees) | OPEN (Partie 6, L261) | RESOLVED (ADR-002) | PostgreSQL + EF Core 9 implemente | INCOHERENCE : PROJECT_RULES.md non mis a jour |
| TBD-03 (auth) | OPEN (Partie 6, L262) | RESOLVED (ADR-003) | JWT local implemente | INCOHERENCE : PROJECT_RULES.md non mis a jour |
| TBD-04 (email) | absent Partie 6 | RESOLVED (ADR-007) | SmtpEmailService implemente | Coherent |
| TBD-08 (stockage fichiers) | RESOLVED | RESOLVED (ADR-006) | MinIO (IFileStorage) implemente | Coherent |
| TBD-09 (format import ISO 27001) | OPEN (Partie 6, L270) | OPEN (Section 23) | **CSV tranche dans le code** (ImportFrameworkCsvCommand utilise CsvHelper) + iso27001_sample.csv a la racine du projet | **TBD TRANCHE SILENCIEUSEMENT** : le format CSV a ete choisi et implemente sans ADR ni mise a jour documentaire |
| TBD-RISK | absent Partie 6 | RESOLVED (ADR-004) | Risk module partiellement implemente | Coherent |
| TBD-06 (LLM provider) | OPEN | OPEN | Aucune implementation LLM cote backend | Coherent |

**Preuve du TBD-09 tranche silencieusement :**

- Fichier iso27001_sample.csv a la racine du projet
- Repertoire docs/datasets/ avec donnees CSV
- ImportFrameworkCsvCommand.cs utilisant la librairie CsvHelper
- Le format est CSV — decide dans le code sans ADR ni mise a jour du TBD-09

---

# 5. SYNTHESE DES ECARTS PAR SEVERITE

## BLOQUANT

| ID | Description | Fichier(s) concerne(s) |
|----|-------------|----------------------|
| B-01 | Faille de securite critique : POST /auth/register public — n'importe qui peut creer un compte Administrator | AuthController.cs L77-113 |
| B-02 | AuditLog totalement absent — FR-006 (MUST HAVE) non implemente, NFR-003 non respecte, REGLE GRC-02 violee sur 100% des operations d'ecriture | Tous les handlers — aucun fichier AuditLog.cs |
| B-03 | DocumentsController.UploadDocument : UserId hardcode "user-from-claims" (string litteral) — l'identite reelle n'est jamais transmise | DocumentsController.cs L44 |
| B-04 | Email de rappel envoye a une adresse fictive en production — OwnerId est un GUID (jamais un email), fallback "owner@draxlmaier.local" systematique | SendPolicyRemindersCommandHandler.cs L46 |
| B-05 | US-015 non satisfait — aucun endpoint de telechargement de preuve individuelle depuis MinIO | EvidenceController.cs |
| B-06 | Violation Clean Architecture — AuthController appelle ApplicationDbContext directement et cree des entites Organization | AuthController.cs L85-91 |

## IMPORTANT

| ID | Description | Fichier(s) concerne(s) |
|----|-------------|----------------------|
| I-01 | OrganizationId et OwnerId provenant du client non re-verifies depuis les claims JWT (multiples controleurs) | PoliciesController.cs, EvidenceController.cs, ControlsController.cs, RisksController.cs |
| I-02 | POST /frameworks/import — aucune restriction de role (tout utilisateur authentifie peut importer un referentiel) | FrameworksController.cs L26-46 |
| I-03 | POST /controls — aucune restriction de role (tout utilisateur authentifie peut creer un controle) | ControlsController.cs L25-30 |
| I-04 | Entites ADR-004 manquantes : Asset, RiskTreatment, RiskControl — 3 entites et 5 routes API ADR-004 non implementees | Domain/Entities, RisksController |
| I-05 | Validation Probability et Impact hors plage [1-5] — score de risque peut etre aberrant | AssessRiskCommand.cs L13-14 |
| I-06 | Import framework sans detection de doublons — idempotence non garantie | ImportFrameworkCsvCommand.cs |
| I-07 | PROJECT_RULES.md Partie 6 liste TBD-01, TBD-02, TBD-03 comme OPEN alors qu'ils sont resolus (ADRs existants) | docs/PROJECT_RULES.md L260-272 |
| I-08 | TBD-09 (format import ISO 27001) tranche silencieusement en CSV sans ADR ni mise a jour documentaire | ImportFrameworkCsvCommand.cs, iso27001_sample.csv |
| I-09 | PolicyReminderWorker : DaysBeforeExpiration = 30 hardcode (non configurable via appsettings) | PolicyReminderWorker.cs L37 |
| I-10 | Intervalle du worker : TimeSpan.FromMinutes(1) en production — commentaire indique "a changer" mais non corrige | PolicyReminderWorker.cs L51 |

## MINEUR

| ID | Description | Fichier(s) concerne(s) |
|----|-------------|----------------------|
| M-01 | Role PolicyOwner cree en seed mais non defini dans CdC FR-007 (qui n'exige que Admin + ComplianceOfficer minimum) | Program.cs L109 |
| M-02 | ComplianceStatus parse depuis string sans validation stricte — ArgumentException non transformee en 400 BadRequest | UpdateControlMappingStatusCommand.cs L43 |
| M-03 | Enum.TryParse sur AuditStatus et AuditResult dans UpdateAuditResultCommand : si l'un echoue, l'autre peut quand meme etre sauvegarde | UpdateAuditResultCommand.cs L32-39 |
| M-04 | MappingsController sans [Authorize] au niveau classe — pattern fragile pour l'ajout futur d'actions | MappingsController.cs L15 |
| M-05 | AIAssistantView.tsx repond avec des donnees hardcodees mentionnant GDPR (hors scope MVP, REGLE GRC-04) | AIAssistantView.tsx L85 |
| M-06 | context.Database.Migrate() commente dans Program.cs — les migrations ne s'appliquent pas automatiquement | Program.cs L101 |
| M-07 | Aucun projet de tests xUnit dans la solution — NFR-009 (Testability) non satisfait | Draxlmaier.GRC.slnx |

---

# 6. VERDICT GLOBAL DE CONFORMITE

## NON CONFORME pour :

### FR-006 — Piste d'audit (MUST HAVE)

**Preuve :** Zero reference a AuditLog dans l'ensemble du code source backend. L'entite n'existe pas dans le Domain, le DbContext, ou l'interface. Un commentaire dans CreateRiskCommand.cs ligne 44 confirme l'intention non realisee. Ecart bloquant absolu.

### FR-007 — RBAC complet (MUST HAVE)

**Preuve :** POST /api/v1/auth/register est public et accepte n'importe quel role depuis le body. La faille est directement lisible dans AuthController.cs L77. La REGLE GRC-01 est violee sur l'endpoint d'inscription.

### FR-008 — Rappel email fonctionnel (MUST HAVE)

**Preuve :** SendPolicyRemindersCommandHandler.cs L46 — la resolution d'email repose sur policy.OwnerId.Contains("@"). En ASP.NET Identity, OwnerId est un GUID, pas un email. En production, tous les rappels iraient a l'adresse fictive "owner@draxlmaier.local".

## PARTIELLEMENT CONFORME pour :

### FR-001 — Ingestion de politiques (MUST HAVE)

Entite et endpoints presents. Logique de base presente. Mais : UserId hardcode dans DocumentsController, OrganizationId non verifie depuis claims.

### FR-002 — Import referentiel ISO 27001 (MUST HAVE)

Fonctionne pour le format CSV. Mais TBD-09 tranche silencieusement. Pas de detection de doublons. Droits d'import insuffisamment restreints.

### FR-005 — Collecte de preuves (MUST HAVE)

Upload vers MinIO fonctionnel. Mais pas d'endpoint de telechargement (US-015 non satisfait). OrganizationId non verifie. Aucun AuditLog.

### Risk Management (ADR-004)

Risk et RiskAssessment presents. Score = PxI implemente. Mais Asset, RiskTreatment, RiskControl absents. Plusieurs routes ADR-004 non implementees.

## OUI (conforme) pour :

**Aucun module ne satisfait la Definition of Done complete** du PROJECT_MASTER.md Section 21 (qui exige AuditLog, tests, RBAC verifie sur tous les endpoints). Le plus proche de la conformite est le module Compliance Framework/Requirements qui a une logique de base coherente.

---

## Resume executif

Le projet est dans un etat de **developpement en cours (STEP 01-02b)**, coherent avec ce qu'indique PROJECT_STATE.md. La documentation de projet (PROJECT_MASTER.md, PROJECT_STATE.md) est **remarquablement honnete** sur les lacunes et a deja auto-identifie les problemes principaux.

Les ecarts majeurs — absence totale d'AuditLog, faille /register public, email de rappel brise, UserId hardcode — sont des anomalies connues qui necessitent correction avant toute validation du STEP 02 et avant de progresser vers les STEP 03 et suivants.

### Verifications SQL recommandees (lecture seule, a executer vous-meme) :

```sql
-- Verifier qu'aucune table AuditLog n'existe
SELECT table_name FROM information_schema.tables WHERE table_name ILIKE '%audit%';

-- Verifier les roles crees
SELECT "Name" FROM "AspNetRoles";

-- Verifier les utilisateurs et leurs roles
SELECT u."Email", r."Name" as "Role"
FROM "AspNetUsers" u
JOIN "AspNetUserRoles" ur ON u."Id" = ur."UserId"
JOIN "AspNetRoles" r ON r."Id" = ur."RoleId";

-- Verifier les frameworks importes (doublons potentiels)
SELECT "Name", COUNT(*) FROM "ComplianceFrameworks" GROUP BY "Name" HAVING COUNT(*) > 1;
```

---

> **Fin du rapport d'audit — 2026-08-19**  
> Aucun fichier n'a ete modifie. Aucun code de correction n'a ete genere. Audit uniquement.
