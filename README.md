# Gestion du club de football

Application React (web + mobile responsive), maintenant branchee sur une
vraie base de donnees SQLite (plus de liste statique / localStorage).
Les categories, joueurs, matchs, buteurs, cartons et classements sont
stockes dans un fichier `server/club.db` que tu peux interroger,
sauvegarder, ou migrer comme n'importe quelle base relationnelle.

## Architecture

```
football-club-manager/
  server/           -> API Node/Express + base SQLite (le "backend")
    server.js
    package.json
    club.db          (cree automatiquement au premier lancement)
  src/              -> l'application React (le "frontend")
    App.jsx
    api.js           -> client qui appelle l'API
    main.jsx
  index.html
  package.json
  vite.config.js
```

## Installation (les deux parties)

Ouvre deux terminaux.

**Terminal 1 - backend (API + base de donnees)**
```bash
cd server
npm install
npm start
```
Tu dois voir : `API en ecoute sur http://localhost:4000`

**Terminal 2 - frontend (interface)**
```bash
npm install
npm run dev
```
Ouvre ensuite http://localhost:5173

L'application va chercher/enregistrer toutes les donnees via l'API du
terminal 1. Si le terminal 1 n'est pas lance, l'appli affiche un message
d'erreur avec un bouton "Reessayer".

## Ou sont stockees les donnees ?

Dans le fichier `server/club.db` (SQLite). C'est une vraie base
relationnelle avec des tables `categories`, `players`, `matches`,
`goals`, `cards`, `standings_rows`, `settings` - tu peux l'ouvrir avec
n'importe quel client SQLite (DB Browser for SQLite, DBeaver, etc.) pour
consulter ou exporter les donnees directement.

## Deployer en production

1. **Backend** : deploie le dossier `server/` sur ton serveur (ou un
   service comme Railway/Render), lance `npm install && npm start`.
   Le fichier `club.db` doit rester sur un disque persistant.
2. **Frontend** : dans `src/api.js`, remplace l'URL par defaut
   (`http://localhost:4000/api`) par l'URL publique de ton API. Puis :
   ```bash
   npm run build
   ```
   Deploie le dossier `dist/` genere sur n'importe quel hebergement
   statique.

## Passer a PostgreSQL (optionnel, pour plus gros volumes)

`server/server.js` utilise `better-sqlite3` avec des requetes SQL
standard. Si tu preferes rester sur PostgreSQL (comme le reste de ton
infra FORMANET/ONE ERP), il suffit de remplacer les appels
`db.prepare(...).run/get/all(...)` par un client `pg` equivalent — le
schema des tables (voir le bloc `CREATE TABLE` en haut de `server.js`)
est directement transposable en PostgreSQL.

## Plusieurs personnes en meme temps

Comme les donnees vivent maintenant dans une vraie base cote serveur (et
non plus dans le navigateur), plusieurs personnes peuvent utiliser
l'application en meme temps depuis des appareils differents, tant
qu'elles pointent vers la meme API.
