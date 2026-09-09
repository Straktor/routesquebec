# Routes du Québec (Quebec Highways Map)

Une application web interactive développée avec **Vue 3**, **TanStack** (Vue Query et Vue Table) et **Leaflet** pour explorer et visualiser le réseau autoroutier et les routes nationales du Québec.

## Fonctionnalités

- **Carte interactive du Québec (Leaflet)** :
  - Rendu vectoriel de toutes les autoroutes majeures (A-10, A-15, A-20, A-25, A-30, A-35, A-40, A-50, A-55, A-70, A-73, A-85) et routes nationales (109, 117, 132, 138, 155, 169, 175).
  - Sélection bidirectionnelle : cliquer sur une route dans la liste ou sur la carte la met en surbrillance (avec halo lumineux) et centre la vue avec zoom automatique.
  - Basculement entre fond de carte moderne (CartoDB Voyager) et OpenStreetMap standard.
- **Barre latérale motorisée par TanStack** :
  - **TanStack Table** : recherche dynamique, filtrage par catégorie (Toutes, Autoroutes, Routes), et tri multi-colonnes (Numéro, Nom, Distance).
  - **TanStack Query** : chargement asynchrone et mise en cache performante des jeux de données géographiques.
  - Écussons authentiques d'autoroutes (bleu québécois) et de routes (vert québécois).
- **Conçu pour GitHub Pages** :
  - Chemins relatifs configurés dans Vite (`base: './'`).
  - Workflow GitHub Actions prêt à l'emploi (`.github/workflows/deploy.yml`).

## Technologies

- [Vue 3](https://vuejs.org/) (Composition API & `<script setup>`)
- [TypeScript](https://www.typescriptlang.org/)
- [TanStack Vue Query](https://tanstack.com/query/latest) (Gestion d'état et requêtes serveur)
- [TanStack Vue Table](https://tanstack.com/table/latest) (Tableaux headless réactifs, filtrage et tri)
- [Leaflet](https://leafletjs.com/) (Moteur de cartographie)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Vite](https://vite.dev/)
- [Lucide Vue](https://lucide.dev/) (Icônes modernes)

## Démarrage local

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev

# Construction pour la production
npm run build

# Prévisualisation de la version de production
npm run preview
```

## Déploiement sur GitHub Pages

1. Reliez votre dépôt local à votre dépôt GitHub distant :
   ```bash
   git remote add origin https://github.com/<votre-utilisateur>/mapRoutes.git
   git push -u origin main
   ```
2. Sur GitHub, accédez à **Settings** > **Pages** de votre dépôt.
3. Sous **Build and deployment** > **Source**, sélectionnez **GitHub Actions**.
4. Chaque `git push` sur la branche `main` déclenchera automatiquement le déploiement.
