# ADR-003 — Choix de l'authentification : Keycloak (prod) + ASP.NET Core Identity (dev)

| Champ | Valeur |
|-------|--------|
| **ADR-ID** | ADR-003 |
| **Titre** | Choix du mécanisme d'authentification et d'autorisation |
| **Statut** | **ACCEPTED** |
| **Date** | 2026-08-13 |
| **Décidé par** | Mohamed Abidi (project owner) |
| **Remplace** | TBD-03 |

---

## Contexte

Le CdC v1.0.0 Section 17 indique que le mécanisme d'authentification est TBD. L'application est destinée à être déployée en ligne pour des entreprises (B2B). Les entreprises clientes (comme DRÄXLMAIER) disposent de leurs propres annuaires (Active Directory, Entra ID). Le système doit supporter le SSO enterprise et le RBAC.

## Décision

**Stratégie en deux phases :**

| Phase | Mécanisme | Contexte |
|-------|-----------|---------|
| **Phase 1 (développement MVP)** | ASP.NET Core Identity + JWT local | Simple, rapide, pas de dépendance externe |
| **Production / B2B** | **Keycloak** (OpenID Connect) | IdP enterprise self-hosted, fédération Active Directory |

Les deux émettent des JWT — le middleware `JwtBearer` dans ASP.NET Core est identique dans les deux cas. La migration est transparente pour le code métier.

## Architecture d'authentification

```
[Client React]
      │  Bearer JWT
      ▼
[ASP.NET Core API]
  JwtBearerAuthentication middleware
  PolicyBasedAuthorization (RBAC)
      │
      ├── Phase MVP: valide JWT émis par ASP.NET Core Identity
      └── Production: valide JWT émis par Keycloak (OIDC Discovery)

[Keycloak — production]
  ├── Realm: draxlmaier-grc
  ├── Clients: grc-frontend, grc-backend
  ├── Fédération: Active Directory / Entra ID (si disponible)
  └── Rôles: compliance-officer, administrator, risk-owner (Phase 1b)
```

## Rôles RBAC (Phase 1 MVP — ACCEPTED)

| Rôle | Permissions | Source |
|------|-------------|--------|
| `Administrator` | Tout : gestion users, import frameworks, configuration | CdC FR-007, US-001 |
| `ComplianceOfficer` | CRUD politiques, mappages, preuves, statuts | CdC FR-007, US-003 |
| `PolicyOwner` | Reçoit les rappels email, consultation | CdC US-007 |

Rôles **à valider** (dépendent de TBD-RISK → confirmé MVP) :
| Rôle | Permissions | Source |
|------|-------------|--------|
| `RiskOwner` | CRUD risques de son périmètre | CdC Section 10, US-017/018/019 |

## Alternatives considérées

| Alternative | Raison du rejet |
|-------------|----------------|
| Microsoft Entra ID | Excellent mais lié à l'écosystème Microsoft/Azure — TBD-12 (hébergement) non résolu |
| Auth0 | SaaS payant au-delà de 7500 users ; dépendance cloud externe |
| JWT manuel sans IdP | Non scalable B2B ; pas de SSO enterprise ; pas de fédération AD |
| Okta | Payant ; même problème qu'Auth0 |

## Justification

- **Keycloak** est open source (Apache 2.0), self-hosted, zéro coût de licence.
- Supporte OIDC, OAuth2, SAML2 — compatible avec n'importe quel Active Directory ou Entra ID.
- Déployé via Docker (un seul conteneur).
- Le client React utilise `keycloak-js` ou `react-oidc-context`.
- La migration de ASP.NET Identity → Keycloak ne touche pas le code métier (seul le `JwtBearerOptions.Authority` change).

## Configuration locale (Docker Compose)

```yaml
keycloak:
  image: quay.io/keycloak/keycloak:25.0
  command: start-dev
  environment:
    KEYCLOAK_ADMIN: admin
    KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD}
  ports:
    - "8080:8080"
```

## Conséquences

- Package NuGet : `Microsoft.AspNetCore.Authentication.JwtBearer`
- Configuration MVP : `options.Authority = "http://localhost:8080/realms/grc"` (Keycloak) ou `options.Issuer = "https://localhost:5001"` (ASP.NET Identity)
- Frontend : `react-oidc-context` ou `keycloak-js`
- Tout endpoint protégé utilise `[Authorize(Roles = "ComplianceOfficer")]` ou Policy-based authorization
- Les tests d'intégration mockent le JWT avec un token de test signé localement

## Dépendances

- ADR-001 (ASP.NET Core 8) — confirmé.
- TBD-12 (infrastructure hébergement) — encore ouvert, mais sans impact sur ce choix.
