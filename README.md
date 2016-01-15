# Jouele
Jouele is a simple and beautiful audio player for the web.

[Project page](http://ilyabirman.net/projects/jouele/)

[Russian translation of the documentation](https://github.com/ilyabirman/Jouele/blob/master/README-ru.md)

## Setup
```html
<!-- Dependencies -->
<script src="http://code.jquery.com/jquery-1.11.3.min.js"></script>
<script src="dist/jquery.jplayer.min.js"></script>
<!-- Jouele -->
<script src="dist/jouele.js"></script>
<link href="dist/jouele.css" rel="stylesheet"/>
```

## Basic Usage
Each link with `jouele` class automatically becomes a player for the linked MP3. For example:
```html
<a href="http://audio.ilyabirman.ru/Ilya%20Birman%20-%20News.mp3" class="jouele">Ilya Birman: News</a>
```
Check [`jouele.html`](jouele.html) to see more examples of usage.

## Advanced features

### data-attributes
Adding some data-attributes changes the behavior or appearance of the player.

#### `data-length (String)`
Shows the total length of the track, so that it is displayed immediately without pressing the "play" button.
Examples for track of 2 minutes 47 seconds length: `data-length="2:47"`, `data-length="167"`

#### `data-pause-on-space (Boolean)`
Specifies whether to stop playback by pressing the spacebar. Default parameter is `true`.

#### `data-play-on-space (Boolean)`
Specifies whether to resume playback by pressing the spacebar after the track was stopped. Default parameter is `true`.

#### `data-scroll-on-space (Boolean)`
Specifies whether to scroll the page after pressing the spacebar which stops/resumes the playback. Works only if the `data-pause-on-space` corresponding to the action (pause/resume) is set to `true`. Default parameter is `false`.

#### `data-hide-timeline-on-pause (Boolean)`
Specifies whether to hide timeline of the track, when track is not playing. Default parameter is `false`.

### Skin
Adding `jouele-skin-dark` class to the link initialized by Jouele changes to predefined "dark" theme. For example:
```html
<a href="http://audio.ilyabirman.ru/Ilya%20Birman%20-%20News.mp3" class="jouele jouele-skin-dark">Ilya Birman: News</a>
```

A developer can create a custom theme having examined the CSS-file [`jouele.skin.css`](dist/jouele.skin.css).
Follow these steps to install a new theme:
- In [`jouele.skin.css`](dist/jouele.skin.css) change all `jouele-skin-dark` selectors to the new name following the pattern `jouele-skin-{skin_name}` (for example, `jouele-skin-blue`).
- Add `jouele-skin-{skin_name}`class to the link initialized by Jouele.
- Link the changed [`jouele.skin.css`](dist/jouele.skin.css) file to the page after [`jouele.css`](dist/jouele.css).

## Dynamic initialization

#### `$(selector).jouele()`
Turns `selector` link into a player. Returns a jQuery-object modified by `$(selector)` method. If everything is correct, this `$(selector)` gets an additional `data` attribute with `jouele` name, which  contains an instance of `Jouele` player (the entire API works with this instance, see below). `selector` DOM-object is excluded from DOM using jQuery.detach() method.
The player block added to DOM with `jouele` class and unique id also has an instance of `Jouele` player in its `data.jouele`.

## Global Object `$.Jouele`
The object contains 3 properties:

#### `$.Jouele.playlist (Array)`
Array, containing all instances of `Jouele` player on the page, arranged in order of their position in DOM. Empty if there is no active instance on the page.

#### `$.Jouele.lastPlayed (Jouele / null)`
Link to the last played or now playing instance of `Jouele` player.
`null` if nothing has been played yet or if the last played track has been destroyed with `destroy` method.

#### `$.Jouele.$jPlayer (jQuery object / null)`
jQuery-object with jPlayer instance binded.
`null`, if none of `Jouele` player instances was initialized or if jPlayer is unavailable.

## API
Recommended way to access API:
```javascript
$(".jouele").data("jouele") // Get an instance of Jouele
```

### API Methods

#### `Jouele.play()` or `$(".jouele").jouele("play")`
Starts the playback. Returns an instance of `Jouele` player.

#### `Jouele.pause()` or `$(".jouele").jouele("pause")`
Pauses the playback. Returns an instance of `Jouele` player.

#### `Jouele.destroy()` or `$(".jouele").jouele("destroy")`
Destroys the player, then adds back to the DOM the link, which created the player. Returns the jQuery-object of the link.

### API Properties

#### `Jouele.$link (jQuery object)`
Stores jQuery-object of the link from which the player was created.

#### `Jouele.isPlaying (Boolean)`
Indicates whether the track is currently playing.

#### `Jouele.isPlayed (Boolean)`
Indicates whether the track was played.

#### `Jouele.totalTime (Number)`
Stores the track length in seconds. Can be a floating-point number.

## Credits
- Idea and development — [Ilya Birman](http://ilyabirman.ru)
- Development — [Eugene Lazarev](http://eugene-lazarev.ru)
- Documentation translation - [Alexandra Godun]

## License
MIT License
