# Album cover art (Wrapped mini player)

Drop **square** images here for the bottom-right music player (CodePen-style cover).

## Filenames (match each track)

| Cover file | Audio track |
|------------|-------------|
| `track-01.jpg` | `../track-01.mp3` |
| `track-02.jpg` | `../track-02.mp3` |
| `track-03.jpg` | `../track-03.mp3` |
| `track-04.jpg` | `../track-04.mp3` |
| `track-05.jpg` | `../track-05.mp3` |
| `track-06.jpg` | `../track-06.mp3` |
| `track-07.jpg` | `../track-07.mp3` |
| `default.jpg` | Fallback if a cover is missing |

`.png` or `.webp` also work if you update paths in `frontend/src/config/wrappedAudioTracks.js`.

## Tips

- **500×500** or **600×600** px is enough; crop square from album art or a still that fits the track vibe.
- JPG ~80% quality keeps the repo lean.
- Pixabay track pages often include cover-style artwork in the download or preview.

Served at: `/audio/covers/track-01.jpg`, etc.
