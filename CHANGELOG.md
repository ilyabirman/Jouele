# Changelog

## 4.0

### Jouele Pro features in Jouele

- Added standalone, track-specific, and global controls.
- Added shared track state, playlists, playback history, and configurable spacebar control.
- Expanded player options, public instance methods, callbacks, and DOM events.
- Updated the bundled Howler version and npm distribution structure.

### Static players

- Added `data-static="true"` to render a player in its untouched initial state without loading audio, creating Howler, joining playlists or history, sharing playback state, or attaching interactive handlers.
- Static players use `data-length` for their displayed duration and can be destroyed and initialized again through the normal Jouele lifecycle API.

### Fixed option updates

- Fixed `setOptions()`, which previously returned before applying any changes.
- An initialized player can now be updated without rebuilding it: applications can change its title or displayed duration, toggle repeat, change its skin and paused-timeline presentation, and update spacebar behavior.
- `href` and static mode remain fixed for the lifetime of an initialized instance so it cannot accidentally switch track identity or runtime type.

### Stability and build fixes

- Fixed a crash when a player was destroyed while a standalone timeline control was seeking.
- Invalid non-string and non-number duration values now fall back safely instead of breaking initialization.
- The Opera compatibility patch is now applied while building the distribution bundle and no longer modifies the installed Howler source in `node_modules`.
- Added automated coverage for static isolation and lifecycle, option updates, invalid durations, shared-track isolation, event-handler absence, and seeking during destruction.
