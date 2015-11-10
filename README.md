# Jouele
Jouele is a simple and beautiful audio player for the web. 

[Project page](http://ilyabirman.ru/projects/jouele/)

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
Each link with jouele class automatically becomes a player for the linked MP3. For example:
```html
<a href="http://audio.ilyabirman.ru/Ilya%20Birman%20-%20News.mp3" class="jouele">Ilya Birman: News</a>
```
Check `jouele.html` to see more examples of usage.

## Advanced features

### data-attributes
Adding some data-attributes to change the behavior or appearance of the player.

#### `data-length (String)`
Specifies the total length of the track, so that it occurs immediately without pressing the "play" button.
Examples for track of 2 minutes 47 seconds length: `data-length="2:47"`, `data-length="167"`

#### `data-pause-on-space (Boolean)`
Specifies whether to stop the track by pressing the space bar. Default parameter is `true`.

#### `data-scroll-on-space (Boolean)`
Specifies whether to scroll the page after pressing the space bar and pausing the playing track. Works only if the `data-pause-on-space` is set to `true`. Default parameter is `false`.

#### `data-hide-timeline-on-pause (Boolean)`
Specifies whether to hide timeline of the track, when it is not playing. Default parameter is `false`.

### Skin
Adding `jouele-skin-dark` class to the link initialized by Jouele changes to predefined "dark" skin. For example:
```html
<a href="http://audio.ilyabirman.ru/Ilya%20Birman%20-%20News.mp3" class="jouele jouele-skin-dark">Ilya Birman: News</a>
```

A developer can create a custom skin having examined the CSS-file `jouele.skin.css`.
To install a new skin you need to do the following steps:
- In `jouele.skin.css` change all `jouele-skin-dark` selectors to the new name following the pattern `jouele-skin-` (for example, `jouele-skin-blue`).
- Add to the link initialized by Jouele `jouele-skin-{skin_name}`class.
- Link the changed `jouele.skin.css` file to the page after `jouele.css`. 

## Dynamic initialization

#### `$(selector).jouele()`
Turns `selector` link into a player. Returns a jQuery-object modified by `$(selector)` method. If everything goes right, this `$(selector)` gets an additional `data` with `jouele` name, which  contains an instance of `Jouele` player (the entire API works with this instance, see below). `selector` DOM-object is excluded from DOM using jQuery.detach().
The player block added to DOM with `jouele` class and unique id also has an instance of `Jouele` player in its `data.jouele`.

## API
The easiest way to access API:
```javascript
$(".jouele").data("jouele") // Get an instance of Jouele
```

### API Methods

#### `Jouele.play()`
Starts playing the track. Returns an instance of`Jouelle` player. 

#### `Jouele.pause()`
Pauses the track. Returns an instance of`Jouelle` player. 

#### `Jouele.destroy()`
Destroys the player by returning the link from which it was created to the DOM-tree. Returns a jQuery-object of the link. 

### API Properties

#### `Jouele.$link (jQuery object)`
Stores jQuery-object from which the player was created.

#### `Jouele.isPlaying (Boolean)`
Shows wherther the track is playing. 

#### `Jouele.isPlayed (Boolean)`
Shows wherther the track was played.

#### `Jouele.totalTime (Number)`
Stores the track length in seconds. May be float.

## Credits
- Idea and development — [Ilya Birman](http://ilyabirman.ru)
- Development — [Eugene Lazarev](http://www.eugene-lazarev.ru)

## License
MIT License




# Жуэль
Жуэль — простой и красивый плеер для веба.

[Страница проекта](http://ilyabirman.ru/projects/jouele/)

## Как установить
```html
<!-- Dependencies -->
<script src="http://code.jquery.com/jquery-1.11.3.min.js"></script>
<script src="dist/jquery.jplayer.min.js"></script>
<!-- Jouele -->
<script src="dist/jouele.js"></script>
<link href="dist/jouele.css" rel="stylesheet"/>
```

## Как использовать
Каждая ссылка с классом jouele превратится в плеер МП3-файла, на который она ведёт. Например:
```html
<a href="http://audio.ilyabirman.ru/Ilya%20Birman%20-%20News.mp3" class="jouele">Ilya Birman: News</a>
```
Обратитесь к файлу `jouele.html`, чтобы увидеть дополнительные примеры использования.

## Расширенные возможности

### data-атрибуты
Добавление некоторых data-атрибутов изменит поведение или внешний вид плеера.

#### `data-length (String)`
Указывает общую продолжительность трека, чтобы время показывалось сразу, а не после нажатия кнопки «плей».
Примеры для трека длительностью 2 минуты 47 секунд: `data-length="2:47"`, `data-length="167"`

#### `data-pause-on-space (Boolean)`
Определяет, нужно ли останавливать этот трек по нажатию пробела. По умолчанию `true`.

#### `data-scroll-on-space (Boolean)`
Определяет, нужно ли проскроллить страницу после нажатия пробела и остановки играющего трека. Работает только если `data-pause-on-space` установлен в `true`. По умолчанию `false`.

#### `data-hide-timeline-on-pause (Boolean)`
Определяет, нужно ли скрывать таймлайн трека, когда он не играет. По умолчанию `false`.

### Скин
Добавление класса `jouele-skin-dark` к ссылке, которая будет инициализирована Жуэлем, включает предустановленный «тёмный» скин. Например:
```html
<a href="http://audio.ilyabirman.ru/Ilya%20Birman%20-%20News.mp3" class="jouele jouele-skin-dark">Ilya Birman: News</a>
```

Разработчик может создать собственный скин, изучив CSS-файл `jouele.skin.css`.
Для подключения нового скина нужно следующее:
- Заменить в `jouele.skin.css` все селекторы `jouele-skin-dark` на новое название, сохранив паттерн `jouele-skin-` (например, `jouele-skin-blue`).
- Добавить в ссылку, которая будет инициализирована Жуэлем, класс `jouele-skin-{название_скина}`.
- Подключить на сайт исправленный файл `jouele.skin.css` после `jouele.css`.

## Динамическая инициализация

#### `$(selector).jouele()`
Превращает ссылку `selector` в плеер. Возвращает jQuery-объект, к которому применялся метод — `$(selector)`.
Если всё прошло хорошо, то в этот же jQuery-объект `$(selector)` добавится дополнительная `data` с именем `jouele`, в которой будет лежать экземпляр плеера `Jouele` (с этим экземпляром и работает весь API, см. ниже). DOM-объект `selector` будет исключен из DOM при помощи jQuery.detach().
Добавленный в DOM блок плеера с классом `jouele` и уникальным id будет также иметь в своём `data.jouele` экземпляр плеера `Jouele`.

## API
Самый простой способ обратиться к API:
```javascript
$(".jouele").data("jouele") // Получить экземпляр Jouele
```

### Методы API

#### `Jouele.play()`
Начинает воспроизведение трека. Возвращает экземпляр плеера `Jouele`.

#### `Jouele.pause()`
Останавливает воспроизведение трека. Возвращает экземпляр плеера `Jouele`.

#### `Jouele.destroy()`
Уничтожает плеер, возвращая в DOM-дерево ссылку, из которой он был создан. Возвращает jQuery-объект ссылки.

### Свойства API

#### `Jouele.$link (jQuery object)`
Хранит jQuery-объект, из которого был создан плеер.

#### `Jouele.isPlaying (Boolean)`
Указывает, играет ли сейчас этот трек.

#### `Jouele.isPlayed (Boolean)`
Указывает, запускался ли этот трек.

#### `Jouele.totalTime (Number)`
Хранит длительность трека в виде количества секунд. Может быть дробным.

## Титры
- Идея и разработка — [Илья Бирман](http://ilyabirman.ru)
- Разработка — [Евгений Лазарев](http://www.eugene-lazarev.ru)

## Лицензия
MIT License


