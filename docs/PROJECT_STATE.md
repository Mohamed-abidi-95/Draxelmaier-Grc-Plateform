# PROJECT_STATE.md
# DRÄXLMAIER GRC Platform — Tableau de Bord Opérationnel

> **Dernière mise à jour :** 2026-08-15
> **Phase actuelle :** Phase 1 (Core GRC MVP) — En cours de stabilisation

---

## ⚠️ RÈGLE DE MISE À JOUR OBLIGATOIRE
**Pour tout agent IA ou développeur :**
Ce fichier est la source de vérité **dynamique** de l'avancement. 
Si vous modifiez le code, vous **DEVEZ** mettre à jour le statut des `STEPs` ci-dessous et la liste de la Dette Technique à la fin de votre tâche, avant de rendre la main.

**Légende des statuts :**
- `[ ]` : À faire (Planned)
- `[/]` : En cours / Partiellement implémenté (In Progress / Partial)
- `[x]` : Terminé (Completed & Tested)

---

## 🚀 SUIVI DES ÉTAPES D'IMPLÉMENTATION (STEPs)

*Séquence stricte dictée par `PROJECT_RULES.md` (Section 7.2)*

### Foundation & Identity (Priorité immédiate)
- `[x]` **STEP 01: Platform Foundation** (Docker, DbContext, NuGet)
- `[x]` **STEP 02: Identity & RBAC** (Entités créées, faille de sécurité corrigée, Clean Architecture appliquée via MediatR, AuditLog en place)
- `[x]` **STEP 02b: Risk Management** (Inclus MVP via ADR-004. Entités `Asset`, `RiskTreatment`, `RiskControl` ajoutées)
- `[x]` **STEP 03: Organization Management** (Structure simple choisie via TBD-07. CRUD complet via MediatR)

### Core GRC MVP (MUST HAVE)
- `[x]` **STEP 04: Policy & Document Mgmt** (CRUD complet et stockage MinIO abstrait via IFileStorage)
- `[x]` **STEP 05: Email Reminder** (Worker en arrière-plan et endpoint manuel via SmtpEmailService fonctionnels)
- `[x]` **STEP 06: Framework Import** (Agnostique. Import de fichiers dans MinIO via UploadFrameworkCommand, sans parsing strict. Laissé pour le RAG.)
- `[x]` **STEP 07: Control Management** (CRUD complet de l'entité Control)
- `[x]` **STEP 08: Compliance Mapping & Status** (Liaisons, suppressions et calcul du % de conformité)
- `[x]` **STEP 09: Evidence Management** (Upload via MinIO, listage et suppression implémentés)
- `[x]` **STEP 10: Core GRC Stabilization** (MVP Core 100% validé. Prêt pour tests globaux / IA)

### GRC Avancé (SHOULD/COULD HAVE)
- `[x]` **STEP 11: Audit Result (simplifié)** (Listage, Création, MàJ et Lecture d'un audit réalisés)
- `[x]` **STEP 12: Dashboard d'analyse** (Statistiques et calculs de conformité croisés implémentés)

### AI Layer (NE PAS COMMENCER AVANT STEP 10 TERMINE)
- `[/]` **STEP 13: AI Foundation / RAG** (⚠️ VIOLE LA SEQUENCE ACTUELLEMENT : `AIAssistantView.tsx` anticipé dans le frontend)
- `[ ]` **STEP 14: AI Gap Detection**
- `[ ]` **STEP 15: MCP** (Hors MVP)
- `[ ]` **STEP 16: Agents** (Hors MVP)

---

## 🚨 DETTE TECHNIQUE & ANOMALIES ACTUELLES (URGENT)

Les éléments suivants ont été détectés lors de l'audit structurel et **bloquent la validation du STEP 02 et 02b**. Ils doivent être corrigés en priorité :

1. **✅ Faille de sécurité critique (GRC-01)** : [CORRIGÉ] L'endpoint `POST /auth/register` (dans `AuthController.cs`) est protégé par `[Authorize(Roles = "Administrator")]`.
2. **✅ Violation Clean Architecture** : [CORRIGÉ] La logique d'authentification a été migrée vers `Draxlmaier.GRC.Application` via MediatR (CQRS) et un `IIdentityService`.
3. **✅ Règle GRC-02 non respectée** : [CORRIGÉ] L'entité `AuditLog` est créée, implémentée via un Interceptor dans EF Core `SaveChangesAsync` pour tracer automatiquement toute modification.
4. **✅ Incohérence de décision (Risk)** : [CORRIGÉ] Les entités `Asset`, `RiskTreatment` et `RiskControl` sont ajoutées au `Domain` et à `ApplicationDbContext`.
5. **🔴 Violation de séquence (IA)** : Le frontend contient `src/features/ai/AIAssistantView.tsx`, ce qui anticipe la Phase 3 (AI) alors que la Phase 1 n'est pas stable. *(Note: toléré temporairement s'il s'agit d'une maquette UI vide).*
6. **🔴 Absence de tests** : [CORRIGÉ] Un projet `xUnit` (`Draxlmaier.GRC.Application.UnitTests`) a été créé et valide les comportements de la couche métier (Domain/Application).

---

## ⏳ DÉCISIONS EN ATTENTE (TBD)
*Ces points (issus du Master/Rules) doivent être résolus avant de pouvoir entamer les STEP correspondants.*

- **TBD-06** : Fournisseur LLM (interne vs externe) → Bloque Phase 3-4 (AI).
- **TBD-07** : BU hiérarchique nécessaire au MVP ? → Bloque le périmètre du STEP 03.
- **✅ TBD-09** : Format d'import ISO 27001 → [RÉSOLU] Tout type de fichier est autorisé (PDF, XLSX, JSON). Sera analysé par le RAG.
- **TBD-11** : Données autorisées à un LLM externe → Bloque Phase 3-4.
- **TBD-12** : Infrastructure hébergement prod → Sans impact sur le dev local actuel.
- **✅ TBD-13** : Référentiel normatif prioritaire → [RÉSOLU] Tout type de framework possible.
