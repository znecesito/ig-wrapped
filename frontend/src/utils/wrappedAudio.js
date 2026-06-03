import { WRAPPED_AUDIO_TRACKS } from "../config/wrappedAudioTracks.js";

const DEFAULT_VOLUME = 0.65;
const MUTE_STORAGE_KEY = "ig-wrapped-audio-muted";

let audio = null;
let playlist = [];
let playlistIndex = 0;
let muted = false;
let holdPaused = false;
let active = false;

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readStoredMutePreference() {
  try {
    const raw = localStorage.getItem(MUTE_STORAGE_KEY);
    if (raw === "1") {
      return true;
    }
    if (raw === "0") {
      return false;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeStoredMutePreference(value) {
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, value ? "1" : "0");
  } catch {
    /* ignore */
  }
}

/** Fisher–Yates shuffle (mutates copy). */
export function shuffleTracks(tracks) {
  const arr = [...tracks];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getAudioElement() {
  if (!audio) {
    audio = new Audio();
    audio.preload = "auto";
    audio.addEventListener("ended", () => {
      if (!active || !playlist.length) {
        return;
      }
      playlistIndex += 1;
      if (playlistIndex >= playlist.length) {
        playlist = shuffleTracks(playlist);
        playlistIndex = 0;
      }
      playCurrentTrack();
    });
    audio.addEventListener("error", () => {
      if (!active || !playlist.length) {
        return;
      }
      playlistIndex += 1;
      if (playlistIndex < playlist.length) {
        playCurrentTrack();
      }
    });
  }
  return audio;
}

function playCurrentTrack() {
  const el = getAudioElement();
  if (!active || !playlist.length) {
    return;
  }

  const src = playlist[playlistIndex];
  const absolute = new URL(src, window.location.origin).href;
  if (el.src !== absolute) {
    el.src = src;
    el.load();
  }

  el.muted = muted;
  el.volume = DEFAULT_VOLUME;

  if (muted || holdPaused) {
    return;
  }

  const playPromise = el.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {});
  }
}

/**
 * Start shuffled playlist — call synchronously from Start Wrapped click (user gesture).
 */
export function startWrappedPlaylist(trackUrls = WRAPPED_AUDIO_TRACKS) {
  const tracks = trackUrls.filter(Boolean);
  if (!tracks.length) {
    return false;
  }

  const stored = readStoredMutePreference();
  muted = stored ?? prefersReducedMotion();
  holdPaused = false;
  active = true;
  playlist = shuffleTracks(tracks);
  playlistIndex = 0;

  playCurrentTrack();
  return true;
}

export function stopWrappedPlaylist() {
  active = false;
  holdPaused = false;
  playlist = [];
  playlistIndex = 0;

  if (audio) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  }
}

export function isWrappedPlaylistActive() {
  return active;
}

export function isWrappedAudioMuted() {
  return muted;
}

export function setWrappedAudioMuted(value) {
  muted = Boolean(value);
  writeStoredMutePreference(muted);
  if (audio) {
    audio.muted = muted;
  }
  if (!muted && active && !holdPaused) {
    playCurrentTrack();
  } else if (muted && audio) {
    audio.pause();
  }
}

export function toggleWrappedAudioMuted() {
  setWrappedAudioMuted(!muted);
  return muted;
}

/** Hold-to-pause: pauses music with GSAP (does not change mute preference). */
export function pauseWrappedAudioForHold() {
  holdPaused = true;
  audio?.pause();
}

export function resumeWrappedAudioFromHold() {
  holdPaused = false;
  if (active && !muted) {
    playCurrentTrack();
  }
}
