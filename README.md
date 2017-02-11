# Jouele
Jouele is a simple and beautiful audio player for the web. 

[Project page](http://ilyabirman.net/projects/jouele/)

[Russian translation of the documentation](https://github.com/ilyabirman/Jouele/blob/master/README-ru.md) :ru:

## Famous 2-step Setup
```html
<!-- Include jQuery that are mandatory for Jouele -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>

<!-- Include Jouele: JS and CSS -->
<script src="jouele.js"></script>
<link href="jouele.css" rel="stylesheet"/>
```
<sub>HowlerJS necessary for Jouele is already included into Jouele bundle so you don’t have to include it separately.</sub>

## Basic Usage
### Single track
Each link with `href` attribute and `jouele` class automatically becomes a player for the linked MP3. For example:
```html
<a href="http://audio.ilyabirman.ru/Ilya%20Birman%20-%20News.mp3" class="jouele">Ilya Birman: News</a>
```

### Playlists
Add `jouele-playlist` class to the element, which contains links with `jouele` class, to create a playlist of files corresponding to these link. For example:
```html
<div class="jouele-playlist">
    <p><a href="http://audio.ilyabirman.ru/Ilya%20Birman%20-%20The%20Endgame.mp3" class="jouele">The Endgame</a></p>
    <p><a href="http://audio.ilyabirman.ru/Ilya%20Birman%20-%20Tastes%20Like%20Steel.mp3" class="jouele">Tastes Like Steel</a></p>
    <p><a href="http://audio.ilyabirman.ru/Ilya%20Birman%20-%20Glass.mp3" class="jouele">Glass</a></p>
    <p><a href="http://audio.ilyabirman.ru/Ilya%20Birman%20-%20I%20Will%20Always.mp3" class="jouele">I Will Always</a></p>
</div>
```

Check [`dist/example.html`](dist/example.html) to see more examples of usage.

## Advanced Features

### data-attributes
Adding some data-attributes changes the behavior or appearance of the player (or of the playlist).

#### `data-repeat`
Is applied to the playlist.  
Type: `boolean`  
Default value: `false`

Defines whether to repeat the playback of playlist after the last track is finished.

#### `data-length`
Type: `string`  
Default value: `0`

Shows the total length of the track, so that it is displayed immediately without pressing the "play" button.
Examples for track of 9 minutes 54 seconds length: `data-length="9:54"`, `data-length="954"`

#### `data-space-control`
Type: `boolean`  
Default value: `false`

Specifies globally whether to handle pressing the space bar and to stop/start the playback.
If you turn on this data-attribute at least on one of the playlists or one instance of the player, the setting will apply to all players on the page.

#### `data-hide-timeline-on-pause`
Type: `boolean`  
Default value: `false`

Specifies whether to hide timeline of the track, when track is not playing.

#### `data-first`
Type: `boolean`  

Defines if the track should play first when the spacebar is pressed (works only if `data-space-control` option is on).

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
The object contains 3 properties and one extended object of options:

#### `$.Jouele.playlist`
Type: `array`  
Default value: `[]`

Array containing all playlists on the page arranged in order of their position in DOM. Each playlist contains an array of `Jouele` player instances.
Empty if there is no active instance on the page.

#### `$.Jouele.lastPlayed`
Type: `Jouele`  
Default value: `null`

Link to the last played or now playing instance of `Jouele` player.
`null` if nothing has been played yet or if the last played track has been destroyed with the `destroy` method.

#### `$.Jouele.options`
Type: `object`

Object with a set of properties: `pauseOnSpace` (`false` by default), `playOnSpace` (`false` by default), `scrollOnSpace` (`true` by default).
Manually toggling each of the property globally changes the behaviour of the spacebar to control the playback and scroll.

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

#### `JoueleInstance.$playlist`
Type: `jQuery-object`

Stores link to jQuery-object of the playlist containing the player.

#### `JoueleInstance.playlist`
Type: `array`

Stores link to the element of `$.Jouele.playlist` array — playlist containing the track.

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
- Documentation translation — [Alexandra Godun](https://github.com/misterblblbl)
- [HowlerJS](https://howlerjs.com/)

## License
[MIT License](LICENSE.md)
