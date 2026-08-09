const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { JSDOM } = require("jsdom");

const source = fs.readFileSync(path.join(__dirname, "../src/jouele.js"), "utf8");

function setup(markup) {
    const dom = new JSDOM(`<!doctype html><body>${markup}</body>`, { runScripts: "outside-only" });
    const { window } = dom;
    const $ = require("jquery")(window);
    const $elements = $("a.jouele, .jouele-control[data-type]");
    const howlers = [];

    window.jQuery = window.$ = $;
    window.requestAnimationFrame = undefined;
    window.cancelAnimationFrame = function() {};
    window.Howl = function(options) {
        this._sounds = [];
        this._loop = options.loop;
        this.load = function() {};
        this.play = function() {};
        this.pause = function() {};
        this.seek = () => 0;
        this.state = () => "unloaded";
        this.duration = () => 0;
        this.loop = value => { this._loop = value; };
        this.unload = function() {};
        howlers.push(this);
    };

    window.eval(source);
    $elements.jouele();

    const instances = {};
    $elements.each(function() {
        if (this.id) {
            instances[this.id] = $(this).data("jouele");
        }
    });

    return { window, $, instances, howlers };
}

test("setOptions updates documented player behavior and visual options", () => {
    const env = setup('<a id="track" class="jouele" data-length="10" href="audio.mp3">Original title</a>');
    const instance = env.instances.track;

    instance.play();
    instance.setOptions({
        title: "Updated title",
        length: 125,
        repeat: true,
        skin: "blue",
        hideTimelineOnPause: true,
        href: "different.mp3",
        static: true
    });

    assert.equal(instance.getHref(), "audio.mp3");
    assert.equal(instance.getTitle(), "Updated title");
    assert.equal(instance.getTotalTime(), 125);
    assert.equal(instance.getOptions().repeat, true);
    assert.equal(instance.getOptions().static, false);
    assert.equal(env.howlers[0]._loop, true);
    assert.equal(instance.$container.find("[data-type=title]").text(), "Updated title");
    assert.equal(instance.$container.find("[data-type=time-total]").text(), "2:05");
    assert.ok(instance.$container.hasClass("jouele-skin-blue"));
    assert.ok(instance.$container.hasClass("jouele_timeline_hide"));
});

test("reports the Jouele 4.0 public version", () => {
    const env = setup("");

    assert.equal(env.$.Jouele.version, "4.0");
});

test("setOptions updates a static player without creating Howler", () => {
    const env = setup('<a id="track" class="jouele" data-static="true" data-length="10" href="audio.mp3">Static</a>');
    const instance = env.instances.track;

    instance.setOptions({ title: "Updated static", length: "1:30" });

    assert.equal(instance.getTitle(), "Updated static");
    assert.equal(instance.getTotalTime(), 90);
    assert.equal(instance.$container.find("[data-type=title]").text(), "Updated static");
    assert.equal(instance.$container.find("[data-type=time-total]").text(), "1:30");
    assert.equal(env.howlers.length, 0);
});

test("invalid length values fall back safely instead of breaking initialization", () => {
    const env = setup('<a id="track" class="jouele" data-length="true" href="audio.mp3">Track</a>');
    const instance = env.instances.track;

    assert.equal(instance.getTotalTime(), 0);
    assert.equal(instance.getOptions().length, 0);
    assert.equal(instance.$container.find("[data-type=time-total]").text(), "");

    instance.setOptions({ length: { seconds: 30 } });
    assert.equal(instance.getOptions().length, 0);
});

test("destroying a player while a standalone timeline seeks does not throw", () => {
    const env = setup([
        '<a id="track" class="jouele" href="audio.mp3">Track</a>',
        '<div id="timeline" class="jouele-control" data-type="timeline" data-href="audio.mp3"></div>'
    ].join(""));
    const instance = env.instances.track;
    const $timeline = env.instances.timeline.$control;

    const event = env.$.Event("mousedown", { which: 1, pageX: 0 });
    event.originalEvent = { touches: [], changedTouches: [] };
    $timeline.trigger(event);

    assert.doesNotThrow(() => instance.destroy());
    assert.equal(instance.$link.parent().length, 1);
    assert.equal($timeline.data("jouele"), env.instances.timeline);
});

test("setOptions refreshes global spacebar settings in both directions", () => {
    const env = setup('<a id="track" class="jouele" data-space-control="true" href="audio.mp3">Track</a>');
    const instance = env.instances.track;

    assert.equal(env.$.Jouele.options.playOnSpace, true);
    assert.equal(env.$.Jouele.options.pauseOnSpace, true);
    assert.equal(env.$.Jouele.options.scrollOnSpace, false);

    instance.setOptions({ spaceControl: false });
    assert.equal(env.$.Jouele.options.playOnSpace, false);
    assert.equal(env.$.Jouele.options.pauseOnSpace, false);
    assert.equal(env.$.Jouele.options.scrollOnSpace, true);
});
