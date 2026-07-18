# PharmaGest — Système d'information de gestion de pharmacie

Projet basé sur l'étude MERISE (City University, TD MERISE, Licence 1).
Stack : **React + TypeScript + Tailwind CSS** (frontend) / **PHP** (API REST, sessions) / **MySQL** (base de données).



```
pharmacie-app/
├── backend/
│   ├── config/          Connexion DB, helpers, garde-fou d'authentification
│
│   └── api/               Un endpoint PHP par module, tous proteges par session
└── frontend/
    └── src/
        ├── types/         Types TS (MLD + auth)
        ├── services/       Appels API (fetch avec cookies de session)
        └── components/     Un composant par ecran, filtres par role
```

