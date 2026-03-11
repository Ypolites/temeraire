# Déroulé du projet — Temeraire RPG

État mis à jour d’après le code produit.

---

## ✅ Phase 1 — Maquette & Modélisation

- ✅ Wireframes HTML/CSS/JS
- ✅ Modélisation de la base de données

---

## ✅ Phase 2 — Setup & Architecture

- ✅ Installation PostgreSQL
- ✅ Initialisation du projet Node/Express
- ✅ Configuration Prisma + schéma BDD  
  - ✅ `prisma/schema.prisma`  
  - ✅ migrations (`prisma migrate dev`) + synchronisation `0_init`
- ✅ Structure des dossiers
- ✅ Mise en place des interfaces Adaptateur (LLM + Dés)

---

## ✅ Phase 3 — Authentification

- ✅ POST /auth/register (+ validation Zod)
- ✅ POST /auth/login → retourne un JWT
- ✅ Middleware de protection des routes — `src/middlewares/auth.middleware.js`
- ✅ POST /auth/reset-password

---

## ✅ Phase 4 — API REST (feature par feature)

- ✅ Game Sessions (POST, GET, GET/:id, DELETE)
- ✅ Characters (CRUD complet)
- ✅ Avatar Moods (upload + compression Sharp + suppression)
- ✅ Messages (envoi + pagination)
- ✅ **Dice Requests** — API POST /dice/roll implémentée (back + front `chat.html` appelle l’API ; parsing NdX+K côté back et front)
- ✅ Library Documents (upload + suppression)

---

## 🔄 Phase 5 — Intégration LLM

- ✅ Implémentation ClaudeAdapter — branché à une route **POST /llm/test** (`src/routes/llm.routes.js`, `llm.controller.js`)
- 🔄 Construction du prompt système (Game Master) — prompt minimal dans `testLLM`, pas encore de flux « Game Master » complet
- ⬜ Gestion du contexte de session (historique des messages)
- ⬜ Streaming de la réponse vers le front

---

## 🔄 Phase 6 — Intégration Dés

- ✅ Implémentation LocalDiceAdapter (calcul JS pur)
- ✅ Parsing /roll NdX+K — adapter back + parsing côté front (`app.js`, `chat.html`)
- ✅ **Appel API dés** — le front envoie les lancers à POST /dice/roll et affiche le résultat
- ⬜ Branchement sur un provider externe (optionnel)

---

## 🔄 Phase 7 — Connexion Front ↔ Back

- ✅ Remplacer les données simulées par de vrais appels API — `character.html`, `chat.html`, `library.html` utilisent `apiRequest()` vers `/characters`, `/sessions`, `/messages`, `/dice/roll`, etc.
- ✅ Gestion des tokens JWT côté front — stockage dans `sessionStorage` (`authToken`), header `Authorization: Bearer` sur les pages protégées
- 🔄 Gestion des états de chargement et d’erreur — présente sur chat (isLoading, boutons désactivés) et login (affichage erreur) ; partielle sur character/library (catch + console, peu d’affichage utilisateur)

---

## ⬜ Phase 8 — Tests & Qualité

- ⬜ Tests des routes API (Jest/Vitest)
- ⬜ Validation règles métier
- ⬜ Revue sécurité

---

## ⬜ Phase 9 — Déploiement

- ⬜ Mise en place de l’environnement de production
- ⬜ Migration de la base de données en cloud
- ⬜ Déploiement du serveur
- ⬜ Configuration du stockage d’images
