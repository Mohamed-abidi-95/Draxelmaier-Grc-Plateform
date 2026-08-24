# ADR-005 — Choix de la base vectorielle : pgvector (PostgreSQL)

| Champ | Valeur |
|-------|--------|
| **ADR-ID** | ADR-005 |
| **Titre** | Choix de la base de données vectorielle pour le RAG (Phase 3) |
| **Statut** | **ACCEPTED** |
| **Date** | 2026-08-13 |
| **Décidé par** | Mohamed Abidi (project owner) |
| **Remplace** | TBD-05 |

---

## Contexte

Le CdC v1.0.0 Section 19 indique que le choix de la base vectorielle est TBD. La Phase 3 du projet nécessite un stockage d'embeddings pour le pipeline RAG (FR-003 — Recherche sémantique avec citation). Ce choix impacte la complexité de l'infrastructure et les performances du retrieval.

## Décision

**`pgvector`** — extension PostgreSQL — est retenu comme solution de stockage vectoriel.

Aucune base vectorielle externe distincte (Weaviate, Pinecone, Chroma, Qdrant) n'est ajoutée.

## Principe

```sql
-- Activation de l'extension (Phase 3 uniquement)
CREATE EXTENSION IF NOT EXISTS vector;

-- Table de stockage des chunks documentaires
CREATE TABLE document_chunks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id),
  policy_id   UUID REFERENCES policies(id),
  chunk_index INTEGER NOT NULL,
  content     TEXT NOT NULL,
  embedding   vector(1536),           -- dimension : modèle d'embeddings TBD-06
  access_level VARCHAR(50) NOT NULL,  -- filtrage permission
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index HNSW pour recherche approximative rapide
CREATE INDEX ON document_chunks USING hnsw (embedding vector_cosine_ops);
```

## Filtrage par permission (CRITIQUE)

```sql
-- Le filtrage par permission EST réalisé au niveau SQL
-- Le LLM ne reçoit JAMAIS de chunks qu'il doit "filtrer lui-même"
SELECT content, chunk_index, document_id
FROM document_chunks
WHERE access_level = :user_role          -- filtrage RBAC
  AND policy_id = ANY(:authorized_ids)   -- filtrage périmètre utilisateur
ORDER BY embedding <=> :query_embedding  -- similarité cosinus
LIMIT 5;
```

## Alternatives considérées

| Alternative | Évaluation | Raison du rejet |
|-------------|-----------|----------------|
| **Weaviate** | Open source, client .NET officiel, très performant | Conteneur supplémentaire à gérer, complexité infrastructure +1, sur-dimensionné pour ~500 documents politiques |
| **Pinecone** | SaaS, excellent | Payant, données cloud externe — TBD-11 (data policy) non résolu |
| **Chroma** | Simple, Python-natif | Pas de client .NET officiel mature |
| **Qdrant** | Open source, performant | Conteneur supplémentaire, même problème que Weaviate |
| **pgvector** | ✅ **Retenu** | Intégré à PostgreSQL déjà choisi (ADR-002), zéro infrastructure supplémentaire |

## Comparaison Weaviate vs pgvector pour ce projet

| Critère | Weaviate | pgvector | Gagnant |
|---------|----------|----------|---------|
| Conteneur Docker supplémentaire | Oui | Non | pgvector |
| Familiarité .NET | Bonne | Excellente (Npgsql) | pgvector |
| Performance < 100k chunks | Équivalente | Équivalente | Égalité |
| Filtrage SQL RBAC natif | Via where filters | SQL natif | pgvector |
| Stack simplifiée | Non | Oui | pgvector |
| Coût | Gratuit (self-hosted) | Gratuit | Égalité |
| Pertinent au-delà de 1M chunks | Oui | Partiel | Weaviate |

> **Conclusion :** Pour un corpus de ~100-1000 politiques, pgvector est optimal. Weaviate peut être envisagé si le volume dépasse 500k chunks en production.

## Justification

- PostgreSQL est déjà dans la stack (ADR-002) — zéro nouveau système à opérer.
- `pgvector` supporte HNSW (Hierarchical Navigable Small World) depuis PostgreSQL 16 — performances équivalentes à Weaviate pour les volumes cibles.
- Le filtrage RBAC est réalisé en SQL pur — cohérent avec la règle de sécurité IA (CdC Section 22).
- Package NuGet `Pgvector.EntityFrameworkCore` intègre pgvector dans EF Core nativement.

## Conséquences

- **Phase 1-2 :** `pgvector` n'est pas activé. L'extension sera activée uniquement en Phase 3.
- **Phase 3 :** `CREATE EXTENSION vector` dans la migration EF Core dédiée.
- Package NuGet à ajouter en Phase 3 : `Pgvector.EntityFrameworkCore`
- Image Docker à utiliser : `pgvector/pgvector:pg16` (inclut l'extension pré-compilée)
- Le modèle d'embeddings (TBD-06) détermine la dimension du vecteur (ex: 1536 pour text-embedding-3-small)

## Dépendances

- ADR-002 (PostgreSQL) — confirmé.
- TBD-06 (modèle d'embeddings / LLM) — encore ouvert, impacte la dimension du vecteur.
- TBD-11 (données autorisées au LLM externe) — encore ouvert, impacte le pipeline RAG.
- **Phase 3 uniquement** — ne pas activer avant stabilisation du Core GRC.
