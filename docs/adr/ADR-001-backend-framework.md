# ADR-001 — Choix du framework backend : ASP.NET Core 8

| Champ | Valeur |
|-------|--------|
| **ADR-ID** | ADR-001 |
| **Titre** | Choix du framework backend |
| **Statut** | **ACCEPTED** |
| **Date** | 2026-08-13 |
| **Décidé par** | Mohamed Abidi (project owner) |
| **Remplace** | TBD-01 |

---

## Contexte

Le Cahier des Charges v1.0.0 (Section 19) indique que le choix du framework backend est TBD. Un framework doit être sélectionné pour initier l'implémentation de la Phase 1 (Core GRC MVP). Le projet est un projet académique (PFE) de ~16 semaines, développé par un développeur principal maîtrisant C#.

## Décision

**ASP.NET Core 8 (C#)** est retenu comme framework backend.

## Architecture retenue

```
ASP.NET Core 8 Web API
├── Presentation  → Controllers / Minimal API Endpoints
├── Application   → Use Cases, CQRS via MediatR
├── Domain        → Entités pures C#, interfaces, règles métier
└── Infrastructure → EF Core 9, services externes (email, stockage)
```

## Alternatives considérées

| Alternative | Raison du rejet |
|-------------|----------------|
| Python / FastAPI | Moins adapté à l'architecture Clean Architecture multi-couches ; cohérence réduite avec la stack C# |
| Node.js / Express | Pas de typage natif équivalent ; écosystème moins mature pour apps enterprise GRC |
| Java / Spring Boot | Viable mais pas maîtrisé par le développeur — risque de vélocité réduite |

## Justification

- Maîtrise du développeur en C#.
- Écosystème .NET mature pour les applications enterprise : EF Core, MediatR, Serilog, xUnit.
- Typage fort → moins d'erreurs runtime, meilleure maintenabilité.
- Clean Architecture très bien documentée en .NET.
- Cohérence avec la future intégration Semantic Kernel (.NET) pour la couche IA si retenu.

## Conséquences

- ORM : **Entity Framework Core 9** (ADR-002).
- Base de données : **PostgreSQL** (ADR-002).
- Tests : **xUnit + FluentAssertions + Testcontainers**.
- Logging : **Serilog**.
- CQRS : **MediatR**.
- Auth middleware : `Microsoft.AspNetCore.Authentication.JwtBearer`.

## Dépendances

- ADR-002 (Base de données) — confirmé.
- ADR-003 (Authentification) — confirmé.
