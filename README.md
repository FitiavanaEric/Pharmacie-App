# PharmaGest — Système d'information de gestion de pharmacie

Projet basé sur l'étude MERISE (City University, TD MERISE, Licence 1).
Stack : **React + TypeScript + Tailwind CSS** (frontend) / **PHP** (API REST, sessions) / **MySQL** (base de données).

## Structure du projet

```
pharmacie-app/
├── backend/
│   ├── config/          Connexion DB, helpers, garde-fou d'authentification
│   ├── database/         schema.sql, seed.sql, create_admin.php (a executer une fois)
│   └── api/               Un endpoint PHP par module, tous proteges par session
└── frontend/
    └── src/
        ├── types/         Types TS (MLD + auth)
        ├── services/       Appels API (fetch avec cookies de session)
        └── components/     Un composant par ecran, filtres par role
```

## 1. Créer la base de données (phpMyAdmin, avec XAMPP)

1. Démarre Apache + MySQL dans XAMPP
2. `http://localhost/phpmyadmin` → crée une base `gestion_pharmacie`
3. Importe **dans l'ordre** :
   - `backend/database/schema.sql`
   - `backend/database/seed.sql`

## 2. Créer le compte administrateur (une seule fois)

Lance le backend (étape 3 ci-dessous), puis ouvre dans le navigateur :
```
http://127.0.0.1:8080/database/create_admin.php
```
Ça crée le compte : identifiant `admin`, mot de passe `admin123`.
**Change ce mot de passe après la première connexion**, et supprime ce fichier une fois utilisé.

## 3. Lancer le backend PHP

```bash
cd backend
php -S 127.0.0.1:8080
```
⚠️ Utilise `127.0.0.1`, pas `localhost` (évite un problème de lenteur connu sous Windows).

## 4. Lancer le frontend React

```bash
cd frontend
npm install
npm run dev
```
Ouvre `http://localhost:5173`. Connecte-toi avec `admin` / `admin123`.

## Authentification et rôles

L'application est maintenant protégée par un système de connexion (sessions PHP + cookies).
5 rôles, conformes à ton MOT :

| Rôle | Accès |
|---|---|
| **admin** | Tout, y compris gestion des employés et des comptes utilisateurs |
| **pharmacien** | Ventes, ordonnances (validation), clients, mutuelles, réformes |
| **gestionnaire_stock** | Articles, lots, réceptions, transferts, réformes, magasins |
| **caissier** | Ventes, clients, mutuelles |
| **responsable_achats** | Achats, réceptions, fournisseurs, rapports |

Le menu latéral s'adapte automatiquement au rôle connecté.
Un admin peut créer d'autres comptes depuis l'écran **"Comptes utilisateurs"**.

## Logique métier réelle (pas juste du CRUD)

- **Stock par magasin** : chaque lot est rattaché à un magasin (`id_magasin`). Les transferts déplacent réellement la quantité d'un lot vers un lot du magasin de destination (décrémentation + incrémentation réelles).
- **Réformes** : nécessitent un lot précis et décrémentent réellement le stock de ce lot.
- **Ventes sous ordonnance** : un article dont le type nécessite une ordonnance ne peut pas être vendu sans une ordonnance validée (< 90 jours) pour le client sélectionné — vérifié côté serveur, pas juste dans l'interface.
- **Réceptions** : la validation d'une réception crée automatiquement les lots correspondants en stock, dans le magasin choisi.

## Rapports & statistiques

- Ventes des 30 derniers jours (graphique)
- **Marge estimée** par article et globale (chiffre d'affaires - coût d'achat moyen constaté en réception)
- **Rotation de stock** (quantité vendue / stock actuel)
- **Comparaison de périodes** (30 derniers jours vs 30 jours précédents, en %)
- Valeur du stock, répartition par mode de paiement

## Correspondance avec la conception MERISE

Le projet couvre maintenant l'intégralité des entités et processus du **MCD futur / MLD / MPD validés** :
tous les CRUD, les 6 processus du MCT, le contrôle d'ordonnance du processus "Gérer les ventes",
et l'organisation par rôles du MOT.

Note : le MCD **actuel** (ancien, avant correction) mentionnait Facture_Client, Caisse et Inventaires —
ces éléments ont été retirés dans le MCD **futur/corrigé et validé**, qui est la base du MLD/MPD final.
Ils ne sont donc plus implémentés, conformément à cette version validée de la conception.

## Sécurité — à faire avant toute mise en production réelle

- Changer le mot de passe admin par défaut
- Supprimer `backend/database/create_admin.php` après utilisation
- Ne jamais exposer le serveur de développement PHP (`php -S`) sur un réseau public
