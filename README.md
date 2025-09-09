<div align="center">
	<h1>💬 Chat4Crisis</h1>
	<p>Plateforme légère de simulation d'exercices de gestion de crise en temps réel (rooms, événements aléatoires, diffusion formateur).</p>
	<sup><em>Prototype pédagogique – non destiné encore à la production.</em></sup>
</div>

---

## 🎯 Objectif
Offrir au formateur ("administrateur") un espace de simulation immersif où des participants rejoignent une salle et reçoivent :
1. Des messages / événements injectés manuellement (décisions, incidents, médias…)
2. Des événements aléatoires générés automatiquement (bruit opérationnel)
3. Des signaux sonores (beeps) pour mettre sous pression lors d’alertes
4. (Futur) Des appels simulés type « 101 » (voix IA / TTS) 

## ✨ Fonctionnalités actuelles
- Création / accès à une salle via code unique (URL directe)
- WebSocket temps réel (chat + événements de crise)
- Générateur d'événements automatiques probabilistes par salle (intervalle 15–30s)
- Distinction des types de messages (SYSTEM / CHAT / EVENT)
- Beep audio côté client sur réception d’un EVENT
- Persistance SQLite via Prisma (Rooms, Participants, Messages, CrisisEvents)
- Docker multi‑stage pour déploiement
- UI minimaliste Next.js + Tailwind

## 🧪 En cours / Prochaines étapes (roadmap)
- [x] Scheduler aléatoire par salle
- [ ] Interface Admin enrichie (dashboard, injection ciblée) – (implémentée basiquement dans cette itération)
- [ ] Authentification / secret admin robuste
- [ ] Export (journal CSV / PDF / JSON des échanges)
- [ ] Scénarisation (scripts d’événements planifiés)
- [ ] Appels audio IA (TTS + scénarios vocaux)
- [ ] Relecture / playback d’une session
- [ ] Gestion rôles (cellule communication, technique, direction…)

## 🏗️ Architecture (vue rapide)
| Couche | Tech | Rôle |
|--------|------|------|
| UI | Next.js (App Router) + React 18 + Tailwind | Pages `/(home)`, `/room/[code]`, `/admin` |
| Temps réel | WebSocket (lib `ws`) via serveur Node custom | Diffusion messages & événements |
| Données | Prisma + SQLite | Persistence légère, fichiers (`dev.db`) |
| Scheduler | setInterval in‑memory par salle | Génération EVENTS automatiques |
| Conteneur | Docker (Node 20 alpine) | Build & exécution | 

> Note: Le scheduler est en mémoire. Un redémarrage efface l’état transient (acceptable pour un exercice). Pour production : job queue / persistance des événements planifiés.

## 🗂️ Modèle de données (simplifié)
```
Room(id, code, createdAt)
Participant(id, name, role, roomId, joinedAt, lastSeen)
Message(id, roomId, sender, content, type, createdAt)
CrisisEvent(id, roomId, title, description, severity, createdAt, dispatched)
```

## 🚀 Démarrage local
Pré-requis : Node 18+ / npm.

```bash
cp .env.example .env              # (ajoutez éventuellement ADMIN_SECRET)
npm install
npm run dev                       # http://localhost:3000
```

Accès :
- Page d’accueil : création / rejoindre une salle
- Création formateur (bouton) → ouvre `/room/CODE?admin=1&name=Formateur`
- Participants rejoignent la même URL sans `admin=1`

## 🧪 Tester rapidement
1. Ouvrir une salle formateur (nouvel onglet) 
2. Ouvrir 1–2 autres onglets participants
3. Envoyer des chats, attendre événements aléatoires (15–30s, proba ≈30%)
4. Déclencher manuellement un événement (bouton formateur)

## 🔐 Sécurité (état actuel)
| Aspect | Statut | Commentaire |
|--------|--------|-------------|
| Auth admin | Minimal (query param) | À remplacer par secret/env + session |
| Isolation rooms | Basée sur code | Ajouter expiration / rotation souhaitable |
| Validation entrée | Faible | Ajouter zod / sanitation |
| Logs | Console uniquement | Prévoir export structuré |

## 🧱 Build production
```bash
npm run build
npm start        # lance server.js (Next + WebSocket)
```

## 🐳 Docker
```bash
docker build -t chat4crisis .
docker run -p 3000:3000 --env-file .env chat4crisis
```

## 🔌 Points techniques notables
- Custom `server.js` fusionne HTTP Next + WebSocket `ws`
- Intervalle aléatoire : `15s + rand(0–15s)` ; 30% proba d’émission
- Beep via Web Audio API (Oscillator 880Hz ~180ms)
- Extensibilité facile: ajouter type MESSAGE, intégrer TTS (ex: ElevenLabs / Azure Speech) côté EVENT

## 🛡️ Variables d'environnement
| Nom | Rôle | Exemple |
|-----|------|---------|
| DATABASE_URL | Connexion SQLite | file:./dev.db |
| ADMIN_SECRET | (Option) Secret API admin | changer_par_valeur_sûre |

## 🧩 Interface Admin (base)
Une page `/admin` (expérimentale) affiche la liste des rooms et permet d’injecter un événement (si `ADMIN_SECRET` envoyé côté client ou param). Améliorations prévues : authentification, historique, filtrage par sévérité.

## 🗺️ Idées futures
- Timeline visuelle des événements
- Module scoring (temps de réaction)
- Exports anonymisés pour debriefing
- Mode “replay” (lecture progressive horodatée)
- Support cluster / scaling (Redis pub/sub pour WS)

## 🤝 Contributions
Prototype interne ; PR / issues bienvenues si opensource envisagé plus tard.

## ⚠️ Licence
Non définie (par défaut tous droits réservés tant qu'aucune licence explicite n'est ajoutée).

---
Made with Next.js, Prisma & a pinch of adrenaline ⚡

