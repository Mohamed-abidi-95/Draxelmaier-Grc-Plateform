# Architecture et Structure du Menu GRC (Shield GRC)

Ce document présente l'organisation fonctionnelle de la plateforme **Shield GRC** telle qu'elle est reflétée dans son menu de navigation principal (Navbar). La structure du menu a été pensée pour épouser parfaitement les trois piliers du modèle **GRC (Gouvernance, Risques, Conformité)**, tout en y ajoutant des capacités de surveillance (Monitoring) et d'Intelligence Artificielle.

---

## 🏠 OVERVIEW (Vue d'ensemble)
Ce pilier sert de point d'entrée pour l'utilisateur.
- **Dashboard (Tableau de bord)** : Offre une vue macroscopique et en temps réel de l'état de l'organisation. Il consolide les indicateurs de performance (KPIs) et de risque (KRIs), affichant le taux global de conformité, la répartition des risques par sévérité, et les tâches urgentes. C'est l'outil d'aide à la décision par excellence pour la direction.

## 🏛 GOVERNANCE (Gouvernance)
Ce pilier centralise les règles, l'organisation et les mesures de sécurité établies par l'entreprise pour diriger ses opérations.
- **Business Units (Unités Commerciales)** : Permet de modéliser l'organigramme de l'entreprise (filiales, départements). Cela garantit que chaque risque ou politique peut être affecté à un périmètre précis.
- **Users & Roles (Utilisateurs et Rôles)** : Gestion des identités et des accès (RBAC). Détermine qui peut consulter, modifier ou approuver les données (Administrateur, RSSI, Auditeur, etc.), garantissant ainsi la ségrégation des tâches.
- **Documents & Policies (Politiques et Procédures)** : La bibliothèque centrale des documents directeurs (Charte IT, Politique de Sécurité). Ce module gère leur cycle de vie, de la création à l'approbation, et inclut des rappels automatiques avant expiration.
- **Controls (Mesures de Contrôle)** : Le référentiel des mesures de sécurité internes mises en place (ex: pare-feu, chiffrement, sensibilisation). Les contrôles sont le bras armé de la gouvernance pour atténuer les risques.

## ⚠ RISK MANAGEMENT (Gestion des Risques)
Ce pilier matérialise l'approche par les risques, essentielle à toute norme (comme l'ISO 27001).
- **Risk Register (Registre des Risques)** : L'inventaire central de tous les risques identifiés par l'entreprise, classés par catégorie et par propriétaire.
- **Asset Inventory (Inventaire des Actifs)** : Recensement des actifs (serveurs, logiciels, données). L'évaluation des risques se base souvent sur la vulnérabilité de ces actifs (selon la triade Confidentialité, Intégrité, Disponibilité).
- **Risk Assessments (Évaluations des Risques)** : Historique des campagnes d'évaluation. Permet de mesurer un risque brut (Probabilité × Impact) pour obtenir son score de sévérité (Faible, Moyen, Élevé, Critique).
- **Risk Treatments (Traitements des Risques)** : Décrit la stratégie adoptée face à un risque évalué : *Mitigate* (Atténuer via des contrôles), *Accept* (Accepter), *Transfer* (Transférer, ex: assurance) ou *Avoid* (Éviter). Il inclut le plan d'action et les dates limites.

## ✓ COMPLIANCE (Conformité)
Ce pilier permet de prouver que l'organisation respecte les lois, réglementations et normes internationales.
- **Frameworks (Référentiels Normatifs)** : Intégration des standards (ex: ISO 27001, RGPD, SOC 2). Chaque norme est découpée en exigences spécifiques, auxquelles l'organisation vient lier ses propres contrôles internes pour prouver sa conformité.
- **Audits (Campagnes d'Audit)** : Outil de planification et de suivi des audits (internes ou externes). Permet de consigner les constats (Findings), d'évaluer le statut de chaque exigence (Pass/Fail) et de générer les rapports finaux.

## ✨ INTELLIGENCE (Intelligence Artificielle)
- **AI Intelligence (Copilot)** : Un assistant virtuel connecté directement à la base documentaire de l'entreprise (via RAG - Retrieval-Augmented Generation). Il permet d'interroger les politiques internes en langage naturel, d'aider à la rédaction des plans de traitement des risques, et d'identifier rapidement des écarts de conformité.

## 🔍 MONITORING (Surveillance & Traçabilité)
- **Activity Logs (Piste d'Audit / Journal d'activité)** : Registre immuable retraçant toutes les actions effectuées sur la plateforme (Qui a fait quoi, et quand). C'est une exigence réglementaire forte pour garantir la non-répudiation et la traçabilité des opérations.

---

## ⚙ PARAMÈTRES ET PROFIL (Pied de menu)
- **Settings (Paramètres)** : Configuration technique de l'application (seuils d'alerte, délais de notification, intégration d'outils externes).
- **Support** : Accès à l'assistance et à la documentation technique.
- **Profil Utilisateur (Ex: Mohamed Abidi)** : Affiche l'identité de l'utilisateur connecté et son rôle actuel (ex: Administrator), avec la possibilité de gérer ses informations personnelles ou de se déconnecter.
