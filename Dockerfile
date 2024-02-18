# Utiliser une image Node.js officielle comme base
FROM node:14-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers nécessaires pour installer les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers du projet dans le conteneur
COPY . .

# Construire l'application React
RUN npm run build

# Exposer le port sur lequel l'application React s'exécute
EXPOSE 3000

# Définir la commande pour exécuter l'application
CMD ["npm", "start"]
