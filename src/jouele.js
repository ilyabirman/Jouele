(function($) {

    "use strict";

    var formatTime = function(rawSeconds) {
        var seconds = Math.round(rawSeconds) % 60,
            minutes = ((Math.round(rawSeconds) - seconds) % 3600) / 60,
            hours = (Math.round(rawSeconds) - seconds - (minutes * 60)) / 3600;

        return (hours ? (hours + ":") : "") + ((hours && (minutes < 10)) ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
    };

    var showPreloader = function(instance) {
        instance.$container.find(".jouele-buffering").addClass("jouele-buffering_visible_true");

        return instance;
    };

    var hidePreloader = function(instance) {
        instance.$container.find(".jouele-buffering").removeClass("jouele-buffering_visible_true");

        return instance;
    };

    var updateLoadBar = function(instance, status) {
        if (instance.fullyLoaded && instance.totalTime) {
            return false;
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
        instance.$container.find(".jouele-play-lift").css("left", percents  + "%");
        instance.$container.find(".jouele-play-bar").css("width", percents + "%");

        return instance;
    };

    var updateTimeDisplay = function(instance, seconds) {
        if (instance.totalTime <= 0) {
            return false;
        }

        var playedTime = formatTime(seconds),
            totalTime = "";

        if (instance.fullyLoaded) {
            if (!instance.fullTimeDisplayed) {
                totalTime = formatTime(instance.totalTime);
                instance.$container.find(".jouele-total-time").text(totalTime);
                instance.fullTimeDisplayed = true;
            }
        } else {
            totalTime = "~ " + formatTime(instance.totalTime);
            instance.$container.find(".jouele-total-time").text(totalTime);
        }

        instance.$container.find(".jouele-play-time").text(playedTime);

        return instance;
    };

    var willSeekTo = function(instance, seekPercent) {
        var percent = seekPercent.toFixed(2);

        updatePlayBar(instance, percent);
        showPreloader(instance);

        instance.waitForLoad = true;
        instance.$jPlayer.jPlayer("playHead", percent);

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
        scrollOnSpace: false,
        pauseOnSpace: true
    };

    function Jouele($link, options) {
        this.$link = $link;
        this.options = options;
        this.isPlaying = false;
        this.totalTime = 0;
        this.fullyLoaded = false;
        this.fullTimeDisplayed = false;
        this.waitForLoad = false;
        this.init();
    }

    Jouele.prototype.init = function init() {
        this.createDOM();
        this.defineDeferred();
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
        if (typeof this.$jPlayer !== "undefined" && this.$jPlayer.jPlayer) {
            if (this.isPlaying) {
                this.$jPlayer.jPlayer("pause");
            }
        }

        return this;
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
        if (typeof this.$jPlayer !== "undefined" && this.$jPlayer.jPlayer) {
            if (!this.isPlaying) {
                this.$jPlayer.jPlayer("play");
            }
        }

        return this;
    };

    Jouele.prototype.onPause = function onPause() {
        this.isPlaying = false;
        this.$container.removeClass("jouele-status-playing");
    };

    Jouele.prototype.onStop = function onStop() {
        this.isPlaying = false;
        this.$container.removeClass("jouele-status-playing");
    };

    Jouele.prototype.onPlay = function onPlay() {
        $(document).trigger("jouele-stop", this);
        this.$container.addClass("jouele-status-playing");
        this.isPlaying = true;
    };

    Jouele.prototype.createDOM = function createDOM() {
        var $container = $(document.createElement("div")),
            $invisibleObject = $(document.createElement("div")),
            $infoArea = $(document.createElement("div")),
            $progressArea = $(document.createElement("div")),
            filename = this.$link.text();

        var createInfoAreaDOM = function() {
            return [
                $(document.createElement("a")).addClass("jouele-download jouele-hidden"),
                $(document.createElement("div")).addClass("jouele-play-control").append(
                    $(document.createElement("div")).addClass("jouele-unavailable jouele-to-hide"),
                    $(document.createElement("div")).addClass("jouele-play-pause jouele-hidden").append(
                        $(document.createElement("div")).addClass("jouele-play"),
                        $(document.createElement("div")).addClass("jouele-pause").css({"display": "none"})
                    )
                ),
                $(document.createElement("div")).addClass("jouele-time").append(
                    $(document.createElement("div")).addClass("jouele-play-time"),
                    $(document.createElement("div")).addClass("jouele-total-time")
                ),
                $(document.createElement("div")).addClass("jouele-name").html(filename)
            ];
        };

        var createProgressAreaDOM = function() {
            return $(document.createElement("div")).addClass("jouele-mine").append(
                $(document.createElement("div")).addClass("jouele-mine-bar"),
                $(document.createElement("div")).addClass("jouele-load-bar jouele-hidden"),
                $(document.createElement("div")).addClass("jouele-play-bar"),
                $(document.createElement("div")).addClass("jouele-play-lift jouele-hidden").append(
                    $(document.createElement("div")).addClass("jouele-buffering")
                )
            );
        };

        this.$container = $container
            .data("jouele", this)
            .addClass("jouele")
            .attr("id", "jouele-ui-zone-" + (1000 + Math.round(Math.random() * 8999)))
            .append(
                $invisibleObject.addClass("jouele-invisible-object"),
                $infoArea.addClass("jouele-info-area").append(createInfoAreaDOM()),
                $progressArea.addClass("jouele-progress-area").append(createProgressAreaDOM())
            );

        return this;
    };

    Jouele.prototype.defineDeferred = function defineDeferred() {
        var self = this;

        this.domReady = $.Deferred();
        this.playerReady = $.Deferred();

        $.when(this.domReady, this.playerReady).done(function() {
            delete self.domReady;
            delete self.playerReady;

            self.definePlayerSelectors();
            $(document).trigger("jouele-ready", this);
        });

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
                    uniqueID = self.$container.attr("id"),
                    isMouseDown = false;

                $jPlayer.jPlayer("setMedia", {
                    mp3: audiofileLink
                });

                self.$container.find(".jouele-download").attr("href", audiofileLink);
                self.$container.find(".jouele-hidden").show();
                self.$container.find(".jouele-to-hide").hide();

                self.$container.find(".jouele-mine").on("mousedown." + uniqueID, function(event) {
                    event.stopPropagation();
                    event.preventDefault();

                    var $this = $(this),
                        clickPoint = ((event.pageX - $this.offset().left) / $this.width()) * 100;

                    isMouseDown = true;

                    $(document).off("mouseup." + uniqueID).on("mouseup." + uniqueID, function() {
                        isMouseDown = false;
                    });
                    $(document).off("mousemove." + uniqueID).on("mousemove." + uniqueID, function(event) {
                        event.stopPropagation();
                        event.preventDefault();

                        if (!isMouseDown) {
                            return false;
                        }

                        var clickPoint = ((event.pageX - $this.offset().left) / $this.width()) * 100;

                        willSeekTo(self, clickPoint);
                    });

                    willSeekTo(self, clickPoint);
                });

                self.playerReady.resolve();
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

                if (self.waitForLoad) {
                    self.waitForLoad = false;
                    self.$jPlayer.jPlayer("play");
                    hidePreloader(self);
                }
            }
        });

        return this;
    };

    Jouele.prototype.insertDOM = function insertDOM() {
        this.$link.after(this.$container);
        this.$link.detach();

        this.domReady.resolve();

        return this;
    };

    Jouele.prototype.definePlayerSelectors = function definePlayerSelectors() {
        this.$jPlayer.jPlayer("option", "cssSelectorAncestor", "#" + this.$container.attr("id"));
        this.$jPlayer.jPlayer("option", "cssSelector", {
            play: ".jouele-play",
            pause: ".jouele-pause"
        });

        return this;
    };

    Jouele.prototype.bindEvents = function bindEvents() {
        var self = this,
            uniqueID = self.$container.attr("id");

        $(document).on("jouele-stop." + uniqueID, function() {
            if (self.isPlaying) {
                self.$jPlayer.jPlayer("pause");
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


    /* Autoload Jouele */
    var autoLoadJouele = function() {
        $(".jouele").jouele();
    };
    $(autoLoadJouele);

}(jQuery));