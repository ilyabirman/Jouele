(function($) {

    "use strict";

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
        if (instance.preloaderTimeout || instance.isMouseMovingOverPlayBar) {
            return instance;
        }

        var preloader_timeout = timeout || 50; // 50 is default timeout which is almost not visible for user ('instant preloader') but enough to making script works

        instance.preloaderTimeout = setTimeout(function() {
            if (instance.isMouseMovingOverPlayBar) {
                instance.preloaderTimeout = null;
                return instance;
            }
            instance.$container.find(".jouele-play-lift").addClass("jouele-play-lift_buffering");
        }, preloader_timeout);

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

    var updateLoadBar = function(instance) {
        if (instance.totalTime) {
            return instance;
        }

        instance.$container.find(".jouele-load-bar").css({"width": "100%"});

        return instance;
    };

    var updatePlayBar = function(instance) {
        var position = instance.mouseOverPlayBarPosition ? instance.mouseOverPlayBarPosition : ((instance.seekTime ? instance.seekTime : instance.howler.seek()) / (instance.totalTime / 100)).toFixed(2);
        
        instance.$container.find(".jouele-play-lift").css("left", position  + "%");
        instance.$container.find(".jouele-play-bar").css("width", position + "%");

        return instance;
    };

    var updateTimeDisplay = function(instance) {
        var totalTime = "";
        var custom_time = 0;
        var custom_percent = instance.mouseOverPlayBarPosition ? instance.mouseOverPlayBarPosition : 0;

        if (instance.totalTime) {
            totalTime = formatTime(instance.totalTime);
            custom_time = instance.totalTime * (custom_percent / 100);
            instance.$container.find(".jouele-total-time").html(totalTime);
        } else if (instance.options.length) {
            totalTime = formatTime(makeSeconds(instance.options.length));
            custom_time = instance.options.length * (custom_percent / 100);
            instance.$container.find(".jouele-total-time").html(totalTime);
        } else {
            instance.$container.find(".jouele-total-time").html("...");
        }

        if (custom_time) {
            instance.$container.find(".jouele-play-time").html(formatTime(custom_time));
        } else if (instance.isPlaying || instance.seekTime) {
            instance.$container.find(".jouele-play-time").html(formatTime(makeSeconds(instance.seekTime ? instance.seekTime : instance.howler.seek())));
        } else {
            instance.$container.find(".jouele-play-time").html(formatTime(0));
        }

        return instance;
    };
    
    var updateState = function(instance) {
        updateTimeDisplay(instance);
        updatePlayBar(instance);
    };

    $.fn.jouele = function(options) {
        return this.each(function() {
            var $this = $(this);
            
            var thisClass = $this.attr("class");
            var skinClassPosition = thisClass ? thisClass.indexOf("jouele-skin-") : -1;
            var joueleInstance = $this.data("jouele");
            var skin = "";

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
        
        this.$link = $link;
        this.$playlist = null;
        this.playlist = null;
        this.isPlaying = false;
        this.isPlayed = false;
        this.totalTime = null;

        this.$container = null;
        this.joueleID = null;
        this.href = href;
        this.options = options;
        this.howler = null;
        this.timer = null;
        this.seekTime = null;
        this.seekPosition = null;
        this.preloaderTimeout = null;
        this.isMouseMovingOverPlayBar = false;
        this.mouseOverPlayBarPosition = null;

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
        this.bindEvents();
        this.checkGlobalOptions();
        this.insertDOM();
    };

    Jouele.prototype.destroy = function destroy() {
        var self = this;
        var joueleID = this.joueleID;

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
        $(document).off("." + joueleID);

        this.$link.removeData("jouele");
        
        this.howler.unload();
        this.howler = null;

        return this.$link;
    };

    Jouele.prototype.pause = function pause() {
        hidePreloader(this);

        this.pseudoPause();

        this.isPlaying = false;
        this.isMouseMovingOverPlayBar = false;

        if (this.howler) {
            this.howler.pause();
        }

        return this;
    };

    Jouele.prototype.pseudoPause = function pseudoPause() {
        this.$container.removeClass("jouele-status-playing");
        this.$container.find(".jouele-control-button-icon_play").removeClass("jouele-hidden");
        this.$container.find(".jouele-control-button-icon_pause").addClass("jouele-hidden");
    };

    Jouele.prototype.onPause = function onPause() {
        var self = this;

        clearInterval(self.timer);
        this.timer = null;

        this.isPlaying = false;
        this.isMouseMovingOverPlayBar = false;
        this.seekTime = null;
        this.seekPosition = null;

        this.$container.removeClass("jouele-status-playing");
        this.$container.find(".jouele-control-button-icon_play").removeClass("jouele-hidden");
        this.$container.find(".jouele-control-button-icon_pause").addClass("jouele-hidden");
    };

    Jouele.prototype.play = function play() {
        var self = this;
        
        self.pseudoPlay();
        
        if (!self.howler) {
            self.createHowler.call(self);
        }

        if ($.Jouele.lastPlayed !== self) {
            if ($.Jouele.lastPlayed) {
                $.Jouele.lastPlayed.pause();
            }
            
            $.Jouele.lastPlayed = self;
            self.howler.play();
        } else {
            self.howler.play();
        }
        
        showPreloader(self, self.seekTime ? false : 500); // 500 is enough to play the loaded fragment, if it's loaded; if isn't — preloader will appear after 500ms

        return self;
    };

    Jouele.prototype.pseudoPlay = function pseudoPlay() {
        this.$container.addClass("jouele-status-playing");
        this.$container.find(".jouele-control-button-icon_pause").removeClass("jouele-hidden");
        this.$container.find(".jouele-control-button-icon_play").addClass("jouele-hidden");
    };

    Jouele.prototype.onPlay = function onPlay() {
        var self = this;
        
        this.$container.addClass("jouele-status-playing");
        this.$container.find(".jouele-control-button-icon_pause").removeClass("jouele-hidden");
        this.$container.find(".jouele-control-button-icon_play").addClass("jouele-hidden");
        
        this.isPlaying = true;
        this.isPlayed = true;
        this.seekTime = null;
        this.seekPosition = null;

        updateState(this);
        hidePreloader(this);
        
        var nearest_second = (Math.ceil(self.howler.seek()) - self.howler.seek()).toFixed(3);
        setTimeout(function() {
            updateState(self);

            if (self.timer) {
                clearInterval(self.timer);
            }
            self.timer = setInterval(function() {
                updateState(self);
            }, 1000);
        }, nearest_second * 1000);

        $.Jouele.lastPlayed = this;
    };
    
    Jouele.prototype.seek = function seek(seekPositionPercent) {
        if (!this.howler) {
            this.createHowler.call(this);
        }
        
        showPreloader(this);

        if (this.totalTime) {
            this.seekTime = (this.totalTime * (seekPositionPercent / 100)).toFixed(2);
            this.howler.seek(this.seekTime);
        } else {
            this.seekPosition = seekPositionPercent;
        }

        updateTimeDisplay(this);
        updatePlayBar(this);

        return this;
    };

    Jouele.prototype.onSeek = function onSeek() {
        var self = this;

        if (this.timer) {
            clearInterval(this.timer);
        }

        updateState(this);

        var nearest_second = (Math.ceil(this.howler.seek()) - this.howler.seek()).toFixed(3);
        setTimeout(function() {
            updateState(self);
            
            self.timer = setInterval(function() {
                updateState(self);
            }, 1000);
        }, nearest_second * 1000);
        
        if (this.isPlaying) {
            this.seekTime = null;
            this.seekPosition = null;
        }
    };
    
    Jouele.prototype.playNext = function playNext() {
        var self = this;

        if (self.$playlist.length === 0) {
            return false;
        }

        for (var i = 0; i < self.playlist.length; i++) {
            if (self.playlist[i] === self) {
                break;
            }
        }

        if (typeof self.playlist[i + 1] !== "undefined") {
            self.playlist[i + 1].play();
        } else {
            if (self.$playlist.data("repeat")) {
                self.playlist[0].play();
            }
        }
    };

    Jouele.prototype.checkOptions = function checkOptions() {
        if (!parseInt(this.options.length)) {
            this.options.length = 0;
        } else {
            this.totalTime = makeSeconds(this.options.length);
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
        var self = this;
        
        var $container = $(document.createElement("div"));
        var $infoArea = $(document.createElement("div"));
        var $progressArea = $(document.createElement("div"));
        var filename = this.$link.text();

        var createInfoAreaDOM = function() {
            return [
                $(document.createElement("div")).addClass("jouele-time").append(
                    $(document.createElement("div")).addClass("jouele-play-time").text(self.options.length ? "0:00" : ""),
                    $(document.createElement("div")).addClass("jouele-total-time").text(self.options.length ? formatTime(makeSeconds(self.options.length)) : "")
                ),
                $(document.createElement("div")).addClass("jouele-control").append(
                    $(document.createElement("div")).addClass("jouele-control-button").append(
                        $(document.createElement("span")).addClass("jouele-control-button-icon jouele-control-button-icon_unavailable").html(
                            '<svg class="jouele-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" enable-background="new 0 0 16 16"><g class="jouele-svg-color"><path d="m4 6.7l3.8 3.7-3.8 2.1z"/><path d="m.2 2.2l.6-.5 11 11.1-.5.5z"/><path d="m4 4.3v-.8l8 4.5-2.7 1.5z"/></g></svg>'
                        ),
                        $(document.createElement("a")).attr("href", self.href).addClass("jouele-control-link jouele-hidden").append(
                            $(document.createElement("span")).addClass("jouele-control-button-icon jouele-control-button-icon_play jouele-hidden").html(
                                '<svg class="jouele-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" enable-background="new 0 0 16 16"><path class="jouele-svg-color" d="m4 3.5l8 4.5-8 4.5z"/></svg>'
                            ),
                            $(document.createElement("span")).addClass("jouele-control-button-icon jouele-control-button-icon_pause jouele-hidden").html(
                                '<svg class="jouele-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" enable-background="new 0 0 16 16"><path class="jouele-svg-color" d="m4 3.5l8 4.5-8 4.5z"/></svg>'
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

    Jouele.prototype.bindEvents = function bindEvents() {
        var self = this;
        var joueleID = self.joueleID;

        this.$container.find(".jouele-hidden").removeClass("jouele-hidden");
        this.$container.find(".jouele-control-button-icon_unavailable").addClass("jouele-hidden");
        this.$container.find(".jouele-control-button-icon_pause").addClass("jouele-hidden");

        this.$container.find(".jouele-control-link").off("click.jouele").on("click.jouele", function(event) {
            event.preventDefault();
            event.stopPropagation();
        });
        this.$container.find(".jouele-control-button-icon_play").off("click.jouele").on("click.jouele", function() {
            self.pseudoPlay.call(self);
            self.play.call(self);
        });
        this.$container.find(".jouele-control-button-icon_pause").off("click.jouele").on("click.jouele", function() {
            self.pseudoPause.call(self);
            self.pause.call(self);
        });

        this.$container.find(".jouele-mine").off("mousedown." + joueleID).on("mousedown." + joueleID, function(event) {
            if (event.which !== 1) {
                return false;
            }

            event.stopPropagation();
            event.preventDefault();

            var $this = $(this);

            self.isMouseMovingOverPlayBar = true;

            function getEventPoint(event) {
                var event_point = ((event.pageX - $this.offset().left) / $this.width()) * 100;
                self.mouseOverPlayBarPosition = event_point;
                return event_point;
            }

            $(document).off("mouseup." + joueleID).one("mouseup." + joueleID, function(event) {
                $(document).off("mousemove." + joueleID);
                self.isMouseMovingOverPlayBar = false;

                self.seek.call(self, getEventPoint(event));
                if (!self.isPlaying) {
                    self.play.call(self);
                }

                self.mouseOverPlayBarPosition = null;
            });
            $(document).off("mousemove." + joueleID).on("mousemove." + joueleID, function(event) {
                event.stopPropagation();
                event.preventDefault();

                if (!self.isMouseMovingOverPlayBar) {
                    return false;
                }

                getEventPoint(event);

                updateTimeDisplay(self);
                updatePlayBar(self);
            });

            if (!self.howler) {
                self.createHowler.call(self);
            }

            getEventPoint(event);

            updateTimeDisplay(self);
            updatePlayBar(self);
        });

        $(document).on("jouele-pause." + joueleID, function(event, triggeredJouele) {
            if (self !== triggeredJouele) {
                self.pause();
            }
        });

        return this;
    };

    Jouele.prototype.insertDOM = function insertDOM() {
        this.$link.after(this.$container);
        this.$link.data("jouele", this);
        this.$link.detach();

        return this;
    };
    
    Jouele.prototype.createHowler = function createHowler() {
        var self = this;
        
        this.howler = new Howl({
            src: [self.href],
            html5: true,
            onload: function() {
                self.totalTime = this.duration();

                if (self.seekPosition) {
                    self.seek.call(self, self.seekPosition);
                }

                updateTimeDisplay(self);
                updateLoadBar(self);
            },
            onplay: function() {
                self.onPlay.call(self);
            },
            onend: function() {
                self.mouseOverPlayBarPosition = 100;
                updateTimeDisplay(self);
                updatePlayBar(self);
                self.mouseOverPlayBarPosition = null;

                self.playNext.call(self);
            },
            onpause: function() {
                self.onPause.call(self);
            },
            onseek: function() {
                self.onSeek.call(self);
            }
        });
        
        updateTimeDisplay(this);
    };

    $.Jouele = {
        playlist: [],
        lastPlayed: null,
        options: {
            pauseOnSpace: false,
            playOnSpace: false,
            scrollOnSpace: true
        },
        version: "2.3.0"
    };

    /* Autoload Jouele */
    var autoLoadJouele = function() {
        function handleSpaceKeydown(event) {
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
        }
        $(document).on("keydown.jouele", handleSpaceKeydown);
        
        $("a.jouele[href]").jouele();
    };
    $(autoLoadJouele);

}(jQuery));
