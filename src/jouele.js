(function($) {

    "use strict";

    var isSVGSupported = false;
    var checkSVGSupport = function () {
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
        var timeout = timeout || 50;

        if (instance.preloaderTimeout || instance.isSeeking || !instance.waitForLoad) {
            return instance;
        }

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

        if (status.seekPercent >= 100) {
            instance.fullyLoaded = true;
            instance.totalTime = status.duration;
        } else if (status.seekPercent > 0) {
            instance.totalTime = status.duration;
        } else {
            instance.totalTime = 0;
        }

        instance.$container.find(".jouele-load-bar").css({"width": Math.floor(Math.min(100, status.seekPercent)) + "%"});

        return instance;
    };

    var updatePlayBar = function(instance, percents) {
        if (instance.seekTime && !instance.isSeeking) {
            return instance;
        }

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

        updatePlayBar(instance, percent);
        showPreloader(instance);

        instance.waitForLoad = true;
        instance.$jPlayer.jPlayer("playHead", percent);
        instance.pseudoPlay();

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
                joueleInstance = $this.data("jouele");

            if (joueleInstance) {
                /* Update current instance (soon) */
            } else {
                /* Create new instance */
                new Jouele($this, $.extend({}, $.fn.jouele.defaults, options, $this.data()));
            }
        });
    };

    $.fn.jouele.defaults = {
        swfPath: "./jplayer/",
        swfFilename: "jplayer.swf",
        supplied: "mp3",
        volume: 1,
        length: 0,
        scrollOnSpace: false,
        pauseOnSpace: true,
        hideTimelineOnPause: false,
        skin: ""
    };

    function Jouele($link, options) {
        this.version = "2.0.0";
        this.$link = $link;
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
        this.init();
    }

    Jouele.prototype.init = function init() {
        this.checkOptions();
        this.createDOM();
        this.initPlayerPlugin();
        this.bindEvents();
        this.insertDOM();
    };

    Jouele.prototype.destroy = function destroy() {
        var uniqueID = this.$container.attr("id");

        this.$container.after(this.$link).remove();
        $(document).off("." + uniqueID);

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
        showPreloader(this, this.seekTime ? 50 : 500);

        this.isPlayed = true;

        if (typeof this.$jPlayer !== "undefined" && this.$jPlayer.jPlayer) {
            if (!this.isPlaying) {
                this.$jPlayer.jPlayer("play");
            }
        }

        return this;
    };

    Jouele.prototype.pseudoPlay = function pseudoPlay() {
        $(document).trigger("jouele-pause", this);
        this.isPlayed = true;
        this.$container.addClass("jouele-status-playing");
        this.$container.find(".jouele-control-button-icon_pause").removeClass("jouele-hidden");
        this.$container.find(".jouele-control-button-icon_play").addClass("jouele-hidden");
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
    };

    Jouele.prototype.checkOptions = function checkOptions() {
        if (!parseInt(this.options.length)) {
            this.options.length = 0;
        }
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
                            isSVGSupported ? '<svg class="jouele-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" enable-background="new 0 0 16 16"><g fill="#fff"><path opacity=".5" d="m4 7.7l3.8 3.7-3.8 2.1z"/><path opacity=".5" d="m.2 3.2l.6-.5 11 11.1-.5.5z"/><path opacity=".5" d="m4 5.3v-.8l8 4.5-2.7 1.5z"/></g><g class="jouele-svg-color"><path d="m4 6.7l3.8 3.7-3.8 2.1z"/><path d="m.2 2.2l.6-.5 11 11.1-.5.5z"/><path d="m4 4.3v-.8l8 4.5-2.7 1.5z"/></g></svg>' : ''
                        ),
                        $(document.createElement("a")).attr("href", self.$link.attr("href")).addClass("jouele-control-link jouele-hidden").append(
                            $(document.createElement("span")).addClass("jouele-control-button-icon jouele-control-button-icon_play jouele-hidden").html(
                                isSVGSupported ? '<svg class="jouele-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" enable-background="new 0 0 16 16"><path opacity=".5" class="jouele-svg-subcolor" d="m4 4.5l8 4.5-8 4.5z"/><path class="jouele-svg-color" d="m4 3.5l8 4.5-8 4.5z"/></svg>': ''
                            ),
                            $(document.createElement("span")).addClass("jouele-control-button-icon jouele-control-button-icon_pause jouele-hidden").html(
                                isSVGSupported ? '<svg class="jouele-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" enable-background="new 0 0 16 16"><path opacity=".5" class="jouele-svg-subcolor" d="m4 4.5l8 4.5-8 4.5z"/><path class="jouele-svg-color" d="m4 3.5l8 4.5-8 4.5z"/></svg>': ''
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
            .addClass("jouele" + (this.options.hideTimelineOnPause ? " jouele_timeline_hide" : "") + (this.options.skin ? " jouele_" + this.options.skin : ""))
            .attr("id", "jouele-ui-zone-" + (1000 + Math.round(Math.random() * 8999)))
            .append(
                $invisibleObject.addClass("jouele-invisible-object"),
                $infoArea.addClass("jouele-info-area").append(createInfoAreaDOM()),
                $progressArea.addClass("jouele-progress-area").append(createProgressAreaDOM())
            );

        return this;
    };

    Jouele.prototype.initPlayerPlugin = function initPlayerPlugin() {
        var self = this,
            $jPlayer = self.$container.find(".jouele-invisible-object");

        this.$jPlayer = $jPlayer.jPlayer({
            solution: "html,flash",
            preload: "metadata",
            errorAlerts: false,

            swfPath: self.options.swfPath + self.options.swfFilename,
            supplied: self.options.supplied,
            volume: self.options.volume,

            ready: function() {
                var audiofileLink = self.$link.attr("href"),
                    uniqueID = self.$container.attr("id");

                $jPlayer.jPlayer("setMedia", {
                    mp3: audiofileLink
                });

                self.$container.find(".jouele-hidden").removeClass("jouele-hidden");
                self.$container.find(".jouele-control-button-icon_unavailable").addClass("jouele-hidden");
                self.$container.find(".jouele-control-button-icon_pause").addClass("jouele-hidden");

                self.$container.find(".jouele-control-link").on("click", function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                });
                self.$container.find(".jouele-control-button-icon_play").on("click", function() {
                    self.waitForLoad = true;
                    self.pseudoPlay.call(self);
                    self.play.call(self);
                });
                self.$container.find(".jouele-control-button-icon_pause").on("click", function() {
                    self.pseudoPause.call(self);
                    self.pause.call(self);
                });

                self.$container.find(".jouele-mine").on("mousedown." + uniqueID, function(event) {
                    if (event.which !== 1) {
                        return false;
                    }

                    event.stopPropagation();
                    event.preventDefault();

                    self.isSeeking = true;

                    var $this = $(this),
                        clickPoint = ((event.pageX - $this.offset().left) / $this.width()) * 100;

                    $(document).off("mouseup." + uniqueID).one("mouseup." + uniqueID, function() {
                        self.isSeeking = false;
                        showPreloader(self);
                    });
                    $(document).off("mousemove." + uniqueID).on("mousemove." + uniqueID, function(event) {
                        event.stopPropagation();
                        event.preventDefault();

                        if (!self.isSeeking) {
                            return false;
                        }

                        var clickPoint = ((event.pageX - $this.offset().left) / $this.width()) * 100;

                        willSeekTo(self, clickPoint);
                    });

                    willSeekTo(self, clickPoint);
                });
            },
            pause: function() {
                self.onPause.call(self);
            },
            stop: function() {
                self.onStop.call(self);
            },
            play: function() {
                self.onPlay.call(self);
            },
            progress: function(event) {
                updateLoadBar(self, event.jPlayer.status);
                updateTimeDisplay(self, event.jPlayer.status.currentTime);
            },
            timeupdate: function(event) {
                updateLoadBar(self, event.jPlayer.status);
                updateTimeDisplay(self, event.jPlayer.status.currentTime);
                updatePlayBar(self, event.jPlayer.status.currentPercentAbsolute.toFixed(2));

                hidePreloader(self);

                if (self.waitForLoad) {
                    self.waitForLoad = false;
                    self.seekTime = 0;
                    self.play();
                    hidePreloader(self);
                }
            }
        });

        return this;
    };

    Jouele.prototype.insertDOM = function insertDOM() {
        this.$link.after(this.$container);
        this.$link.detach();

        return this;
    };

    Jouele.prototype.bindEvents = function bindEvents() {
        var self = this,
            uniqueID = self.$container.attr("id");

        $(document).on("jouele-pause." + uniqueID, function(event, triggeredJouele) {
            if (self !== triggeredJouele) {
                self.pause();
            }
        });

        $(document).on("keydown." + uniqueID, function(event) {
            if (event.keyCode === 32) {
                if (self.isPlaying && self.options.pauseOnSpace) {
                    if (!self.options.scrollOnSpace) {
                        event.stopPropagation();
                        event.preventDefault();
                    }

                    self.$jPlayer.jPlayer("pause");
                }
            }
        });

        return this;
    };

    /* It's time to know if SVG supported */
    setSVGSupport();

    /* Autoload Jouele */
    var autoLoadJouele = function() {
        $(".jouele").jouele();
    };
    $(autoLoadJouele);

}(jQuery));