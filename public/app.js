/* ══════════════════════════════════════════════════════════════
   app.js — Temeraire: Le JDR
   Shared JavaScript utilities.
   Code in English. UI text in French.
   ══════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────
   1. DICE PARSING
   Supports: NdX, NdX+K, NdX-K
   e.g. 1d20, 2d6+3, 1d8-1, /roll 1d20+2
   ────────────────────────────────────────────── */

/**
 * Parse and evaluate a dice command string.
 * @param {string} cmd  Raw command, e.g. "/roll 2d6+3" or "1d20"
 * @returns {{ valid: boolean, error?: string, n?: number, x?: number, mod?: number,
*             rolls?: number[], sum?: number, total?: number,
*             label?: string, breakdown?: string }}
*/
function parseDiceCommand(cmd) {
 const clean = cmd.replace(/\s+/g, '').toLowerCase();

 // Accept both "/roll NdX±K" and "NdX±K"
 const match = clean.match(/^(?:\/roll)?(\d+)d(\d+)([+-]\d+)?$/);

 if (!match) {
   return {
     valid: false,
     error: 'Commande invalide. Exemples valides : /roll 1d20, /roll 2d6+3, 1d8-1',
   };
 }

 const n   = parseInt(match[1], 10);
 const x   = parseInt(match[2], 10);
 const mod = match[3] ? parseInt(match[3], 10) : 0;

 if (n < 1 || n > 20) {
   return { valid: false, error: 'Nombre de dés invalide. Choisissez entre 1 et 20 dés.' };
 }
 if (x < 2 || x > 100) {
   return { valid: false, error: 'Type de dé invalide. Les faces doivent être entre 2 et 100.' };
 }

 const rolls = [];
 for (let i = 0; i < n; i++) {
   rolls.push(Math.floor(Math.random() * x) + 1);
 }

 const sum   = rolls.reduce((a, b) => a + b, 0);
 const total = sum + mod;
 const modStr    = mod > 0 ? `+${mod}` : mod < 0 ? `${mod}` : '';
 const label     = `${n}d${x}${modStr}`;
 const breakdown = `[${rolls.join(', ')}]${modStr}`;

 return { valid: true, n, x, mod, rolls, sum, total, label, breakdown };
}


/* ──────────────────────────────────────────────
  2. DICE ANIMATION
  Show a short animation overlay, then resolve.
  ────────────────────────────────────────────── */

/**
* Run the dice roll animation and return a Promise
* that resolves after the animation completes.
* Requires an overlay element with id "diceOverlay" and
* child die elements with id "die1", "die2", "die3".
*
* @param {{ n: number, x: number, rolls: number[] }} result
* @returns {Promise<void>}
*/
function runDiceAnimationPromise(result) {
 return new Promise((resolve) => {
   const overlay   = document.getElementById('diceOverlay');
   const die1      = document.getElementById('die1');
   const die2      = document.getElementById('die2');
   const die3      = document.getElementById('die3');

   if (!overlay || !die1) { resolve(); return; }

   const dieEls   = [die1, die2, die3];
   const showCount = Math.min(result.n, 3);

   // Configure visible dice
   dieEls.forEach((d, i) => {
     d.style.display = i < showCount ? 'flex' : 'none';
     d.textContent   = '?';
   });

   overlay.classList.add('visible');
   document.body.style.overflow = 'hidden';

   let ticks    = 0;
   const maxTicks = 20;
   const tickMs   = 90;

   const interval = setInterval(() => {
     // Show random values while rolling
     dieEls.forEach((d, i) => {
       if (i < showCount) {
         d.textContent = Math.floor(Math.random() * result.x) + 1;
       }
     });

     ticks++;

     if (ticks >= maxTicks) {
       clearInterval(interval);

       // Land on final values
       result.rolls.slice(0, showCount).forEach((val, i) => {
         dieEls[i].textContent = val;
       });

       // Brief pause, then close overlay
       setTimeout(() => {
         overlay.classList.remove('visible');
         document.body.style.overflow = '';
         resolve();
       }, 600);
     }
   }, tickMs);
 });
}


/* ──────────────────────────────────────────────
  3. SYNC STATE SIMULATION
  Provides a simple debounced sync state manager
  that other modules can use.
  ────────────────────────────────────────────── */

const SyncManager = (() => {
 let _timer = null;

 /**
  * Signal that a change was made; put badge into "pending" state,
  * then automatically transition to "synced" after a delay.
  * @param {HTMLElement} badgeEl  The .sync-badge element to update.
  * @param {number}      [delay=1800]  Milliseconds before marking synced.
  */
 function trigger(badgeEl, delay = 1800) {
   if (!badgeEl) return;
   clearTimeout(_timer);
   badgeEl.className = 'sync-badge pending';
   badgeEl.innerHTML = '<span class="dot"></span>En attente…';

   _timer = setTimeout(() => {
     badgeEl.className = 'sync-badge synced';
     badgeEl.innerHTML = '<span class="dot"></span>Synchronisé';
   }, delay);
 }

 /**
  * Immediately mark badge as failed.
  * @param {HTMLElement} badgeEl
  */
 function fail(badgeEl) {
   if (!badgeEl) return;
   clearTimeout(_timer);
   badgeEl.className = 'sync-badge failed';
   badgeEl.innerHTML = '<span class="dot"></span>Échec de la synchronisation';
 }

 /**
  * Immediately mark badge as synced.
  * @param {HTMLElement} badgeEl
  */
 function synced(badgeEl) {
   if (!badgeEl) return;
   clearTimeout(_timer);
   badgeEl.className = 'sync-badge synced';
   badgeEl.innerHTML = '<span class="dot"></span>Synchronisé';
 }

 return { trigger, fail, synced };
})();


/* ──────────────────────────────────────────────
  4. LOAD MORE HELPER
  Used in chat.html to reveal older messages.
  ────────────────────────────────────────────── */

/**
* Prepend a list of message objects to the message list DOM,
* preserving the user's scroll position.
* This is called from chat.html's inline script.
*
* @param {HTMLElement}   listEl      The scrollable message list container.
* @param {HTMLElement}   btnEl       The "load more" button.
* @param {Function}      renderFn    Function(msg, prepend) that renders one message.
* @param {object[]}      messages    Array of message objects to prepend.
*/
function loadMoreMessages(listEl, btnEl, renderFn, messages) {
 if (!messages || messages.length === 0) {
   if (btnEl) { btnEl.disabled = true; btnEl.textContent = 'Tout est affiché'; }
   return;
 }

 const scrollBefore = listEl.scrollHeight;

 // Prepend in reverse so chronological order is preserved
 [...messages].reverse().forEach(msg => renderFn(msg, true));

 // Restore scroll so user doesn't jump
 listEl.scrollTop = listEl.scrollHeight - scrollBefore;

 if (btnEl) { btnEl.disabled = true; btnEl.textContent = 'Tout est affiché'; }
}


/* ──────────────────────────────────────────────
  5. UTILITY HELPERS
  ────────────────────────────────────────────── */

/**
* Format a Date to HH:MM in French locale.
* @param {Date} date
* @returns {string}
*/
function formatTime(date) {
 return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/**
* Format a Date to a readable French date string.
* @param {Date} date
* @returns {string}
*/
function formatDate(date) {
 return date.toLocaleDateString('fr-FR', {
   day: 'numeric',
   month: 'long',
   year: 'numeric',
 });
}

/**
* Debounce a function call.
* @param {Function} fn
* @param {number}   wait  Milliseconds
* @returns {Function}
*/
function debounce(fn, wait) {
 let t;
 return (...args) => {
   clearTimeout(t);
   t = setTimeout(() => fn(...args), wait);
 };
}


/* ──────────────────────────────────────────────
  6. AUTO-SAVE SIMULATION
  Simulates saving state on page visibility change
  (e.g. user closes or switches tabs).
  ────────────────────────────────────────────── */

document.addEventListener('visibilitychange', () => {
 if (document.visibilityState === 'hidden') {
   // Simulate auto-save: update any visible sync badges to "pending"
   document.querySelectorAll('.sync-badge.pending').forEach(badge => {
     // Already pending — leave as-is; will resolve on return
   });

   // Store a simple timestamp so the UI can show "dernière sauvegarde"
   try {
     sessionStorage.setItem('lastAutoSave', new Date().toISOString());
   } catch (_) { /* storage unavailable */ }
 }
});


/* ──────────────────────────────────────────────
  7. NAVIGATION GUARD
  Redirect to login if no session found.
  Login page itself is exempt.
  ────────────────────────────────────────────── */
(function guardSession() {
 const isLoginPage = window.location.pathname.endsWith('login.html') ||
                     window.location.pathname === '/' ||
                     window.location.pathname === '';
 if (!isLoginPage) {
   const user = sessionStorage.getItem('currentUser');
   if (!user) {
     window.location.href = 'login.html';
   }
 }
})();
