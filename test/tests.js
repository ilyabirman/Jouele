
var $elms;
var joueleInstance;
var joueleOpts = {playFrom: '3:30'};
var isjPlayerReady = false;

var lifecycle = {
	beforeEach: function (assert) {
		setupDOM();
		$elms = $('.jouele-track').jouele(joueleOpts || {});
		joueleInstance = getInstance($elms[0]);

		if (!isjPlayerReady) {
			var done = assert.async();
			waitPlayerReady(function () {
				isjPlayerReady = true;
				done();
			});
		}
	},

	afterEach: function () {
		$elms && $elms.each(function () {
			var $link = $(this).jouele('destroy');
			$link && $link.remove();
		});
		$('#fixture').remove();
		$elms = null;
		joueleInstance = null;
	}
};

module('Initialization', lifecycle);

test('jouele player', function () {
  ok(typeof $.fn.jouele !== 'undefined', 'jouele in jQuery.fn');
  ok($.Jouele);
  equal($.Jouele.playlist.length, 1, 'playlist length equal track numbers');
});

test('jPlayer', function () {
  ok($.Jouele.$jPlayer !== null, 'jPlayer instance exist');
	equal(joueleInstance.$jPlayer, $.Jouele.$jPlayer, 'jPlayer instance set to context');
});

test('DOM', function () {
	var $container = joueleInstance.$container;

	ok($container, 'container exist');
	ok($container.attr('id'), 'id attribute attached');
	equal($container.data('jouele'), joueleInstance, 'set Jouele instance');
	ok(document.getElementById($container.attr('id')));
});

test('event handlers - play/pause controls', function (assert) {
	expect(2);
	var done = assert.async();
	var originalPlayHandler = joueleInstance.onPlay;

	joueleInstance.onPause = function () {
		ok(true, 'pause handler invoked');
		done();
	}

	joueleInstance.onPlay = function () {
		ok(true);
		originalPlayHandler.call(joueleInstance);
		joueleInstance.$container.find('.jouele-control-button-icon_pause').trigger('click.jouele');
	}

	joueleInstance.$container.find('.jouele-control-button-icon_play').trigger('click.jouele');
});

test('event handlers - seek control', function (assert) {
	var done = assert.async();
	var uniqID = joueleInstance.$container.attr('id');
	var $elmMine = joueleInstance.$container.find('.jouele-mine');

	joueleInstance.onPlay = function () {
		ok(joueleInstance.isSeeking, 'play after willSeekTo');
		done();
	}

	$elmMine.trigger(
		$.Event('mousedown.' + uniqID, {
			pageX: $elmMine.offset().left + ($elmMine.width() / 2),
			which: 1
		})
	);
});

test('evet handlers - space keydown play/pause', function (assert) {
	expect(3);
	var done = assert.async();
	var _onPlay = joueleInstance.onPlay;
	var _onPause = joueleInstance.onPause;
	var playInvoked = 0;

	joueleInstance.onPause = function () {
		ok(true, 'pause after space keydown');
		_onPause.call(joueleInstance);
		$(document).trigger($.Event('keydown.jouele', {keyCode: 32}));
	}

	joueleInstance.onPlay = function () {
		playInvoked++;

		if (playInvoked === 2) {
			ok(true, 'play after onPause and space keydown');
			done();
			return;
		}

		ok(true, 'play on space keydown');
		_onPlay.call(joueleInstance);
		$(document).trigger($.Event('keydown.jouele', {keyCode: 32}));
	}

	joueleInstance.play();
});

module('API', lifecycle);

test('play', function (assert) {
	expect(3);
	var done = assert.async();
	var originalPlayHandler = joueleInstance.onPlay;

	joueleInstance.onPlay = function () {
		// invoke original handler
		originalPlayHandler.call(joueleInstance);

		ok(joueleInstance.isPlaying && joueleInstance.isPlayed, 'playing status changed');
		strictEqual($.Jouele.lastPlayed, joueleInstance, 'current track now is last played');
		ok(joueleInstance.$container.hasClass('jouele-status-playing'), 'update container classname');
		done();
	}

	joueleInstance.play();
});

test('pause', function (assert) {
	var done = assert.async();
	var originalPlayHandler = joueleInstance.onPlay;
	var originalPauseHandler = joueleInstance.onPause;

	joueleInstance.onPause = function () {
		originalPauseHandler.call(joueleInstance);
		ok(!joueleInstance.isPlaying && !joueleInstance.isSeeking, 'player in pause state');
		notOk(joueleInstance.$container.hasClass("jouele-status-playing"), 'container update classname');
		done();
	}

	joueleInstance.onPlay = function () {
		originalPlayHandler.call(joueleInstance);
		joueleInstance.pause();
	}

	joueleInstance.play();
});

/**
	When send stop command jPlayer trigger pause event
 */
test('stop', function (assert) {
	var done = assert.async();
	var originalPlayHandler = joueleInstance.onPlay;

	joueleInstance.onPause = function () {
		ok(true, 'onPause invoked after stop');
		done();
	}

	joueleInstance.onPlay = function () {
		originalPlayHandler.call(joueleInstance);
		joueleInstance.stop();
	}

	joueleInstance.play();
});

test('destroy', function (assert) {
	var uniqID = joueleInstance.$container.attr('id');

	ok(document.getElementById(uniqID), 'container exist in DOM');

	var $link = joueleInstance.destroy();
	ok($link, 'destroy must return original element');
	notOk(document.getElementById(uniqID), 'container must be removed from DOM');

	$link.remove();
	$elms = null;
});

QUnit.module('Options', lifecycle);

test('playFrom', function (assert) {
	assert.expect(2);
	var done = assert.async();

	strictEqual(joueleInstance.playFrom, 210);
	joueleInstance.onPlay = function () {
		ok(true, 'onPlay callback');
		done();
	}
	joueleInstance.play();
});
