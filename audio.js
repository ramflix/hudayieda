/**
 * audio.js — Beyaz Gül · Eda
 * Otomatik Müzik Çalma ve Ses Kontrol Motoru
 */

const audio = document.getElementById('bg-audio') || new Audio('ssstik.io_1783192375298.mp3');
audio.loop = true;
audio.volume = 0;

let isPlaying = false;
let fadeInterval = null;

const btn = document.getElementById('audio-btn');

/* ── Ses Seviyesi Geçişi (Fade In / Fade Out) ───────────── */
function fadeVolume(from, to, duration, onDone) {
  if (fadeInterval) clearInterval(fadeInterval);
  const steps = 30;
  const stepTime = duration / steps;
  const diff = (to - from) / steps;
  let cur = from;
  let count = 0;
  audio.volume = Math.max(0, Math.min(1, from));

  fadeInterval = setInterval(() => {
    cur += diff;
    audio.volume = Math.max(0, Math.min(1, cur));
    if (++count >= steps) {
      clearInterval(fadeInterval);
      fadeInterval = null;
      audio.volume = Math.max(0, Math.min(1, to));
      if (onDone) onDone();
    }
  }, stepTime);
}

/* ── Müziği Başlat ─────────────────────────────────────── */
function playAudio() {
  if (isPlaying) return;

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        isPlaying = true;
        if (btn) btn.classList.add('playing');
        fadeVolume(audio.volume, 0.75, 1200);
        removeInteractionListeners();
      })
      .catch(() => {
        // Tarayıcı otomatik çalmayı kısıtladıysa (autoplay ilkesi),
        // ilk kullanıcı hareketinde (kaydırma, dokunma, tıklama) başlayacak.
      });
  }
}

/* ── Müziği Durdur ─────────────────────────────────────── */
function pauseAudio() {
  fadeVolume(audio.volume, 0, 800, () => {
    audio.pause();
    isPlaying = false;
    if (btn) btn.classList.remove('playing');
  });
}

/* ── Aç / Kapa Buton Kontrolü ─────────────────────────── */
function toggleAudio() {
  if (isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
}

if (btn) {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAudio();
  });
}

/* ── Otomatik Oynatma Tetikleyicileri ─────────────────── */
// 1. Sayfa açılır açılmaz doğrudan oynatmayı dene
playAudio();
document.addEventListener('DOMContentLoaded', playAudio);
window.addEventListener('load', playAudio);

// 2. Tarayıcı engellerse ekrandaki İLK harekette (tıklama, kaydırma, dokunma) çal
const interactionEvents = ['click', 'pointerdown', 'touchstart', 'touchend', 'keydown', 'wheel', 'scroll'];

function handleFirstInteraction() {
  if (!isPlaying) {
    playAudio();
  }
}

function removeInteractionListeners() {
  interactionEvents.forEach((ev) => {
    window.removeEventListener(ev, handleFirstInteraction, true);
    document.removeEventListener(ev, handleFirstInteraction, true);
  });
}

interactionEvents.forEach((ev) => {
  window.addEventListener(ev, handleFirstInteraction, { capture: true, passive: true });
  document.addEventListener(ev, handleFirstInteraction, { capture: true, passive: true });
});

/* Eski uyumluluk */
window.pianoEngine = {
  toggle: toggleAudio,
  init: async () => true,
  hasFile: true
};
