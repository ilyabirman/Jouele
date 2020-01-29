# Жуэль
[Жуэль](http://ilyabirman.ru/projects/jouele/) — простой и красивый плеер для веба.

## Простое подключение
```html
<!-- Подключите на страницу jQuery, необходимый для работы Жуэля (должно работать практически с любой версией jQuery) -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>

<!-- Подключите Жуэль: JS и CSS -->
<script src="jouele.min.js"></script>
<link href="jouele.min.css" rel="stylesheet"/>
```
<sub>Минифицированный файл [`jouele.min.js`](dist/jouele.min.js) уже содержит в себе необходимый для работы Жуэля howler.js, так что вам не нужно подключать его отдельно. Если вы используете неминифицированный [`jouele.js`](src/jouele.js), подключите [howler.core.js v2.0.15](https://github.com/goldfire/howler.js/blob/v2.0.15/src/howler.core.js) до Жуэля.  
Если вы хотите подключить неминифицированный файл стилей, подключите [`jouele.css`](src/jouele.css) и [`jouele.skin.css`](src/jouele.skin.css).</sub>

## Простое использование (автоматическая инициализация)
Каждая ссылка с классом `jouele` превратится в плеер МП3-файла, на который она ведёт
```html
<a href="Ilya_Birman_-_News.mp3" class="jouele">Ilya Birman: News</a>
```

Каждый элемент с классом `jouele-control` превратится в контрол МП3-файла: какого-то конкретного (при установке `data-href`) или того, который играет сейчас («глобальный контрол»):
```html
<span class="jouele-control" data-type="play-pause" data-href="Ilya_Birman_-_News.mp3">Play/pause</span>
<span class="jouele-control" data-type="play-pause">Play/pause</span>
```

### Плейлисты, управление пробелом, расцветки, элементы управления
Управляется декларативным АПИ: [https://ilyabirman.ru/projects/jouele/documentation/]

## Расширенные возможности

### Доступно в npm
`npm install ilyabirman-jouele`

### Ручная инициализация
Любая ссылка вида `<a href="song.mp3" class="jouele" id="music-item">` может быть превращена в плеер:
```javascript
$("#music-item").jouele()
```
<sub>Даже для ручной инициализации класс `jouele` должен быть у ссылки.</sub>  

Любой элемент вида `<span class="jouele-control" id="music-control">` может быть превращён в контрол:
```javascript
$("#music-control").jouele()
```
<sub>Даже для ручной инициализации класс `jouele-control` должен быть у элемента.</sub>

### Глобальный объект `$.Jouele`

#### `$.Jouele.tracks`
Тип: `Array`  
Список всех треков (МП3-файлов), инциализированных Жуэлем на странице (к одному треку может быть привязано несколько плееров и/или контролов).
#### `$.Jouele.playlist`
Тип: `Array`  
Массив со всеми плейлистами, созданными из плееров и контролов на странице.
#### `$.Jouele.history`
Тип: `Array`  
История воспроизведения треков. В историю кладутся объекты [JoueleInstance](#jouele-instance-и-api).
#### `$.Jouele.controls`
Тип: `Object`  
Объект со всеми «глобальными» контролами (то есть, теми контролами, у которых не указан `data-href`).
#### `$.Jouele.options`
Тип: `Object`  
Объект с глобальными опциями `pauseOnSpace`, `playOnSpace`, `scrollOnSpace`.  
Можно вручную установить `true` или `false` у каждой опции, чтобы мгновенно изменить [поведение пробела на странице](#для-обработки-нажатия-пробела-на-странице).
#### `$.Jouele.helpers.formatTime(seconds)`
Тип: `Function`  
Возвращает: `String`  
Возвращает строку вида "2:30", полученную из количества секунд (`seconds`, тип `Number`)
#### `$.Jouele.helpers.makeSeconds(time_string)`
Тип: `Function`  
Возвращает: `Number`  
Возвращает число секунд, полученное из строки вида "2:30" (`time_string`, тип `String`).
#### `$.Jouele.version`
Тип: `String`  
Версия Жуэля.

### Опции
Могут быть установлены через data-атрибуты у DOM-элемента, а также (если не указано обратное) через вызов метода setOptions (см. ниже).

#### Для обработки нажатия пробела на странице
Эти опции можно в том числе менять напрямую в [`$.Jouele.options`](#joueleoptions).  
Любую из этих опции достаточно установить на любом одном плейлисте, плеере или контроле, чтобы она подействовала на всю страницу.

#### `scrollOnSpace`
Тип: `Boolean`  
По умолчанию: `true`  
Определяет, будет ли страница вести себя стандартно при нажатии пробела — скроллить контент на один экран вниз.  
По умолчанию Жуэль не изменяет стандартное поведение пробела в браузере. При установке `false` нажатие пробела будет перехвачено Жуэлем, событие будет обработано методом `preventDefault` — страница перестанет скроллиться.

#### `playOnSpace`
Тип: `Boolean`  
По умолчанию: `false`  
Определяет, будет ли Жуэль запускать воспроизведение трека по нажатию пробела.  
При установке `true` нажатие пробела будет перехвачено Жуэлем, и будет воспроизведён первый доступный трек (последний игравший до этого или первый на странице).

#### `pauseOnSpace`
Тип: `Boolean`  
По умолчанию: `false`  
Определяет, будет ли Жуэль останавливать воспроизведение трека по нажатию пробела.  
При установке `true` нажатие пробела будет перехвачено Жуэлем, и воспроизведение играющего трека будет остановлено.

#### `spaceControl`
Тип: `Boolean`  
По умолчанию: `false`  
Короткий вариант для трёх предыдущих опций.  
В случае `spaceControl: false` устанавливаются следующие значения: `scrollOnSpace = true`, `playOnSpace = false`, `pauseOnSpace = false`.  
В случае `spaceControl: true` устанавливаются следующие значения: `scrollOnSpace = false`, `playOnSpace = true`, `pauseOnSpace = true`.

#### Для плееров, контролов и плейлистов

##### `repeat`
Тип: `Boolean`  
Определяет, будет ли плейлист или трек автоматически играть заново после окончания.
```html
<a href="song.mp3" class="jouele" data-repeat="true">
```
```html
<span class="jouele-control" data-href="song.mp3" data-repeat="true">
```
```html
<div class="jouele-playlist" data-repeat="true">
```
```javascript
JoueleInstance.setOptions({ repeat: true })
```

#### Для плееров и плейлистов

##### `skin`
Тип: `String`  
Добавляет к плееру класс вида `jouele-skin-{{skin}}`, где `{{skin}}` — определённое этой опцией имя скина.  
Если добавить скин к плейлисту, все экземпляры плеера внутри плейлиста будут выглядеть так, как если бы у каждого из них был определён такой скин.  
Установка скина имеет смысл только если к странице будет подключен дополнительный CSS со стилями для этого скина. Составить такой CSS можно на основе приложенного [`jouele.skin.css`](src/jouele.skin.css). Скопируйте файл, переименуйте его в `jouele.skin-{{skin}}.css` и все селекторы в нём на `jouele-skin-{{skin}}`, измените цвета на свой вкус, сохраните файл и подключите его после основного CSS-файла Жуэля.
```html
<a href="song.mp3" class="jouele" data-skin="blue">
```
```html
<div class="jouele-playlist" data-skin="blue">
```
```javascript
JoueleInstance.setOptions({ skin: "blue" })
```
Пример CSS для скина `blue`:
```css
.jouele-skin-blue .jouele-progress-line-bar_base:after { background-color: #00f; }
```

#### Для плееров и контролов

##### `length`
Тип: `String` или `Number`  
Продолжительность трека. Может быть строкой вида `"2:30"` (что означает 2 минуты 30 секунд) или числом вида `150` (что означает 150 секунд).  
Имеет смысл в случае, если вы хотите показывать продолжительность трека ещё до того, как он будет загружен.  
Если после загрузки трека окажется, что продолжительность не совпадает с заявленной, значение будет изменено на актуальное.
```html
<a href="song.mp3" class="jouele" data-length="2:30">
```
```html
<span class="jouele-control" data-href="song.mp3" data-length="2:30">
```
```javascript
JoueleInstance.setOptions({ length: 150 })
```

##### `title`
Тип: `String`  
Название трека. Будет отображено во всех контролах типа `"title"`.  
Если у трека есть плеер, то в `title` будет установлено содержимое тега `<a>`, из которого был создан плеер.
```html
<a href="song.mp3" class="jouele">Song</a>
```
```html
<span class="jouele-control" data-href="song.mp3" data-title="Song">
```
```javascript
JoueleInstance.setOptions({ title: "Song" })
```

#### Для плееров

##### `hideTimelineOnPause`
Тип: `Boolean`  
По умолчанию: `false`  
Установка свойства в `true` меняет визуальное поведение плеера — он скрывает таймлайн, если трек не играет. Это обеспечивается добавлением специального класса `jouele_timeline_hide` к DOM-элементу плеера `.jouele`.
```html
<a href="song.mp3" class="jouele" data-hide-timeline-on-pause="true">
```

#### Для контролов

##### `href`
Тип: `String`  
Ссылка на mp3-файл, который будет воспроизводиться Жуэлем. Не может быть установлен через `setOptions`.
```html
<span class="jouele-control" data-href="song.mp3">
```

### `Jouele` instance и API
Экземпляр типа `Jouele` можно получить разными способами. Независимо от способа получения, экземпляр `Jouele` (далее `JoueleInstance`) всегда привязан к одному DOM-элементу (плееру или контролу) и всегда обладает одним и тем же API (за исключением «кастомного API», см. ниже).  
Основные способы получить `JoueleInstance`:
- Получить через `$(element).data("jouele")` у нужного DOM-элемента (плеера или контрола)  
Например:
```javascript
$(".music-tracks").find(".jouele").data("jouele")
```
```javascript
$(".music-controls").find(".jouele-control[data-type='play-pause']").data("jouele")
```
- Взять из [`$.Jouele.playlist`](#joueleplaylist) или [`$.Jouele.history`](#jouelehistory).

#### Основное API

##### `JoueleInstance.play()`
Запускает воспроизведение трека.  
Возвращает `JoueleInstance`.

##### `JoueleInstance.pause()`
Останавливает воспроизведение трека (если трек не загрузился до минимально необходимого для воспроизведения уровня, он продолжит загружаться в фоне).  
Возвращает `JoueleInstance`.

##### `JoueleInstance.playFrom(timestamp)`
Запускает воспроизведение трека с метки `timestamp`, где `timestamp` — строка вида `"2:30"` (что означает 2 минуты 30 секунд) или число вида `150` (что означает 150 секунд).  
Можно использовать, даже если длительность трека неизвестна и/или трек ещё не загружался.  
Возвращает `JoueleInstance`.

##### `JoueleInstance.seek(percent)`
Запускает воспроизведение трека с позиции `percent`, где `percent` — числовое значение в процентах (от 0 до 100).  
Например, `.seek(10)` для трека длительностью 60 секунд запустит воспроизведение с 7-й секунды.  
Можно использовать, даже если длительность трека неизвестна и/или трек ещё не загружался.  
Возвращает `JoueleInstance`.

##### `JoueleInstance.destroy()`
В случае вызова метода на плеере, уничтожает `JoueleInstance`, убирает плеер из плейлиста, уничтожает плеер, ставит на его место ссылку, из которой он был создан. Возвращает DOM-элемент этой ссылки.  
В случае вызова метода на контроле, уничтожает обработчики на контроле, убирает контрол из плейлиста. Возвращает DOM-элемент этого контрола.


#### Дополнительное API

##### `JoueleInstance.getOptions()`
Возвращает: `Object`  
Возвращает объект опций, применённых к этому `JoueleInstance`.

##### `JoueleInstance.setOptions(new_options)`
Устанавливает новые опции через объект `new_options`.  
Подробнее в разделе [Опции](#опции).

##### `JoueleInstance.getHref()`
Возвращает: `String`  
Возвращает URL трека.

##### `JoueleInstance.getTitle()`
Возвращает: `String`  
Возвращает название трека.

##### `JoueleInstance.getTrack()`
Возвращает: `Object`  
Возвращает объект трека из [`$.Jouele.tracks`](#joueletracks).  
Осторожно, этот объект предназначен для внутренних нужд Жуэля, и любые изменения этого объекта могут повлиять на работоспособность Жуэля.

##### `JoueleInstance.getTotalTime()`
Возвращает: `Number`  
Возвращает продолжительность трека в секундах вида `150` (или `0`, если продолжительность неизвестна).

##### `JoueleInstance.getElapsedTime()`
Возвращает: `Number`  
Возвращает текущее время трека в секундах вида `46` (или `0`, если трек не играл или сломан).

##### `JoueleInstance.getRemainingTime()`
Возвращает: `Number`  
Возвращает оставшееся время трека в секундах вида `104` (или `0`, если продолжительность трека неизвестна).

##### `JoueleInstance.getPlaylistDOM()`
Возвращает: `jQuery-object`  
Возвращает jQuery-объект с DOM-элементом плейлиста, в котором находится этот контрол/плеер (jQuery-объект может быть «пустым», если плейлиста нет).

##### `JoueleInstance.getPlaylist()`
Возвращает: `Array`  
Возвращает ссылку на массив с плейлистом из [`$.Jouele.playlist`](#joueleplaylist), в котором находится этот контрол/плеер.

##### `JoueleInstance.isPlaying()`
Возвращает: `Boolean`  
Показывает, играет ли в данный момент трек (также `true` если трек был запущен, но пока грузится).

##### `JoueleInstance.isPlayed()`
Возвращает: `Boolean`  
Показывает, играл ли когда-либо трек на самом деле (`false` если трек был запущен, но фактически не проигрывался).

##### `JoueleInstance.isPaused()`
Возвращает: `Boolean`  
Показывает, поставлен ли трек на паузу (`false` если трек не был запущен, `true` если был запущен, фактически не проигрывался, но был остановлен).

##### `JoueleInstance.isBroken()`
Возвращает: `Boolean`  
Показывает, был ли трек запущен и определён как «сломанный» (URL недоступен). Если трек «сломан», для него недоступны все остальные методы.

#### Кастомное API

##### Доступное для плееров

###### `JoueleInstance.$container`
Содержит: `jQuery-object`  
Содержит jQuery-объект с DOM-элементом плеера `.jouele`.

###### `JoueleInstance.$link`
Содержит: `jQuery-object`  
Содержит jQuery-объект с DOM-элементом ссылки `a`, из которой был создан Жуэль (сама ссылка при инициализации Жуэля убирается из DOM методом `$.detach`).

##### Доступное для контролов

###### `JoueleInstance.$control`
Содержит: `jQuery-object`  
Содержит jQuery-объект с DOM-элементом контрола `.jouele-control`.

##### Доступное для контролов, находящихся внутри плеера (стандартный плеер состоит из обычных контролов)

###### `JoueleInstance.getParentJouele()`
Содержит: `JoueleInstance`  
Содержит JoueleInstance, принадлежащий плееру, в котором этот контрол находится.

#### События
Некоторые контролы получают триггеры событий в случаях, когда данные, необходимые для их работы, обновляются. Это происходит при помощи метода `$.trigger()`. Ловить события можно через `$.on()`.  
Некоторые события приносят с собой данные в дополнительном аргументе.

##### `.trigger("jouele:position", position)`
Вызывается на контролах типов `"position"`, `"elapsed"` и `"remaining"`, когда точка воспроизведения трека двигается.  
Свойство `position` типа `Number` соответствует проценту воспроизведённой части трека от его общей длительности (для контролов `"position"` и `"elapsed"`) или проценту оставшейся части трека (для контролов `"remaining"`).

##### `.trigger("jouele:totaltime", time_total)`
Вызывается на контролах типа `"time-total"`, когда обновляются данные о длительности трека.  
Свойство `time_total` типа `Number` содержит длительность трека в секундах вида `150`.

##### `.trigger("jouele:elapsedtime", time_elapsed)`
Вызывается на контролах типа `"time-elapsed"`, когда точка воспроизведения трека двигается или обновляются данные о длительности трека.  
Свойство `time_elapsed` типа `Number` содержит текущее время трека в секундах вида `46`.

##### `.trigger("jouele:remainingtime", time_remaining)`
Вызывается на контролах типа `"time-remaining"`, когда точка воспроизведения трека двигается или обновляются данные о длительности трека.  
Свойство `remaining_time` типа `Number` содержит оставшееся время трека в секундах вида `104`.

##### `.trigger("jouele:rangein")`
Вызывается на контролах типа `"seek"`, когда воспроизведение трека заходит в отрезок, указанный в `"data-range"` у этого контрола.

##### `.trigger("jouele:rangeout")`
Вызывается на контролах типа `"seek"`, когда воспроизведение трека выходит из отрезка, указанного в `"data-range"` у этого контрола.

##### `.trigger("jouele:title")`
Вызывается на контролах типа `"title"`, когда обновляются данные о названии трека. Узнать значение `title` можно через [`JoueleInstance.getTitle()`](#joueleinstancegettitle).

#### Коллбэки
У любого трека (к которому может быть привязано сколько угодно плееров и контролов) есть набор событий, вызываемых во время работы. К любому событию можно «прикрепить» собственный коллбэк, который будет вызываться до того, как будет исполнен код Жуэля. Если по какой-либо причине необходимо не исполнять код Жуэля (не рекомендуется!), нужно вернуть в коллбэке значение `false` (строго `Boolean`).

##### Установка коллбэка
```javascript
JoueleInstance.getTrack().player["callbacks"]["название_коллбэка"] = function() { /* тело функции */ }
```

##### События, на которые можно «прикрепить» коллбэки

###### `onloaderror`
Ошибка загрузки трека (трек недоступен).  
Стандартное поведение Жуэля на это событие — «ломать» все плееры и контролы, прикреплённые к этому треку.

###### `onload`
Трек загружен и готов к воспроизведению.  
Стандартное поведение Жуэля на это событие — запускать воспроизведение трека, если до этого он не был остановлен.

###### `onplay`
Трек начал воспроизводиться.  
Стандартное поведение Жуэля на это событие — остановка другого играющего трека, изменение интерфейса плеера, запуск движений таймлайна.

###### `onpause`
Воспроизведение трека остановлено.  
Стандартное поведение Жуэля на это событие — отмена движений таймлайна, изменение интерфейса плеера.

###### `onseek`
Трек перемотан на другую позицию.  
Стандартное поведение Жуэля на это событие — перемещение таймлайна и запуск воспроизведения, если необходимо.

###### `onend`
Трек воспроизвёлся до конца.  
Стандартное поведение Жуэля на это событие — переход к следующему треку, если трек находится в плейлисте, или просто остановка воспроизведения.


## Титры
- Идея и разработка — [Илья Бирман](https://ilyabirman.ru)
- Разработка — [Евгений Лазарев](https://lazarev.me)
- Работа с аудио — [howler.js](https://github.com/goldfire/howler.js)

## Лицензия
[MIT License](license.md)
