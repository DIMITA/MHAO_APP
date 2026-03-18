# 🗓️ PLAN DE PROJET
## Marketplace Habitat – Afrique de l'Ouest
**MVP Phase 1 – 90 Jours | Wilfried HOUEDANOU**

---

## 1. Cadrage Projet

| Paramètre | Valeur |
|----------|--------|
| **Nom du Projet** | Marketplace Habitat Afrique de l'Ouest – MVP |
| **Chef de Projet** | Wilfried HOUEDANOU |
| **Date de Démarrage** | Janvier 2025 |
| **Date de Livraison MVP** | Fin Mars 2025 (90 jours) |
| **Pays Pilote** | Bénin (Cotonou) |
| **Budget Total MVP** | 13 300 – 25 600 € |
| **Méthodologie** | Agile / Scrum (sprints de 2 semaines) |
| **Outils de Gestion** | Notion / Jira + GitHub + Slack |

---

## 2. Backlog Produit – Priorité MoSCoW

### ✅ Must Have (MVP obligatoire)

1. Inscription et authentification (JWT + OTP SMS)
2. Création et gestion de projets BTP côté client
3. Profils prestataires vérifiés (inscription + vérification documents)
4. Système de devis (soumission, comparaison, acceptation)
5. Paiement sécurisé escrow (MTN MoMo)
6. Suivi des étapes de travaux et déblocage des fonds
7. Système de notation et avis post-projet
8. Dashboard Admin (validation prestataires, gestion litiges)
9. Notifications (email + push)

### 🟡 Should Have (idéalement en Phase 1)

- Messagerie interne client-prestataire.
- Géolocalisation sur carte (OpenStreetMap).
- Multi-devis comparés automatiquement.
- Application mobile PWA.

### 🟢 Could Have (Phase 2+)

- Catalogue matériaux et fournisseurs.
- Listing location immobilière.
- IA recommandation prestataires.
- Programme de fidélité prestataires.

### ❌ Won't Have (hors scope MVP)

- Module RH / gestion d'équipes de chantier.
- Financement / crédit immobilier.
- Marketplace d'outils et équipements.

---

## 3. Planning Détaillé – Sprints

```
MOIS 1                    MOIS 2                    MOIS 3
──────────────────────────────────────────────────────────────
S0       S1       S2       S3       S4       S5       UAT
[Setup ] [Auth  ] [Projets][Devis ] [Paimt ] [Admin ] [Tests ]
Sem1-2   Sem3-4   Sem5-6   Sem7-8   Sem9-10  Sem11-12 Sem13
```

| Sprint | Durée | Tâches | Critères d'Acceptation |
|--------|-------|--------|----------------------|
| **S0 – Setup** | Sem 1–2 | Cadrage, recrutement équipe, setup infra, Figma design system | Infra ready, équipe complète |
| **S1 – Auth** | Sem 3–4 | Auth complet (register/login/OTP), BDD schéma v1 | Login fonctionne avec OTP |
| **S2 – Projets** | Sem 5–6 | CRUD Projets, Upload photos, Profil prestataire | Projets créés et visibles |
| **S3 – Devis** | Sem 7–8 | Module Devis complet, acceptation/refus | Devis soumis et accepté |
| **S4 – Paiement** | Sem 9–10 | Paiement MTN MoMo, escrow, milestones | Paiement test réussi |
| **S5 – Admin** | Sem 11–12 | Notifications, Reviews, Dashboard Admin | Notif reçue, avis posté |
| **UAT** | Sem 13 | Tests utilisateurs (5–10 projets pilotes) | NPS > 40, 0 bug critique |

---

## 4. Matrice RACI

| Activité | CEO (WH) | CTO/Dev | Designer | Terrain Bénin |
|---------|---------|--------|---------|--------------|
| Vision & Stratégie | **R/A** | C | I | I |
| Architecture technique | I | **R/A** | I | I |
| Design UX/UI | A | C | **R** | I |
| Développement backend | I | **R/A** | I | I |
| Développement frontend | I | A | C | I |
| Onboarding prestataires | A | I | I | **R** |
| Tests utilisateurs | A | C | C | **R** |
| Marketing & Comms | **R/A** | I | C | C |
| Relations investisseurs | **R/A** | C | I | I |
| Support client | A | I | I | **R** |

> **R** = Responsable | **A** = Approbateur | **C** = Consulté | **I** = Informé

---

## 5. Registre des Risques

| # | Risque | Prob. | Impact | Score | Plan de Mitigation |
|---|--------|-------|--------|-------|-------------------|
| R1 | Recrutement dev difficile | 🔴 Haute | 🔴 Élevé | 9 | Contacter agences offshore (Maroc, Sénégal, Côte d'Ivoire) dès J1 |
| R2 | Délai intégration Mobile Money | 🟡 Moyenne | 🔴 Élevé | 6 | Commencer démarches Mois 1, plan B : Wave / CinetPay |
| R3 | Scope creep | 🔴 Haute | 🟡 Moyen | 6 | Backlog gelé sprint S0, revue formelle pour tout ajout |
| R4 | Manque prestataires onboardés | 🟡 Moyenne | 🔴 Élevé | 6 | Objectif 30 prestataires signés AVANT lancement client |
| R5 | Budget dépassé | 🟡 Moyenne | 🟡 Moyen | 4 | Buffer 20%, revue mensuelle budget, MVP strict |
| R6 | Faible adoption utilisateurs | 🟡 Moyenne | 🔴 Élevé | 6 | Incentives inscription, programme ambassadeurs |
| R7 | Incident sécurité / fuite données | 🟢 Faible | 🔴 Élevé | 3 | Pentest avant launch, audit OWASP, chiffrement AES-256 |
| R8 | Concurrence réactive | 🟢 Faible | 🟡 Moyen | 2 | Accélération roadmap, lock-in via notation + historique |

> Score = Probabilité × Impact (3×3 = 9 max)

---

## 6. Budget Détaillé MVP

| Poste | Budget Min (€) | Budget Max (€) | Statut |
|-------|--------------|--------------|--------|
| Dev Backend Senior (NestJS) | 3 000 | 6 000 | 🔴 À recruter |
| Dev Frontend (Next.js) | 3 000 | 6 000 | 🔴 À recruter |
| UX/UI Designer | 1 500 | 3 000 | 🔴 À recruter |
| Intégration paiement Mobile Money | 1 500 | 3 000 | 🟡 En cours |
| Infrastructure (VPS, CDN, domaines) | 300 | 600 | 🟢 Disponible |
| Outils (Figma, Jira, Slack, etc.) | 200 | 400 | 🟢 Disponible |
| Marketing lancement (Bénin) | 1 000 | 2 000 | 🔴 À planifier |
| Terrain (déplacements, events) | 500 | 1 000 | 🟡 Partiel |
| Juridique & comptabilité | 500 | 1 000 | 🔴 À initier |
| Divers & imprévus (buffer 15%) | 1 800 | 3 600 | 📦 Réservé |
| **TOTAL** | **13 300 €** | **26 600 €** | |

---

## 7. Critères de Succès du Projet

### ✅ Critères Go/No-Go (Validation MVP)

- [ ] 30+ prestataires vérifiés inscrits.
- [ ] 10+ projets créés et traités end-to-end.
- [ ] 1 paiement Mobile Money réel traité avec succès.
- [ ] NPS utilisateurs (clients + prestataires) > 40.
- [ ] 0 bug critique en production.
- [ ] Temps de réponse < 2s sur les fonctionnalités clés.
- [ ] Budget respecté à ± 15%.
- [ ] Pas d'incident de sécurité.

### 📊 KPIs Post-Launch (Mois 1–3 après MVP)

| KPI | Objectif M+1 | Objectif M+3 |
|-----|-------------|-------------|
| Projets créés / mois | 10 | 30 |
| Prestataires actifs | 40 | 80 |
| Taux de conversion devis → accepté | 25% | 40% |
| NPS clients | > 40 | > 50 |
| Revenus commissions (€) | 800 | 3 000 |
| Taux de litiges | < 15% | < 8% |

---

## 8. Communication Projet

### Rituels Agile

| Réunion | Fréquence | Participants | Durée |
|---------|----------|-------------|-------|
| Daily Standup | Quotidienne | Équipe tech | 15 min |
| Sprint Planning | Début de sprint | Toute l'équipe | 2h |
| Sprint Review | Fin de sprint | Toute l'équipe + stakeholders | 1h |
| Sprint Retrospective | Fin de sprint | Équipe | 1h |
| Steering Committee | Mensuel | CEO + CTO + Responsable terrain | 1h |

### Outils de Collaboration

| Outil | Usage |
|-------|-------|
| **GitHub** | Code, revues, CI/CD |
| **Jira / Notion** | Backlog, sprints, documentation |
| **Slack** | Communication équipe |
| **Figma** | Design, prototypes |
| **Loom** | Démos asynchrones |
| **Google Meet** | Réunions distancielles |

---

## 9. Plan de Contingence

### Si retard de développement (> 2 semaines)
→ Réduire scope au strict minimum Must Have, reporter Should Have au mois 4.

### Si budget dépassé (> 20%)
→ Arrêt des fonctionnalités "Should Have", recours à des freelances moins chers (Afrique francophone).

### Si 0 paiement Mobile Money opérationnel
→ Lancement avec paiement virement bancaire manuel + escrow géré par admin, en attendant intégration API.

### Si < 20 prestataires au lancement
→ Reporter lancement client de 4 semaines, intensifier onboarding terrain.

---

*© 2025 Wilfried HOUEDANOU – Document Confidentiel*
