# SportPlan

## What This Is

Plateforme communautaire de planification de séances de sport. Les utilisateurs peuvent créer et partager leurs séances et programmes d'entraînement, découvrir ceux des autres, et suivre leur progression au fil du temps. Supporte plusieurs sports (running, natation, vélo, musculation, etc.).

## Core Value

Le suivi et la progression des utilisateurs doivent être impeccables. Même si les fonctionnalités sociales sont basiques, chaque utilisateur doit pouvoir tracker précisément sa progression au fil du temps.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Création de séances individuelles (exercices, durée, intensité)
- [ ] Assemblage de séances en programmes multi-semaines
- [ ] Système de découverte de programmes (recherche, filtres par sport)
- [ ] Profils utilisateurs avec système followers/abonnés
- [ ] Suivi de progression (historique, stats, graphiques)
- [ ] Partage public/privé des programmes
- [ ] Support multi-sports (running, natation, vélo, musculation, etc.)

### Out of Scope

- Intégrations externes (Strava, Garmin, Apple Health, etc.) — v1 focus sur les fonctionnalités core, intégrations pour versions futures
- Monétisation — pas de paiements ou abonnements premium pour v1

## Context

Plateforme greenfield. Aucun code existant. L'objectif est de créer une communauté active autour du partage de programmes sportifs, avec un accent fort sur le suivi individuel de progression.

Structure des contenus:
- **Séance**: unité de base (ex: "Séance jambes", "Course 5km tempo")
- **Programme**: collection de séances organisées sur plusieurs semaines avec progression

## Constraints

- **Tech stack**: Libre choix — pas de contraintes imposées
- **Hébergement**: Libre choix
- **Timeline**: Pas de deadline spécifique

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Multi-sports générique | Flexibilité pour tous types d'entraînement | — Pending |
| Séances + Programmes (2 niveaux) | Permet réutilisation et composition flexible | — Pending |
| Progression comme core value | Différenciateur vs simples bibliothèques d'exercices | — Pending |

---
*Last updated: 2026-01-26 after initialization*
