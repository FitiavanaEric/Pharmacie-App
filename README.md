

```
pharmacie-app/
├── backend/           API PHP (PDO MySQL)
│   ├── config/         Connexion DB + helpers
│   ├── database/       Scripts SQL (schema + données de test)
│   └── api/             Endpoints REST (un fichier par module)
└── frontend/           Application React (Vite)
    └── src/
        ├── types/        Types TS correspondant au MLD
        ├── services/     Appels API (fetch)
        └── components/   Un composant par module/écran
```

