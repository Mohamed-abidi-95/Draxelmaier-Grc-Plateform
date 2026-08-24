# ADR-002 — Choix de la base de données : PostgreSQL + EF Core

| Champ | Valeur |
|-------|--------|
| **ADR-ID** | ADR-002 |
| **Titre** | Choix de la base de données relationnelle et de l'ORM |
| **Statut** | **ACCEPTED** |
| **Date** | 2026-08-13 |
| **Décidé par** | Mohamed Abidi (project owner) |
| **Remplace** | TBD-02 |

---

## Contexte

Le CdC v1.0.0 Section 19 indique que le choix de la base de données relationnelle est TBD. Une base de données doit être sélectionnée pour démarrer la modélisation du domaine et les migrations EF Core. Le projet nécessite une base relationnelle pour le Core GRC et un support des embeddings vectoriels pour la Phase 3 (RAG).

## Décision

**PostgreSQL 16** comme base de données relationnelle.
**Entity Framework Core 9** comme ORM.
**Extension `pgvector`** pour les embeddings vectoriels (Phase 3) — pas besoin de base vectorielle séparée.

## Architecture de données

```
PostgreSQL 16
├── GRC Schema (Core)
│   ├── organizations
│   ├── users / roles
│   ├── policies / documents
│   ├── compliance_frameworks / requirements
│   ├── controls / control_mappings
│   ├── evidence
│   └── audit_logs (append-only)
│
├── Risk Schema (Phase 1b — MVP confirmé)
│   ├── assets
│   ├── risks / risk_assessments
│   └── risk_treatments
│
└── Vector Schema (Phase 3)
    └── document_chunks (id, content, embedding vector(1536), metadata)
    [pgvector extension — CREATE EXTENSION vector]
```

## Alternatives considérées

| Alternative | Raison du rejet |
|-------------|----------------|
| SQL Server | Licence coût potentiel en production ; moins natif en environnement Linux/Docker |
| SQLite | Pas adapté à un déploiement multi-utilisateurs concurrent |
| MySQL | Moins de fonctionnalités avancées (types JSON, `pgvector`, support ACID complet) |
| MongoDB | Non relationnel — incompatible avec les relations GRC (ACID requis) |
| Weaviate (séparé) | Conteneur supplémentaire ; `pgvector` suffit pour le volume documentaire prévu |

## Justification

- **pgvector inclus** : une seule base de données pour les données relationnelles ET les embeddings — stack simplifiée, pas de synchronisation entre deux systèmes.
- **EF Core 9** : ORM standard .NET, migrations versionnées, support PostgreSQL via `Npgsql.EntityFrameworkCore.PostgreSQL`.
- **ACID compliance** : garantie sur toutes les opérations GRC (MUST per NFR-003).
- **Append-only AuditLog** : nativement supporté via contraintes PostgreSQL.
- **Open source** : zéro coût de licence.

## Configuration locale

```yaml
# docker-compose.yml (extrait)
postgres:
  image: pgvector/pgvector:pg16
  environment:
    POSTGRES_DB: grc_db
    POSTGRES_USER: grc_user
    POSTGRES_PASSWORD: ${DB_PASSWORD}
  volumes:
    - postgres_data:/var/lib/postgresql/data
  ports:
    - "5432:5432"
```

## Conséquences

- Package NuGet requis : `Npgsql.EntityFrameworkCore.PostgreSQL`
- Package NuGet requis (Phase 3) : `Pgvector.EntityFrameworkCore`
- Migrations gérées par EF Core (`dotnet ef migrations add`)
- `pgvector` activé en Phase 3 uniquement : `await context.Database.ExecuteSqlRawAsync("CREATE EXTENSION IF NOT EXISTS vector")`
- Tests d'intégration : **Testcontainers for .NET** avec image `pgvector/pgvector:pg16`

## Dépendances

- ADR-001 (ASP.NET Core 8) — confirmé.
- ADR-005 (pgvector pour RAG) — confirmé et inclus dans ce même ADR.
