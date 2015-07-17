(function($) {

    "use strict";

    var formatTime = function (rawSeconds) {
        var seconds = Math.round(rawSeconds) % 60,
            minutes = ((Math.round(rawSeconds) - seconds) % 3600) / 60,
            hours = (Math.round(rawSeconds) - seconds - (minutes * 60)) / 3600;

        return (hours ? (hours + ":") : "") + ((hours && (minutes < 10)) ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
    };

    var updateLoadBar = function(instance, seekPercent) {
        instance.seekable = seekPercent;
        instance.$container.find(".jouele-load-bar").css({"width": Math.floor(Math.min(100, seekPercent)) + "%"});
    };

    var updatePlayBar = function(instance, percents) {
        instance.$container.find(".jouele-play-lift").css("left", percents  + "%");
        instance.$container.find(".jouele-play-bar").css("width", percents + "%");
    };

    var updateTimeDisplay = function(instance, seconds) {
        var playedTime = "",
            totalTime = "";

        if (!instance.everPlayed) {
            return false;
        }

        if (seconds >= 0) {
            playedTime = formatTime(seconds);
        }

        if (instance.totalTime > 0) {
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
        }

        instance.$container.find(".jouele-play-time").text(playedTime);
    };

    var willSeekTo = function(instance, seekPercent) {
        var seekPercent = seekPercent.toFixed(2);

        updatePlayBar(instance, seekPercent);

        instance.$jPlayer.jPlayer("play").jPlayer("playHead", seekPercent);
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
        volume: 1
    };

    function Jouele($link, options) {
        this.$link = $link;
        this.options = options;
        this.isPlaying = false;
        this.everPlayed = false;
        this.seekable = 0;
        this.totalTime = 0;
        this.fullyLoaded = false;
        this.fullTimeDisplayed = false;
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
        this.everPlayed = true;
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
                    $(document.createElement("div")).addClass("jouele-buffering jouele-hidden")
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
                updateLoadBar(self, event.jPlayer.status.seekPercent);
            },
            timeupdate: function(event) {
                updateLoadBar(self, event.jPlayer.status.seekPercent);

                var percents = event.jPlayer.status.currentPercentAbsolute.toFixed(2);

                if (event.jPlayer.status.seekPercent >= 100) {
                    self.fullyLoaded = true;
                    self.totalTime = event.jPlayer.status.duration;
                } else if (event.jPlayer.status.seekPercent > 0) {
                    self.totalTime = event.jPlayer.status.duration;
                } else {
                    self.totalTime = 0;
                }

                updatePlayBar(self, percents);
                updateTimeDisplay(self, event.jPlayer.status.currentTime);
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

        return this;
    };


    /* Autoload Jouele */
    var autoLoadJouele = function() {
        $(".jouele").jouele();
    };
    $(autoLoadJouele);

}(jQuery));