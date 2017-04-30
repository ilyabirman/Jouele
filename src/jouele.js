(function($) {

    "use strict";
    
    var isMobile = (function(a){return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))})(navigator.userAgent||navigator.vendor||window.opera);

    var formatTime = function(rawSeconds) {
        if (typeof rawSeconds !== "number") {
            return rawSeconds;
        }

        var seconds = Math.round(rawSeconds) % 60;
        var minutes = ((Math.round(rawSeconds) - seconds) % 3600) / 60;
        var hours = (Math.round(rawSeconds) - seconds - (minutes * 60)) / 3600;

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
            instance.$container.find(".jouele-progress-line-lift").addClass("jouele-progress-line-lift_buffering");
        }, preloader_timeout);

        return instance;
    };

    var hidePreloader = function(instance) {
        if (!instance.preloaderTimeout) {
            return instance;
        }

        clearTimeout(instance.preloaderTimeout);
        instance.preloaderTimeout = null;
        
        instance.$container.find(".jouele-progress-line-lift").removeClass("jouele-progress-line-lift_buffering");

        return instance;
    };

    var updateLoadBar = function(instance) {
        if (instance.totalTime) {
            return instance;
        }

        instance.$container.find(".jouele-progress-line-bar_load").css({"width": "100%"});

        return instance;
    };

    var updatePlayBar = function(instance) {
        var position = (instance.mouseOverPlayBarPosition != null) ? instance.mouseOverPlayBarPosition : ((instance.seekTime ? instance.seekTime : instance.howler.seek()) / (instance.totalTime / 100)).toFixed(2);
        
        instance.$container.find(".jouele-progress-line-lift").css("left", position  + "%");
        instance.$container.find(".jouele-progress-line-bar_play").css("width", position + "%");

        return instance;
    };

    var updateTimeDisplay = function(instance) {
        var totalTime = "";
        var custom_time = null;

        if (instance.totalTime) {
            totalTime = formatTime(instance.totalTime);
            custom_time = (instance.mouseOverPlayBarPosition != null) ? instance.totalTime * (instance.mouseOverPlayBarPosition / 100) : null;
            instance.$container.find(".jouele-info-time__total").html(totalTime);
        } else if (instance.options.length) {
            totalTime = formatTime(makeSeconds(instance.options.length));
            custom_time = (instance.mouseOverPlayBarPosition != null) ?  instance.options.length * (instance.mouseOverPlayBarPosition / 100) : null;
            instance.$container.find(".jouele-info-time__total").html(totalTime);
        } else {
            instance.$container.find(".jouele-info-time__total").html("...");
        }

        if (custom_time != null) {
            instance.$container.find(".jouele-info-time__current").html(formatTime(custom_time));
        } else if (instance.isPlaying || instance.seekTime) {
            instance.$container.find(".jouele-info-time__current").html(formatTime(makeSeconds(instance.seekTime ? instance.seekTime : (instance.howler != null ? ((instance.howler.state() !== "unloaded" && typeof instance.howler.seek() === "number") ? instance.howler.seek() : 0) : 0))));
        } else {
            instance.$container.find(".jouele-info-time__current").html(formatTime(makeSeconds(instance.howler != null ? ((instance.howler.state() !== "unloaded" && typeof instance.howler.seek() === "number") ? instance.howler.seek() : 0) : 0)));
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
        repeat: false,
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
        this.isPaused = false;
        this.isLoaded = false;
        this.isStarted = false;

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
        
        return this;
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
        
        if (this.howler) {
            this.howler.unload();
            this.howler = null;
        }

        return this.$link;
    };
    
    Jouele.prototype.breakPlayer = function breakPlayer() {
        var joueleID = this.joueleID;
        
        this.$container.addClass("jouele_broken");
        this.$container.find(".jouele-info-control-button-icon_unavailable").removeClass("jouele-hidden");
        this.$container.find(".jouele-info-control-link").addClass("jouele-hidden");
        this.$container.find(".jouele-progress-line-lift").addClass("jouele-hidden");

        this.$container.find(".jouele-info-control-link").off("click.jouele");
        this.$container.find(".jouele-info-control-button-icon_play").off("click.jouele");
        this.$container.find(".jouele-info-control-button-icon_pause").off("click.jouele");
        this.$container.find(".jouele-progress-line").off("mousedown." + joueleID);
        $(document).off("mouseup." + joueleID);
        $(document).off("mousemove." + joueleID);
        $(document).off("jouele-pause." + joueleID);
        
        return this;
    };

    Jouele.prototype.pause = function pause() {
        if (!this.howler || this.isPaused) {
            return this;
        }
        
        hidePreloader(this);

        this.makeInterfacePause();
        
        this.isMouseMovingOverPlayBar = false;

        if (this.howler && this.isLoaded) {
            this.howler.pause();
        }

        return this;
    };

    Jouele.prototype.makeInterfacePause = function makeInterfacePause() {
        this.isPaused = true;
        this.isPlaying = false;
        
        this.$container.removeClass("jouele-status-playing");
        this.$container.find(".jouele-info-control-button-icon_play").removeClass("jouele-hidden");
        this.$container.find(".jouele-info-control-button-icon_pause").addClass("jouele-hidden");
        
        return this;
    };

    Jouele.prototype.onPause = function onPause() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        this.makeInterfacePause();
        
        this.isMouseMovingOverPlayBar = false;
        this.seekTime = null;
        this.seekPosition = null;
        
        return this;
    };

    Jouele.prototype.play = function play() {
        var self = this;
        
        if (!this.howler) {
            this.createHowler.call(this);
        }
        
        if (this.isPlaying) {
            return this;
        }
        
        this.makeInterfacePlay();

        $(document).trigger("jouele-pause", this);

        if ($.Jouele.lastPlayed !== this) {
            if ($.Jouele.lastPlayed) {
                if (!$.Jouele.lastPlayed.isPaused) {
                    $.Jouele.lastPlayed.pause();
                }
            }

            $.Jouele.lastPlayed = this;
            
            if (this.isLoaded) {
                this.howler.play();
            } else {
                if (!this.isStarted) {
                    this.howler.load();
                }
            }
        } else {
            if (this.isLoaded) {
                this.howler.play();
            }
        }
        
        this.isStarted = true;
        
        showPreloader(this);
        
        if (self.howler._sounds.length < 1) {
            return this;
        }

        var nearest_second = (Math.ceil(self.howler.seek()) - self.howler.seek()).toFixed(3);
        setTimeout(function() {
            updateState(self);

            if (self.timer) {
                clearInterval(self.timer);
            }

            if (!self.isPaused) {
                self.timer = setInterval(function() {
                    updateState(self);
                }, 1000);
            }
        }, nearest_second * 1000);

        return this;
    };

    Jouele.prototype.makeInterfacePlay = function makeInterfacePlay() {
        this.isPaused = false;
        
        this.$container.addClass("jouele-status-playing");
        this.$container.find(".jouele-info-control-button-icon_pause").removeClass("jouele-hidden");
        this.$container.find(".jouele-info-control-button-icon_play").addClass("jouele-hidden");
        
        return this;
    };

    Jouele.prototype.onPlay = function onPlay() {
        var self = this;

        $(document).trigger("jouele-pause", this);
        
        this.makeInterfacePlay();
        
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
            
            if (!self.isPaused) {
                self.timer = setInterval(function () {
                    updateState(self);
                }, 1000);
            }
        }, nearest_second * 1000);

        $.Jouele.lastPlayed = this;
        
        return this;
    };
    
    Jouele.prototype.seek = function seek(seekPositionPercent) {
        var self = this;
        
        this.makeInterfacePlay();

        $(document).trigger("jouele-pause", this);
        
        if (!this.howler) {
            this.createHowler.call(this);
        }

        if (this.totalTime) {
            if (typeof seekPositionPercent === "number") {
                this.seekTime = +((this.totalTime * (seekPositionPercent / 100)).toFixed(2));
                this.seekPosition = +seekPositionPercent;
            }
            
            if (this.isLoaded) {
                showPreloader(this, 200);
                this.howler.seek(this.seekTime);
            } else {
                if (!this.isStarted) {
                    this.howler.load();
                }
                showPreloader(this);
            }
        } else {
            this.seekPosition = +seekPositionPercent;
            if (!this.isStarted) {
                this.howler.load();
            }
            showPreloader(this);
        }

        if ($.Jouele.lastPlayed !== this) {
            if ($.Jouele.lastPlayed) {
                if (!$.Jouele.lastPlayed.isPaused) {
                    $.Jouele.lastPlayed.pause();
                }
            }

            $.Jouele.lastPlayed = this;
        }
        
        this.isStarted = true;
        
        if (this.isLoaded) {
            var current_time = this.howler.seek();
            var interval;

            setTimeout(function() {
                if (current_time === self.howler.seek()) {
                    showPreloader(self);
                }
                interval = setInterval(function() {
                    if (current_time !== self.howler.seek()) {
                        hidePreloader(self);
                        clearTimeout(interval);
                    }
                }, 50);
            }, 100);

            updateState(this);
        }

        return this;
    };

    Jouele.prototype.onSeek = function onSeek() {
        var self = this;

        if (this.seekTime && (this.howler.seek() !== this.seekTime) && (this.seekPosition !== 100)) {
            this.seek();
            return false;
        }
        if (this.isPaused) {
            return false;
        }

        if (this.timer) {
            clearInterval(this.timer);
        }

        updateState(this);

        var nearest_second = (Math.ceil(this.howler.seek()) - this.howler.seek()).toFixed(3);
        setTimeout(function() {
            updateState(self);

            if (self.timer) {
                clearInterval(self.timer);
            }
            
            if (!self.isPaused) {
                self.timer = setInterval(function() {
                    updateState(self);
                }, 1000);
            }
        }, nearest_second * 1000);

        this.seekTime = null;
        this.seekPosition = null;

        if ($.Jouele.lastPlayed === this && (!this.isPlaying || !this.isStarted)) {
            this.play.call(this);
        }
        
        return this;
    };
    
    Jouele.prototype.onEnd = function onEnd() {
        clearInterval(this.timer);
        this.timer = null;

        this.mouseOverPlayBarPosition = 100;
        updateState(this);

        this.makeInterfacePause();
        
        this.mouseOverPlayBarPosition = null;
        this.isMouseMovingOverPlayBar = false;
        this.seekTime = null;
        this.seekPosition = null;

        this.playNext();
        
        return this;
    };
    
    Jouele.prototype.onLoad = function onLoad() {
        this.isLoaded = true;
        this.totalTime = this.howler.duration();
        
        if (!this.isMouseMovingOverPlayBar) {
            if (this.seekTime) {
                this.howler.seek(this.seekTime);
            } else {
                if (this.seekPosition > 0) {
                    if (this.isPaused) {
                        this.seekTime = +((this.totalTime * (this.seekPosition / 100)).toFixed(2));
                        this.howler.seek(this.seekTime);
                    } else {
                        this.seek(this.seekPosition);
                    }
                } else {
                    if (!this.isPaused) {
                        this.play();
                    }
                }
            }
        }

        updateState(this);
        updateLoadBar(this);
        
        return this;
    };
    
    Jouele.prototype.playFrom = function playFrom(time) {
        var self = this;

        this.makeInterfacePlay();

        $(document).trigger("jouele-pause", this);

        if (!this.howler) {
            this.createHowler.call(this);
        }
        
        if (time) {
            this.seekTime = makeSeconds(time);
        } else {
            return this;
        }

        if (this.totalTime) {
            if (this.isLoaded) {
                showPreloader(this, 200);
                this.howler.seek(this.seekTime);
            } else {
                if (!this.isStarted) {
                    this.howler.load();
                }
                showPreloader(this, 0);
            }

            var position = (this.mouseOverPlayBarPosition != null) ? this.mouseOverPlayBarPosition : ((this.seekTime ? this.seekTime : this.howler.seek()) / (this.totalTime / 100)).toFixed(2);
            this.$container.find(".jouele-progress-line-lift").css("left", position  + "%");
            this.$container.find(".jouele-progress-line-bar_play").css("width", position + "%");
        } else {
            if (!this.isStarted) {
                this.howler.load();
            }
            showPreloader(this);
        }

        if ($.Jouele.lastPlayed !== this) {
            if ($.Jouele.lastPlayed) {
                if (!$.Jouele.lastPlayed.isPaused) {
                    $.Jouele.lastPlayed.pause();
                }
            }

            $.Jouele.lastPlayed = this;
        }

        if (this.isLoaded) {
            var current_time = this.howler.seek();
            var interval;

            setTimeout(function() {
                if (current_time === self.howler.seek()) {
                    showPreloader(self);
                }
                interval = setInterval(function() {
                    if (current_time !== self.howler.seek()) {
                        hidePreloader(self);
                        clearTimeout(interval);
                    }
                }, 50);
            }, 100);

            updateState(this);
        }

        this.isStarted = true;
    };
    
    Jouele.prototype.playNext = function playNext() {
        if (this.options.repeat) {
            this.seek(0);
        }

        if (isMobile) {
            /* Mobile suspends JS background execution so we can't play next track */
            return this;
        }
        
        if (this.$playlist.length === 0) {
            return this;
        }

        for (var i = 0; i < this.playlist.length; i++) {
            if (this.playlist[i] === this) {
                break;
            }
        }
        if (typeof this.playlist[i + 1] !== "undefined") {
            this.playlist[i + 1].play();
        } else {
            if (this.$playlist.data("repeat")) {
                this.playlist[0].play();
            }
        }
        
        return this;
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
                $(document.createElement("div")).addClass("jouele-info-time").append(
                    $(document.createElement("div")).addClass("jouele-info-time__current").text(self.options.length ? "0:00" : ""),
                    $(document.createElement("div")).addClass("jouele-info-time__total").text(self.options.length ? formatTime(makeSeconds(self.options.length)) : "")
                ),
                $(document.createElement("div")).addClass("jouele-info-control").append(
                    $(document.createElement("div")).addClass("jouele-info-control-button").append(
                        $(document.createElement("span")).addClass("jouele-info-control-button-icon jouele-info-control-button-icon_unavailable").html(
                            '<svg class="jouele-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" enable-background="new 0 0 16 16"><g class="jouele-svg-color"><path d="m4 6.7l3.8 3.7-3.8 2.1z"/><path d="m.2 2.2l.6-.5 11 11.1-.5.5z"/><path d="m4 4.3v-.8l8 4.5-2.7 1.5z"/></g></svg>'
                        ),
                        $(document.createElement("a")).attr("href", self.href).addClass("jouele-info-control-link jouele-hidden").append(
                            $(document.createElement("span")).addClass("jouele-info-control-button-icon jouele-info-control-button-icon_play jouele-hidden").html(
                                '<svg class="jouele-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" enable-background="new 0 0 16 16"><path class="jouele-svg-color" d="m4 3.5l8 4.5-8 4.5z"/></svg>'
                            ),
                            $(document.createElement("span")).addClass("jouele-info-control-button-icon jouele-info-control-button-icon_pause jouele-hidden").html(
                                '<svg class="jouele-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" enable-background="new 0 0 16 16"><path class="jouele-svg-color" d="m4 3.5l8 4.5-8 4.5z"/></svg>'
                            )
                        )
                    ),
                    $(document.createElement("div")).addClass("jouele-info-control-text").html(filename)
                )
            ];
        };

        var createProgressAreaDOM = function() {
            return $(document.createElement("div")).addClass("jouele-progress-line").append(
                $(document.createElement("div")).addClass("jouele-progress-line-bar_base"),
                $(document.createElement("div")).addClass("jouele-progress-line-bar_load jouele-hidden"),
                $(document.createElement("div")).addClass("jouele-progress-line-bar_play"),
                $(document.createElement("div")).addClass("jouele-progress-line-lift jouele-hidden").append()
            );
        };

        this.$container = $container
            .data("jouele", this)
            .addClass("jouele jouele_inited" + (this.$link.data("first") === true ? " jouele_first" : "") + (this.options.hideTimelineOnPause ? " jouele_timeline_hide" : "") + (this.options.skin ? " jouele-skin-" + this.options.skin : ""))
            .append(
                $infoArea.addClass("jouele-info").append(createInfoAreaDOM()),
                $progressArea.addClass("jouele-progress").append(createProgressAreaDOM())
            );

        this.joueleID = "jouele-" + (1000 + Math.round(Math.random() * 99999));
        this.$playlist = this.$link.parents(".jouele-playlist").eq(0);

        return this;
    };

    Jouele.prototype.pushToPlaylist = function pushToPlaylist() {
        var self = this;
        var index_of_playlist;

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
            var $jouele_links = self.$playlist.find(".jouele").filter("[href]");
            var $jouele_inited = self.$playlist.find(".jouele_inited");
            var index_of_position_in_playlist;
            var previous_inited_jouele;
            var index_of_previous_jouele;

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

        this.$container.find(".jouele-info-control-link").off("click.jouele").on("click.jouele", function(event) {
            event.preventDefault();
            event.stopPropagation();
        });
        this.$container.find(".jouele-info-control-button-icon_play").off("click.jouele").on("click.jouele", function() {
            self.play.call(self);
        });
        this.$container.find(".jouele-info-control-button-icon_pause").off("click.jouele").on("click.jouele", function() {
            self.pause.call(self);
        });

        this.$container.find(".jouele-progress-line").off("mousedown." + joueleID).on("mousedown." + joueleID, function(event) {
            if (event.which !== 1) {
                return false;
            }

            event.stopPropagation();
            event.preventDefault();

            var $this = $(this);

            self.isMouseMovingOverPlayBar = true;

            function getEventPoint(event) {
                var event_point = +(((event.pageX - $this.offset().left) / $this.width()) * 100).toFixed(4);
                self.mouseOverPlayBarPosition = event_point;
                return event_point;
            }

            $(document).off("mouseup." + joueleID).one("mouseup." + joueleID, function(event) {
                $(document).off("mousemove." + joueleID);
                self.isMouseMovingOverPlayBar = false;

                var point = getEventPoint(event);
                if (point < 0) {
                    point = 0;
                    self.mouseOverPlayBarPosition = 0;
                } else if (point > 100) {
                    point = 100;
                    self.mouseOverPlayBarPosition = 100;
                }

                self.seek.call(self, point);

                self.mouseOverPlayBarPosition = null;
            });
            $(document).off("mousemove." + joueleID).on("mousemove." + joueleID, function(event) {
                event.stopPropagation();
                event.preventDefault();

                if (!self.isMouseMovingOverPlayBar) {
                    return false;
                }
                
                var point = getEventPoint(event);
                if (point < 0) {
                    self.mouseOverPlayBarPosition = 0;
                } else if (point > 100) {
                    self.mouseOverPlayBarPosition = 100;
                }

                updateState(self);
            });

            if (!self.howler) {
                self.createHowler.call(self);
                self.howler.load();
            }

            getEventPoint(event);

            updateState(self);
        });

        $(document).on("jouele-pause." + joueleID, function(event, triggeredJouele) {
            if (self !== triggeredJouele) {
                if (!self.isPaused && self.isStarted) {
                    self.pause();
                }
            }
        });

        return this;
    };

    Jouele.prototype.insertDOM = function insertDOM() {
        this.$container.find(".jouele-hidden").removeClass("jouele-hidden");
        this.$container.find(".jouele-info-control-button-icon_unavailable").addClass("jouele-hidden");
        this.$container.find(".jouele-info-control-button-icon_pause").addClass("jouele-hidden");
        
        this.$link.after(this.$container);
        this.$link.data("jouele", this);
        this.$link.detach();

        return this;
    };
    
    Jouele.prototype.createHowler = function createHowler() {
        var self = this;
        
        this.howler = new Howl({
            src: [self.href],
            format: ['mp3'],
            html5: true,
            preload: false,
            onloaderror: function() {
                self.breakPlayer.call(self);
            },
            onload: function() {
                self.onLoad.call(self);
            },
            onplay: function() {
                self.onPlay.call(self);
            },
            onend: function() {
                self.onEnd.call(self);
            },
            onpause: function() {
                self.onPause.call(self);
            },
            onseek: function() {
                self.onSeek.call(self);
            }
        });
        
        updateTimeDisplay(this);
        
        return this;
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
                if ($.Jouele.lastPlayed && !$.Jouele.lastPlayed.isPaused && ($.Jouele.lastPlayed.isPlaying || $.Jouele.lastPlayed.seekTime != null || $.Jouele.lastPlayed.seekPosition != null || ($.Jouele.lastPlayed.isStarted && !$.Jouele.lastPlayed.isLoaded) )) {
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
        
        function handleControlClick(event) {
            var $target = $(event.target);
            
            if ($target.hasClass("jouele-control") || $target.parents(".jouele-control").length > 0) {
                var $control =  $target.hasClass("jouele-control") ? $target : $target.parents(".jouele-control").eq(0);
                
                if ($control.attr("data-play-from")) {
                    var seekTime = $control.attr("data-play-from");
                    var $controlledJouele;
                    
                    if ($.Jouele.playlist.length === 1 && $.Jouele.playlist[0].length === 1) {
                        $controlledJouele = $.Jouele.playlist[0][0];
                    } else if ($control.attr("data-href")) {
                        var href = $control.attr("data-href");
                        
                        playlistLoop:
                            for (var i = 0; i < $.Jouele.playlist.length; i++) {
                                for (var ii = 0; ii < $.Jouele.playlist[i].length; ii++) {
                                    if ($.Jouele.playlist[i][ii].href === href) {
                                        $controlledJouele = $.Jouele.playlist[i][ii];
                                        break playlistLoop;
                                    }
                                }
                            }
                    } else {
                        $controlledJouele = $control.siblings(".jouele").eq(0);
                    }

                    if ($controlledJouele && typeof $controlledJouele.playFrom === "function") {
                        $controlledJouele.playFrom(seekTime);
                    }
                }
            }
        }
        
        $(document).on("keydown.jouele", handleSpaceKeydown);
        $(document).on("click.jouele-control", handleControlClick);
        
        $("a.jouele[href]").jouele();
    };
    $(autoLoadJouele);

}(jQuery));
