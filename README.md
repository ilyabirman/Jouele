# Jouele
Jouele is a simple and beautiful audio player for the web. 

[Project page](http://ilyabirman.net/projects/jouele/)

[Russian translation of the documentation](https://github.com/ilyabirman/Jouele/blob/master/README-ru.md)

## Famous 2-steps Setup
```html
<!-- Include dependencies that are mandatory for Jouele: jQuery and jPlayer -->
<script src="http://code.jquery.com/jquery-1.11.3.min.js"></script>
<script src="dist/jquery.jplayer.min.js"></script>

<!-- Include Jouele -->
<script src="dist/jouele.js"></script>
<link href="dist/jouele.css" rel="stylesheet"/>
```

## Basic Usage
Each link with `jouele` class automatically becomes a player for the linked MP3. For example:
```html
<a href="http://audio.ilyabirman.ru/Ilya%20Birman%20-%20News.mp3" class="jouele">Ilya Birman: News</a>
```
Check [`dist/example.html`](example.html) to see more examples of usage.

## Advanced Features

### data-attributes
Adding some data-attributes changes the behavior or appearance of the player.

#### `data-length`
Type: `String`  
Default value: `0`

Shows the total length of the track, so that it is displayed immediately without pressing the "play" button.
Examples for track of 2 minutes 47 seconds length: `data-length="2:47"`, `data-length="167"`

#### `data-pause-on-space`
Type: `Boolean`  
Default value: `true`

Specifies whether to stop playback by pressing the spacebar.

#### `data-play-on-space`
Type: `Boolean`  
Default value: `true`

Specifies whether to resume playback by pressing the spacebar after the track was stopped. 

#### `data-scroll-on-space`
Type: `Boolean`  
Default value: `true`

Specifies whether to scroll the page after pressing the spacebar which stops/resumes the playback. Works only if the `data-pause-on-space` corresponding to the action (pause/resume) is set to `true`.

#### `data-hide-timeline-on-pause`
Type: `Boolean`  
Default value: `false`

Specifies whether to hide timeline of the track, when track is not playing.

### Skin
Adding `jouele-skin-dark` class to the link initialized by Jouele changes to predefined "dark" theme. For example:
```html
<a href="http://audio.ilyabirman.ru/Ilya%20Birman%20-%20News.mp3" class="jouele jouele-skin-dark">Ilya Birman: News</a>
```

A developer can create a custom theme having examined the CSS-file [`jouele.skin.css`](dist/jouele.skin.css).
Follow these steps to install a new theme:
- In [`jouele.skin.css`](dist/jouele.skin.css) change all `jouele-skin-dark` selectors to the new name following the pattern `jouele-skin-{skin_name}` (for example, `jouele-skin-blue`).
- Change colors with your preferred ones.
- Add `jouele-skin-{skin_name}`class to the link initialized by Jouele.
- Link the changed [`jouele.skin.css`](dist/jouele.skin.css) file to the page after [`jouele.css`](dist/jouele.css).

## Dynamic Initialization

#### `$(selector).jouele()`
Turns `selector` link into a player. Returns a jQuery-object modified by `$(selector)` method. If everything is correct, this jQuery-object `$(selector)` gets a `data` attribute with an additional `jouele` property, which  contains an instance of `Jouele` player (the entire API works with this instance, see below). `selector` DOM-element is excluded from DOM using jQuery.detach() method.
The player block is added to DOM instead of excluded element and also has an instance of `Jouele` player in its `data.jouele`.

## Global Object `$.Jouele`
The object contains 3 properties:

#### `$.Jouele.playlist`
Type: `array`  
Default value: `[]`

Array containing all instances of `Jouele` player on the page arranged in order of their position in DOM. Empty if there is no active instance on the page.

#### `$.Jouele.lastPlayed`
Type: `Jouele`  
Default value: `null`

Link to the last played or now playing instance of `Jouele` player.
`null` if nothing has been played yet or if the last played track has been destroyed with `destroy` method.

#### `$.Jouele.$jPlayer`
Type: `Jouele`  
Default value: `null`

jQuery-object with jPlayer instance binded.
`null`, if none of `Jouele` player instances has been initialized or if jPlayer is unavailable.

## API
Recommended way to access API:
```javascript
var JoueleInstance = $(".jouele").data("jouele") // Get an instance of Jouele
```

### API Methods

#### `JoueleInstance.play()` or `$(".jouele").jouele("play")`
Starts the playback. Returns an instance of `Jouele` player. 

#### `JoueleInstance.pause()` or `$(".jouele").jouele("pause")`
Pauses the playback. Returns an instance of `Jouele` player. 

#### `JoueleInstance.destroy()` or `$(".jouele").jouele("destroy")`
Destroys the player, then adds back to the DOM the link, which has created the player. Returns the jQuery-object of the link. 

### API Properties

#### `JoueleInstance.$link`
Type: `jQuery-object`

Stores jQuery-object of the link from which the player was created.

#### `JoueleInstance.isPlaying`
Type: `boolean`

Indicates whether the track is currently playing. 

#### `JoueleInstance.isPlayed`
Type: `boolean`

Indicates whether the track has been played.

#### `JoueleInstance.totalTime`
Type: `number`

Stores the track length in seconds. Can be a floating-point number.

## Credits
- Idea and development — [Ilya Birman](http://ilyabirman.ru)
- Development — [Eugene Lazarev](http://eugene-lazarev.ru)
- Documentation translation - Alexandra Godun

## License
[MIT License](LICENSE.md)
