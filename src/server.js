// Chargement des variables d'environnement en premier
require('dotenv').config();

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globaux
app.use(express.json()); // Permet de lire le corps des requêtes en JSON

// Route de test
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Serveur Temeraire opérationnel' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});