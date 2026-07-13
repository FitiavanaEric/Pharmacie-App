# PharmaGest — Système d'information de gestion de pharmacie

Projet basé sur l'étude MERISE (City University, TD MERISE, Licence 1).
Stack : **React + TypeScript + Tailwind CSS** (frontend) / **PHP** (API REST) / **PostgreSQL** (base de données).

## Structure du projet

```
pharmacie-app/
├── backend/           API PHP (PDO PostgreSQL)
│   ├── config/        Connexion DB + helpers
│   ├── database/       Scripts SQL (schema + données de test)
│   └── api/            Endpoints REST (articles, ventes, clients...)
└── frontend/          Application React (Vite)
    └── src/
        ├── types/       Types TS correspondant au MLD
        ├── services/    Appels API (fetch)
        └── components/  Pages et composants UI
```

## 1. Installer PostgreSQL et créer la base

```bash
psql -U postgres
CREATE DATABASE pharmacie;
\q
```

Puis charger le schéma et les données de démonstration :

```bash
psql -U postgres -d pharmacie -f backend/database/schema.sql
psql -U postgres -d pharmacie -f backend/database/seed.sql
```

## 2. Configurer et lancer le backend PHP

Copie `.env.example` en `.env` (ou modifie directement `config/database.php`) avec tes identifiants PostgreSQL.

Assure-toi que l'extension `pdo_pgsql` est active dans ton `php.ini` :
```ini
extension=pdo_pgsql
extension=pgsql
```

Lance un serveur PHP local depuis le dossier `backend/` :
```bash
cd backend
php -S localhost:8080
```

L'API sera accessible sur `http://localhost:8080/api/articles.php`, etc.
Si tu utilises Apache/XAMPP/WAMP à la place, place le dossier `backend/` dans ton répertoire web
(ex : `htdocs/pharmacie-app/backend`) et adapte `API_URL` dans le frontend en conséquence.

## 3. Installer et lancer le frontend React

```bash
cd frontend
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:5173`.

**Important** : ouvre `frontend/src/services/api.ts` et vérifie que la constante `API_URL`
correspond bien à l'adresse de ton backend PHP (par défaut `http://localhost/pharmacie-app/backend/api`,
à changer en `http://localhost:8080/api` si tu utilises le serveur PHP intégré ci-dessus).

## Fonctionnalités incluses

- **Tableau de bord** : ventes du jour, alertes de stock critique et de péremption
- **Articles** : CRUD complet, avec type et fournisseur associés, stock calculé depuis les lots
- **Stock / Lots** : gestion des lots avec date de péremption et emplacement
- **Ventes** : point de vente simplifié (panier, décrémentation automatique du stock, historique)
- **Clients** : CRUD complet
- **Fournisseurs** : CRUD complet

## Prochaines étapes suggérées

- Authentification (rôles pharmacien / gestionnaire / caissier)
- Gestion des ordonnances avec validation pharmaceutique
- Rapports et statistiques (exports PDF)
- Gestion des mutuelles et remboursements
- Transferts entre magasins et réformes de stock

## Correspondance avec la conception MERISE

Ce projet implémente directement le **MPD adapté à PostgreSQL** issu du document TD MERISE :
chaque table de `backend/database/schema.sql` correspond à une entité du MLD (Fournisseur, Article,
Type_Article, Lot, Client, Vente, Ligne_Vente, etc.), avec les mêmes clés primaires et étrangères.
