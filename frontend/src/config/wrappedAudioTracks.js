/** Static playlist for Wrapped (Phase I). Files live in `frontend/public/audio/`. */

export const WRAPPED_AUDIO_BASE = "/audio";
export const WRAPPED_AUDIO_COVERS_BASE = `${WRAPPED_AUDIO_BASE}/covers`;

/** Filenames you drop into `public/audio/` — see `public/audio/README.md`. */
export const WRAPPED_AUDIO_FILENAMES = [
  "track-01.mp3",
  "track-02.mp3",
  "track-03.mp3",
  "track-04.mp3",
  "track-05.mp3",
  "track-06.mp3",
  "track-07.mp3"
];

export const WRAPPED_AUDIO_TRACKS = WRAPPED_AUDIO_FILENAMES.map(
  (name) => `${WRAPPED_AUDIO_BASE}/${name}`
);

/** Display metadata + cover art paths (see `public/audio/covers/`). */
export const WRAPPED_TRACK_METADATA = {
  "track-01.mp3": {
    title: "Viral Energy",
    artist: "FASSounds",
    cover: `${WRAPPED_AUDIO_COVERS_BASE}/track-01.jpg`
  },
  "track-02.mp3": {
    title: "Sun Beneath a Song",
    artist: "Suryanatta",
    cover: `${WRAPPED_AUDIO_COVERS_BASE}/track-02.jpg`
  },
  "track-03.mp3": {
    title: "QUE LA GASOLINA",
    artist: "Watermelon_Beats",
    cover: `${WRAPPED_AUDIO_COVERS_BASE}/track-03.jpg`
  },
  "track-04.mp3": {
    title: "Rap Song - Back in 95",
    artist: "OpenMindAudio",
    cover: `${WRAPPED_AUDIO_COVERS_BASE}/track-04.jpg`
  },
  "track-05.mp3": {
    title: "Love Blues Soul Song - Shine",
    artist: "OpenMindAudio",
    cover: `${WRAPPED_AUDIO_COVERS_BASE}/track-05.jpg`
  },
  "track-06.mp3": {
    title: "Counting On Me",
    artist: "jan2fourth",
    cover: `${WRAPPED_AUDIO_COVERS_BASE}/track-06.jpg`
  },
  "track-07.mp3": {
    title: "Heartbeats in the Rain",
    artist: "hasenchat",
    cover: `${WRAPPED_AUDIO_COVERS_BASE}/track-07.jpg`
  }
};

export function getTrackFilenameFromUrl(trackUrl) {
  if (!trackUrl) {
    return null;
  }
  const parts = trackUrl.split("/");
  return parts[parts.length - 1] || null;
}

export function getTrackMetadata(trackUrl) {
  const filename = getTrackFilenameFromUrl(trackUrl);
  if (!filename) {
    return {
      title: "Wrapped",
      artist: "Soundtrack",
      cover: `${WRAPPED_AUDIO_COVERS_BASE}/default.jpg`
    };
  }
  return (
    WRAPPED_TRACK_METADATA[filename] ?? {
      title: filename.replace(/\.mp3$/i, ""),
      artist: "Instagram Wrapped",
      cover: `${WRAPPED_AUDIO_COVERS_BASE}/${filename.replace(/\.mp3$/i, ".jpg")}`
    }
  );
}
