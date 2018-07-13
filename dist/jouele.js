(function($) {
    "use strict";

    var version = "3.0.6-free";
    var tracks = {};

    var $timeline_seeking = $();
    var previous_timestamp = null;

    var Helpers = {
        "isMobile": (function(a){return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))})(navigator.userAgent||navigator.vendor||window.opera),

        "formatTime": function(rawSeconds, round_floor) {
            if (typeof rawSeconds !== "number") {
                return rawSeconds;
            }

            var round_function = round_floor ? Math.floor : Math.round;
            var rounded_seconds = round_function(rawSeconds);

            var seconds = rounded_seconds % 60;
            var minutes = ((rounded_seconds - seconds) % 3600) / 60;
            var hours = (rounded_seconds - seconds - (minutes * 60)) / 3600;

            return (hours ? (hours + ":") : "") + ((hours && (minutes < 10)) ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
        },
        "makeSeconds": function(time) {
            if (typeof time === "number") {
                return time;
            }
            if (typeof time === "undefined" || time === null) {
                return 0;
            }

            var array = time.split(":").reverse(),
                seconds = 0;

            for (var i = 0; i < array.length; i++) {
                seconds += array[i] * Math.pow(60, i);
            }

            return +seconds;
        },

        "getSkinName": function($element) {
            var skin = "";

            var thisClass = $element.attr("class");
            var skinClassPosition = thisClass ? thisClass.indexOf("jouele-skin-") : -1;

            if (skinClassPosition > 0) {
                skin = thisClass.substr(skinClassPosition + 12, thisClass.indexOf(" ", skinClassPosition) > 0 ? thisClass.indexOf(" ", skinClassPosition) : thisClass.length);
            }

            return skin;
        },

        "getFirstJouele": function() {
            var first_jouele;
            var $first_jouele = $(".jouele").add(".jouele-control").filter(".jouele_first:not(.jouele_broken)").eq(0);

            if ($first_jouele.length === 0) {
                for (var index_playlist = 0; index_playlist < $.Jouele.playlist.length; index_playlist++) {
                    for (var index_track = 0; index_track < $.Jouele.playlist[index_playlist].length; index_track++) {
                        if ($.Jouele.playlist[index_playlist][index_track] instanceof Jouele && $.Jouele.playlist[index_playlist][index_track].getTrack() && !$.Jouele.playlist[index_playlist][index_track].getTrack().player["isBroken"]) {
                            first_jouele = $.Jouele.playlist[index_playlist][index_track];
                            break;
                        }
                    }
                    if (first_jouele) {
                        break;
                    }
                }
            } else {
                first_jouele = $first_jouele.data("jouele");
            }

            return first_jouele;
        },
        "getEventPoint": function(event) {
            var coordinate;
            var point;

            if (event.originalEvent.touches && event.originalEvent.touches.length > 0 && typeof event.originalEvent.touches[0] !== "undefined" && event.originalEvent.touches[0].clientX) {
                coordinate = event.originalEvent.touches[0].clientX;
            } else if (event.originalEvent.changedTouches && event.originalEvent.changedTouches.length > 0 && typeof event.originalEvent.changedTouches[0] !== "undefined" && event.originalEvent.changedTouches[0].clientX) {
                coordinate = event.originalEvent.changedTouches[0].clientX;
            } else {
                coordinate = event.pageX;
            }

            point = Math.round(parseFloat(((coordinate - $timeline_seeking.offset().left) / $timeline_seeking.width()) * 100) * 1e4) / 1e4;

            if (point < 0) {
                point = 0;
            } else if (point > 100) {
                point = 100;
            }

            return point;
        },
        "getInstance": function() {
            var instance;

            if ($.Jouele.history.length > 0 && typeof $.Jouele.history[0].getTrack() !== "undefined") {
                instance = $.Jouele.history[0];
            } else {
                instance = Helpers.getFirstJouele();
            }

            return instance;
        },

        "showWarning": function(text) {
            var isShown = false;

            if (typeof console !== "undefined" && typeof console.warn === "function") {
                console.warn(text);
                isShown = true;
            }

            return isShown;
        },
        "showError": function(text) {
            var isShown = false;

            if (typeof console !== "undefined" && typeof console.error === "function") {
                console.error(text);
                isShown = true;
            }

            return isShown;
        }
    };

    var Handlers = {
        "spacebar": function(event) {
            if (event.keyCode !== 32 || event.target.nodeName === "INPUT" || event.target.nodeName === "TEXTAREA" || event.target.nodeName === "SELECT" || event.target.nodeName === "OPTION" || event.target.nodeName === "BUTTON" || (typeof $(event.target).attr("contenteditable") !== "undefined" && $(event.target).attr("contenteditable") !== "false")) {
                return true;
            }

            if ($.Jouele.history.length > 0 && typeof $.Jouele.history[0].getTrack() !== "undefined" && !$.Jouele.history[0].getTrack().player["isPaused"] && ($.Jouele.history[0].getTrack().player["isPlaying"] || $.Jouele.history[0].getTrack().player["seekTime"] !== null || $.Jouele.history[0].getTrack().player["seekPosition"] !== null || ($.Jouele.history[0].getTrack().player["isStarted"] && !$.Jouele.history[0].getTrack().player["isLoaded"]))) {
                if (!$.Jouele.options.pauseOnSpace) {
                    return false;
                }

                if (!$.Jouele.options.scrollOnSpace) {
                    event.preventDefault();
                }

                $.Jouele.history[0].pause();
            } else {
                if (!$.Jouele.options.playOnSpace) {
                    return false;
                }

                if (!$.Jouele.options.scrollOnSpace) {
                    event.preventDefault();
                }

                if ($.Jouele.history.length > 0 && typeof $.Jouele.history[0].getTrack() !== "undefined") {
                    $.Jouele.history[0].play();
                } else {
                    var first_jouele = Helpers.getFirstJouele();
                    if (first_jouele && first_jouele instanceof Jouele) {
                        first_jouele.play();
                    }
                }
            }
        },
        "timeline": function(event) {
            if ($timeline_seeking.length === 0) {
                return true;
            }

            var JoueleInstance;
            var $timeline_parent_jouele = $timeline_seeking.parents(".jouele").eq(0);

            if ($timeline_parent_jouele.data("jouele")) {
                JoueleInstance = $timeline_parent_jouele.data("jouele");
            } else if ($timeline_parent_jouele.data("jouele-destroyed")) {
                JoueleInstance = $timeline_parent_jouele.data("jouele-destroyed");
            } else {
                JoueleInstance = Helpers.getInstance();
            }

            if (!(JoueleInstance instanceof Jouele) || !JoueleInstance.getTrack() || JoueleInstance.getTrack().player["isBroken"]) {
                $timeline_seeking = $();
                return true;
            }

            if ($timeline_seeking.data("jouele-destroyed")) {
                JoueleInstance.$container.removeData("jouele-destroyed");
                $timeline_seeking = $();
                return true;
            }

            switch (event.type) {
                case "mouseup":
                case "touchend":
                case "touchcancel":
                    JoueleInstance.getTrack().player["seekingOnTimeline"]["isSeeking"] = false;
                    JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingInstance"] = false;

                    var point = Helpers.getEventPoint(event);

                    JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingPosition"] = point;
                    JoueleInstance.seek.call(JoueleInstance, point);
                    JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingPosition"] = null;

                    $timeline_seeking = $();

                    break;
                case "mousemove":
                case "touchmove":
                    if (!JoueleInstance.getTrack().player["seekingOnTimeline"]["isSeeking"]) {
                        return true;
                    }

                    JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingPosition"] = Helpers.getEventPoint(event);
                    Redraw.updateState.call(JoueleInstance);

                    break;
                default:
                    break;
            }
        }
    };

    var Preloader = {
        "show": function(timeout) {
            var JoueleInstance = this;

            if (JoueleInstance.getTrack().player["preloaderTimeout"] || JoueleInstance.getTrack().player["seekingOnTimeline"]["isSeeking"]) {
                return JoueleInstance;
            }

            var preloader_timeout = timeout || 50; // 50 is default timeout which is almost not visible for user ('instant preloader') but enough to making script works

            JoueleInstance.getTrack().player["preloaderTimeout"] = setTimeout(function() {
                if (JoueleInstance.getTrack().player["seekingOnTimeline"]["isSeeking"] || JoueleInstance.isPaused()) {
                    JoueleInstance.getTrack().player["preloaderTimeout"] = null;
                    return JoueleInstance;
                }
                Redraw.updateControlsClasses.call(JoueleInstance, "jouele-is-buffering", "add");
            }, preloader_timeout);

            return JoueleInstance;
        },
        "hide": function() {
            var JoueleInstance = this;

            if (!JoueleInstance.getTrack().player["preloaderTimeout"]) {
                return JoueleInstance;
            }

            clearTimeout(JoueleInstance.getTrack().player["preloaderTimeout"]);
            JoueleInstance.getTrack().player["preloaderTimeout"] = null;

            Redraw.updateControlsClasses.call(JoueleInstance, "jouele-is-buffering", "remove");

            return JoueleInstance;
        }
    };

    var Redraw = {
        "updateLength": function() {
            var JoueleInstance = this;

            var old_length = null;
            var new_length = null;

            if (JoueleInstance.getTotalTime()) {
                old_length = JoueleInstance.getTotalTime();
            } else if (JoueleInstance.getOptions().length) {
                old_length = JoueleInstance.getOptions().length;
            }

            if (JoueleInstance.getTrack().player.howler) {
                new_length = JoueleInstance.getTrack().player.howler.duration();
            } else if (Helpers.makeSeconds(JoueleInstance.getOptions().length) > 0) {
                new_length = Helpers.makeSeconds(JoueleInstance.getOptions().length);
            }

            if (new_length) {
                if (old_length !== null && new_length !== old_length && JoueleInstance.getTrack().player["seekTime"] === old_length) { // Time was marked not exactly and we wanted to seek the end — it's time to change seeking time position matching new end
                    JoueleInstance.getTrack().player["seekTime"] = Math.round(parseFloat(new_length) * 1e2) / 1e2;
                }
                JoueleInstance.getTrack().player["totalTime"] = new_length;
                JoueleInstance.getTrack().player["remainingTime"] = new_length - JoueleInstance.getTrack().player["elapsedTime"];
            }

            if (JoueleInstance.getTrack().player["isBroken"]) {
                JoueleInstance.getTrack().player["totalTime"] = 0;
                JoueleInstance.getTrack().player["elapsedTime"] = 0;
                JoueleInstance.getTrack().player["remainingTime"] = 0;
            }

            Redraw.updateTimeDisplay.call(JoueleInstance);

            return JoueleInstance;
        },
        "updateTitle": function() {
            var JoueleInstance = this;
            var title = $.trim(JoueleInstance.getOptions().title);

            if (title && JoueleInstance.getTrack() && title !== JoueleInstance.getTrack().player["title"]) {
                JoueleInstance.getTrack().player["title"] = title;
            }

            for (var i = 0; i < JoueleInstance.getTrack().instances.length; i++) {
                JoueleInstance.getTrack().instances[i].$container.find(".jouele-info-control-text").html(JoueleInstance.getTrack().player["title"]);
            }

            return JoueleInstance;
        },
        "updateTimeline": function() {
            var JoueleInstance = this;
            var position = 0;

            if (!JoueleInstance.getTrack() || JoueleInstance.getTrack().player["isBroken"]) {
                position = 0;
            } else if (JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingPosition"] !== null) {
                position = JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingPosition"];
            } else if (JoueleInstance.getTrack().player["seekPosition"] !== null) {
                position = JoueleInstance.getTrack().player["seekPosition"];
            } else if (JoueleInstance.getTrack().player["seekTime"] !== null) {
                if (JoueleInstance.getTotalTime()) {
                    position = JoueleInstance.getTrack().player["seekTime"] / (JoueleInstance.getTotalTime() / 100);
                }
            } else {
                if (JoueleInstance.getTotalTime()) {
                    position = JoueleInstance.getTrack().player["howler"].seek() / (JoueleInstance.getTotalTime() / 100);
                }
            }

            position = Math.round(parseFloat(position) * 1e2) / 1e2;

            for (var i = 0; i < JoueleInstance.getTrack().instances.length; i++) {
                JoueleInstance.getTrack().instances[i].$container.find(".jouele-progress-line-lift").css("left", position + "%");
                JoueleInstance.getTrack().instances[i].$container.find(".jouele-progress-line-bar_play").css("width", position + "%");
            }

            return JoueleInstance;
        },
        "updateTimeDisplay": function(round_closest) {
            var JoueleInstance = this;

            var total_time = "";
            var elapsed_time = "";
            var remaining_time = "";
            var custom_time = null;

            function calculateTime() {
                if (!JoueleInstance.getTrack()) {
                    total_time = 0;
                } else {
                    if (JoueleInstance.getTotalTime() || JoueleInstance.getTrack().player["isBroken"]) {
                        total_time = Helpers.makeSeconds(JoueleInstance.getTotalTime());
                        custom_time = (JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingPosition"] !== null) ? JoueleInstance.getTotalTime() * (JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingPosition"] / 100) : null;
                    } else if (JoueleInstance.getOptions().length) {
                        total_time = Helpers.makeSeconds(JoueleInstance.getOptions().length);
                        custom_time = (JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingPosition"] !== null) ? Helpers.makeSeconds(JoueleInstance.getOptions().length) * (JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingPosition"] / 100) : null;
                    }

                    if (custom_time !== null) {
                        elapsed_time = Helpers.makeSeconds(custom_time);
                    } else if (JoueleInstance.getTrack().player["seekPosition"] !== null) {
                        if (JoueleInstance.getTotalTime()) {
                            elapsed_time = Helpers.makeSeconds(Math.round(parseFloat(JoueleInstance.getTotalTime() * (JoueleInstance.getTrack().player["seekPosition"] / 100)) * 1e2) / 1e2);
                        } else {
                            elapsed_time = 0;
                        }
                    } else if (JoueleInstance.getTrack().player["seekTime"] !== null) {
                        elapsed_time = Helpers.makeSeconds(JoueleInstance.getTrack().player["seekTime"]);
                    } else if (JoueleInstance.getTrack().player["isPlaying"]) {
                        if (JoueleInstance.getTrack().player["howler"] !== null) {
                            if (JoueleInstance.getTrack().player["howler"].state() !== "unloaded" && typeof JoueleInstance.getTrack().player["howler"].seek() === "number") {
                                elapsed_time = Helpers.makeSeconds(JoueleInstance.getTrack().player["howler"].seek());
                            } else {
                                elapsed_time = 0;
                            }
                        } else {
                            elapsed_time = 0;
                        }
                    } else {
                        elapsed_time = Helpers.makeSeconds(JoueleInstance.getTrack().player["howler"] !== null ? ((JoueleInstance.getTrack().player["howler"].state() !== "unloaded" && typeof JoueleInstance.getTrack().player["howler"].seek() === "number") ? JoueleInstance.getTrack().player["howler"].seek() : 0) : 0);
                    }

                    elapsed_time = JoueleInstance.getTrack().player["isBroken"] ? 0 : Math.round(elapsed_time * 1e2) / 1e2;
                    remaining_time = total_time ? (Math.round((total_time - Helpers.makeSeconds(elapsed_time)) * 1e2) / 1e2) : 0;

                    JoueleInstance.getTrack().player["remainingTime"] = remaining_time;
                    JoueleInstance.getTrack().player["elapsedTime"] = elapsed_time;
                }
            }

            function showTime() {
                var elapsed_time_formatted = Helpers.makeSeconds(Helpers.formatTime(elapsed_time, !round_closest)) > total_time ? Helpers.formatTime(elapsed_time, true) : Helpers.formatTime(elapsed_time, !round_closest);

                for (var i = 0; i < JoueleInstance.getTrack().instances.length; i++) {
                    if (JoueleInstance.getTrack().player["isBroken"]) {
                        JoueleInstance.getTrack().instances[i].$container.find(".jouele-info-time__total").text("");
                        JoueleInstance.getTrack().instances[i].$container.find(".jouele-info-time__current").text("");
                    } else {
                        JoueleInstance.getTrack().instances[i].$container.find(".jouele-info-time__total").text(total_time ? Helpers.formatTime(total_time, true) : "");
                        JoueleInstance.getTrack().instances[i].$container.find(".jouele-info-time__current").text(total_time ? Helpers.formatTime(elapsed_time_formatted) : "");
                    }
                }
            }

            calculateTime();

            if (JoueleInstance.$container.length > 0 && (total_time || !JoueleInstance.getTrack() || JoueleInstance.getTrack().player["isStarted"] || JoueleInstance.getTrack().player["seekTime"] || JoueleInstance.getTrack().player["seekingOnTimeline"]["isSeeking"])) {
                showTime();
            }

            return JoueleInstance;
        },
        "updateState": function(round_closest) {
            var JoueleInstance = this;

            Redraw.updateTimeline.call(JoueleInstance);
            Redraw.updateTimeDisplay.call(JoueleInstance, round_closest);

            return JoueleInstance;
        },
        "updateControlsClasses": function(controlClass, action) {
            var JoueleInstance = this;

            for (var i = 0; i < JoueleInstance.getTrack().instances.length; i++) {
                if (action === "add") {
                    JoueleInstance.getTrack().instances[i].$container.addClass(controlClass);
                    JoueleInstance.getTrack().instances[i].$container.find(".jouele-info-control-button-icon_play").addClass(controlClass);
                    JoueleInstance.getTrack().instances[i].$container.find(".jouele-progress-line").addClass(controlClass);
                    JoueleInstance.getTrack().instances[i].$container.find(".jouele-progress-line-bar_play").addClass(controlClass);
                    JoueleInstance.getTrack().instances[i].$container.find(".jouele-progress-line-lift").addClass(controlClass);
                } else if (action === "remove") {
                    JoueleInstance.getTrack().instances[i].$container.removeClass(controlClass);
                    JoueleInstance.getTrack().instances[i].$container.find(".jouele-info-control-button-icon_play").removeClass(controlClass);
                    JoueleInstance.getTrack().instances[i].$container.find(".jouele-progress-line").removeClass(controlClass);
                    JoueleInstance.getTrack().instances[i].$container.find(".jouele-progress-line-bar_play").removeClass(controlClass);
                    JoueleInstance.getTrack().instances[i].$container.find(".jouele-progress-line-lift").removeClass(controlClass);
                }
            }

            return JoueleInstance;
        }
    };

    var Init = {
        "createJouele": function($element, options) {
            var href = $element.attr("href");
            var title = $element.html();

            new Jouele($element, $.extend(
                {},
                {
                    /* Defaults */
                    length: 0,
                    repeat: false,
                    hideTimelineOnPause: false,
                    skin: "",
                    href: "",
                    title: "",

                    spaceControl: false,
                    pauseOnSpace: false,
                    playOnSpace: false,
                    scrollOnSpace: true
                },
                options,
                $element.data(),
                {
                    skin: Helpers.getSkinName($element),
                    href: href,
                    title: title
                }
            ));

            return $element;
        },
        "createTrack": function(href) {
            return {
                player: {
                    href: href,

                    howler: null,

                    title: "",

                    isPlaying: false,
                    isPlayed: false,
                    isPaused: false,
                    isLoaded: false,
                    isStarted: false,
                    isBroken: false,
                    isEnded: false,

                    totalTime: 0,
                    elapsedTime: 0,
                    remainingTime: 0,
                    updateStateTimer: null,
                    seekTime: null,
                    seekPosition: null,
                    preloaderTimeout: null,

                    seekingOnTimeline: {
                        isSeeking: false,
                        seekingPosition: null,
                        seekingInstance: false
                    },

                    callbacks: {},

                    play: function() {
                        var JoueleInstance = this;

                        if (!(JoueleInstance instanceof Jouele)) {
                            if ($.Jouele.tracks[JoueleInstance.href].instances.length > 0) {
                                JoueleInstance = $.Jouele.tracks[JoueleInstance.href].instances[0];
                            } else {
                                return false;
                            }
                        }

                        return Core.play.call(JoueleInstance);
                    },
                    pause: function() {
                        var JoueleInstance = this;

                        if (!(JoueleInstance instanceof Jouele)) {
                            if ($.Jouele.tracks[JoueleInstance.href].instances.length > 0) {
                                JoueleInstance = $.Jouele.tracks[JoueleInstance.href].instances[0];
                            } else {
                                return false;
                            }
                        }

                        return Core.pause.call(JoueleInstance);
                    },
                    playFrom: function(time) {
                        var JoueleInstance = this;

                        if (!(JoueleInstance instanceof Jouele)) {
                            if ($.Jouele.tracks[JoueleInstance.href].instances.length > 0) {
                                JoueleInstance = $.Jouele.tracks[JoueleInstance.href].instances[0];
                            } else {
                                return false;
                            }
                        }

                        return Core.playFrom.call(JoueleInstance, time);
                    },
                    seek: function(seekPositionPercent) {
                        var JoueleInstance = this;

                        if (!(JoueleInstance instanceof Jouele)) {
                            if ($.Jouele.tracks[JoueleInstance.href].instances.length > 0) {
                                JoueleInstance = $.Jouele.tracks[JoueleInstance.href].instances[0];
                            } else {
                                return false;
                            }
                        }

                        return Core.seek.call(JoueleInstance, seekPositionPercent);
                    }
                },
                instances: []
            };
        },
        "getPlaylistIndex": function() {
            var JoueleInstance = this;
            var index_of_playlist;

            $(".jouele-playlist").add(".jouele:not(.jouele-playlist .jouele):not(.jouele_destroyed)").each(function(index, element) {
                if ((JoueleInstance.getPlaylistDOM().length > 0 && JoueleInstance.getPlaylistDOM()[0] === element) || (JoueleInstance.$link && JoueleInstance.$link[0] === element)) {
                    index_of_playlist = index;
                    return false;
                }
            });

            if (JoueleInstance.getPlaylistDOM().length > 0) {
                var $jouele_links = JoueleInstance.getPlaylistDOM().find(".jouele[href]:not(.jouele_destroyed)");
                var $jouele_inited = JoueleInstance.getPlaylistDOM().find(".jouele_inited");
                var index_of_position_in_playlist;
                var previous_inited_jouele;
                var index_of_previous_jouele;

                $jouele_links.add($jouele_inited).each(function(index, element) {
                    var $element = $(element);

                    if ($element.hasClass("jouele_inited")) {
                        previous_inited_jouele = $element.data("jouele");
                    }
                    if (element === JoueleInstance.$link[0]) {
                        index_of_position_in_playlist = index;
                        return false;
                    }
                });

                if ($.isArray($.Jouele.playlist[index_of_playlist])) {
                    if ($.Jouele.playlist[index_of_playlist][0].getPlaylistDOM()[0] !== JoueleInstance.getPlaylistDOM()[0]) {
                        $.Jouele.playlist.splice(index_of_playlist, 0, [JoueleInstance]);
                    } else {
                        for (var i = 0; i < $.Jouele.playlist[index_of_playlist].length; i++) {
                            if ($.Jouele.playlist[index_of_playlist][i] === previous_inited_jouele) {
                                index_of_previous_jouele = i;
                                break;
                            }
                        }
                        if (typeof $.Jouele.playlist[index_of_playlist][index_of_previous_jouele + 1] === "undefined") {
                            if (index_of_position_in_playlist === 0) {
                                $.Jouele.playlist[index_of_playlist].splice(0, 0, JoueleInstance);
                            } else {
                                $.Jouele.playlist[index_of_playlist].push(JoueleInstance);
                            }
                        } else {
                            $.Jouele.playlist[index_of_playlist].splice(index_of_previous_jouele + 1, 0, JoueleInstance);
                        }
                    }
                } else {
                    $.Jouele.playlist[index_of_playlist] = [JoueleInstance];
                }
            } else {
                $.Jouele.playlist.splice(index_of_playlist, 0, [JoueleInstance]);
            }

            return index_of_playlist;
        },
        "checkOptions": function(options) {
            var cleared_options = options;

            if (!parseInt(options.length)) {
                cleared_options.length = 0;
            }
            if (typeof options.repeat !== "boolean") {
                cleared_options.repeat = false;
            }
            if (typeof options.hideTimelineOnPause !== "boolean") {
                cleared_options.hideTimelineOnPause = false;
            }
            if (typeof options.spaceControl !== "boolean") {
                cleared_options.spaceControl = false;
            }
            if (typeof options.pauseOnSpace !== "boolean") {
                cleared_options.pauseOnSpace = false;
            }
            if (typeof options.playOnSpace !== "boolean") {
                cleared_options.playOnSpace = false;
            }
            if (typeof options.scrollOnSpace !== "boolean") {
                cleared_options.scrollOnSpace = true;
            }

            return cleared_options;
        },
        "checkNewOptions": function(old_options, new_options) {
            var cleared_options = new_options;

            if ($.trim(new_options.title) === "") {
                cleared_options.title = old_options.title;
            }
            if (!parseInt(new_options.length)) {
                cleared_options.length = old_options.length;
            }
            if (typeof new_options.repeat !== "boolean") {
                cleared_options.repeat = old_options.repeat;
            }
            if (typeof new_options.hideTimelineOnPause !== "boolean") {
                cleared_options.hideTimelineOnPause = old_options.hideTimelineOnPause;
            }
            if (typeof new_options.spaceControl !== "boolean") {
                cleared_options.spaceControl = old_options.spaceControl;
            }
            if (typeof new_options.pauseOnSpace !== "boolean") {
                cleared_options.pauseOnSpace = old_options.pauseOnSpace;
            }
            if (typeof new_options.playOnSpace !== "boolean") {
                cleared_options.playOnSpace = old_options.playOnSpace;
            }
            if (typeof new_options.scrollOnSpace !== "boolean") {
                cleared_options.scrollOnSpace = old_options.scrollOnSpace;
            }

            return cleared_options;
        },
        "checkGlobalOptions": function() {
            var JoueleInstance = this;

            if (JoueleInstance.getOptions().pauseOnSpace || JoueleInstance.getPlaylistDOM().attr("data-pause-on-space")) {
                $.Jouele.options.pauseOnSpace = true;
            }
            if (JoueleInstance.getOptions().playOnSpace || JoueleInstance.getPlaylistDOM().attr("data-play-on-space")) {
                $.Jouele.options.playOnSpace = true;
            }
            if (!JoueleInstance.getOptions().scrollOnSpace || JoueleInstance.getPlaylistDOM().attr("data-scroll-on-space")) {
                $.Jouele.options.scrollOnSpace = false;
            }
            if (JoueleInstance.getOptions().spaceControl || JoueleInstance.getPlaylistDOM().attr("data-space-control")) {
                $.Jouele.options.pauseOnSpace = true;
                $.Jouele.options.playOnSpace = true;
                $.Jouele.options.scrollOnSpace = false;
            }

            return JoueleInstance;
        },
        "initInnerControls": function() {
            var JoueleInstance = this;

            JoueleInstance.$container.find(".jouele-progress-line").off("mousedown.jouele touchstart.jouele").on("mousedown.jouele touchstart.jouele", function(event) {
                if (event.type === "mousedown" && event.which !== 1) {
                    return false;
                }

                if (!(JoueleInstance instanceof Jouele)) {
                    return false;
                }

                var $timeline = $(this);

                JoueleInstance.getTrack().player["seekingOnTimeline"]["isSeeking"] = true;
                JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingInstance"] = $timeline;

                $timeline_seeking = $timeline;

                if (!JoueleInstance.getTrack().player["howler"]) {
                    if (!Core.createHowler.call(JoueleInstance)) {
                        Core.breakPlayer.call(JoueleInstance);
                        return false;
                    }
                    JoueleInstance.getTrack().player["howler"].load();
                    JoueleInstance.getTrack().player["isStarted"] = true;
                }

                JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingPosition"] = Helpers.getEventPoint(event);

                Redraw.updateState.call(JoueleInstance);
                Redraw.updateTitle.call(JoueleInstance);
            }).addClass("jouele-is-available");

            JoueleInstance.$container.find(".jouele-info-control-button-icon_play").off("click.jouele").on("click.jouele", function() {
                if (!(JoueleInstance instanceof Jouele)) {
                    return false;
                }

                if (JoueleInstance.getTrack().player["isPaused"]) {
                    JoueleInstance.getTrack().player.play.call(JoueleInstance);
                } else {
                    if (JoueleInstance.getTrack().player["isStarted"]) {
                        JoueleInstance.getTrack().player.pause.call(JoueleInstance);
                    } else {
                        JoueleInstance.getTrack().player.play.call(JoueleInstance);
                    }
                }
            }).addClass("jouele-is-available");

            JoueleInstance.$container.addClass("jouele-is-available");

            return JoueleInstance;
        },
        "createJoueleDOM": function() {
            var JoueleInstance = this;

            var $container = $(document.createElement("div"));
            var $info_area = $(document.createElement("div"));
            var $progress_area = $(document.createElement("div"));

            var createInfoAreaDOM = function() {
                return [
                    $(document.createElement("div")).addClass("jouele-info-time").append(
                        $(document.createElement("div")).addClass("jouele-info-time__current").text(JoueleInstance.getTotalTime() ? "0:00" : ""),
                        $(document.createElement("div")).addClass("jouele-info-time__total").text(JoueleInstance.getTotalTime() ? Helpers.formatTime(Helpers.makeSeconds(JoueleInstance.getTotalTime()), true) : "")
                    ),
                    $(document.createElement("div")).addClass("jouele-info-control").append(
                        $(document.createElement("div")).addClass("jouele-info-control-button").append(
                            $(document.createElement("span")).addClass("jouele-info-control-button-icon jouele-info-control-button-icon_unavailable").html(
                                '<svg class="jouele-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" enable-background="new 0 0 16 16"><g class="jouele-svg-color"><path d="m4 6.7l3.8 3.7-3.8 2.1z"/><path d="m.2 2.2l.6-.5 11 11.1-.5.5z"/><path d="m4 4.3v-.8l8 4.5-2.7 1.5z"/></g></svg>'
                            ),
                            $(document.createElement("a")).attr("href", JoueleInstance.getHref()).addClass("jouele-info-control-link jouele-hidden").append(
                                $(document.createElement("span")).addClass("jouele-info-control-button-icon jouele-info-control-button-icon_play jouele-hidden").html(
                                    '<svg class="jouele-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" enable-background="new 0 0 16 16"><path class="jouele-svg-color" d="m4 3.5l8 4.5-8 4.5z"/></svg>'
                                )
                            )
                        ),
                        $(document.createElement("div")).addClass("jouele-info-control-text")
                    )
                ];
            };

            var createProgressAreaDOM = function() {
                return $(document.createElement("div")).addClass("jouele-progress-line").append(
                    $(document.createElement("div")).addClass("jouele-progress-line-bar_base").css("cursor", "pointer"),
                    $(document.createElement("div")).addClass("jouele-progress-line-bar_play"),
                    $(document.createElement("div")).addClass("jouele-progress-line-lift jouele-hidden")
                );
            };

            JoueleInstance.$container = $container.data("jouele", JoueleInstance).addClass("jouele jouele_inited" + (JoueleInstance.$link.data("first") === true ? " jouele_first" : "") + (JoueleInstance.getOptions().hideTimelineOnPause ? " jouele_timeline_hide" : "") + (JoueleInstance.getOptions().skin ? " jouele-skin-" + JoueleInstance.getOptions().skin : ""));
            JoueleInstance.$container.append($info_area.addClass("jouele-info").append(createInfoAreaDOM()), $progress_area.addClass("jouele-progress").append(createProgressAreaDOM()));

            return JoueleInstance;
        },
        "insertJoueleDOM": function() {
            var JoueleInstance = this;

            if (JoueleInstance.$container.length > 0) {
                JoueleInstance.$container.find(".jouele-hidden").removeClass("jouele-hidden");
                JoueleInstance.$container.find(".jouele-info-control-button-icon_unavailable").addClass("jouele-hidden");

                JoueleInstance.$container.find(".jouele-info-control-link").off("click.jouele").on("click.jouele", function(event) {
                    event.preventDefault();
                });

                JoueleInstance.$link.after(JoueleInstance.$container);
                JoueleInstance.$link.detach();
            }

            return JoueleInstance;
        },
        "findPlaylistInDOM": function() {
            var JoueleInstance = this;

            return JoueleInstance.$link.parents(".jouele-playlist").eq(0);
        },
        "pushToHistory": function() {
            var JoueleInstance = this;

            if ($.Jouele.history.length === 0 || $.Jouele.history[0].getTrack() !== JoueleInstance.getTrack() || ($.Jouele.history[0].getTrack() === JoueleInstance.getTrack() && JoueleInstance.getTrack().player["isPaused"] && $.Jouele.history[0] !== JoueleInstance)) {
                $.Jouele.history.unshift(JoueleInstance);
            }

            return JoueleInstance;
        }
    };

    var Core = {
        "createHowler": function() {
            var JoueleInstance = this;

            JoueleInstance.getTrack().player["howler"] = new Howl({
                src: [JoueleInstance.getHref()],
                format: ["mp3"],
                html5: true,
                preload: false,
                loop: JoueleInstance.getOptions().repeat,
                onloaderror: function() {
                    var callback;

                    function checkError() {
                        if (JoueleInstance.getTrack().player["isPlayed"]) {
                            JoueleInstance.pause();
                        } else {
                            Core.breakPlayer.call(JoueleInstance);
                        }
                    }

                    if (JoueleInstance.getTrack()) {
                        if (typeof JoueleInstance.getTrack().player["callbacks"] === "object" && typeof JoueleInstance.getTrack().player["callbacks"].onloaderror === "function") {
                            callback = JoueleInstance.getTrack().player["callbacks"].onloaderror();

                            if (callback !== false) {
                                checkError();
                            }
                        } else {
                            checkError();
                        }
                    }
                },
                onload: function() {
                    var callback;

                    if (JoueleInstance.getTrack()) {
                        if (typeof JoueleInstance.getTrack().player["callbacks"] === "object" && typeof JoueleInstance.getTrack().player["callbacks"].onload === "function") {
                            callback = JoueleInstance.getTrack().player["callbacks"].onload();

                            if (callback !== false) {
                                Core.Events.onLoad.call(JoueleInstance);
                            }
                        } else {
                            Core.Events.onLoad.call(JoueleInstance);
                        }
                    }
                },
                onplay: function() {
                    var callback;

                    if (JoueleInstance.getTrack()) {
                        if (typeof JoueleInstance.getTrack().player["callbacks"] === "object" && typeof JoueleInstance.getTrack().player["callbacks"].onplay === "function") {
                            callback = JoueleInstance.getTrack().player["callbacks"].onplay();

                            if (callback !== false) {
                                Core.Events.onPlay.call(JoueleInstance);
                            }
                        } else {
                            Core.Events.onPlay.call(JoueleInstance);
                        }
                    }
                },
                onpause: function() {
                    var callback;

                    if (JoueleInstance.getTrack()) {
                        if (typeof JoueleInstance.getTrack().player["callbacks"] === "object" && typeof JoueleInstance.getTrack().player["callbacks"].onpause === "function") {
                            callback = JoueleInstance.getTrack().player["callbacks"].onpause();

                            if (callback !== false) {
                                Core.Events.onPause.call(JoueleInstance);
                            }
                        } else {
                            Core.Events.onPause.call(JoueleInstance);
                        }
                    }
                },
                onseek: function() {
                    var callback;

                    if (JoueleInstance.getTrack()) {
                        /* Hacks for Howler 2.0.x (seek to 0 after seeking to the end) */
                        if (JoueleInstance.getTrack().player["howler"]._sounds[0]._ended && JoueleInstance.getTrack().player["howler"].seek() === 0) {
                            return true;
                        }

                        /* Don‘t fire 'onseek' after seeking to 0 when track was ended, it is alone in the playlist and playlist is repeating */
                        if (JoueleInstance.getTrack().player["isEnded"]) {
                            return true;
                        }

                        if (typeof JoueleInstance.getTrack().player["callbacks"] === "object" && typeof JoueleInstance.getTrack().player["callbacks"].onseek === "function") {
                            callback = JoueleInstance.getTrack().player["callbacks"].onseek();

                            if (callback !== false) {
                                Core.Events.onSeek.call(JoueleInstance);
                            }
                        } else {
                            Core.Events.onSeek.call(JoueleInstance);
                        }
                    }
                },
                onend: function() {
                    var callback;

                    if (JoueleInstance.getTrack()) {
                        if (typeof JoueleInstance.getTrack().player["callbacks"] === "object" && typeof JoueleInstance.getTrack().player["callbacks"].onend === "function") {
                            callback = JoueleInstance.getTrack().player["callbacks"].onend();

                            if (callback !== false) {
                                Core.Events.onEnd.call(JoueleInstance);
                            }
                        } else {
                            Core.Events.onEnd.call(JoueleInstance);
                        }
                    }
                }
            });

            Redraw.updateTimeDisplay.call(JoueleInstance);

            return JoueleInstance;
        },

        "play": function() {
            var JoueleInstance = this;

            if (JoueleInstance.getTrack().player["isPlaying"]) {
                return JoueleInstance;
            }

            if ($.Jouele.history.length > 0 && typeof $.Jouele.history[0].getTrack() !== "undefined" && $.Jouele.history[0].getTrack().player !== JoueleInstance.getTrack().player) {
                if (!$.Jouele.history[0].getTrack().player["isPaused"]) {
                    $.Jouele.history[0].pause();
                }
            }

            if (!JoueleInstance.getTrack().player["howler"]) {
                if (!Core.createHowler.call(JoueleInstance)) {
                    Core.breakPlayer.call(JoueleInstance);
                    return JoueleInstance;
                }
            }

            Init.pushToHistory.call(JoueleInstance);
            Core.Interface.makeInterfacePlay.call(JoueleInstance);

            if (JoueleInstance.getTrack().player["isLoaded"]) {
                JoueleInstance.getTrack().player["howler"].play();
            } else {
                if (!JoueleInstance.getTrack().player["isStarted"]) {
                    JoueleInstance.getTrack().player["howler"].load();
                }
            }

            JoueleInstance.getTrack().player["isStarted"] = true;

            Preloader.show.call(JoueleInstance);

            if (JoueleInstance.getTrack().player["howler"]._sounds.length < 1) {
                return JoueleInstance;
            }

            var nearest_second = Math.round((Math.ceil(JoueleInstance.getTrack().player["howler"].seek()) - JoueleInstance.getTrack().player["howler"].seek()) * 1e3) / 1e3;
            setTimeout(function() {
                Redraw.updateState.call(JoueleInstance, true);

                if (JoueleInstance.getTrack().player["updateStateTimer"]) {
                    clearInterval(JoueleInstance.getTrack().player["updateStateTimer"]);
                }

                if (!JoueleInstance.getTrack().player["isPaused"]) {
                    JoueleInstance.getTrack().player["updateStateTimer"] = setInterval(function() {
                        Redraw.updateState.call(JoueleInstance, true);
                    }, 1000);
                }
            }, nearest_second * 1000);

            return JoueleInstance;
        },
        "pause": function() {
            var JoueleInstance = this;

            if (!JoueleInstance.getTrack().player["howler"] || JoueleInstance.getTrack().player["isPaused"]) {
                return JoueleInstance;
            }

            Preloader.hide.call(JoueleInstance);

            Core.Interface.makeInterfacePause.call(JoueleInstance);

            JoueleInstance.getTrack().player["seekingOnTimeline"]["isSeeking"] = false;
            JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingInstance"] = false;

            if (JoueleInstance.getTrack().player["howler"]) {
                JoueleInstance.getTrack().player["howler"].pause();
            }

            return JoueleInstance;
        },

        "playFrom": function(time) {
            var JoueleInstance = this;

            if (!time) {
                return JoueleInstance;
            }

            if (JoueleInstance.getTotalTime() && (Helpers.makeSeconds(time) > JoueleInstance.getTotalTime())) {
                time = JoueleInstance.getTotalTime();
            }
            if (Helpers.makeSeconds(time) < 0) {
                time = 0;
            }

            JoueleInstance.getTrack().player["seekTime"] = Helpers.makeSeconds(time);

            Redraw.updateState.call(JoueleInstance);

            if ($.Jouele.history.length > 0 && typeof $.Jouele.history[0].getTrack() !== "undefined" && $.Jouele.history[0].getTrack().player !== JoueleInstance.getTrack().player) {
                if (!$.Jouele.history[0].getTrack().player["isPaused"]) {
                    $.Jouele.history[0].pause();
                }
            }

            if (!JoueleInstance.getTrack().player["howler"]) {
                if (!Core.createHowler.call(JoueleInstance)) {
                    Core.breakPlayer.call(JoueleInstance);
                    return JoueleInstance;
                }
            }

            JoueleInstance.getTrack().player["isEnded"] = false;

            if (JoueleInstance.getTrack().player["isLoaded"] && JoueleInstance.getTotalTime()) {
                Preloader.show.call(JoueleInstance, 200);
                JoueleInstance.getTrack().player["howler"].seek(JoueleInstance.getTrack().player["seekTime"]);
            } else {
                if (!JoueleInstance.getTrack().player["isStarted"]) {
                    JoueleInstance.getTrack().player["howler"].load();
                }
                Preloader.show.call(JoueleInstance);
            }

            Init.pushToHistory.call(JoueleInstance);
            Core.Interface.makeInterfacePlay.call(JoueleInstance);

            JoueleInstance.getTrack().player["isStarted"] = true;

            if (JoueleInstance.getTrack().player["isLoaded"]) {
                var current_time = JoueleInstance.getTrack().player["howler"].seek();
                var interval;

                setTimeout(function() {
                    if (JoueleInstance.getTrack() && current_time === JoueleInstance.getTrack().player["howler"].seek()) {
                        Preloader.show.call(JoueleInstance);
                    }
                    interval = setInterval(function() {
                        if (!JoueleInstance.getTrack() || current_time !== JoueleInstance.getTrack().player["howler"].seek()) { // Seeking part is loaded and playing
                            Preloader.hide.call(JoueleInstance);
                            clearTimeout(interval);
                        }
                    }, 50);
                }, 100);

                Redraw.updateState.call(JoueleInstance);
            }

            return JoueleInstance;
        },
        "seek": function(seekPositionPercent) {
            var JoueleInstance = this;
            var seek_position_percent = Math.round(parseFloat(seekPositionPercent) * 1e2) / 1e2;

            if (isNaN(seek_position_percent)) {
                return JoueleInstance;
            }

            if (seek_position_percent > 100) {
                seek_position_percent = 100;
            }
            if (seek_position_percent < 0) {
                seek_position_percent = 0;
            }

            JoueleInstance.getTrack().player["seekPosition"] = seek_position_percent;

            if ($.Jouele.history.length > 0 && typeof $.Jouele.history[0].getTrack() !== "undefined" && $.Jouele.history[0].getTrack().player !== JoueleInstance.getTrack().player) {
                if (!$.Jouele.history[0].getTrack().player["isPaused"]) {
                    $.Jouele.history[0].pause();
                }
            }

            if (!JoueleInstance.getTrack().player["howler"]) {
                if (!Core.createHowler.call(JoueleInstance)) {
                    Core.breakPlayer.call(JoueleInstance);
                    return false;
                }
            }

            Init.pushToHistory.call(JoueleInstance);
            Core.Interface.makeInterfacePlay.call(JoueleInstance);

            JoueleInstance.getTrack().player["isEnded"] = false;

            if (JoueleInstance.getTotalTime()) {
                JoueleInstance.getTrack().player["seekTime"] = Math.round(parseFloat(JoueleInstance.getTotalTime() * (seek_position_percent / 100)) * 1e2) / 1e2;

                if (JoueleInstance.getTrack().player["isLoaded"]) {
                    JoueleInstance.getTrack().player["howler"].seek(JoueleInstance.getTrack().player["seekTime"]);

                    /* Hack for Howler 2.0.x */
                    if (JoueleInstance.getTrack().player["seekTime"] === JoueleInstance.getTotalTime()) {
                        setTimeout(function () {
                            if (JoueleInstance.getTrack().player["howler"]._playLock) {
                                JoueleInstance.getTrack().player["howler"]._emit.call(JoueleInstance.getTrack().player["howler"], "seek", JoueleInstance.getTrack().player["howler"]._sounds[0]);
                            }
                        }, 500);
                        Preloader.show.call(JoueleInstance, 500);
                    } else {
                        Preloader.show.call(JoueleInstance, 200);
                    }
                } else {
                    if (!JoueleInstance.getTrack().player["isStarted"]) {
                        JoueleInstance.getTrack().player["howler"].load();
                    }
                    Preloader.show.call(JoueleInstance);
                }
            } else {
                if (!JoueleInstance.getTrack().player["isStarted"]) {
                    JoueleInstance.getTrack().player["howler"].load();
                }
                Preloader.show.call(JoueleInstance);
            }

            JoueleInstance.getTrack().player["isStarted"] = true;

            Redraw.updateState.call(JoueleInstance);

            if (JoueleInstance.getTrack().player["isLoaded"] && JoueleInstance.getTrack().player["seekTime"] !== JoueleInstance.getTotalTime()) {
                var current_time = JoueleInstance.getTrack().player["howler"].seek();
                var interval;

                setTimeout(function() {
                    if (JoueleInstance.getTrack() && current_time === JoueleInstance.getTrack().player["howler"].seek()) {
                        Preloader.show.call(JoueleInstance);
                    }
                    interval = setInterval(function() {
                        if (!JoueleInstance.getTrack() || current_time !== JoueleInstance.getTrack().player["howler"].seek()) { // Seeking part is loaded and playing
                            Preloader.hide.call(JoueleInstance);
                            clearTimeout(interval);
                        }
                    }, 50);
                }, 100);

                Redraw.updateState.call(JoueleInstance);
            }

            return JoueleInstance;
        },

        "playNext": function() {
            var JoueleInstance = this;

            if (JoueleInstance.getOptions().repeat) {
                if (!JoueleInstance.getTrack().player["isPlayed"]) { // We are seeking the end (track wasn't actually playing)
                    JoueleInstance.play(); // Force play to make `howler.loop` works
                }
                return JoueleInstance; // `howler.loop` does the job
            }

            if (Helpers.isMobile) {
                return JoueleInstance; // Mobile suspends JS background execution so we can't play next track
            }

            for (var i = 0; i < $.Jouele.history[0].getPlaylist().length; i++) {
                if ($.Jouele.history[0].getPlaylist()[i].getTrack() === $.Jouele.history[0].getTrack()) {
                    if ($.Jouele.history[0].getPlaylist()[i + 1] instanceof Jouele && $.Jouele.history[0].getPlaylist()[i + 1].getTrack() === $.Jouele.history[0].getTrack()) {
                        continue;
                    } else {
                        break;
                    }
                }
            }
            if ($.Jouele.history[0].getPlaylist()[i + 1] instanceof Jouele) {
                $.Jouele.history[0].getPlaylist()[i + 1].play();
            } else {
                if ($.Jouele.history[0].getPlaylistDOM().data("repeat")) {
                    if ($.Jouele.history[0].getPlaylist()[0] instanceof Jouele) {
                        $.Jouele.history[0].getPlaylist()[0].play();
                    }
                }
            }

            return JoueleInstance;
        },

        "destroy": function() {
            var JoueleInstance = this;

            /* Clean timeline seeking */
            if (JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingInstance"][0] === JoueleInstance.$container.find(".jouele-progress-line")[0]) {
                JoueleInstance.getTrack().player["seekingOnTimeline"]["isSeeking"] = false;
                JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingInstance"] = false;
                JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingPosition"] = null;

                if (!JoueleInstance.getTrack().player["isLoaded"]) {
                    /* Show seeking point as 0 because when the 'onload' event will be fired, seeking point jumps to 0 */
                    Redraw.updateState.call(JoueleInstance);
                }

                if (JoueleInstance.getTrack().player["isStarted"] && !JoueleInstance.getTrack().player["isPlaying"] && !JoueleInstance.getTrack().player["isPlayed"]) {
                    /* Set pseudopause if track has been started but was not playing */
                    Core.Interface.makeInterfacePause.call(JoueleInstance);
                }
            }

            /* Remove this player from array of instances */
            for (var index_instance = 0; index_instance < JoueleInstance.getTrack().instances.length; index_instance++) {
                if (JoueleInstance.getTrack().instances[index_instance] === JoueleInstance) {
                    JoueleInstance.getTrack().instances.splice(index_instance, 1);
                    break;
                }
            }

            /* Check if timeline is seeking now */
            if ($timeline_seeking.length > 0 && $timeline_seeking.parents(".jouele").eq(0).data("jouele") === JoueleInstance) {
                JoueleInstance.$container.data("jouele-destroyed", JoueleInstance);
            }

            /* Clear listeners */
            JoueleInstance.$container.find(".jouele-info-control-link").off("click.jouele");
            JoueleInstance.$container.find(".jouele-info-control-button-icon_play").off("click.jouele");
            JoueleInstance.$container.find(".jouele-progress-line").off("mousedown.jouele touchstart.jouele");

            /* Remove from playlist */
            for (var index_in_playlist = 0; index_in_playlist < JoueleInstance.getPlaylist().length; index_in_playlist++) {
                if (JoueleInstance.getPlaylist()[index_in_playlist] === JoueleInstance) {
                    JoueleInstance.getPlaylist().splice(index_in_playlist, 1);
                    break;
                }
            }
            if (JoueleInstance.getPlaylist().length === 0) {
                for (var index_playlist = 0; index_playlist < $.Jouele.playlist.length; index_playlist++) {
                    if ($.Jouele.playlist[index_playlist] === JoueleInstance.getPlaylist()) {
                        $.Jouele.playlist.splice(index_playlist, 1);
                        break;
                    }
                }
            }

            function removeTrack() {
                clearInterval(JoueleInstance.getTrack().player["updateStateTimer"]);
                JoueleInstance.getTrack().player["updateStateTimer"] = null;

                Preloader.hide.call(JoueleInstance);

                if (JoueleInstance.getTrack().instances.length === 0) {
                    if (JoueleInstance.getTrack().player["howler"]) {
                        JoueleInstance.getTrack().player["howler"].unload();
                        JoueleInstance.getTrack().player["howler"] = undefined;
                    }

                    delete tracks[JoueleInstance.getTrack().player["href"]];
                }
            }

            /* Pause and remove */
            if (JoueleInstance.getTrack().player["isPlaying"]) {
                var current_callback = JoueleInstance.getTrack().player["callbacks"]["onpause"];
                JoueleInstance.getTrack().player["callbacks"]["onpause"] = function() {
                    if (current_callback) {
                        current_callback();
                    }
                    removeTrack();
                    return false;
                };
                JoueleInstance.pause();
            } else {
                removeTrack();
            }

            /* Restore "before jouele" link */
            JoueleInstance.$container.after(JoueleInstance.$link).removeData("jouele").detach();
            JoueleInstance.$link.removeData("jouele").addClass("jouele_destroyed");

            return JoueleInstance.$link;
        },
        "breakPlayer": function() {
            var JoueleInstance = this;

            JoueleInstance.getTrack().player["isBroken"] = true;

            clearInterval(JoueleInstance.getTrack().player["updateStateTimer"]);
            JoueleInstance.getTrack().player["updateStateTimer"] = null;

            Preloader.hide.call(JoueleInstance);

            Redraw.updateTimeDisplay.call(JoueleInstance);

            for (var i = 0; i < JoueleInstance.getTrack().instances.length; i++) {
                if (JoueleInstance.getTrack().instances[i].$container.length > 0) {
                    JoueleInstance.getTrack().instances[i].$container.addClass("jouele_broken");
                    JoueleInstance.getTrack().instances[i].$container.find(".jouele-info-control-button-icon_unavailable").removeClass("jouele-hidden");
                    JoueleInstance.getTrack().instances[i].$container.find(".jouele-info-control-link").addClass("jouele-hidden").off("click.jouele");
                    JoueleInstance.getTrack().instances[i].$container.find(".jouele-info-control-button-icon_play").off("click.jouele");
                    JoueleInstance.getTrack().instances[i].$container.find(".jouele-progress-line").off("mousedown.jouele touchstart.jouele");
                }
            }

            Redraw.updateControlsClasses.call(JoueleInstance, "jouele-is-available", "remove");
            Redraw.updateControlsClasses.call(JoueleInstance, "jouele-is-loaded", "remove");
            Redraw.updateControlsClasses.call(JoueleInstance, "jouele-is-paused", "remove");
            Redraw.updateControlsClasses.call(JoueleInstance, "jouele-is-buffering", "remove");
            Redraw.updateControlsClasses.call(JoueleInstance, "jouele-is-within", "remove");
            Redraw.updateControlsClasses.call(JoueleInstance, "jouele-is-playing", "remove");
            Redraw.updateControlsClasses.call(JoueleInstance, "jouele-is-unavailable", "add");

            for (i = 0; i < $.Jouele.history.length; i++) {
                if ($.Jouele.history[i].getTrack() === JoueleInstance.getTrack()) {
                    $.Jouele.history.splice(i, 1);
                    i--;
                }
            }

            for (var index_playlist = 0; index_playlist < $.Jouele.playlist.length; index_playlist++) {
                for (var index_track = 0; index_track < $.Jouele.playlist[index_playlist].length; index_track++) {
                    if ($.Jouele.playlist[index_playlist][index_track] instanceof Jouele && $.Jouele.playlist[index_playlist][index_track].getTrack() === JoueleInstance.getTrack()) {
                        $.Jouele.playlist[index_playlist].splice(index_track, 1);
                        index_track--;
                    }
                }
                if ($.Jouele.playlist[index_playlist].length === 0) {
                    $.Jouele.playlist.splice(index_playlist, 1);
                    index_playlist--;
                }
            }

            Redraw.updateState.call($.Jouele.history.length > 0 && typeof $.Jouele.history[0].getTrack() !== "undefined" ? $.Jouele.history[0] : JoueleInstance);
            Redraw.updateLength.call($.Jouele.history.length > 0 && typeof $.Jouele.history[0].getTrack() !== "undefined" ? $.Jouele.history[0] : JoueleInstance);
            Redraw.updateTitle.call($.Jouele.history.length > 0 && typeof $.Jouele.history[0].getTrack() !== "undefined" ? $.Jouele.history[0] : JoueleInstance);

            return JoueleInstance;
        },

        Interface: {
            "makeInterfacePause": function() {
                var JoueleInstance = this;

                JoueleInstance.getTrack().player["isPaused"] = true;
                JoueleInstance.getTrack().player["isPlaying"] = false;

                Redraw.updateControlsClasses.call(JoueleInstance, "jouele-is-paused", "add");
                Redraw.updateControlsClasses.call(JoueleInstance, "jouele-is-playing", "remove");

                return JoueleInstance;
            },
            "makeInterfacePlay": function() {
                var JoueleInstance = this;

                JoueleInstance.getTrack().player["isPaused"] = false;

                Redraw.updateControlsClasses.call(JoueleInstance, "jouele-is-paused", "remove");
                Redraw.updateControlsClasses.call(JoueleInstance, "jouele-is-playing", "add");

                return JoueleInstance;
            }
        },

        Events: {
            "onPause": function() {
                var JoueleInstance = this;

                if (JoueleInstance.getTrack().player["updateStateTimer"]) {
                    clearInterval(JoueleInstance.getTrack().player["updateStateTimer"]);
                    JoueleInstance.getTrack().player["updateStateTimer"] = null;
                }

                Core.Interface.makeInterfacePause.call(JoueleInstance);

                JoueleInstance.getTrack().player["seekingOnTimeline"]["isSeeking"] = false;
                JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingInstance"] = false;
                JoueleInstance.getTrack().player["seekTime"] = null;
                JoueleInstance.getTrack().player["seekPosition"] = null;

                previous_timestamp = null;

                return JoueleInstance;
            },
            "onPlay": function() {
                var JoueleInstance = this;

                if ($.Jouele.history.length > 0 && typeof $.Jouele.history[0].getTrack() !== "undefined" && $.Jouele.history[0].getTrack().player !== JoueleInstance.getTrack().player) {
                    if (!$.Jouele.history[0].getTrack().player["isPaused"]) {
                        $.Jouele.history[0].pause();
                    }
                }

                if (JoueleInstance.getTrack().player["isPaused"]) { // Track was seeking and now it is trying to play, but we have paused it earlier
                    if (JoueleInstance.getTrack().player["howler"]) {
                        JoueleInstance.getTrack().player["howler"].pause();
                    }
                    return JoueleInstance;
                }

                Core.Interface.makeInterfacePlay.call(JoueleInstance);

                JoueleInstance.getTrack().player["isPlaying"] = true;
                JoueleInstance.getTrack().player["isPlayed"] = true;

                JoueleInstance.getTrack().player["seekTime"] = null;
                JoueleInstance.getTrack().player["seekPosition"] = null;

                JoueleInstance.getTrack().player["isEnded"] = false;

                Redraw.updateControlsClasses.call(JoueleInstance, "jouele-is-playing", "add");

                Redraw.updateState.call(JoueleInstance);
                Preloader.hide.call(JoueleInstance);

                var nearest_second = Math.round((Math.ceil(JoueleInstance.getTrack().player["howler"].seek()) - JoueleInstance.getTrack().player["howler"].seek()) * 1e3) / 1e3;
                setTimeout(function() {
                    Redraw.updateState.call(JoueleInstance, true);

                    if (JoueleInstance.getTrack().player["updateStateTimer"]) {
                        clearInterval(JoueleInstance.getTrack().player["updateStateTimer"]);
                    }

                    if (!JoueleInstance.getTrack().player["isPaused"]) {
                        JoueleInstance.getTrack().player["updateStateTimer"] = setInterval(function() {
                            if (JoueleInstance.getTrack().player["howler"]) {
                                if (previous_timestamp && previous_timestamp === JoueleInstance.getTrack().player["howler"].seek()) {
                                    Preloader.show.call(JoueleInstance, 200);
                                } else {
                                    Preloader.hide.call(JoueleInstance);
                                }
                                previous_timestamp = JoueleInstance.getTrack().player["howler"].seek();
                            }
                            Redraw.updateState.call(JoueleInstance, true);
                        }, 1000);
                    }
                }, nearest_second * 1000);

                return JoueleInstance;
            },
            "onSeek": function() {
                var JoueleInstance = this;

                if (JoueleInstance.getTrack().player["seekTime"] !== null && JoueleInstance.getTrack().player["seekTime"] !== JoueleInstance.getTotalTime() && JoueleInstance.getTrack().player["seekPosition"] !== 100) {
                    if (Math.abs(JoueleInstance.getTrack().player["howler"].seek() - JoueleInstance.getTrack().player["seekTime"]) > 0.01) { // Hack for some strange cases
                        Core.seek.call(JoueleInstance);
                        return JoueleInstance;
                    }
                }

                if (JoueleInstance.getTrack().player["isPaused"] && JoueleInstance.getTrack().player["howler"] && !JoueleInstance.getTrack().player["howler"]["_sounds"][0]["_ended"]) {
                    if (JoueleInstance.getTrack().player["howler"] && !JoueleInstance.getTrack().player["howler"]["_sounds"][0]["_paused"]) {
                        JoueleInstance.getTrack().player["howler"].pause();
                    }
                    return JoueleInstance;
                }

                if (!JoueleInstance.getTrack().player["isPlaying"]) {
                    Preloader.show.call(JoueleInstance, 200);
                }

                if (JoueleInstance.getTrack().player["updateStateTimer"]) {
                    clearInterval(JoueleInstance.getTrack().player["updateStateTimer"]);
                }
                if (JoueleInstance.getTrack().player["seekTime"] === JoueleInstance.getTotalTime()) {
                    /* Hacks for Howler 2.0.x */
                    if (JoueleInstance.getTrack().player["isPlayed"]) {
                        if (JoueleInstance.getTrack().player["isPlaying"]) {
                            JoueleInstance.getTrack().player["howler"]["_sounds"][0]["_paused"] = false; // This is mandatory because Howler will check `paused` state in `_ended` event
                        }
                    } else {
                        JoueleInstance.getTrack().player["isPlayed"] = true;
                    }
                    JoueleInstance.getTrack().player["howler"]._ended.call(JoueleInstance.getTrack().player["howler"], JoueleInstance.getTrack().player["howler"]._sounds[0]); // Track doesn't have `_endTimers` because it's paused or never played so we need to fire the end event manually
                    return JoueleInstance;
                }

                Redraw.updateState.call(JoueleInstance);

                var nearest_second = Math.round((Math.ceil(JoueleInstance.getTrack().player["howler"].seek()) - JoueleInstance.getTrack().player["howler"].seek()) * 1e3) / 1e3;
                setTimeout(function() {
                    Redraw.updateState.call(JoueleInstance, true);

                    if (JoueleInstance.getTrack().player["updateStateTimer"]) {
                        clearInterval(JoueleInstance.getTrack().player["updateStateTimer"]);
                    }

                    if (!JoueleInstance.getTrack().player["isPaused"]) {
                        JoueleInstance.getTrack().player["updateStateTimer"] = setInterval(function() {
                            if (JoueleInstance.getTrack().player["howler"]) {
                                if (previous_timestamp && previous_timestamp === JoueleInstance.getTrack().player["howler"].seek()) {
                                    Preloader.show.call(JoueleInstance, 200);
                                } else {
                                    Preloader.hide.call(JoueleInstance);
                                }
                                previous_timestamp = JoueleInstance.getTrack().player["howler"].seek();
                            }
                            Redraw.updateState.call(JoueleInstance, true);
                        }, 1000);
                    }
                }, nearest_second * 1000);

                if (JoueleInstance.getTrack().player["isPlaying"]) {
                    JoueleInstance.getTrack().player["seekTime"] = null;
                    JoueleInstance.getTrack().player["seekPosition"] = null;
                }

                if (typeof $.Jouele.history[0].getTrack() !== "undefined" && $.Jouele.history[0].getTrack().player === JoueleInstance.getTrack().player && (!JoueleInstance.getTrack().player["isPlaying"] || !JoueleInstance.getTrack().player["isStarted"])) {
                    Core.play.call(JoueleInstance);
                }

                return JoueleInstance;
            },
            "onEnd": function() {
                var JoueleInstance = this;

                Preloader.hide.call(JoueleInstance);

                clearInterval(JoueleInstance.getTrack().player["updateStateTimer"]);
                JoueleInstance.getTrack().player["updateStateTimer"] = null;

                JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingPosition"] = 100;
                Redraw.updateState.call(JoueleInstance);

                if (!JoueleInstance.getOptions().repeat) {
                    Core.Interface.makeInterfacePause.call(JoueleInstance);
                }

                JoueleInstance.getTrack().player["seekingOnTimeline"]["isSeeking"] = false;
                JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingInstance"] = false;
                JoueleInstance.getTrack().player["seekingOnTimeline"]["seekingPosition"] = null;

                JoueleInstance.getTrack().player["seekTime"] = null;
                JoueleInstance.getTrack().player["seekPosition"] = null;

                JoueleInstance.getTrack().player["isEnded"] = true;

                Core.playNext.call(JoueleInstance);

                return JoueleInstance;
            },
            "onLoad": function() {
                var JoueleInstance = this;

                JoueleInstance.getTrack().player["isLoaded"] = true;
                Redraw.updateLength.call(JoueleInstance);

                Redraw.updateControlsClasses.call(JoueleInstance, "jouele-is-loaded", "add");

                if (!JoueleInstance.getTrack().player["seekingOnTimeline"]["isSeeking"]) {
                    if (JoueleInstance.getTrack().player["seekPosition"] > 0) {
                        if (JoueleInstance.getTrack().player["isPaused"]) {
                            /* Silent seek */
                            JoueleInstance.getTrack().player["seekTime"] = Math.round(parseFloat(JoueleInstance.getTotalTime() * (JoueleInstance.getTrack().player["seekPosition"] / 100)) * 1e2) / 1e2;
                            JoueleInstance.getTrack().player["howler"].seek(JoueleInstance.getTrack().player["seekTime"]);
                        } else {
                            Core.seek.call(JoueleInstance, JoueleInstance.getTrack().player["seekPosition"]);
                        }
                    } else if (JoueleInstance.getTrack().player["seekTime"]) {
                        if (JoueleInstance.getTrack().player["isPaused"]) {
                            /* Silent seek */
                            JoueleInstance.getTrack().player["howler"].seek(JoueleInstance.getTrack().player["seekTime"]);
                        } else {
                            Core.playFrom.call(JoueleInstance, JoueleInstance.getTrack().player["seekTime"]);
                        }
                    } else {
                        if (!JoueleInstance.getTrack().player["isPaused"]) {
                            Core.play.call(JoueleInstance);
                        }
                    }
                }

                Redraw.updateState.call(JoueleInstance);

                return JoueleInstance;
            }
        }
    };

    /* Instance */
    var Jouele = function($element, options) {
        /* Create track */
        if (typeof tracks[options.href] === "undefined") {
            tracks[options.href] = Init.createTrack(options.href);
        }

        /* Set options */
        options = Init.checkOptions(options);

        /* Playlist */
        var $playlist = $();
        var playlist = [];

        /* Parent player */
        var parent_jouele;

        /* Set API getters */
        this.getOptions = function() { return options; };
        this.getHref = function() { return this.getOptions().href; };
        this.getTrack = function() { return tracks[this.getHref()]; };
        this.getTitle = function() { return typeof this.getTrack() !== "undefined" ? this.getTrack().player["title"] : ""; };
        this.getTotalTime = function() { return typeof this.getTrack() !== "undefined" ? this.getTrack().player["totalTime"] : 0; };
        this.getElapsedTime = function() { return typeof this.getTrack() !== "undefined" ? this.getTrack().player["elapsedTime"] : 0; };
        this.getRemainingTime = function() { return typeof this.getTrack() !== "undefined" ? this.getTrack().player["remainingTime"] : 0; };
        this.getPlaylistDOM = function() { return $playlist };
        this.getPlaylist = function() { return playlist };
        this.isPlaying = function() { return typeof this.getTrack() !== "undefined" ? this.getTrack().player["isPlaying"] : false; };
        this.isPlayed = function() { return typeof this.getTrack() !== "undefined" ? this.getTrack().player["isPlayed"] : false; };
        this.isPaused = function() { return typeof this.getTrack() !== "undefined" ? this.getTrack().player["isPaused"] : false; };
        this.isBroken = function() { return typeof this.getTrack() !== "undefined" ? this.getTrack().player["isBroken"] : false; };

        /* Set API setters */
        this.setOptions = function(new_options) {
            if (typeof this.getTrack() !== "undefined") {
                return this;
            }

            options = $.extend(
                options,
                Init.checkNewOptions(options, new_options)
            );
            if (this.getTrack().player["howler"]) {
                this.getTrack().player["howler"].loop(options.repeat);
            }
            Redraw.updateTitle.call(this);
            return this;
        };

        /* Set API methods */
        this.play = function() {
            return typeof this.getTrack() !== "undefined" ? this.getTrack().player.play.call(this) : this;
        };
        this.pause = function() {
            return typeof this.getTrack() !== "undefined" ? this.getTrack().player.pause.call(this) : this;
        };
        this.playFrom = function(time) {
            return typeof this.getTrack() !== "undefined" ? this.getTrack().player.playFrom.call(this, time) : this;
        };
        this.seek = function(seekPositionPercent) {
            return typeof this.getTrack() !== "undefined" ? this.getTrack().player.seek.call(this, seekPositionPercent) : this;
        };
        this.destroy = function() {
            return typeof this.getTrack() !== "undefined" ? Core.destroy.call(this) : this;
        };

        /* Set API properties */
        this.$container = $();
        this.$link = $element;
        $playlist = Init.findPlaylistInDOM.call(this);
        playlist = $.Jouele.playlist[Init.getPlaylistIndex.call(this)];

        /* Push instance */
        this.getTrack().instances.push(this);

        /* Init */
        Redraw.updateLength.call(this);
        Init.createJoueleDOM.call(this);
        Redraw.updateTitle.call(this);
        Init.checkGlobalOptions.call(this);
        Init.initInnerControls.call(this);
        Init.insertJoueleDOM.call(this);

        /* Clear */
        $element.removeClass("jouele_destroyed");

        /* Fill data with instance */
        $element.data("jouele", this);

        return this;
    };

    /* Global object */
    $.Jouele = {
        tracks: tracks,
        playlist: [],
        history: [],
        options: {
            pauseOnSpace: false,
            playOnSpace: false,
            scrollOnSpace: true
        },
        helpers: {
            formatTime: Helpers.formatTime,
            makeSeconds: Helpers.makeSeconds
        },
        version: version
    };

    /* Handle spacebar keypress */
    $(document).off("keydown.jouele").on("keydown.jouele", Handlers.spacebar);

    /* Handle timeline events */
    $(document).off("mouseup.jouele touchend.jouele touchcancel.jouele mousemove.jouele touchmove.jouele").on("mouseup.jouele touchend.jouele touchcancel.jouele mousemove.jouele touchmove.jouele", Handlers.timeline);


    /* jQuery */
    $.fn.jouele = function(options) {
        var jouele_instance;

        if (typeof Howl === "undefined") {
            Helpers.showError("Please include `howler.js 2.0.9+` into your page — it is necessary for Jouele");
            return this;
        }

        if (this.length === 1) {
            jouele_instance = this.data("jouele");

            if (jouele_instance instanceof Jouele) {
                if (typeof options === "string" && typeof jouele_instance[options] !== "undefined" && typeof jouele_instance[options] === "function" && typeof jouele_instance[options].nodeType !== "number") {
                    return jouele_instance[options].call(jouele_instance);
                }

                return this;
            }
        }

        return this.each(function() {
            var $element = $(this);
            jouele_instance = $element.data("jouele");

            if (!$element.hasClass("jouele")) {
                Helpers.showError("Please add `jouele` class to this element");
                return this;
            }

            if (!$element.attr("href")) {
                Helpers.showError("Please add `href` attribute to this element and specify URL to mp3-file");
                return this;
            }

            if (!$element.data("jouele")) {
                Init.createJouele($element, options);
            }
        });
    };

    /* Autoload Jouele */
    var autoLoadJouele = function() {
        $("a.jouele[href]").jouele();
    };
    $(autoLoadJouele);
}(jQuery));
