(function($) {

    "use strict";

    var updateLoadBar = function ($container, seekPercent) {
        $container.find(".jouele-load-bar").css({"width": Math.floor(Math.min(100, seekPercent)) + "%"});
    };

    $.fn.jouele = function(options) {
        return this.each(function() {
            var $this = $(this),
                joueleInstance = $this.data("jouele");

            if (joueleInstance) {
                // update current instance
            } else {
                // create new instance
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
        //destroy Jouele, return link to DOM
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
                var audiofileLink = self.$link.attr("href");

                $jPlayer.jPlayer("setMedia", {
                    mp3: audiofileLink
                });

                self.$container.find(".jouele-download").attr("href", audiofileLink);
                self.$container.find(".jouele-hidden").show();
                self.$container.find(".jouele-to-hide").hide();

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
                updateLoadBar(self.$container, event.jPlayer.status.seekPercent);
            },
            timeupdate: function(event) {
                updateLoadBar(self.$container, event.jPlayer.status.seekPercent);
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
        var self = this;

        $(document).on("jouele-stop", function() {
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