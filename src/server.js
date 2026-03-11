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

   // Redirige la racine vers la page de login
   app.get("/", (req, res) => {
     res.redirect("/login.html");
   });
   
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

  // Messages
  const messageRoutes = require("./routes/message.routes");
  app.use("/sessions/:id/messages", messageRoutes);

  // Library Documents
  const libraryRoutes = require("./routes/library.routes");
  app.use("/sessions/:id/documents", libraryRoutes);
   
   /* ──────────────────────────────────────────────
      Démarrage du serveur
      ────────────────────────────────────────────── */
   
   app.listen(PORT, () => {
     console.log(`Serveur démarré sur http://localhost:${PORT}`);
   });