# Utiliser une image Node.js officielle comme base
FROM node:20-alpine

# Définir le répertoire de travail dans le conteneur pour le client
WORKDIR /usr/app

# Copier les fichiers du projet du client React
COPY package*.json ./
COPY . .

# Installer les dépendances du client
RUN npm install --legacy-peer-deps

# Exposer le port utilisé par le client React
EXPOSE 3000

# Définir la commande pour lancer le client React
CMD ["npm", "start"]
