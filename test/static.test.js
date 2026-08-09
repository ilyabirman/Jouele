const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { JSDOM } = require("jsdom");

const source = fs.readFileSync(path.join(__dirname, "../src/jouele.js"), "utf8");

function setup(markup, withHowler = true) {
    const dom = new JSDOM(`<!doctype html><body>${markup}</body>`, { runScripts: "outside-only" });
    const { window } = dom;
    const $ = require("jquery")(window);
    const $links = $("a.jouele");
    let howlerConstructions = 0;
    let loads = 0;

    window.jQuery = window.$ = $;
    window.requestAnimationFrame = undefined;
    window.cancelAnimationFrame = function() {};

    if (withHowler) {
        window.Howl = function(options) {
            howlerConstructions += 1;
            this._sounds = [];
            this.load = () => { loads += 1; };
            this.play = function() {};
            this.pause = function() {};
            this.seek = () => 0;
            this.state = () => "unloaded";
            this.duration = () => 0;
            this.loop = function() {};
            this.unload = function() {};
            this._options = options;
        };
    }

    window.eval(source);
    $links.jouele();

    const instances = {};
    $links.each(function() { instances[this.id] = $(this).data("jouele"); });

    return { window, $, instances, getHowlerConstructions: () => howlerConstructions, getLoads: () => loads };
}

test("static links use the normal initial player DOM with length and zero progress", () => {
    const env = setup('<a id="track" class="jouele" data-static="true" data-length="123" href="audio.mp3">Track title</a>', false);
    const instance = env.instances.track;
    const $player = instance.$container;

    assert.ok($player.hasClass("jouele_inited"));
    assert.ok($player.hasClass("jouele_static"));
    assert.ok($player.find(".jouele-info-control-button-icon_play").hasClass("jouele-is-available"));
    assert.equal($player.find("[data-type=title]").text(), "Track title");
    assert.equal($player.find("[data-type=time-elapsed]").text(), "0:00");
    assert.equal($player.find("[data-type=time-total]").text(), "2:03");
    assert.equal($player.find("[data-type=elapsed]").css("width"), "0%");
    assert.equal($player.find("[data-type=position]")[0].style.left, "0%");
    assert.equal($player.find(".jouele-info-control-button-icon_unavailable:not(.jouele-hidden)").length, 0);
    assert.equal(instance.$link.attr("href"), "audio.mp3");
});

test("static players create no Howler, load nothing, and join no shared runtime collections", () => {
    const env = setup('<div class="jouele-playlist"><a id="track" class="jouele" data-static="true" data-length="10" data-space-control="true" href="audio.mp3">Static</a></div>');
    const instance = env.instances.track;
    const $player = instance.$container;

    $player.find("[data-type=play-pause]").trigger("click");
    $player.find("[data-type=timeline]").trigger(env.$.Event("mousedown", { which: 1, pageX: 5 }));
    instance.play().playFrom(5).seek(50).pause();

    assert.equal(env.getHowlerConstructions(), 0);
    assert.equal(env.getLoads(), 0);
    assert.deepEqual(Object.keys(env.$.Jouele.tracks), []);
    assert.equal(env.$.Jouele.playlist.length, 0);
    assert.equal(env.$.Jouele.history.length, 0);
    assert.equal(env.$.Jouele.options.pauseOnSpace, false);
    assert.equal(env.$.Jouele.options.playOnSpace, false);
    assert.equal(env.$.Jouele.options.scrollOnSpace, true);
    assert.equal($player.find(".jouele-is-interactive").length, 0);
    assert.equal(env.$._data($player.find("[data-type=play-pause]")[0], "events"), undefined);
    assert.equal(env.$._data($player.find("[data-type=timeline]")[0], "events"), undefined);
});

test("a static player is isolated from a regular player with the same href", () => {
    const env = setup([
        '<a id="static" class="jouele" data-static="true" data-length="20" href="same.mp3">Static</a>',
        '<a id="regular" class="jouele" data-length="20" href="same.mp3">Regular</a>'
    ].join(""));
    const staticInstance = env.instances.static;
    const regularInstance = env.instances.regular;

    regularInstance.play();

    assert.equal(env.getHowlerConstructions(), 1);
    assert.equal(env.getLoads(), 1);
    assert.equal(env.$.Jouele.tracks["same.mp3"].instances.length, 1);
    assert.equal(env.$.Jouele.tracks["same.mp3"].instances[0], regularInstance);
    assert.equal(env.$.Jouele.history[0], regularInstance);
    assert.ok(regularInstance.$container.find(".jouele-is-playing").length > 0);
    assert.equal(staticInstance.$container.find(".jouele-is-playing, .jouele-is-paused, .jouele-is-buffering").length, 0);
    assert.equal(staticInstance.$container.find("[data-type=elapsed]").css("width"), "0%");
    assert.equal(staticInstance.$container.find("[data-type=time-elapsed]").text(), "0:00");
});

test("only the exact data-static value true enables static mode", () => {
    for (const value of ["false", "TRUE", "1", "yes", ""]) {
        const env = setup(`<a id="track" class="jouele" data-static="${value}" href="${value || "empty"}.mp3">Regular</a>`);
        const instance = env.instances.track;

        instance.play();
        assert.equal(instance.$container.hasClass("jouele_static"), false, value);
        assert.equal(env.getHowlerConstructions(), 1, value);
        assert.equal(env.$.Jouele.playlist.length, 1, value);
        assert.equal(env.$.Jouele.history.length, 1, value);
    }
});

test("a static player can be destroyed and initialized again", () => {
    const env = setup('<div id="host"><a id="track" class="jouele" data-static="true" data-length="10" href="audio.mp3">Static</a></div>');
    const instance = env.instances.track;
    const restoredLink = instance.destroy();

    assert.equal(restoredLink[0], instance.$link[0]);
    assert.equal(restoredLink.attr("href"), "audio.mp3");
    assert.equal(restoredLink.parent().attr("id"), "host");
    assert.equal(restoredLink.data("jouele"), undefined);
    assert.equal(instance.$container.parent().length, 0);
    assert.equal(env.$.Jouele.playlist.length, 0);
    assert.deepEqual(Object.keys(env.$.Jouele.tracks), []);

    restoredLink.jouele();
    assert.ok(restoredLink.data("jouele"));
    assert.notEqual(restoredLink.data("jouele"), instance);
    assert.ok(restoredLink.data("jouele").$container.hasClass("jouele_static"));
    assert.equal(env.getHowlerConstructions(), 0);
});
