# ADR 006: File Storage Strategy (MinIO & IFileStorage)

## Status
Accepted

## Context
L'application GRC DRÄXLMAIER doit permettre aux utilisateurs (ex: `ComplianceOfficer`) d'importer et de consulter des politiques et des preuves (documents physiques). 
Cependant, la question du stockage physique des fichiers n'était pas précisée dans le MVP (TBD-08). L'application ayant pour vocation à devenir un produit multi-tenant (SaaS), lier le stockage au système de fichiers local (`wwwroot`) ou l'intégrer directement dans PostgreSQL sous forme de binaires n'est pas viable à long terme.

## Decision
Nous utiliserons une architecture de stockage d'objets abstraite.
1. **Abstraction** : Une interface `IFileStorage` est créée dans la couche Application. Le domaine métier ne connaîtra jamais l'implémentation sous-jacente.
2. **Implémentation MVP (MinIO)** : Pour le développement et le MVP, nous utiliserons **MinIO**, un stockage objet hautement performant et compatible S3.
3. **Séparation Base de Données / Fichiers** : PostgreSQL ne stockera **que** les métadonnées (DocumentId, OrganizationId, Hash, Taille). Les binaires seront stockés dans MinIO.
4. **Isolation Logique (Multi-tenant)** : Le chemin de stockage (StorageKey) adoptera le format `tenant/{tenantId}/documents/{documentId}/{filename}`, préparant l'architecture à supporter de multiples entreprises.

## Consequences
- **Avantage** : L'application est Cloud-Native dès le premier jour. Le passage à AWS S3 en production sera immédiat (MinIO étant compatible avec l'API S3).
- **Avantage** : Allègement de PostgreSQL qui n'a pas à traiter de gros BLOBs.
- **Inconvénient** : Complexité d'infrastructure très légèrement augmentée (un conteneur de plus en local).
- **Inconvénient** : Nécessite l'intégration du SDK AWSSDK.S3 dans la couche Infrastructure.
