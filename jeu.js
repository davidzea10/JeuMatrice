/**
 * Jeu Matrice - Déplacement diagonal
 * Règles : G-H (i-1,j-1), G-B (i+1,j-1), D-H (i-1,j+1), D-B (i+1,j+1)
 * Grille m×n = 6×6. Déplacement uniquement en diagonale.
 */

const zoneJeu = document.getElementById('zone-jeu');
const ecranAccueil = document.getElementById('ecran-accueil');
const valeurIJ = document.getElementById('valeur-ij');
const affichagePosition = document.getElementById('affichage-position');
const messageDeborde = document.getElementById('message-deborde');
const ctx = zoneJeu.getContext('2d');

// Matrice m×n (6×6)
const M = 6;
const N = 6;

// Position actuelle de la pièce (i, j). i = ligne (0 en haut), j = colonne (0 à gauche)
let i = 3;
let j = 3;

let enCours = false;
let largeurCellule = 0;
let hauteurCellule = 0;
let deborde = false; // true quand un déplacement a échoué (hors limites)

// Dimensions du canvas : toujours carré pour que les cases restent carrées
function redimensionnerCanvas() {
  const zoneGrille = document.getElementById('zone-grille');
  const rect = zoneGrille && zoneGrille.offsetParent !== null ? zoneGrille.getBoundingClientRect() : zoneJeu.getBoundingClientRect();
  const cote = Math.min(rect.width, rect.height) || 300;
  zoneJeu.width = cote;
  zoneJeu.height = cote;
  largeurCellule = cote / N;
  hauteurCellule = cote / M;
  if (enCours) dessiner();
}

// Déplacements diagonaux (retourne true si le déplacement a été fait)
// G-H : Gauche-Haut  → i-1, j-1
// G-B : Gauche-Bas   → i+1, j-1
// D-H : Droite-Haut  → i-1, j+1
// D-B : Droite-Bas   → i+1, j+1
function deplacerDiagonal(direction) {
  let ni = i;
  let nj = j;
  switch (direction) {
    case 'gh':
      ni = i - 1;
      nj = j - 1;
      break;
    case 'gb':
      ni = i + 1;
      nj = j - 1;
      break;
    case 'dh':
      ni = i - 1;
      nj = j + 1;
      break;
    case 'db':
      ni = i + 1;
      nj = j + 1;
      break;
    default:
      return false;
  }
  if (ni < 0 || ni >= M || nj < 0 || nj >= N) {
    signalerDebordement();
    return false;
  }
  deborde = false;
  affichagePosition.classList.remove('deborde');
  messageDeborde.textContent = '';
  i = ni;
  j = nj;
  valeurIJ.textContent = `(${i}, ${j})`;
  dessiner();
  return true;
}

function signalerDebordement() {
  deborde = true;
  affichagePosition.classList.add('deborde');
  messageDeborde.textContent = 'Hors limites !';
  dessiner();
  clearTimeout(signalerDebordement._timeout);
  signalerDebordement._timeout = setTimeout(() => {
    deborde = false;
    affichagePosition.classList.remove('deborde');
    messageDeborde.textContent = '';
    dessiner();
  }, 600);
}

function dessiner() {
  const w = zoneJeu.width;
  const h = zoneJeu.height;
  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(0, 0, w, h);

  // Grille
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  for (let c = 0; c <= N; c++) {
    ctx.beginPath();
    ctx.moveTo(c * largeurCellule, 0);
    ctx.lineTo(c * largeurCellule, h);
    ctx.stroke();
  }
  for (let r = 0; r <= M; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * hauteurCellule);
    ctx.lineTo(w, r * hauteurCellule);
    ctx.stroke();
  }

  // Pièce (cercle au centre de la case (i, j)) — rouge si débordement
  const cx = j * largeurCellule + largeurCellule / 2;
  const cy = i * hauteurCellule + hauteurCellule / 2;
  const rayon = Math.min(largeurCellule, hauteurCellule) * 0.32;
  if (deborde) {
    ctx.fillStyle = '#ff6b6b';
    ctx.strokeStyle = '#cc4444';
  } else {
    ctx.fillStyle = '#00d4ff';
    ctx.strokeStyle = '#0099cc';
  }
  ctx.beginPath();
  ctx.arc(cx, cy, rayon, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.stroke();
}

function demarrerPartie() {
  enCours = true;
  deborde = false;
  affichagePosition.classList.remove('deborde');
  messageDeborde.textContent = '';
  i = 3;
  j = 3;
  valeurIJ.textContent = `(${i}, ${j})`;
  ecranAccueil.classList.add('cache');
  document.getElementById('zone-grille').classList.remove('cache');
  document.getElementById('interface-jeu').classList.remove('cache');
  document.getElementById('boutons-deplacement').classList.remove('cache');
  setTimeout(redimensionnerCanvas, 0);
}

// Boutons ordinateur
document.getElementById('btn-gh').addEventListener('click', () => deplacerDiagonal('gh'));
document.getElementById('btn-gb').addEventListener('click', () => deplacerDiagonal('gb'));
document.getElementById('btn-dh').addEventListener('click', () => deplacerDiagonal('dh'));
document.getElementById('btn-db').addEventListener('click', () => deplacerDiagonal('db'));

document.getElementById('bouton-jouer').addEventListener('click', demarrerPartie);

// Tactile : swipe diagonal sur la grille
const SEUIL_SWIPE = 35;
let touchStartX = 0;
let touchStartY = 0;

zoneJeu.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (e.touches.length > 0) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
}, { passive: false });

zoneJeu.addEventListener('touchend', (e) => {
  e.preventDefault();
  if (!enCours || !e.changedTouches || e.changedTouches.length === 0) return;
  const endX = e.changedTouches[0].clientX;
  const endY = e.changedTouches[0].clientY;
  const deltaX = endX - touchStartX;
  const deltaY = endY - touchStartY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  if (absX < SEUIL_SWIPE || absY < SEUIL_SWIPE) return;
  if (absX < absY * 0.5 || absY < absX * 0.5) return;
  if (deltaX < 0 && deltaY < 0) deplacerDiagonal('gh');
  else if (deltaX > 0 && deltaY < 0) deplacerDiagonal('dh');
  else if (deltaX < 0 && deltaY > 0) deplacerDiagonal('gb');
  else if (deltaX > 0 && deltaY > 0) deplacerDiagonal('db');
}, { passive: false });

window.addEventListener('resize', redimensionnerCanvas);
redimensionnerCanvas();
