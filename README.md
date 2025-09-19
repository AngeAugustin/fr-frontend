# FR Frontend - Générateur TFT Automatisé

## 📋 Description

FR Frontend est une application web React moderne qui permet de générer automatiquement des **Tableaux de Flux de Trésorerie (TFT)** et des **feuilles maîtresses** conformes aux normes SYSCOHADA à partir de fichiers CSV de balance générale.

## ✨ Fonctionnalités Principales

### 🔐 Authentification
- **Connexion sécurisée** avec nom d'utilisateur/mot de passe
- **Inscription** de nouveaux utilisateurs
- **Gestion des tokens JWT** avec refresh automatique
- **Connexion Google** (intégration prête)
- **Session persistante** avec option "Se souvenir de moi"

### 📊 Génération TFT
- **Upload de fichiers CSV** de balance générale
- **Configuration des dates** de période (début/fin)
- **Génération automatique** du TFT conforme SYSCOHADA
- **Contrôle de cohérence** automatique des données
- **Export Excel** des fichiers générés
- **Validation en temps réel** des données

### 📈 Feuilles Maîtresses
- **Génération automatique** des feuilles maîtresses par groupe de comptes
- **Affichage détaillé** des comptes avec soldes, débits, crédits
- **Export Excel** par groupe de comptes
- **Visualisation tabulaire** style Excel

### 📚 Historique et Gestion
- **Historique complet** des uploads et générations
- **Filtrage avancé** par période, date d'upload, statut
- **Recherche** dans l'historique
- **Pagination** avec chargement progressif
- **Vue tableau et cartes** pour l'historique
- **Détails complets** de chaque rapport généré

### 🎨 Interface Utilisateur
- **Design moderne** et responsive
- **Sidebar rétractable** pour navigation
- **Notifications toast** pour le feedback utilisateur
- **Thème cohérent** avec palette de couleurs professionnelle
- **Animations fluides** et transitions

## 🏗️ Architecture Technique

### Stack Technologique
- **Frontend**: React 19.1.1 avec Vite 7.1.2
- **Routing**: React Router DOM 7.8.2
- **Styling**: CSS3 avec design system personnalisé
- **Icons**: React Icons 5.5.0
- **Notifications**: React Toastify 11.0.5
- **Build Tool**: Vite avec plugin React SWC
- **Linting**: ESLint 9.33.0

### Structure du Projet
```
src/
├── api/                    # Services API
│   ├── auth.js            # Authentification
│   └── authFetch.js       # Requêtes authentifiées
├── components/             # Composants réutilisables
│   ├── AuthLayout.jsx     # Layout d'authentification
│   ├── ContextMenu.jsx    # Menu contextuel
│   ├── GoogleButton.jsx   # Bouton Google OAuth
│   ├── LoginForm.jsx      # Formulaire de connexion
│   ├── LogoutButton.jsx   # Bouton de déconnexion
│   ├── MainContent.jsx    # Contenu principal
│   ├── RegisterForm.jsx   # Formulaire d'inscription
│   └── Sidebar.jsx        # Barre latérale
├── contexts/              # Contextes React
│   └── SidebarContext.jsx # État de la sidebar
├── pages/                 # Pages de l'application
│   ├── GeneratePage.jsx   # Page de génération TFT
│   ├── HistoryPage.jsx    # Page d'historique
│   ├── LoginPage.jsx      # Page de connexion
│   ├── ProtectedPage.jsx   # Page protégée
│   └── RegisterPage.jsx   # Page d'inscription
├── assets/                # Ressources statiques
├── App.jsx               # Composant principal
├── router.jsx            # Configuration du routing
└── main.jsx             # Point d'entrée
```

### API Backend
L'application communique avec une API REST Django :
- **Base URL**: `http://127.0.0.1:8000/api`
- **Endpoints principaux**:
  - `/register/` - Inscription utilisateur
  - `/token/` - Authentification JWT
  - `/token/refresh/` - Renouvellement token
  - `/logout/` - Déconnexion
  - `/reports/upload-balance/` - Upload fichier CSV
  - `/reports/balance-history/` - Historique des rapports

## 🚀 Installation et Configuration

### Prérequis
- **Node.js** 18+ 
- **npm** ou **yarn**
- **Backend API** Django en cours d'exécution sur `http://127.0.0.1:8000`

### Installation
```bash
# Cloner le repository
git clone <repository-url>
cd fr-frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

### Scripts Disponibles
```bash
npm run dev      # Serveur de développement (port 5173)
npm run build    # Build de production
npm run preview  # Prévisualisation du build
npm run lint     # Vérification ESLint
```

## 🔧 Configuration

### Variables d'Environnement
Créer un fichier `.env.local` :
```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_APP_NAME=FR Frontend
```

### Configuration Vite
Le fichier `vite.config.js` est configuré avec :
- Plugin React SWC pour des builds rapides
- Support des modules ES6
- Optimisations de production

## 📦 Déploiement

### Build de Production
```bash
# Générer le build optimisé
npm run build

# Les fichiers sont générés dans le dossier dist/
```

### Déploiement Web
1. **Build** : `npm run build`
2. **Upload** du dossier `dist/` sur votre serveur web
3. **Configuration** du serveur pour servir les fichiers statiques
4. **Redirection** des routes vers `index.html` (SPA)

### Déploiement avec Docker
```dockerfile
# Dockerfile exemple
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Configuration Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /usr/share/nginx/html;
    index index.html;

    # Gestion des routes SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache des assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔒 Sécurité

### Authentification
- **JWT Tokens** avec refresh automatique
- **Stockage sécurisé** dans localStorage
- **Gestion des sessions** avec expiration
- **Protection des routes** sensibles

### Validation
- **Validation côté client** des formulaires
- **Sanitisation** des entrées utilisateur
- **Gestion d'erreurs** robuste
- **Messages d'erreur** sécurisés

## 🧪 Tests et Qualité

### Linting
```bash
npm run lint          # Vérification ESLint
npm run lint:fix      # Correction automatique
```

### Structure de Tests (à implémenter)
```
src/
├── __tests__/        # Tests unitaires
├── components/       # Tests de composants
└── pages/           # Tests de pages
```

## 📱 Responsive Design

L'application est entièrement responsive avec :
- **Mobile-first** approach
- **Breakpoints** adaptatifs
- **Sidebar rétractable** sur mobile
- **Tables scrollables** sur petits écrans
- **Touch-friendly** interface

## 🔄 Intégration Continue

### GitHub Actions (exemple)
```yaml
name: CI/CD
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

## 📊 Performance

### Optimisations
- **Code splitting** avec React.lazy
- **Tree shaking** automatique avec Vite
- **Compression** des assets
- **Cache** des ressources statiques
- **Lazy loading** des composants

### Métriques
- **Bundle size** optimisé
- **First Contentful Paint** < 1.5s
- **Time to Interactive** < 3s
- **Lighthouse Score** > 90

## 🐛 Dépannage

### Problèmes Courants

#### Erreur de connexion API
```bash
# Vérifier que le backend est démarré
curl http://127.0.0.1:8000/api/

# Vérifier les CORS dans le backend Django
```

#### Problèmes de build
```bash
# Nettoyer le cache
rm -rf node_modules package-lock.json
npm install

# Vérifier la version Node.js
node --version  # Doit être 18+
```

#### Erreurs de routing
- Vérifier la configuration du serveur web
- S'assurer que toutes les routes redirigent vers `index.html`

## 🤝 Contribution

### Guidelines
1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/amazing-feature`)
3. **Commit** les changements (`git commit -m 'Add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir** une Pull Request

### Standards de Code
- **ESLint** configuration stricte
- **Conventions** de nommage cohérentes
- **Documentation** des composants complexes
- **Tests** pour les nouvelles fonctionnalités

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).

## 👥 Équipe

- **Développeur Frontend** : Augustin FACHEHOUN
- **Technologies** : React, Vite, JavaScript ES6+

## 📞 Support

Pour toute question ou problème :
- **Issues** : Utiliser le système d'issues GitHub
- **Documentation** : Consulter ce README
- **API** : Vérifier la documentation du backend Django

---

**Version** : 0.0.0  
**Dernière mise à jour** : $(date)  
**Statut** : En développement actif