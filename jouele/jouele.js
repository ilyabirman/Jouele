$ (function () {

  var borderRadius = 4
    
  var formatTime = function (seconds) {
    
    var sec = Math.round (seconds) % 60
    var min = ((Math.round (seconds) - sec) % 3600) / 60
    var heu = (Math.round (seconds) - sec - (min * 60)) / 3600
    
    if (sec < 10) sec = '0' + sec
    if (heu && (min < 10)) min = '0' + min
    
    return (heu? (heu + ':') : '') + min + ':' + sec
    
  }
  
  var updateTimeDisplay = function (playerSelector, playedTime) {
    
    var playtimetext = '', totaltimetext = ''
    
    if (playedTime >= 0) {
      playtimetext = formatTime (playedTime)
    }

    if ($ (playerSelector).data ('totalTime') > 0) {
      if ($ (playerSelector).data ('isExactTotalTime')) {
        totaltimetext = formatTime ($ (playerSelector).data ('totalTime'))
      } else {
        var min = $ (playerSelector).data ('totalTime') / 60
        var d = (Math.log (min) / Math.log (10))
        min = Math.round (Math.pow (10, Math.round (d*10)/10))
        totaltimetext = '~ ' + formatTime (min * 60)
      }
    }

    $ (playerSelector).find ('.jouele-play-time').text (playtimetext)
    $ (playerSelector).find ('.jouele-total-time').text (totaltimetext)
    
  }
  
  var updateLoadBar = function (playerSelector, seekPercent) {
        
    var maxWidth = $ (playerSelector).find ('.jouele-progress-area').width ()
    var minWidth = borderRadius*2
    var pixels = Math.floor (Math.min (100, seekPercent) / 100 * (maxWidth - minWidth)) + minWidth

    $ (playerSelector).find ('.jouele-load-bar').css ('width', pixels + 'px')
    
  }
  

  var updatePlayBar = function (playerSelector, pixels) {

    $ (playerSelector).find ('.jouele-play-lift').css ('left', pixels  + 'px')//- borderRadius
    $ (playerSelector).find ('.jouele-play-bar').css ('width', pixels + borderRadius + 'px')

  }

  var willSeekTo = function (playerSelector, playerObject, tryPixels) {
    
    //tryPixels += (borderRadius);
    
    var maxWidth = $ (playerSelector).find ('.jouele-progress-area').width ()
    var minWidth = borderRadius*2
    var loadWidth = $ (playerSelector).find ('.jouele-load-bar').width ()
    var pixels = Math.min (Math.max (tryPixels, borderRadius), loadWidth - borderRadius)
    var playhead = (pixels-borderRadius)/(maxWidth-minWidth)
    var playheadSeekable = (pixels-borderRadius)/(loadWidth-minWidth)
    
    if ((maxWidth == 0) || (loadWidth == 0)) playheadSeekable = playhead = 0
    
    $ (playerSelector).find ('.jouele-buffering').stop ().fadeTo (1, 1)

    updatePlayBar (playerSelector, pixels)
    updateTimeDisplay (playerSelector, $ (playerSelector).data ('totalTime') * playhead)
    
    $ (playerObject).data ('wantSeekToTime', $ (playerSelector).data ('totalTime') * playhead)
    
    $ (playerObject).jPlayer ('play')
    $ (playerObject).jPlayer ('playHead', playheadSeekable*100)
    
    return false
    
  }
  
  $ (".jouele").each (function () {

    var $aHref = $ (this) 
    
    var thisName = $aHref.text ()
    
    var thisID = 'jouele-ui-zone-' + (1000 + Math.round (Math.random ()*8999))
    
    $jdiv = $ (this).after (
      $ ('<div class="jouele" id="' + thisID + '"></div>')
    )

    var thisSelector = '#' + thisID

    $ (thisSelector).append (
      $ ('<div class="jouele-invisible-object"></div>'),
      $ ('<div class="jouele-info-area"></div>'),
      $ ('<div class="jouele-progress-area"></div>')
    )
    
    // progress area
    $ (thisSelector).find ('.jouele-progress-area').append (
      $ ('<div class="jouele-mine"></div>')
    )
    $ (thisSelector).find ('.jouele-mine').append (
      $ ('<div class="jouele-mine-bar"></div>'),
      $ ('<div class="jouele-load-bar jouele-hidden" style="display: none"></div>'),
      $ ('<div class="jouele-play-bar"></div>'),
      $ ('<div class="jouele-play-lift jouele-hidden" style="display: none">')
    )
    $ (thisSelector).find ('.jouele-play-lift').append (
      $ ('<div class="jouele-buffering" style="display: none"></div>')
    )
   
    // info area
    $ (thisSelector).find ('.jouele-info-area').append (
      $ ('<a class="jouele-download jouele-hidden" style="display: none"></a>'),
      $ ('<div class="jouele-play-control"></div>'),
      $ ('<div class="jouele-time"></div>'),
      $ ('<div class="jouele-name">' + thisName + '</div>')
    )
    
    $ (thisSelector).find ('.jouele-time').append (
      $ ('<div class="jouele-play-time"></div>'),
      $ ('<div class="jouele-total-time"></div>')
    )
    
    $ (thisSelector).find ('.jouele-play-control').append (
      $ ('<div class="jouele-unavailable jouele-to-hide"></div>'),
      $ ('<div class="jouele-play-pause jouele-hidden" style="display: none"></div>')
    )
    $ (thisSelector).find ('.jouele-play-pause').append (
      $ ('<div class="jouele-play"></div>'),
      $ ('<div class="jouele-pause" style="display: none"></div>')
    )
    
    $aHref.remove ()
    
    filename = 'jouele.js'
    var $exists = $ ('script').filter (function () {
      return this.src.indexOf (filename) != -1
    }).eq (0)

    if ($exists.size ()) {
      swfPath = ($exists.attr ('src').slice (0, -1 - filename.length)) + '/jplayer.swf'
    }
    
    if (swfPathA = $aHref.attr ('data-swfSource')) swfPath = swfPathA
    
    $ (thisSelector).find ('.jouele-invisible-object').jPlayer ({
      
      swfPath: swfPath,
      preload: 'metadata',
      volume: 100,
      
      cssSelectorAncestor: thisSelector,
      cssSelector: {
        play: '.jouele-play',
        pause: '.jouele-pause',
      },
      
      solution: 'html,flash',
      supplied: 'mp3',
      
      errorAlerts: false,
      
      ready: function (event) {
        var me = this
        var isMouseDown = false

        $ (thisSelector).find ('.jouele-download').attr (
          'href',
          $aHref.attr ('href')
        )

        // why no thisSelector?
        $ ('.jouele .jouele-hidden').show ()
        $ ('.jouele .jouele-to-hide').hide ()
        
        $ (this).jPlayer ("setMedia", {
          mp3: $aHref.attr ('href'),
        })
        
        $ (thisSelector).find ('.jouele-mine').mousedown (function (e) {
          isMouseDown = true;
          e.stopPropagation ()
          e.preventDefault ()
          return willSeekTo (thisSelector, me, e.pageX - $ (thisSelector).find ('.jouele-mine').offset ().left)
        })
        
        $ (document.body).mouseup (function () { isMouseDown = false })
        
        $ (document.body).mousemove (function (e) {
          //document.title = e.pageX - $ (thisSelector).find ('.jouele-mine').offset ().left
          if (isMouseDown) {
            e.stopPropagation ()
            e.preventDefault ()
            return willSeekTo (thisSelector, me, e.pageX - $ (thisSelector).find ('.jouele-mine').offset ().left)
          }
        })
        
      },
      
      stop: function (event) {
        $ (this).parent ().removeClass ('jouele-status-playing')
      },
      
      pause: function (event) {
        $ (this).parent ().removeClass ('jouele-status-playing')
      },
      
      play: function (event) { 
        $ ('.jouele-invisible-object').not (this).parent ().removeClass ('jouele-status-playing')
        $ (this).parent ().addClass ('jouele-status-playing')
        $ ('.jouele-invisible-object').not (this).jPlayer ('pause')
        $ (this).data ('isDirty', 1)
      },
      
      progress: function (event) { 
        
        updateLoadBar (thisSelector, event.jPlayer.status.seekPercent)
      
      },
      
      timeupdate: function (event) {
        
        updateLoadBar (thisSelector, event.jPlayer.status.seekPercent)
        
        var maxWidth = $ (thisSelector).find ('.jouele-progress-area').width ()
        var minWidth = borderRadius*2
        var playpx = Math.floor (
          event.jPlayer.status.currentTime / $ (thisSelector).data ('totalTime') * (maxWidth - minWidth)
        ) + borderRadius
        
        // document.title = event.jPlayer.status.currentTime / $ (thisSelector).data ('totalTime') + '|' + minWidth + '|' + maxWidth + '|' + playpx
        
        if (event.jPlayer.status.seekPercent >= 100) {
          $ (thisSelector).data ('isExactTotalTime', true)
          $ (thisSelector).data ('totalTime', event.jPlayer.status.duration)
        } else if (event.jPlayer.status.seekPercent > 0) {
          $ (thisSelector).data ('totalTime', event.jPlayer.status.duration / event.jPlayer.status.seekPercent * 100)
        } else {
          $ (thisSelector).data ('totalTime', 0)
        }
        
                
        if (
          (! ($ (this).data ('wantSeekToTime') >= 0)) ||
          (event.jPlayer.status.currentTime - $ (this).data ('wantSeekToTime')) >= .33
        ) {
          var curtime = -1
          if ($ (this).data ('isDirty')) curtime = event.jPlayer.status.currentTime
          $ (thisSelector).find ('.jouele-buffering').stop ().fadeTo (333, 0)
          updatePlayBar (thisSelector, playpx)
          updateTimeDisplay (thisSelector, curtime)
          $ (this).data ('wantSeekToTime', -1)
        }
        
        /*
        $ (thisSelector).find ('.jouele-name').html (
          'now = ' + event.jPlayer.status.currentTime + '<br />' +
          'wantSeekToTime = ' + $ (this).data ('wantSeekToTime') + '<br />' +
          'wantSeekForward = '  + $ (this).data ('wantSeekForward') + '<br />' +
          'playpx = ' + playpx + '<br />' +
          ''
        )
        //*/
      
      }
    })

  })

  
})