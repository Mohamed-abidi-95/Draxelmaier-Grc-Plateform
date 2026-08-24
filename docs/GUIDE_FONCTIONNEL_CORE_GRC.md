# GRC Core — Fonctionnalites implementees et parcours utilisateur
# Ce que vous pouvez faire aujourd'hui dans la plateforme

> **Date :** 2026-08-20  
> **Version Core GRC :** Phase 1 (implementation en cours — STEP 01-02b)  
> **Lecture :** Ce document decrit les fonctionnalites reellement implementees dans le code source, telles que verifiees par audit du 2026-08-19.  
> **Note :** Certaines fonctionnalites sont implementees mais ont des bugs connus (signales explicitement).

---

## Vue d'ensemble : qui fait quoi

```
Administrateur
  └─ Gere les utilisateurs, les organisations, importe les referentiels

Compliance Officer
  └─ Gere les politiques, les controles, les mappings, les preuves, les audits

Risk Owner
  └─ Cree et evalue les risques (module basique)

Tous les utilisateurs authentifies
  └─ Se connectent, voient le dashboard
```

---

## Module 1 : Authentification et Acces

### Ce que l'API permet

#### Creer un compte utilisateur
```
POST /api/v1/auth/register
Body: { "firstName": "Mohamed", "lastName": "Abidi", "email": "m@draxlmaier.com",
        "password": "...", "role": "ComplianceOfficer", "organizationName": "DRAXLMAIER" }
Retour: { "userId": "...", "token": "..." }
```
> ⚠️ Bug connu : cet endpoint est PUBLIC (pas de protection). N'importe qui peut creer un compte Administrator.

#### Se connecter
```
POST /api/v1/auth/login
Body: { "email": "m@draxlmaier.com", "password": "..." }
Retour: { "token": "eyJ...", "expiration": "..." }
```
> ✅ Fonctionnel. Le token JWT contient le role et l'OrganizationId.

#### Ce que contient le token JWT
- `sub` : UserId (Guid)
- `email` : adresse email
- `role` : ComplianceOfficer / Administrator / RiskOwner / PolicyOwner
- `OrganizationId` : Guid de l'organisation DRAXLMAIER

### Parcours utilisateur complet : Premiere connexion

```
1. [Admin] POST /auth/register  → cree le compte Admin + organisation DRAXLMAIER
2. [Admin] POST /auth/login     → obtient le token JWT Admin
3. [Admin] POST /auth/register  → cree un compte ComplianceOfficer
4. [CO]    POST /auth/login     → le ComplianceOfficer obtient son token
5. → Toutes les requetes suivantes utilisent ce token dans le header:
      Authorization: Bearer eyJ...
```

---

## Module 2 : Gestion des Organisations

### Ce que l'API permet (Administrator uniquement)

#### Creer une organisation
```
POST /api/v1/organizations
Header: Authorization: Bearer [token Admin]
Body: { "name": "DRAXLMAIER Tunisia", "description": "..." }
Retour: { "id": "...", "name": "DRAXLMAIER Tunisia" }
```

#### Lister les organisations
```
GET /api/v1/organizations
Header: Authorization: Bearer [token Admin]
Retour: [{ "id": "...", "name": "DRAXLMAIER Tunisia" }]
```

> ✅ Ce module est le plus conforme du systeme. RBAC Administrator-only respecte.

### Parcours utilisateur : Mise en place initiale

```
1. [Admin] Creer l'organisation DRAXLMAIER (une seule au MVP)
2. [Admin] Noter l'organizationId retourne → sera utilise dans tous les modules suivants
```

---

## Module 3 : Gestion des Politiques

### Ce que l'API permet

#### Uploader un document (PDF, DOCX)
```
POST /api/v1/documents/upload
Header: Authorization: Bearer [token CO]
Form-data:
  - file: [fichier PDF]
  - organizationId: [guid]
  - filename: "politique-securite-v1.pdf"
Retour: { "id": "...", "originalFilename": "...", "hashSha256": "...", "fileSize": 12345 }
```
> ✅ Fonctionnel : le fichier est upload dans MinIO, le hash SHA256 est calcule.  
> ⚠️ Bug connu : le champ UserId est hardcode "user-from-claims" au lieu d'extraire l'ID reel du token.

#### Creer une politique
```
POST /api/v1/policies
Header: Authorization: Bearer [token CO]
Body: {
  "title": "Politique de Securite de l'Information",
  "description": "PSI principale ISO 27001",
  "ownerId": "email@draxlmaier.com",
  "organizationId": "[guid organisation]",
  "expiryDate": "2027-08-19",
  "documentId": "[guid du document uploade ci-dessus]"
}
Retour: "[guid de la politique]"
```
> ✅ Fonctionnel : la politique est creee avec statut "Active".  
> ⚠️ Bug connu : l'OwnerId et l'OrganizationId sont acceptes tels quels depuis le body — non verifies depuis le token.

#### Lister les politiques d'une organisation
```
GET /api/v1/policies?organizationId=[guid]
Header: Authorization: Bearer [token CO]
Retour: [{ "id": "...", "title": "...", "status": "Active", "expiryDate": "..." }]
```

### Parcours utilisateur complet : Importer une politique

```
1. [CO] Upload du fichier PDF
        POST /api/v1/documents/upload
        → Obtient le documentId

2. [CO] Creation de la politique
        POST /api/v1/policies avec le documentId
        → Obtient le policyId

3. [Systeme] 30 jours avant la date d'expiration :
        → Email automatique envoye au proprietaire de la politique
        (⚠️ Bug : email envoye a "owner@draxlmaier.local" si OwnerId n'est pas un email valide)

4. [CO] Consultation de la liste
        GET /api/v1/policies?organizationId=[guid]
```

---

## Module 4 : Gestion de la Conformite (Referentiel + Mappings)

### Ce que l'API permet

#### Importer un referentiel ISO 27001 (via CSV)
```
POST /api/v1/frameworks/import
Header: Authorization: Bearer [token CO]
Form-data:
  - file: [fichier CSV avec colonnes: Identifier,Title,Description]
  - name: "ISO 27001:2022"
  - organizationId: [guid]
Retour: { "frameworkId": "...", "requirementsImported": 93 }
```
Format du fichier CSV attendu :
```csv
Identifier,Title,Description
A.5.1,Politiques de securite de l'information,Les politiques de securite...
A.5.2,Roles et responsabilites,...
```
> ✅ Fonctionnel : parse le CSV et cree le framework + toutes les exigences.  
> ⚠️ Bug connu : importer deux fois le meme CSV cree des doublons.

#### Lister les frameworks
```
GET /api/v1/frameworks?organizationId=[guid]
Header: Authorization: Bearer [token]
Retour: [{ "id": "...", "name": "ISO 27001:2022", "requirementsCount": 93 }]
```

#### Consulter les exigences d'un framework
```
GET /api/v1/frameworks/{frameworkId}/requirements
Header: Authorization: Bearer [token]
Retour: [{ "id": "...", "identifier": "A.5.1", "title": "...", "description": "..." }]
```

### Ce que l'API permet : Mappings

#### Creer un mapping Politique/Controle → Exigence
```
POST /api/v1/mappings
Header: Authorization: Bearer [token CO]
Body: {
  "requirementId": "[guid exigence]",
  "policyId": "[guid politique]",    // OU controlId, les deux optionnels mais au moins un
  "controlId": null,
  "organizationId": "[guid]"
}
Retour: "[guid du mapping]"
```

#### Mettre a jour le statut de conformite
```
PATCH /api/v1/mappings/{mappingId}/status
Header: Authorization: Bearer [token CO]
Body: { "status": "Compliant" }   // "Compliant" | "NonCompliant" | "NotApplicable"
Retour: true
```

#### Lister les mappings
```
GET /api/v1/mappings?organizationId=[guid]&requirementId=[guid optionnel]
Header: Authorization: Bearer [token]
Retour: [{ "id": "...", "status": "Compliant", "requirementId": "...", "policyId": "..." }]
```

### Parcours utilisateur complet : Evaluer la conformite ISO 27001

```
1. [Admin] Importer le referentiel ISO 27001
           POST /api/v1/frameworks/import avec le fichier CSV
           → Obtient le frameworkId

2. [CO]    Consulter les 93 exigences
           GET /api/v1/frameworks/{frameworkId}/requirements

3. [CO]    Pour chaque exigence couverte, creer un mapping
           POST /api/v1/mappings
           → Lie la politique ou le controle a l'exigence

4. [CO]    Evaluer et attribuer un statut
           PATCH /api/v1/mappings/{id}/status
           Body: { "status": "Compliant" }

5. [CO]    Consulter l'etat global des mappings
           GET /api/v1/mappings?organizationId=[guid]
```

---

## Module 5 : Gestion des Controles

### Ce que l'API permet

#### Creer un controle
```
POST /api/v1/controls
Header: Authorization: Bearer [token CO]
Body: {
  "title": "Controle d'acces aux serveurs",
  "description": "Restreindre l'acces physique aux salles serveurs",
  "organizationId": "[guid]",
  "requirementId": "[guid exigence optionnel]"
}
Retour: "[guid du controle]"
```

#### Lister les controles
```
GET /api/v1/controls?organizationId=[guid]
Header: Authorization: Bearer [token]
Retour: [{ "id": "...", "title": "...", "organizationId": "..." }]
```

### Parcours utilisateur : Documenter les mesures de securite

```
1. [CO] Creer les controles internes de l'organisation
        POST /api/v1/controls pour chaque mesure de securite

2. [CO] Relier un controle a une exigence ISO 27001 via un mapping
        POST /api/v1/mappings avec controlId au lieu de policyId

3. [CO] Marquer le statut
        PATCH /api/v1/mappings/{id}/status → "Compliant"
```

---

## Module 6 : Gestion des Preuves

### Ce que l'API permet

#### Uploader une preuve de conformite
```
POST /api/v1/evidence/upload
Header: Authorization: Bearer [token CO]
Form-data:
  - file: [fichier PDF/DOCX/image]
  - controlMappingId: [guid du mapping]
  - organizationId: [guid]
  - description: "Rapport d'audit 2025-Q3"
Retour: { "id": "...", "filename": "...", "uploadedAt": "..." }
```

#### Lister les preuves d'un mapping
```
GET /api/v1/evidence/mapping/{mappingId}
Header: Authorization: Bearer [token]
Retour: [{ "id": "...", "filename": "...", "description": "...", "uploadedAt": "..." }]
```

> ⚠️ Bug connu : il n'y a pas d'endpoint de telechargement individuel d'un fichier.  
> Pour telecharger, il faut acceder directement a MinIO.

### Parcours utilisateur : Justifier la conformite

```
1. [CO] Selectionner le mapping dont on veut prouver la conformite
2. [CO] Uploader la preuve (rapport d'audit, capture d'ecran, etc.)
        POST /api/v1/evidence/upload
3. [CO] Changer le statut du mapping a "Compliant"
        PATCH /api/v1/mappings/{id}/status
4. [CO] Consulter les preuves deposees
        GET /api/v1/evidence/mapping/{id}
```

---

## Module 7 : Gestion des Audits

### Ce que l'API permet

#### Creer un audit
```
POST /api/v1/audits
Header: Authorization: Bearer [token CO]
Body: {
  "title": "Audit ISO 27001 Q3 2026",
  "description": "Audit interne annuel",
  "organizationId": "[guid]",
  "auditorId": "[guid utilisateur]",
  "targetFrameworkId": "[guid framework]",
  "plannedDate": "2026-09-15"
}
Retour: "[guid audit]"
```
Statuts disponibles : `Planned` → `InProgress` → `Completed`

#### Mettre a jour le resultat d'un audit
```
PUT /api/v1/audits/{auditId}/result
Header: Authorization: Bearer [token CO]
Body: {
  "status": "Completed",
  "result": "Compliant"    // "Compliant" | "NonCompliant" | "PartiallyCompliant" | "NotAssessed"
}
Retour: true
```
> ✅ Si status = "Completed", la date de cloture est automatiquement enregistree.

#### Lister les audits
```
GET /api/v1/audits?organizationId=[guid]
Header: Authorization: Bearer [token]
Retour: [{ "id": "...", "title": "...", "status": "Planned", "plannedDate": "..." }]
```

### Parcours utilisateur : Mener un audit de conformite

```
1. [CO] Creer l'audit
        POST /api/v1/audits
        → Statut initial : Planned

2. [CO] Demarrer l'audit
        PUT /api/v1/audits/{id}/result
        Body: { "status": "InProgress", "result": "NotAssessed" }

3. [CO] Consulter les mappings et preuves existants pendant l'audit
        GET /api/v1/mappings?organizationId=[guid]
        GET /api/v1/evidence/mapping/{mappingId}

4. [CO] Conclure l'audit
        PUT /api/v1/audits/{id}/result
        Body: { "status": "Completed", "result": "Compliant" }
        → CompletedDate est automatiquement enregistree
```

---

## Module 8 : Gestion des Risques (basique)

### Ce que l'API permet (Risk Owner)

#### Creer un risque
```
POST /api/v1/risks
Header: Authorization: Bearer [token RiskOwner]
Body: {
  "title": "Acces non autorise aux donnees clients",
  "description": "Risque de violation de donnees via acces interne non controle",
  "organizationId": "[guid]",
  "ownerId": "[guid utilisateur]"
}
Retour: "[guid risque]"
```

#### Evaluer un risque (probabilite x impact)
```
POST /api/v1/risks/{riskId}/assessments
Header: Authorization: Bearer [token RiskOwner]
Body: {
  "probability": 3,    // 1 a 5
  "impact": 4,         // 1 a 5
  "assessorId": "[guid]"
}
Retour: "[guid assessment]"
```
> Score calcule automatiquement : Score = Probability × Impact = 3 × 4 = 12 (High)  
> Echelle : 1-4 Low | 5-9 Medium | 10-14 High | 15-25 Critical

#### Lister les risques
```
GET /api/v1/risks?organizationId=[guid]
Header: Authorization: Bearer [token]
Retour: [{ "id": "...", "title": "...", "status": "Open", "assessments": [...] }]
```

### Parcours utilisateur : Gerer un risque

```
1. [RiskOwner] Creer le risque
               POST /api/v1/risks

2. [RiskOwner] Evaluer le risque
               POST /api/v1/risks/{id}/assessments
               Body: { "probability": 3, "impact": 4 }
               → Score = 12 (High)

3. [RiskOwner] Consulter la liste des risques
               GET /api/v1/risks?organizationId=[guid]
```

> ⚠️ Fonctionnalites manquantes (Phase 2) :
> - Pas d'Asset/Actif a lier au risque
> - Pas de plan de traitement (Accept/Mitigate/Transfer/Avoid)
> - Pas de lien Risque → Controle
> - Pas de score residuel

---

## Module 9 : Dashboard

### Ce que l'API permet

#### Obtenir les metriques globales
```
GET /api/v1/dashboard/metrics?organizationId=[guid]
Header: Authorization: Bearer [token]
Retour: {
  "totalPolicies": 5,
  "expiringPolicies": 1,
  "totalRisks": 3,
  "openRisks": 2,
  "totalMappings": 45,
  "compliantMappings": 32,
  "complianceRate": 71.1
}
```

---

## Tableau recapitulatif : ce que chaque role peut faire

| Action | Admin | Compliance Officer | Risk Owner | Tout auth |
|--------|-------|--------------------|------------|-----------|
| Creer un utilisateur | ✅ | ❌ | ❌ | ❌ |
| Creer une organisation | ✅ | ❌ | ❌ | ❌ |
| Importer un referentiel | ✅ | ✅* | ✅* | ✅* |
| Creer une politique | ✅ | ✅ | ❌ | ❌ |
| Uploader un document | ✅ | ✅ | ❌ | ❌ |
| Creer un controle | ✅ | ✅* | ✅* | ✅* |
| Creer un mapping | ✅ | ✅ | ❌ | ❌ |
| Changer statut conformite | ✅ | ✅ | ❌ | ❌ |
| Uploader une preuve | ✅ | ✅ | ❌ | ❌ |
| Creer un audit | ✅ | ✅ | ❌ | ❌ |
| Creer un risque | ❌ | ❌ | ✅ | ❌ |
| Evaluer un risque | ❌ | ❌ | ✅ | ❌ |
| Voir le dashboard | ✅ | ✅ | ✅ | ✅ |

> (*) Bug connu : ces actions n'ont pas de restriction de role, tout utilisateur authentifie peut les faire.

---

## Bugs connus impactant les parcours utilisateurs

| Bug | Impact fonctionnel | Severite |
|-----|-------------------|----------|
| POST /auth/register public | N'importe qui peut creer un compte Admin | BLOQUANT |
| UserId = "user-from-claims" dans DocumentsController | Le document n'est pas lie au bon utilisateur | BLOQUANT |
| Email rappel → "owner@draxlmaier.local" | Les rappels d'expiration n'atteignent jamais le vrai proprietaire | BLOQUANT |
| Pas d'endpoint de download preuve | Un CO ne peut pas telecharger une preuve via l'API | BLOQUANT |
| AuditLog absent | Aucune action n'est tracee de facon immuable | BLOQUANT |
| Import doublon framework | Importer deux fois le meme CSV cree des doublons | IMPORTANT |
| Probability/Impact sans validation [1-5] | Un score de risque peut etre absurde | IMPORTANT |

---

## Architecture des donnees : comment tout est relie

```
Organization
  └─ Policy (possede un OwnerId, une ExpiryDate, un Document)
       └─ ControlMapping (lie la Politique a une ComplianceRequirement)
            └─ Evidence (preuve de la conformite)
  └─ ComplianceFramework (ISO 27001)
       └─ ComplianceRequirement (A.5.1, A.5.2, ...)
            └─ ControlMapping (lie via Politique ou Controle)
  └─ Control (mesure de securite)
       └─ ControlMapping
  └─ Risk
       └─ RiskAssessment (score = probability × impact)
  └─ Audit (session d'evaluation formelle)
```

---

## URLs importantes en developpement

```
Backend API  : https://localhost:7000/api/v1/
Swagger      : https://localhost:7000/swagger
MinIO Console: http://localhost:9001  (user: minioadmin, pass: minioadmin)
Mailpit      : http://localhost:8025  (tous les emails de dev arrivent ici)
PostgreSQL   : localhost:5432  (DB: grcdb, user: postgres)
```

---

> **Document genere le 2026-08-20 — base sur l'audit du code source du 2026-08-19**
