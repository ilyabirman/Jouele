function setupDOM () {
	var html = [
			'<a href="http://audio.ilyabirman.ru/Ilya%20Birman%20-%20News.mp3" class="jouele-track" data-length="9:54">Ilya Birman – News</a>'
		].join('');

	$('<div id="fixture"/>')
		.html(html)
		.appendTo(document.body);
}

function waitPlayerReady (cb) {
	$.Jouele.$jPlayer.on($.jPlayer.event.ready, cb);
}

function getInstance(elm) {
	return $(elm).data('jouele');
}
