### 1. Overview, Objectives, and Target Users

**Purpose**
This application is a web app for playing *Temeraire: The RPG* with an AI Game Master (GM). It will connect to an LLM provider (Claude to start) and must be easily swappable so we can change providers without major refactoring.

The core experience is a chat between the player and the AI GM. The chat UI should display the player avatar in a JRPG-inspired layout. When discussing with the AI Game Master (GM) the player must be able to send it’s message with a caption and a “mood avatar”. The player can upload ten avatar “moods” when creating a character sheet and select which mood to display when sending a message.

The app must also support dice rolls (via a dedicated third-party dice API, to be selected). It must support saving the game, since a campaign can span multiple months.

**Usage context**
This is for personal use. The initial scope targets two players.

---

### 2. User Roles

| Role | Description | Capabilities |
| --- | --- | --- |
| Player | The person playing the game | Create a character sheet, upload character images, send messages in the chat, roll dice |

---

### 3. Usage Context

- **Devices:** Web app with a responsive UI for desktop and smartphone.
- **Environment:** The player will likely be at home.
- **Visual design:** Player-friendly, with a Regency-era aesthetic (the game’s setting). I can provide additional graphic assets later.

---

### 4. Features (MoSCoW Prioritization)

**Must have (v1 — wireframe scope):**

1. **User login** — so only authorized players can access a session.
2. **Chat** — the core screen where players interact with the AI GM. The Chat screen represents a **single campaign session**. It includes:
    - A message list (GM + Player messages + system messages).
    - A composer area where the player writes a message and sends it.
    - A **“Load more”** button at the top of the message list (On click, it reveals older predefined messages (simulated pagination)
    - Message types and UI style:
        - **Player messages**: right-aligned.
        - **GM messages**: left-aligned, labeled **“MJ”**.
        - **System messages**: centered and visually distinct (e.g., gray card).
3. **Dice roll system (GM-initiated only)** — likely via a dice API so results are fair and nicely animated. 
    - The GM can post a message that contains a “dice request” UI element. This element must include:
        - A short instruction in French (example: “Saisis ta commande de jet de dés :”).
        - An input field prefilled with an example like: `/roll 1d20+2`
        - A CTA button in French (example: “Lancer”).
    - When the player clicks “Lancer”:
        - Show a **dice roll animation** inspired by Let’s Role (reference: https://lets-role.com/).  This is a **visual inspiration**, not a pixel-perfect clone.
        - Then display the result as a system message in French (example: “Résultat : 1d20+2 = 14”).
    - Dice parsing can be simplified:
        - Support at least: `NdX+K` and `NdX-K` (e.g., `1d20+2`, `2d6-1`)
        - If the input is invalid, show an error message in French.
    - The player should not be able to trigger dice rolls unless the most recent GM message contains a dice request element.
4. **Character sheet creation** — The character sheet fields are defined in section “7. Character sheet”. Implement a **Character** screen that can display and edit those fields (v1 wireframe, simulated save states only).
5. **Library Screen (PDF Only)** — a place to upload and store the rules, GM tone directives, campaign story, and lore documents. The Library contains only **PDF documents**. Library categories (UI in French) “Règles”, “Directives MJ”, “Campagne (histoire)” and “Lore (univers)”

**Should have (v2):**

**Could have (future):**

1. **Multiple game sessions** — a menu to create and manage different campaigns.

**Won’t have (out of scope):**

- Map system

---

### 5. User Flows

**Flow 1 — Player onboarding:**

1. User signs up with email and password.
2. User lands on the game chat.

**Flow 2 — Create a character:**

1. User taps “New character”, enters a name, and fills in character information (see table “Character Info”).
2. User uploads one avatar image per mood (10 moods in v1).
3. User saves the character.

**Flow 3 — Play the game:**

1. When the user wants to chat, they select an avatar mood.
2. They optionally add a caption (example: “*Whispering while leaning back on the couch*”).
3. They type their message (example: “I don’t think it’s necessary.”).
4. They press “Send”.

**Edge cases to handle:**

| Scenario | Expected behavior |
| --- | --- |
| User closes the app mid-entry | Auto-save preserves all data entered so far. |

---

### 6. Data Model

```
User
├── id
├── email
├── password_hash (simulated in wireframe)
├── username
├── has many → game_sessions
└── has many → characters

GameSession ("campaign")
├── id
├── owner_user_id (the player who created/owns the session)
├── name
├── icon
├── created_at
├── updated_at
├── has many → session_players (exactly 2 in v1)
├── has many → messages
├── has many → dice_requests
└── has many → library_documents

SessionPlayer
├── id
├── game_session_id
├── user_id
└── role: "player" (v1)

Message
├── id
├── game_session_id
├── author_type: "player" | "gm" | "system"
├── author_user_id (nullable; set when author_type="player")
├── content (rich text / markdown-like)
├── caption (optional, player-only)
├── selected_mood (player-only; one of the 10 fixed moods)
├── created_at
└── ui_state (wireframe only): synced | pending | failed

DiceRequest (GM-initiated)
├── id
├── game_session_id
├── message_id (the GM message that contains the dice request UI element)
├── status: "open" | "resolved"
├── prompt_text_fr (e.g., "Saisis ta commande de jet de dés :")
├── default_command (e.g., "/roll 1d20+2")
├── submitted_command (nullable)
├── result_total (nullable)
├── result_breakdown (nullable)
└── created_at

Character
├── id
├── user_id (owner)
├── name
├── species: "Humain" | "Dragon"
├── identity_fields (name, pronouns, look, position, nationality, etc.)
├── attributes (Body/Cunning/Manners/Steel: 0–4)
├── skills (each: Trained | Adept | Master)
├── dangers (level 0–8 + checkbox_track_size 2–4)
├── devotions (duties/desires; global rank constraint ≤ 10)
├── areas_of_expertise (max 10; ranked)
├── free_text_sections (connections/bonds/traits/abilities)
├── carried_resources (max 6; uses remaining)
├── equipment (free list)
├── has many → avatar_moods (exactly 10 images)
└── created_at, updated_at

AvatarMood
├── id
├── character_id
├── mood_label (one of the 10 fixed labels)
└── image_url (simulated in wireframe)

LibraryDocument (PDF only)
├── id
├── game_session_id
├── category: "Règles" | "Directives MJ" | "Campagne (histoire)" | "Lore (univers)"
├── title
├── description (optional)
├── file_type: "PDF"
├── file_url (simulated)
├── created_at
└── created_by_user_id

Notes (wireframe constraints)
- v1 wireframe uses hardcoded fake data (including exactly 2 Users and 1 GameSession).
- No persistence is required; UI should simulate save/sync states per message and per form edits.
```

### 7. Character sheet

**Hard rules (wireframe v1):**

- UI labels in **French**.
- Code/comments/spec text in **English**.
- No backend. Persisted values are simulated. Use the global sync indicator states (synced / pending / failed).

**Character type**

- `species`: select **Humain** or **Dragon**.

**Avatar moods (10 images, v1)**

- The player uploads exactly **10** avatar images, one per mood.
- Mood list (fixed labels, UI in French):
    1. Neutre
    2. Heureux·se
    3. Triste
    4. En colère
    5. Effrayé·e
    6. Surpris·e
    7. Déterminé·e
    8. Blessé·e
    9. Moqueur·se
    10. Concentré·e
- Chat screen must let the player select one of these moods before sending a message, and display the corresponding avatar image in the JRPG layout.

**Identity (editable fields)**

- Nom (ex: Constance Hawthorne)
- Pronoms (ex: elle)
- Apparence (texte long)
- Poste (ex: Capitaine)
- Nationalité (ex: Britannique)
- États de service (ex: Vétéran décoré)
- Réputation / Station (ex: Bien connu·e)
- Tempérament (ex: Prudent·e)
- Distinctions (texte long)
- Caractéristiques (texte long)

**Attributes & Skills**

- Each attribute is a number from **0 to 4** (inclusive): Corps, Ruse, Manières, Sang-froid.
- Each skill is a select: **Entraîné**, **Adepte**, **Maître**.
- Corps (0–4)
    - Agilité (Entraîné/Adepte/Maître)
    - Force (Entraîné/Adepte/Maître)
    - Létalité (Entraîné/Adepte/Maître)
- Ruse (0–4)
    - Attention (Entraîné/Adepte/Maître)
    - Ruse (Entraîné/Adepte/Maître)
    - Intuition (Entraîné/Adepte/Maître)
- Manières (0–4)
    - Représentation (Entraîné/Adepte/Maître)
    - Persuasion (Entraîné/Adepte/Maître)
    - Bienséance (Entraîné/Adepte/Maître)
- Sang-froid (0–4)
    - Contrainte (Entraîné/Adepte/Maître)
    - Direction (Entraîné/Adepte/Maître)
    - Endurance (Entraîné/Adepte/Maître)

**Dangers (0–8 with checkbox track)**

For each danger: level 0–8 + a visual track of **2 to 4 checkboxes**.

- Déshonneur
- Scandale
- Stress
- Blessures

**Devotions (global constraint)**

- Total of all devotion ranks across Duties + Desires must be **≤ 10**.
- Duties (0–5)
    - Up to **5** entries. Each entry has:
        - Rang (1–5)
        - Description (texte)
        - Cases cochables (count = current rank)
        - Renoncé ? (checkbox)
- Desires (0–5)
    - Up to **5** entries. Each entry has:
        - Rang (1–5)
        - Description (texte)
        - Cases cochables (count = current rank)
        - Renoncé ? (checkbox)

**Areas of Expertise**

- Max **10** entries.
- Each entry is a text label + rank select:
    - **Expertise occasionnelle** / **Expertise vétéran** / **Expertise ésotérique**

**Free text sections**

- Relations (texte long)
- Liens (texte long)
- Traits (texte long)
- Capacités (texte long)

**Carried Resources**

- Max **6** entries. Each entry has:
    - Nom (texte)
    - Utilisations restantes (ex: 3)
    - Fonction / description (texte)

**Equipment**

- Free list (multi-line text or bullet list UI)

---

### 8. Constraints and Non-Functional Requirements

| Category | Requirement |
| --- | --- |
| **Authentication** | Email and password. Password policy: minimum 12 characters. Email verification after sign-up. Password reset flow and screen (“Forgot password”). |
| **Platforms** | Web app only (accessible from smartphone or tablet). |
| **Language** | UI text in French. Code and prompt/spec text in English. |
| **Images** | Auto-compress on upload. Maximum 20 photos per character. |
| **Auto-save** | If a player disconnects abruptly (for example, due to connectivity issues), the game must be saved at any time. |
| **Performance** | Must support long chat sessions (several sessions of around 2 hours). |
| **Sync & Backend** | v1 wireframe: simulate sync using UI states only. No backend implementation. Expected sync states: synced / pending / failed. |

---

### 8. Deliverables — Phase 1

**Wireframe v1 is a front-end prototype only (HTML/CSS ) :** no real backend, no real database, no real authentication, no real LLM calls, no real dice API calls. One file per screen, navigation via links between screens.

Simulate dynamic behavior with **UI states** and minimal JavaScript if necessary.

- Provide one HTML file per screen, linked navigation:
    - `login.html`
    - `chat.html`
    - `library.html`
    - `character.html`
- Provide:
    - `styles.css`
    - Optional `app.js` for UI-state simulation (load more, dice animation, dice parsing, status states)

**Screens to include:**

| # | Screen | Key elements |
| --- | --- | --- |
| 1 | **Login** | Email and password fields. “Sign up” link. Error states: login failed (message + retry + “Forgot password”). |
| 2 | **Chat** | Chat input, AI GM responses, avatar display, and dice roll UI/animation. |
| 3 | **Character** | Character sheet UI based on section “7. Character sheet”. Editable fields + repeating lists (Devotions, Expertise, Resources). Simulated save/sync states. |
| 4 | **Library** | Upload and browse game rules, GM tone directives, campaign story, and lore documents. |
- Character screen must implement the character sheet fields defined in section “7. Character sheet”. No additional fields beyond that spec.
- Upload is simulated:
    - User selects a file, then the UI shows a **fake file card** (title, “PDF” badge, date, and an “Open” action).
    - No real file reading is required.

**Visual style:**

- Regency-era inspired UI, readable typography, and a JRPG-style avatar/chat layout.

### 9. Hard rules

- The **code must be in English**.
- The **application UI text must be in French** (all labels, buttons, error messages, placeholders).
- Simulate dynamic behavior with **UI states** and minimal JavaScript if necessary.