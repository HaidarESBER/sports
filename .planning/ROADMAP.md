# Roadmap: SportPlan

## Overview

Construire une plateforme communautaire de planification sportive en 10 phases. On commence par les fondations techniques, puis on construit les fonctionnalités core (séances, programmes), on ajoute les aspects sociaux (profils, discovery, interactions), et on termine par le suivi de progression — la valeur core du produit.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** — Setup projet, stack technique, structure de base
- [x] **Phase 2: Database & Models** — Schéma BDD, modèles de données
- [x] **Phase 3: Authentication** — Inscription, connexion, gestion sessions
- [x] **Phase 4: Sessions Core** — CRUD séances individuelles
- [x] **Phase 5: Programs Core** — Assemblage séances en programmes
- [ ] **Phase 6: User Profiles** — Profils publics, système followers
- [ ] **Phase 7: Discovery** — Recherche et exploration de programmes
- [ ] **Phase 8: Progression Tracking** — Historique, stats, graphiques
- [ ] **Phase 9: Social Features** — Partage, feed, interactions
- [ ] **Phase 10: Polish & Launch** — UI/UX final, optimisations

## Phase Details

### Phase 1: Foundation
**Goal**: Projet fonctionnel avec stack technique configurée (Next.js frontend, API backend, base de données)
**Depends on**: Nothing (first phase)
**Research**: Unlikely (established patterns)
**Plans**: 2/2 complete
**Status**: Complete (2026-01-26)

### Phase 2: Database & Models
**Goal**: Schéma complet avec modèles User, Session, Program, Exercise et relations
**Depends on**: Phase 1
**Research**: Unlikely (internal data modeling)
**Plans**: 1/1 complete
**Status**: Complete (2026-01-26)

### Phase 3: Authentication
**Goal**: Système d'authentification complet (inscription, connexion, logout, sessions sécurisées)
**Depends on**: Phase 2
**Research**: Likely (auth library choice, session strategy)
**Research topics**: NextAuth.js vs Auth.js, JWT vs sessions, OAuth providers
**Plans**: 2/2 complete
**Status**: Complete (2026-01-27)

### Phase 4: Sessions Core
**Goal**: CRUD complet pour séances individuelles (créer, modifier, supprimer, lister)
**Depends on**: Phase 3
**Research**: Unlikely (internal CRUD patterns)
**Plans**: 2/2 complete
**Status**: Complete (2026-01-27)

### Phase 5: Programs Core
**Goal**: Création de programmes multi-semaines en assemblant des séances avec progression
**Depends on**: Phase 4
**Research**: Unlikely (internal composition logic)
**Plans**: 2/2 complete
**Status**: Complete (2026-01-27)

### Phase 6: User Profiles
**Goal**: Profils utilisateurs publics avec système followers/following
**Depends on**: Phase 3
**Research**: Unlikely (internal patterns)
**Plans**: 1/2 complete
**Status**: In progress

### Phase 7: Discovery
**Goal**: Recherche et exploration de programmes/séances (filtres par sport, niveau, durée)
**Depends on**: Phase 4, Phase 5, Phase 6
**Research**: Unlikely (internal query patterns)
**Plans**: TBD

### Phase 8: Progression Tracking
**Goal**: Suivi de progression avec historique d'entraînements, statistiques et visualisations
**Depends on**: Phase 4, Phase 5
**Research**: Likely (charting library, stats calculations)
**Research topics**: Chart.js vs Recharts vs Visx, performance metrics algorithms
**Plans**: TBD

### Phase 9: Social Features
**Goal**: Feed d'activité, partage de programmes, likes et commentaires
**Depends on**: Phase 6, Phase 7
**Research**: Unlikely (internal patterns)
**Plans**: TBD

### Phase 10: Polish & Launch
**Goal**: UI/UX finalisé, optimisations performance, préparation production
**Depends on**: All previous phases
**Research**: Unlikely (polish and optimization)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete | 2026-01-26 |
| 2. Database & Models | 1/1 | Complete | 2026-01-26 |
| 3. Authentication | 2/2 | Complete | 2026-01-27 |
| 4. Sessions Core | 2/2 | Complete | 2026-01-27 |
| 5. Programs Core | 2/2 | Complete | 2026-01-27 |
| 6. User Profiles | 1/2 | In progress | - |
| 7. Discovery | 0/? | Not started | - |
| 8. Progression Tracking | 0/? | Not started | - |
| 9. Social Features | 0/? | Not started | - |
| 10. Polish & Launch | 0/? | Not started | - |
