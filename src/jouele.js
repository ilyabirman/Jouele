(function($) {

    "use strict";

    var isSVGSupported = false;
    var checkSVGSupport = function() {
        /* https://css-tricks.com/a-complete-guide-to-svg-fallbacks/ */
        var div = document.createElement("div");
        div.innerHTML = "<svg/>";
        return (div.firstChild && div.firstChild.namespaceURI) == "http://www.w3.org/2000/svg";
    };
    var setSVGSupport = function() {
        if ((typeof Modernizr === "object" && typeof Modernizr.inlinesvg === "boolean" && Modernizr.inlinesvg) || checkSVGSupport()) {
            isSVGSupported = true;
        }
        return this;
    };

    var formatTime = function(rawSeconds) {
        if (typeof rawSeconds !== "number") {
            return rawSeconds;
        }

        var seconds = Math.round(rawSeconds) % 60,
            minutes = ((Math.round(rawSeconds) - seconds) % 3600) / 60,
            hours = (Math.round(rawSeconds) - seconds - (minutes * 60)) / 3600;

        return (hours ? (hours + ":") : "") + ((hours && (minutes < 10)) ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
    };

    var makeSeconds = function(time) {
        if (typeof time === "number") {
            return time;
        }

        var array = time.split(":").reverse(),
            seconds = 0;

        for (var i = 0; i < array.length; i++) {
            seconds += array[i] * Math.pow(60, i);
        }

        return seconds;
    };

    var showPreloader = function(instance, timeout) {
        if (instance.preloaderTimeout || instance.isSeeking || !instance.waitForLoad) {
            return instance;
        }

        var timeout = timeout || 50; // 50 is default timeout which is almost not visible for user ('instant preloader') but enough to making script works

        instance.preloaderTimeout = setTimeout(function() {
            if (instance.isSeeking) {
                instance.preloaderTimeout = null;
                return instance;
            }
            instance.$container.find(".jouele-play-lift").addClass("jouele-play-lift_buffering");
        }, timeout);

        return instance;
    };

    var hidePreloader = function(instance) {
        if (!instance.preloaderTimeout) {
            return instance;
        }

        clearTimeout(instance.preloaderTimeout);
        instance.preloaderTimeout = null;
        instance.$container.find(".jouele-play-lift").removeClass("jouele-play-lift_buffering");

        return instance;
    };

    var updateLoadBar = function(instance, status) {
        if ((instance.fullyLoaded && instance.totalTime) || !instance.isPlayed) {
            return instance;
        }

        var roundedSeekPercent = Math.round(status.seekPercent); // because Safari sometimes shows 99.999999999

        if (roundedSeekPercent >= 100) {
            instance.fullyLoaded = true;
            instance.totalTime = status.duration;
        } else if (roundedSeekPercent > 0) {
            instance.totalTime = status.duration;
        } else {
            instance.totalTime = 0;
        }

        instance.$container.find(".jouele-load-bar").css({"width": Math.floor(Math.min(100, roundedSeekPercent)) + "%"});

        return instance;
    };

    var updatePlayBar = function(instance, percents) {
        if (instance.seekTime && !instance.isSeeking) {
            return instance;
        }

        percents = percents > 100 ? 100 : percents;

        instance.$container.find(".jouele-play-lift").css("left", percents  + "%");
        instance.$container.find(".jouele-play-bar").css("width", percents + "%");

        return instance;
    };

    var updateTimeDisplay = function(instance, seconds) {
        if (instance.totalTime <= 0 && !instance.options.length) {
            return instance;
        }

        var totalTime = "";

        if (instance.fullyLoaded && instance.totalTime) {
            if (!instance.fullTimeDisplayed) {
                totalTime = formatTime(instance.totalTime);
                instance.$container.find(".jouele-total-time").html(totalTime);
                instance.fullTimeDisplayed = true;
            }
        } else if (instance.options.length) {
            totalTime = formatTime(makeSeconds(instance.options.length));
            instance.$container.find(".jouele-total-time").html(totalTime);
        } else {
            totalTime = instance.options.length ? instance.options.length : "<span class=\"jouele-total-time__approx\">~</span>" + formatTime(instance.totalTime);
            instance.$container.find(".jouele-total-time").html(totalTime);
        }

        if ((instance.isPlaying || instance.waitForLoad) && (instance.totalTime || instance.seekTime)) {
            instance.$container.find(".jouele-play-time").html(formatTime(instance.seekTime ? instance.seekTime : seconds));
        }

        return instance;
    };

    var willSeekTo = function(instance, seekPercent) {
        var percent = seekPercent.toFixed(2);

        if (percent < 0) {
            percent = 0;
        } else if (percent > 100) {
            percent = 100;
        }

        if (!instance.isPlaying) {
            if ($.Jouele.lastPlayed !== instance) {
                $.Jouele.lastPlayed = instance;
                $.Jouele("setMedia", instance);
            }
            instance.pseudoPlay();
        }

        $.Jouele.$jPlayer.jPlayer("playHead", percent);

        updatePlayBar(instance, percent);
        showPreloader(instance);

        instance.waitForLoad = true;

        if (instance.fullTimeDisplayed) {
            instance.seekTime = (instance.totalTime / 100) * percent;
            updateTimeDisplay(instance, instance.seekTime);
        } else if (instance.options.length) {
            instance.seekTime = (makeSeconds(instance.options.length) / 100) * percent;
            updateTimeDisplay(instance, instance.seekTime);
        } else {
            instance.seekTime = 0.01;
        }

        return instance;
    };

    $.fn.jouele = function(options) {
        return this.each(function() {
            var $this = $(this),
                thisClass = $this.attr("class"),
                skinClassPosition = thisClass ? thisClass.indexOf("jouele-skin-") : -1,
                joueleInstance = $this.data("jouele"),
                skin = "";

            if (joueleInstance) {
                /* Call method */
                if (typeof options === "string" && typeof joueleInstance[options] !== "undefined" && $.isFunction(joueleInstance[options])) {
                    return joueleInstance[options]();
                }
            } else {
                /* Create new instance */
                if (skinClassPosition > 0) {
                    skin = thisClass.substr(skinClassPosition + 12, thisClass.indexOf(" ", skinClassPosition) > 0 ? thisClass.indexOf(" ", skinClassPosition) : thisClass.length);
                }
                new Jouele($this, $.extend({}, $.fn.jouele.defaults, options, $this.data(), {skin: skin}));
            }
        });
    };

    $.fn.jouele.defaults = {
        length: 0,
        playFrom: 0,
        hideTimelineOnPause: false,
        skin: "",

        spaceControl: false,
        pauseOnSpace: false,
        playOnSpace: false,
        scrollOnSpace: true
    };

    var Jouele = function($link, options) {
        var href = this.checkHref($link);

        if (!href) {
            return false;
        }

        this.version = "2.2.2";
        this.$link = $link;
        this.href = href;
        this.options = options;
        this.isPlaying = false;
        this.isPlayed = false;
        this.totalTime = 0;
        this.fullyLoaded = false;
        this.fullTimeDisplayed = false;
        this.waitForLoad = false;
        this.seekTime = 0;
        this.preloaderTimeout = null;
        this.isSeeking = false;
        this.playFrom = 0;

        this.init();
    };

    Jouele.prototype.checkHref = function checkHref($link) {
        var href = $link.attr("href");

        return href ? href : false;
    };

    Jouele.prototype.init = function init() {
        this.checkOptions();
        this.createDOM();
        this.pushToPlaylist();
        this.checkGlobalOptions();

        if (!$.Jouele.$jPlayer) {
            $.Jouele("init", this);
        } else {
            $.Jouele("_jPlayerReady", this);
        }

        this.bindEvents();
        this.insertDOM();
    };

    Jouele.prototype.destroy = function destroy() {
        var self = this,
            uniqueID = this.joueleID;

        $.each(self.playlist, function(index, element) {
            if (element === self) {
                self.playlist.splice(index, 1);
                if ($.Jouele.lastPlayed === self) {
                    $.Jouele.lastPlayed = null;
                }
                if (self.playlist.length === 0) {
                    $.each($.Jouele.playlist, function(index_playlist, element_playlist) {
                        if (element_playlist === self.playlist) {
                            $.Jouele.playlist.splice(index_playlist, 1);
                        }
                    });
                }
            }
        });

        this.$container.after(this.$link).remove();
        $(document).off("." + uniqueID);

        this.$link.removeData("jouele");

        return this.$link;
    };

    Jouele.prototype.pause = function pause() {
        hidePreloader(this);

        if (!this.seekTime) {
            this.waitForLoad = false;
        }

        if (typeof this.$jPlayer !== "undefined" && this.$jPlayer.jPlayer) {
            if (this.isPlaying || this.waitForLoad) {
                this.isPlaying = false;
                this.waitForLoad = false;
                this.$jPlayer.jPlayer("pause");
            }
        }

        if (!this.isPlaying) {
            this.pseudoPause();
        }

        return this;
    };

    Jouele.prototype.pseudoPause = function pseudoPause() {
        this.$container.removeClass("jouele-status-playing");
        this.$container.find(".jouele-control-button-icon_play").removeClass("jouele-hidden");
        this.$container.find(".jouele-control-button-icon_pause").addClass("jouele-hidden");
    };

    Jouele.prototype.stop = function stop() {
        if (typeof this.$jPlayer !== "undefined" && this.$jPlayer.jPlayer) {
            if (this.isPlaying) {
                this.$jPlayer.jPlayer("stop");
            }
        }

        return this;
    };

    Jouele.prototype.play = function play() {
        var self = this;

        if ($.Jouele.lastPlayed !== self) {
            if (self.playFrom) {
                showPreloader(self);
                willSeekTo(self, self.totalTime ? (self.playFrom / (self.totalTime / 100)) : 0);
                return self;
            } else {
                $(document).trigger("jouele-pause", self); // do not touch
                $.Jouele.lastPlayed = self;
                $.Jouele("setMedia", self);
            }
        }

        showPreloader(self, self.seekTime ? false : 500); // 500 is enough to play the loaded fragment, if it's loaded; if isn't — preloader will appear after 500ms

        self.isPlayed = true;

        if (typeof self.$jPlayer !== "undefined" && self.$jPlayer.jPlayer) {
            if (!self.isPlaying) {
                setTimeout(function() { // do not touch
                    self.$jPlayer.jPlayer("play");
                }, 1);
            }
        }

        return self;
    };

    Jouele.prototype.pseudoPlay = function pseudoPlay() {
        $(document).trigger("jouele-pause", this);
        this.$container.addClass("jouele-status-playing");
        this.$container.find(".jouele-control-button-icon_pause").removeClass("jouele-hidden");
        this.$container.find(".jouele-control-button-icon_play").addClass("jouele-hidden");

        this.isPlayed = true;
    };

    Jouele.prototype.onPause = function onPause() {
        this.isPlaying = false;
        this.isSeeking = false;
        this.waitForLoad = false;
        this.$container.removeClass("jouele-status-playing");
        this.$container.find(".jouele-control-button-icon_play").removeClass("jouele-hidden");
        this.$container.find(".jouele-control-button-icon_pause").addClass("jouele-hidden");
    };

    Jouele.prototype.onStop = function onStop() {
        this.isPlaying = false;
        this.seekTime = 0;
        this.isSeeking = false;
        this.waitForLoad = false;
        this.$container.removeClass("jouele-status-playing");
    };

    Jouele.prototype.onPlay = function onPlay() {
        $(document).trigger("jouele-pause", this);
        this.$container.addClass("jouele-status-playing");
        this.$container.find(".jouele-control-button-icon_pause").removeClass("jouele-hidden");
        this.$container.find(".jouele-control-button-icon_play").addClass("jouele-hidden");

        this.waitForLoad = false;
        this.isPlaying = true;
        this.isPlayed = true;

        $.Jouele.lastPlayed = this;
    };

    Jouele.prototype.checkOptions = function checkOptions() {
        if (!parseInt(this.options.length)) {
            this.options.length = 0;
        }

        return this;
    };

    Jouele.prototype.checkGlobalOptions = function checkGlobalOptions() {
        if (this.options.pauseOnSpace || this.$playlist.data("pauseOnSpace")) {
            $.Jouele.options.pauseOnSpace = true;
        }
        if (this.options.playOnSpace || this.$playlist.data("playOnSpace")) {
            $.Jouele.options.playOnSpace = true;
        }
        if (!this.options.scrollOnSpace || this.$playlist.data("scrollOnSpace")) {
            $.Jouele.options.scrollOnSpace = false;
        }

        if (this.options.spaceControl || this.$playlist.data("spaceControl")) {
            $.Jouele.options.pauseOnSpace = true;
            $.Jouele.options.playOnSpace = true;
            $.Jouele.options.scrollOnSpace = false;
        }

        return this;
    };

    Jouele.prototype.createDOM = function createDOM() {
        var $container = $(document.createElement("div")),
            $invisibleObject = $(document.createElement("div")),
            $infoArea = $(document.createElement("div")),
            $progressArea = $(document.createElement("div")),
            filename = this.$link.text(),

            self = this;

        var createInfoAreaDOM = function() {
            return [
                $(document.createElement("div")).addClass("jouele-time").append(
                    $(document.createElement("div")).addClass("jouele-play-time").text(self.options.length ? "0:00" : ""),
                    $(document.createElement("div")).addClass("jouele-total-time").text(self.options.length ? formatTime(makeSeconds(self.options.length)) : "")
                ),
                $(document.createElement("div")).addClass("jouele-control").append(
                    $(document.createElement("div")).addClass("jouele-control-button" + (isSVGSupported ? "" : " jouele-control-button_nosvg")).append(
                        $(document.createElement("span")).addClass("jouele-control-button-icon jouele-control-button-icon_unavailable").html(
                            isSVGSupported ? '<svg class="jouele-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" enable-background="new 0 0 16 16"><g class="jouele-svg-color"><path d="m4 6.7l3.8 3.7-3.8 2.1z"/><path d="m.2 2.2l.6-.5 11 11.1-.5.5z"/><path d="m4 4.3v-.8l8 4.5-2.7 1.5z"/></g></svg>' : ''
                        ),
                        $(document.createElement("a")).attr("href", self.href).addClass("jouele-control-link jouele-hidden").append(
                            $(document.createElement("span")).addClass("jouele-control-button-icon jouele-control-button-icon_play jouele-hidden").html(
                                isSVGSupported ? '<svg class="jouele-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" enable-background="new 0 0 16 16"><path class="jouele-svg-color" d="m4 3.5l8 4.5-8 4.5z"/></svg>': ''
                            ),
                            $(document.createElement("span")).addClass("jouele-control-button-icon jouele-control-button-icon_pause jouele-hidden").html(
                                isSVGSupported ? '<svg class="jouele-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" enable-background="new 0 0 16 16"><path class="jouele-svg-color" d="m4 3.5l8 4.5-8 4.5z"/></svg>': ''
                            )
                        )
                    ),
                    $(document.createElement("div")).addClass("jouele-control-text").html(filename)
                )
            ];
        };

        var createProgressAreaDOM = function() {
            return $(document.createElement("div")).addClass("jouele-mine").append(
                $(document.createElement("div")).addClass("jouele-mine-bar"),
                $(document.createElement("div")).addClass("jouele-load-bar jouele-hidden"),
                $(document.createElement("div")).addClass("jouele-play-bar"),
                $(document.createElement("div")).addClass("jouele-play-lift jouele-hidden").append()
            );
        };

        this.$container = $container
            .data("jouele", this)
            .addClass("jouele jouele_inited" + (this.$link.data("first") === true ? " jouele_first" : "") + (this.options.hideTimelineOnPause ? " jouele_timeline_hide" : "") + (this.options.skin ? " jouele-skin-" + this.options.skin : ""))
            .append(
                $invisibleObject.addClass("jouele-invisible-object"),
                $infoArea.addClass("jouele-info-area").append(createInfoAreaDOM()),
                $progressArea.addClass("jouele-progress-area").append(createProgressAreaDOM())
            );

        this.joueleID = "jouele-" + (1000 + Math.round(Math.random() * 99999));
        this.$playlist = this.$link.parents(".jouele-playlist").eq(0);

        return this;
    };

    Jouele.prototype.pushToPlaylist = function pushToPlaylist() {
        var self = this,
            index_of_playlist;

        $(".jouele").filter(":not(.jouele-playlist .jouele)").add(".jouele-playlist").each(function(index, element) {
            if (self.$playlist.length > 0 && self.$playlist[0] === element) {
                index_of_playlist = index;
                return false;
            } else if (self.$link[0] === element) {
                index_of_playlist = index;
                return false;
            }
        });

        if (self.$playlist.length > 0) {
            var $jouele_links = self.$playlist.find(".jouele").filter("[href]"),
                $jouele_inited = self.$playlist.find(".jouele_inited"),
                index_of_position_in_playlist,
                previous_inited_jouele,
                index_of_previous_jouele;

            $jouele_links.add($jouele_inited).each(function(index, element) {
                var $element = $(element);

                if ($element.hasClass("jouele_inited")) {
                    previous_inited_jouele = $element.data("jouele");
                }
                if (element === self.$link[0]) {
                    index_of_position_in_playlist = index;
                    return false;
                }
            });

            if ($.isArray($.Jouele.playlist[index_of_playlist])) {
                if ($.Jouele.playlist[index_of_playlist][0].$playlist[0] !== self.$playlist[0]) {
                    $.Jouele.playlist.splice(index_of_playlist, 0, [self]);
                } else {
                    for (var i = 0; i < $.Jouele.playlist[index_of_playlist].length; i++) {
                        if ($.Jouele.playlist[index_of_playlist][i] === previous_inited_jouele) {
                            index_of_previous_jouele = i;
                            break;
                        }
                    }
                    if (typeof $.Jouele.playlist[index_of_playlist][index_of_previous_jouele + 1] === "undefined") {
                        if (index_of_position_in_playlist === 0) {
                            $.Jouele.playlist[index_of_playlist].splice(0, 0, self);
                        } else {
                            $.Jouele.playlist[index_of_playlist].push(self);
                        }
                    } else {
                        $.Jouele.playlist[index_of_playlist].splice(index_of_previous_jouele + 1, 0, self);
                    }
                }
            } else {
                $.Jouele.playlist[index_of_playlist] = [self];
            }
        } else {
            $.Jouele.playlist.splice(index_of_playlist, 0, [self]);
        }

        self.playlist = $.Jouele.playlist[index_of_playlist];
    };

    Jouele.prototype.insertDOM = function insertDOM() {
        this.$link.after(this.$container);
        this.$link.data("jouele", this);
        this.$link.detach();

        return this;
    };

    Jouele.prototype.bindEvents = function bindEvents() {
        var self = this,
            uniqueID = self.joueleID;

        $(document).on("jouele-pause." + uniqueID, function(event, triggeredJouele) {
            if (self !== triggeredJouele) {
                self.pause();
            }
        });

        return this;
    };

    $.Jouele = function(method, context) {
        this.init = function(context) {
            var self = this,
                $jPlayer = $("<div>");

            $(document).on("keydown.jouele", function(event) {
                if (event.target.nodeName === "INPUT" || event.target.nodeName === "TEXTAREA" || event.target.nodeName === "SELECT" || event.target.nodeName === "OPTION" || event.target.nodeName === "BUTTON" || (typeof $(event.target).attr("contenteditable") !== "undefined" && $(event.target).attr("contenteditable") !== "false")) {
                    return true;
                }
                
                if (event.keyCode === 32) {
                    if ($.Jouele.lastPlayed && $.Jouele.lastPlayed.isPlaying) {
                        if ($.Jouele.options.pauseOnSpace) {
                            if (!$.Jouele.options.scrollOnSpace) {
                                event.stopPropagation();
                                event.preventDefault();
                            }
                            $.Jouele.lastPlayed.pause();
                        }
                    } else {
                        if ($.Jouele.options.playOnSpace) {
                            if (!$.Jouele.options.scrollOnSpace) {
                                event.stopPropagation();
                                event.preventDefault();
                            }
                            if ($.Jouele.lastPlayed) {
                                $.Jouele.lastPlayed.play();
                            } else {
                                var $firstJouele = $(".jouele_inited").filter(".jouele_first");
                                if ($firstJouele.length > 0) {
                                    $firstJouele.eq(0).data("jouele").play();
                                } else {
                                    $.Jouele.playlist[0][0].play();
                                }
                            }
                        }
                    }
                }
            });

            $.Jouele.$jPlayer = $jPlayer.jPlayer({
                solution: "html",
                wmode: "window",
                preload: "none",

                supplied: "mp3",
                volume: 1,

                ready: function() {
                    self._jPlayerReady(context);
                }
            });
        };

        this.setMedia = function(context) {
            var self = this;

            context.$jPlayer.off($.jPlayer.event.pause).on($.jPlayer.event.pause, function() {
                self._jPlayerPause(context);
            });
            context.$jPlayer.off($.jPlayer.event.stop).on($.jPlayer.event.stop, function() {
                self._jPlayerStop(context);
            });
            context.$jPlayer.off($.jPlayer.event.play).on($.jPlayer.event.play, function() {
                self._jPlayerPlay(context);
            });
            context.$jPlayer.off($.jPlayer.event.progress).on($.jPlayer.event.progress, function(event) {
                self._jPlayerProgress(context, event);
            });
            context.$jPlayer.off($.jPlayer.event.timeupdate).on($.jPlayer.event.timeupdate, function(event) {
                self._jPlayerTimeupdate(context, event);
            });

            $.Jouele.$jPlayer.jPlayer("setMedia", {
                mp3: context.href
            });
        };

        this._jPlayerReady = function(context) {
            var uniqueID = context.joueleID;

            context.$jPlayer = $.Jouele.$jPlayer;
            context.totalTime = makeSeconds(context.options.length);
            context.playFrom = makeSeconds(context.options.playFrom);

            context.$container.find(".jouele-hidden").removeClass("jouele-hidden");
            context.$container.find(".jouele-control-button-icon_unavailable").addClass("jouele-hidden");
            context.$container.find(".jouele-control-button-icon_pause").addClass("jouele-hidden");

            context.$container.find(".jouele-control-link").off("click.jouele").on("click.jouele", function(event) {
                event.preventDefault();
                event.stopPropagation();
            });
            context.$container.find(".jouele-control-button-icon_play").off("click.jouele").on("click.jouele", function() {
                context.waitForLoad = true;
                context.pseudoPlay.call(context);
                context.play.call(context);
            });
            context.$container.find(".jouele-control-button-icon_pause").off("click.jouele").on("click.jouele", function() {
                context.pseudoPause.call(context);
                context.pause.call(context);
            });

            context.$container.find(".jouele-mine").off("mousedown." + uniqueID).on("mousedown." + uniqueID, function(event) {
                if (event.which !== 1) {
                    return false;
                }

                event.stopPropagation();
                event.preventDefault();

                context.isSeeking = true;

                var $this = $(this),
                    clickPoint = ((event.pageX - $this.offset().left) / $this.width()) * 100;

                $(document).off("mouseup." + uniqueID).one("mouseup." + uniqueID, function() {
                    $(document).off("mousemove." + uniqueID);
                    context.isSeeking = false;
                    showPreloader(context);
                });
                $(document).off("mousemove." + uniqueID).on("mousemove." + uniqueID, function(event) {
                    event.stopPropagation();
                    event.preventDefault();

                    if (!context.isSeeking) {
                        return false;
                    }

                    var clickPoint = ((event.pageX - $this.offset().left) / $this.width()) * 100;

                    willSeekTo(context, clickPoint);
                });

                willSeekTo(context, clickPoint);
            });
        };

        this._jPlayerPause = function(context) {
            context.onPause.call(context);
        };

        this._jPlayerStop = function(context) {
            context.onStop.call(context);
        };

        this._jPlayerPlay = function(context) {
            context.onPlay.call(context);
        };

        this._jPlayerProgress = function(context, event) {
            updateLoadBar(context, event.jPlayer.status);
            updateTimeDisplay(context, event.jPlayer.status.currentTime);
        };

        this._jPlayerTimeupdate = function(context, event) {
            updateLoadBar(context, event.jPlayer.status);
            updateTimeDisplay(context, event.jPlayer.status.currentTime);
            updatePlayBar(context, event.jPlayer.status.currentPercentAbsolute.toFixed(2));

            context.playFrom = event.jPlayer.status.currentTime;

            hidePreloader(context);

            if (context.waitForLoad) {
                context.waitForLoad = false;
                context.seekTime = 0;
                context.play();
                hidePreloader(context);
            }

            if (event.jPlayer.status.duration && (event.jPlayer.status.duration.toFixed(3) - event.jPlayer.status.currentTime.toFixed(3) < 0.01) && (event.jPlayer.status.duration.toFixed(3) - event.jPlayer.status.currentTime.toFixed(3) > -1)) { // Не спрашивайте. Это Safari.
                context.pause();
                context.playFrom = 0;

                if (context.$playlist.length === 0) {
                    return false;
                }

                for (var i = 0; i < context.playlist.length; i++) {
                    if (context.playlist[i] === context) {
                        break;
                    }
                }

                if (typeof context.playlist[i + 1] !== "undefined") {
                    context.playlist[i + 1].play();
                } else {
                    if (context.$playlist.data("repeat")) {
                        context.playlist[0].play();
                    }
                }
            }
        };

        if (typeof method === "string" && $.isFunction(this[method])) {
            this[method](context);
        }
    };

    $.Jouele.playlist = [];
    $.Jouele.lastPlayed = null;
    $.Jouele.$jPlayer = null;

    $.Jouele.options = {
        pauseOnSpace: false,
        playOnSpace: false,
        scrollOnSpace: true
    };

    /* It's time to know if SVG supported */
    setSVGSupport();

    /* Autoload Jouele */
    var autoLoadJouele = function() {
        $("a.jouele[href]").jouele();
    };
    $(autoLoadJouele);

}(jQuery));
