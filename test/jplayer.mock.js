/**
 * Mocked jPlayer plugin
 */
(function ($) {

	'use strict';

	var TRACK_DURATION_TIME = 180; // seconds
	var UPDATE_INTERVAL = 0.2; // seconds
	var DEFAULT_STATUS = { // Cut little bit
		src: '',
		seekPercent: 0,
		currentPercentAbsolute: 0,
		currentTime: 0,
		duration: 0,
		ended: 0
	};

	$.jPlayer = function (element, options) {
		this.$element = $(element);
		this.options = $.extend({}, options || {});
		this.isPlaying = false;
		this.timerId = null;
		this.status = $.extend({}, DEFAULT_STATUS, {duration: TRACK_DURATION_TIME * 1000});
		this.fromTime = 0;

		setTimeout($.proxy(this.onReady, this), 10);
	}

	$.jPlayer.event = {};

	$.each(
		['progress', 'play', 'pause', 'timeupdate', 'ready'],
		function() {
			$.jPlayer.event[this] = 'jPlayer_' + this;
		}
	);

	$.extend($.jPlayer.prototype, {

		setMedia: function (data) {
			this.status.src = data.mp3;
		},

		play: function () {
			if (!this.status.src) {
				this.onError({reason: 'Set media before play'});
				return;
			}

			this.isPlaying = true;
			this.startTime = new Date();
			this.timerId = setInterval($.proxy(this.emulatePlay, this), UPDATE_INTERVAL * 1000);

			this.$element.trigger($.jPlayer.event.play);
		},

		emulatePlay: function () {
			this._updateStatus();
			this.onTimeupdate();
		},

		_updateStatus: function () {
			var currentTime = this.fromTime + ((new Date) - this.startTime);
			this.status.currentTime = currentTime;
			this.status.currentPercentAbsolute = (this.status.duration > 0) ? 100 * currentTime / this.status.duration : 0;

			if (this.status.currentPercentAbsolute >= 100) {
				this.status.ended = true;
				this.emulateEnd();
			}
		},

		emulateEnd: function () {
			clearInterval(this.timerId);
			this.timerId = null;
			this.isPlaying = false;
			this.$element.trigger($.jPlayer.event.pause);
		},

		pause: function () {
			this.fromTime = this.status.currentTime;
			this.emulateEnd();
		},

		stop: function () {
			this.fromTime = 0;
			this.emulateEnd();
		},

		seekTo: function (percent) {
			this.fromTime = this.status.duration * Math.min(percent / 100, 100);
			!this.isPlaying && this.play();
		},

		onProgress: function () {
			this.$element.trigger($.Event($.jPlayer.event.progress, {jPlayer: this}));
		},

		onTimeupdate: function () {
			this.$element.trigger($.Event($.jPlayer.event.timeupdate, {jPlayer: this}));
		},

		playHead: function (percent) {
			this.seekTo(percent);
		},

		onReady: function () {
			this.options.ready && this.options.ready();
			this.$element.trigger($.jPlayer.event.ready);
		},

		onError: function (error) {
			this.options.error && this.options.error(error);
		}

	});

	$.fn.jPlayer = function (options) {
		var returnValue = this;
		var isCallMethod = typeof options === 'string';
		var args = Array.prototype.slice.call(arguments, 1);

		if (isCallMethod) {
			this.each(function () {
				var instance = $(this).data('jPlayer');
				var methodValue = instance && $.isFunction(instance[options]) ? instance[options].apply(instance, args) : instance;
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue;
					return false;
				}
			});
		} else {
			this.each(function () {
				var instance = $(this).data('jPlayer');
				if (instance) {
					return returnValue;
				}
				$(this).data('jPlayer', new $.jPlayer(this, options));
			});
		}

		return returnValue;
	}

})(jQuery);
