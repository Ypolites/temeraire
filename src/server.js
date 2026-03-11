/* ══════════════════════════════════════════════════════════════
   server.js — Point d'entrée du serveur Express
   Temeraire RPG
   ══════════════════════════════════════════════════════════════ */

   require("dotenv").config();
   const express = require("express");
   const path = require("path");
   
   const app = express();
   const PORT = process.env.PORT || 3000;
   
   /* ──────────────────────────────────────────────
      Middlewares globaux
      ────────────────────────────────────────────── */
   
   // Parse les requêtes JSON entrantes
   app.use(express.json());
   
   // Sert les fichiers statiques (HTML, CSS, JS front-end)
   app.use(express.static(path.join(__dirname, "../public")));
   
   /* ──────────────────────────────────────────────
      Routes API
      ────────────────────────────────────────────── */
   
   // Route de test — vérifie que le serveur répond
   app.get("/api/health", (req, res) => {
     res.json({ status: "ok", message: "Serveur Temeraire opérationnel" });
   });
   
   // Auth
   const authRoutes = require("./routes/auth.routes");
   app.use("/auth", authRoutes);

  // LLM (mock ou provider réel)
  const llmRoutes = require("./routes/llm.routes");
  app.use("/llm", llmRoutes);

  // Characters
  const characterRoutes = require("./routes/character.route");
  app.use("/characters", characterRoutes);

  // Game Sessions
  const sessionRoutes = require("./routes/session.routes");
  app.use("/sessions", sessionRoutes);

  // Avatar Moods
  const moodRoutes = require("./routes/mood.routes");
  app.use("/characters/:id/moods", moodRoutes);
   
   /* ──────────────────────────────────────────────
      Démarrage du serveur
      ────────────────────────────────────────────── */
   
   app.listen(PORT, () => {
     console.log(`Serveur démarré sur http://localhost:${PORT}`);
   });