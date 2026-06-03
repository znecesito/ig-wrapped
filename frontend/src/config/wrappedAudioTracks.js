/** Static playlist for Wrapped (Phase I). Files live in `frontend/public/audio/`. */

export const WRAPPED_AUDIO_BASE = "/audio";

/** Filenames you drop into `public/audio/` — see `public/audio/README.md`. */
export const WRAPPED_AUDIO_FILENAMES = [
  "track-01.mp3",
  "track-02.mp3",
  "track-03.mp3",
  "track-04.mp3",
  "track-05.mp3"
];

export const WRAPPED_AUDIO_TRACKS = WRAPPED_AUDIO_FILENAMES.map(
  (name) => `${WRAPPED_AUDIO_BASE}/${name}`
);
