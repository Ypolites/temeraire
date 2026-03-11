/* ══════════════════════════════════════════════════════════════
   app.js — Point d'entrée du serveur Express
   Temeraire RPG
   ══════════════════════════════════════════════════════════════ */

   import 'dotenv/config';
   import express from 'express';
   import path from 'path';
   import { fileURLToPath } from 'url';
   
   // Nécessaire pour utiliser __dirname avec les modules ES
   const __filename = fileURLToPath(import.meta.url);
   const __dirname  = path.dirname(__filename);
   
   const app  = express();
   const PORT = process.env.PORT || 3000;
   
   /* ──────────────────────────────────────────────
      Middlewares globaux
      ────────────────────────────────────────────── */
   
   // Parse les requêtes JSON entrantes
   app.use(express.json());
   
   // Sert les fichiers statiques (HTML, CSS, JS front-end)
   app.use(express.static(path.join(__dirname, 'public')));
   
   /* ──────────────────────────────────────────────
      Routes API (à brancher au fur et à mesure)
      ────────────────────────────────────────────── */
   
   // Route de test — vérifie que le serveur répond
   app.get('/api/health', (req, res) => {
     res.json({ status: 'ok', message: 'Serveur Temeraire opérationnel' });
   });
   
   /* ──────────────────────────────────────────────
      Démarrage du serveur
      ────────────────────────────────────────────── */
   
   app.listen(PORT, () => {
     console.log(`Serveur démarré sur http://localhost:${PORT}`);
   });