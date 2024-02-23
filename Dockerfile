# Utiliser une image Node.js officielle comme base
FROM node:14-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers nécessaires pour installer les dépendances du serveur Express
COPY server/package*.json ./server/
RUN npm install --prefix server

# Copier les fichiers du projet du client React
COPY package*.json ./
COPY . .

# Construire l'application React
RUN npm run build

# Exposer les ports nécessaires
EXPOSE 3000
EXPOSE 5000

# Définir la commande pour lancer le serveur Express
WORKDIR /app/server
CMD ["node", "server.js"]
