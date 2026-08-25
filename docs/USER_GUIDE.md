# Shield GRC - Guide Utilisateur

Bienvenue sur **Shield GRC** (Enterprise Governance, Risk, and Compliance Platform). Cette plateforme vous permet de piloter la gouvernance, d'évaluer les risques, de suivre votre conformité (ex: ISO 27001) et d'être assisté par l'Intelligence Artificielle.

Ce guide vous explique comment naviguer et utiliser les différentes fonctionnalités de la plateforme.

---

## 1. Connexion (Login)
1. Ouvrez votre navigateur et rendez-vous sur la page de connexion (par défaut `http://localhost:5173/login`).
2. Entrez votre **adresse e-mail professionnelle** et votre **mot de passe**.
3. Cliquez sur **Sign In to Dashboard**.
4. *(Mot de passe oublié ?)* Cliquez sur "Forgot password?", saisissez votre adresse e-mail et recevez un lien de réinitialisation.

---

## 2. Navigation Globale
L'interface est conçue autour d'une barre latérale (Sidebar) rétractable et d'une barre supérieure (Header).

- **Barre supérieure (Header)** : Permet d'accéder rapidement à l'historique, aux notifications, au Copilot IA, de lancer une nouvelle évaluation (New Assessment), et d'afficher le profil utilisateur.
- **Barre latérale (Sidebar)** : Organisée par grandes familles métiers :
  - `Overview` : Vision globale (Tableau de bord).
  - `Governance` : Structures organisationnelles et politiques.
  - `Risk Management` : Identification et traitement des risques.
  - `Compliance` : Normes et audits de conformité.
  - `Intelligence` : Assistant virtuel (AI Copilot).
  - `Monitoring` : Piste d'audit et logs.

---

## 3. Détail des Modules

### 🏠 Overview (Vue d'ensemble)
- **Dashboard** : Affiche les métriques clés (KPIs) de votre organisation : niveau de risque global, taux de conformité, tâches en attente et statut des politiques. C'est votre point d'entrée quotidien.

### 🏛 Governance (Gouvernance)
- **Business Units** : Gérez l'arborescence de votre organisation (filiales, départements). Utile pour assigner des risques ou des actifs à des entités spécifiques.
- **Users & Roles** : L'administrateur peut y créer des comptes, suspendre des accès, et assigner des rôles précis (`Administrator`, `ComplianceOfficer`, `RiskOwner`, etc.) qui limitent ou ouvrent les droits sur la plateforme.
- **Documents & Policies** : Bibliothèque de vos documents de gouvernance (Politique de sécurité, Charte IT, etc.). Vous pouvez y vérifier les dates d'expiration et les propriétaires.
- **Controls** : Référentiel des mesures de sécurité internes (ex: Contrôles d'accès, Chiffrement). Chaque contrôle a un statut et peut être lié à des risques ou des exigences normatives.

### ⚠ Risk Management (Gestion des Risques)
- **Risk Register** : Inventaire complet de tous les risques identifiés. 
  - *Astuce* : Cliquez sur un risque pour ouvrir sa **Fiche détaillée (Risk Details)**, voir son score Poids × Impact, et lier des contrôles d'atténuation.
- **Asset Inventory** : Liste de vos actifs matériels, logiciels ou informationnels. Chaque actif est évalué selon ses critères de confidentialité, intégrité et disponibilité (CIA).
- **Risk Assessments** : Campagnes d'évaluation des risques. C'est ici que l'on revoit périodiquement si un risque a augmenté ou diminué.
- **Risk Treatments** : Permet de choisir une stratégie de traitement (Mitigate, Accept, Transfer, Avoid) pour chaque risque, et d'y associer un plan d'action (qui fera quoi et quand).

### ✓ Compliance (Conformité)
- **Frameworks** : Importez et consultez vos référentiels de conformité (ex: ISO 27001).
  - Vous y trouverez la liste des exigences.
  - Vous pouvez étendre une exigence pour y lier vos propres `Controls` internes ou `Policies` en guise de preuve.
- **Audits** : Planifiez des audits internes ou externes. 
  - Définissez le périmètre (général ou ciblé sur un Framework).
  - Suivez l'avancement (Planned, In Progress, Completed) et déclarez le résultat (Pass/Fail).

### ✨ Intelligence (IA)
- **AI Intelligence (Shield Copilot)** : Votre assistant virtuel intelligent. Posez-lui des questions sur vos politiques, demandez-lui d'analyser vos écarts de conformité, ou laissez-le rédiger des propositions de traitement de risques. (Connecté aux données GRC via la technologie RAG).

### 🔍 Monitoring (Surveillance)
- **Activity Logs** : Journal d'audit (Audit Trail) immuable. Chaque création, modification ou suppression sur la plateforme y est tracée (Qui a fait quoi, quand, et sur quel module). Indispensable pour la reddition de comptes.

---

## 4. Rôles et Permissions
Ce que vous voyez dans le menu dépend de votre rôle :
- **Administrator** : Accès total (y compris `Users & Roles` et paramètres techniques).
- **Compliance Officer** : Gestion complète de la conformité, des audits, des contrôles, mais pas de la partie administration pure.
- **Risk Owner** : Accès ciblé sur le registre des risques, les actifs et les traitements.
- **Auditor** : Droit de lecture étendu et possibilité d'ajouter des constats (Findings) d'audit.

---

## 5. Astuces et bonnes pratiques
1. **Cohérence Visuelle** : Sur toutes les pages, les statuts verts (Compliant, Low Risk, Pass) sont positifs, les statuts rouges (Non Compliant, High Risk, Fail) demandent une action immédiate.
2. **Preuves (Evidence)** : N'oubliez pas d'attacher des documents justificatifs lors de vos évaluations de conformité.
3. **Barre de Recherche** : Utilisez les barres de recherche intelligentes présentes dans presque toutes les vues (`Audits`, `Compliance`, `Risk Treatments`) pour filtrer instantanément des centaines de lignes.
