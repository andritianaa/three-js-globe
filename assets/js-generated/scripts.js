function createGlobe() {
    var e = [];
    globeCount++,
        $("#globe canvas").remove(),
        globe = new Globe(window.innerWidth,
            window.innerHeight, {
            font: "Arial", data: e,
            viewAngle: 0
        }),
        $("#globe").append(globe.domElement),
        globe.init(start),
        globe.controls.rotateUp(.3),
        globe.controls.rotateLeft(-1.6),
        globe.tick()
}
function onWindowResize() {
    globe.camera.aspect = window.innerWidth / window.innerHeight,
        globe.camera.updateProjectionMatrix(),
        globe.renderer.setPixelRatio(window.devicePixelRatio),
        globe.renderer.setSize(window.innerWidth, window.innerHeight)
}

function onZoom(e) {
    var t = globe.scale + e.originalEvent.wheelDelta / 1200;
    globe.setScale(t)
}

function onMouseMove(e) {
    mouse.x = e.clientX / window.innerWidth * 2 - 1,
        mouse.y = 2 * -(e.clientY / window.innerHeight) + 1
}

function onMouseDown(e) {
    mouseDown = !0
}

function onTouchEnd(e) {
    mouseDown = !0,
        touch = !0
}
function onClick(e) {
    clicked = !0
}
function onKeyUp(e) {
    27 == e.keyCode && exitZoom()
}
function roundNumber(e) {
    return Math.round(100 * e) / 100
}
function projectionToLatLng(e, t, r, n) {
    return {
        lat: 90 - 180 * (n / t),
        lon: 360 * (r / e) - 180
    }
}
function clickMarker(e) {
    globe.setPosition(e.phi, e.theta)
    globe.setZoom(4),
        markers.activateLevel(2),
        markers.setZoom(4),
        $("#close-zoom").removeClass("hidden")
}
function exitZoom() {
    globe.setZoom(1),
        markers.setZoom(1),
        $("#close-zoom").addClass("hidden"),
        markers.setActive(null),
        filterSearch()
}
function animateMarker(e, t) {
    e.setSelected(void 0 != t[0] && t[0].object == e.sprite),
        e.selected && ($("#globe").css("cursor", "pointer"),
            mouseDown && (mouseDown = !1, activeClick = !0),
            clicked && activeClick && (clickMarker(e),
                (2 == markers.level || e instanceof Installation) && markers.setActive(e),
                filterSearch(), clicked = !1),
            touch && mouse.set(-2, -2)),
        e.tick()
}
function animate() {
    for (var e in tweens) tweens[e].start();
    tweens = [],
        raycaster.setFromCamera(mouse, globe.camera);
    var t = raycaster.intersectObjects(markers.root.children);
    TWEEN.update(),
        globe && (globe.tick(),
            1 == globe.zoom && globe.camera.zoom > 2.5 && (globe.setCustomZoom(4),
                markers.activateLevel(2),
                markers.setZoom(4),
                $("#close-zoom").removeClass("hidden")),
            4 == globe.zoom && globe.camera.zoom < 2.5 && (markers.activateLevel(1),
                globe.setCustomZoom(1),
                markers.setZoom(1),
                $("#close-zoom").addClass("hidden"),
                markers.setActive(null),
                filterSearch())),
        $("#globe").css("cursor", "auto");
    for (var e in markers.markers) {
        var r = markers.markers[e];
        animateMarker(r, t)
    }
    for (var e in markers.clusters[markers.level]) {
        var n = markers.clusters[markers.level][e];
        animateMarker(n, t)
    }
    clicked && markers.activeMarker && (markers.setActive(null),
        filterSearch()),
        globe && globe.render(),
        mouseDown && (activeClick = !1, mouseDown = !1),
        clicked = !1,
        lastTickTime = Date.now(),
        globe.camera.updateProjectionMatrix(),
        requestAnimationFrame(animate)
}
function start() {
    1 == globeCount && ($("#apply-button").click(function (e) {
        globe.destroy(function () {
            createGlobe()
        })
    }),
    animate())
}
function getSites(e) {
    $.get(API_URL, function (t) {
        var r = [];
        console.log(t);
        let temp;
        for (var n in t){
            temp = {
                name : t[n].name,
                latitude: t[n].coordonates[0],
                longitude: t[n].coordonates[1],
                id : t[n]._id,
                description: t[n].description
            }
            r.push(temp);
        }
        console.log(r);
        e(r)
    })
}

function animate_tooltip() {
    var e = 150,
        t = ["solar", "battery", "consumption", "ac"]; $("#keyframe_css").remove(),
            $("body").append("<style id='keyframe_css'></style>"),
            $.each(t, function (t, r) {
                var n = $(".js-donut-chart." + r),
                    i = 100 - n.data("percentage"); i = i / 100 * e,
                        n.removeClass(r),
                        n.css("display", "none").height(),
                        n.css("display", "inline-block"),
                        n.find("span.donut_chart__label").text(n.data("label"));
                var o = "@-webkit-keyframes " + r + " {to {stroke-dashoffset: " + i + ";}} @keyframes " + r + " {to {stroke-dashoffset: " + i + ";  }}";
                $("#keyframe_css").append(o),
                    n.addClass(r)
            })
}
function get_percentage(e, t, r) {
    var t = Number(t); return 100 * ((Number(e) - t) / (Number(r) - t))
}

function load_tooltip(e) {
    $(".popup__header__name").text(e.name)
    $(".popup__description").text(e.description)
    
}
function filterSearch() {
    setTimeout(function () {
        var e = $(".js-filter > li > a"), t = [], r = []; e.each(function () {
            var e = $(this).data("match");
            markers.activeMarker && markers.activeCluster instanceof Cluster && (e = e && void 0 != markers.activeCluster.markers[$(this).data("id")]), e ? r.push(this) : t.push(this)
        }),
            $(t).parent("li").hide(),
            $(r).parent("li").show();
        var n = $(".js-filter li:visible");
        $(".js-filter-num-installations").text(n.length - 1), 2 === n.length ? $(".js-filter-multi").hide() : $(".js-filter-multi").show()
    }, 500)
}
function buildAxes(e) {
    var t = new THREE.Object3D;
    return t.add(buildAxis(new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(e, 0, 0), 16711680, !1)),
        t.add(buildAxis(new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(-e, 0, 0), 16711680, !0)),
        t.add(buildAxis(new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, e, 0), 65280, !1)),
        t.add(buildAxis(new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, -e, 0), 65280, !0)),
        t.add(buildAxis(new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, e), 255, !1)),
        t.add(buildAxis(new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -e), 255, !0)),
        t
}
function buildAxis(e, t, r, n) {
    var i,
        o = new THREE.Geometry;
    i = n ? new THREE.LineDashedMaterial({
        linewidth: 3, color: r, dashSize: 3, gapSize: 3
    }) : new THREE.LineBasicMaterial({
        linewidth: 3, color: r
    }),
        o.vertices.push(e.clone()),
        o.vertices.push(t.clone()),
        o.computeLineDistances();
    var a = new THREE.Line(o, i, THREE.LinePieces);
    return a
}
function Globe(e, t, r) {
    r || (r = {}),
        this.width = e,
        this.height = t,
        this.points = [],
        this.active = !0,
        this.earth = null,
        this.starfield = null,
        this.clouds = null, this.controls = null;
    var n = {
        font: "Inconsolata",
        baseColor: "#ffcc00",
        markerColor: "#ffcc00",
        pinColor: "#00eeee",
        satelliteColor: "#ff0000",
        blankPercentage: 0,
        thinAntarctica: .01,
        introLinesAltitude: 1.1,
        introLinesDuration: 2e3,
        introLinesColor: "#8FD8D8",
        introLinesCount: 60,
        scale: 6,
        cameraDistance: 2,
        dayLength: 48e4,
        pointsPerDegree: 1.1,
        pointSize: .6,
        pointsVariance: .2,
        maxPins: 500,
        maxMarkers: 4,
        data: [],
        tiles: [],
        viewAngle:
            Math.PI
    };
    for (var i in n) this[i] || (this[i] = n[i], r[i] && (this[i] = r[i]));
    this.renderer = new THREE.WebGLRenderer({
        alpha: !0,
        antialias: !0
    }),
        this.renderer.setClearColor(0, 0),
        this.renderer.setPixelRatio(window.devicePixelRatio),
        this.renderer.setSize(this.width, this.height), this.domElement = this.renderer.domElement
}
function Marker(e, t, r, n) {
    this.material = new THREE.SpriteMaterial({
        map: n,
        color: 16777215,
        depthTest: !1,
        transparent: !0
    }),
        this.sprite = new THREE.Sprite(this.material),
        this.shadowMaterial = new THREE.SpriteMaterial({
            map: textures.shadow,
            color: 16777215,
            depthTest: !1,
            transparent: !0
        }),
        this.shadowSprite = new THREE.Sprite(this.shadowMaterial),
        this.sprite.add(this.shadowSprite);
    var i = .5;
    this.lat = t,
        this.lon = r,
        this.phi = (90 - t) * (Math.PI / 180),
        this.theta = (r + 180) * (Math.PI / 180),
        this.position = new THREE.Vector3(-(i * Math.sin(this.phi) * Math.cos(this.theta)),
            i * Math.cos(this.phi),
            i * Math.sin(this.phi) * Math.sin(this.theta)),
        this.sprite.scale.set(.06, .06, .06),
        this.globe = e,
        this.selected = !1,
        this.clustered = !1,
        this.active = !1,
        this.zoom = 1
}
function Installation(e, t, r, n) {
    this.data = n,
        Marker.call(this, e, t, r, textures.marker)
}
function Cluster(e, t, r) {
    this.markers = {},
        Marker.call(this, e, t, r, textures.cluster)
}
function Markers(e) {
    this.markers = {},
        this.clusters = {},
        this.activeMarker = null,
        this.activeCluster = null,
        this.root = new THREE.Object3D,
        e.add(this.root)
}


var globeview = document.getElementById('globe')
globeview.addEventListener('click', function(){
    hideSearchList()
})

function showSearchList() {
    var e = $(".js-search-show"),
        t = e.next();
    e.removeClass("is-visible"),
        setTimeout(function () {
            t.addClass("is-visible"),
                t.find(".js-search-close").show()
        }, 300)
}
function hideSearchList() {
    var e = $(".js-search-close"),
        t = e.parent();
    e.fadeOut("100"),
        t.removeClass("is-visible"),
        setTimeout(function () {
            t.prev(".js-search-show").addClass("is-visible")
        }, 300)
}
function loadTextures(e) {
    var t = new THREE.TextureLoader;
    async.eachSeries(Object.keys(textures), function (e, r) {
        t.load(textures[e], function (t) {
            t.anisotropy = 16, textures[e] = t, r()
        })
    }, e)
}
function createNumberedTexture(e) {
    var t = document.createElement("canvas"),
        r = t.getContext("2d");
    t.width = textures.cluster.image.naturalWidth,
        t.height = textures.cluster.image.naturalHeight,
        r.font = "Bold 100px MuseoSans-300",
        r.drawImage(textures.cluster.image, 0, 0),
        r.textAlign = "center",
        r.fillStyle = "#c03c3b",
        r.fillText(e, t.width / 2, 135);
    var n = new THREE.Texture(t);
    return n.needsUpdate = !0,
        n
}
!function (e, t) {
    "object" == typeof module && "object" == typeof module.exports ? module.exports = e.document ? t(e, !0) : function (e) {
        if (!e.document) throw new Error("jQuery requires a window with a document");
        return t(e)
    } : t(e)
}
("undefined" != typeof window ? window : this, function (e, t) {
        function r(e) {
            var t = "length" in e && e.length,
                r = J.type(e);
            return "function" === r || J.isWindow(e) ? !1 : 1 === e.nodeType && t ? !0 : "array" === r || 0 === t || "number" == typeof t && t > 0 && t - 1 in e
        }
        function n(e, t, r) {
            if (J.isFunction(t))
                return J.grep(e, function (e, n) {
                    return !!t.call(e, n, e) !== r
                });
            if (t.nodeType) return J.grep(e, function (e) {
                return e === t !== r
            });
            if ("string" == typeof t) {
                if (se.test(t)) return J.filter(t, e, r);
                t = J.filter(t, e)
            }
            return J.grep(e, function (e) {
                return X.call(t, e) >= 0 !== r
            })
        }
        function i(e, t) {
            for (; (e = e[t]) && 1 !== e.nodeType;); return e
        }
        function o(e) {
            var t = de[e] = {};
            return J.each(e.match(fe) || [],
                function (e, r) {
                    t[r] = !0
                }),
                t
        } function a() {
            Z.removeEventListener("DOMContentLoaded", a, !1), e.removeEventListener("load", a, !1), J.ready()
        } function s() {
            Object.defineProperty(this.cache = {}, 0, {
                get: function () {
                    return {}
                }
            }), this.expando = J.expando + s.uid++
        } function h(e, t, r) {
            var n; if (void 0 === r && 1 === e.nodeType) if (n = "data-" + t.replace(ye, "-$1").toLowerCase(), r = e.getAttribute(n), "string" == typeof r) {
                try {
                    r = "true" === r ? !0 : "false" === r ? !1 : "null" === r ? null : +r + "" === r ? +r : Te.test(r) ? J.parseJSON(r) : r
                } catch (i) {
                } ve.set(e, t, r)
            } else r = void 0; return r
        } function c() {
            return !0
        } function u() {
            return !1
        } function l() {
            try {
                return Z.activeElement
            } catch (e) {
            }
        } function p(e, t) {
            return J.nodeName(e, "table") && J.nodeName(11 !== t.nodeType ? t : t.firstChild, "tr") ? e.getElementsByTagName("tbody")[0] || e.appendChild(e.ownerDocument.createElement("tbody")) : e
        } function f(e) {
            return e.type = (null !== e.getAttribute("type")) + "/" + e.type, e
        } function d(e) {
            var t = Fe.exec(e.type); return t ? e.type = t[1] : e.removeAttribute("type"), e
        } function E(e, t) {
            for (var r = 0, n = e.length; n > r; r++)ge.set(e[r], "globalEval", !t || ge.get(t[r], "globalEval"))
        } function m(e, t) {
            var r, n, i, o, a, s, h, c; if (1 === t.nodeType) {
                if (ge.hasData(e) && (o = ge.access(e), a = ge.set(t, o), c = o.events)) {
                    delete a.handle, a.events = {}; for (i in c) for (r = 0, n = c[i].length; n > r; r++)J.event.add(t, i, c[i][r])
                } ve.hasData(e) && (s = ve.access(e), h = J.extend({}, s), ve.set(t, h))
            }
        } function g(e, t) {
            var r = e.getElementsByTagName ? e.getElementsByTagName(t || "*") : e.querySelectorAll ? e.querySelectorAll(t || "*") : []; return void 0 === t || t && J.nodeName(e, t) ? J.merge([e], r) : r
        } function v(e, t) {
            var r = t.nodeName.toLowerCase(); "input" === r && be.test(e.type) ? t.checked = e.checked : ("input" === r || "textarea" === r) && (t.defaultValue = e.defaultValue)
        } function T(t, r) {
            var n, i = J(r.createElement(t)).appendTo(r.body), o = e.getDefaultComputedStyle && (n = e.getDefaultComputedStyle(i[0])) ? n.display : J.css(i[0], "display"); return i.detach(), o
        } function y(e) {
            var t = Z, r = Be[e]; return r || (r = T(e, t), "none" !== r && r || (Ue = (Ue || J("<iframe frameborder='0' width='0' height='0'/>")).appendTo(t.documentElement), t = Ue[0].contentDocument, t.write(), t.close(), r = T(e, t), Ue.detach()), Be[e] = r), r
        } function R(e, t, r) {
            var n, i, o, a, s = e.style; return r = r || ze(e), r && (a = r.getPropertyValue(t) || r[t]), r && ("" !== a || J.contains(e.ownerDocument, e) || (a = J.style(e, t)), Ge.test(a) && Ie.test(t) && (n = s.width, i = s.minWidth, o = s.maxWidth, s.minWidth = s.maxWidth = s.width = a, a = r.width, s.width = n, s.minWidth = i, s.maxWidth = o)), void 0 !== a ? a + "" : a
        } function x(e, t) {
            return {
                get: function () {
                    return e() ? void delete this.get : (this.get = t).apply(this, arguments)
                }
            }
        } function H(e, t) {
            if (t in e) return t; for (var r = t[0].toUpperCase() + t.slice(1), n = t, i = Ke.length; i--;)if (t = Ke[i] + r, t in e) return t; return n
        } function b(e, t, r) {
            var n = We.exec(t); return n ? Math.max(0, n[1] - (r || 0)) + (n[2] || "px") : t
        } function w(e, t, r, n, i) {
            for (var o = r === (n ? "border" : "content") ? 4 : "width" === t ? 1 : 0, a = 0; 4 > o; o += 2)"margin" === r && (a += J.css(e, r + xe[o], !0, i)), n ? ("content" === r && (a -= J.css(e, "padding" + xe[o], !0, i)), "margin" !== r && (a -= J.css(e, "border" + xe[o] + "Width", !0, i))) : (a += J.css(e, "padding" + xe[o], !0, i), "padding" !== r && (a += J.css(e, "border" + xe[o] + "Width", !0, i))); return a
        } function M(e, t, r) {
            var n = !0, i = "width" === t ? e.offsetWidth : e.offsetHeight, o = ze(e), a = "border-box" === J.css(e, "boxSizing", !1, o); if (0 >= i || null == i) {
                if (i = R(e, t, o), (0 > i || null == i) && (i = e.style[t]), Ge.test(i)) return i; n = a && ($.boxSizingReliable() || i === e.style[t]), i = parseFloat(i) || 0
            } return i + w(e, t, r || (a ? "border" : "content"), n, o) + "px"
        } function S(e, t) {
            for (var r, n, i, o = [], a = 0, s = e.length; s > a; a++)n = e[a], n.style && (o[a] = ge.get(n, "olddisplay"), r = n.style.display, t ? (o[a] || "none" !== r || (n.style.display = ""), "" === n.style.display && He(n) && (o[a] = ge.access(n, "olddisplay", y(n.nodeName)))) : (i = He(n), "none" === r && i || ge.set(n, "olddisplay", i ? r : J.css(n, "display")))); for (a = 0; s > a; a++)n = e[a], n.style && (t && "none" !== n.style.display && "" !== n.style.display || (n.style.display = t ? o[a] || "" : "none")); return e
        } function _(e, t, r, n, i) {
            return new _.prototype.init(e, t, r, n, i)
        } function C() {
            return setTimeout(function () {
                $e = void 0
            }), $e = J.now()
        } function A(e, t) {
            var r, n = 0, i = {
                height: e
            }; for (t = t ? 1 : 0; 4 > n; n += 2 - t)r = xe[n], i["margin" + r] = i["padding" + r] = e; return t && (i.opacity = i.width = e), i
        } function L(e, t, r) {
            for (var n, i = (rt[t] || []).concat(rt["*"]), o = 0, a = i.length; a > o; o++)if (n = i[o].call(r, t, e)) return n
        } function k(e, t, r) {
            var n, i, o, a, s, h, c, u, l = this, p = {}, f = e.style, d = e.nodeType && He(e), E = ge.get(e, "fxshow"); r.queue || (s = J._queueHooks(e, "fx"), null == s.unqueued && (s.unqueued = 0, h = s.empty.fire, s.empty.fire = function () {
                s.unqueued || h()
            }), s.unqueued++, l.always(function () {
                l.always(function () {
                    s.unqueued--, J.queue(e, "fx").length || s.empty.fire()
                })
            })), 1 === e.nodeType && ("height" in t || "width" in t) && (r.overflow = [f.overflow, f.overflowX, f.overflowY], c = J.css(e, "display"), u = "none" === c ? ge.get(e, "olddisplay") || y(e.nodeName) : c, "inline" === u && "none" === J.css(e, "float") && (f.display = "inline-block")), r.overflow && (f.overflow = "hidden", l.always(function () {
                f.overflow = r.overflow[0], f.overflowX = r.overflow[1], f.overflowY = r.overflow[2]
            })); for (n in t) if (i = t[n], Qe.exec(i)) {
                if (delete t[n], o = o || "toggle" === i, i === (d ? "hide" : "show")) {
                    if ("show" !== i || !E || void 0 === E[n]) continue; d = !0
                } p[n] = E && E[n] || J.style(e, n)
            } else c = void 0; if (J.isEmptyObject(p)) "inline" === ("none" === c ? y(e.nodeName) : c) && (f.display = c); else {
                E ? "hidden" in E && (d = E.hidden) : E = ge.access(e, "fxshow", {}), o && (E.hidden = !d), d ? J(e).show() : l.done(function () {
                    J(e).hide()
                }), l.done(function () {
                    var t; ge.remove(e, "fxshow"); for (t in p) J.style(e, t, p[t])
                }); for (n in p) a = L(d ? E[n] : 0, n, l), n in E || (E[n] = a.start, d && (a.end = a.start, a.start = "width" === n || "height" === n ? 1 : 0))
            }
        } function P(e, t) {
            var r, n, i, o, a; for (r in e) if (n = J.camelCase(r), i = t[n], o = e[r], J.isArray(o) && (i = o[1], o = e[r] = o[0]), r !== n && (e[n] = o, delete e[r]), a = J.cssHooks[n], a && "expand" in a) {
                o = a.expand(o), delete e[n]; for (r in o) r in e || (e[r] = o[r], t[r] = i)
            } else t[n] = i
        } function D(e, t, r) {
            var n, i, o = 0, a = tt.length, s = J.Deferred().always(function () {
                delete h.elem
            }), h = function () {
                if (i) return !1; for (var t = $e || C(), r = Math.max(0, c.startTime + c.duration - t), n = r / c.duration || 0, o = 1 - n, a = 0, h = c.tweens.length; h > a; a++)c.tweens[a].run(o); return s.notifyWith(e, [c, o, r]), 1 > o && h ? r : (s.resolveWith(e, [c]), !1)
            }, c = s.promise({
                elem: e, props: J.extend({}, t), opts: J.extend(!0, {
                    specialEasing: {}
                }, r), originalProperties: t, originalOptions: r, startTime: $e || C(), duration: r.duration, tweens: [], createTween: function (t, r) {
                    var n = J.Tween(e, c.opts, t, r, c.opts.specialEasing[t] || c.opts.easing); return c.tweens.push(n), n
                }, stop: function (t) {
                    var r = 0, n = t ? c.tweens.length : 0; if (i) return this; for (i = !0; n > r; r++)c.tweens[r].run(1); return t ? s.resolveWith(e, [c, t]) : s.rejectWith(e, [c, t]), this
                }
            }), u = c.props; for (P(u, c.opts.specialEasing); a > o; o++)if (n = tt[o].call(c, e, u, c.opts)) return n; return J.map(u, L, c), J.isFunction(c.opts.start) && c.opts.start.call(e, c), J.fx.timer(J.extend(h, {
                elem: e, anim: c, queue: c.opts.queue
            })), c.progress(c.opts.progress).done(c.opts.done, c.opts.complete).fail(c.opts.fail).always(c.opts.always)
        } function O(e) {
            return function (t, r) {
                "string" != typeof t && (r = t, t = "*"); var n, i = 0, o = t.toLowerCase().match(fe) || []; if (J.isFunction(r)) for (; n = o[i++];)"+" === n[0] ? (n = n.slice(1) || "*", (e[n] = e[n] || []).unshift(r)) : (e[n] = e[n] || []).push(r)
            }
        } function F(e, t, r, n) {
            function i(s) {
                var h; return o[s] = !0, J.each(e[s] || [], function (e, s) {
                    var c = s(t, r, n); return "string" != typeof c || a || o[c] ? a ? !(h = c) : void 0 : (t.dataTypes.unshift(c), i(c), !1)
                }), h
            } var o = {}, a = e === Tt; return i(t.dataTypes[0]) || !o["*"] && i("*")
        } function N(e, t) {
            var r, n, i = J.ajaxSettings.flatOptions || {}; for (r in t) void 0 !== t[r] && ((i[r] ? e : n || (n = {}))[r] = t[r]); return n && J.extend(!0, e, n), e
        } function V(e, t, r) {
            for (var n, i, o, a, s = e.contents, h = e.dataTypes; "*" === h[0];)h.shift(), void 0 === n && (n = e.mimeType || t.getResponseHeader("Content-Type")); if (n) for (i in s) if (s[i] && s[i].test(n)) {
                h.unshift(i); break
            } if (h[0] in r) o = h[0]; else {
                for (i in r) {
                    if (!h[0] || e.converters[i + " " + h[0]]) {
                        o = i; break
                    } a || (a = i)
                } o = o || a
            } return o ? (o !== h[0] && h.unshift(o), r[o]) : void 0
        } function U(e, t, r, n) {
            var i, o, a, s, h, c = {}, u = e.dataTypes.slice(); if (u[1]) for (a in e.converters) c[a.toLowerCase()] = e.converters[a]; for (o = u.shift(); o;)if (e.responseFields[o] && (r[e.responseFields[o]] = t), !h && n && e.dataFilter && (t = e.dataFilter(t, e.dataType)), h = o, o = u.shift()) if ("*" === o) o = h; else if ("*" !== h && h !== o) {
                if (a = c[h + " " + o] || c["* " + o], !a) for (i in c) if (s = i.split(" "), s[1] === o && (a = c[h + " " + s[0]] || c["* " + s[0]])) {
                    a === !0 ? a = c[i] : c[i] !== !0 && (o = s[0], u.unshift(s[1])); break
                } if (a !== !0) if (a && e["throws"]) t = a(t); else try {
                    t = a(t)
                } catch (l) {
                    return {
                        state: "parsererror", error: a ? l : "No conversion from " + h + " to " + o
                    }
                }
            } return {
                state: "success", data: t
            }
        } function B(e, t, r, n) {
            var i; if (J.isArray(t)) J.each(t, function (t, i) {
                r || bt.test(e) ? n(e, i) : B(e + "[" + ("object" == typeof i ? t : "") + "]", i, r, n)
            }); else if (r || "object" !== J.type(t)) n(e, t); else for (i in t) B(e + "[" + i + "]", t[i], r, n)
        } function I(e) {
            return J.isWindow(e) ? e : 9 === e.nodeType && e.defaultView
        } var G = [], z = G.slice, j = G.concat, W = G.push, X = G.indexOf, q = {}, Y = q.toString, K = q.hasOwnProperty, $ = {}, Z = e.document, Q = "2.1.4", J = function (e, t) {
            return new J.fn.init(e, t)
        }, ee = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, te = /^-ms-/, re = /-([\da-z])/gi, ne = function (e, t) {
            return t.toUpperCase()
        }; J.fn = J.prototype = {
            jquery: Q, constructor: J, selector: "", length: 0, toArray: function () {
                return z.call(this)
            }, get: function (e) {
                return null != e ? 0 > e ? this[e + this.length] : this[e] : z.call(this)
            }, pushStack: function (e) {
                var t = J.merge(this.constructor(), e); return t.prevObject = this, t.context = this.context, t
            }, each: function (e, t) {
                return J.each(this, e, t)
            }, map: function (e) {
                return this.pushStack(J.map(this, function (t, r) {
                    return e.call(t, r, t)
                }))
            }, slice: function () {
                return this.pushStack(z.apply(this, arguments))
            }, first: function () {
                return this.eq(0)
            }, last: function () {
                return this.eq(-1)
            }, eq: function (e) {
                var t = this.length, r = +e + (0 > e ? t : 0); return this.pushStack(r >= 0 && t > r ? [this[r]] : [])
            }, end: function () {
                return this.prevObject || this.constructor(null)
            }, push: W, sort: G.sort, splice: G.splice
        }, J.extend = J.fn.extend = function () {
            var e, t, r, n, i, o, a = arguments[0] || {}, s = 1, h = arguments.length, c = !1; for ("boolean" == typeof a && (c = a, a = arguments[s] || {}, s++), "object" == typeof a || J.isFunction(a) || (a = {}), s === h && (a = this, s--); h > s; s++)if (null != (e = arguments[s])) for (t in e) r = a[t], n = e[t], a !== n && (c && n && (J.isPlainObject(n) || (i = J.isArray(n))) ? (i ? (i = !1, o = r && J.isArray(r) ? r : []) : o = r && J.isPlainObject(r) ? r : {}, a[t] = J.extend(c, o, n)) : void 0 !== n && (a[t] = n)); return a
        }, J.extend({
            expando: "jQuery" + (Q + Math.random()).replace(/\D/g, ""), isReady: !0, error: function (e) {
                throw new Error(e)
            }, noop: function () {
            }, isFunction: function (e) {
                return "function" === J.type(e)
            }, isArray: Array.isArray, isWindow: function (e) {
                return null != e && e === e.window
            }, isNumeric: function (e) {
                return !J.isArray(e) && e - parseFloat(e) + 1 >= 0
            }, isPlainObject: function (e) {
                return "object" !== J.type(e) || e.nodeType || J.isWindow(e) ? !1 : e.constructor && !K.call(e.constructor.prototype, "isPrototypeOf") ? !1 : !0
            }, isEmptyObject: function (e) {
                var t; for (t in e) return !1; return !0
            }, type: function (e) {
                return null == e ? e + "" : "object" == typeof e || "function" == typeof e ? q[Y.call(e)] || "object" : typeof e
            }, globalEval: function (e) {
                var t, r = eval; e = J.trim(e), e && (1 === e.indexOf("use strict") ? (t = Z.createElement("script"), t.text = e, Z.head.appendChild(t).parentNode.removeChild(t)) : r(e))
            }, camelCase: function (e) {
                return e.replace(te, "ms-").replace(re, ne)
            }, nodeName: function (e, t) {
                return e.nodeName && e.nodeName.toLowerCase() === t.toLowerCase()
            }, each: function (e, t, n) {
                var i, o = 0, a = e.length, s = r(e); if (n) {
                    if (s) for (; a > o && (i = t.apply(e[o], n), i !== !1); o++); else for (o in e) if (i = t.apply(e[o], n), i === !1) break
                } else if (s) for (; a > o && (i = t.call(e[o], o, e[o]), i !== !1); o++); else for (o in e) if (i = t.call(e[o], o, e[o]), i === !1) break; return e
            }, trim: function (e) {
                return null == e ? "" : (e + "").replace(ee, "")
            }, makeArray: function (e, t) {
                var n = t || []; return null != e && (r(Object(e)) ? J.merge(n, "string" == typeof e ? [e] : e) : W.call(n, e)), n
            }, inArray: function (e, t, r) {
                return null == t ? -1 : X.call(t, e, r)
            }, merge: function (e, t) {
                for (var r = +t.length, n = 0, i = e.length; r > n; n++)e[i++] = t[n]; return e.length = i, e
            }, grep: function (e, t, r) {
                for (var n, i = [], o = 0, a = e.length, s = !r; a > o; o++)n = !t(e[o], o), n !== s && i.push(e[o]); return i
            }, map: function (e, t, n) {
                var i, o = 0, a = e.length, s = r(e), h = []; if (s) for (; a > o; o++)i = t(e[o], o, n), null != i && h.push(i); else for (o in e) i = t(e[o], o, n), null != i && h.push(i); return j.apply([], h)
            }, guid: 1, proxy: function (e, t) {
                var r, n, i; return "string" == typeof t && (r = e[t], t = e, e = r), J.isFunction(e) ? (n = z.call(arguments, 2), i = function () {
                    return e.apply(t || this, n.concat(z.call(arguments)))
                }, i.guid = e.guid = e.guid || J.guid++, i) : void 0
            }, now: Date.now, support: $
        }), J.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (e, t) {
            q["[object " + t + "]"] = t.toLowerCase()
        }); var ie = function (e) {
            function t(e, t, r, n) {
                var i, o, a, s, h, c, l, f, d, E; if ((t ? t.ownerDocument || t : B) !== k && L(t), t = t || k, r = r || [], s = t.nodeType, "string" != typeof e || !e || 1 !== s && 9 !== s && 11 !== s) return r; if (!n && D) {
                    if (11 !== s && (i = ve.exec(e))) if (a = i[1]) {
                        if (9 === s) {
                            if (o = t.getElementById(a), !o || !o.parentNode) return r; if (o.id === a) return r.push(o), r
                        } else if (t.ownerDocument && (o = t.ownerDocument.getElementById(a)) && V(t, o) && o.id === a) return r.push(o), r
                    } else {
                        if (i[2]) return Q.apply(r, t.getElementsByTagName(e)), r; if ((a = i[3]) && R.getElementsByClassName) return Q.apply(r, t.getElementsByClassName(a)), r
                    } if (R.qsa && (!O || !O.test(e))) {
                        if (f = l = U, d = t, E = 1 !== s && e, 1 === s && "object" !== t.nodeName.toLowerCase()) {
                            for (c = w(e), (l = t.getAttribute("id")) ? f = l.replace(ye, "\\$&") : t.setAttribute("id", f), f = "[id='" + f + "'] ", h = c.length; h--;)c[h] = f + p(c[h]); d = Te.test(e) && u(t.parentNode) || t, E = c.join(",")
                        } if (E) try {
                            return Q.apply(r, d.querySelectorAll(E)), r
                        } catch (m) {
                        } finally {
                                l || t.removeAttribute("id")
                            }
                    }
                } return S(e.replace(he, "$1"), t, r, n)
            } function r() {
                function e(r, n) {
                    return t.push(r + " ") > x.cacheLength && delete e[t.shift()], e[r + " "] = n
                } var t = []; return e
            } function n(e) {
                return e[U] = !0, e
            } function i(e) {
                var t = k.createElement("div"); try {
                    return !!e(t)
                } catch (r) {
                    return !1
                } finally {
                    t.parentNode && t.parentNode.removeChild(t), t = null
                }
            } function o(e, t) {
                for (var r = e.split("|"), n = e.length; n--;)x.attrHandle[r[n]] = t
            } function a(e, t) {
                var r = t && e, n = r && 1 === e.nodeType && 1 === t.nodeType && (~t.sourceIndex || q) - (~e.sourceIndex || q); if (n) return n; if (r) for (; r = r.nextSibling;)if (r === t) return -1; return e ? 1 : -1
            } function s(e) {
                return function (t) {
                    var r = t.nodeName.toLowerCase(); return "input" === r && t.type === e
                }
            } function h(e) {
                return function (t) {
                    var r = t.nodeName.toLowerCase(); return ("input" === r || "button" === r) && t.type === e
                }
            } function c(e) {
                return n(function (t) {
                    return t = +t, n(function (r, n) {
                        for (var i, o = e([], r.length, t), a = o.length; a--;)r[i = o[a]] && (r[i] = !(n[i] = r[i]))
                    })
                })
            } function u(e) {
                return e && "undefined" != typeof e.getElementsByTagName && e
            } function l() {
            } function p(e) {
                for (var t = 0, r = e.length, n = ""; r > t; t++)n += e[t].value; return n
            } function f(e, t, r) {
                var n = t.dir, i = r && "parentNode" === n, o = G++; return t.first ? function (t, r, o) {
                    for (; t = t[n];)if (1 === t.nodeType || i) return e(t, r, o)
                } : function (t, r, a) {
                    var s, h, c = [I, o]; if (a) {
                        for (; t = t[n];)if ((1 === t.nodeType || i) && e(t, r, a)) return !0
                    } else for (; t = t[n];)if (1 === t.nodeType || i) {
                        if (h = t[U] || (t[U] = {}), (s = h[n]) && s[0] === I && s[1] === o) return c[2] = s[2]; if (h[n] = c, c[2] = e(t, r, a)) return !0
                    }
                }
            } function d(e) {
                return e.length > 1 ? function (t, r, n) {
                    for (var i = e.length; i--;)if (!e[i](t, r, n)) return !1; return !0
                } : e[0]
            } function E(e, r, n) {
                for (var i = 0, o = r.length; o > i; i++)t(e, r[i], n); return n
            } function m(e, t, r, n, i) {
                for (var o, a = [], s = 0, h = e.length, c = null != t; h > s; s++)(o = e[s]) && (!r || r(o, n, i)) && (a.push(o), c && t.push(s)); return a
            } function g(e, t, r, i, o, a) {
                return i && !i[U] && (i = g(i)), o && !o[U] && (o = g(o, a)), n(function (n, a, s, h) {
                    var c, u, l, p = [], f = [], d = a.length, g = n || E(t || "*", s.nodeType ? [s] : s, []), v = !e || !n && t ? g : m(g, p, e, s, h), T = r ? o || (n ? e : d || i) ? [] : a : v; if (r && r(v, T, s, h), i) for (c = m(T, f), i(c, [], s, h), u = c.length; u--;)(l = c[u]) && (T[f[u]] = !(v[f[u]] = l)); if (n) {
                        if (o || e) {
                            if (o) {
                                for (c = [], u = T.length; u--;)(l = T[u]) && c.push(v[u] = l); o(null, T = [], c, h)
                            } for (u = T.length; u--;)(l = T[u]) && (c = o ? ee(n, l) : p[u]) > -1 && (n[c] = !(a[c] = l))
                        }
                    } else T = m(T === a ? T.splice(d, T.length) : T), o ? o(null, a, T, h) : Q.apply(a, T)
                })
            } function v(e) {
                for (var t, r, n, i = e.length, o = x.relative[e[0].type], a = o || x.relative[" "], s = o ? 1 : 0, h = f(function (e) {
                    return e === t
                }, a, !0), c = f(function (e) {
                    return ee(t, e) > -1
                }, a, !0), u = [function (e, r, n) {
                    var i = !o && (n || r !== _) || ((t = r).nodeType ? h(e, r, n) : c(e, r, n)); return t = null, i
                }]; i > s; s++)if (r = x.relative[e[s].type]) u = [f(d(u), r)]; else {
                    if (r = x.filter[e[s].type].apply(null, e[s].matches), r[U]) {
                        for (n = ++s; i > n && !x.relative[e[n].type]; n++); return g(s > 1 && d(u), s > 1 && p(e.slice(0, s - 1).concat({
                            value: " " === e[s - 2].type ? "*" : ""
                        })).replace(he, "$1"), r, n > s && v(e.slice(s, n)), i > n && v(e = e.slice(n)), i > n && p(e))
                    } u.push(r)
                } return d(u)
            } function T(e, r) {
                var i = r.length > 0, o = e.length > 0, a = function (n, a, s, h, c) {
                    var u, l, p, f = 0, d = "0", E = n && [], g = [], v = _, T = n || o && x.find.TAG("*", c), y = I += null == v ? 1 : Math.random() || .1, R = T.length; for (c && (_ = a !== k && a); d !== R && null != (u = T[d]); d++) {
                        if (o && u) {
                            for (l = 0; p = e[l++];)if (p(u, a, s)) {
                                h.push(u); break
                            } c && (I = y)
                        } i && ((u = !p && u) && f--, n && E.push(u))
                    } if (f += d, i && d !== f) {
                        for (l = 0; p = r[l++];)p(E, g, a, s); if (n) {
                            if (f > 0) for (; d--;)E[d] || g[d] || (g[d] = $.call(h)); g = m(g)
                        } Q.apply(h, g), c && !n && g.length > 0 && f + r.length > 1 && t.uniqueSort(h)
                    } return c && (I = y, _ = v), E
                }; return i ? n(a) : a
            } var y, R, x, H, b, w, M, S, _, C, A, L, k, P, D, O, F, N, V, U = "sizzle" + 1 * new Date, B = e.document, I = 0, G = 0, z = r(), j = r(), W = r(), X = function (e, t) {
                return e === t && (A = !0), 0
            }, q = 1 << 31, Y = {}.hasOwnProperty, K = [], $ = K.pop, Z = K.push, Q = K.push, J = K.slice, ee = function (e, t) {
                for (var r = 0, n = e.length; n > r; r++)if (e[r] === t) return r; return -1
            }, te = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", re = "[\\x20\\t\\r\\n\\f]", ne = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+", ie = ne.replace("w", "w#"), oe = "\\[" + re + "*(" + ne + ")(?:" + re + "*([*^$|!~]?=)" + re + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + ie + "))|)" + re + "*\\]", ae = ":(" + ne + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + oe + ")*)|.*)\\)|)", se = new RegExp(re + "+", "g"), he = new RegExp("^" + re + "+|((?:^|[^\\\\])(?:\\\\.)*)" + re + "+$", "g"), ce = new RegExp("^" + re + "*," + re + "*"), ue = new RegExp("^" + re + "*([>+~]|" + re + ")" + re + "*"), le = new RegExp("=" + re + "*([^\\]'\"]*?)" + re + "*\\]", "g"), pe = new RegExp(ae), fe = new RegExp("^" + ie + "$"), de = {
                ID: new RegExp("^#(" + ne + ")"), CLASS: new RegExp("^\\.(" + ne + ")"), TAG: new RegExp("^(" + ne.replace("w", "w*") + ")"), ATTR: new RegExp("^" + oe), PSEUDO: new RegExp("^" + ae), CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + re + "*(even|odd|(([+-]|)(\\d*)n|)" + re + "*(?:([+-]|)" + re + "*(\\d+)|))" + re + "*\\)|)", "i"), bool: new RegExp("^(?:" + te + ")$", "i"), needsContext: new RegExp("^" + re + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + re + "*((?:-\\d)?\\d*)" + re + "*\\)|)(?=[^-]|$)", "i")
            }, Ee = /^(?:input|select|textarea|button)$/i, me = /^h\d$/i, ge = /^[^{]+\{\s*\[native \w/, ve = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, Te = /[+~]/, ye = /'|\\/g, Re = new RegExp("\\\\([\\da-f]{1,6}" + re + "?|(" + re + ")|.)", "ig"), xe = function (e, t, r) {
                var n = "0x" + t - 65536; return n !== n || r ? t : 0 > n ? String.fromCharCode(n + 65536) : String.fromCharCode(n >> 10 | 55296, 1023 & n | 56320)
            }, He = function () {
                L()
            }; try {
                Q.apply(K = J.call(B.childNodes), B.childNodes), K[B.childNodes.length].nodeType
            } catch (be) {
                Q = {
                    apply: K.length ? function (e, t) {
                        Z.apply(e, J.call(t))
                    } : function (e, t) {
                        for (var r = e.length, n = 0; e[r++] = t[n++];); e.length = r - 1
                    }
                }
            } R = t.support = {}, b = t.isXML = function (e) {
                var t = e && (e.ownerDocument || e).documentElement; return t ? "HTML" !== t.nodeName : !1
            }, L = t.setDocument = function (e) {
                var t, r, n = e ? e.ownerDocument || e : B; return n !== k && 9 === n.nodeType && n.documentElement ? (k = n, P = n.documentElement, r = n.defaultView, r && r !== r.top && (r.addEventListener ? r.addEventListener("unload", He, !1) : r.attachEvent && r.attachEvent("onunload", He)), D = !b(n), R.attributes = i(function (e) {
                    return e.className = "i", !e.getAttribute("className")
                }), R.getElementsByTagName = i(function (e) {
                    return e.appendChild(n.createComment("")), !e.getElementsByTagName("*").length
                }), R.getElementsByClassName = ge.test(n.getElementsByClassName), R.getById = i(function (e) {
                    return P.appendChild(e).id = U, !n.getElementsByName || !n.getElementsByName(U).length
                }), R.getById ? (x.find.ID = function (e, t) {
                    if ("undefined" != typeof t.getElementById && D) {
                        var r = t.getElementById(e); return r && r.parentNode ? [r] : []
                    }
                }, x.filter.ID = function (e) {
                    var t = e.replace(Re, xe); return function (e) {
                        return e.getAttribute("id") === t
                    }
                }) : (delete x.find.ID, x.filter.ID = function (e) {
                    var t = e.replace(Re, xe); return function (e) {
                        var r = "undefined" != typeof e.getAttributeNode && e.getAttributeNode("id"); return r && r.value === t
                    }
                }), x.find.TAG = R.getElementsByTagName ? function (e, t) {
                    return "undefined" != typeof t.getElementsByTagName ? t.getElementsByTagName(e) : R.qsa ? t.querySelectorAll(e) : void 0
                } : function (e, t) {
                    var r, n = [], i = 0, o = t.getElementsByTagName(e); if ("*" === e) {
                        for (; r = o[i++];)1 === r.nodeType && n.push(r); return n
                    } return o
                }, x.find.CLASS = R.getElementsByClassName && function (e, t) {
                    return D ? t.getElementsByClassName(e) : void 0
                }, F = [], O = [], (R.qsa = ge.test(n.querySelectorAll)) && (i(function (e) {
                    P.appendChild(e).innerHTML = "<a id='" + U + "'></a><select id='" + U + "-\f]' msallowcapture=''><option selected=''></option></select>", e.querySelectorAll("[msallowcapture^='']").length && O.push("[*^$]=" + re + "*(?:''|\"\")"), e.querySelectorAll("[selected]").length || O.push("\\[" + re + "*(?:value|" + te + ")"), e.querySelectorAll("[id~=" + U + "-]").length || O.push("~="), e.querySelectorAll(":checked").length || O.push(":checked"), e.querySelectorAll("a#" + U + "+*").length || O.push(".#.+[+~]")
                }), i(function (e) {
                    var t = n.createElement("input"); t.setAttribute("type", "hidden"), e.appendChild(t).setAttribute("name", "D"), e.querySelectorAll("[name=d]").length && O.push("name" + re + "*[*^$|!~]?="), e.querySelectorAll(":enabled").length || O.push(":enabled", ":disabled"), e.querySelectorAll("*,:x"), O.push(",.*:")
                })), (R.matchesSelector = ge.test(N = P.matches || P.webkitMatchesSelector || P.mozMatchesSelector || P.oMatchesSelector || P.msMatchesSelector)) && i(function (e) {
                    R.disconnectedMatch = N.call(e, "div"), N.call(e, "[s!='']:x"), F.push("!=", ae)
                }), O = O.length && new RegExp(O.join("|")), F = F.length && new RegExp(F.join("|")), t = ge.test(P.compareDocumentPosition), V = t || ge.test(P.contains) ? function (e, t) {
                    var r = 9 === e.nodeType ? e.documentElement : e, n = t && t.parentNode; return e === n || !(!n || 1 !== n.nodeType || !(r.contains ? r.contains(n) : e.compareDocumentPosition && 16 & e.compareDocumentPosition(n)))
                } : function (e, t) {
                    if (t) for (; t = t.parentNode;)if (t === e) return !0; return !1
                }, X = t ? function (e, t) {
                    if (e === t) return A = !0, 0; var r = !e.compareDocumentPosition - !t.compareDocumentPosition; return r ? r : (r = (e.ownerDocument || e) === (t.ownerDocument || t) ? e.compareDocumentPosition(t) : 1, 1 & r || !R.sortDetached && t.compareDocumentPosition(e) === r ? e === n || e.ownerDocument === B && V(B, e) ? -1 : t === n || t.ownerDocument === B && V(B, t) ? 1 : C ? ee(C, e) - ee(C, t) : 0 : 4 & r ? -1 : 1)
                } : function (e, t) {
                    if (e === t) return A = !0, 0; var r, i = 0, o = e.parentNode, s = t.parentNode, h = [e], c = [t]; if (!o || !s) return e === n ? -1 : t === n ? 1 : o ? -1 : s ? 1 : C ? ee(C, e) - ee(C, t) : 0; if (o === s) return a(e, t); for (r = e; r = r.parentNode;)h.unshift(r); for (r = t; r = r.parentNode;)c.unshift(r); for (; h[i] === c[i];)i++; return i ? a(h[i], c[i]) : h[i] === B ? -1 : c[i] === B ? 1 : 0
                }, n) : k
            }, t.matches = function (e, r) {
                return t(e, null, null, r)
            }, t.matchesSelector = function (e, r) {
                if ((e.ownerDocument || e) !== k && L(e), r = r.replace(le, "='$1']"), R.matchesSelector && D && (!F || !F.test(r)) && (!O || !O.test(r))) try {
                    var n = N.call(e, r); if (n || R.disconnectedMatch || e.document && 11 !== e.document.nodeType) return n;
                } catch (i) {
                } return t(r, k, null, [e]).length > 0
            }, t.contains = function (e, t) {
                return (e.ownerDocument || e) !== k && L(e), V(e, t)
            }, t.attr = function (e, t) {
                (e.ownerDocument || e) !== k && L(e); var r = x.attrHandle[t.toLowerCase()], n = r && Y.call(x.attrHandle, t.toLowerCase()) ? r(e, t, !D) : void 0; return void 0 !== n ? n : R.attributes || !D ? e.getAttribute(t) : (n = e.getAttributeNode(t)) && n.specified ? n.value : null
            }, t.error = function (e) {
                throw new Error("Syntax error, unrecognized expression: " + e)
            }, t.uniqueSort = function (e) {
                var t, r = [], n = 0, i = 0; if (A = !R.detectDuplicates, C = !R.sortStable && e.slice(0), e.sort(X), A) {
                    for (; t = e[i++];)t === e[i] && (n = r.push(i)); for (; n--;)e.splice(r[n], 1)
                } return C = null, e
            }, H = t.getText = function (e) {
                var t, r = "", n = 0, i = e.nodeType; if (i) {
                    if (1 === i || 9 === i || 11 === i) {
                        if ("string" == typeof e.textContent) return e.textContent; for (e = e.firstChild; e; e = e.nextSibling)r += H(e)
                    } else if (3 === i || 4 === i) return e.nodeValue
                } else for (; t = e[n++];)r += H(t); return r
            }, x = t.selectors = {
                cacheLength: 50, createPseudo: n, match: de, attrHandle: {}, find: {}, relative: {
                    ">": {
                        dir: "parentNode", first: !0
                    }, " ": {
                        dir: "parentNode"
                    }, "+": {
                        dir: "previousSibling", first: !0
                    }, "~": {
                        dir: "previousSibling"
                    }
                }, preFilter: {
                    ATTR: function (e) {
                        return e[1] = e[1].replace(Re, xe), e[3] = (e[3] || e[4] || e[5] || "").replace(Re, xe), "~=" === e[2] && (e[3] = " " + e[3] + " "), e.slice(0, 4)
                    }, CHILD: function (e) {
                        return e[1] = e[1].toLowerCase(), "nth" === e[1].slice(0, 3) ? (e[3] || t.error(e[0]), e[4] = +(e[4] ? e[5] + (e[6] || 1) : 2 * ("even" === e[3] || "odd" === e[3])), e[5] = +(e[7] + e[8] || "odd" === e[3])) : e[3] && t.error(e[0]), e
                    }, PSEUDO: function (e) {
                        var t, r = !e[6] && e[2]; return de.CHILD.test(e[0]) ? null : (e[3] ? e[2] = e[4] || e[5] || "" : r && pe.test(r) && (t = w(r, !0)) && (t = r.indexOf(")", r.length - t) - r.length) && (e[0] = e[0].slice(0, t), e[2] = r.slice(0, t)), e.slice(0, 3))
                    }
                }, filter: {
                    TAG: function (e) {
                        var t = e.replace(Re, xe).toLowerCase(); return "*" === e ? function () {
                            return !0
                        } : function (e) {
                            return e.nodeName && e.nodeName.toLowerCase() === t
                        }
                    }, CLASS: function (e) {
                        var t = z[e + " "]; return t || (t = new RegExp("(^|" + re + ")" + e + "(" + re + "|$)")) && z(e, function (e) {
                            return t.test("string" == typeof e.className && e.className || "undefined" != typeof e.getAttribute && e.getAttribute("class") || "")
                        })
                    }, ATTR: function (e, r, n) {
                        return function (i) {
                            var o = t.attr(i, e); return null == o ? "!=" === r : r ? (o += "", "=" === r ? o === n : "!=" === r ? o !== n : "^=" === r ? n && 0 === o.indexOf(n) : "*=" === r ? n && o.indexOf(n) > -1 : "$=" === r ? n && o.slice(-n.length) === n : "~=" === r ? (" " + o.replace(se, " ") + " ").indexOf(n) > -1 : "|=" === r ? o === n || o.slice(0, n.length + 1) === n + "-" : !1) : !0
                        }
                    }, CHILD: function (e, t, r, n, i) {
                        var o = "nth" !== e.slice(0, 3), a = "last" !== e.slice(-4), s = "of-type" === t; return 1 === n && 0 === i ? function (e) {
                            return !!e.parentNode
                        } : function (t, r, h) {
                            var c, u, l, p, f, d, E = o !== a ? "nextSibling" : "previousSibling", m = t.parentNode, g = s && t.nodeName.toLowerCase(), v = !h && !s; if (m) {
                                if (o) {
                                    for (; E;) {
                                        for (l = t; l = l[E];)if (s ? l.nodeName.toLowerCase() === g : 1 === l.nodeType) return !1; d = E = "only" === e && !d && "nextSibling"
                                    } return !0
                                } if (d = [a ? m.firstChild : m.lastChild], a && v) {
                                    for (u = m[U] || (m[U] = {}), c = u[e] || [], f = c[0] === I && c[1], p = c[0] === I && c[2], l = f && m.childNodes[f]; l = ++f && l && l[E] || (p = f = 0) || d.pop();)if (1 === l.nodeType && ++p && l === t) {
                                        u[e] = [I, f, p]; break
                                    }
                                } else if (v && (c = (t[U] || (t[U] = {}))[e]) && c[0] === I) p = c[1]; else for (; (l = ++f && l && l[E] || (p = f = 0) || d.pop()) && ((s ? l.nodeName.toLowerCase() !== g : 1 !== l.nodeType) || !++p || (v && ((l[U] || (l[U] = {}))[e] = [I, p]), l !== t));); return p -= i, p === n || p % n === 0 && p / n >= 0
                            }
                        }
                    }, PSEUDO: function (e, r) {
                        var i, o = x.pseudos[e] || x.setFilters[e.toLowerCase()] || t.error("unsupported pseudo: " + e); return o[U] ? o(r) : o.length > 1 ? (i = [e, e, "", r], x.setFilters.hasOwnProperty(e.toLowerCase()) ? n(function (e, t) {
                            for (var n, i = o(e, r), a = i.length; a--;)n = ee(e, i[a]), e[n] = !(t[n] = i[a])
                        }) : function (e) {
                            return o(e, 0, i)
                        }) : o
                    }
                }, pseudos: {
                    not: n(function (e) {
                        var t = [], r = [], i = M(e.replace(he, "$1")); return i[U] ? n(function (e, t, r, n) {
                            for (var o, a = i(e, null, n, []), s = e.length; s--;)(o = a[s]) && (e[s] = !(t[s] = o))
                        }) : function (e, n, o) {
                            return t[0] = e, i(t, null, o, r), t[0] = null, !r.pop()
                        }
                    }), has: n(function (e) {
                        return function (r) {
                            return t(e, r).length > 0
                        }
                    }), contains: n(function (e) {
                        return e = e.replace(Re, xe), function (t) {
                            return (t.textContent || t.innerText || H(t)).indexOf(e) > -1
                        }
                    }), lang: n(function (e) {
                        return fe.test(e || "") || t.error("unsupported lang: " + e), e = e.replace(Re, xe).toLowerCase(), function (t) {
                            var r; do if (r = D ? t.lang : t.getAttribute("xml:lang") || t.getAttribute("lang")) return r = r.toLowerCase(), r === e || 0 === r.indexOf(e + "-"); while ((t = t.parentNode) && 1 === t.nodeType); return !1
                        }
                    }), target: function (t) {
                        var r = e.location && e.location.hash; return r && r.slice(1) === t.id
                    }, root: function (e) {
                        return e === P
                    }, focus: function (e) {
                        return e === k.activeElement && (!k.hasFocus || k.hasFocus()) && !!(e.type || e.href || ~e.tabIndex)
                    }, enabled: function (e) {
                        return e.disabled === !1
                    }, disabled: function (e) {
                        return e.disabled === !0
                    }, checked: function (e) {
                        var t = e.nodeName.toLowerCase(); return "input" === t && !!e.checked || "option" === t && !!e.selected
                    }, selected: function (e) {
                        return e.parentNode && e.parentNode.selectedIndex, e.selected === !0
                    }, empty: function (e) {
                        for (e = e.firstChild; e; e = e.nextSibling)if (e.nodeType < 6) return !1; return !0
                    }, parent: function (e) {
                        return !x.pseudos.empty(e)
                    }, header: function (e) {
                        return me.test(e.nodeName)
                    }, input: function (e) {
                        return Ee.test(e.nodeName)
                    }, button: function (e) {
                        var t = e.nodeName.toLowerCase(); return "input" === t && "button" === e.type || "button" === t
                    }, text: function (e) {
                        var t; return "input" === e.nodeName.toLowerCase() && "text" === e.type && (null == (t = e.getAttribute("type")) || "text" === t.toLowerCase())
                    }, first: c(function () {
                        return [0]
                    }), last: c(function (e, t) {
                        return [t - 1]
                    }), eq: c(function (e, t, r) {
                        return [0 > r ? r + t : r]
                    }), even: c(function (e, t) {
                        for (var r = 0; t > r; r += 2)e.push(r); return e
                    }), odd: c(function (e, t) {
                        for (var r = 1; t > r; r += 2)e.push(r); return e
                    }), lt: c(function (e, t, r) {
                        for (var n = 0 > r ? r + t : r; --n >= 0;)e.push(n); return e
                    }), gt: c(function (e, t, r) {
                        for (var n = 0 > r ? r + t : r; ++n < t;)e.push(n); return e
                    })
                }
            }, x.pseudos.nth = x.pseudos.eq; for (y in {
                radio: !0, checkbox: !0, file: !0, password: !0, image: !0
            }) x.pseudos[y] = s(y); for (y in {
                submit: !0, reset: !0
            }) x.pseudos[y] = h(y); return l.prototype = x.filters = x.pseudos, x.setFilters = new l, w = t.tokenize = function (e, r) {
                var n, i, o, a, s, h, c, u = j[e + " "]; if (u) return r ? 0 : u.slice(0); for (s = e, h = [], c = x.preFilter; s;) {
                    (!n || (i = ce.exec(s))) && (i && (s = s.slice(i[0].length) || s), h.push(o = [])), n = !1, (i = ue.exec(s)) && (n = i.shift(), o.push({
                        value: n, type: i[0].replace(he, " ")
                    }), s = s.slice(n.length)); for (a in x.filter) !(i = de[a].exec(s)) || c[a] && !(i = c[a](i)) || (n = i.shift(), o.push({
                        value: n, type: a, matches: i
                    }), s = s.slice(n.length)); if (!n) break
                } return r ? s.length : s ? t.error(e) : j(e, h).slice(0)
            }, M = t.compile = function (e, t) {
                var r, n = [], i = [], o = W[e + " "]; if (!o) {
                    for (t || (t = w(e)), r = t.length; r--;)o = v(t[r]), o[U] ? n.push(o) : i.push(o); o = W(e, T(i, n)), o.selector = e
                } return o
            }, S = t.select = function (e, t, r, n) {
                var i, o, a, s, h, c = "function" == typeof e && e, l = !n && w(e = c.selector || e); if (r = r || [], 1 === l.length) {
                    if (o = l[0] = l[0].slice(0), o.length > 2 && "ID" === (a = o[0]).type && R.getById && 9 === t.nodeType && D && x.relative[o[1].type]) {
                        if (t = (x.find.ID(a.matches[0].replace(Re, xe), t) || [])[0], !t) return r; c && (t = t.parentNode), e = e.slice(o.shift().value.length)
                    } for (i = de.needsContext.test(e) ? 0 : o.length; i-- && (a = o[i], !x.relative[s = a.type]);)if ((h = x.find[s]) && (n = h(a.matches[0].replace(Re, xe), Te.test(o[0].type) && u(t.parentNode) || t))) {
                        if (o.splice(i, 1), e = n.length && p(o), !e) return Q.apply(r, n), r; break
                    }
                } return (c || M(e, l))(n, t, !D, r, Te.test(e) && u(t.parentNode) || t), r
            }, R.sortStable = U.split("").sort(X).join("") === U, R.detectDuplicates = !!A, L(), R.sortDetached = i(function (e) {
                return 1 & e.compareDocumentPosition(k.createElement("div"))
            }), i(function (e) {
                return e.innerHTML = "<a href='#'></a>", "#" === e.firstChild.getAttribute("href")
            }) || o("type|href|height|width", function (e, t, r) {
                return r ? void 0 : e.getAttribute(t, "type" === t.toLowerCase() ? 1 : 2)
            }), R.attributes && i(function (e) {
                return e.innerHTML = "<input/>", e.firstChild.setAttribute("value", ""), "" === e.firstChild.getAttribute("value")
            }) || o("value", function (e, t, r) {
                return r || "input" !== e.nodeName.toLowerCase() ? void 0 : e.defaultValue
            }), i(function (e) {
                return null == e.getAttribute("disabled")
            }) || o(te, function (e, t, r) {
                var n; return r ? void 0 : e[t] === !0 ? t.toLowerCase() : (n = e.getAttributeNode(t)) && n.specified ? n.value : null
            }), t
        }(e); J.find = ie, J.expr = ie.selectors, J.expr[":"] = J.expr.pseudos, J.unique = ie.uniqueSort, J.text = ie.getText, J.isXMLDoc = ie.isXML, J.contains = ie.contains; var oe = J.expr.match.needsContext, ae = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, se = /^.[^:#\[\.,]*$/; J.filter = function (e, t, r) {
            var n = t[0]; return r && (e = ":not(" + e + ")"), 1 === t.length && 1 === n.nodeType ? J.find.matchesSelector(n, e) ? [n] : [] : J.find.matches(e, J.grep(t, function (e) {
                return 1 === e.nodeType
            }))
        }, J.fn.extend({
            find: function (e) {
                var t, r = this.length, n = [], i = this; if ("string" != typeof e) return this.pushStack(J(e).filter(function () {
                    for (t = 0; r > t; t++)if (J.contains(i[t], this)) return !0
                })); for (t = 0; r > t; t++)J.find(e, i[t], n); return n = this.pushStack(r > 1 ? J.unique(n) : n), n.selector = this.selector ? this.selector + " " + e : e, n
            }, filter: function (e) {
                return this.pushStack(n(this, e || [], !1))
            }, not: function (e) {
                return this.pushStack(n(this, e || [], !0))
            }, is: function (e) {
                return !!n(this, "string" == typeof e && oe.test(e) ? J(e) : e || [], !1).length
            }
        }); var he, ce = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/, ue = J.fn.init = function (e, t) {
            var r, n; if (!e) return this; if ("string" == typeof e) {
                if (r = "<" === e[0] && ">" === e[e.length - 1] && e.length >= 3 ? [null, e, null] : ce.exec(e), !r || !r[1] && t) return !t || t.jquery ? (t || he).find(e) : this.constructor(t).find(e); if (r[1]) {
                    if (t = t instanceof J ? t[0] : t, J.merge(this, J.parseHTML(r[1], t && t.nodeType ? t.ownerDocument || t : Z, !0)), ae.test(r[1]) && J.isPlainObject(t)) for (r in t) J.isFunction(this[r]) ? this[r](t[r]) : this.attr(r, t[r]); return this
                } return n = Z.getElementById(r[2]), n && n.parentNode && (this.length = 1, this[0] = n), this.context = Z, this.selector = e, this
            } return e.nodeType ? (this.context = this[0] = e, this.length = 1, this) : J.isFunction(e) ? "undefined" != typeof he.ready ? he.ready(e) : e(J) : (void 0 !== e.selector && (this.selector = e.selector, this.context = e.context), J.makeArray(e, this))
        }; ue.prototype = J.fn, he = J(Z); var le = /^(?:parents|prev(?:Until|All))/, pe = {
            children: !0, contents: !0, next: !0, prev: !0
        }; J.extend({
            dir: function (e, t, r) {
                for (var n = [], i = void 0 !== r; (e = e[t]) && 9 !== e.nodeType;)if (1 === e.nodeType) {
                    if (i && J(e).is(r)) break; n.push(e)
                } return n
            }, sibling: function (e, t) {
                for (var r = []; e; e = e.nextSibling)1 === e.nodeType && e !== t && r.push(e); return r
            }
        }), J.fn.extend({
            has: function (e) {
                var t = J(e, this), r = t.length; return this.filter(function () {
                    for (var e = 0; r > e; e++)if (J.contains(this, t[e])) return !0
                })
            }, closest: function (e, t) {
                for (var r, n = 0, i = this.length, o = [], a = oe.test(e) || "string" != typeof e ? J(e, t || this.context) : 0; i > n; n++)for (r = this[n]; r && r !== t; r = r.parentNode)if (r.nodeType < 11 && (a ? a.index(r) > -1 : 1 === r.nodeType && J.find.matchesSelector(r, e))) {
                    o.push(r); break
                } return this.pushStack(o.length > 1 ? J.unique(o) : o)
            }, index: function (e) {
                return e ? "string" == typeof e ? X.call(J(e), this[0]) : X.call(this, e.jquery ? e[0] : e) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1
            }, add: function (e, t) {
                return this.pushStack(J.unique(J.merge(this.get(), J(e, t))))
            }, addBack: function (e) {
                return this.add(null == e ? this.prevObject : this.prevObject.filter(e))
            }
        }), J.each({
            parent: function (e) {
                var t = e.parentNode; return t && 11 !== t.nodeType ? t : null
            }, parents: function (e) {
                return J.dir(e, "parentNode")
            }, parentsUntil: function (e, t, r) {
                return J.dir(e, "parentNode", r)
            }, next: function (e) {
                return i(e, "nextSibling")
            }, prev: function (e) {
                return i(e, "previousSibling")
            }, nextAll: function (e) {
                return J.dir(e, "nextSibling")
            }, prevAll: function (e) {
                return J.dir(e, "previousSibling")
            }, nextUntil: function (e, t, r) {
                return J.dir(e, "nextSibling", r)
            }, prevUntil: function (e, t, r) {
                return J.dir(e, "previousSibling", r)
            }, siblings: function (e) {
                return J.sibling((e.parentNode || {}).firstChild, e)
            }, children: function (e) {
                return J.sibling(e.firstChild)
            }, contents: function (e) {
                return e.contentDocument || J.merge([], e.childNodes)
            }
        }, function (e, t) {
            J.fn[e] = function (r, n) {
                var i = J.map(this, t, r); return "Until" !== e.slice(-5) && (n = r), n && "string" == typeof n && (i = J.filter(n, i)), this.length > 1 && (pe[e] || J.unique(i), le.test(e) && i.reverse()), this.pushStack(i)
            }
        }); var fe = /\S+/g, de = {}; J.Callbacks = function (e) {
            e = "string" == typeof e ? de[e] || o(e) : J.extend({}, e); var t, r, n, i, a, s, h = [], c = !e.once && [], u = function (o) {
                for (t = e.memory && o, r = !0, s = i || 0, i = 0, a = h.length, n = !0; h && a > s; s++)if (h[s].apply(o[0], o[1]) === !1 && e.stopOnFalse) {
                    t = !1; break
                } n = !1, h && (c ? c.length && u(c.shift()) : t ? h = [] : l.disable())
            }, l = {
                add: function () {
                    if (h) {
                        var r = h.length; !function o(t) {
                            J.each(t, function (t, r) {
                                var n = J.type(r); "function" === n ? e.unique && l.has(r) || h.push(r) : r && r.length && "string" !== n && o(r)
                            })
                        }(arguments), n ? a = h.length : t && (i = r, u(t))
                    } return this
                }, remove: function () {
                    return h && J.each(arguments, function (e, t) {
                        for (var r; (r = J.inArray(t, h, r)) > -1;)h.splice(r, 1), n && (a >= r && a--, s >= r && s--)
                    }), this
                }, has: function (e) {
                    return e ? J.inArray(e, h) > -1 : !(!h || !h.length)
                }, empty: function () {
                    return h = [], a = 0, this
                }, disable: function () {
                    return h = c = t = void 0, this
                }, disabled: function () {
                    return !h
                }, lock: function () {
                    return c = void 0, t || l.disable(), this
                }, locked: function () {
                    return !c
                }, fireWith: function (e, t) {
                    return !h || r && !c || (t = t || [], t = [e, t.slice ? t.slice() : t], n ? c.push(t) : u(t)), this
                }, fire: function () {
                    return l.fireWith(this, arguments), this
                }, fired: function () {
                    return !!r
                }
            }; return l
        }, J.extend({
            Deferred: function (e) {
                var t = [["resolve", "done", J.Callbacks("once memory"), "resolved"], ["reject", "fail", J.Callbacks("once memory"), "rejected"], ["notify", "progress", J.Callbacks("memory")]], r = "pending", n = {
                    state: function () {
                        return r
                    }, always: function () {
                        return i.done(arguments).fail(arguments), this
                    }, then: function () {
                        var e = arguments; return J.Deferred(function (r) {
                            J.each(t, function (t, o) {
                                var a = J.isFunction(e[t]) && e[t]; i[o[1]](function () {
                                    var e = a && a.apply(this, arguments); e && J.isFunction(e.promise) ? e.promise().done(r.resolve).fail(r.reject).progress(r.notify) : r[o[0] + "With"](this === n ? r.promise() : this, a ? [e] : arguments)
                                })
                            }), e = null
                        }).promise()
                    }, promise: function (e) {
                        return null != e ? J.extend(e, n) : n
                    }
                }, i = {}; return n.pipe = n.then, J.each(t, function (e, o) {
                    var a = o[2], s = o[3]; n[o[1]] = a.add, s && a.add(function () {
                        r = s
                    }, t[1 ^ e][2].disable, t[2][2].lock), i[o[0]] = function () {
                        return i[o[0] + "With"](this === i ? n : this, arguments), this
                    }, i[o[0] + "With"] = a.fireWith
                }), n.promise(i), e && e.call(i, i), i
            }, when: function (e) {
                var t, r, n, i = 0, o = z.call(arguments), a = o.length, s = 1 !== a || e && J.isFunction(e.promise) ? a : 0, h = 1 === s ? e : J.Deferred(), c = function (e, r, n) {
                    return function (i) {
                        r[e] = this, n[e] = arguments.length > 1 ? z.call(arguments) : i, n === t ? h.notifyWith(r, n) : --s || h.resolveWith(r, n)
                    }
                }; if (a > 1) for (t = new Array(a), r = new Array(a), n = new Array(a); a > i; i++)o[i] && J.isFunction(o[i].promise) ? o[i].promise().done(c(i, n, o)).fail(h.reject).progress(c(i, r, t)) : --s; return s || h.resolveWith(n, o), h.promise()
            }
        }); var Ee; J.fn.ready = function (e) {
            return J.ready.promise().done(e), this
        }, J.extend({
            isReady: !1, readyWait: 1, holdReady: function (e) {
                e ? J.readyWait++ : J.ready(!0)
            }, ready: function (e) {
                (e === !0 ? --J.readyWait : J.isReady) || (J.isReady = !0, e !== !0 && --J.readyWait > 0 || (Ee.resolveWith(Z, [J]), J.fn.triggerHandler && (J(Z).triggerHandler("ready"), J(Z).off("ready"))))
            }
        }), J.ready.promise = function (t) {
            return Ee || (Ee = J.Deferred(), "complete" === Z.readyState ? setTimeout(J.ready) : (Z.addEventListener("DOMContentLoaded", a, !1), e.addEventListener("load", a, !1))), Ee.promise(t)
        }, J.ready.promise(); var me = J.access = function (e, t, r, n, i, o, a) {
            var s = 0, h = e.length, c = null == r; if ("object" === J.type(r)) {
                i = !0; for (s in r) J.access(e, t, s, r[s], !0, o, a)
            } else if (void 0 !== n && (i = !0, J.isFunction(n) || (a = !0), c && (a ? (t.call(e, n), t = null) : (c = t, t = function (e, t, r) {
                return c.call(J(e), r)
            })), t)) for (; h > s; s++)t(e[s], r, a ? n : n.call(e[s], s, t(e[s], r))); return i ? e : c ? t.call(e) : h ? t(e[0], r) : o
        }; J.acceptData = function (e) {
            return 1 === e.nodeType || 9 === e.nodeType || !+e.nodeType
        }, s.uid = 1, s.accepts = J.acceptData, s.prototype = {
            key: function (e) {
                if (!s.accepts(e)) return 0; var t = {}, r = e[this.expando]; if (!r) {
                    r = s.uid++; try {
                        t[this.expando] = {
                            value: r
                        }, Object.defineProperties(e, t)
                    } catch (n) {
                        t[this.expando] = r, J.extend(e, t)
                    }
                } return this.cache[r] || (this.cache[r] = {}), r
            }, set: function (e, t, r) {
                var n, i = this.key(e), o = this.cache[i]; if ("string" == typeof t) o[t] = r; else if (J.isEmptyObject(o)) J.extend(this.cache[i], t); else for (n in t) o[n] = t[n]; return o
            }, get: function (e, t) {
                var r = this.cache[this.key(e)]; return void 0 === t ? r : r[t]
            }, access: function (e, t, r) {
                var n; return void 0 === t || t && "string" == typeof t && void 0 === r ? (n = this.get(e, t), void 0 !== n ? n : this.get(e, J.camelCase(t))) : (this.set(e, t, r), void 0 !== r ? r : t)
            }, remove: function (e, t) {
                var r, n, i, o = this.key(e), a = this.cache[o]; if (void 0 === t) this.cache[o] = {}; else {
                    J.isArray(t) ? n = t.concat(t.map(J.camelCase)) : (i = J.camelCase(t), t in a ? n = [t, i] : (n = i, n = n in a ? [n] : n.match(fe) || [])), r = n.length; for (; r--;)delete a[n[r]]
                }
            }, hasData: function (e) {
                return !J.isEmptyObject(this.cache[e[this.expando]] || {})
            }, discard: function (e) {
                e[this.expando] && delete this.cache[e[this.expando]]
            }
        }; var ge = new s, ve = new s, Te = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, ye = /([A-Z])/g; J.extend({
            hasData: function (e) {
                return ve.hasData(e) || ge.hasData(e)
            }, data: function (e, t, r) {
                return ve.access(e, t, r)
            }, removeData: function (e, t) {
                ve.remove(e, t)
            }, _data: function (e, t, r) {
                return ge.access(e, t, r)
            }, _removeData: function (e, t) {
                ge.remove(e, t)
            }
        }), J.fn.extend({
            data: function (e, t) {
                var r, n, i, o = this[0], a = o && o.attributes; if (void 0 === e) {
                    if (this.length && (i = ve.get(o), 1 === o.nodeType && !ge.get(o, "hasDataAttrs"))) {
                        for (r = a.length; r--;)a[r] && (n = a[r].name, 0 === n.indexOf("data-") && (n = J.camelCase(n.slice(5)), h(o, n, i[n]))); ge.set(o, "hasDataAttrs", !0)
                    } return i
                } return "object" == typeof e ? this.each(function () {
                    ve.set(this, e)
                }) : me(this, function (t) {
                    var r, n = J.camelCase(e); if (o && void 0 === t) {
                        if (r = ve.get(o, e), void 0 !== r) return r; if (r = ve.get(o, n), void 0 !== r) return r; if (r = h(o, n, void 0), void 0 !== r) return r
                    } else this.each(function () {
                        var r = ve.get(this, n); ve.set(this, n, t), -1 !== e.indexOf("-") && void 0 !== r && ve.set(this, e, t)
                    })
                }, null, t, arguments.length > 1, null, !0)
            }, removeData: function (e) {
                return this.each(function () {
                    ve.remove(this, e)
                })
            }
        }), J.extend({
            queue: function (e, t, r) {
                var n; return e ? (t = (t || "fx") + "queue", n = ge.get(e, t), r && (!n || J.isArray(r) ? n = ge.access(e, t, J.makeArray(r)) : n.push(r)), n || []) : void 0
            }, dequeue: function (e, t) {
                t = t || "fx"; var r = J.queue(e, t), n = r.length, i = r.shift(), o = J._queueHooks(e, t), a = function () {
                    J.dequeue(e, t)
                }; "inprogress" === i && (i = r.shift(), n--), i && ("fx" === t && r.unshift("inprogress"), delete o.stop, i.call(e, a, o)), !n && o && o.empty.fire()
            }, _queueHooks: function (e, t) {
                var r = t + "queueHooks"; return ge.get(e, r) || ge.access(e, r, {
                    empty: J.Callbacks("once memory").add(function () {
                        ge.remove(e, [t + "queue", r])
                    })
                })
            }
        }), J.fn.extend({
            queue: function (e, t) {
                var r = 2; return "string" != typeof e && (t = e, e = "fx", r--), arguments.length < r ? J.queue(this[0], e) : void 0 === t ? this : this.each(function () {
                    var r = J.queue(this, e, t); J._queueHooks(this, e), "fx" === e && "inprogress" !== r[0] && J.dequeue(this, e)
                })
            }, dequeue: function (e) {
                return this.each(function () {
                    J.dequeue(this, e)
                })
            }, clearQueue: function (e) {
                return this.queue(e || "fx", [])
            }, promise: function (e, t) {
                var r, n = 1, i = J.Deferred(), o = this, a = this.length, s = function () {
                    --n || i.resolveWith(o, [o])
                }; for ("string" != typeof e && (t = e, e = void 0), e = e || "fx"; a--;)r = ge.get(o[a], e + "queueHooks"), r && r.empty && (n++, r.empty.add(s)); return s(), i.promise(t)
            }
        }); var Re = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, xe = ["Top", "Right", "Bottom", "Left"], He = function (e, t) {
            return e = t || e, "none" === J.css(e, "display") || !J.contains(e.ownerDocument, e)
        }, be = /^(?:checkbox|radio)$/i; !function () {
            var e = Z.createDocumentFragment(), t = e.appendChild(Z.createElement("div")), r = Z.createElement("input"); r.setAttribute("type", "radio"), r.setAttribute("checked", "checked"), r.setAttribute("name", "t"), t.appendChild(r), $.checkClone = t.cloneNode(!0).cloneNode(!0).lastChild.checked, t.innerHTML = "<textarea>x</textarea>", $.noCloneChecked = !!t.cloneNode(!0).lastChild.defaultValue
        }(); var we = "undefined"; $.focusinBubbles = "onfocusin" in e; var Me = /^key/, Se = /^(?:mouse|pointer|contextmenu)|click/, _e = /^(?:focusinfocus|focusoutblur)$/, Ce = /^([^.]*)(?:\.(.+)|)$/; J.event = {
            global: {}, add: function (e, t, r, n, i) {
                var o, a, s, h, c, u, l, p, f, d, E, m = ge.get(e); if (m) for (r.handler && (o = r, r = o.handler, i = o.selector), r.guid || (r.guid = J.guid++), (h = m.events) || (h = m.events = {}), (a = m.handle) || (a = m.handle = function (t) {
                    return typeof J !== we && J.event.triggered !== t.type ? J.event.dispatch.apply(e, arguments) : void 0
                }), t = (t || "").match(fe) || [""], c = t.length; c--;)s = Ce.exec(t[c]) || [], f = E = s[1], d = (s[2] || "").split(".").sort(), f && (l = J.event.special[f] || {}, f = (i ? l.delegateType : l.bindType) || f, l = J.event.special[f] || {}, u = J.extend({
                    type: f, origType: E, data: n, handler: r, guid: r.guid, selector: i, needsContext: i && J.expr.match.needsContext.test(i), namespace: d.join(".")
                }, o), (p = h[f]) || (p = h[f] = [], p.delegateCount = 0, l.setup && l.setup.call(e, n, d, a) !== !1 || e.addEventListener && e.addEventListener(f, a, !1)), l.add && (l.add.call(e, u), u.handler.guid || (u.handler.guid = r.guid)), i ? p.splice(p.delegateCount++, 0, u) : p.push(u), J.event.global[f] = !0)
            }, remove: function (e, t, r, n, i) {
                var o, a, s, h, c, u, l, p, f, d, E, m = ge.hasData(e) && ge.get(e); if (m && (h = m.events)) {
                    for (t = (t || "").match(fe) || [""], c = t.length; c--;)if (s = Ce.exec(t[c]) || [], f = E = s[1], d = (s[2] || "").split(".").sort(), f) {
                        for (l = J.event.special[f] || {}, f = (n ? l.delegateType : l.bindType) || f, p = h[f] || [], s = s[2] && new RegExp("(^|\\.)" + d.join("\\.(?:.*\\.|)") + "(\\.|$)"), a = o = p.length; o--;)u = p[o], !i && E !== u.origType || r && r.guid !== u.guid || s && !s.test(u.namespace) || n && n !== u.selector && ("**" !== n || !u.selector) || (p.splice(o, 1), u.selector && p.delegateCount--, l.remove && l.remove.call(e, u)); a && !p.length && (l.teardown && l.teardown.call(e, d, m.handle) !== !1 || J.removeEvent(e, f, m.handle), delete h[f])
                    } else for (f in h) J.event.remove(e, f + t[c], r, n, !0); J.isEmptyObject(h) && (delete m.handle, ge.remove(e, "events"))
                }
            }, trigger: function (t, r, n, i) {
                var o, a, s, h, c, u, l, p = [n || Z], f = K.call(t, "type") ? t.type : t, d = K.call(t, "namespace") ? t.namespace.split(".") : []; if (a = s = n = n || Z, 3 !== n.nodeType && 8 !== n.nodeType && !_e.test(f + J.event.triggered) && (f.indexOf(".") >= 0 && (d = f.split("."), f = d.shift(), d.sort()), c = f.indexOf(":") < 0 && "on" + f, t = t[J.expando] ? t : new J.Event(f, "object" == typeof t && t), t.isTrigger = i ? 2 : 3, t.namespace = d.join("."), t.namespace_re = t.namespace ? new RegExp("(^|\\.)" + d.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, t.result = void 0, t.target || (t.target = n), r = null == r ? [t] : J.makeArray(r, [t]), l = J.event.special[f] || {}, i || !l.trigger || l.trigger.apply(n, r) !== !1)) {
                    if (!i && !l.noBubble && !J.isWindow(n)) {
                        for (h = l.delegateType || f, _e.test(h + f) || (a = a.parentNode); a; a = a.parentNode)p.push(a), s = a; s === (n.ownerDocument || Z) && p.push(s.defaultView || s.parentWindow || e)
                    } for (o = 0; (a = p[o++]) && !t.isPropagationStopped();)t.type = o > 1 ? h : l.bindType || f, u = (ge.get(a, "events") || {})[t.type] && ge.get(a, "handle"), u && u.apply(a, r), u = c && a[c], u && u.apply && J.acceptData(a) && (t.result = u.apply(a, r), t.result === !1 && t.preventDefault()); return t.type = f, i || t.isDefaultPrevented() || l._default && l._default.apply(p.pop(), r) !== !1 || !J.acceptData(n) || c && J.isFunction(n[f]) && !J.isWindow(n) && (s = n[c], s && (n[c] = null), J.event.triggered = f, n[f](), J.event.triggered = void 0, s && (n[c] = s)), t.result
                }
            }, dispatch: function (e) {
                e = J.event.fix(e); var t, r, n, i, o, a = [], s = z.call(arguments), h = (ge.get(this, "events") || {})[e.type] || [], c = J.event.special[e.type] || {}; if (s[0] = e, e.delegateTarget = this, !c.preDispatch || c.preDispatch.call(this, e) !== !1) {
                    for (a = J.event.handlers.call(this, e, h), t = 0; (i = a[t++]) && !e.isPropagationStopped();)for (e.currentTarget = i.elem, r = 0; (o = i.handlers[r++]) && !e.isImmediatePropagationStopped();)(!e.namespace_re || e.namespace_re.test(o.namespace)) && (e.handleObj = o, e.data = o.data, n = ((J.event.special[o.origType] || {}).handle || o.handler).apply(i.elem, s), void 0 !== n && (e.result = n) === !1 && (e.preventDefault(), e.stopPropagation())); return c.postDispatch && c.postDispatch.call(this, e), e.result
                }
            }, handlers: function (e, t) {
                var r, n, i, o, a = [], s = t.delegateCount, h = e.target; if (s && h.nodeType && (!e.button || "click" !== e.type)) for (; h !== this; h = h.parentNode || this)if (h.disabled !== !0 || "click" !== e.type) {
                    for (n = [], r = 0; s > r; r++)o = t[r], i = o.selector + " ", void 0 === n[i] && (n[i] = o.needsContext ? J(i, this).index(h) >= 0 : J.find(i, this, null, [h]).length), n[i] && n.push(o); n.length && a.push({
                        elem: h, handlers: n
                    })
                } return s < t.length && a.push({
                    elem: this, handlers: t.slice(s)
                }), a
            }, props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "), fixHooks: {}, keyHooks: {
                props: "char charCode key keyCode".split(" "), filter: function (e, t) {
                    return null == e.which && (e.which = null != t.charCode ? t.charCode : t.keyCode), e
                }
            }, mouseHooks: {
                props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "), filter: function (e, t) {
                    var r, n, i, o = t.button; return null == e.pageX && null != t.clientX && (r = e.target.ownerDocument || Z, n = r.documentElement, i = r.body, e.pageX = t.clientX + (n && n.scrollLeft || i && i.scrollLeft || 0) - (n && n.clientLeft || i && i.clientLeft || 0), e.pageY = t.clientY + (n && n.scrollTop || i && i.scrollTop || 0) - (n && n.clientTop || i && i.clientTop || 0)), e.which || void 0 === o || (e.which = 1 & o ? 1 : 2 & o ? 3 : 4 & o ? 2 : 0), e
                }
            }, fix: function (e) {
                if (e[J.expando]) return e; var t, r, n, i = e.type, o = e, a = this.fixHooks[i]; for (a || (this.fixHooks[i] = a = Se.test(i) ? this.mouseHooks : Me.test(i) ? this.keyHooks : {}), n = a.props ? this.props.concat(a.props) : this.props, e = new J.Event(o), t = n.length; t--;)r = n[t], e[r] = o[r]; return e.target || (e.target = Z), 3 === e.target.nodeType && (e.target = e.target.parentNode), a.filter ? a.filter(e, o) : e
            }, special: {
                load: {
                    noBubble: !0
                }, focus: {
                    trigger: function () {
                        return this !== l() && this.focus ? (this.focus(), !1) : void 0
                    }, delegateType: "focusin"
                }, blur: {
                    trigger: function () {
                        return this === l() && this.blur ? (this.blur(), !1) : void 0
                    }, delegateType: "focusout"
                }, click: {
                    trigger: function () {
                        return "checkbox" === this.type && this.click && J.nodeName(this, "input") ? (this.click(), !1) : void 0
                    }, _default: function (e) {
                        return J.nodeName(e.target, "a")
                    }
                }, beforeunload: {
                    postDispatch: function (e) {
                        void 0 !== e.result && e.originalEvent && (e.originalEvent.returnValue = e.result)
                    }
                }
            }, simulate: function (e, t, r, n) {
                var i = J.extend(new J.Event, r, {
                    type: e, isSimulated: !0, originalEvent: {}
                }); n ? J.event.trigger(i, null, t) : J.event.dispatch.call(t, i), i.isDefaultPrevented() && r.preventDefault()
            }
        }, J.removeEvent = function (e, t, r) {
            e.removeEventListener && e.removeEventListener(t, r, !1)
        }, J.Event = function (e, t) {
            return this instanceof J.Event ? (e && e.type ? (this.originalEvent = e, this.type = e.type, this.isDefaultPrevented = e.defaultPrevented || void 0 === e.defaultPrevented && e.returnValue === !1 ? c : u) : this.type = e, t && J.extend(this, t), this.timeStamp = e && e.timeStamp || J.now(), void (this[J.expando] = !0)) : new J.Event(e, t)
        }, J.Event.prototype = {
            isDefaultPrevented: u, isPropagationStopped: u, isImmediatePropagationStopped: u, preventDefault: function () {
                var e = this.originalEvent; this.isDefaultPrevented = c, e && e.preventDefault && e.preventDefault()
            }, stopPropagation: function () {
                var e = this.originalEvent; this.isPropagationStopped = c, e && e.stopPropagation && e.stopPropagation()
            }, stopImmediatePropagation: function () {
                var e = this.originalEvent; this.isImmediatePropagationStopped = c, e && e.stopImmediatePropagation && e.stopImmediatePropagation(), this.stopPropagation()
            }
        }, J.each({
            mouseenter: "mouseover", mouseleave: "mouseout", pointerenter: "pointerover", pointerleave: "pointerout"
        }, function (e, t) {
            J.event.special[e] = {
                delegateType: t, bindType: t, handle: function (e) {
                    var r, n = this, i = e.relatedTarget, o = e.handleObj; return (!i || i !== n && !J.contains(n, i)) && (e.type = o.origType, r = o.handler.apply(this, arguments), e.type = t), r
                }
            }
        }), $.focusinBubbles || J.each({
            focus: "focusin", blur: "focusout"
        }, function (e, t) {
            var r = function (e) {
                J.event.simulate(t, e.target, J.event.fix(e), !0)
            }; J.event.special[t] = {
                setup: function () {
                    var n = this.ownerDocument || this, i = ge.access(n, t); i || n.addEventListener(e, r, !0), ge.access(n, t, (i || 0) + 1)
                }, teardown: function () {
                    var n = this.ownerDocument || this, i = ge.access(n, t) - 1; i ? ge.access(n, t, i) : (n.removeEventListener(e, r, !0), ge.remove(n, t))
                }
            }
        }), J.fn.extend({
            on: function (e, t, r, n, i) {
                var o, a; if ("object" == typeof e) {
                    "string" != typeof t && (r = r || t, t = void 0); for (a in e) this.on(a, t, r, e[a], i); return this
                } if (null == r && null == n ? (n = t, r = t = void 0) : null == n && ("string" == typeof t ? (n = r, r = void 0) : (n = r, r = t, t = void 0)), n === !1) n = u; else if (!n) return this; return 1 === i && (o = n, n = function (e) {
                    return J().off(e), o.apply(this, arguments)
                }, n.guid = o.guid || (o.guid = J.guid++)), this.each(function () {
                    J.event.add(this, e, n, r, t)
                })
            }, one: function (e, t, r, n) {
                return this.on(e, t, r, n, 1)
            }, off: function (e, t, r) {
                var n, i; if (e && e.preventDefault && e.handleObj) return n = e.handleObj, J(e.delegateTarget).off(n.namespace ? n.origType + "." + n.namespace : n.origType, n.selector, n.handler), this; if ("object" == typeof e) {
                    for (i in e) this.off(i, t, e[i]); return this
                } return (t === !1 || "function" == typeof t) && (r = t, t = void 0), r === !1 && (r = u), this.each(function () {
                    J.event.remove(this, e, r, t)
                })
            }, trigger: function (e, t) {
                return this.each(function () {
                    J.event.trigger(e, t, this)
                })
            }, triggerHandler: function (e, t) {
                var r = this[0]; return r ? J.event.trigger(e, t, r, !0) : void 0
            }
        }); var Ae = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, Le = /<([\w:]+)/, ke = /<|&#?\w+;/, Pe = /<(?:script|style|link)/i, De = /checked\s*(?:[^=]|=\s*.checked.)/i, Oe = /^$|\/(?:java|ecma)script/i, Fe = /^true\/(.*)/, Ne = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g, Ve = {
            option: [1, "<select multiple='multiple'>", "</select>"], thead: [1, "<table>", "</table>"], col: [2, "<table><colgroup>", "</colgroup></table>"], tr: [2, "<table><tbody>", "</tbody></table>"], td: [3, "<table><tbody><tr>", "</tr></tbody></table>"], _default: [0, "", ""]
        }; Ve.optgroup = Ve.option, Ve.tbody = Ve.tfoot = Ve.colgroup = Ve.caption = Ve.thead, Ve.th = Ve.td, J.extend({
            clone: function (e, t, r) {
                var n, i, o, a, s = e.cloneNode(!0), h = J.contains(e.ownerDocument, e); if (!($.noCloneChecked || 1 !== e.nodeType && 11 !== e.nodeType || J.isXMLDoc(e))) for (a = g(s), o = g(e), n = 0, i = o.length; i > n; n++)v(o[n], a[n]); if (t) if (r) for (o = o || g(e), a = a || g(s), n = 0, i = o.length; i > n; n++)m(o[n], a[n]); else m(e, s); return a = g(s, "script"), a.length > 0 && E(a, !h && g(e, "script")), s
            }, buildFragment: function (e, t, r, n) {
                for (var i, o, a, s, h, c, u = t.createDocumentFragment(), l = [], p = 0, f = e.length; f > p; p++)if (i = e[p], i || 0 === i) if ("object" === J.type(i)) J.merge(l, i.nodeType ? [i] : i); else if (ke.test(i)) {
                    for (o = o || u.appendChild(t.createElement("div")), a = (Le.exec(i) || ["", ""])[1].toLowerCase(), s = Ve[a] || Ve._default, o.innerHTML = s[1] + i.replace(Ae, "<$1></$2>") + s[2], c = s[0]; c--;)o = o.lastChild; J.merge(l, o.childNodes), o = u.firstChild, o.textContent = ""
                } else l.push(t.createTextNode(i)); for (u.textContent = "", p = 0; i = l[p++];)if ((!n || -1 === J.inArray(i, n)) && (h = J.contains(i.ownerDocument, i), o = g(u.appendChild(i), "script"), h && E(o), r)) for (c = 0; i = o[c++];)Oe.test(i.type || "") && r.push(i); return u
            }, cleanData: function (e) {
                for (var t, r, n, i, o = J.event.special, a = 0; void 0 !== (r = e[a]); a++) {
                    if (J.acceptData(r) && (i = r[ge.expando], i && (t = ge.cache[i]))) {
                        if (t.events) for (n in t.events) o[n] ? J.event.remove(r, n) : J.removeEvent(r, n, t.handle); ge.cache[i] && delete ge.cache[i]
                    } delete ve.cache[r[ve.expando]]
                }
            }
        }), J.fn.extend({
            text: function (e) {
                return me(this, function (e) {
                    return void 0 === e ? J.text(this) : this.empty().each(function () {
                        (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) && (this.textContent = e)
                    })
                }, null, e, arguments.length)
            }, append: function () {
                return this.domManip(arguments, function (e) {
                    if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                        var t = p(this, e); t.appendChild(e)
                    }
                })
            }, prepend: function () {
                return this.domManip(arguments, function (e) {
                    if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                        var t = p(this, e); t.insertBefore(e, t.firstChild)
                    }
                })
            }, before: function () {
                return this.domManip(arguments, function (e) {
                    this.parentNode && this.parentNode.insertBefore(e, this)
                })
            }, after: function () {
                return this.domManip(arguments, function (e) {
                    this.parentNode && this.parentNode.insertBefore(e, this.nextSibling)
                })
            }, remove: function (e, t) {
                for (var r, n = e ? J.filter(e, this) : this, i = 0; null != (r = n[i]); i++)t || 1 !== r.nodeType || J.cleanData(g(r)), r.parentNode && (t && J.contains(r.ownerDocument, r) && E(g(r, "script")), r.parentNode.removeChild(r)); return this
            }, empty: function () {
                for (var e, t = 0; null != (e = this[t]); t++)1 === e.nodeType && (J.cleanData(g(e, !1)), e.textContent = ""); return this
            }, clone: function (e, t) {
                return e = null == e ? !1 : e, t = null == t ? e : t, this.map(function () {
                    return J.clone(this, e, t)
                })
            }, html: function (e) {
                return me(this, function (e) {
                    var t = this[0] || {}, r = 0, n = this.length; if (void 0 === e && 1 === t.nodeType) return t.innerHTML; if ("string" == typeof e && !Pe.test(e) && !Ve[(Le.exec(e) || ["", ""])[1].toLowerCase()]) {
                        e = e.replace(Ae, "<$1></$2>"); try {
                            for (; n > r; r++)t = this[r] || {}, 1 === t.nodeType && (J.cleanData(g(t, !1)), t.innerHTML = e); t = 0
                        } catch (i) {
                        }
                    } t && this.empty().append(e)
                }, null, e, arguments.length)
            }, replaceWith: function () {
                var e = arguments[0]; return this.domManip(arguments, function (t) {
                    e = this.parentNode, J.cleanData(g(this)), e && e.replaceChild(t, this)
                }), e && (e.length || e.nodeType) ? this : this.remove()
            }, detach: function (e) {
                return this.remove(e, !0)
            }, domManip: function (e, t) {
                e = j.apply([], e); var r, n, i, o, a, s, h = 0, c = this.length, u = this, l = c - 1, p = e[0], E = J.isFunction(p);
                if (E || c > 1 && "string" == typeof p && !$.checkClone && De.test(p)) return this.each(function (r) {
                    var n = u.eq(r); E && (e[0] = p.call(this, r, n.html())), n.domManip(e, t)
                }); if (c && (r = J.buildFragment(e, this[0].ownerDocument, !1, this), n = r.firstChild, 1 === r.childNodes.length && (r = n), n)) {
                    for (i = J.map(g(r, "script"), f), o = i.length; c > h; h++)a = r, h !== l && (a = J.clone(a, !0, !0), o && J.merge(i, g(a, "script"))), t.call(this[h], a, h); if (o) for (s = i[i.length - 1].ownerDocument, J.map(i, d), h = 0; o > h; h++)a = i[h], Oe.test(a.type || "") && !ge.access(a, "globalEval") && J.contains(s, a) && (a.src ? J._evalUrl && J._evalUrl(a.src) : J.globalEval(a.textContent.replace(Ne, "")))
                } return this
            }
        }), J.each({
            appendTo: "append", prependTo: "prepend", insertBefore: "before", insertAfter: "after", replaceAll: "replaceWith"
        }, function (e, t) {
            J.fn[e] = function (e) {
                for (var r, n = [], i = J(e), o = i.length - 1, a = 0; o >= a; a++)r = a === o ? this : this.clone(!0), J(i[a])[t](r), W.apply(n, r.get()); return this.pushStack(n)
            }
        }); var Ue, Be = {}, Ie = /^margin/, Ge = new RegExp("^(" + Re + ")(?!px)[a-z%]+$", "i"), ze = function (t) {
            return t.ownerDocument.defaultView.opener ? t.ownerDocument.defaultView.getComputedStyle(t, null) : e.getComputedStyle(t, null)
        }; !function () {
            function t() {
                a.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute", a.innerHTML = "", i.appendChild(o); var t = e.getComputedStyle(a, null); r = "1%" !== t.top, n = "4px" === t.width, i.removeChild(o)
            } var r, n, i = Z.documentElement, o = Z.createElement("div"), a = Z.createElement("div"); a.style && (a.style.backgroundClip = "content-box", a.cloneNode(!0).style.backgroundClip = "", $.clearCloneStyle = "content-box" === a.style.backgroundClip, o.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute", o.appendChild(a), e.getComputedStyle && J.extend($, {
                pixelPosition: function () {
                    return t(), r
                }, boxSizingReliable: function () {
                    return null == n && t(), n
                }, reliableMarginRight: function () {
                    var t, r = a.appendChild(Z.createElement("div")); return r.style.cssText = a.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0", r.style.marginRight = r.style.width = "0", a.style.width = "1px", i.appendChild(o), t = !parseFloat(e.getComputedStyle(r, null).marginRight), i.removeChild(o), a.removeChild(r), t
                }
            }))
        }(), J.swap = function (e, t, r, n) {
            var i, o, a = {}; for (o in t) a[o] = e.style[o], e.style[o] = t[o]; i = r.apply(e, n || []); for (o in t) e.style[o] = a[o]; return i
        }; var je = /^(none|table(?!-c[ea]).+)/, We = new RegExp("^(" + Re + ")(.*)$", "i"), Xe = new RegExp("^([+-])=(" + Re + ")", "i"), qe = {
            position: "absolute", visibility: "hidden", display: "block"
        }, Ye = {
            letterSpacing: "0", fontWeight: "400"
        }, Ke = ["Webkit", "O", "Moz", "ms"]; J.extend({
            cssHooks: {
                opacity: {
                    get: function (e, t) {
                        if (t) {
                            var r = R(e, "opacity"); return "" === r ? "1" : r
                        }
                    }
                }
            }, cssNumber: {
                columnCount: !0, fillOpacity: !0, flexGrow: !0, flexShrink: !0, fontWeight: !0, lineHeight: !0, opacity: !0, order: !0, orphans: !0, widows: !0, zIndex: !0, zoom: !0
            }, cssProps: {
                "float": "cssFloat"
            }, style: function (e, t, r, n) {
                if (e && 3 !== e.nodeType && 8 !== e.nodeType && e.style) {
                    var i, o, a, s = J.camelCase(t), h = e.style; return t = J.cssProps[s] || (J.cssProps[s] = H(h, s)), a = J.cssHooks[t] || J.cssHooks[s], void 0 === r ? a && "get" in a && void 0 !== (i = a.get(e, !1, n)) ? i : h[t] : (o = typeof r, "string" === o && (i = Xe.exec(r)) && (r = (i[1] + 1) * i[2] + parseFloat(J.css(e, t)), o = "number"), null != r && r === r && ("number" !== o || J.cssNumber[s] || (r += "px"), $.clearCloneStyle || "" !== r || 0 !== t.indexOf("background") || (h[t] = "inherit"), a && "set" in a && void 0 === (r = a.set(e, r, n)) || (h[t] = r)), void 0)
                }
            }, css: function (e, t, r, n) {
                var i, o, a, s = J.camelCase(t); return t = J.cssProps[s] || (J.cssProps[s] = H(e.style, s)), a = J.cssHooks[t] || J.cssHooks[s], a && "get" in a && (i = a.get(e, !0, r)), void 0 === i && (i = R(e, t, n)), "normal" === i && t in Ye && (i = Ye[t]), "" === r || r ? (o = parseFloat(i), r === !0 || J.isNumeric(o) ? o || 0 : i) : i
            }
        }), J.each(["height", "width"], function (e, t) {
            J.cssHooks[t] = {
                get: function (e, r, n) {
                    return r ? je.test(J.css(e, "display")) && 0 === e.offsetWidth ? J.swap(e, qe, function () {
                        return M(e, t, n)
                    }) : M(e, t, n) : void 0
                }, set: function (e, r, n) {
                    var i = n && ze(e); return b(e, r, n ? w(e, t, n, "border-box" === J.css(e, "boxSizing", !1, i), i) : 0)
                }
            }
        }), J.cssHooks.marginRight = x($.reliableMarginRight, function (e, t) {
            return t ? J.swap(e, {
                display: "inline-block"
            }, R, [e, "marginRight"]) : void 0
        }), J.each({
            margin: "", padding: "", border: "Width"
        }, function (e, t) {
            J.cssHooks[e + t] = {
                expand: function (r) {
                    for (var n = 0, i = {}, o = "string" == typeof r ? r.split(" ") : [r]; 4 > n; n++)i[e + xe[n] + t] = o[n] || o[n - 2] || o[0]; return i
                }
            }, Ie.test(e) || (J.cssHooks[e + t].set = b)
        }), J.fn.extend({
            css: function (e, t) {
                return me(this, function (e, t, r) {
                    var n, i, o = {}, a = 0; if (J.isArray(t)) {
                        for (n = ze(e), i = t.length; i > a; a++)o[t[a]] = J.css(e, t[a], !1, n); return o
                    } return void 0 !== r ? J.style(e, t, r) : J.css(e, t)
                }, e, t, arguments.length > 1)
            }, show: function () {
                return S(this, !0)
            }, hide: function () {
                return S(this)
            }, toggle: function (e) {
                return "boolean" == typeof e ? e ? this.show() : this.hide() : this.each(function () {
                    He(this) ? J(this).show() : J(this).hide()
                })
            }
        }), J.Tween = _, _.prototype = {
            constructor: _, init: function (e, t, r, n, i, o) {
                this.elem = e, this.prop = r, this.easing = i || "swing", this.options = t, this.start = this.now = this.cur(), this.end = n, this.unit = o || (J.cssNumber[r] ? "" : "px")
            }, cur: function () {
                var e = _.propHooks[this.prop]; return e && e.get ? e.get(this) : _.propHooks._default.get(this)
            }, run: function (e) {
                var t, r = _.propHooks[this.prop]; return this.options.duration ? this.pos = t = J.easing[this.easing](e, this.options.duration * e, 0, 1, this.options.duration) : this.pos = t = e, this.now = (this.end - this.start) * t + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), r && r.set ? r.set(this) : _.propHooks._default.set(this), this
            }
        }, _.prototype.init.prototype = _.prototype, _.propHooks = {
            _default: {
                get: function (e) {
                    var t; return null == e.elem[e.prop] || e.elem.style && null != e.elem.style[e.prop] ? (t = J.css(e.elem, e.prop, ""), t && "auto" !== t ? t : 0) : e.elem[e.prop]
                }, set: function (e) {
                    J.fx.step[e.prop] ? J.fx.step[e.prop](e) : e.elem.style && (null != e.elem.style[J.cssProps[e.prop]] || J.cssHooks[e.prop]) ? J.style(e.elem, e.prop, e.now + e.unit) : e.elem[e.prop] = e.now
                }
            }
        }, _.propHooks.scrollTop = _.propHooks.scrollLeft = {
            set: function (e) {
                e.elem.nodeType && e.elem.parentNode && (e.elem[e.prop] = e.now)
            }
        }, J.easing = {
            linear: function (e) {
                return e
            }, swing: function (e) {
                return .5 - Math.cos(e * Math.PI) / 2
            }
        }, J.fx = _.prototype.init, J.fx.step = {}; var $e, Ze, Qe = /^(?:toggle|show|hide)$/, Je = new RegExp("^(?:([+-])=|)(" + Re + ")([a-z%]*)$", "i"), et = /queueHooks$/, tt = [k], rt = {
            "*": [function (e, t) {
                var r = this.createTween(e, t), n = r.cur(), i = Je.exec(t), o = i && i[3] || (J.cssNumber[e] ? "" : "px"), a = (J.cssNumber[e] || "px" !== o && +n) && Je.exec(J.css(r.elem, e)), s = 1, h = 20; if (a && a[3] !== o) {
                    o = o || a[3], i = i || [], a = +n || 1; do s = s || ".5", a /= s, J.style(r.elem, e, a + o); while (s !== (s = r.cur() / n) && 1 !== s && --h)
                } return i && (a = r.start = +a || +n || 0, r.unit = o, r.end = i[1] ? a + (i[1] + 1) * i[2] : +i[2]), r
            }]
        }; J.Animation = J.extend(D, {
            tweener: function (e, t) {
                J.isFunction(e) ? (t = e, e = ["*"]) : e = e.split(" "); for (var r, n = 0, i = e.length; i > n; n++)r = e[n], rt[r] = rt[r] || [], rt[r].unshift(t)
            }, prefilter: function (e, t) {
                t ? tt.unshift(e) : tt.push(e)
            }
        }), J.speed = function (e, t, r) {
            var n = e && "object" == typeof e ? J.extend({}, e) : {
                complete: r || !r && t || J.isFunction(e) && e, duration: e, easing: r && t || t && !J.isFunction(t) && t
            }; return n.duration = J.fx.off ? 0 : "number" == typeof n.duration ? n.duration : n.duration in J.fx.speeds ? J.fx.speeds[n.duration] : J.fx.speeds._default, (null == n.queue || n.queue === !0) && (n.queue = "fx"), n.old = n.complete, n.complete = function () {
                J.isFunction(n.old) && n.old.call(this), n.queue && J.dequeue(this, n.queue)
            }, n
        }, J.fn.extend({
            fadeTo: function (e, t, r, n) {
                return this.filter(He).css("opacity", 0).show().end().animate({
                    opacity: t
                }, e, r, n)
            }, animate: function (e, t, r, n) {
                var i = J.isEmptyObject(e), o = J.speed(t, r, n), a = function () {
                    var t = D(this, J.extend({}, e), o); (i || ge.get(this, "finish")) && t.stop(!0)
                }; return a.finish = a, i || o.queue === !1 ? this.each(a) : this.queue(o.queue, a)
            }, stop: function (e, t, r) {
                var n = function (e) {
                    var t = e.stop; delete e.stop, t(r)
                }; return "string" != typeof e && (r = t, t = e, e = void 0), t && e !== !1 && this.queue(e || "fx", []), this.each(function () {
                    var t = !0, i = null != e && e + "queueHooks", o = J.timers, a = ge.get(this); if (i) a[i] && a[i].stop && n(a[i]); else for (i in a) a[i] && a[i].stop && et.test(i) && n(a[i]); for (i = o.length; i--;)o[i].elem !== this || null != e && o[i].queue !== e || (o[i].anim.stop(r), t = !1, o.splice(i, 1)); (t || !r) && J.dequeue(this, e)
                })
            }, finish: function (e) {
                return e !== !1 && (e = e || "fx"), this.each(function () {
                    var t, r = ge.get(this), n = r[e + "queue"], i = r[e + "queueHooks"], o = J.timers, a = n ? n.length : 0; for (r.finish = !0, J.queue(this, e, []), i && i.stop && i.stop.call(this, !0), t = o.length; t--;)o[t].elem === this && o[t].queue === e && (o[t].anim.stop(!0), o.splice(t, 1)); for (t = 0; a > t; t++)n[t] && n[t].finish && n[t].finish.call(this); delete r.finish
                })
            }
        }), J.each(["toggle", "show", "hide"], function (e, t) {
            var r = J.fn[t]; J.fn[t] = function (e, n, i) {
                return null == e || "boolean" == typeof e ? r.apply(this, arguments) : this.animate(A(t, !0), e, n, i)
            }
        }), J.each({
            slideDown: A("show"), slideUp: A("hide"), slideToggle: A("toggle"), fadeIn: {
                opacity: "show"
            }, fadeOut: {
                opacity: "hide"
            }, fadeToggle: {
                opacity: "toggle"
            }
        }, function (e, t) {
            J.fn[e] = function (e, r, n) {
                return this.animate(t, e, r, n)
            }
        }), J.timers = [], J.fx.tick = function () {
            var e, t = 0, r = J.timers; for ($e = J.now(); t < r.length; t++)e = r[t], e() || r[t] !== e || r.splice(t--, 1); r.length || J.fx.stop(), $e = void 0
        }, J.fx.timer = function (e) {
            J.timers.push(e), e() ? J.fx.start() : J.timers.pop()
        }, J.fx.interval = 13, J.fx.start = function () {
            Ze || (Ze = setInterval(J.fx.tick, J.fx.interval))
        }, J.fx.stop = function () {
            clearInterval(Ze), Ze = null
        }, J.fx.speeds = {
            slow: 600, fast: 200, _default: 400
        }, J.fn.delay = function (e, t) {
            return e = J.fx ? J.fx.speeds[e] || e : e, t = t || "fx", this.queue(t, function (t, r) {
                var n = setTimeout(t, e); r.stop = function () {
                    clearTimeout(n)
                }
            })
        }, function () {
            var e = Z.createElement("input"), t = Z.createElement("select"), r = t.appendChild(Z.createElement("option")); e.type = "checkbox", $.checkOn = "" !== e.value, $.optSelected = r.selected, t.disabled = !0, $.optDisabled = !r.disabled, e = Z.createElement("input"), e.value = "t", e.type = "radio", $.radioValue = "t" === e.value
        }(); var nt, it, ot = J.expr.attrHandle; J.fn.extend({
            attr: function (e, t) {
                return me(this, J.attr, e, t, arguments.length > 1)
            }, removeAttr: function (e) {
                return this.each(function () {
                    J.removeAttr(this, e)
                })
            }
        }), J.extend({
            attr: function (e, t, r) {
                var n, i, o = e.nodeType; if (e && 3 !== o && 8 !== o && 2 !== o) return typeof e.getAttribute === we ? J.prop(e, t, r) : (1 === o && J.isXMLDoc(e) || (t = t.toLowerCase(), n = J.attrHooks[t] || (J.expr.match.bool.test(t) ? it : nt)), void 0 === r ? n && "get" in n && null !== (i = n.get(e, t)) ? i : (i = J.find.attr(e, t), null == i ? void 0 : i) : null !== r ? n && "set" in n && void 0 !== (i = n.set(e, r, t)) ? i : (e.setAttribute(t, r + ""), r) : void J.removeAttr(e, t))
            }, removeAttr: function (e, t) {
                var r, n, i = 0, o = t && t.match(fe); if (o && 1 === e.nodeType) for (; r = o[i++];)n = J.propFix[r] || r, J.expr.match.bool.test(r) && (e[n] = !1), e.removeAttribute(r)
            }, attrHooks: {
                type: {
                    set: function (e, t) {
                        if (!$.radioValue && "radio" === t && J.nodeName(e, "input")) {
                            var r = e.value; return e.setAttribute("type", t), r && (e.value = r), t
                        }
                    }
                }
            }
        }), it = {
            set: function (e, t, r) {
                return t === !1 ? J.removeAttr(e, r) : e.setAttribute(r, r), r
            }
        }, J.each(J.expr.match.bool.source.match(/\w+/g), function (e, t) {
            var r = ot[t] || J.find.attr; ot[t] = function (e, t, n) {
                var i, o; return n || (o = ot[t], ot[t] = i, i = null != r(e, t, n) ? t.toLowerCase() : null, ot[t] = o), i
            }
        }); var at = /^(?:input|select|textarea|button)$/i; J.fn.extend({
            prop: function (e, t) {
                return me(this, J.prop, e, t, arguments.length > 1)
            }, removeProp: function (e) {
                return this.each(function () {
                    delete this[J.propFix[e] || e]
                })
            }
        }), J.extend({
            propFix: {
                "for": "htmlFor", "class": "className"
            }, prop: function (e, t, r) {
                var n, i, o, a = e.nodeType; if (e && 3 !== a && 8 !== a && 2 !== a) return o = 1 !== a || !J.isXMLDoc(e), o && (t = J.propFix[t] || t, i = J.propHooks[t]), void 0 !== r ? i && "set" in i && void 0 !== (n = i.set(e, r, t)) ? n : e[t] = r : i && "get" in i && null !== (n = i.get(e, t)) ? n : e[t]
            }, propHooks: {
                tabIndex: {
                    get: function (e) {
                        return e.hasAttribute("tabindex") || at.test(e.nodeName) || e.href ? e.tabIndex : -1
                    }
                }
            }
        }), $.optSelected || (J.propHooks.selected = {
            get: function (e) {
                var t = e.parentNode; return t && t.parentNode && t.parentNode.selectedIndex, null
            }
        }), J.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function () {
            J.propFix[this.toLowerCase()] = this
        }); var st = /[\t\r\n\f]/g; J.fn.extend({
            addClass: function (e) {
                var t, r, n, i, o, a, s = "string" == typeof e && e, h = 0, c = this.length; if (J.isFunction(e)) return this.each(function (t) {
                    J(this).addClass(e.call(this, t, this.className))
                }); if (s) for (t = (e || "").match(fe) || []; c > h; h++)if (r = this[h], n = 1 === r.nodeType && (r.className ? (" " + r.className + " ").replace(st, " ") : " ")) {
                    for (o = 0; i = t[o++];)n.indexOf(" " + i + " ") < 0 && (n += i + " "); a = J.trim(n), r.className !== a && (r.className = a)
                } return this
            }, removeClass: function (e) {
                var t, r, n, i, o, a, s = 0 === arguments.length || "string" == typeof e && e, h = 0, c = this.length; if (J.isFunction(e)) return this.each(function (t) {
                    J(this).removeClass(e.call(this, t, this.className))
                }); if (s) for (t = (e || "").match(fe) || []; c > h; h++)if (r = this[h], n = 1 === r.nodeType && (r.className ? (" " + r.className + " ").replace(st, " ") : "")) {
                    for (o = 0; i = t[o++];)for (; n.indexOf(" " + i + " ") >= 0;)n = n.replace(" " + i + " ", " "); a = e ? J.trim(n) : "", r.className !== a && (r.className = a)
                } return this
            }, toggleClass: function (e, t) {
                var r = typeof e; return "boolean" == typeof t && "string" === r ? t ? this.addClass(e) : this.removeClass(e) : J.isFunction(e) ? this.each(function (r) {
                    J(this).toggleClass(e.call(this, r, this.className, t), t)
                }) : this.each(function () {
                    if ("string" === r) for (var t, n = 0, i = J(this), o = e.match(fe) || []; t = o[n++];)i.hasClass(t) ? i.removeClass(t) : i.addClass(t); else (r === we || "boolean" === r) && (this.className && ge.set(this, "__className__", this.className), this.className = this.className || e === !1 ? "" : ge.get(this, "__className__") || "")
                })
            }, hasClass: function (e) {
                for (var t = " " + e + " ", r = 0, n = this.length; n > r; r++)if (1 === this[r].nodeType && (" " + this[r].className + " ").replace(st, " ").indexOf(t) >= 0) return !0; return !1
            }
        }); var ht = /\r/g; J.fn.extend({
            val: function (e) {
                var t, r, n, i = this[0]; {
                    if (arguments.length) return n = J.isFunction(e), this.each(function (r) {
                        var i; 1 === this.nodeType && (i = n ? e.call(this, r, J(this).val()) : e, null == i ? i = "" : "number" == typeof i ? i += "" : J.isArray(i) && (i = J.map(i, function (e) {
                            return null == e ? "" : e + ""
                        })), t = J.valHooks[this.type] || J.valHooks[this.nodeName.toLowerCase()], t && "set" in t && void 0 !== t.set(this, i, "value") || (this.value = i))
                    }); if (i) return t = J.valHooks[i.type] || J.valHooks[i.nodeName.toLowerCase()], t && "get" in t && void 0 !== (r = t.get(i, "value")) ? r : (r = i.value, "string" == typeof r ? r.replace(ht, "") : null == r ? "" : r)
                }
            }
        }), J.extend({
            valHooks: {
                option: {
                    get: function (e) {
                        var t = J.find.attr(e, "value"); return null != t ? t : J.trim(J.text(e))
                    }
                }, select: {
                    get: function (e) {
                        for (var t, r, n = e.options, i = e.selectedIndex, o = "select-one" === e.type || 0 > i, a = o ? null : [], s = o ? i + 1 : n.length, h = 0 > i ? s : o ? i : 0; s > h; h++)if (r = n[h], (r.selected || h === i) && ($.optDisabled ? !r.disabled : null === r.getAttribute("disabled")) && (!r.parentNode.disabled || !J.nodeName(r.parentNode, "optgroup"))) {
                            if (t = J(r).val(), o) return t; a.push(t)
                        } return a
                    }, set: function (e, t) {
                        for (var r, n, i = e.options, o = J.makeArray(t), a = i.length; a--;)n = i[a], (n.selected = J.inArray(n.value, o) >= 0) && (r = !0); return r || (e.selectedIndex = -1), o
                    }
                }
            }
        }), J.each(["radio", "checkbox"], function () {
            J.valHooks[this] = {
                set: function (e, t) {
                    return J.isArray(t) ? e.checked = J.inArray(J(e).val(), t) >= 0 : void 0
                }
            }, $.checkOn || (J.valHooks[this].get = function (e) {
                return null === e.getAttribute("value") ? "on" : e.value
            })
        }), J.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function (e, t) {
            J.fn[t] = function (e, r) {
                return arguments.length > 0 ? this.on(t, null, e, r) : this.trigger(t)
            }
        }), J.fn.extend({
            hover: function (e, t) {
                return this.mouseenter(e).mouseleave(t || e)
            }, bind: function (e, t, r) {
                return this.on(e, null, t, r)
            }, unbind: function (e, t) {
                return this.off(e, null, t)
            }, delegate: function (e, t, r, n) {
                return this.on(t, e, r, n)
            }, undelegate: function (e, t, r) {
                return 1 === arguments.length ? this.off(e, "**") : this.off(t, e || "**", r)
            }
        }); var ct = J.now(), ut = /\?/; J.parseJSON = function (e) {
            return JSON.parse(e + "")
        }, J.parseXML = function (e) {
            var t, r; if (!e || "string" != typeof e) return null; try {
                r = new DOMParser, t = r.parseFromString(e, "text/xml")
            } catch (n) {
                t = void 0
            } return (!t || t.getElementsByTagName("parsererror").length) && J.error("Invalid XML: " + e), t
        }; var lt = /#.*$/, pt = /([?&])_=[^&]*/, ft = /^(.*?):[ \t]*([^\r\n]*)$/gm, dt = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, Et = /^(?:GET|HEAD)$/, mt = /^\/\//, gt = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/, vt = {}, Tt = {}, yt = "*/".concat("*"), Rt = e.location.href, xt = gt.exec(Rt.toLowerCase()) || []; J.extend({
            active: 0, lastModified: {}, etag: {}, ajaxSettings: {
                url: Rt, type: "GET", isLocal: dt.test(xt[1]), global: !0, processData: !0, async: !0, contentType: "application/x-www-form-urlencoded; charset=UTF-8", accepts: {
                    "*": yt, text: "text/plain", html: "text/html", xml: "application/xml, text/xml", json: "application/json, text/javascript"
                }, contents: {
                    xml: /xml/, html: /html/, json: /json/
                }, responseFields: {
                    xml: "responseXML", text: "responseText", json: "responseJSON"
                }, converters: {
                    "* text": String, "text html": !0, "text json": J.parseJSON, "text xml": J.parseXML
                }, flatOptions: {
                    url: !0, context: !0
                }
            }, ajaxSetup: function (e, t) {
                return t ? N(N(e, J.ajaxSettings), t) : N(J.ajaxSettings, e)
            }, ajaxPrefilter: O(vt), ajaxTransport: O(Tt), ajax: function (e, t) {
                function r(e, t, r, a) {
                    var h, u, g, v, y, x = t; 2 !== T && (T = 2, s && clearTimeout(s), n = void 0, o = a || "", R.readyState = e > 0 ? 4 : 0, h = e >= 200 && 300 > e || 304 === e, r && (v = V(l, R, r)), v = U(l, v, R, h), h ? (l.ifModified && (y = R.getResponseHeader("Last-Modified"), y && (J.lastModified[i] = y), y = R.getResponseHeader("etag"), y && (J.etag[i] = y)), 204 === e || "HEAD" === l.type ? x = "nocontent" : 304 === e ? x = "notmodified" : (x = v.state, u = v.data, g = v.error, h = !g)) : (g = x, (e || !x) && (x = "error", 0 > e && (e = 0))), R.status = e, R.statusText = (t || x) + "", h ? d.resolveWith(p, [u, x, R]) : d.rejectWith(p, [R, x, g]), R.statusCode(m), m = void 0, c && f.trigger(h ? "ajaxSuccess" : "ajaxError", [R, l, h ? u : g]), E.fireWith(p, [R, x]), c && (f.trigger("ajaxComplete", [R, l]), --J.active || J.event.trigger("ajaxStop")))
                } "object" == typeof e && (t = e, e = void 0), t = t || {}; var n, i, o, a, s, h, c, u, l = J.ajaxSetup({}, t), p = l.context || l, f = l.context && (p.nodeType || p.jquery) ? J(p) : J.event, d = J.Deferred(), E = J.Callbacks("once memory"), m = l.statusCode || {}, g = {}, v = {}, T = 0, y = "canceled", R = {
                    readyState: 0, getResponseHeader: function (e) {
                        var t; if (2 === T) {
                            if (!a) for (a = {}; t = ft.exec(o);)a[t[1].toLowerCase()] = t[2]; t = a[e.toLowerCase()]
                        } return null == t ? null : t
                    }, getAllResponseHeaders: function () {
                        return 2 === T ? o : null
                    }, setRequestHeader: function (e, t) {
                        var r = e.toLowerCase(); return T || (e = v[r] = v[r] || e, g[e] = t), this
                    }, overrideMimeType: function (e) {
                        return T || (l.mimeType = e), this
                    }, statusCode: function (e) {
                        var t; if (e) if (2 > T) for (t in e) m[t] = [m[t], e[t]]; else R.always(e[R.status]); return this
                    }, abort: function (e) {
                        var t = e || y; return n && n.abort(t), r(0, t), this
                    }
                }; if (d.promise(R).complete = E.add, R.success = R.done, R.error = R.fail, l.url = ((e || l.url || Rt) + "").replace(lt, "").replace(mt, xt[1] + "//"), l.type = t.method || t.type || l.method || l.type, l.dataTypes = J.trim(l.dataType || "*").toLowerCase().match(fe) || [""], null == l.crossDomain && (h = gt.exec(l.url.toLowerCase()), l.crossDomain = !(!h || h[1] === xt[1] && h[2] === xt[2] && (h[3] || ("http:" === h[1] ? "80" : "443")) === (xt[3] || ("http:" === xt[1] ? "80" : "443")))), l.data && l.processData && "string" != typeof l.data && (l.data = J.param(l.data, l.traditional)), F(vt, l, t, R), 2 === T) return R; c = J.event && l.global, c && 0 === J.active++ && J.event.trigger("ajaxStart"), l.type = l.type.toUpperCase(), l.hasContent = !Et.test(l.type), i = l.url, l.hasContent || (l.data && (i = l.url += (ut.test(i) ? "&" : "?") + l.data, delete l.data), l.cache === !1 && (l.url = pt.test(i) ? i.replace(pt, "$1_=" + ct++) : i + (ut.test(i) ? "&" : "?") + "_=" + ct++)), l.ifModified && (J.lastModified[i] && R.setRequestHeader("If-Modified-Since", J.lastModified[i]), J.etag[i] && R.setRequestHeader("If-None-Match", J.etag[i])), (l.data && l.hasContent && l.contentType !== !1 || t.contentType) && R.setRequestHeader("Content-Type", l.contentType), R.setRequestHeader("Accept", l.dataTypes[0] && l.accepts[l.dataTypes[0]] ? l.accepts[l.dataTypes[0]] + ("*" !== l.dataTypes[0] ? ", " + yt + "; q=0.01" : "") : l.accepts["*"]); for (u in l.headers) R.setRequestHeader(u, l.headers[u]); if (l.beforeSend && (l.beforeSend.call(p, R, l) === !1 || 2 === T)) return R.abort(); y = "abort"; for (u in {
                    success: 1, error: 1, complete: 1
                }) R[u](l[u]); if (n = F(Tt, l, t, R)) {
                    R.readyState = 1, c && f.trigger("ajaxSend", [R, l]), l.async && l.timeout > 0 && (s = setTimeout(function () {
                        R.abort("timeout")
                    }, l.timeout)); try {
                        T = 1, n.send(g, r)
                    } catch (x) {
                        if (!(2 > T)) throw x; r(-1, x)
                    }
                } else r(-1, "No Transport"); return R
            }, getJSON: function (e, t, r) {
                return J.get(e, t, r, "json")
            }, getScript: function (e, t) {
                return J.get(e, void 0, t, "script")
            }
        }), J.each(["get", "post"], function (e, t) {
            J[t] = function (e, r, n, i) {
                return J.isFunction(r) && (i = i || n, n = r, r = void 0), J.ajax({
                    url: e, type: t, dataType: i, data: r, success: n
                })
            }
        }), J._evalUrl = function (e) {
            return J.ajax({
                url: e, type: "GET", dataType: "script", async: !1, global: !1, "throws": !0
            })
        }, J.fn.extend({
            wrapAll: function (e) {
                var t; return J.isFunction(e) ? this.each(function (t) {
                    J(this).wrapAll(e.call(this, t))
                }) : (this[0] && (t = J(e, this[0].ownerDocument).eq(0).clone(!0), this[0].parentNode && t.insertBefore(this[0]), t.map(function () {
                    for (var e = this; e.firstElementChild;)e = e.firstElementChild; return e
                }).append(this)), this)
            }, wrapInner: function (e) {
                return J.isFunction(e) ? this.each(function (t) {
                    J(this).wrapInner(e.call(this, t))
                }) : this.each(function () {
                    var t = J(this), r = t.contents(); r.length ? r.wrapAll(e) : t.append(e)
                })
            }, wrap: function (e) {
                var t = J.isFunction(e); return this.each(function (r) {
                    J(this).wrapAll(t ? e.call(this, r) : e)
                })
            }, unwrap: function () {
                return this.parent().each(function () {
                    J.nodeName(this, "body") || J(this).replaceWith(this.childNodes)
                }).end()
            }
        }), J.expr.filters.hidden = function (e) {
            return e.offsetWidth <= 0 && e.offsetHeight <= 0
        }, J.expr.filters.visible = function (e) {
            return !J.expr.filters.hidden(e)
        }; var Ht = /%20/g, bt = /\[\]$/, wt = /\r?\n/g, Mt = /^(?:submit|button|image|reset|file)$/i, St = /^(?:input|select|textarea|keygen)/i; J.param = function (e, t) {
            var r, n = [], i = function (e, t) {
                t = J.isFunction(t) ? t() : null == t ? "" : t, n[n.length] = encodeURIComponent(e) + "=" + encodeURIComponent(t)
            }; if (void 0 === t && (t = J.ajaxSettings && J.ajaxSettings.traditional), J.isArray(e) || e.jquery && !J.isPlainObject(e)) J.each(e, function () {
                i(this.name, this.value)
            }); else for (r in e) B(r, e[r], t, i); return n.join("&").replace(Ht, "+")
        }, J.fn.extend({
            serialize: function () {
                return J.param(this.serializeArray())
            }, serializeArray: function () {
                return this.map(function () {
                    var e = J.prop(this, "elements"); return e ? J.makeArray(e) : this
                }).filter(function () {
                    var e = this.type; return this.name && !J(this).is(":disabled") && St.test(this.nodeName) && !Mt.test(e) && (this.checked || !be.test(e))
                }).map(function (e, t) {
                    var r = J(this).val(); return null == r ? null : J.isArray(r) ? J.map(r, function (e) {
                        return {
                            name: t.name, value: e.replace(wt, "\r\n")
                        }
                    }) : {
                        name: t.name, value: r.replace(wt, "\r\n")
                    }
                }).get()
            }
        }), J.ajaxSettings.xhr = function () {
            try {
                return new XMLHttpRequest
            } catch (e) {
            }
        }; var _t = 0, Ct = {}, At = {
            0: 200, 1223: 204
        }, Lt = J.ajaxSettings.xhr(); e.attachEvent && e.attachEvent("onunload", function () {
            for (var e in Ct) Ct[e]()
        }), $.cors = !!Lt && "withCredentials" in Lt, $.ajax = Lt = !!Lt, J.ajaxTransport(function (e) {
            var t; return $.cors || Lt && !e.crossDomain ? {
                send: function (r, n) {
                    var i, o = e.xhr(), a = ++_t; if (o.open(e.type, e.url, e.async, e.username, e.password), e.xhrFields) for (i in e.xhrFields) o[i] = e.xhrFields[i]; e.mimeType && o.overrideMimeType && o.overrideMimeType(e.mimeType), e.crossDomain || r["X-Requested-With"] || (r["X-Requested-With"] = "XMLHttpRequest"); for (i in r) o.setRequestHeader(i, r[i]); t = function (e) {
                        return function () {
                            t && (delete Ct[a], t = o.onload = o.onerror = null, "abort" === e ? o.abort() : "error" === e ? n(o.status, o.statusText) : n(At[o.status] || o.status, o.statusText, "string" == typeof o.responseText ? {
                                text: o.responseText
                            } : void 0, o.getAllResponseHeaders()))
                        }
                    }, o.onload = t(), o.onerror = t("error"), t = Ct[a] = t("abort"); try {
                        o.send(e.hasContent && e.data || null)
                    } catch (s) {
                        if (t) throw s
                    }
                }, abort: function () {
                    t && t()
                }
            } : void 0
        }), J.ajaxSetup({
            accepts: {
                script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
            }, contents: {
                script: /(?:java|ecma)script/
            }, converters: {
                "text script": function (e) {
                    return J.globalEval(e), e
                }
            }
        }), J.ajaxPrefilter("script", function (e) {
            void 0 === e.cache && (e.cache = !1), e.crossDomain && (e.type = "GET")
        }), J.ajaxTransport("script", function (e) {
            if (e.crossDomain) {
                var t, r; return {
                    send: function (n, i) {
                        t = J("<script>").prop({
                            async: !0, charset: e.scriptCharset, src: e.url
                        }).on("load error", r = function (e) {
                            t.remove(), r = null, e && i("error" === e.type ? 404 : 200, e.type)
                        }), Z.head.appendChild(t[0])
                    }, abort: function () {
                        r && r()
                    }
                }
            }
        }); var kt = [], Pt = /(=)\?(?=&|$)|\?\?/; J.ajaxSetup({
            jsonp: "callback", jsonpCallback: function () {
                var e = kt.pop() || J.expando + "_" + ct++; return this[e] = !0, e
            }
        }), J.ajaxPrefilter("json jsonp", function (t, r, n) {
            var i, o, a, s = t.jsonp !== !1 && (Pt.test(t.url) ? "url" : "string" == typeof t.data && !(t.contentType || "").indexOf("application/x-www-form-urlencoded") && Pt.test(t.data) && "data"); return s || "jsonp" === t.dataTypes[0] ? (i = t.jsonpCallback = J.isFunction(t.jsonpCallback) ? t.jsonpCallback() : t.jsonpCallback, s ? t[s] = t[s].replace(Pt, "$1" + i) : t.jsonp !== !1 && (t.url += (ut.test(t.url) ? "&" : "?") + t.jsonp + "=" + i), t.converters["script json"] = function () {
                return a || J.error(i + " was not called"), a[0]
            }, t.dataTypes[0] = "json", o = e[i], e[i] = function () {
                a = arguments
            }, n.always(function () {
                e[i] = o, t[i] && (t.jsonpCallback = r.jsonpCallback, kt.push(i)), a && J.isFunction(o) && o(a[0]), a = o = void 0
            }), "script") : void 0
        }), J.parseHTML = function (e, t, r) {
            if (!e || "string" != typeof e) return null; "boolean" == typeof t && (r = t, t = !1), t = t || Z; var n = ae.exec(e), i = !r && []; return n ? [t.createElement(n[1])] : (n = J.buildFragment([e], t, i), i && i.length && J(i).remove(), J.merge([], n.childNodes))
        }; var Dt = J.fn.load; J.fn.load = function (e, t, r) {
            if ("string" != typeof e && Dt) return Dt.apply(this, arguments); var n, i, o, a = this, s = e.indexOf(" "); return s >= 0 && (n = J.trim(e.slice(s)), e = e.slice(0, s)), J.isFunction(t) ? (r = t, t = void 0) : t && "object" == typeof t && (i = "POST"), a.length > 0 && J.ajax({
                url: e, type: i, dataType: "html", data: t
            }).done(function (e) {
                o = arguments, a.html(n ? J("<div>").append(J.parseHTML(e)).find(n) : e)
            }).complete(r && function (e, t) {
                a.each(r, o || [e.responseText, t, e])
            }), this
        }, J.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function (e, t) {
            J.fn[t] = function (e) {
                return this.on(t, e)
            }
        }), J.expr.filters.animated = function (e) {
            return J.grep(J.timers, function (t) {
                return e === t.elem
            }).length
        }; var Ot = e.document.documentElement; J.offset = {
            setOffset: function (e, t, r) {
                var n, i, o, a, s, h, c, u = J.css(e, "position"), l = J(e), p = {}; "static" === u && (e.style.position = "relative"), s = l.offset(), o = J.css(e, "top"), h = J.css(e, "left"), c = ("absolute" === u || "fixed" === u) && (o + h).indexOf("auto") > -1, c ? (n = l.position(), a = n.top, i = n.left) : (a = parseFloat(o) || 0, i = parseFloat(h) || 0), J.isFunction(t) && (t = t.call(e, r, s)), null != t.top && (p.top = t.top - s.top + a), null != t.left && (p.left = t.left - s.left + i), "using" in t ? t.using.call(e, p) : l.css(p)
            }
        }, J.fn.extend({
            offset: function (e) {
                if (arguments.length) return void 0 === e ? this : this.each(function (t) {
                    J.offset.setOffset(this, e, t)
                }); var t, r, n = this[0], i = {
                    top: 0, left: 0
                }, o = n && n.ownerDocument; if (o) return t = o.documentElement, J.contains(t, n) ? (typeof n.getBoundingClientRect !== we && (i = n.getBoundingClientRect()), r = I(o), {
                    top: i.top + r.pageYOffset - t.clientTop, left: i.left + r.pageXOffset - t.clientLeft
                }) : i
            }, position: function () {
                if (this[0]) {
                    var e, t, r = this[0], n = {
                        top: 0, left: 0
                    }; return "fixed" === J.css(r, "position") ? t = r.getBoundingClientRect() : (e = this.offsetParent(), t = this.offset(), J.nodeName(e[0], "html") || (n = e.offset()), n.top += J.css(e[0], "borderTopWidth", !0), n.left += J.css(e[0], "borderLeftWidth", !0)), {
                        top: t.top - n.top - J.css(r, "marginTop", !0), left: t.left - n.left - J.css(r, "marginLeft", !0)
                    }
                }
            }, offsetParent: function () {
                return this.map(function () {
                    for (var e = this.offsetParent || Ot; e && !J.nodeName(e, "html") && "static" === J.css(e, "position");)e = e.offsetParent; return e || Ot
                })
            }
        }), J.each({
            scrollLeft: "pageXOffset", scrollTop: "pageYOffset"
        }, function (t, r) {
            var n = "pageYOffset" === r; J.fn[t] = function (i) {
                return me(this, function (t, i, o) {
                    var a = I(t); return void 0 === o ? a ? a[r] : t[i] : void (a ? a.scrollTo(n ? e.pageXOffset : o, n ? o : e.pageYOffset) : t[i] = o)
                }, t, i, arguments.length, null)
            }
        }), J.each(["top", "left"], function (e, t) {
            J.cssHooks[t] = x($.pixelPosition, function (e, r) {
                return r ? (r = R(e, t), Ge.test(r) ? J(e).position()[t] + "px" : r) : void 0
            })
        }), J.each({
            Height: "height", Width: "width"
        }, function (e, t) {
            J.each({
                padding: "inner" + e, content: t, "": "outer" + e
            }, function (r, n) {
                J.fn[n] = function (n, i) {
                    var o = arguments.length && (r || "boolean" != typeof n), a = r || (n === !0 || i === !0 ? "margin" : "border"); return me(this, function (t, r, n) {
                        var i; return J.isWindow(t) ? t.document.documentElement["client" + e] : 9 === t.nodeType ? (i = t.documentElement, Math.max(t.body["scroll" + e], i["scroll" + e], t.body["offset" + e], i["offset" + e], i["client" + e])) : void 0 === n ? J.css(t, r, a) : J.style(t, r, n, a)
                    }, t, o ? n : void 0, o, null)
                }
            })
        }), J.fn.size = function () {
            return this.length
        }, J.fn.andSelf = J.fn.addBack, "function" == typeof define && define.amd && define("jquery", [], function () {
            return J
        }); var Ft = e.jQuery, Nt = e.$; return J.noConflict = function (t) {
            return e.$ === J && (e.$ = Nt), t && e.jQuery === J && (e.jQuery = Ft), J
        }, typeof t === we && (e.jQuery = e.$ = J), J
    });
var THREE = {
    REVISION: "73"
};
    "function" == typeof define && define.amd ? define("three", THREE) : "undefined" != typeof exports && "undefined" != typeof module && (module.exports = THREE), (void 0 === self.requestAnimationFrame || void 0 === self.cancelAnimationFrame) && !function () {
        for (var e = 0, t = ["ms", "moz", "webkit", "o"], r = 0; r < t.length && !self.requestAnimationFrame; ++r)self.requestAnimationFrame = self[t[r] + "RequestAnimationFrame"], self.cancelAnimationFrame = self[t[r] + "CancelAnimationFrame"] || self[t[r] + "CancelRequestAnimationFrame"]; void 0 === self.requestAnimationFrame && void 0 !== self.setTimeout && (self.requestAnimationFrame = function (t) {
            var r = Date.now(), n = Math.max(0, 16 - (r - e)), i = self.setTimeout(function () {
                t(r + n)
            }, n); return e = r + n, i
        }), void 0 === self.cancelAnimationFrame && void 0 !== self.clearTimeout && (self.cancelAnimationFrame = function (e) {
            self.clearTimeout(e)
        })
    }(), void 0 === self.performance && (self.performance = {}), void 0 === self.performance.now && !function () {
        var e = Date.now(); self.performance.now = function () {
            return Date.now() - e
        }
    }(), void 0 === Number.EPSILON && (Number.EPSILON = Math.pow(2, -52)), void 0 === Math.sign && (Math.sign = function (e) {
        return 0 > e ? -1 : e > 0 ? 1 : +e
    }), void 0 === Function.prototype.name && void 0 !== Object.defineProperty && Object.defineProperty(Function.prototype, "name", {
        get: function () {
            return this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1]
        }
    }), THREE.MOUSE = {
        LEFT: 0, MIDDLE: 1, RIGHT: 2
    }, THREE.CullFaceNone = 0, THREE.CullFaceBack = 1, THREE.CullFaceFront = 2, THREE.CullFaceFrontBack = 3, THREE.FrontFaceDirectionCW = 0, THREE.FrontFaceDirectionCCW = 1, THREE.BasicShadowMap = 0, THREE.PCFShadowMap = 1, THREE.PCFSoftShadowMap = 2, THREE.FrontSide = 0, THREE.BackSide = 1, THREE.DoubleSide = 2, THREE.FlatShading = 1, THREE.SmoothShading = 2, THREE.NoColors = 0, THREE.FaceColors = 1, THREE.VertexColors = 2, THREE.NoBlending = 0, THREE.NormalBlending = 1, THREE.AdditiveBlending = 2, THREE.SubtractiveBlending = 3, THREE.MultiplyBlending = 4, THREE.CustomBlending = 5, THREE.AddEquation = 100, THREE.SubtractEquation = 101, THREE.ReverseSubtractEquation = 102, THREE.MinEquation = 103, THREE.MaxEquation = 104, THREE.ZeroFactor = 200, THREE.OneFactor = 201, THREE.SrcColorFactor = 202, THREE.OneMinusSrcColorFactor = 203, THREE.SrcAlphaFactor = 204, THREE.OneMinusSrcAlphaFactor = 205, THREE.DstAlphaFactor = 206, THREE.OneMinusDstAlphaFactor = 207, THREE.DstColorFactor = 208, THREE.OneMinusDstColorFactor = 209, THREE.SrcAlphaSaturateFactor = 210, THREE.NeverDepth = 0, THREE.AlwaysDepth = 1, THREE.LessDepth = 2, THREE.LessEqualDepth = 3, THREE.EqualDepth = 4, THREE.GreaterEqualDepth = 5, THREE.GreaterDepth = 6, THREE.NotEqualDepth = 7, THREE.MultiplyOperation = 0, THREE.MixOperation = 1, THREE.AddOperation = 2, THREE.UVMapping = 300, THREE.CubeReflectionMapping = 301, THREE.CubeRefractionMapping = 302, THREE.EquirectangularReflectionMapping = 303, THREE.EquirectangularRefractionMapping = 304, THREE.SphericalReflectionMapping = 305, THREE.RepeatWrapping = 1e3, THREE.ClampToEdgeWrapping = 1001, THREE.MirroredRepeatWrapping = 1002, THREE.NearestFilter = 1003, THREE.NearestMipMapNearestFilter = 1004, THREE.NearestMipMapLinearFilter = 1005, THREE.LinearFilter = 1006, THREE.LinearMipMapNearestFilter = 1007, THREE.LinearMipMapLinearFilter = 1008, THREE.UnsignedByteType = 1009, THREE.ByteType = 1010, THREE.ShortType = 1011, THREE.UnsignedShortType = 1012, THREE.IntType = 1013, THREE.UnsignedIntType = 1014, THREE.FloatType = 1015, THREE.HalfFloatType = 1025, THREE.UnsignedShort4444Type = 1016, THREE.UnsignedShort5551Type = 1017, THREE.UnsignedShort565Type = 1018, THREE.AlphaFormat = 1019, THREE.RGBFormat = 1020, THREE.RGBAFormat = 1021, THREE.LuminanceFormat = 1022, THREE.LuminanceAlphaFormat = 1023,
        THREE.RGBEFormat = THREE.RGBAFormat, THREE.RGB_S3TC_DXT1_Format = 2001, THREE.RGBA_S3TC_DXT1_Format = 2002, THREE.RGBA_S3TC_DXT3_Format = 2003, THREE.RGBA_S3TC_DXT5_Format = 2004, THREE.RGB_PVRTC_4BPPV1_Format = 2100, THREE.RGB_PVRTC_2BPPV1_Format = 2101, THREE.RGBA_PVRTC_4BPPV1_Format = 2102, THREE.RGBA_PVRTC_2BPPV1_Format = 2103, THREE.LoopOnce = 2200, THREE.LoopRepeat = 2201, THREE.LoopPingPong = 2202, THREE.Projector = function () {
            console.error("THREE.Projector has been moved to /examples/js/renderers/Projector.js."), this.projectVector = function (e, t) {
                console.warn("THREE.Projector: .projectVector() is now vector.project()."), e.project(t)
            }, this.unprojectVector = function (e, t) {
                console.warn("THREE.Projector: .unprojectVector() is now vector.unproject()."), e.unproject(t)
            }, this.pickingRay = function (e, t) {
                console.error("THREE.Projector: .pickingRay() is now raycaster.setFromCamera().")
            }
        }, THREE.CanvasRenderer = function () {
            console.error("THREE.CanvasRenderer has been moved to /examples/js/renderers/CanvasRenderer.js"), this.domElement = document.createElement("canvas"), this.clear = function () {
            }, this.render = function () {
            }, this.setClearColor = function () {
            }, this.setSize = function () {
            }
        }, THREE.Color = function (e) {
            return 3 === arguments.length ? this.fromArray(arguments) : this.set(e)
        }, THREE.Color.prototype = {
            constructor: THREE.Color, r: 1, g: 1, b: 1, set: function (e) {
                return e instanceof THREE.Color ? this.copy(e) : "number" == typeof e ? this.setHex(e) : "string" == typeof e && this.setStyle(e), this
            }, setHex: function (e) {
                return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (255 & e) / 255, this
            }, setRGB: function (e, t, r) {
                return this.r = e, this.g = t, this.b = r, this
            }, setHSL: function () {
                function e(e, t, r) {
                    return 0 > r && (r += 1), r > 1 && (r -= 1), 1 / 6 > r ? e + 6 * (t - e) * r : .5 > r ? t : 2 / 3 > r ? e + 6 * (t - e) * (2 / 3 - r) : e
                } return function (t, r, n) {
                    if (t = THREE.Math.euclideanModulo(t, 1), r = THREE.Math.clamp(r, 0, 1), n = THREE.Math.clamp(n, 0, 1), 0 === r) this.r = this.g = this.b = n; else {
                        var i = .5 >= n ? n * (1 + r) : n + r - n * r, o = 2 * n - i; this.r = e(o, i, t + 1 / 3), this.g = e(o, i, t), this.b = e(o, i, t - 1 / 3)
                    } return this
                }
            }(), setStyle: function (e) {
                function t(t) {
                    void 0 !== t && parseFloat(t) < 1 && console.warn("THREE.Color: Alpha component of " + e + " will be ignored.")
                } var r; if (r = /^((?:rgb|hsl)a?)\(\s*([^\)]*)\)/.exec(e)) {
                    var n, i = r[1], o = r[2]; switch (i) {
                        case "rgb": case "rgba": if (n = /^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(o)) return this.r = Math.min(255, parseInt(n[1], 10)) / 255, this.g = Math.min(255, parseInt(n[2], 10)) / 255, this.b = Math.min(255, parseInt(n[3], 10)) / 255, t(n[5]), this; if (n = /^(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(o)) return this.r = Math.min(100, parseInt(n[1], 10)) / 100, this.g = Math.min(100, parseInt(n[2], 10)) / 100, this.b = Math.min(100, parseInt(n[3], 10)) / 100, t(n[5]), this; break; case "hsl": case "hsla": if (n = /^([0-9]*\.?[0-9]+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(o)) {
                            var a = parseFloat(n[1]) / 360, s = parseInt(n[2], 10) / 100, h = parseInt(n[3], 10) / 100; return t(n[5]), this.setHSL(a, s, h)
                        }
                    }
                } else if (r = /^\#([A-Fa-f0-9]+)$/.exec(e)) {
                    var c = r[1], u = c.length; if (3 === u) return this.r = parseInt(c.charAt(0) + c.charAt(0), 16) / 255, this.g = parseInt(c.charAt(1) + c.charAt(1), 16) / 255, this.b = parseInt(c.charAt(2) + c.charAt(2), 16) / 255, this; if (6 === u) return this.r = parseInt(c.charAt(0) + c.charAt(1), 16) / 255, this.g = parseInt(c.charAt(2) + c.charAt(3), 16) / 255, this.b = parseInt(c.charAt(4) + c.charAt(5), 16) / 255, this
                } if (e && e.length > 0) {
                    var c = THREE.ColorKeywords[e]; void 0 !== c ? this.setHex(c) : console.warn("THREE.Color: Unknown color " + e)
                } return this
            }, clone: function () {
                return new this.constructor(this.r, this.g, this.b)
            }, copy: function (e) {
                return this.r = e.r, this.g = e.g, this.b = e.b, this
            }, copyGammaToLinear: function (e, t) {
                return void 0 === t && (t = 2), this.r = Math.pow(e.r, t), this.g = Math.pow(e.g, t), this.b = Math.pow(e.b, t), this
            }, copyLinearToGamma: function (e, t) {
                void 0 === t && (t = 2); var r = t > 0 ? 1 / t : 1; return this.r = Math.pow(e.r, r), this.g = Math.pow(e.g, r), this.b = Math.pow(e.b, r), this
            }, convertGammaToLinear: function () {
                var e = this.r, t = this.g, r = this.b; return this.r = e * e, this.g = t * t, this.b = r * r, this
            }, convertLinearToGamma: function () {
                return this.r = Math.sqrt(this.r), this.g = Math.sqrt(this.g), this.b = Math.sqrt(this.b), this
            }, getHex: function () {
                return 255 * this.r << 16 ^ 255 * this.g << 8 ^ 255 * this.b << 0
            }, getHexString: function () {
                return ("000000" + this.getHex().toString(16)).slice(-6)
            }, getHSL: function (e) {
                var t, r, n = e || {
                    h: 0, s: 0, l: 0
                }, i = this.r, o = this.g, a = this.b, s = Math.max(i, o, a), h = Math.min(i, o, a), c = (h + s) / 2; if (h === s) t = 0, r = 0; else {
                    var u = s - h; switch (r = .5 >= c ? u / (s + h) : u / (2 - s - h), s) {
                        case i: t = (o - a) / u + (a > o ? 6 : 0); break; case o: t = (a - i) / u + 2; break; case a: t = (i - o) / u + 4
                    }t /= 6
                } return n.h = t, n.s = r, n.l = c, n
            }, getStyle: function () {
                return "rgb(" + (255 * this.r | 0) + "," + (255 * this.g | 0) + "," + (255 * this.b | 0) + ")"
            }, offsetHSL: function (e, t, r) {
                var n = this.getHSL(); return n.h += e, n.s += t, n.l += r, this.setHSL(n.h, n.s, n.l), this
            }, add: function (e) {
                return this.r += e.r, this.g += e.g, this.b += e.b, this
            }, addColors: function (e, t) {
                return this.r = e.r + t.r, this.g = e.g + t.g, this.b = e.b + t.b, this
            }, addScalar: function (e) {
                return this.r += e, this.g += e, this.b += e, this
            }, multiply: function (e) {
                return this.r *= e.r, this.g *= e.g, this.b *= e.b, this
            }, multiplyScalar: function (e) {
                return this.r *= e, this.g *= e, this.b *= e, this
            }, lerp: function (e, t) {
                return this.r += (e.r - this.r) * t, this.g += (e.g - this.g) * t, this.b += (e.b - this.b) * t, this
            }, equals: function (e) {
                return e.r === this.r && e.g === this.g && e.b === this.b
            }, fromArray: function (e, t) {
                return void 0 === t && (t = 0), this.r = e[t], this.g = e[t + 1], this.b = e[t + 2], this
            }, toArray: function (e, t) {
                return void 0 === e && (e = []), void 0 === t && (t = 0), e[t] = this.r, e[t + 1] = this.g, e[t + 2] = this.b, e
            }
        }, THREE.ColorKeywords = {
            aliceblue: 15792383, antiquewhite: 16444375, aqua: 65535, aquamarine: 8388564, azure: 15794175, beige: 16119260, bisque: 16770244, black: 0, blanchedalmond: 16772045, blue: 255, blueviolet: 9055202, brown: 10824234, burlywood: 14596231, cadetblue: 6266528, chartreuse: 8388352, chocolate: 13789470, coral: 16744272, cornflowerblue: 6591981, cornsilk: 16775388, crimson: 14423100, cyan: 65535, darkblue: 139, darkcyan: 35723, darkgoldenrod: 12092939, darkgray: 11119017, darkgreen: 25600, darkgrey: 11119017, darkkhaki: 12433259, darkmagenta: 9109643, darkolivegreen: 5597999, darkorange: 16747520, darkorchid: 10040012, darkred: 9109504, darksalmon: 15308410, darkseagreen: 9419919, darkslateblue: 4734347, darkslategray: 3100495, darkslategrey: 3100495, darkturquoise: 52945, darkviolet: 9699539, deeppink: 16716947, deepskyblue: 49151, dimgray: 6908265, dimgrey: 6908265, dodgerblue: 2003199, firebrick: 11674146, floralwhite: 16775920, forestgreen: 2263842, fuchsia: 16711935, gainsboro: 14474460, ghostwhite: 16316671, gold: 16766720, goldenrod: 14329120, gray: 8421504, green: 32768, greenyellow: 11403055, grey: 8421504, honeydew: 15794160, hotpink: 16738740, indianred: 13458524, indigo: 4915330, ivory: 16777200, khaki: 15787660, lavender: 15132410, lavenderblush: 16773365, lawngreen: 8190976, lemonchiffon: 16775885, lightblue: 11393254, lightcoral: 15761536, lightcyan: 14745599, lightgoldenrodyellow: 16448210, lightgray: 13882323, lightgreen: 9498256, lightgrey: 13882323, lightpink: 16758465, lightsalmon: 16752762, lightseagreen: 2142890, lightskyblue: 8900346, lightslategray: 7833753, lightslategrey: 7833753, lightsteelblue: 11584734, lightyellow: 16777184, lime: 65280, limegreen: 3329330, linen: 16445670, magenta: 16711935, maroon: 8388608, mediumaquamarine: 6737322, mediumblue: 205, mediumorchid: 12211667, mediumpurple: 9662683, mediumseagreen: 3978097, mediumslateblue: 8087790, mediumspringgreen: 64154, mediumturquoise: 4772300, mediumvioletred: 13047173, midnightblue: 1644912, mintcream: 16121850, mistyrose: 16770273, moccasin: 16770229, navajowhite: 16768685, navy: 128, oldlace: 16643558, olive: 8421376, olivedrab: 7048739, orange: 16753920, orangered: 16729344, orchid: 14315734, palegoldenrod: 15657130, palegreen: 10025880, paleturquoise: 11529966, palevioletred: 14381203, papayawhip: 16773077, peachpuff: 16767673, peru: 13468991, pink: 16761035, plum: 14524637, powderblue: 11591910, purple: 8388736, red: 16711680, rosybrown: 12357519, royalblue: 4286945, saddlebrown: 9127187, salmon: 16416882, sandybrown: 16032864, seagreen: 3050327, seashell: 16774638, sienna: 10506797, silver: 12632256, skyblue: 8900331, slateblue: 6970061, slategray: 7372944, slategrey: 7372944, snow: 16775930, springgreen: 65407, steelblue: 4620980, tan: 13808780, teal: 32896, thistle: 14204888, tomato: 16737095, turquoise: 4251856, violet: 15631086, wheat: 16113331, white: 16777215, whitesmoke: 16119285, yellow: 16776960, yellowgreen: 10145074
        }, THREE.Quaternion = function (e, t, r, n) {
            this._x = e || 0, this._y = t || 0, this._z = r || 0, this._w = void 0 !== n ? n : 1
        }, THREE.Quaternion.prototype = {
            constructor: THREE.Quaternion, get x() {
                return this._x
            }, set x(e) {
                this._x = e, this.onChangeCallback()
            }, get y() {
                return this._y
            }, set y(e) {
                this._y = e, this.onChangeCallback()
            }, get z() {
                return this._z
            }, set z(e) {
                this._z = e, this.onChangeCallback()
            }, get w() {
                return this._w
            }, set w(e) {
                this._w = e, this.onChangeCallback()
            }, set: function (e, t, r, n) {
                return this._x = e, this._y = t, this._z = r, this._w = n, this.onChangeCallback(), this
            }, clone: function () {
                return new this.constructor(this._x, this._y, this._z, this._w)
            }, copy: function (e) {
                return this._x = e.x, this._y = e.y, this._z = e.z, this._w = e.w, this.onChangeCallback(), this
            }, setFromEuler: function (e, t) {
                if (e instanceof THREE.Euler == !1) throw new Error("THREE.Quaternion: .setFromEuler() now expects a Euler rotation rather than a Vector3 and order."); var r = Math.cos(e._x / 2), n = Math.cos(e._y / 2), i = Math.cos(e._z / 2), o = Math.sin(e._x / 2), a = Math.sin(e._y / 2), s = Math.sin(e._z / 2), h = e.order; return "XYZ" === h ? (this._x = o * n * i + r * a * s, this._y = r * a * i - o * n * s, this._z = r * n * s + o * a * i, this._w = r * n * i - o * a * s) : "YXZ" === h ? (this._x = o * n * i + r * a * s, this._y = r * a * i - o * n * s, this._z = r * n * s - o * a * i, this._w = r * n * i + o * a * s) : "ZXY" === h ? (this._x = o * n * i - r * a * s, this._y = r * a * i + o * n * s, this._z = r * n * s + o * a * i, this._w = r * n * i - o * a * s) : "ZYX" === h ? (this._x = o * n * i - r * a * s, this._y = r * a * i + o * n * s, this._z = r * n * s - o * a * i, this._w = r * n * i + o * a * s) : "YZX" === h ? (this._x = o * n * i + r * a * s, this._y = r * a * i + o * n * s, this._z = r * n * s - o * a * i, this._w = r * n * i - o * a * s) : "XZY" === h && (this._x = o * n * i - r * a * s, this._y = r * a * i - o * n * s, this._z = r * n * s + o * a * i, this._w = r * n * i + o * a * s), t !== !1 && this.onChangeCallback(), this
            }, setFromAxisAngle: function (e, t) {
                var r = t / 2, n = Math.sin(r); return this._x = e.x * n, this._y = e.y * n, this._z = e.z * n, this._w = Math.cos(r), this.onChangeCallback(), this
            }, setFromRotationMatrix: function (e) {
                var t, r = e.elements, n = r[0], i = r[4], o = r[8], a = r[1], s = r[5], h = r[9], c = r[2], u = r[6], l = r[10], p = n + s + l; return p > 0 ? (t = .5 / Math.sqrt(p + 1), this._w = .25 / t, this._x = (u - h) * t, this._y = (o - c) * t, this._z = (a - i) * t) : n > s && n > l ? (t = 2 * Math.sqrt(1 + n - s - l), this._w = (u - h) / t, this._x = .25 * t, this._y = (i + a) / t, this._z = (o + c) / t) : s > l ? (t = 2 * Math.sqrt(1 + s - n - l), this._w = (o - c) / t, this._x = (i + a) / t, this._y = .25 * t, this._z = (h + u) / t) : (t = 2 * Math.sqrt(1 + l - n - s), this._w = (a - i) / t, this._x = (o + c) / t, this._y = (h + u) / t, this._z = .25 * t), this.onChangeCallback(), this
            }, setFromUnitVectors: function () {
                var e, t, r = 1e-6; return function (n, i) {
                    return void 0 === e && (e = new THREE.Vector3), t = n.dot(i) + 1, r > t ? (t = 0, Math.abs(n.x) > Math.abs(n.z) ? e.set(-n.y, n.x, 0) : e.set(0, -n.z, n.y)) : e.crossVectors(n, i), this._x = e.x, this._y = e.y, this._z = e.z, this._w = t, this.normalize(), this
                }
            }(), inverse: function () {
                return this.conjugate().normalize(), this
            }, conjugate: function () {
                return this._x *= -1, this._y *= -1, this._z *= -1, this.onChangeCallback(), this
            }, dot: function (e) {
                return this._x * e._x + this._y * e._y + this._z * e._z + this._w * e._w
            }, lengthSq: function () {
                return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w
            }, length: function () {
                return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w)
            }, normalize: function () {
                var e = this.length(); return 0 === e ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (e = 1 / e, this._x = this._x * e, this._y = this._y * e, this._z = this._z * e, this._w = this._w * e), this.onChangeCallback(), this
            }, multiply: function (e, t) {
                return void 0 !== t ? (console.warn("THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead."), this.multiplyQuaternions(e, t)) : this.multiplyQuaternions(this, e)
            }, multiplyQuaternions: function (e, t) {
                var r = e._x, n = e._y, i = e._z, o = e._w, a = t._x, s = t._y, h = t._z, c = t._w; return this._x = r * c + o * a + n * h - i * s, this._y = n * c + o * s + i * a - r * h, this._z = i * c + o * h + r * s - n * a, this._w = o * c - r * a - n * s - i * h, this.onChangeCallback(), this
            }, multiplyVector3: function (e) {
                return console.warn("THREE.Quaternion: .multiplyVector3() has been removed. Use is now vector.applyQuaternion( quaternion ) instead."), e.applyQuaternion(this)
            }, slerp: function (e, t) {
                if (0 === t) return this; if (1 === t) return this.copy(e); var r = this._x, n = this._y, i = this._z, o = this._w, a = o * e._w + r * e._x + n * e._y + i * e._z; if (0 > a ? (this._w = -e._w, this._x = -e._x, this._y = -e._y, this._z = -e._z, a = -a) : this.copy(e), a >= 1) return this._w = o, this._x = r, this._y = n, this._z = i, this; var s = Math.acos(a), h = Math.sqrt(1 - a * a); if (Math.abs(h) < .001) return this._w = .5 * (o + this._w), this._x = .5 * (r + this._x), this._y = .5 * (n + this._y), this._z = .5 * (i + this._z), this; var c = Math.sin((1 - t) * s) / h, u = Math.sin(t * s) / h; return this._w = o * c + this._w * u, this._x = r * c + this._x * u, this._y = n * c + this._y * u, this._z = i * c + this._z * u, this.onChangeCallback(), this
            }, equals: function (e) {
                return e._x === this._x && e._y === this._y && e._z === this._z && e._w === this._w
            }, fromArray: function (e, t) {
                return void 0 === t && (t = 0), this._x = e[t], this._y = e[t + 1], this._z = e[t + 2], this._w = e[t + 3], this.onChangeCallback(), this
            }, toArray: function (e, t) {
                return void 0 === e && (e = []), void 0 === t && (t = 0), e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._w, e
            }, onChange: function (e) {
                return this.onChangeCallback = e, this
            }, onChangeCallback: function () {
            }
        }, THREE.Quaternion.slerp = function (e, t, r, n) {
            return r.copy(e).slerp(t, n)
        }, THREE.Vector2 = function (e, t) {
            this.x = e || 0, this.y = t || 0
        }, THREE.Vector2.prototype = {
            constructor: THREE.Vector2, get width() {
                return this.x
            }, set width(e) {
                this.x = e
            }, get height() {
                return this.y
            }, set height(e) {
                this.y = e
            }, set: function (e, t) {
                return this.x = e, this.y = t, this
            }, setX: function (e) {
                return this.x = e, this
            }, setY: function (e) {
                return this.y = e, this
            }, setComponent: function (e, t) {
                switch (e) {
                    case 0: this.x = t; break; case 1: this.y = t; break; default: throw new Error("index is out of range: " + e)
                }
            }, getComponent: function (e) {
                switch (e) {
                    case 0: return this.x; case 1: return this.y; default: throw new Error("index is out of range: " + e)
                }
            }, clone: function () {
                return new this.constructor(this.x, this.y)
            }, copy: function (e) {
                return this.x = e.x, this.y = e.y, this
            }, add: function (e, t) {
                return void 0 !== t ? (console.warn("THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead."), this.addVectors(e, t)) : (this.x += e.x, this.y += e.y, this)
            }, addScalar: function (e) {
                return this.x += e, this.y += e, this
            }, addVectors: function (e, t) {
                return this.x = e.x + t.x, this.y = e.y + t.y, this
            }, addScaledVector: function (e, t) {
                return this.x += e.x * t, this.y += e.y * t, this
            }, sub: function (e, t) {
                return void 0 !== t ? (console.warn("THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."), this.subVectors(e, t)) : (this.x -= e.x, this.y -= e.y, this)
            }, subScalar: function (e) {
                return this.x -= e, this.y -= e, this
            }, subVectors: function (e, t) {
                return this.x = e.x - t.x, this.y = e.y - t.y, this
            }, multiply: function (e) {
                return this.x *= e.x, this.y *= e.y, this
            }, multiplyScalar: function (e) {
                return isFinite(e) ? (this.x *= e, this.y *= e) : (this.x = 0, this.y = 0), this
            }, divide: function (e) {
                return this.x /= e.x, this.y /= e.y, this
            }, divideScalar: function (e) {
                return this.multiplyScalar(1 / e)
            }, min: function (e) {
                return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this
            }, max: function (e) {
                return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this
            }, clamp: function (e, t) {
                return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this
            }, clampScalar: function () {
                var e, t; return function (r, n) {
                    return void 0 === e && (e = new THREE.Vector2, t = new THREE.Vector2), e.set(r, r), t.set(n, n), this.clamp(e, t)
                }
            }(), clampLength: function (e, t) {
                var r = this.length(); return this.multiplyScalar(Math.max(e, Math.min(t, r)) / r), this
            }, floor: function () {
                return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this
            }, ceil: function () {
                return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this
            }, round: function () {
                return this.x = Math.round(this.x), this.y = Math.round(this.y), this
            }, roundToZero: function () {
                return this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x), this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y), this
            }, negate: function () {
                return this.x = -this.x, this.y = -this.y, this
            }, dot: function (e) {
                return this.x * e.x + this.y * e.y
            }, lengthSq: function () {
                return this.x * this.x + this.y * this.y
            }, length: function () {
                return Math.sqrt(this.x * this.x + this.y * this.y)
            }, lengthManhattan: function () {
                return Math.abs(this.x) + Math.abs(this.y)
            }, normalize: function () {
                return this.divideScalar(this.length())
            }, distanceTo: function (e) {
                return Math.sqrt(this.distanceToSquared(e))
            }, distanceToSquared: function (e) {
                var t = this.x - e.x, r = this.y - e.y; return t * t + r * r
            }, setLength: function (e) {
                return this.multiplyScalar(e / this.length())
            }, lerp: function (e, t) {
                return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this
            }, lerpVectors: function (e, t, r) {
                return this.subVectors(t, e).multiplyScalar(r).add(e), this
            }, equals: function (e) {
                return e.x === this.x && e.y === this.y
            }, fromArray: function (e, t) {
                return void 0 === t && (t = 0), this.x = e[t], this.y = e[t + 1], this
            }, toArray: function (e, t) {
                return void 0 === e && (e = []), void 0 === t && (t = 0), e[t] = this.x, e[t + 1] = this.y, e
            }, fromAttribute: function (e, t, r) {
                return void 0 === r && (r = 0), t = t * e.itemSize + r, this.x = e.array[t], this.y = e.array[t + 1], this
            }, rotateAround: function (e, t) {
                var r = Math.cos(t), n = Math.sin(t), i = this.x - e.x, o = this.y - e.y; return this.x = i * r - o * n + e.x, this.y = i * n + o * r + e.y, this
            }
        }, THREE.Vector3 = function (e, t, r) {
            this.x = e || 0, this.y = t || 0, this.z = r || 0
        }, THREE.Vector3.prototype = {
            constructor: THREE.Vector3, set: function (e, t, r) {
                return this.x = e, this.y = t, this.z = r, this
            }, setX: function (e) {
                return this.x = e, this
            }, setY: function (e) {
                return this.y = e, this
            }, setZ: function (e) {
                return this.z = e, this
            }, setComponent: function (e, t) {
                switch (e) {
                    case 0: this.x = t; break; case 1: this.y = t; break; case 2: this.z = t; break; default: throw new Error("index is out of range: " + e)
                }
            }, getComponent: function (e) {
                switch (e) {
                    case 0: return this.x; case 1: return this.y; case 2: return this.z; default: throw new Error("index is out of range: " + e)
                }
            }, clone: function () {
                return new this.constructor(this.x, this.y, this.z)
            }, copy: function (e) {
                return this.x = e.x, this.y = e.y, this.z = e.z, this
            }, add: function (e, t) {
                return void 0 !== t ? (console.warn("THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead."), this.addVectors(e, t)) : (this.x += e.x, this.y += e.y, this.z += e.z, this)
            }, addScalar: function (e) {
                return this.x += e, this.y += e, this.z += e, this
            }, addVectors: function (e, t) {
                return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this
            }, addScaledVector: function (e, t) {
                return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this
            }, sub: function (e, t) {
                return void 0 !== t ? (console.warn("THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."), this.subVectors(e, t)) : (this.x -= e.x, this.y -= e.y, this.z -= e.z, this)
            }, subScalar: function (e) {
                return this.x -= e, this.y -= e, this.z -= e, this
            }, subVectors: function (e, t) {
                return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this
            }, multiply: function (e, t) {
                return void 0 !== t ? (console.warn("THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead."), this.multiplyVectors(e, t)) : (this.x *= e.x, this.y *= e.y, this.z *= e.z, this)
            }, multiplyScalar: function (e) {
                return isFinite(e) ? (this.x *= e, this.y *= e, this.z *= e) : (this.x = 0, this.y = 0, this.z = 0), this
            }, multiplyVectors: function (e, t) {
                return this.x = e.x * t.x, this.y = e.y * t.y, this.z = e.z * t.z, this
            }, applyEuler: function () {
                var e; return function (t) {
                    return t instanceof THREE.Euler == !1 && console.error("THREE.Vector3: .applyEuler() now expects a Euler rotation rather than a Vector3 and order."), void 0 === e && (e = new THREE.Quaternion), this.applyQuaternion(e.setFromEuler(t)), this
                }
            }(), applyAxisAngle: function () {
                var e; return function (t, r) {
                    return void 0 === e && (e = new THREE.Quaternion), this.applyQuaternion(e.setFromAxisAngle(t, r)), this
                }
            }(), applyMatrix3: function (e) {
                var t = this.x, r = this.y, n = this.z, i = e.elements; return this.x = i[0] * t + i[3] * r + i[6] * n, this.y = i[1] * t + i[4] * r + i[7] * n, this.z = i[2] * t + i[5] * r + i[8] * n, this
            }, applyMatrix4: function (e) {
                var t = this.x, r = this.y, n = this.z, i = e.elements; return this.x = i[0] * t + i[4] * r + i[8] * n + i[12], this.y = i[1] * t + i[5] * r + i[9] * n + i[13], this.z = i[2] * t + i[6] * r + i[10] * n + i[14], this
            }, applyProjection: function (e) {
                var t = this.x, r = this.y, n = this.z, i = e.elements, o = 1 / (i[3] * t + i[7] * r + i[11] * n + i[15]); return this.x = (i[0] * t + i[4] * r + i[8] * n + i[12]) * o, this.y = (i[1] * t + i[5] * r + i[9] * n + i[13]) * o, this.z = (i[2] * t + i[6] * r + i[10] * n + i[14]) * o, this
            }, applyQuaternion: function (e) {
                var t = this.x, r = this.y, n = this.z, i = e.x, o = e.y, a = e.z, s = e.w, h = s * t + o * n - a * r, c = s * r + a * t - i * n, u = s * n + i * r - o * t, l = -i * t - o * r - a * n; return this.x = h * s + l * -i + c * -a - u * -o, this.y = c * s + l * -o + u * -i - h * -a, this.z = u * s + l * -a + h * -o - c * -i, this
            }, project: function () {
                var e; return function (t) {
                    return void 0 === e && (e = new THREE.Matrix4), e.multiplyMatrices(t.projectionMatrix, e.getInverse(t.matrixWorld)), this.applyProjection(e)
                }
            }(), unproject: function () {
                var e; return function (t) {
                    return void 0 === e && (e = new THREE.Matrix4), e.multiplyMatrices(t.matrixWorld, e.getInverse(t.projectionMatrix)), this.applyProjection(e)
                }
            }(), transformDirection: function (e) {
                var t = this.x, r = this.y, n = this.z, i = e.elements; return this.x = i[0] * t + i[4] * r + i[8] * n, this.y = i[1] * t + i[5] * r + i[9] * n, this.z = i[2] * t + i[6] * r + i[10] * n, this.normalize(), this
            }, divide: function (e) {
                return this.x /= e.x, this.y /= e.y, this.z /= e.z, this
            }, divideScalar: function (e) {
                return this.multiplyScalar(1 / e)
            }, min: function (e) {
                return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this
            }, max: function (e) {
                return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this
            }, clamp: function (e, t) {
                return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this.z = Math.max(e.z, Math.min(t.z, this.z)), this
            }, clampScalar: function () {
                var e, t; return function (r, n) {
                    return void 0 === e && (e = new THREE.Vector3, t = new THREE.Vector3), e.set(r, r, r), t.set(n, n, n), this.clamp(e, t)
                }
            }(), clampLength: function (e, t) {
                var r = this.length(); return this.multiplyScalar(Math.max(e, Math.min(t, r)) / r), this
            }, floor: function () {
                return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this
            }, ceil: function () {
                return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this
            }, round: function () {
                return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this
            }, roundToZero: function () {
                return this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x), this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y), this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z), this
            }, negate: function () {
                return this.x = -this.x, this.y = -this.y, this.z = -this.z, this
            }, dot: function (e) {
                return this.x * e.x + this.y * e.y + this.z * e.z
            }, lengthSq: function () {
                return this.x * this.x + this.y * this.y + this.z * this.z
            }, length: function () {
                return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
            }, lengthManhattan: function () {
                return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z)
            }, normalize: function () {
                return this.divideScalar(this.length())
            }, setLength: function (e) {
                return this.multiplyScalar(e / this.length())
            }, lerp: function (e, t) {
                return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this
            }, lerpVectors: function (e, t, r) {
                return this.subVectors(t, e).multiplyScalar(r).add(e), this
            }, cross: function (e, t) {
                if (void 0 !== t) return console.warn("THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead."), this.crossVectors(e, t); var r = this.x, n = this.y, i = this.z; return this.x = n * e.z - i * e.y, this.y = i * e.x - r * e.z, this.z = r * e.y - n * e.x, this
            }, crossVectors: function (e, t) {
                var r = e.x, n = e.y, i = e.z, o = t.x, a = t.y, s = t.z; return this.x = n * s - i * a, this.y = i * o - r * s, this.z = r * a - n * o, this
            }, projectOnVector: function () {
                var e, t; return function (r) {
                    return void 0 === e && (e = new THREE.Vector3), e.copy(r).normalize(), t = this.dot(e), this.copy(e).multiplyScalar(t)
                }
            }(), projectOnPlane: function () {
                var e; return function (t) {
                    return void 0 === e && (e = new THREE.Vector3), e.copy(this).projectOnVector(t), this.sub(e)
                }
            }(), reflect: function () {
                var e; return function (t) {
                    return void 0 === e && (e = new THREE.Vector3), this.sub(e.copy(t).multiplyScalar(2 * this.dot(t)))
                }
            }(), angleTo: function (e) {
                var t = this.dot(e) / (this.length() * e.length()); return Math.acos(THREE.Math.clamp(t, -1, 1))
            }, distanceTo: function (e) {
                return Math.sqrt(this.distanceToSquared(e))
            }, distanceToSquared: function (e) {
                var t = this.x - e.x, r = this.y - e.y, n = this.z - e.z; return t * t + r * r + n * n
            }, setEulerFromRotationMatrix: function (e, t) {
                console.error("THREE.Vector3: .setEulerFromRotationMatrix() has been removed. Use Euler.setFromRotationMatrix() instead.")
            }, setEulerFromQuaternion: function (e, t) {
                console.error("THREE.Vector3: .setEulerFromQuaternion() has been removed. Use Euler.setFromQuaternion() instead.")
            }, getPositionFromMatrix: function (e) {
                return console.warn("THREE.Vector3: .getPositionFromMatrix() has been renamed to .setFromMatrixPosition()."), this.setFromMatrixPosition(e)
            }, getScaleFromMatrix: function (e) {
                return console.warn("THREE.Vector3: .getScaleFromMatrix() has been renamed to .setFromMatrixScale()."), this.setFromMatrixScale(e)
            }, getColumnFromMatrix: function (e, t) {
                return console.warn("THREE.Vector3: .getColumnFromMatrix() has been renamed to .setFromMatrixColumn()."), this.setFromMatrixColumn(e, t)
            }, setFromMatrixPosition: function (e) {
                return this.x = e.elements[12], this.y = e.elements[13], this.z = e.elements[14], this
            }, setFromMatrixScale: function (e) {
                var t = this.set(e.elements[0], e.elements[1], e.elements[2]).length(), r = this.set(e.elements[4], e.elements[5], e.elements[6]).length(), n = this.set(e.elements[8], e.elements[9], e.elements[10]).length(); return this.x = t, this.y = r, this.z = n, this
            }, setFromMatrixColumn: function (e, t) {
                var r = 4 * e, n = t.elements; return this.x = n[r], this.y = n[r + 1], this.z = n[r + 2], this
            }, equals: function (e) {
                return e.x === this.x && e.y === this.y && e.z === this.z
            }, fromArray: function (e, t) {
                return void 0 === t && (t = 0), this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this
            }, toArray: function (e, t) {
                return void 0 === e && (e = []), void 0 === t && (t = 0), e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e
            }, fromAttribute: function (e, t, r) {
                return void 0 === r && (r = 0), t = t * e.itemSize + r, this.x = e.array[t], this.y = e.array[t + 1], this.z = e.array[t + 2], this
            }
        }, THREE.Vector4 = function (e, t, r, n) {
            this.x = e || 0, this.y = t || 0, this.z = r || 0, this.w = void 0 !== n ? n : 1
        }, THREE.Vector4.prototype = {
            constructor: THREE.Vector4, set: function (e, t, r, n) {
                return this.x = e, this.y = t, this.z = r, this.w = n, this
            }, setX: function (e) {
                return this.x = e, this
            }, setY: function (e) {
                return this.y = e, this
            }, setZ: function (e) {
                return this.z = e, this
            }, setW: function (e) {
                return this.w = e, this
            }, setComponent: function (e, t) {
                switch (e) {
                    case 0: this.x = t; break; case 1: this.y = t; break; case 2: this.z = t; break; case 3: this.w = t; break; default: throw new Error("index is out of range: " + e)
                }
            }, getComponent: function (e) {
                switch (e) {
                    case 0: return this.x; case 1: return this.y; case 2: return this.z; case 3: return this.w; default: throw new Error("index is out of range: " + e)
                }
            }, clone: function () {
                return new this.constructor(this.x, this.y, this.z, this.w)
            }, copy: function (e) {
                return this.x = e.x, this.y = e.y, this.z = e.z, this.w = void 0 !== e.w ? e.w : 1, this
            }, add: function (e, t) {
                return void 0 !== t ? (console.warn("THREE.Vector4: .add() now only accepts one argument. Use .addVectors( a, b ) instead."), this.addVectors(e, t)) : (this.x += e.x, this.y += e.y, this.z += e.z, this.w += e.w, this)
            }, addScalar: function (e) {
                return this.x += e, this.y += e, this.z += e, this.w += e, this
            }, addVectors: function (e, t) {
                return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this.w = e.w + t.w, this
            }, addScaledVector: function (e, t) {
                return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this.w += e.w * t, this
            }, sub: function (e, t) {
                return void 0 !== t ? (console.warn("THREE.Vector4: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."), this.subVectors(e, t)) : (this.x -= e.x, this.y -= e.y, this.z -= e.z, this.w -= e.w, this)
            }, subScalar: function (e) {
                return this.x -= e, this.y -= e, this.z -= e, this.w -= e, this
            }, subVectors: function (e, t) {
                return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this.w = e.w - t.w, this
            }, multiplyScalar: function (e) {
                return isFinite(e) ? (this.x *= e, this.y *= e, this.z *= e, this.w *= e) : (this.x = 0, this.y = 0, this.z = 0, this.w = 0), this
            }, applyMatrix4: function (e) {
                var t = this.x, r = this.y, n = this.z, i = this.w, o = e.elements; return this.x = o[0] * t + o[4] * r + o[8] * n + o[12] * i, this.y = o[1] * t + o[5] * r + o[9] * n + o[13] * i, this.z = o[2] * t + o[6] * r + o[10] * n + o[14] * i, this.w = o[3] * t + o[7] * r + o[11] * n + o[15] * i, this
            }, divideScalar: function (e) {
                return this.multiplyScalar(1 / e)
            }, setAxisAngleFromQuaternion: function (e) {
                this.w = 2 * Math.acos(e.w); var t = Math.sqrt(1 - e.w * e.w); return 1e-4 > t ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = e.x / t, this.y = e.y / t, this.z = e.z / t), this
            }, setAxisAngleFromRotationMatrix: function (e) {
                var t, r, n, i, o = .01, a = .1, s = e.elements, h = s[0], c = s[4], u = s[8], l = s[1], p = s[5], f = s[9], d = s[2], E = s[6], m = s[10]; if (Math.abs(c - l) < o && Math.abs(u - d) < o && Math.abs(f - E) < o) {
                    if (Math.abs(c + l) < a && Math.abs(u + d) < a && Math.abs(f + E) < a && Math.abs(h + p + m - 3) < a) return this.set(1, 0, 0, 0), this; t = Math.PI; var g = (h + 1) / 2, v = (p + 1) / 2, T = (m + 1) / 2, y = (c + l) / 4, R = (u + d) / 4, x = (f + E) / 4; return g > v && g > T ? o > g ? (r = 0, n = .707106781, i = .707106781) : (r = Math.sqrt(g), n = y / r, i = R / r) : v > T ? o > v ? (r = .707106781, n = 0, i = .707106781) : (n = Math.sqrt(v), r = y / n, i = x / n) : o > T ? (r = .707106781, n = .707106781, i = 0) : (i = Math.sqrt(T), r = R / i, n = x / i), this.set(r, n, i, t), this
                } var H = Math.sqrt((E - f) * (E - f) + (u - d) * (u - d) + (l - c) * (l - c)); return Math.abs(H) < .001 && (H = 1), this.x = (E - f) / H, this.y = (u - d) / H, this.z = (l - c) / H, this.w = Math.acos((h + p + m - 1) / 2), this
            }, min: function (e) {
                return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this.w = Math.min(this.w, e.w), this
            }, max: function (e) {
                return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this.w = Math.max(this.w, e.w), this
            }, clamp: function (e, t) {
                return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this.z = Math.max(e.z, Math.min(t.z, this.z)), this.w = Math.max(e.w, Math.min(t.w, this.w)), this
            }, clampScalar: function () {
                var e, t; return function (r, n) {
                    return void 0 === e && (e = new THREE.Vector4, t = new THREE.Vector4), e.set(r, r, r, r), t.set(n, n, n, n), this.clamp(e, t)
                }
            }(), floor: function () {
                return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this
            }, ceil: function () {
                return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this
            }, round: function () {
                return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this
            }, roundToZero: function () {
                return this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x), this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y), this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z), this.w = this.w < 0 ? Math.ceil(this.w) : Math.floor(this.w), this
            }, negate: function () {
                return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this
            }, dot: function (e) {
                return this.x * e.x + this.y * e.y + this.z * e.z + this.w * e.w
            }, lengthSq: function () {
                return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
            }, length: function () {
                return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)
            }, lengthManhattan: function () {
                return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w)
            }, normalize: function () {
                return this.divideScalar(this.length())
            }, setLength: function (e) {
                return this.multiplyScalar(e / this.length())
            }, lerp: function (e, t) {
                return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this.w += (e.w - this.w) * t, this
            }, lerpVectors: function (e, t, r) {
                return this.subVectors(t, e).multiplyScalar(r).add(e), this
            }, equals: function (e) {
                return e.x === this.x && e.y === this.y && e.z === this.z && e.w === this.w
            }, fromArray: function (e, t) {
                return void 0 === t && (t = 0), this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this.w = e[t + 3], this
            }, toArray: function (e, t) {
                return void 0 === e && (e = []), void 0 === t && (t = 0), e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e[t + 3] = this.w, e
            }, fromAttribute: function (e, t, r) {
                return void 0 === r && (r = 0), t = t * e.itemSize + r, this.x = e.array[t], this.y = e.array[t + 1], this.z = e.array[t + 2], this.w = e.array[t + 3], this
            }
        }, THREE.Euler = function (e, t, r, n) {
            this._x = e || 0, this._y = t || 0, this._z = r || 0, this._order = n || THREE.Euler.DefaultOrder
        }, THREE.Euler.RotationOrders = ["XYZ", "YZX", "ZXY", "XZY", "YXZ", "ZYX"], THREE.Euler.DefaultOrder = "XYZ", THREE.Euler.prototype = {
            constructor: THREE.Euler, get x() {
                return this._x
            }, set x(e) {
                this._x = e, this.onChangeCallback()
            }, get y() {
                return this._y
            }, set y(e) {
                this._y = e, this.onChangeCallback()
            }, get z() {
                return this._z
            }, set z(e) {
                this._z = e, this.onChangeCallback()
            }, get order() {
                return this._order
            }, set order(e) {
                this._order = e, this.onChangeCallback()
            }, set: function (e, t, r, n) {
                return this._x = e, this._y = t, this._z = r, this._order = n || this._order, this.onChangeCallback(), this
            }, clone: function () {
                return new this.constructor(this._x, this._y, this._z, this._order)
            }, copy: function (e) {
                return this._x = e._x, this._y = e._y, this._z = e._z, this._order = e._order,
                    this.onChangeCallback(), this
            }, setFromRotationMatrix: function (e, t, r) {
                var n = THREE.Math.clamp, i = e.elements, o = i[0], a = i[4], s = i[8], h = i[1], c = i[5], u = i[9], l = i[2], p = i[6], f = i[10]; return t = t || this._order, "XYZ" === t ? (this._y = Math.asin(n(s, -1, 1)), Math.abs(s) < .99999 ? (this._x = Math.atan2(-u, f), this._z = Math.atan2(-a, o)) : (this._x = Math.atan2(p, c), this._z = 0)) : "YXZ" === t ? (this._x = Math.asin(-n(u, -1, 1)), Math.abs(u) < .99999 ? (this._y = Math.atan2(s, f), this._z = Math.atan2(h, c)) : (this._y = Math.atan2(-l, o), this._z = 0)) : "ZXY" === t ? (this._x = Math.asin(n(p, -1, 1)), Math.abs(p) < .99999 ? (this._y = Math.atan2(-l, f), this._z = Math.atan2(-a, c)) : (this._y = 0, this._z = Math.atan2(h, o))) : "ZYX" === t ? (this._y = Math.asin(-n(l, -1, 1)), Math.abs(l) < .99999 ? (this._x = Math.atan2(p, f), this._z = Math.atan2(h, o)) : (this._x = 0, this._z = Math.atan2(-a, c))) : "YZX" === t ? (this._z = Math.asin(n(h, -1, 1)), Math.abs(h) < .99999 ? (this._x = Math.atan2(-u, c), this._y = Math.atan2(-l, o)) : (this._x = 0, this._y = Math.atan2(s, f))) : "XZY" === t ? (this._z = Math.asin(-n(a, -1, 1)), Math.abs(a) < .99999 ? (this._x = Math.atan2(p, c), this._y = Math.atan2(s, o)) : (this._x = Math.atan2(-u, f), this._y = 0)) : console.warn("THREE.Euler: .setFromRotationMatrix() given unsupported order: " + t), this._order = t, r !== !1 && this.onChangeCallback(), this
            }, setFromQuaternion: function () {
                var e; return function (t, r, n) {
                    return void 0 === e && (e = new THREE.Matrix4), e.makeRotationFromQuaternion(t), this.setFromRotationMatrix(e, r, n), this
                }
            }(), setFromVector3: function (e, t) {
                return this.set(e.x, e.y, e.z, t || this._order)
            }, reorder: function () {
                var e = new THREE.Quaternion; return function (t) {
                    e.setFromEuler(this), this.setFromQuaternion(e, t)
                }
            }(), equals: function (e) {
                return e._x === this._x && e._y === this._y && e._z === this._z && e._order === this._order
            }, fromArray: function (e) {
                return this._x = e[0], this._y = e[1], this._z = e[2], void 0 !== e[3] && (this._order = e[3]), this.onChangeCallback(), this
            }, toArray: function (e, t) {
                return void 0 === e && (e = []), void 0 === t && (t = 0), e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._order, e
            }, toVector3: function (e) {
                return e ? e.set(this._x, this._y, this._z) : new THREE.Vector3(this._x, this._y, this._z)
            }, onChange: function (e) {
                return this.onChangeCallback = e, this
            }, onChangeCallback: function () {
            }
        }, THREE.Line3 = function (e, t) {
            this.start = void 0 !== e ? e : new THREE.Vector3, this.end = void 0 !== t ? t : new THREE.Vector3
        }, THREE.Line3.prototype = {
            constructor: THREE.Line3, set: function (e, t) {
                return this.start.copy(e), this.end.copy(t), this
            }, clone: function () {
                return (new this.constructor).copy(this)
            }, copy: function (e) {
                return this.start.copy(e.start), this.end.copy(e.end), this
            }, center: function (e) {
                var t = e || new THREE.Vector3; return t.addVectors(this.start, this.end).multiplyScalar(.5)
            }, delta: function (e) {
                var t = e || new THREE.Vector3; return t.subVectors(this.end, this.start)
            }, distanceSq: function () {
                return this.start.distanceToSquared(this.end)
            }, distance: function () {
                return this.start.distanceTo(this.end)
            }, at: function (e, t) {
                var r = t || new THREE.Vector3; return this.delta(r).multiplyScalar(e).add(this.start)
            }, closestPointToPointParameter: function () {
                var e = new THREE.Vector3, t = new THREE.Vector3; return function (r, n) {
                    e.subVectors(r, this.start), t.subVectors(this.end, this.start); var i = t.dot(t), o = t.dot(e), a = o / i; return n && (a = THREE.Math.clamp(a, 0, 1)), a
                }
            }(), closestPointToPoint: function (e, t, r) {
                var n = this.closestPointToPointParameter(e, t), i = r || new THREE.Vector3; return this.delta(i).multiplyScalar(n).add(this.start)
            }, applyMatrix4: function (e) {
                return this.start.applyMatrix4(e), this.end.applyMatrix4(e), this
            }, equals: function (e) {
                return e.start.equals(this.start) && e.end.equals(this.end)
            }
        }, THREE.Box2 = function (e, t) {
            this.min = void 0 !== e ? e : new THREE.Vector2(1 / 0, 1 / 0), this.max = void 0 !== t ? t : new THREE.Vector2(-(1 / 0), -(1 / 0))
        }, THREE.Box2.prototype = {
            constructor: THREE.Box2, set: function (e, t) {
                return this.min.copy(e), this.max.copy(t), this
            }, setFromPoints: function (e) {
                this.makeEmpty(); for (var t = 0, r = e.length; r > t; t++)this.expandByPoint(e[t]); return this
            }, setFromCenterAndSize: function () {
                var e = new THREE.Vector2; return function (t, r) {
                    var n = e.copy(r).multiplyScalar(.5); return this.min.copy(t).sub(n), this.max.copy(t).add(n), this
                }
            }(), clone: function () {
                return (new this.constructor).copy(this)
            }, copy: function (e) {
                return this.min.copy(e.min), this.max.copy(e.max), this
            }, makeEmpty: function () {
                return this.min.x = this.min.y = 1 / 0, this.max.x = this.max.y = -(1 / 0), this
            }, empty: function () {
                return this.max.x < this.min.x || this.max.y < this.min.y
            }, center: function (e) {
                var t = e || new THREE.Vector2; return t.addVectors(this.min, this.max).multiplyScalar(.5)
            }, size: function (e) {
                var t = e || new THREE.Vector2; return t.subVectors(this.max, this.min)
            }, expandByPoint: function (e) {
                return this.min.min(e), this.max.max(e), this
            }, expandByVector: function (e) {
                return this.min.sub(e), this.max.add(e), this
            }, expandByScalar: function (e) {
                return this.min.addScalar(-e), this.max.addScalar(e), this
            }, containsPoint: function (e) {
                return e.x < this.min.x || e.x > this.max.x || e.y < this.min.y || e.y > this.max.y ? !1 : !0
            }, containsBox: function (e) {
                return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y ? !0 : !1
            }, getParameter: function (e, t) {
                var r = t || new THREE.Vector2; return r.set((e.x - this.min.x) / (this.max.x - this.min.x), (e.y - this.min.y) / (this.max.y - this.min.y))
            }, isIntersectionBox: function (e) {
                return e.max.x < this.min.x || e.min.x > this.max.x || e.max.y < this.min.y || e.min.y > this.max.y ? !1 : !0
            }, clampPoint: function (e, t) {
                var r = t || new THREE.Vector2; return r.copy(e).clamp(this.min, this.max)
            }, distanceToPoint: function () {
                var e = new THREE.Vector2; return function (t) {
                    var r = e.copy(t).clamp(this.min, this.max); return r.sub(t).length()
                }
            }(), intersect: function (e) {
                return this.min.max(e.min), this.max.min(e.max), this
            }, union: function (e) {
                return this.min.min(e.min), this.max.max(e.max), this
            }, translate: function (e) {
                return this.min.add(e), this.max.add(e), this
            }, equals: function (e) {
                return e.min.equals(this.min) && e.max.equals(this.max)
            }
        }, THREE.Box3 = function (e, t) {
            this.min = void 0 !== e ? e : new THREE.Vector3(1 / 0, 1 / 0, 1 / 0), this.max = void 0 !== t ? t : new THREE.Vector3(-(1 / 0), -(1 / 0), -(1 / 0))
        }, THREE.Box3.prototype = {
            constructor: THREE.Box3, set: function (e, t) {
                return this.min.copy(e), this.max.copy(t), this
            }, setFromPoints: function (e) {
                this.makeEmpty(); for (var t = 0, r = e.length; r > t; t++)this.expandByPoint(e[t]); return this
            }, setFromCenterAndSize: function () {
                var e = new THREE.Vector3; return function (t, r) {
                    var n = e.copy(r).multiplyScalar(.5); return this.min.copy(t).sub(n), this.max.copy(t).add(n), this
                }
            }(), setFromObject: function () {
                var e = new THREE.Vector3; return function (t) {
                    var r = this; return t.updateMatrixWorld(!0), this.makeEmpty(), t.traverse(function (t) {
                        var n = t.geometry; if (void 0 !== n) if (n instanceof THREE.Geometry) for (var i = n.vertices, o = 0, a = i.length; a > o; o++)e.copy(i[o]), e.applyMatrix4(t.matrixWorld), r.expandByPoint(e); else if (n instanceof THREE.BufferGeometry && void 0 !== n.attributes.position) for (var s = n.attributes.position.array, o = 0, a = s.length; a > o; o += 3)e.set(s[o], s[o + 1], s[o + 2]), e.applyMatrix4(t.matrixWorld), r.expandByPoint(e)
                    }), this
                }
            }(), clone: function () {
                return (new this.constructor).copy(this)
            }, copy: function (e) {
                return this.min.copy(e.min), this.max.copy(e.max), this
            }, makeEmpty: function () {
                return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -(1 / 0), this
            }, empty: function () {
                return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z
            }, center: function (e) {
                var t = e || new THREE.Vector3; return t.addVectors(this.min, this.max).multiplyScalar(.5)
            }, size: function (e) {
                var t = e || new THREE.Vector3; return t.subVectors(this.max, this.min)
            }, expandByPoint: function (e) {
                return this.min.min(e), this.max.max(e), this
            }, expandByVector: function (e) {
                return this.min.sub(e), this.max.add(e), this
            }, expandByScalar: function (e) {
                return this.min.addScalar(-e), this.max.addScalar(e), this
            }, containsPoint: function (e) {
                return e.x < this.min.x || e.x > this.max.x || e.y < this.min.y || e.y > this.max.y || e.z < this.min.z || e.z > this.max.z ? !1 : !0
            }, containsBox: function (e) {
                return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y && this.min.z <= e.min.z && e.max.z <= this.max.z ? !0 : !1
            }, getParameter: function (e, t) {
                var r = t || new THREE.Vector3; return r.set((e.x - this.min.x) / (this.max.x - this.min.x), (e.y - this.min.y) / (this.max.y - this.min.y), (e.z - this.min.z) / (this.max.z - this.min.z))
            }, isIntersectionBox: function (e) {
                return e.max.x < this.min.x || e.min.x > this.max.x || e.max.y < this.min.y || e.min.y > this.max.y || e.max.z < this.min.z || e.min.z > this.max.z ? !1 : !0
            }, clampPoint: function (e, t) {
                var r = t || new THREE.Vector3; return r.copy(e).clamp(this.min, this.max)
            }, distanceToPoint: function () {
                var e = new THREE.Vector3; return function (t) {
                    var r = e.copy(t).clamp(this.min, this.max); return r.sub(t).length()
                }
            }(), getBoundingSphere: function () {
                var e = new THREE.Vector3; return function (t) {
                    var r = t || new THREE.Sphere; return r.center = this.center(), r.radius = .5 * this.size(e).length(), r
                }
            }(), intersect: function (e) {
                return this.min.max(e.min), this.max.min(e.max), this
            }, union: function (e) {
                return this.min.min(e.min), this.max.max(e.max), this
            }, applyMatrix4: function () {
                var e = [new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3]; return function (t) {
                    return e[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(t), e[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(t), e[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(t), e[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(t), e[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(t), e[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(t), e[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(t), e[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(t), this.makeEmpty(), this.setFromPoints(e), this
                }
            }(), translate: function (e) {
                return this.min.add(e), this.max.add(e), this
            }, equals: function (e) {
                return e.min.equals(this.min) && e.max.equals(this.max)
            }
        }, THREE.Matrix3 = function () {
            this.elements = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]), arguments.length > 0 && console.error("THREE.Matrix3: the constructor no longer reads arguments. use .set() instead.")
        }, THREE.Matrix3.prototype = {
            constructor: THREE.Matrix3, set: function (e, t, r, n, i, o, a, s, h) {
                var c = this.elements; return c[0] = e, c[3] = t, c[6] = r, c[1] = n, c[4] = i, c[7] = o, c[2] = a, c[5] = s, c[8] = h, this
            }, identity: function () {
                return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this
            }, clone: function () {
                return (new this.constructor).fromArray(this.elements)
            }, copy: function (e) {
                var t = e.elements; return this.set(t[0], t[3], t[6], t[1], t[4], t[7], t[2], t[5], t[8]), this
            }, multiplyVector3: function (e) {
                return console.warn("THREE.Matrix3: .multiplyVector3() has been removed. Use vector.applyMatrix3( matrix ) instead."), e.applyMatrix3(this)
            }, multiplyVector3Array: function (e) {
                return console.warn("THREE.Matrix3: .multiplyVector3Array() has been renamed. Use matrix.applyToVector3Array( array ) instead."), this.applyToVector3Array(e)
            }, applyToVector3Array: function () {
                var e; return function (t, r, n) {
                    void 0 === e && (e = new THREE.Vector3), void 0 === r && (r = 0), void 0 === n && (n = t.length); for (var i = 0, o = r; n > i; i += 3, o += 3)e.fromArray(t, o), e.applyMatrix3(this), e.toArray(t, o); return t
                }
            }(), applyToBuffer: function () {
                var e; return function (t, r, n) {
                    void 0 === e && (e = new THREE.Vector3), void 0 === r && (r = 0), void 0 === n && (n = t.length / t.itemSize); for (var i = 0, o = r; n > i; i++, o++)e.x = t.getX(o), e.y = t.getY(o), e.z = t.getZ(o), e.applyMatrix3(this), t.setXYZ(e.x, e.y, e.z); return t
                }
            }(), multiplyScalar: function (e) {
                var t = this.elements; return t[0] *= e, t[3] *= e, t[6] *= e, t[1] *= e, t[4] *= e, t[7] *= e, t[2] *= e, t[5] *= e, t[8] *= e, this
            }, determinant: function () {
                var e = this.elements, t = e[0], r = e[1], n = e[2], i = e[3], o = e[4], a = e[5], s = e[6], h = e[7], c = e[8]; return t * o * c - t * a * h - r * i * c + r * a * s + n * i * h - n * o * s
            }, getInverse: function (e, t) {
                var r = e.elements, n = this.elements; n[0] = r[10] * r[5] - r[6] * r[9], n[1] = -r[10] * r[1] + r[2] * r[9], n[2] = r[6] * r[1] - r[2] * r[5], n[3] = -r[10] * r[4] + r[6] * r[8], n[4] = r[10] * r[0] - r[2] * r[8], n[5] = -r[6] * r[0] + r[2] * r[4], n[6] = r[9] * r[4] - r[5] * r[8], n[7] = -r[9] * r[0] + r[1] * r[8], n[8] = r[5] * r[0] - r[1] * r[4]; var i = r[0] * n[0] + r[1] * n[3] + r[2] * n[6]; if (0 === i) {
                    var o = "Matrix3.getInverse(): can't invert matrix, determinant is 0"; if (t) throw new Error(o); return console.warn(o), this.identity(), this
                } return this.multiplyScalar(1 / i), this
            }, transpose: function () {
                var e, t = this.elements; return e = t[1], t[1] = t[3], t[3] = e, e = t[2], t[2] = t[6], t[6] = e, e = t[5], t[5] = t[7], t[7] = e, this
            }, flattenToArrayOffset: function (e, t) {
                var r = this.elements; return e[t] = r[0], e[t + 1] = r[1], e[t + 2] = r[2], e[t + 3] = r[3], e[t + 4] = r[4], e[t + 5] = r[5], e[t + 6] = r[6], e[t + 7] = r[7], e[t + 8] = r[8], e
            }, getNormalMatrix: function (e) {
                return this.getInverse(e).transpose(), this
            }, transposeIntoArray: function (e) {
                var t = this.elements; return e[0] = t[0], e[1] = t[3], e[2] = t[6], e[3] = t[1], e[4] = t[4], e[5] = t[7], e[6] = t[2], e[7] = t[5], e[8] = t[8], this
            }, fromArray: function (e) {
                return this.elements.set(e), this
            }, toArray: function () {
                var e = this.elements; return [e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7], e[8]]
            }
        }, THREE.Matrix4 = function () {
            this.elements = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]), arguments.length > 0 && console.error("THREE.Matrix4: the constructor no longer reads arguments. use .set() instead.")
        }, THREE.Matrix4.prototype = {
            constructor: THREE.Matrix4, set: function (e, t, r, n, i, o, a, s, h, c, u, l, p, f, d, E) {
                var m = this.elements; return m[0] = e, m[4] = t, m[8] = r, m[12] = n, m[1] = i, m[5] = o, m[9] = a, m[13] = s, m[2] = h, m[6] = c, m[10] = u, m[14] = l, m[3] = p, m[7] = f, m[11] = d, m[15] = E, this
            }, identity: function () {
                return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this
            }, clone: function () {
                return (new THREE.Matrix4).fromArray(this.elements)
            }, copy: function (e) {
                return this.elements.set(e.elements), this
            }, extractPosition: function (e) {
                return console.warn("THREE.Matrix4: .extractPosition() has been renamed to .copyPosition()."), this.copyPosition(e)
            }, copyPosition: function (e) {
                var t = this.elements, r = e.elements; return t[12] = r[12], t[13] = r[13], t[14] = r[14], this
            }, extractBasis: function (e, t, r) {
                var n = this.elements; return e.set(n[0], n[1], n[2]), t.set(n[4], n[5], n[6]), r.set(n[8], n[9], n[10]), this
            }, makeBasis: function (e, t, r) {
                return this.set(e.x, t.x, r.x, 0, e.y, t.y, r.y, 0, e.z, t.z, r.z, 0, 0, 0, 0, 1), this
            }, extractRotation: function () {
                var e; return function (t) {
                    void 0 === e && (e = new THREE.Vector3); var r = this.elements, n = t.elements, i = 1 / e.set(n[0], n[1], n[2]).length(), o = 1 / e.set(n[4], n[5], n[6]).length(), a = 1 / e.set(n[8], n[9], n[10]).length(); return r[0] = n[0] * i, r[1] = n[1] * i, r[2] = n[2] * i, r[4] = n[4] * o, r[5] = n[5] * o, r[6] = n[6] * o, r[8] = n[8] * a, r[9] = n[9] * a, r[10] = n[10] * a, this
                }
            }(), makeRotationFromEuler: function (e) {
                e instanceof THREE.Euler == !1 && console.error("THREE.Matrix: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order."); var t = this.elements, r = e.x, n = e.y, i = e.z, o = Math.cos(r), a = Math.sin(r), s = Math.cos(n), h = Math.sin(n), c = Math.cos(i), u = Math.sin(i); if ("XYZ" === e.order) {
                    var l = o * c, p = o * u, f = a * c, d = a * u; t[0] = s * c, t[4] = -s * u, t[8] = h, t[1] = p + f * h, t[5] = l - d * h, t[9] = -a * s, t[2] = d - l * h, t[6] = f + p * h, t[10] = o * s
                } else if ("YXZ" === e.order) {
                    var E = s * c, m = s * u, g = h * c, v = h * u; t[0] = E + v * a, t[4] = g * a - m, t[8] = o * h, t[1] = o * u, t[5] = o * c, t[9] = -a, t[2] = m * a - g, t[6] = v + E * a, t[10] = o * s
                } else if ("ZXY" === e.order) {
                    var E = s * c, m = s * u, g = h * c, v = h * u; t[0] = E - v * a, t[4] = -o * u, t[8] = g + m * a, t[1] = m + g * a, t[5] = o * c, t[9] = v - E * a, t[2] = -o * h, t[6] = a, t[10] = o * s
                } else if ("ZYX" === e.order) {
                    var l = o * c, p = o * u, f = a * c, d = a * u; t[0] = s * c, t[4] = f * h - p, t[8] = l * h + d, t[1] = s * u, t[5] = d * h + l, t[9] = p * h - f, t[2] = -h, t[6] = a * s, t[10] = o * s
                } else if ("YZX" === e.order) {
                    var T = o * s, y = o * h, R = a * s, x = a * h; t[0] = s * c, t[4] = x - T * u, t[8] = R * u + y, t[1] = u, t[5] = o * c, t[9] = -a * c, t[2] = -h * c, t[6] = y * u + R, t[10] = T - x * u
                } else if ("XZY" === e.order) {
                    var T = o * s, y = o * h, R = a * s, x = a * h; t[0] = s * c, t[4] = -u, t[8] = h * c, t[1] = T * u + x, t[5] = o * c, t[9] = y * u - R, t[2] = R * u - y, t[6] = a * c, t[10] = x * u + T
                } return t[3] = 0, t[7] = 0, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this
            }, setRotationFromQuaternion: function (e) {
                return console.warn("THREE.Matrix4: .setRotationFromQuaternion() has been renamed to .makeRotationFromQuaternion()."), this.makeRotationFromQuaternion(e)
            }, makeRotationFromQuaternion: function (e) {
                var t = this.elements, r = e.x, n = e.y, i = e.z, o = e.w, a = r + r, s = n + n, h = i + i, c = r * a, u = r * s, l = r * h, p = n * s, f = n * h, d = i * h, E = o * a, m = o * s, g = o * h; return t[0] = 1 - (p + d), t[4] = u - g, t[8] = l + m, t[1] = u + g, t[5] = 1 - (c + d), t[9] = f - E, t[2] = l - m, t[6] = f + E, t[10] = 1 - (c + p), t[3] = 0, t[7] = 0, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this
            }, lookAt: function () {
                var e, t, r; return function (n, i, o) {
                    void 0 === e && (e = new THREE.Vector3), void 0 === t && (t = new THREE.Vector3), void 0 === r && (r = new THREE.Vector3); var a = this.elements; return r.subVectors(n, i).normalize(), 0 === r.lengthSq() && (r.z = 1), e.crossVectors(o, r).normalize(), 0 === e.lengthSq() && (r.x += 1e-4, e.crossVectors(o, r).normalize()), t.crossVectors(r, e), a[0] = e.x, a[4] = t.x, a[8] = r.x, a[1] = e.y, a[5] = t.y, a[9] = r.y, a[2] = e.z, a[6] = t.z, a[10] = r.z, this
                }
            }(), multiply: function (e, t) {
                return void 0 !== t ? (console.warn("THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead."), this.multiplyMatrices(e, t)) : this.multiplyMatrices(this, e)
            }, multiplyMatrices: function (e, t) {
                var r = e.elements, n = t.elements, i = this.elements, o = r[0], a = r[4], s = r[8], h = r[12], c = r[1], u = r[5], l = r[9], p = r[13], f = r[2], d = r[6], E = r[10], m = r[14], g = r[3], v = r[7], T = r[11], y = r[15], R = n[0], x = n[4], H = n[8], b = n[12], w = n[1], M = n[5], S = n[9], _ = n[13], C = n[2], A = n[6], L = n[10], k = n[14], P = n[3], D = n[7], O = n[11], F = n[15]; return i[0] = o * R + a * w + s * C + h * P, i[4] = o * x + a * M + s * A + h * D, i[8] = o * H + a * S + s * L + h * O, i[12] = o * b + a * _ + s * k + h * F, i[1] = c * R + u * w + l * C + p * P, i[5] = c * x + u * M + l * A + p * D, i[9] = c * H + u * S + l * L + p * O, i[13] = c * b + u * _ + l * k + p * F, i[2] = f * R + d * w + E * C + m * P, i[6] = f * x + d * M + E * A + m * D, i[10] = f * H + d * S + E * L + m * O, i[14] = f * b + d * _ + E * k + m * F, i[3] = g * R + v * w + T * C + y * P, i[7] = g * x + v * M + T * A + y * D, i[11] = g * H + v * S + T * L + y * O, i[15] = g * b + v * _ + T * k + y * F, this
            }, multiplyToArray: function (e, t, r) {
                var n = this.elements; return this.multiplyMatrices(e, t), r[0] = n[0], r[1] = n[1], r[2] = n[2], r[3] = n[3], r[4] = n[4], r[5] = n[5], r[6] = n[6], r[7] = n[7], r[8] = n[8], r[9] = n[9], r[10] = n[10], r[11] = n[11], r[12] = n[12], r[13] = n[13], r[14] = n[14], r[15] = n[15], this
            }, multiplyScalar: function (e) {
                var t = this.elements; return t[0] *= e, t[4] *= e, t[8] *= e, t[12] *= e, t[1] *= e, t[5] *= e, t[9] *= e, t[13] *= e, t[2] *= e, t[6] *= e, t[10] *= e, t[14] *= e, t[3] *= e, t[7] *= e, t[11] *= e, t[15] *= e, this
            }, multiplyVector3: function (e) {
                return console.warn("THREE.Matrix4: .multiplyVector3() has been removed. Use vector.applyMatrix4( matrix ) or vector.applyProjection( matrix ) instead."), e.applyProjection(this)
            }, multiplyVector4: function (e) {
                return console.warn("THREE.Matrix4: .multiplyVector4() has been removed. Use vector.applyMatrix4( matrix ) instead."), e.applyMatrix4(this)
            }, multiplyVector3Array: function (e) {
                return console.warn("THREE.Matrix4: .multiplyVector3Array() has been renamed. Use matrix.applyToVector3Array( array ) instead."), this.applyToVector3Array(e)
            }, applyToVector3Array: function () {
                var e; return function (t, r, n) {
                    void 0 === e && (e = new THREE.Vector3), void 0 === r && (r = 0), void 0 === n && (n = t.length); for (var i = 0, o = r; n > i; i += 3, o += 3)e.fromArray(t, o), e.applyMatrix4(this), e.toArray(t, o); return t
                }
            }(), applyToBuffer: function () {
                var e; return function (t, r, n) {
                    void 0 === e && (e = new THREE.Vector3), void 0 === r && (r = 0), void 0 === n && (n = t.length / t.itemSize); for (var i = 0, o = r; n > i; i++, o++)e.x = t.getX(o), e.y = t.getY(o), e.z = t.getZ(o), e.applyMatrix4(this), t.setXYZ(e.x, e.y, e.z); return t
                }
            }(), rotateAxis: function (e) {
                console.warn("THREE.Matrix4: .rotateAxis() has been removed. Use Vector3.transformDirection( matrix ) instead."), e.transformDirection(this)
            }, crossVector: function (e) {
                return console.warn("THREE.Matrix4: .crossVector() has been removed. Use vector.applyMatrix4( matrix ) instead."), e.applyMatrix4(this)
            }, determinant: function () {
                var e = this.elements, t = e[0], r = e[4], n = e[8], i = e[12], o = e[1], a = e[5], s = e[9], h = e[13], c = e[2], u = e[6], l = e[10], p = e[14], f = e[3], d = e[7], E = e[11], m = e[15]; return f * (+i * s * u - n * h * u - i * a * l + r * h * l + n * a * p - r * s * p) + d * (+t * s * p - t * h * l + i * o * l - n * o * p + n * h * c - i * s * c) + E * (+t * h * u - t * a * p - i * o * u + r * o * p + i * a * c - r * h * c) + m * (-n * a * c - t * s * u + t * a * l + n * o * u - r * o * l + r * s * c)
            }, transpose: function () {
                var e, t = this.elements; return e = t[1], t[1] = t[4], t[4] = e, e = t[2], t[2] = t[8], t[8] = e, e = t[6], t[6] = t[9], t[9] = e, e = t[3], t[3] = t[12], t[12] = e, e = t[7], t[7] = t[13], t[13] = e, e = t[11], t[11] = t[14], t[14] = e, this
            }, flattenToArrayOffset: function (e, t) {
                var r = this.elements; return e[t] = r[0], e[t + 1] = r[1], e[t + 2] = r[2], e[t + 3] = r[3], e[t + 4] = r[4], e[t + 5] = r[5], e[t + 6] = r[6], e[t + 7] = r[7], e[t + 8] = r[8], e[t + 9] = r[9], e[t + 10] = r[10], e[t + 11] = r[11], e[t + 12] = r[12], e[t + 13] = r[13], e[t + 14] = r[14], e[t + 15] = r[15], e
            }, getPosition: function () {
                var e; return function () {
                    void 0 === e && (e = new THREE.Vector3), console.warn("THREE.Matrix4: .getPosition() has been removed. Use Vector3.setFromMatrixPosition( matrix ) instead."); var t = this.elements; return e.set(t[12], t[13], t[14])
                }
            }(), setPosition: function (e) {
                var t = this.elements; return t[12] = e.x, t[13] = e.y, t[14] = e.z, this
            }, getInverse: function (e, t) {
                var r = this.elements, n = e.elements, i = n[0], o = n[4], a = n[8], s = n[12], h = n[1], c = n[5], u = n[9], l = n[13], p = n[2], f = n[6], d = n[10], E = n[14], m = n[3], g = n[7], v = n[11], T = n[15]; r[0] = u * E * g - l * d * g + l * f * v - c * E * v - u * f * T + c * d * T, r[4] = s * d * g - a * E * g - s * f * v + o * E * v + a * f * T - o * d * T, r[8] = a * l * g - s * u * g + s * c * v - o * l * v - a * c * T + o * u * T, r[12] = s * u * f - a * l * f - s * c * d + o * l * d + a * c * E - o * u * E, r[1] = l * d * m - u * E * m - l * p * v + h * E * v + u * p * T - h * d * T, r[5] = a * E * m - s * d * m + s * p * v - i * E * v - a * p * T + i * d * T, r[9] = s * u * m - a * l * m - s * h * v + i * l * v + a * h * T - i * u * T, r[13] = a * l * p - s * u * p + s * h * d - i * l * d - a * h * E + i * u * E, r[2] = c * E * m - l * f * m + l * p * g - h * E * g - c * p * T + h * f * T, r[6] = s * f * m - o * E * m - s * p * g + i * E * g + o * p * T - i * f * T, r[10] = o * l * m - s * c * m + s * h * g - i * l * g - o * h * T + i * c * T, r[14] = s * c * p - o * l * p - s * h * f + i * l * f + o * h * E - i * c * E, r[3] = u * f * m - c * d * m - u * p * g + h * d * g + c * p * v - h * f * v, r[7] = o * d * m - a * f * m + a * p * g - i * d * g - o * p * v + i * f * v, r[11] = a * c * m - o * u * m - a * h * g + i * u * g + o * h * v - i * c * v, r[15] = o * u * p - a * c * p + a * h * f - i * u * f - o * h * d + i * c * d; var y = i * r[0] + h * r[4] + p * r[8] + m * r[12]; if (0 === y) {
                    var R = "THREE.Matrix4.getInverse(): can't invert matrix, determinant is 0"; if (t) throw new Error(R); return console.warn(R), this.identity(), this
                } return this.multiplyScalar(1 / y), this
            }, translate: function (e) {
                console.error("THREE.Matrix4: .translate() has been removed.")
            }, rotateX: function (e) {
                console.error("THREE.Matrix4: .rotateX() has been removed.")
            }, rotateY: function (e) {
                console.error("THREE.Matrix4: .rotateY() has been removed.")
            }, rotateZ: function (e) {
                console.error("THREE.Matrix4: .rotateZ() has been removed.")
            }, rotateByAxis: function (e, t) {
                console.error("THREE.Matrix4: .rotateByAxis() has been removed.")
            }, scale: function (e) {
                var t = this.elements, r = e.x, n = e.y, i = e.z; return t[0] *= r, t[4] *= n, t[8] *= i, t[1] *= r, t[5] *= n, t[9] *= i, t[2] *= r, t[6] *= n, t[10] *= i, t[3] *= r, t[7] *= n, t[11] *= i, this
            }, getMaxScaleOnAxis: function () {
                var e = this.elements, t = e[0] * e[0] + e[1] * e[1] + e[2] * e[2], r = e[4] * e[4] + e[5] * e[5] + e[6] * e[6], n = e[8] * e[8] + e[9] * e[9] + e[10] * e[10]; return Math.sqrt(Math.max(t, r, n))
            }, makeTranslation: function (e, t, r) {
                return this.set(1, 0, 0, e, 0, 1, 0, t, 0, 0, 1, r, 0, 0, 0, 1), this
            }, makeRotationX: function (e) {
                var t = Math.cos(e), r = Math.sin(e); return this.set(1, 0, 0, 0, 0, t, -r, 0, 0, r, t, 0, 0, 0, 0, 1), this
            }, makeRotationY: function (e) {
                var t = Math.cos(e), r = Math.sin(e); return this.set(t, 0, r, 0, 0, 1, 0, 0, -r, 0, t, 0, 0, 0, 0, 1), this
            }, makeRotationZ: function (e) {
                var t = Math.cos(e), r = Math.sin(e); return this.set(t, -r, 0, 0, r, t, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this
            }, makeRotationAxis: function (e, t) {
                var r = Math.cos(t), n = Math.sin(t), i = 1 - r, o = e.x, a = e.y, s = e.z, h = i * o, c = i * a; return this.set(h * o + r, h * a - n * s, h * s + n * a, 0, h * a + n * s, c * a + r, c * s - n * o, 0, h * s - n * a, c * s + n * o, i * s * s + r, 0, 0, 0, 0, 1), this
            }, makeScale: function (e, t, r) {
                return this.set(e, 0, 0, 0, 0, t, 0, 0, 0, 0, r, 0, 0, 0, 0, 1), this
            }, compose: function (e, t, r) {
                return this.makeRotationFromQuaternion(t), this.scale(r), this.setPosition(e), this
            }, decompose: function () {
                var e, t; return function (r, n, i) {
                    void 0 === e && (e = new THREE.Vector3), void 0 === t && (t = new THREE.Matrix4); var o = this.elements, a = e.set(o[0], o[1], o[2]).length(), s = e.set(o[4], o[5], o[6]).length(), h = e.set(o[8], o[9], o[10]).length(), c = this.determinant(); 0 > c && (a = -a), r.x = o[12], r.y = o[13], r.z = o[14], t.elements.set(this.elements); var u = 1 / a, l = 1 / s, p = 1 / h; return t.elements[0] *= u, t.elements[1] *= u, t.elements[2] *= u, t.elements[4] *= l, t.elements[5] *= l, t.elements[6] *= l, t.elements[8] *= p, t.elements[9] *= p, t.elements[10] *= p, n.setFromRotationMatrix(t), i.x = a, i.y = s, i.z = h, this
                }
            }(), makeFrustum: function (e, t, r, n, i, o) {
                var a = this.elements, s = 2 * i / (t - e), h = 2 * i / (n - r), c = (t + e) / (t - e), u = (n + r) / (n - r), l = -(o + i) / (o - i), p = -2 * o * i / (o - i); return a[0] = s, a[4] = 0, a[8] = c, a[12] = 0, a[1] = 0, a[5] = h, a[9] = u, a[13] = 0, a[2] = 0, a[6] = 0, a[10] = l, a[14] = p, a[3] = 0, a[7] = 0, a[11] = -1, a[15] = 0, this
            }, makePerspective: function (e, t, r, n) {
                var i = r * Math.tan(THREE.Math.degToRad(.5 * e)), o = -i, a = o * t, s = i * t; return this.makeFrustum(a, s, o, i, r, n)
            }, makeOrthographic: function (e, t, r, n, i, o) {
                var a = this.elements, s = t - e, h = r - n, c = o - i, u = (t + e) / s, l = (r + n) / h, p = (o + i) / c; return a[0] = 2 / s, a[4] = 0, a[8] = 0, a[12] = -u, a[1] = 0, a[5] = 2 / h, a[9] = 0, a[13] = -l, a[2] = 0, a[6] = 0, a[10] = -2 / c, a[14] = -p, a[3] = 0, a[7] = 0, a[11] = 0, a[15] = 1, this
            }, equals: function (e) {
                for (var t = this.elements, r = e.elements, n = 0; 16 > n; n++)if (t[n] !== r[n]) return !1; return !0
            }, fromArray: function (e) {
                return this.elements.set(e), this
            }, toArray: function () {
                var e = this.elements; return [e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7], e[8], e[9], e[10], e[11], e[12], e[13], e[14], e[15]]
            }
        }, THREE.Ray = function (e, t) {
            this.origin = void 0 !== e ? e : new THREE.Vector3, this.direction = void 0 !== t ? t : new THREE.Vector3
        }, THREE.Ray.prototype = {
            constructor: THREE.Ray, set: function (e, t) {
                return this.origin.copy(e), this.direction.copy(t), this
            }, clone: function () {
                return (new this.constructor).copy(this)
            }, copy: function (e) {
                return this.origin.copy(e.origin), this.direction.copy(e.direction), this
            }, at: function (e, t) {
                var r = t || new THREE.Vector3; return r.copy(this.direction).multiplyScalar(e).add(this.origin)
            }, recast: function () {
                var e = new THREE.Vector3; return function (t) {
                    return this.origin.copy(this.at(t, e)), this
                }
            }(), closestPointToPoint: function (e, t) {
                var r = t || new THREE.Vector3; r.subVectors(e, this.origin); var n = r.dot(this.direction); return 0 > n ? r.copy(this.origin) : r.copy(this.direction).multiplyScalar(n).add(this.origin)
            }, distanceToPoint: function (e) {
                return Math.sqrt(this.distanceSqToPoint(e))
            }, distanceSqToPoint: function () {
                var e = new THREE.Vector3; return function (t) {
                    var r = e.subVectors(t, this.origin).dot(this.direction); return 0 > r ? this.origin.distanceToSquared(t) : (e.copy(this.direction).multiplyScalar(r).add(this.origin), e.distanceToSquared(t))
                }
            }(), distanceSqToSegment: function () {
                var e = new THREE.Vector3, t = new THREE.Vector3, r = new THREE.Vector3; return function (n, i, o, a) {
                    e.copy(n).add(i).multiplyScalar(.5), t.copy(i).sub(n).normalize(), r.copy(this.origin).sub(e); var s, h, c, u, l = .5 * n.distanceTo(i), p = -this.direction.dot(t), f = r.dot(this.direction), d = -r.dot(t), E = r.lengthSq(), m = Math.abs(1 - p * p); if (m > 0) if (s = p * d - f, h = p * f - d, u = l * m, s >= 0) if (h >= -u) if (u >= h) {
                        var g = 1 / m; s *= g, h *= g, c = s * (s + p * h + 2 * f) + h * (p * s + h + 2 * d) + E
                    } else h = l, s = Math.max(0, -(p * h + f)), c = -s * s + h * (h + 2 * d) + E; else h = -l, s = Math.max(0, -(p * h + f)), c = -s * s + h * (h + 2 * d) + E; else -u >= h ? (s = Math.max(0, -(-p * l + f)), h = s > 0 ? -l : Math.min(Math.max(-l, -d), l), c = -s * s + h * (h + 2 * d) + E) : u >= h ? (s = 0, h = Math.min(Math.max(-l, -d), l), c = h * (h + 2 * d) + E) : (s = Math.max(0, -(p * l + f)), h = s > 0 ? l : Math.min(Math.max(-l, -d), l), c = -s * s + h * (h + 2 * d) + E); else h = p > 0 ? -l : l, s = Math.max(0, -(p * h + f)), c = -s * s + h * (h + 2 * d) + E; return o && o.copy(this.direction).multiplyScalar(s).add(this.origin), a && a.copy(t).multiplyScalar(h).add(e), c
                }
            }(), isIntersectionSphere: function (e) {
                return this.distanceToPoint(e.center) <= e.radius
            }, intersectSphere: function () {
                var e = new THREE.Vector3; return function (t, r) {
                    e.subVectors(t.center, this.origin); var n = e.dot(this.direction), i = e.dot(e) - n * n, o = t.radius * t.radius; if (i > o) return null; var a = Math.sqrt(o - i), s = n - a, h = n + a; return 0 > s && 0 > h ? null : 0 > s ? this.at(h, r) : this.at(s, r)
                }
            }(), isIntersectionPlane: function (e) {
                var t = e.distanceToPoint(this.origin); if (0 === t) return !0; var r = e.normal.dot(this.direction); return 0 > r * t ? !0 : !1
            }, distanceToPlane: function (e) {
                var t = e.normal.dot(this.direction); if (0 === t) return 0 === e.distanceToPoint(this.origin) ? 0 : null; var r = -(this.origin.dot(e.normal) + e.constant) / t; return r >= 0 ? r : null
            }, intersectPlane: function (e, t) {
                var r = this.distanceToPlane(e); return null === r ? null : this.at(r, t)
            }, isIntersectionBox: function () {
                var e = new THREE.Vector3; return function (t) {
                    return null !== this.intersectBox(t, e)
                }
            }(), intersectBox: function (e, t) {
                var r, n, i, o, a, s, h = 1 / this.direction.x, c = 1 / this.direction.y, u = 1 / this.direction.z, l = this.origin; return h >= 0 ? (r = (e.min.x - l.x) * h, n = (e.max.x - l.x) * h) : (r = (e.max.x - l.x) * h, n = (e.min.x - l.x) * h), c >= 0 ? (i = (e.min.y - l.y) * c, o = (e.max.y - l.y) * c) : (i = (e.max.y - l.y) * c, o = (e.min.y - l.y) * c), r > o || i > n ? null : ((i > r || r !== r) && (r = i), (n > o || n !== n) && (n = o), u >= 0 ? (a = (e.min.z - l.z) * u, s = (e.max.z - l.z) * u) : (a = (e.max.z - l.z) * u, s = (e.min.z - l.z) * u), r > s || a > n ? null : ((a > r || r !== r) && (r = a), (n > s || n !== n) && (n = s), 0 > n ? null : this.at(r >= 0 ? r : n, t)))
            }, intersectTriangle: function () {
                var e = new THREE.Vector3, t = new THREE.Vector3, r = new THREE.Vector3, n = new THREE.Vector3; return function (i, o, a, s, h) {
                    t.subVectors(o, i), r.subVectors(a, i), n.crossVectors(t, r); var c, u = this.direction.dot(n); if (u > 0) {
                        if (s) return null; c = 1
                    } else {
                        if (!(0 > u)) return null; c = -1, u = -u
                    } e.subVectors(this.origin, i); var l = c * this.direction.dot(r.crossVectors(e, r)); if (0 > l) return null; var p = c * this.direction.dot(t.cross(e)); if (0 > p) return null; if (l + p > u) return null; var f = -c * e.dot(n); return 0 > f ? null : this.at(f / u, h)
                }
            }(), applyMatrix4: function (e) {
                return this.direction.add(this.origin).applyMatrix4(e), this.origin.applyMatrix4(e), this.direction.sub(this.origin), this.direction.normalize(), this
            }, equals: function (e) {
                return e.origin.equals(this.origin) && e.direction.equals(this.direction)
            }
        }, THREE.Sphere = function (e, t) {
            this.center = void 0 !== e ? e : new THREE.Vector3, this.radius = void 0 !== t ? t : 0
        }, THREE.Sphere.prototype = {
            constructor: THREE.Sphere, set: function (e, t) {
                return this.center.copy(e), this.radius = t, this
            }, setFromPoints: function () {
                var e = new THREE.Box3; return function (t, r) {
                    var n = this.center; void 0 !== r ? n.copy(r) : e.setFromPoints(t).center(n); for (var i = 0, o = 0, a = t.length; a > o; o++)i = Math.max(i, n.distanceToSquared(t[o])); return this.radius = Math.sqrt(i), this
                }
            }(), clone: function () {
                return (new this.constructor).copy(this)
            }, copy: function (e) {
                return this.center.copy(e.center), this.radius = e.radius, this
            }, empty: function () {
                return this.radius <= 0
            }, containsPoint: function (e) {
                return e.distanceToSquared(this.center) <= this.radius * this.radius
            }, distanceToPoint: function (e) {
                return e.distanceTo(this.center) - this.radius
            }, intersectsSphere: function (e) {
                var t = this.radius + e.radius; return e.center.distanceToSquared(this.center) <= t * t
            }, clampPoint: function (e, t) {
                var r = this.center.distanceToSquared(e), n = t || new THREE.Vector3; return n.copy(e), r > this.radius * this.radius && (n.sub(this.center).normalize(), n.multiplyScalar(this.radius).add(this.center)), n
            }, getBoundingBox: function (e) {
                var t = e || new THREE.Box3; return t.set(this.center, this.center), t.expandByScalar(this.radius), t
            }, applyMatrix4: function (e) {
                return this.center.applyMatrix4(e), this.radius = this.radius * e.getMaxScaleOnAxis(), this
            }, translate: function (e) {
                return this.center.add(e), this
            }, equals: function (e) {
                return e.center.equals(this.center) && e.radius === this.radius
            }
        }, THREE.Frustum = function (e, t, r, n, i, o) {
            this.planes = [void 0 !== e ? e : new THREE.Plane, void 0 !== t ? t : new THREE.Plane, void 0 !== r ? r : new THREE.Plane, void 0 !== n ? n : new THREE.Plane, void 0 !== i ? i : new THREE.Plane, void 0 !== o ? o : new THREE.Plane]
        }, THREE.Frustum.prototype = {
            constructor: THREE.Frustum, set: function (e, t, r, n, i, o) {
                var a = this.planes; return a[0].copy(e), a[1].copy(t), a[2].copy(r), a[3].copy(n), a[4].copy(i), a[5].copy(o), this
            }, clone: function () {
                return (new this.constructor).copy(this)
            }, copy: function (e) {
                for (var t = this.planes, r = 0; 6 > r; r++)t[r].copy(e.planes[r]); return this
            }, setFromMatrix: function (e) {
                var t = this.planes, r = e.elements, n = r[0], i = r[1], o = r[2], a = r[3], s = r[4], h = r[5], c = r[6], u = r[7], l = r[8], p = r[9], f = r[10], d = r[11], E = r[12], m = r[13], g = r[14], v = r[15]; return t[0].setComponents(a - n, u - s, d - l, v - E).normalize(), t[1].setComponents(a + n, u + s, d + l, v + E).normalize(), t[2].setComponents(a + i, u + h, d + p, v + m).normalize(), t[3].setComponents(a - i, u - h, d - p, v - m).normalize(), t[4].setComponents(a - o, u - c, d - f, v - g).normalize(), t[5].setComponents(a + o, u + c, d + f, v + g).normalize(), this
            }, intersectsObject: function () {
                var e = new THREE.Sphere; return function (t) {
                    var r = t.geometry; return null === r.boundingSphere && r.computeBoundingSphere(), e.copy(r.boundingSphere), e.applyMatrix4(t.matrixWorld), this.intersectsSphere(e)
                }
            }(), intersectsSphere: function (e) {
                for (var t = this.planes, r = e.center, n = -e.radius, i = 0; 6 > i; i++) {
                    var o = t[i].distanceToPoint(r); if (n > o) return !1
                } return !0
            }, intersectsBox: function () {
                var e = new THREE.Vector3, t = new THREE.Vector3; return function (r) {
                    for (var n = this.planes, i = 0; 6 > i; i++) {
                        var o = n[i]; e.x = o.normal.x > 0 ? r.min.x : r.max.x, t.x = o.normal.x > 0 ? r.max.x : r.min.x, e.y = o.normal.y > 0 ? r.min.y : r.max.y, t.y = o.normal.y > 0 ? r.max.y : r.min.y, e.z = o.normal.z > 0 ? r.min.z : r.max.z, t.z = o.normal.z > 0 ? r.max.z : r.min.z; var a = o.distanceToPoint(e), s = o.distanceToPoint(t); if (0 > a && 0 > s) return !1
                    } return !0
                }
            }(), containsPoint: function (e) {
                for (var t = this.planes, r = 0; 6 > r; r++)if (t[r].distanceToPoint(e) < 0) return !1; return !0
            }
        }, THREE.Plane = function (e, t) {
            this.normal = void 0 !== e ? e : new THREE.Vector3(1, 0, 0), this.constant = void 0 !== t ? t : 0
        }, THREE.Plane.prototype = {
            constructor: THREE.Plane, set: function (e, t) {
                return this.normal.copy(e), this.constant = t, this
            }, setComponents: function (e, t, r, n) {
                return this.normal.set(e, t, r), this.constant = n, this
            }, setFromNormalAndCoplanarPoint: function (e, t) {
                return this.normal.copy(e), this.constant = -t.dot(this.normal), this
            }, setFromCoplanarPoints: function () {
                var e = new THREE.Vector3, t = new THREE.Vector3; return function (r, n, i) {
                    var o = e.subVectors(i, n).cross(t.subVectors(r, n)).normalize(); return this.setFromNormalAndCoplanarPoint(o, r), this
                }
            }(), clone: function () {
                return (new this.constructor).copy(this)
            }, copy: function (e) {
                return this.normal.copy(e.normal), this.constant = e.constant, this
            }, normalize: function () {
                var e = 1 / this.normal.length(); return this.normal.multiplyScalar(e), this.constant *= e, this
            }, negate: function () {
                return this.constant *= -1, this.normal.negate(), this
            }, distanceToPoint: function (e) {
                return this.normal.dot(e) + this.constant
            }, distanceToSphere: function (e) {
                return this.distanceToPoint(e.center) - e.radius
            }, projectPoint: function (e, t) {
                return this.orthoPoint(e, t).sub(e).negate()
            }, orthoPoint: function (e, t) {
                var r = this.distanceToPoint(e), n = t || new THREE.Vector3; return n.copy(this.normal).multiplyScalar(r)
            }, isIntersectionLine: function (e) {
                var t = this.distanceToPoint(e.start), r = this.distanceToPoint(e.end); return 0 > t && r > 0 || 0 > r && t > 0
            }, intersectLine: function () {
                var e = new THREE.Vector3; return function (t, r) {
                    var n = r || new THREE.Vector3, i = t.delta(e), o = this.normal.dot(i); if (0 !== o) {
                        var a = -(t.start.dot(this.normal) + this.constant) / o; if (!(0 > a || a > 1)) return n.copy(i).multiplyScalar(a).add(t.start)
                    } else if (0 === this.distanceToPoint(t.start)) return n.copy(t.start)
                }
            }(), coplanarPoint: function (e) {
                var t = e || new THREE.Vector3; return t.copy(this.normal).multiplyScalar(-this.constant)
            }, applyMatrix4: function () {
                var e = new THREE.Vector3, t = new THREE.Vector3, r = new THREE.Matrix3; return function (n, i) {
                    var o = i || r.getNormalMatrix(n), a = e.copy(this.normal).applyMatrix3(o), s = this.coplanarPoint(t); return s.applyMatrix4(n), this.setFromNormalAndCoplanarPoint(a, s), this
                }
            }(), translate: function (e) {
                return this.constant = this.constant - e.dot(this.normal), this
            }, equals: function (e) {
                return e.normal.equals(this.normal) && e.constant === this.constant
            }
        }, THREE.Math = {
            generateUUID: function () {
                var e, t = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""), r = new Array(36), n = 0; return function () {
                    for (var i = 0; 36 > i; i++)8 === i || 13 === i || 18 === i || 23 === i ? r[i] = "-" : 14 === i ? r[i] = "4" : (2 >= n && (n = 33554432 + 16777216 * Math.random() | 0), e = 15 & n, n >>= 4, r[i] = t[19 === i ? 3 & e | 8 : e]); return r.join("")
                }
            }(), clamp: function (e, t, r) {
                return Math.max(t, Math.min(r, e))
            }, euclideanModulo: function (e, t) {
                return (e % t + t) % t
            }, mapLinear: function (e, t, r, n, i) {
                return n + (e - t) * (i - n) / (r - t)
            }, smoothstep: function (e, t, r) {
                return t >= e ? 0 : e >= r ? 1 : (e = (e - t) / (r - t), e * e * (3 - 2 * e))
            }, smootherstep: function (e, t, r) {
                return t >= e ? 0 : e >= r ? 1 : (e = (e - t) / (r - t), e * e * e * (e * (6 * e - 15) + 10))
            }, random16: function () {
                return (65280 * Math.random() + 255 * Math.random()) / 65535
            }, randInt: function (e, t) {
                return e + Math.floor(Math.random() * (t - e + 1))
            }, randFloat: function (e, t) {
                return e + Math.random() * (t - e)
            }, randFloatSpread: function (e) {
                return e * (.5 - Math.random())
            }, degToRad: function () {
                var e = Math.PI / 180; return function (t) {
                    return t * e
                }
            }(), radToDeg: function () {
                var e = 180 / Math.PI; return function (t) {
                    return t * e
                }
            }(), isPowerOfTwo: function (e) {
                return 0 === (e & e - 1) && 0 !== e
            }, nearestPowerOfTwo: function (e) {
                return Math.pow(2, Math.round(Math.log(e) / Math.LN2))
            }, nextPowerOfTwo: function (e) {
                return e--, e |= e >> 1, e |= e >> 2, e |= e >> 4, e |= e >> 8, e |= e >> 16, e++, e
            }
        }, THREE.Spline = function (e) {
            function t(e, t, r, n, i, o, a) {
                var s = .5 * (r - e), h = .5 * (n - t); return (2 * (t - r) + s + h) * a + (-3 * (t - r) - 2 * s - h) * o + s * i + t
            } this.points = e; var r, n, i, o, a, s, h, c, u, l = [], p = {
                x: 0, y: 0, z: 0
            }; this.initFromArray = function (e) {
                this.points = []; for (var t = 0; t < e.length; t++)this.points[t] = {
                    x: e[t][0], y: e[t][1], z: e[t][2]
                }
            }, this.getPoint = function (e) {
                return r = (this.points.length - 1) * e, n = Math.floor(r), i = r - n, l[0] = 0 === n ? n : n - 1, l[1] = n, l[2] = n > this.points.length - 2 ? this.points.length - 1 : n + 1, l[3] = n > this.points.length - 3 ? this.points.length - 1 : n + 2, s = this.points[l[0]], h = this.points[l[1]], c = this.points[l[2]], u = this.points[l[3]], o = i * i, a = i * o, p.x = t(s.x, h.x, c.x, u.x, i, o, a), p.y = t(s.y, h.y, c.y, u.y, i, o, a), p.z = t(s.z, h.z, c.z, u.z, i, o, a), p
            }, this.getControlPointsArray = function () {
                var e, t, r = this.points.length, n = []; for (e = 0; r > e; e++)t = this.points[e], n[e] = [t.x, t.y, t.z]; return n
            }, this.getLength = function (e) {
                var t, r, n, i, o = 0, a = 0, s = 0, h = new THREE.Vector3, c = new THREE.Vector3, u = [], l = 0; for (u[0] = 0, e || (e = 100), n = this.points.length * e, h.copy(this.points[0]), t = 1; n > t; t++)r = t / n, i = this.getPoint(r), c.copy(i), l += c.distanceTo(h), h.copy(i), o = (this.points.length - 1) * r, a = Math.floor(o), a !== s && (u[a] = l, s = a); return u[u.length] = l, {
                    chunks: u, total: l
                }
            }, this.reparametrizeByArcLength = function (e) {
                var t, r, n, i, o, a, s, h, c = [], u = new THREE.Vector3, l = this.getLength(); for (c.push(u.copy(this.points[0]).clone()), t = 1; t < this.points.length; t++) {
                    for (a = l.chunks[t] - l.chunks[t - 1], s = Math.ceil(e * a / l.total), i = (t - 1) / (this.points.length - 1), o = t / (this.points.length - 1), r = 1; s - 1 > r; r++)n = i + r * (1 / s) * (o - i), h = this.getPoint(n), c.push(u.copy(h).clone()); c.push(u.copy(this.points[t]).clone())
                } this.points = c
            }
        }, THREE.Triangle = function (e, t, r) {
            this.a = void 0 !== e ? e : new THREE.Vector3, this.b = void 0 !== t ? t : new THREE.Vector3, this.c = void 0 !== r ? r : new THREE.Vector3
        }, THREE.Triangle.normal = function () {
            var e = new THREE.Vector3; return function (t, r, n, i) {
                var o = i || new THREE.Vector3; o.subVectors(n, r), e.subVectors(t, r), o.cross(e); var a = o.lengthSq(); return a > 0 ? o.multiplyScalar(1 / Math.sqrt(a)) : o.set(0, 0, 0)
            }
        }(), THREE.Triangle.barycoordFromPoint = function () {
            var e = new THREE.Vector3, t = new THREE.Vector3, r = new THREE.Vector3; return function (n, i, o, a, s) {
                e.subVectors(a, i), t.subVectors(o, i), r.subVectors(n, i); var h = e.dot(e), c = e.dot(t), u = e.dot(r), l = t.dot(t), p = t.dot(r), f = h * l - c * c, d = s || new THREE.Vector3; if (0 === f) return d.set(-2, -1, -1); var E = 1 / f, m = (l * u - c * p) * E, g = (h * p - c * u) * E; return d.set(1 - m - g, g, m)
            }
        }(), THREE.Triangle.containsPoint = function () {
            var e = new THREE.Vector3; return function (t, r, n, i) {
                var o = THREE.Triangle.barycoordFromPoint(t, r, n, i, e); return o.x >= 0 && o.y >= 0 && o.x + o.y <= 1
            }
        }(), THREE.Triangle.prototype = {
            constructor: THREE.Triangle, set: function (e, t, r) {
                return this.a.copy(e), this.b.copy(t), this.c.copy(r), this
            }, setFromPointsAndIndices: function (e, t, r, n) {
                return this.a.copy(e[t]), this.b.copy(e[r]), this.c.copy(e[n]), this
            }, clone: function () {
                return (new this.constructor).copy(this)
            }, copy: function (e) {
                return this.a.copy(e.a), this.b.copy(e.b), this.c.copy(e.c), this
            }, area: function () {
                var e = new THREE.Vector3, t = new THREE.Vector3; return function () {
                    return e.subVectors(this.c, this.b), t.subVectors(this.a, this.b), .5 * e.cross(t).length()
                }
            }(), midpoint: function (e) {
                var t = e || new THREE.Vector3; return t.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3)
            }, normal: function (e) {
                return THREE.Triangle.normal(this.a, this.b, this.c, e)
            }, plane: function (e) {
                var t = e || new THREE.Plane; return t.setFromCoplanarPoints(this.a, this.b, this.c)
            }, barycoordFromPoint: function (e, t) {
                return THREE.Triangle.barycoordFromPoint(e, this.a, this.b, this.c, t)
            }, containsPoint: function (e) {
                return THREE.Triangle.containsPoint(e, this.a, this.b, this.c)
            }, equals: function (e) {
                return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c)
            }
        }, THREE.Channels = function () {
            this.mask = 1
        }, THREE.Channels.prototype = {
            constructor: THREE.Channels, set: function (e) {
                this.mask = 1 << e
            }, enable: function (e) {
                this.mask |= 1 << e
            }, toggle: function (e) {
                this.mask ^= 1 << e
            }, disable: function (e) {
                this.mask &= ~(1 << e)
            }
        }, THREE.Clock = function (e) {
            this.autoStart = void 0 !== e ? e : !0, this.startTime = 0, this.oldTime = 0, this.elapsedTime = 0, this.running = !1
        }, THREE.Clock.prototype = {
            constructor: THREE.Clock, start: function () {
                this.startTime = self.performance.now(), this.oldTime = this.startTime, this.running = !0
            }, stop: function () {
                this.getElapsedTime(), this.running = !1
            }, getElapsedTime: function () {
                return this.getDelta(), this.elapsedTime
            }, getDelta: function () {
                var e = 0; if (this.autoStart && !this.running && this.start(), this.running) {
                    var t = self.performance.now(); e = .001 * (t - this.oldTime), this.oldTime = t, this.elapsedTime += e
                } return e
            }
        }, THREE.EventDispatcher = function () {
        }, THREE.EventDispatcher.prototype = {
            constructor: THREE.EventDispatcher, apply: function (e) {
                e.addEventListener = THREE.EventDispatcher.prototype.addEventListener, e.hasEventListener = THREE.EventDispatcher.prototype.hasEventListener, e.removeEventListener = THREE.EventDispatcher.prototype.removeEventListener, e.dispatchEvent = THREE.EventDispatcher.prototype.dispatchEvent
            }, addEventListener: function (e, t) {
                void 0 === this._listeners && (this._listeners = {}); var r = this._listeners; void 0 === r[e] && (r[e] = []), -1 === r[e].indexOf(t) && r[e].push(t)
            }, hasEventListener: function (e, t) {
                if (void 0 === this._listeners) return !1; var r = this._listeners; return void 0 !== r[e] && -1 !== r[e].indexOf(t) ? !0 : !1
            }, removeEventListener: function (e, t) {
                if (void 0 !== this._listeners) {
                    var r = this._listeners, n = r[e]; if (void 0 !== n) {
                        var i = n.indexOf(t); -1 !== i && n.splice(i, 1)
                    }
                }
            }, dispatchEvent: function (e) {
                if (void 0 !== this._listeners) {
                    var t = this._listeners, r = t[e.type]; if (void 0 !== r) {
                        e.target = this; for (var n = [], i = r.length, o = 0; i > o; o++)n[o] = r[o]; for (var o = 0; i > o; o++)n[o].call(this, e)
                    }
                }
            }
        }, function (e) {
            function t(e, t) {
                return e.distance - t.distance
            } function r(e, t, n, i) {
                if (e.visible !== !1 && (e.raycast(t, n), i === !0)) for (var o = e.children, a = 0, s = o.length; s > a; a++)r(o[a], t, n, !0)
            } e.Raycaster = function (t, r, n, i) {
                this.ray = new e.Ray(t, r), this.near = n || 0, this.far = i || 1 / 0, this.params = {
                    Mesh: {}, Line: {}, LOD: {}, Points: {
                        threshold: 1
                    }, Sprite: {}
                }, Object.defineProperties(this.params, {
                    PointCloud: {
                        get: function () {
                            return console.warn("THREE.Raycaster: params.PointCloud has been renamed to params.Points."), this.Points
                        }
                    }
                })
            }, e.Raycaster.prototype = {
                constructor: e.Raycaster, linePrecision: 1, set: function (e, t) {
                    this.ray.set(e, t)
                }, setFromCamera: function (t, r) {
                    r instanceof e.PerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(r.matrixWorld), this.ray.direction.set(t.x, t.y, .5).unproject(r).sub(this.ray.origin).normalize()) : r instanceof e.OrthographicCamera ? (this.ray.origin.set(t.x, t.y, -1).unproject(r), this.ray.direction.set(0, 0, -1).transformDirection(r.matrixWorld)) : console.error("THREE.Raycaster: Unsupported camera type.")
                }, intersectObject: function (e, n) {
                    var i = []; return r(e, this, i, n), i.sort(t), i
                }, intersectObjects: function (e, n) {
                    var i = []; if (Array.isArray(e) === !1) return console.warn("THREE.Raycaster.intersectObjects: objects is not an Array."), i; for (var o = 0, a = e.length; a > o; o++)r(e[o], this, i, n); return i.sort(t), i
                }
            }
        }(THREE), THREE.Object3D = function () {
            function e() {
                i.setFromEuler(n, !1)
            } function t() {
                n.setFromQuaternion(i, void 0, !1)
            } Object.defineProperty(this, "id", {
                value: THREE.Object3DIdCount++
            }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.type = "Object3D", this.parent = null, this.channels = new THREE.Channels, this.children = [], this.up = THREE.Object3D.DefaultUp.clone(); var r = new THREE.Vector3, n = new THREE.Euler, i = new THREE.Quaternion, o = new THREE.Vector3(1, 1, 1); n.onChange(e), i.onChange(t), Object.defineProperties(this, {
                position: {
                    enumerable: !0, value: r
                }, rotation: {
                    enumerable: !0, value: n
                }, quaternion: {
                    enumerable: !0, value: i
                }, scale: {
                    enumerable: !0, value: o
                }, modelViewMatrix: {
                    value: new THREE.Matrix4
                }, normalMatrix: {
                    value: new THREE.Matrix3
                }
            }), this.rotationAutoUpdate = !0, this.matrix = new THREE.Matrix4, this.matrixWorld = new THREE.Matrix4, this.matrixAutoUpdate = THREE.Object3D.DefaultMatrixAutoUpdate, this.matrixWorldNeedsUpdate = !1, this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.userData = {}
        }, THREE.Object3D.DefaultUp = new THREE.Vector3(0, 1, 0), THREE.Object3D.DefaultMatrixAutoUpdate = !0, THREE.Object3D.prototype = {
            constructor: THREE.Object3D, get eulerOrder() {
                return console.warn("THREE.Object3D: .eulerOrder is now .rotation.order."), this.rotation.order
            }, set eulerOrder(e) {
                console.warn("THREE.Object3D: .eulerOrder is now .rotation.order."), this.rotation.order = e
            }, get useQuaternion() {
                console.warn("THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.")
            }, set useQuaternion(e) {
                console.warn("THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.")
            }, set renderDepth(e) {
                console.warn("THREE.Object3D: .renderDepth has been removed. Use .renderOrder, instead.")
            }, applyMatrix: function (e) {
                this.matrix.multiplyMatrices(e, this.matrix), this.matrix.decompose(this.position, this.quaternion, this.scale)
            }, setRotationFromAxisAngle: function (e, t) {
                this.quaternion.setFromAxisAngle(e, t)
            }, setRotationFromEuler: function (e) {
                this.quaternion.setFromEuler(e, !0)
            }, setRotationFromMatrix: function (e) {
                this.quaternion.setFromRotationMatrix(e)
            }, setRotationFromQuaternion: function (e) {
                this.quaternion.copy(e)
            }, rotateOnAxis: function () {
                var e = new THREE.Quaternion; return function (t, r) {
                    return e.setFromAxisAngle(t, r), this.quaternion.multiply(e), this
                }
            }(), rotateX: function () {
                var e = new THREE.Vector3(1, 0, 0); return function (t) {
                    return this.rotateOnAxis(e, t)
                }
            }(), rotateY: function () {
                var e = new THREE.Vector3(0, 1, 0); return function (t) {
                    return this.rotateOnAxis(e, t)
                }
            }(), rotateZ: function () {
                var e = new THREE.Vector3(0, 0, 1); return function (t) {
                    return this.rotateOnAxis(e, t)
                }
            }(), translateOnAxis: function () {
                var e = new THREE.Vector3; return function (t, r) {
                    return e.copy(t).applyQuaternion(this.quaternion), this.position.add(e.multiplyScalar(r)), this
                }
            }(), translate: function (e, t) {
                return console.warn("THREE.Object3D: .translate() has been removed. Use .translateOnAxis( axis, distance ) instead."), this.translateOnAxis(t, e)
            }, translateX: function () {
                var e = new THREE.Vector3(1, 0, 0); return function (t) {
                    return this.translateOnAxis(e, t)
                }
            }(), translateY: function () {
                var e = new THREE.Vector3(0, 1, 0); return function (t) {
                    return this.translateOnAxis(e, t)
                }
            }(), translateZ: function () {
                var e = new THREE.Vector3(0, 0, 1); return function (t) {
                    return this.translateOnAxis(e, t)
                }
            }(), localToWorld: function (e) {
                return e.applyMatrix4(this.matrixWorld)
            }, worldToLocal: function () {
                var e = new THREE.Matrix4; return function (t) {
                    return t.applyMatrix4(e.getInverse(this.matrixWorld))
                }
            }(), lookAt: function () {
                var e = new THREE.Matrix4; return function (t) {
                    e.lookAt(t, this.position, this.up), this.quaternion.setFromRotationMatrix(e)
                }
            }(), add: function (e) {
                if (arguments.length > 1) {
                    for (var t = 0; t < arguments.length; t++)this.add(arguments[t]); return this
                } return e === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", e), this) : (e instanceof THREE.Object3D ? (null !== e.parent && e.parent.remove(e), e.parent = this, e.dispatchEvent({
                    type: "added"
                }), this.children.push(e)) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", e), this)
            }, remove: function (e) {
                if (arguments.length > 1) for (var t = 0; t < arguments.length; t++)this.remove(arguments[t]); var r = this.children.indexOf(e); -1 !== r && (e.parent = null, e.dispatchEvent({
                    type: "removed"
                }), this.children.splice(r, 1))
            }, getChildByName: function (e) {
                return console.warn("THREE.Object3D: .getChildByName() has been renamed to .getObjectByName()."), this.getObjectByName(e)
            }, getObjectById: function (e) {
                return this.getObjectByProperty("id", e)
            }, getObjectByName: function (e) {
                return this.getObjectByProperty("name", e)
            }, getObjectByProperty: function (e, t) {
                if (this[e] === t) return this; for (var r = 0, n = this.children.length; n > r; r++) {
                    var i = this.children[r], o = i.getObjectByProperty(e, t); if (void 0 !== o) return o
                }
            }, getWorldPosition: function (e) {
                var t = e || new THREE.Vector3; return this.updateMatrixWorld(!0), t.setFromMatrixPosition(this.matrixWorld)
            }, getWorldQuaternion: function () {
                var e = new THREE.Vector3, t = new THREE.Vector3; return function (r) {
                    var n = r || new THREE.Quaternion; return this.updateMatrixWorld(!0), this.matrixWorld.decompose(e, n, t), n
                }
            }(), getWorldRotation: function () {
                var e = new THREE.Quaternion; return function (t) {
                    var r = t || new THREE.Euler; return this.getWorldQuaternion(e), r.setFromQuaternion(e, this.rotation.order, !1)
                }
            }(), getWorldScale: function () {
                var e = new THREE.Vector3, t = new THREE.Quaternion; return function (r) {
                    var n = r || new THREE.Vector3; return this.updateMatrixWorld(!0), this.matrixWorld.decompose(e, t, n), n
                }
            }(), getWorldDirection: function () {
                var e = new THREE.Quaternion; return function (t) {
                    var r = t || new THREE.Vector3; return this.getWorldQuaternion(e), r.set(0, 0, 1).applyQuaternion(e)
                }
            }(), raycast: function () {
            }, traverse: function (e) {
                e(this); for (var t = this.children, r = 0, n = t.length; n > r; r++)t[r].traverse(e)
            }, traverseVisible: function (e) {
                if (this.visible !== !1) {
                    e(this); for (var t = this.children, r = 0, n = t.length; n > r; r++)t[r].traverseVisible(e)
                }
            }, traverseAncestors: function (e) {
                var t = this.parent; null !== t && (e(t), t.traverseAncestors(e))
            }, updateMatrix: function () {
                this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0
            }, updateMatrixWorld: function (e) {
                this.matrixAutoUpdate === !0 && this.updateMatrix(), (this.matrixWorldNeedsUpdate === !0 || e === !0) && (null === this.parent ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix), this.matrixWorldNeedsUpdate = !1, e = !0); for (var t = 0, r = this.children.length; r > t; t++)this.children[t].updateMatrixWorld(e)
            }, toJSON: function (e) {
                function t(e) {
                    var t = []; for (var r in e) {
                        var n = e[r]; delete n.metadata, t.push(n)
                    } return t
                } var r = void 0 === e, n = {}; r && (e = {
                    geometries: {}, materials: {}, textures: {}, images: {}
                }, n.metadata = {
                    version: 4.4, type: "Object", generator: "Object3D.toJSON"
                }); var i = {}; if (i.uuid = this.uuid, i.type = this.type, "" !== this.name && (i.name = this.name), "{}" !== JSON.stringify(this.userData) && (i.userData = this.userData), this.castShadow === !0 && (i.castShadow = !0), this.receiveShadow === !0 && (i.receiveShadow = !0), this.visible === !1 && (i.visible = !1), i.matrix = this.matrix.toArray(), void 0 !== this.geometry && (void 0 === e.geometries[this.geometry.uuid] && (e.geometries[this.geometry.uuid] = this.geometry.toJSON(e)), i.geometry = this.geometry.uuid), void 0 !== this.material && (void 0 === e.materials[this.material.uuid] && (e.materials[this.material.uuid] = this.material.toJSON(e)), i.material = this.material.uuid), this.children.length > 0) {
                    i.children = []; for (var o = 0; o < this.children.length; o++)i.children.push(this.children[o].toJSON(e).object)
                } if (r) {
                    var a = t(e.geometries), s = t(e.materials), h = t(e.textures), c = t(e.images); a.length > 0 && (n.geometries = a), s.length > 0 && (n.materials = s), h.length > 0 && (n.textures = h), c.length > 0 && (n.images = c)
                } return n.object = i, n
            }, clone: function (e) {
                return (new this.constructor).copy(this, e)
            }, copy: function (e, t) {
                if (void 0 === t && (t = !0), this.name = e.name, this.up.copy(e.up), this.position.copy(e.position), this.quaternion.copy(e.quaternion), this.scale.copy(e.scale), this.rotationAutoUpdate = e.rotationAutoUpdate, this.matrix.copy(e.matrix), this.matrixWorld.copy(e.matrixWorld), this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrixWorldNeedsUpdate = e.matrixWorldNeedsUpdate, this.visible = e.visible, this.castShadow = e.castShadow, this.receiveShadow = e.receiveShadow, this.frustumCulled = e.frustumCulled, this.renderOrder = e.renderOrder, this.userData = JSON.parse(JSON.stringify(e.userData)), t === !0) for (var r = 0; r < e.children.length; r++) {
                    var n = e.children[r]; this.add(n.clone())
                } return this
            }
        }, THREE.EventDispatcher.prototype.apply(THREE.Object3D.prototype), THREE.Object3DIdCount = 0, THREE.Face3 = function (e, t, r, n, i, o) {
            this.a = e, this.b = t, this.c = r, this.normal = n instanceof THREE.Vector3 ? n : new THREE.Vector3, this.vertexNormals = Array.isArray(n) ? n : [], this.color = i instanceof THREE.Color ? i : new THREE.Color, this.vertexColors = Array.isArray(i) ? i : [], this.materialIndex = void 0 !== o ? o : 0
        }, THREE.Face3.prototype = {
            constructor: THREE.Face3, clone: function () {
                return (new this.constructor).copy(this)
            }, copy: function (e) {
                this.a = e.a, this.b = e.b, this.c = e.c, this.normal.copy(e.normal), this.color.copy(e.color), this.materialIndex = e.materialIndex; for (var t = 0, r = e.vertexNormals.length; r > t; t++)this.vertexNormals[t] = e.vertexNormals[t].clone(); for (var t = 0, r = e.vertexColors.length; r > t; t++)this.vertexColors[t] = e.vertexColors[t].clone(); return this
            }
        }, THREE.Face4 = function (e, t, r, n, i, o, a) {
            return console.warn("THREE.Face4 has been removed. A THREE.Face3 will be created instead."), new THREE.Face3(e, t, r, i, o, a)
        }, THREE.BufferAttribute = function (e, t) {
            this.uuid = THREE.Math.generateUUID(), this.array = e, this.itemSize = t, this.dynamic = !1, this.updateRange = {
                offset: 0, count: -1
            }, this.version = 0
        }, THREE.BufferAttribute.prototype = {
            constructor: THREE.BufferAttribute, get length() {
                return console.warn("THREE.BufferAttribute: .length has been deprecated. Please use .count."), this.array.length
            }, get count() {
                return this.array.length / this.itemSize
            }, set needsUpdate(e) {
                e === !0 && this.version++
            }, setDynamic: function (e) {
                return this.dynamic = e, this
            }, copy: function (e) {
                return this.array = new e.array.constructor(e.array), this.itemSize = e.itemSize, this.dynamic = e.dynamic, this
            }, copyAt: function (e, t, r) {
                e *= this.itemSize, r *= t.itemSize; for (var n = 0, i = this.itemSize; i > n; n++)this.array[e + n] = t.array[r + n]; return this
            }, copyArray: function (e) {
                return this.array.set(e), this
            }, copyColorsArray: function (e) {
                for (var t = this.array, r = 0, n = 0, i = e.length; i > n; n++) {
                    var o = e[n]; void 0 === o && (console.warn("THREE.BufferAttribute.copyColorsArray(): color is undefined", n), o = new THREE.Color), t[r++] = o.r, t[r++] = o.g, t[r++] = o.b
                } return this
            }, copyIndicesArray: function (e) {
                for (var t = this.array, r = 0, n = 0, i = e.length; i > n; n++) {
                    var o = e[n]; t[r++] = o.a, t[r++] = o.b, t[r++] = o.c
                } return this
            }, copyVector2sArray: function (e) {
                for (var t = this.array, r = 0, n = 0, i = e.length; i > n; n++) {
                    var o = e[n]; void 0 === o && (console.warn("THREE.BufferAttribute.copyVector2sArray(): vector is undefined", n), o = new THREE.Vector2), t[r++] = o.x, t[r++] = o.y
                } return this
            }, copyVector3sArray: function (e) {
                for (var t = this.array, r = 0, n = 0, i = e.length; i > n; n++) {
                    var o = e[n]; void 0 === o && (console.warn("THREE.BufferAttribute.copyVector3sArray(): vector is undefined", n), o = new THREE.Vector3), t[r++] = o.x, t[r++] = o.y, t[r++] = o.z
                } return this
            }, copyVector4sArray: function (e) {
                for (var t = this.array, r = 0, n = 0, i = e.length; i > n; n++) {
                    var o = e[n]; void 0 === o && (console.warn("THREE.BufferAttribute.copyVector4sArray(): vector is undefined", n), o = new THREE.Vector4), t[r++] = o.x, t[r++] = o.y, t[r++] = o.z, t[r++] = o.w
                } return this
            }, set: function (e, t) {
                return void 0 === t && (t = 0), this.array.set(e, t), this
            }, getX: function (e) {
                return this.array[e * this.itemSize]
            }, setX: function (e, t) {
                return this.array[e * this.itemSize] = t, this
            }, getY: function (e) {
                return this.array[e * this.itemSize + 1]
            }, setY: function (e, t) {
                return this.array[e * this.itemSize + 1] = t, this
            }, getZ: function (e) {
                return this.array[e * this.itemSize + 2]
            }, setZ: function (e, t) {
                return this.array[e * this.itemSize + 2] = t, this
            }, getW: function (e) {
                return this.array[e * this.itemSize + 3]
            }, setW: function (e, t) {
                return this.array[e * this.itemSize + 3] = t, this
            }, setXY: function (e, t, r) {
                return e *= this.itemSize, this.array[e + 0] = t, this.array[e + 1] = r, this
            }, setXYZ: function (e, t, r, n) {
                return e *= this.itemSize, this.array[e + 0] = t, this.array[e + 1] = r, this.array[e + 2] = n, this
            }, setXYZW: function (e, t, r, n, i) {
                return e *= this.itemSize, this.array[e + 0] = t, this.array[e + 1] = r, this.array[e + 2] = n, this.array[e + 3] = i, this
            }, clone: function () {
                return (new this.constructor).copy(this)
            }
        }, THREE.Int8Attribute = function (e, t) {
            return new THREE.BufferAttribute(new Int8Array(e), t)
        }, THREE.Uint8Attribute = function (e, t) {
            return new THREE.BufferAttribute(new Uint8Array(e), t)
        }, THREE.Uint8ClampedAttribute = function (e, t) {
            return new THREE.BufferAttribute(new Uint8ClampedArray(e), t)
        }, THREE.Int16Attribute = function (e, t) {
            return new THREE.BufferAttribute(new Int16Array(e), t)
        }, THREE.Uint16Attribute = function (e, t) {
            return new THREE.BufferAttribute(new Uint16Array(e), t)
        }, THREE.Int32Attribute = function (e, t) {
            return new THREE.BufferAttribute(new Int32Array(e), t)
        }, THREE.Uint32Attribute = function (e, t) {
            return new THREE.BufferAttribute(new Uint32Array(e), t)
        }, THREE.Float32Attribute = function (e, t) {
            return new THREE.BufferAttribute(new Float32Array(e), t)
        }, THREE.Float64Attribute = function (e, t) {
            return new THREE.BufferAttribute(new Float64Array(e), t)
        }, THREE.DynamicBufferAttribute = function (e, t) {
            return console.warn("THREE.DynamicBufferAttribute has been removed. Use new THREE.BufferAttribute().setDynamic( true ) instead."), new THREE.BufferAttribute(e, t).setDynamic(!0)
        }, THREE.InstancedBufferAttribute = function (e, t, r) {
            THREE.BufferAttribute.call(this, e, t), this.meshPerAttribute = r || 1
        }, THREE.InstancedBufferAttribute.prototype = Object.create(THREE.BufferAttribute.prototype), THREE.InstancedBufferAttribute.prototype.constructor = THREE.InstancedBufferAttribute, THREE.InstancedBufferAttribute.prototype.copy = function (e) {
            return THREE.BufferAttribute.prototype.copy.call(this, e), this.meshPerAttribute = e.meshPerAttribute, this
        }, THREE.InterleavedBuffer = function (e, t) {
            this.uuid = THREE.Math.generateUUID(), this.array = e, this.stride = t, this.dynamic = !1, this.updateRange = {
                offset: 0, count: -1
            }, this.version = 0
        }, THREE.InterleavedBuffer.prototype = {
            constructor: THREE.InterleavedBuffer, get length() {
                return this.array.length
            }, get count() {
                return this.array.length / this.stride
            }, set needsUpdate(e) {
                e === !0 && this.version++
            }, setDynamic: function (e) {
                return this.dynamic = e, this
            }, copy: function (e) {
                this.array = new e.array.constructor(e.array), this.stride = e.stride, this.dynamic = e.dynamic
            }, copyAt: function (e, t, r) {
                e *= this.stride, r *= t.stride; for (var n = 0, i = this.stride; i > n; n++)this.array[e + n] = t.array[r + n]; return this
            }, set: function (e, t) {
                return void 0 === t && (t = 0), this.array.set(e, t), this
            }, clone: function () {
                return (new this.constructor).copy(this)
            }
        }, THREE.InstancedInterleavedBuffer = function (e, t, r) {
            THREE.InterleavedBuffer.call(this, e, t), this.meshPerAttribute = r || 1
        }, THREE.InstancedInterleavedBuffer.prototype = Object.create(THREE.InterleavedBuffer.prototype), THREE.InstancedInterleavedBuffer.prototype.constructor = THREE.InstancedInterleavedBuffer, THREE.InstancedInterleavedBuffer.prototype.copy = function (e) {
            return THREE.InterleavedBuffer.prototype.copy.call(this, e), this.meshPerAttribute = e.meshPerAttribute, this
        }, THREE.InterleavedBufferAttribute = function (e, t, r) {
            this.uuid = THREE.Math.generateUUID(), this.data = e, this.itemSize = t, this.offset = r
        }, THREE.InterleavedBufferAttribute.prototype = {
            constructor: THREE.InterleavedBufferAttribute, get length() {
                return console.warn("THREE.BufferAttribute: .length has been deprecated. Please use .count."), this.array.length
            }, get count() {
                return this.data.array.length / this.data.stride
            }, setX: function (e, t) {
                return this.data.array[e * this.data.stride + this.offset] = t, this
            }, setY: function (e, t) {
                return this.data.array[e * this.data.stride + this.offset + 1] = t, this
            }, setZ: function (e, t) {
                return this.data.array[e * this.data.stride + this.offset + 2] = t, this
            }, setW: function (e, t) {
                return this.data.array[e * this.data.stride + this.offset + 3] = t, this
            }, getX: function (e) {
                return this.data.array[e * this.data.stride + this.offset]
            }, getY: function (e) {
                return this.data.array[e * this.data.stride + this.offset + 1]
            }, getZ: function (e) {
                return this.data.array[e * this.data.stride + this.offset + 2]
            }, getW: function (e) {
                return this.data.array[e * this.data.stride + this.offset + 3]
            }, setXY: function (e, t, r) {
                return e = e * this.data.stride + this.offset, this.data.array[e + 0] = t, this.data.array[e + 1] = r, this
            }, setXYZ: function (e, t, r, n) {
                return e = e * this.data.stride + this.offset, this.data.array[e + 0] = t, this.data.array[e + 1] = r, this.data.array[e + 2] = n, this
            }, setXYZW: function (e, t, r, n, i) {
                return e = e * this.data.stride + this.offset, this.data.array[e + 0] = t, this.data.array[e + 1] = r, this.data.array[e + 2] = n, this.data.array[e + 3] = i, this
            }
        }, THREE.Geometry = function () {
            Object.defineProperty(this, "id", {
                value: THREE.GeometryIdCount++
            }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.type = "Geometry", this.vertices = [], this.colors = [], this.faces = [], this.faceVertexUvs = [[]], this.morphTargets = [], this.morphNormals = [], this.skinWeights = [], this.skinIndices = [], this.lineDistances = [], this.boundingBox = null, this.boundingSphere = null, this.verticesNeedUpdate = !1, this.elementsNeedUpdate = !1, this.uvsNeedUpdate = !1, this.normalsNeedUpdate = !1, this.colorsNeedUpdate = !1, this.lineDistancesNeedUpdate = !1, this.groupsNeedUpdate = !1
        }, THREE.Geometry.prototype = {
            constructor: THREE.Geometry, applyMatrix: function (e) {
                for (var t = (new THREE.Matrix3).getNormalMatrix(e), r = 0, n = this.vertices.length; n > r; r++) {
                    var i = this.vertices[r]; i.applyMatrix4(e)
                } for (var r = 0, n = this.faces.length; n > r; r++) {
                    var o = this.faces[r]; o.normal.applyMatrix3(t).normalize(); for (var a = 0, s = o.vertexNormals.length; s > a; a++)o.vertexNormals[a].applyMatrix3(t).normalize()
                } null !== this.boundingBox && this.computeBoundingBox(), null !== this.boundingSphere && this.computeBoundingSphere(), this.verticesNeedUpdate = !0, this.normalsNeedUpdate = !0
            }, rotateX: function () {
                var e; return function (t) {
                    return void 0 === e && (e = new THREE.Matrix4), e.makeRotationX(t), this.applyMatrix(e), this
                }
            }(), rotateY: function () {
                var e; return function (t) {
                    return void 0 === e && (e = new THREE.Matrix4), e.makeRotationY(t), this.applyMatrix(e), this
                }
            }(), rotateZ: function () {
                var e; return function (t) {
                    return void 0 === e && (e = new THREE.Matrix4), e.makeRotationZ(t), this.applyMatrix(e), this
                }
            }(), translate: function () {
                var e; return function (t, r, n) {
                    return void 0 === e && (e = new THREE.Matrix4), e.makeTranslation(t, r, n), this.applyMatrix(e), this
                }
            }(), scale: function () {
                var e; return function (t, r, n) {
                    return void 0 === e && (e = new THREE.Matrix4), e.makeScale(t, r, n), this.applyMatrix(e), this
                }
            }(), lookAt: function () {
                var e; return function (t) {
                    void 0 === e && (e = new THREE.Object3D), e.lookAt(t), e.updateMatrix(), this.applyMatrix(e.matrix)
                }
            }(), fromBufferGeometry: function (e) {
                function t(e, t, n) {
                    var i = void 0 !== a ? [u[e].clone(), u[t].clone(), u[n].clone()] : [], o = void 0 !== s ? [r.colors[e].clone(), r.colors[t].clone(), r.colors[n].clone()] : [], f = new THREE.Face3(e, t, n, i, o); r.faces.push(f), void 0 !== h && r.faceVertexUvs[0].push([l[e].clone(), l[t].clone(), l[n].clone()]), void 0 !== c && r.faceVertexUvs[1].push([p[e].clone(), p[t].clone(), p[n].clone()])
                } var r = this, n = null !== e.index ? e.index.array : void 0, i = e.attributes, o = i.position.array, a = void 0 !== i.normal ? i.normal.array : void 0, s = void 0 !== i.color ? i.color.array : void 0, h = void 0 !== i.uv ? i.uv.array : void 0, c = void 0 !== i.uv2 ? i.uv2.array : void 0; void 0 !== c && (this.faceVertexUvs[1] = []); for (var u = [], l = [], p = [], f = 0, d = 0, E = 0; f < o.length; f += 3, d += 2, E += 4)r.vertices.push(new THREE.Vector3(o[f], o[f + 1], o[f + 2])), void 0 !== a && u.push(new THREE.Vector3(a[f], a[f + 1], a[f + 2])), void 0 !== s && r.colors.push(new THREE.Color(s[f], s[f + 1], s[f + 2])), void 0 !== h && l.push(new THREE.Vector2(h[d], h[d + 1])), void 0 !== c && p.push(new THREE.Vector2(c[d], c[d + 1])); if (void 0 !== n) {
                    var m = e.groups; if (m.length > 0) for (var f = 0; f < m.length; f++)for (var g = m[f], v = g.start, T = g.count, d = v, y = v + T; y > d; d += 3)t(n[d], n[d + 1], n[d + 2]); else for (var f = 0; f < n.length; f += 3)t(n[f], n[f + 1], n[f + 2])
                } else for (var f = 0; f < o.length / 3; f += 3)t(f, f + 1, f + 2); return this.computeFaceNormals(), null !== e.boundingBox && (this.boundingBox = e.boundingBox.clone()), null !== e.boundingSphere && (this.boundingSphere = e.boundingSphere.clone()), this
            }, center: function () {
                this.computeBoundingBox(); var e = this.boundingBox.center().negate(); return this.translate(e.x, e.y, e.z), e
            }, normalize: function () {
                this.computeBoundingSphere(); var e = this.boundingSphere.center, t = this.boundingSphere.radius, r = 0 === t ? 1 : 1 / t, n = new THREE.Matrix4; return n.set(r, 0, 0, -r * e.x, 0, r, 0, -r * e.y, 0, 0, r, -r * e.z, 0, 0, 0, 1), this.applyMatrix(n), this
            }, computeFaceNormals: function () {
                for (var e = new THREE.Vector3, t = new THREE.Vector3, r = 0, n = this.faces.length; n > r; r++) {
                    var i = this.faces[r], o = this.vertices[i.a], a = this.vertices[i.b], s = this.vertices[i.c]; e.subVectors(s, a), t.subVectors(o, a), e.cross(t), e.normalize(), i.normal.copy(e)
                }
            }, computeVertexNormals: function (e) {
                var t, r, n, i, o, a; for (a = new Array(this.vertices.length), t = 0, r = this.vertices.length; r > t; t++)a[t] = new THREE.Vector3; if (e) {
                    var s, h, c, u = new THREE.Vector3, l = new THREE.Vector3; for (n = 0, i = this.faces.length; i > n; n++)o = this.faces[n], s = this.vertices[o.a], h = this.vertices[o.b], c = this.vertices[o.c], u.subVectors(c, h), l.subVectors(s, h), u.cross(l), a[o.a].add(u), a[o.b].add(u), a[o.c].add(u)
                } else for (n = 0, i = this.faces.length; i > n; n++)o = this.faces[n], a[o.a].add(o.normal), a[o.b].add(o.normal), a[o.c].add(o.normal); for (t = 0, r = this.vertices.length; r > t; t++)a[t].normalize(); for (n = 0, i = this.faces.length; i > n; n++) {
                    o = this.faces[n]; var p = o.vertexNormals; 3 === p.length ? (p[0].copy(a[o.a]), p[1].copy(a[o.b]), p[2].copy(a[o.c])) : (p[0] = a[o.a].clone(), p[1] = a[o.b].clone(), p[2] = a[o.c].clone())
                }
            }, computeMorphNormals: function () {
                var e, t, r, n, i; for (r = 0, n = this.faces.length; n > r; r++)for (i = this.faces[r], i.__originalFaceNormal ? i.__originalFaceNormal.copy(i.normal) : i.__originalFaceNormal = i.normal.clone(), i.__originalVertexNormals || (i.__originalVertexNormals = []), e = 0, t = i.vertexNormals.length; t > e; e++)i.__originalVertexNormals[e] ? i.__originalVertexNormals[e].copy(i.vertexNormals[e]) : i.__originalVertexNormals[e] = i.vertexNormals[e].clone();
                var o = new THREE.Geometry; for (o.faces = this.faces, e = 0, t = this.morphTargets.length; t > e; e++) {
                    if (!this.morphNormals[e]) {
                        this.morphNormals[e] = {}, this.morphNormals[e].faceNormals = [], this.morphNormals[e].vertexNormals = []; var a, s, h = this.morphNormals[e].faceNormals, c = this.morphNormals[e].vertexNormals; for (r = 0, n = this.faces.length; n > r; r++)a = new THREE.Vector3, s = {
                            a: new THREE.Vector3, b: new THREE.Vector3, c: new THREE.Vector3
                        }, h.push(a), c.push(s)
                    } var u = this.morphNormals[e]; o.vertices = this.morphTargets[e].vertices, o.computeFaceNormals(), o.computeVertexNormals(); var a, s; for (r = 0, n = this.faces.length; n > r; r++)i = this.faces[r], a = u.faceNormals[r], s = u.vertexNormals[r], a.copy(i.normal), s.a.copy(i.vertexNormals[0]), s.b.copy(i.vertexNormals[1]), s.c.copy(i.vertexNormals[2])
                } for (r = 0, n = this.faces.length; n > r; r++)i = this.faces[r], i.normal = i.__originalFaceNormal, i.vertexNormals = i.__originalVertexNormals
            }, computeTangents: function () {
                console.warn("THREE.Geometry: .computeTangents() has been removed.")
            }, computeLineDistances: function () {
                for (var e = 0, t = this.vertices, r = 0, n = t.length; n > r; r++)r > 0 && (e += t[r].distanceTo(t[r - 1])), this.lineDistances[r] = e
            }, computeBoundingBox: function () {
                null === this.boundingBox && (this.boundingBox = new THREE.Box3), this.boundingBox.setFromPoints(this.vertices)
            }, computeBoundingSphere: function () {
                null === this.boundingSphere && (this.boundingSphere = new THREE.Sphere), this.boundingSphere.setFromPoints(this.vertices)
            }, merge: function (e, t, r) {
                if (e instanceof THREE.Geometry == !1) return void console.error("THREE.Geometry.merge(): geometry not an instance of THREE.Geometry.", e); var n, i = this.vertices.length, o = this.vertices, a = e.vertices, s = this.faces, h = e.faces, c = this.faceVertexUvs[0], u = e.faceVertexUvs[0]; void 0 === r && (r = 0), void 0 !== t && (n = (new THREE.Matrix3).getNormalMatrix(t)); for (var l = 0, p = a.length; p > l; l++) {
                    var f = a[l], d = f.clone(); void 0 !== t && d.applyMatrix4(t), o.push(d)
                } for (l = 0, p = h.length; p > l; l++) {
                    var E, m, g, v = h[l], T = v.vertexNormals, y = v.vertexColors; E = new THREE.Face3(v.a + i, v.b + i, v.c + i), E.normal.copy(v.normal), void 0 !== n && E.normal.applyMatrix3(n).normalize(); for (var R = 0, x = T.length; x > R; R++)m = T[R].clone(), void 0 !== n && m.applyMatrix3(n).normalize(), E.vertexNormals.push(m); E.color.copy(v.color); for (var R = 0, x = y.length; x > R; R++)g = y[R], E.vertexColors.push(g.clone()); E.materialIndex = v.materialIndex + r, s.push(E)
                } for (l = 0, p = u.length; p > l; l++) {
                    var H = u[l], b = []; if (void 0 !== H) {
                        for (var R = 0, x = H.length; x > R; R++)b.push(H[R].clone()); c.push(b)
                    }
                }
            }, mergeMesh: function (e) {
                return e instanceof THREE.Mesh == !1 ? void console.error("THREE.Geometry.mergeMesh(): mesh not an instance of THREE.Mesh.", e) : (e.matrixAutoUpdate && e.updateMatrix(), void this.merge(e.geometry, e.matrix))
            }, mergeVertices: function () {
                var e, t, r, n, i, o, a, s, h = {}, c = [], u = [], l = 4, p = Math.pow(10, l); for (r = 0, n = this.vertices.length; n > r; r++)e = this.vertices[r], t = Math.round(e.x * p) + "_" + Math.round(e.y * p) + "_" + Math.round(e.z * p), void 0 === h[t] ? (h[t] = r, c.push(this.vertices[r]), u[r] = c.length - 1) : u[r] = u[h[t]]; var f = []; for (r = 0, n = this.faces.length; n > r; r++) {
                    i = this.faces[r], i.a = u[i.a], i.b = u[i.b], i.c = u[i.c], o = [i.a, i.b, i.c]; for (var d = -1, E = 0; 3 > E; E++)if (o[E] === o[(E + 1) % 3]) {
                        d = E, f.push(r); break
                    }
                } for (r = f.length - 1; r >= 0; r--) {
                    var m = f[r]; for (this.faces.splice(m, 1), a = 0, s = this.faceVertexUvs.length; s > a; a++)this.faceVertexUvs[a].splice(m, 1)
                } var g = this.vertices.length - c.length; return this.vertices = c, g
            }, sortFacesByMaterialIndex: function () {
                function e(e, t) {
                    return e.materialIndex - t.materialIndex
                } for (var t = this.faces, r = t.length, n = 0; r > n; n++)t[n]._id = n; t.sort(e); var i, o, a = this.faceVertexUvs[0], s = this.faceVertexUvs[1]; a && a.length === r && (i = []), s && s.length === r && (o = []); for (var n = 0; r > n; n++) {
                    var h = t[n]._id; i && i.push(a[h]), o && o.push(s[h])
                } i && (this.faceVertexUvs[0] = i), o && (this.faceVertexUvs[1] = o)
            }, toJSON: function () {
                function e(e, t, r) {
                    return r ? e | 1 << t : e & ~(1 << t)
                } function t(e) {
                    var t = e.x.toString() + e.y.toString() + e.z.toString(); return void 0 !== p[t] ? p[t] : (p[t] = l.length / 3, l.push(e.x, e.y, e.z), p[t])
                } function r(e) {
                    var t = e.r.toString() + e.g.toString() + e.b.toString(); return void 0 !== d[t] ? d[t] : (d[t] = f.length, f.push(e.getHex()), d[t])
                } function n(e) {
                    var t = e.x.toString() + e.y.toString(); return void 0 !== m[t] ? m[t] : (m[t] = E.length / 2, E.push(e.x, e.y), m[t])
                } var i = {
                    metadata: {
                        version: 4.4, type: "Geometry", generator: "Geometry.toJSON"
                    }
                }; if (i.uuid = this.uuid, i.type = this.type, "" !== this.name && (i.name = this.name), void 0 !== this.parameters) {
                    var o = this.parameters; for (var a in o) void 0 !== o[a] && (i[a] = o[a]); return i
                } for (var s = [], h = 0; h < this.vertices.length; h++) {
                    var c = this.vertices[h]; s.push(c.x, c.y, c.z)
                } for (var u = [], l = [], p = {}, f = [], d = {}, E = [], m = {}, h = 0; h < this.faces.length; h++) {
                    var g = this.faces[h], v = !1, T = !1, y = void 0 !== this.faceVertexUvs[0][h], R = g.normal.length() > 0, x = g.vertexNormals.length > 0, H = 1 !== g.color.r || 1 !== g.color.g || 1 !== g.color.b, b = g.vertexColors.length > 0, w = 0; if (w = e(w, 0, 0), w = e(w, 1, v), w = e(w, 2, T), w = e(w, 3, y), w = e(w, 4, R), w = e(w, 5, x), w = e(w, 6, H), w = e(w, 7, b), u.push(w), u.push(g.a, g.b, g.c), y) {
                        var M = this.faceVertexUvs[0][h]; u.push(n(M[0]), n(M[1]), n(M[2]))
                    } if (R && u.push(t(g.normal)), x) {
                        var S = g.vertexNormals; u.push(t(S[0]), t(S[1]), t(S[2]))
                    } if (H && u.push(r(g.color)), b) {
                        var _ = g.vertexColors; u.push(r(_[0]), r(_[1]), r(_[2]))
                    }
                } return i.data = {}, i.data.vertices = s, i.data.normals = l, f.length > 0 && (i.data.colors = f), E.length > 0 && (i.data.uvs = [E]), i.data.faces = u, i
            }, clone: function () {
                return (new this.constructor).copy(this)
            }, copy: function (e) {
                this.vertices = [], this.faces = [], this.faceVertexUvs = [[]]; for (var t = e.vertices, r = 0, n = t.length; n > r; r++)this.vertices.push(t[r].clone()); for (var i = e.faces, r = 0, n = i.length; n > r; r++)this.faces.push(i[r].clone()); for (var r = 0, n = e.faceVertexUvs.length; n > r; r++) {
                    var o = e.faceVertexUvs[r]; void 0 === this.faceVertexUvs[r] && (this.faceVertexUvs[r] = []); for (var a = 0, s = o.length; s > a; a++) {
                        for (var h = o[a], c = [], u = 0, l = h.length; l > u; u++) {
                            var p = h[u]; c.push(p.clone())
                        } this.faceVertexUvs[r].push(c)
                    }
                } return this
            }, dispose: function () {
                this.dispatchEvent({
                    type: "dispose"
                })
            }
        }, THREE.EventDispatcher.prototype.apply(THREE.Geometry.prototype), THREE.GeometryIdCount = 0, THREE.DirectGeometry = function () {
            Object.defineProperty(this, "id", {
                value: THREE.GeometryIdCount++
            }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.type = "DirectGeometry", this.indices = [], this.vertices = [], this.normals = [], this.colors = [], this.uvs = [], this.uvs2 = [], this.groups = [], this.morphTargets = {}, this.skinWeights = [], this.skinIndices = [], this.boundingBox = null, this.boundingSphere = null, this.verticesNeedUpdate = !1, this.normalsNeedUpdate = !1, this.colorsNeedUpdate = !1, this.uvsNeedUpdate = !1, this.groupsNeedUpdate = !1
        }, THREE.DirectGeometry.prototype = {
            constructor: THREE.DirectGeometry, computeBoundingBox: THREE.Geometry.prototype.computeBoundingBox, computeBoundingSphere: THREE.Geometry.prototype.computeBoundingSphere, computeFaceNormals: function () {
                console.warn("THREE.DirectGeometry: computeFaceNormals() is not a method of this type of geometry.")
            }, computeVertexNormals: function () {
                console.warn("THREE.DirectGeometry: computeVertexNormals() is not a method of this type of geometry.")
            }, computeGroups: function (e) {
                for (var t, r, n = [], i = e.faces, o = 0; o < i.length; o++) {
                    var a = i[o]; a.materialIndex !== r && (r = a.materialIndex, void 0 !== t && (t.count = 3 * o - t.start, n.push(t)), t = {
                        start: 3 * o, materialIndex: r
                    })
                } void 0 !== t && (t.count = 3 * o - t.start, n.push(t)), this.groups = n
            }, fromGeometry: function (e) {
                var t = e.faces, r = e.vertices, n = e.faceVertexUvs, i = n[0] && n[0].length > 0, o = n[1] && n[1].length > 0, a = e.morphTargets, s = a.length; if (s > 0) {
                    for (var h = [], c = 0; s > c; c++)h[c] = []; this.morphTargets.position = h
                } var u = e.morphNormals, l = u.length; if (l > 0) {
                    for (var p = [], c = 0; l > c; c++)p[c] = []; this.morphTargets.normal = p
                } for (var f = e.skinIndices, d = e.skinWeights, E = f.length === r.length, m = d.length === r.length, c = 0; c < t.length; c++) {
                    var g = t[c]; this.vertices.push(r[g.a], r[g.b], r[g.c]); var v = g.vertexNormals; if (3 === v.length) this.normals.push(v[0], v[1], v[2]); else {
                        var T = g.normal; this.normals.push(T, T, T)
                    } var y = g.vertexColors; if (3 === y.length) this.colors.push(y[0], y[1], y[2]); else {
                        var R = g.color; this.colors.push(R, R, R)
                    } if (i === !0) {
                        var x = n[0][c]; void 0 !== x ? this.uvs.push(x[0], x[1], x[2]) : (console.warn("THREE.DirectGeometry.fromGeometry(): Undefined vertexUv ", c), this.uvs.push(new THREE.Vector2, new THREE.Vector2, new THREE.Vector2))
                    } if (o === !0) {
                        var x = n[1][c]; void 0 !== x ? this.uvs2.push(x[0], x[1], x[2]) : (console.warn("THREE.DirectGeometry.fromGeometry(): Undefined vertexUv2 ", c), this.uvs2.push(new THREE.Vector2, new THREE.Vector2, new THREE.Vector2))
                    } for (var H = 0; s > H; H++) {
                        var b = a[H].vertices; h[H].push(b[g.a], b[g.b], b[g.c])
                    } for (var H = 0; l > H; H++) {
                        var w = u[H].vertexNormals[c]; p[H].push(w.a, w.b, w.c)
                    } E && this.skinIndices.push(f[g.a], f[g.b], f[g.c]), m && this.skinWeights.push(d[g.a], d[g.b], d[g.c])
                } return this.computeGroups(e), this.verticesNeedUpdate = e.verticesNeedUpdate, this.normalsNeedUpdate = e.normalsNeedUpdate, this.colorsNeedUpdate = e.colorsNeedUpdate, this.uvsNeedUpdate = e.uvsNeedUpdate, this.groupsNeedUpdate = e.groupsNeedUpdate, this
            }, dispose: function () {
                this.dispatchEvent({
                    type: "dispose"
                })
            }
        }, THREE.EventDispatcher.prototype.apply(THREE.DirectGeometry.prototype), THREE.BufferGeometry = function () {
            Object.defineProperty(this, "id", {
                value: THREE.GeometryIdCount++
            }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.type = "BufferGeometry", this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = {
                start: 0, count: 1 / 0
            }
        }, THREE.BufferGeometry.prototype = {
            constructor: THREE.BufferGeometry, addIndex: function (e) {
                console.warn("THREE.BufferGeometry: .addIndex() has been renamed to .setIndex()."), this.setIndex(e)
            }, getIndex: function () {
                return this.index
            }, setIndex: function (e) {
                this.index = e
            }, addAttribute: function (e, t) {
                return t instanceof THREE.BufferAttribute == !1 && t instanceof THREE.InterleavedBufferAttribute == !1 ? (console.warn("THREE.BufferGeometry: .addAttribute() now expects ( name, attribute )."), void this.addAttribute(e, new THREE.BufferAttribute(arguments[1], arguments[2]))) : "index" === e ? (console.warn("THREE.BufferGeometry.addAttribute: Use .setIndex() for index attribute."), void this.setIndex(t)) : void (this.attributes[e] = t)
            }, getAttribute: function (e) {
                return this.attributes[e]
            }, removeAttribute: function (e) {
                delete this.attributes[e]
            }, get drawcalls() {
                return console.error("THREE.BufferGeometry: .drawcalls has been renamed to .groups."), this.groups
            }, get offsets() {
                return console.warn("THREE.BufferGeometry: .offsets has been renamed to .groups."), this.groups
            }, addDrawCall: function (e, t, r) {
                void 0 !== r && console.warn("THREE.BufferGeometry: .addDrawCall() no longer supports indexOffset."), console.warn("THREE.BufferGeometry: .addDrawCall() is now .addGroup()."), this.addGroup(e, t)
            }, clearDrawCalls: function () {
                console.warn("THREE.BufferGeometry: .clearDrawCalls() is now .clearGroups()."), this.clearGroups()
            }, addGroup: function (e, t, r) {
                this.groups.push({
                    start: e, count: t, materialIndex: void 0 !== r ? r : 0
                })
            }, clearGroups: function () {
                this.groups = []
            }, setDrawRange: function (e, t) {
                this.drawRange.start = e, this.drawRange.count = t
            }, applyMatrix: function (e) {
                var t = this.attributes.position; void 0 !== t && (e.applyToVector3Array(t.array), t.needsUpdate = !0); var r = this.attributes.normal; if (void 0 !== r) {
                    var n = (new THREE.Matrix3).getNormalMatrix(e); n.applyToVector3Array(r.array), r.needsUpdate = !0
                } null !== this.boundingBox && this.computeBoundingBox(), null !== this.boundingSphere && this.computeBoundingSphere()
            }, rotateX: function () {
                var e; return function (t) {
                    return void 0 === e && (e = new THREE.Matrix4), e.makeRotationX(t), this.applyMatrix(e), this
                }
            }(), rotateY: function () {
                var e; return function (t) {
                    return void 0 === e && (e = new THREE.Matrix4), e.makeRotationY(t), this.applyMatrix(e), this
                }
            }(), rotateZ: function () {
                var e; return function (t) {
                    return void 0 === e && (e = new THREE.Matrix4), e.makeRotationZ(t), this.applyMatrix(e), this
                }
            }(), translate: function () {
                var e; return function (t, r, n) {
                    return void 0 === e && (e = new THREE.Matrix4), e.makeTranslation(t, r, n), this.applyMatrix(e), this
                }
            }(), scale: function () {
                var e; return function (t, r, n) {
                    return void 0 === e && (e = new THREE.Matrix4), e.makeScale(t, r, n), this.applyMatrix(e), this
                }
            }(), lookAt: function () {
                var e; return function (t) {
                    void 0 === e && (e = new THREE.Object3D), e.lookAt(t), e.updateMatrix(), this.applyMatrix(e.matrix)
                }
            }(), center: function () {
                this.computeBoundingBox(); var e = this.boundingBox.center().negate(); return this.translate(e.x, e.y, e.z), e
            }, setFromObject: function (e) {
                var t = e.geometry; if (e instanceof THREE.Points || e instanceof THREE.Line) {
                    var r = new THREE.Float32Attribute(3 * t.vertices.length, 3), n = new THREE.Float32Attribute(3 * t.colors.length, 3); if (this.addAttribute("position", r.copyVector3sArray(t.vertices)), this.addAttribute("color", n.copyColorsArray(t.colors)), t.lineDistances && t.lineDistances.length === t.vertices.length) {
                        var i = new THREE.Float32Attribute(t.lineDistances.length, 1); this.addAttribute("lineDistance", i.copyArray(t.lineDistances))
                    } null !== t.boundingSphere && (this.boundingSphere = t.boundingSphere.clone()), null !== t.boundingBox && (this.boundingBox = t.boundingBox.clone())
                } else e instanceof THREE.Mesh && t instanceof THREE.Geometry && this.fromGeometry(t); return this
            }, updateFromObject: function (e) {
                var t = e.geometry; if (e instanceof THREE.Mesh) {
                    var r = t.__directGeometry; if (void 0 === r) return this.fromGeometry(t); r.verticesNeedUpdate = t.verticesNeedUpdate, r.normalsNeedUpdate = t.normalsNeedUpdate, r.colorsNeedUpdate = t.colorsNeedUpdate, r.uvsNeedUpdate = t.uvsNeedUpdate, r.groupsNeedUpdate = t.groupsNeedUpdate, t.verticesNeedUpdate = !1, t.normalsNeedUpdate = !1, t.colorsNeedUpdate = !1, t.uvsNeedUpdate = !1, t.groupsNeedUpdate = !1, t = r
                } if (t.verticesNeedUpdate === !0) {
                    var n = this.attributes.position; void 0 !== n && (n.copyVector3sArray(t.vertices), n.needsUpdate = !0), t.verticesNeedUpdate = !1
                } if (t.normalsNeedUpdate === !0) {
                    var n = this.attributes.normal; void 0 !== n && (n.copyVector3sArray(t.normals), n.needsUpdate = !0), t.normalsNeedUpdate = !1
                } if (t.colorsNeedUpdate === !0) {
                    var n = this.attributes.color; void 0 !== n && (n.copyColorsArray(t.colors), n.needsUpdate = !0), t.colorsNeedUpdate = !1
                } if (t.uvsNeedUpdate) {
                    var n = this.attributes.uv; void 0 !== n && (n.copyVector2sArray(t.uvs), n.needsUpdate = !0), t.uvsNeedUpdate = !1
                } if (t.lineDistancesNeedUpdate) {
                    var n = this.attributes.lineDistance; void 0 !== n && (n.copyArray(t.lineDistances), n.needsUpdate = !0), t.lineDistancesNeedUpdate = !1
                } return t.groupsNeedUpdate && (t.computeGroups(e.geometry), this.groups = t.groups, t.groupsNeedUpdate = !1), this
            }, fromGeometry: function (e) {
                return e.__directGeometry = (new THREE.DirectGeometry).fromGeometry(e), this.fromDirectGeometry(e.__directGeometry)
            }, fromDirectGeometry: function (e) {
                var t = new Float32Array(3 * e.vertices.length); if (this.addAttribute("position", new THREE.BufferAttribute(t, 3).copyVector3sArray(e.vertices)), e.normals.length > 0) {
                    var r = new Float32Array(3 * e.normals.length); this.addAttribute("normal", new THREE.BufferAttribute(r, 3).copyVector3sArray(e.normals))
                } if (e.colors.length > 0) {
                    var n = new Float32Array(3 * e.colors.length); this.addAttribute("color", new THREE.BufferAttribute(n, 3).copyColorsArray(e.colors))
                } if (e.uvs.length > 0) {
                    var i = new Float32Array(2 * e.uvs.length); this.addAttribute("uv", new THREE.BufferAttribute(i, 2).copyVector2sArray(e.uvs))
                } if (e.uvs2.length > 0) {
                    var o = new Float32Array(2 * e.uvs2.length); this.addAttribute("uv2", new THREE.BufferAttribute(o, 2).copyVector2sArray(e.uvs2))
                } if (e.indices.length > 0) {
                    var a = e.vertices.length > 65535 ? Uint32Array : Uint16Array, s = new a(3 * e.indices.length); this.setIndex(new THREE.BufferAttribute(s, 1).copyIndicesArray(e.indices))
                } this.groups = e.groups; for (var h in e.morphTargets) {
                    for (var c = [], u = e.morphTargets[h], l = 0, p = u.length; p > l; l++) {
                        var f = u[l], d = new THREE.Float32Attribute(3 * f.length, 3); c.push(d.copyVector3sArray(f))
                    } this.morphAttributes[h] = c
                } if (e.skinIndices.length > 0) {
                    var E = new THREE.Float32Attribute(4 * e.skinIndices.length, 4); this.addAttribute("skinIndex", E.copyVector4sArray(e.skinIndices))
                } if (e.skinWeights.length > 0) {
                    var m = new THREE.Float32Attribute(4 * e.skinWeights.length, 4); this.addAttribute("skinWeight", m.copyVector4sArray(e.skinWeights))
                } return null !== e.boundingSphere && (this.boundingSphere = e.boundingSphere.clone()), null !== e.boundingBox && (this.boundingBox = e.boundingBox.clone()), this
            }, computeBoundingBox: function () {
                var e = new THREE.Vector3; return function () {
                    null === this.boundingBox && (this.boundingBox = new THREE.Box3); var t = this.attributes.position.array; if (t) {
                        var r = this.boundingBox; r.makeEmpty(); for (var n = 0, i = t.length; i > n; n += 3)e.fromArray(t, n), r.expandByPoint(e)
                    } (void 0 === t || 0 === t.length) && (this.boundingBox.min.set(0, 0, 0), this.boundingBox.max.set(0, 0, 0)), (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox: Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this)
                }
            }(), computeBoundingSphere: function () {
                var e = new THREE.Box3, t = new THREE.Vector3; return function () {
                    null === this.boundingSphere && (this.boundingSphere = new THREE.Sphere); var r = this.attributes.position.array; if (r) {
                        e.makeEmpty(); for (var n = this.boundingSphere.center, i = 0, o = r.length; o > i; i += 3)t.fromArray(r, i), e.expandByPoint(t); e.center(n); for (var a = 0, i = 0, o = r.length; o > i; i += 3)t.fromArray(r, i), a = Math.max(a, n.distanceToSquared(t)); this.boundingSphere.radius = Math.sqrt(a), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this)
                    }
                }
            }(), computeFaceNormals: function () {
            }, computeVertexNormals: function () {
                var e = this.index, t = this.attributes, r = this.groups; if (t.position) {
                    var n = t.position.array; if (void 0 === t.normal) this.addAttribute("normal", new THREE.BufferAttribute(new Float32Array(n.length), 3)); else for (var i = t.normal.array, o = 0, a = i.length; a > o; o++)i[o] = 0; var s, h, c, i = t.normal.array, u = new THREE.Vector3, l = new THREE.Vector3, p = new THREE.Vector3, f = new THREE.Vector3, d = new THREE.Vector3; if (e) {
                        var E = e.array; 0 === r.length && this.addGroup(0, E.length); for (var m = 0, g = r.length; g > m; ++m)for (var v = r[m], T = v.start, y = v.count, o = T, a = T + y; a > o; o += 3)s = 3 * E[o + 0], h = 3 * E[o + 1], c = 3 * E[o + 2], u.fromArray(n, s), l.fromArray(n, h), p.fromArray(n, c), f.subVectors(p, l), d.subVectors(u, l), f.cross(d), i[s] += f.x, i[s + 1] += f.y, i[s + 2] += f.z, i[h] += f.x, i[h + 1] += f.y, i[h + 2] += f.z, i[c] += f.x, i[c + 1] += f.y, i[c + 2] += f.z
                    } else for (var o = 0, a = n.length; a > o; o += 9)u.fromArray(n, o), l.fromArray(n, o + 3), p.fromArray(n, o + 6), f.subVectors(p, l), d.subVectors(u, l), f.cross(d), i[o] = f.x, i[o + 1] = f.y, i[o + 2] = f.z, i[o + 3] = f.x, i[o + 4] = f.y, i[o + 5] = f.z, i[o + 6] = f.x, i[o + 7] = f.y, i[o + 8] = f.z; this.normalizeNormals(), t.normal.needsUpdate = !0
                }
            }, computeTangents: function () {
                console.warn("THREE.BufferGeometry: .computeTangents() has been removed.")
            }, computeOffsets: function (e) {
                console.warn("THREE.BufferGeometry: .computeOffsets() has been removed.")
            }, merge: function (e, t) {
                if (e instanceof THREE.BufferGeometry == !1) return void console.error("THREE.BufferGeometry.merge(): geometry not an instance of THREE.BufferGeometry.", e); void 0 === t && (t = 0); var r = this.attributes; for (var n in r) if (void 0 !== e.attributes[n]) for (var i = r[n], o = i.array, a = e.attributes[n], s = a.array, h = a.itemSize, c = 0, u = h * t; c < s.length; c++, u++)o[u] = s[c]; return this
            }, normalizeNormals: function () {
                for (var e, t, r, n, i = this.attributes.normal.array, o = 0, a = i.length; a > o; o += 3)e = i[o], t = i[o + 1], r = i[o + 2], n = 1 / Math.sqrt(e * e + t * t + r * r), i[o] *= n, i[o + 1] *= n, i[o + 2] *= n
            }, toJSON: function () {
                var e = {
                    metadata: {
                        version: 4.4, type: "BufferGeometry", generator: "BufferGeometry.toJSON"
                    }
                }; if (e.uuid = this.uuid, e.type = this.type, "" !== this.name && (e.name = this.name), void 0 !== this.parameters) {
                    var t = this.parameters; for (var r in t) void 0 !== t[r] && (e[r] = t[r]); return e
                } e.data = {
                    attributes: {}
                }; var n = this.index; if (null !== n) {
                    var i = Array.prototype.slice.call(n.array); e.data.index = {
                        type: n.array.constructor.name, array: i
                    }
                } var o = this.attributes; for (var r in o) {
                    var a = o[r], i = Array.prototype.slice.call(a.array); e.data.attributes[r] = {
                        itemSize: a.itemSize, type: a.array.constructor.name, array: i
                    }
                } var s = this.groups; s.length > 0 && (e.data.groups = JSON.parse(JSON.stringify(s))); var h = this.boundingSphere; return null !== h && (e.data.boundingSphere = {
                    center: h.center.toArray(), radius: h.radius
                }), e
            }, clone: function () {
                return (new this.constructor).copy(this)
            }, copy: function (e) {
                var t = e.index; null !== t && this.setIndex(t.clone()); var r = e.attributes; for (var n in r) {
                    var i = r[n]; this.addAttribute(n, i.clone())
                } for (var o = e.groups, a = 0, s = o.length; s > a; a++) {
                    var h = o[a]; this.addGroup(h.start, h.count)
                } return this
            }, dispose: function () {
                this.dispatchEvent({
                    type: "dispose"
                })
            }
        }, THREE.EventDispatcher.prototype.apply(THREE.BufferGeometry.prototype), THREE.BufferGeometry.MaxIndex = 65535, THREE.InstancedBufferGeometry = function () {
            THREE.BufferGeometry.call(this), this.type = "InstancedBufferGeometry", this.maxInstancedCount = void 0
        }, THREE.InstancedBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.InstancedBufferGeometry.prototype.constructor = THREE.InstancedBufferGeometry, THREE.InstancedBufferGeometry.prototype.addGroup = function (e, t, r) {
            this.groups.push({
                start: e, count: t, instances: r
            })
        }, THREE.InstancedBufferGeometry.prototype.copy = function (e) {
            var t = e.index; null !== t && this.setIndex(t.clone()); var r = e.attributes; for (var n in r) {
                var i = r[n]; this.addAttribute(n, i.clone())
            } for (var o = e.groups, a = 0, s = o.length; s > a; a++) {
                var h = o[a]; this.addGroup(h.start, h.count, h.instances)
            } return this
        }, THREE.EventDispatcher.prototype.apply(THREE.InstancedBufferGeometry.prototype), THREE.AnimationAction = function (e, t, r, n, i) {
            if (void 0 === e) throw new Error("clip is null"); this.clip = e, this.localRoot = null, this.startTime = t || 0, this.timeScale = r || 1, this.weight = n || 1, this.loop = i || THREE.LoopRepeat, this.loopCount = 0, this.enabled = !0, this.actionTime = -this.startTime, this.clipTime = 0, this.propertyBindings = []
        }, THREE.AnimationAction.prototype = {
            constructor: THREE.AnimationAction, setLocalRoot: function (e) {
                return this.localRoot = e, this
            }, updateTime: function (e) {
                var t = this.clipTime, r = this.loopCount, n = (this.actionTime, this.clip.duration); if (this.actionTime = this.actionTime + e, this.loop === THREE.LoopOnce) return this.loopCount = 0, this.clipTime = Math.min(Math.max(this.actionTime, 0), n), this.clipTime !== t && (this.clipTime === n ? this.mixer.dispatchEvent({
                    type: "finished", action: this, direction: 1
                }) : 0 === this.clipTime && this.mixer.dispatchEvent({
                    type: "finished", action: this, direction: -1
                })), this.clipTime; this.loopCount = Math.floor(this.actionTime / n); var i = this.actionTime - this.loopCount * n; return i %= n, this.loop == THREE.LoopPingPong && 1 === Math.abs(this.loopCount % 2) && (i = n - i), this.clipTime = i, this.loopCount !== r && this.mixer.dispatchEvent({
                    type: "loop", action: this, loopDelta: this.loopCount - this.loopCount
                }), this.clipTime
            }, syncWith: function (e) {
                return this.actionTime = e.actionTime, this.timeScale = e.timeScale, this
            }, warpToDuration: function (e) {
                return this.timeScale = this.clip.duration / e, this
            }, init: function (e) {
                return this.clipTime = e - this.startTime, this
            }, update: function (e) {
                this.updateTime(e); var t = this.clip.getAt(this.clipTime); return t
            }, getTimeScaleAt: function (e) {
                return this.timeScale.getAt ? this.timeScale.getAt(e) : this.timeScale
            }, getWeightAt: function (e) {
                return this.weight.getAt ? this.weight.getAt(e) : this.weight
            }
        }, THREE.AnimationClip = function (e, t, r) {
            if (this.name = e, this.tracks = r, this.duration = void 0 !== t ? t : -1, this.duration < 0) for (var n = 0; n < this.tracks.length; n++) {
                var i = this.tracks[n]; this.duration = Math.max(i.keys[i.keys.length - 1].time)
            } this.trim(), this.optimize(), this.results = []
        }, THREE.AnimationClip.prototype = {
            constructor: THREE.AnimationClip, getAt: function (e) {
                e = Math.max(0, Math.min(e, this.duration)); for (var t = 0; t < this.tracks.length; t++) {
                    var r = this.tracks[t]; this.results[t] = r.getAt(e)
                } return this.results
            }, trim: function () {
                for (var e = 0; e < this.tracks.length; e++)this.tracks[e].trim(0, this.duration); return this
            }, optimize: function () {
                for (var e = 0; e < this.tracks.length; e++)this.tracks[e].optimize(); return this
            }
        }, THREE.AnimationClip.CreateFromMorphTargetSequence = function (e, t, r) {
            for (var n = t.length, i = [], o = 0; n > o; o++) {
                var a = []; a.push({
                    time: (o + n - 1) % n, value: 0
                }), a.push({
                    time: o, value: 1
                }), a.push({
                    time: (o + 1) % n, value: 0
                }), a.sort(THREE.KeyframeTrack.keyComparer), 0 === a[0].time && a.push({
                    time: n, value: a[0].value
                }), i.push(new THREE.NumberKeyframeTrack(".morphTargetInfluences[" + t[o].name + "]", a).scale(1 / r))
            } return new THREE.AnimationClip(e, -1, i)
        }, THREE.AnimationClip.findByName = function (e, t) {
            for (var r = 0; r < e.length; r++)if (e[r].name === t) return e[r]; return null
        }, THREE.AnimationClip.CreateClipsFromMorphTargetSequences = function (e, t) {
            for (var r = {}, n = /^([\w-]*?)([\d]+)$/, i = 0, o = e.length; o > i; i++) {
                var a = e[i], s = a.name.match(n); if (s && s.length > 1) {
                    var h = s[1], c = r[h]; c || (r[h] = c = []), c.push(a)
                }
            } var u = []; for (var h in r) u.push(THREE.AnimationClip.CreateFromMorphTargetSequence(h, r[h], t)); return u
        }, THREE.AnimationClip.parse = function (e) {
            for (var t = [], r = 0; r < e.tracks.length; r++)t.push(THREE.KeyframeTrack.parse(e.tracks[r]).scale(1 / e.fps)); return new THREE.AnimationClip(e.name, e.duration, t)
        }, THREE.AnimationClip.parseAnimation = function (e, t, r) {
            if (!e) return console.error("  no animation in JSONLoader data"), null; for (var n = function (e, t, r, n, i) {
                for (var o = [], a = 0; a < t.length; a++) {
                    var s = t[a]; void 0 !== s[r] && o.push({
                        time: s.time, value: i(s)
                    })
                } return o.length > 0 ? new n(e, o) : null
            }, i = [], o = e.name || "default", a = e.length || -1, s = e.fps || 30, h = e.hierarchy || [], c = 0; c < h.length; c++) {
                var u = h[c].keys; if (u && 0 != u.length) if (u[0].morphTargets) {
                    for (var l = {}, p = 0; p < u.length; p++)if (u[p].morphTargets) for (var f = 0; f < u[p].morphTargets.length; f++)l[u[p].morphTargets[f]] = -1; for (var d in l) {
                        for (var E = [], f = 0; f < u[p].morphTargets.length; f++) {
                            var m = u[p]; E.push({
                                time: m.time, value: m.morphTarget === d ? 1 : 0
                            })
                        } i.push(new THREE.NumberKeyframeTrack(r + ".morphTargetInfluence[" + d + "]", E))
                    } a = l.length * (s || 1)
                } else {
                    var g = r + ".bones[" + t[c].name + "]", v = n(g + ".position", u, "pos", THREE.VectorKeyframeTrack, function (e) {
                        return (new THREE.Vector3).fromArray(e.pos)
                    }); v && i.push(v); var T = n(g + ".quaternion", u, "rot", THREE.QuaternionKeyframeTrack, function (e) {
                        return e.rot.slerp ? e.rot.clone() : (new THREE.Quaternion).fromArray(e.rot)
                    }); T && i.push(T); var y = n(g + ".scale", u, "scl", THREE.VectorKeyframeTrack, function (e) {
                        return (new THREE.Vector3).fromArray(e.scl)
                    }); y && i.push(y)
                }
            } if (0 === i.length) return null; var R = new THREE.AnimationClip(o, a, i); return R
        }, THREE.AnimationMixer = function (e) {
            this.root = e, this.time = 0, this.timeScale = 1, this.actions = [], this.propertyBindingMap = {}
        }, THREE.AnimationMixer.prototype = {
            constructor: THREE.AnimationMixer, addAction: function (e) {
                this.actions.push(e), e.init(this.time), e.mixer = this; for (var t = e.clip.tracks, r = e.localRoot || this.root, n = 0; n < t.length; n++) {
                    var i = t[n], o = r.uuid + "-" + i.name, a = this.propertyBindingMap[o]; void 0 === a && (a = new THREE.PropertyBinding(r, i.name), this.propertyBindingMap[o] = a), e.propertyBindings.push(a), a.referenceCount += 1
                }
            }, removeAllActions: function () {
                for (var e = 0; e < this.actions.length; e++)this.actions[e].mixer = null; for (var t in this.propertyBindingMap) this.propertyBindingMap[t].unbind(); return this.actions = [], this.propertyBindingMap = {}, this
            }, removeAction: function (e) {
                var t = this.actions.indexOf(e); -1 !== t && (this.actions.splice(t, 1), e.mixer = null); for (var r = e.localRoot || this.root, n = e.clip.tracks, i = 0; i < n.length; i++) {
                    var o = n[i], a = r.uuid + "-" + o.name, s = this.propertyBindingMap[a]; s.referenceCount -= 1, s.referenceCount <= 0 && (s.unbind(), delete this.propertyBindingMap[a])
                } return this
            }, findActionByName: function (e) {
                for (var t = 0; t < this.actions.length; t++)if (this.actions[t].name === e) return this.actions[t]; return null
            }, play: function (e, t) {
                return e.startTime = this.time, this.addAction(e), this
            }, fadeOut: function (e, t) {
                var r = []; return r.push({
                    time: this.time, value: 1
                }), r.push({
                    time: this.time + t, value: 0
                }), e.weight = new THREE.NumberKeyframeTrack("weight", r), this
            }, fadeIn: function (e, t) {
                var r = []; return r.push({
                    time: this.time, value: 0
                }), r.push({
                    time: this.time + t, value: 1
                }), e.weight = new THREE.NumberKeyframeTrack("weight", r), this
            }, warp: function (e, t, r, n) {
                var i = []; return i.push({
                    time: this.time, value: t
                }), i.push({
                    time: this.time + n, value: r
                }), e.timeScale = new THREE.NumberKeyframeTrack("timeScale", i), this
            }, crossFade: function (e, t, r, n) {
                if (this.fadeOut(e, r), this.fadeIn(t, r), n) {
                    var i = e.clip.duration / t.clip.duration, o = 1 / i; this.warp(e, 1, i, r), this.warp(t, o, 1, r)
                } return this
            }, update: function (e) {
                var t = e * this.timeScale; this.time += t; for (var r = 0; r < this.actions.length; r++) {
                    var n = this.actions[r], i = n.getWeightAt(this.time), o = n.getTimeScaleAt(this.time), a = t * o, s = n.update(a); if (!(n.weight <= 0) && n.enabled) for (var h = 0; h < s.length; h++) {
                        n.clip.tracks[h].name; n.propertyBindings[h].accumulate(s[h], i)
                    }
                } for (var c in this.propertyBindingMap) this.propertyBindingMap[c].apply(); return this
            }
        }, THREE.EventDispatcher.prototype.apply(THREE.AnimationMixer.prototype), THREE.AnimationUtils = {
            getEqualsFunc: function (e) {
                return e.equals ? function (e, t) {
                    return e.equals(t)
                } : function (e, t) {
                    return e === t
                }
            }, clone: function (e) {
                var t = typeof e; if ("object" === t) {
                    if (e.clone) return e.clone(); console.error("can not figure out how to copy exemplarValue", e)
                } return e
            }, lerp: function (e, t, r, n) {
                var i = THREE.AnimationUtils.getLerpFunc(e, n); return i(e, t, r)
            }, lerp_object: function (e, t, r) {
                return e.lerp(t, r)
            }, slerp_object: function (e, t, r) {
                return e.slerp(t, r)
            }, lerp_number: function (e, t, r) {
                return e * (1 - r) + t * r
            }, lerp_boolean: function (e, t, r) {
                return .5 > r ? e : t
            }, lerp_boolean_immediate: function (e, t, r) {
                return e
            }, lerp_string: function (e, t, r) {
                return .5 > r ? e : t
            }, lerp_string_immediate: function (e, t, r) {
                return e
            }, getLerpFunc: function (e, t) {
                if (void 0 === e || null === e) throw new Error("examplarValue is null"); var r = typeof e; switch (r) {
                    case "object": if (e.lerp) return THREE.AnimationUtils.lerp_object; if (e.slerp) return THREE.AnimationUtils.slerp_object; break; case "number": return THREE.AnimationUtils.lerp_number; case "boolean": return t ? THREE.AnimationUtils.lerp_boolean : THREE.AnimationUtils.lerp_boolean_immediate; case "string": return t ? THREE.AnimationUtils.lerp_string : THREE.AnimationUtils.lerp_string_immediate
                }
            }
        }, THREE.KeyframeTrack = function (e, t) {
            if (void 0 === e) throw new Error("track name is undefined"); if (void 0 === t || 0 === t.length) throw new Error("no keys in track named " + e); this.name = e, this.keys = t, this.lastIndex = 0, this.validate(), this.optimize()
        }, THREE.KeyframeTrack.prototype = {
            constructor: THREE.KeyframeTrack, getAt: function (e) {
                for (; this.lastIndex < this.keys.length && e >= this.keys[this.lastIndex].time;)this.lastIndex++; for (; this.lastIndex > 0 && e < this.keys[this.lastIndex - 1].time;)this.lastIndex--; if (this.lastIndex >= this.keys.length) return this.setResult(this.keys[this.keys.length - 1].value), this.result; if (0 === this.lastIndex) return this.setResult(this.keys[0].value), this.result; var t = this.keys[this.lastIndex - 1]; if (this.setResult(t.value), t.constantToNext) return this.result; var r = this.keys[this.lastIndex], n = (e - t.time) / (r.time - t.time); return this.result = this.lerpValues(this.result, r.value, n), this.result
            }, shift: function (e) {
                if (0 !== e) for (var t = 0; t < this.keys.length; t++)this.keys[t].time += e; return this
            }, scale: function (e) {
                if (1 !== e) for (var t = 0; t < this.keys.length; t++)this.keys[t].time *= e; return this
            }, trim: function (e, t) {
                for (var r = 0, n = 1; n < this.keys.length; n++)this.keys[n] <= e && r++; for (var i = 0, n = this.keys.length - 2; n > 0 && this.keys[n] >= t; n++)i++; return r + i > 0 && (this.keys = this.keys.splice(r, this.keys.length - i - r)), this
            }, validate: function () {
                var e = null; if (0 === this.keys.length) return void console.error("  track is empty, no keys", this); for (var t = 0; t < this.keys.length; t++) {
                    var r = this.keys[t]; if (!r) return void console.error("  key is null in track", this, t); if ("number" != typeof r.time || isNaN(r.time)) return void console.error("  key.time is not a valid number", this, t, r); if (void 0 === r.value || null === r.value) return void console.error("  key.value is null in track", this, t, r); if (e && e.time > r.time) return void console.error("  key.time is less than previous key time, out of order keys", this, t, r, e); e = r
                } return this
            }, optimize: function () {
                var e = [], t = this.keys[0]; e.push(t); for (var r = (THREE.AnimationUtils.getEqualsFunc(t.value), 1); r < this.keys.length - 1; r++) {
                    var n = this.keys[r], i = this.keys[r + 1]; t.time !== n.time && (this.compareValues(t.value, n.value) && this.compareValues(n.value, i.value) || (t.constantToNext = this.compareValues(t.value, n.value), e.push(n), t = n))
                } return e.push(this.keys[this.keys.length - 1]), this.keys = e, this
            }
        }, THREE.KeyframeTrack.keyComparer = function (e, t) {
            return e.time - t.time
        }, THREE.KeyframeTrack.parse = function (e) {
            if (void 0 === e.type) throw new Error("track type undefined, can not parse"); var t = THREE.KeyframeTrack.GetTrackTypeForTypeName(e.type); return t.parse(e)
        }, THREE.KeyframeTrack.GetTrackTypeForTypeName = function (e) {
            switch (e.toLowerCase()) {
                case "vector": case "vector2": case "vector3": case "vector4": return THREE.VectorKeyframeTrack;
                case "quaternion": return THREE.QuaternionKeyframeTrack; case "integer": case "scalar": case "double": case "float": case "number": return THREE.NumberKeyframeTrack; case "bool": case "boolean": return THREE.BooleanKeyframeTrack; case "string": return THREE.StringKeyframeTrack
            }throw new Error("Unsupported typeName: " + e)
        }, THREE.PropertyBinding = function (e, t) {
            this.rootNode = e, this.trackName = t, this.referenceCount = 0, this.originalValue = null; var r = THREE.PropertyBinding.parseTrackName(t); this.directoryName = r.directoryName, this.nodeName = r.nodeName, this.objectName = r.objectName, this.objectIndex = r.objectIndex, this.propertyName = r.propertyName, this.propertyIndex = r.propertyIndex, this.node = THREE.PropertyBinding.findNode(e, this.nodeName) || e, this.cumulativeValue = null, this.cumulativeWeight = 0
        }, THREE.PropertyBinding.prototype = {
            constructor: THREE.PropertyBinding, reset: function () {
                this.cumulativeValue = null, this.cumulativeWeight = 0
            }, accumulate: function (e, t) {
                if (this.isBound || this.bind(), 0 === this.cumulativeWeight) t > 0 && (null === this.cumulativeValue && (this.cumulativeValue = THREE.AnimationUtils.clone(e)), this.cumulativeWeight = t); else {
                    var r = t / (this.cumulativeWeight + t); this.cumulativeValue = this.lerpValue(this.cumulativeValue, e, r), this.cumulativeWeight += t
                }
            }, unbind: function () {
                this.isBound && (this.setValue(this.originalValue), this.setValue = null, this.getValue = null, this.lerpValue = null, this.equalsValue = null, this.triggerDirty = null, this.isBound = !1)
            }, bind: function () {
                if (!this.isBound) {
                    var e = this.node; if (!e) return void console.error("  trying to update node for track: " + this.trackName + " but it wasn't found."); if (this.objectName) {
                        if ("materials" === this.objectName) {
                            if (!e.material) return void console.error("  can not bind to material as node does not have a material", this); if (!e.material.materials) return void console.error("  can not bind to material.materials as node.material does not have a materials array", this); e = e.material.materials
                        } else if ("bones" === this.objectName) {
                            if (!e.skeleton) return void console.error("  can not bind to bones as node does not have a skeleton", this); e = e.skeleton.bones; for (var t = 0; t < e.length; t++)if (e[t].name === this.objectIndex) {
                                this.objectIndex = t; break
                            }
                        } else {
                            if (void 0 === e[this.objectName]) return void console.error("  can not bind to objectName of node, undefined", this); e = e[this.objectName]
                        } if (void 0 !== this.objectIndex) {
                            if (void 0 === e[this.objectIndex]) return void console.error("  trying to bind to objectIndex of objectName, but is undefined:", this, e); e = e[this.objectIndex]
                        }
                    } var r = e[this.propertyName]; if (!r) return void console.error("  trying to update property for track: " + this.nodeName + "." + this.propertyName + " but it wasn't found.", e); if (void 0 !== this.propertyIndex) {
                        if ("morphTargetInfluences" === this.propertyName) {
                            e.geometry || console.error("  can not bind to morphTargetInfluences becasuse node does not have a geometry", this), e.geometry.morphTargets || console.error("  can not bind to morphTargetInfluences becasuse node does not have a geometry.morphTargets", this); for (var t = 0; t < this.node.geometry.morphTargets.length; t++)if (e.geometry.morphTargets[t].name === this.propertyIndex) {
                                this.propertyIndex = t; break
                            }
                        } this.setValue = function (e) {
                            return this.equalsValue(r[this.propertyIndex], e) ? !1 : (r[this.propertyIndex] = e, !0)
                        }, this.getValue = function () {
                            return r[this.propertyIndex]
                        }
                    } else r.copy ? (this.setValue = function (e) {
                        return this.equalsValue(r, e) ? !1 : (r.copy(e), !0)
                    }, this.getValue = function () {
                        return r
                    }) : (this.setValue = function (t) {
                        return this.equalsValue(e[this.propertyName], t) ? !1 : (e[this.propertyName] = t, !0)
                    }, this.getValue = function () {
                        return e[this.propertyName]
                    }); void 0 !== e.needsUpdate ? this.triggerDirty = function () {
                        this.node.needsUpdate = !0
                    } : void 0 !== e.matrixWorldNeedsUpdate && (this.triggerDirty = function () {
                        e.matrixWorldNeedsUpdate = !0
                    }), this.originalValue = this.getValue(), this.equalsValue = THREE.AnimationUtils.getEqualsFunc(this.originalValue), this.lerpValue = THREE.AnimationUtils.getLerpFunc(this.originalValue, !0), this.isBound = !0
                }
            }, apply: function () {
                if (this.isBound || this.bind(), this.cumulativeWeight > 0) {
                    if (this.cumulativeWeight < 1) {
                        var e = 1 - this.cumulativeWeight, t = e / (this.cumulativeWeight + e); this.cumulativeValue = this.lerpValue(this.cumulativeValue, this.originalValue, t)
                    } var r = this.setValue(this.cumulativeValue); r && this.triggerDirty && this.triggerDirty(), this.cumulativeValue = null, this.cumulativeWeight = 0
                }
            }
        }, THREE.PropertyBinding.parseTrackName = function (e) {
            var t = /^(([\w]+\/)*)([\w-\d]+)?(\.([\w]+)(\[([\w\d\[\]\_. ]+)\])?)?(\.([\w.]+)(\[([\w\d\[\]\_. ]+)\])?)$/, r = t.exec(e); if (!r) throw new Error("cannot parse trackName at all: " + e); r.index === t.lastIndex && t.lastIndex++; var n = {
                directoryName: r[1], nodeName: r[3], objectName: r[5], objectIndex: r[7], propertyName: r[9], propertyIndex: r[11]
            }; if (null === n.propertyName || 0 === n.propertyName.length) throw new Error("can not parse propertyName from trackName: " + e); return n
        }, THREE.PropertyBinding.findNode = function (e, t) {
            function r(e) {
                for (var r = 0; r < e.bones.length; r++) {
                    var n = e.bones[r]; if (n.name === t) return n
                } return null
            } function n(e) {
                for (var r = 0; r < e.length; r++) {
                    var i = e[r]; if (i.name === t || i.uuid === t) return i; var o = n(i.children); if (o) return o
                } return null
            } if (!t || "" === t || "root" === t || "." === t || -1 === t || t === e.name || t === e.uuid) return e; if (e.skeleton) {
                var i = r(e.skeleton); if (i) return i
            } if (e.children) {
                var o = n(e.children); if (o) return o
            } return null
        }, THREE.VectorKeyframeTrack = function (e, t) {
            THREE.KeyframeTrack.call(this, e, t), this.result = this.keys[0].value.clone()
        }, THREE.VectorKeyframeTrack.prototype = Object.create(THREE.KeyframeTrack.prototype), THREE.VectorKeyframeTrack.prototype.constructor = THREE.VectorKeyframeTrack, THREE.VectorKeyframeTrack.prototype.setResult = function (e) {
            this.result.copy(e)
        }, THREE.VectorKeyframeTrack.prototype.lerpValues = function (e, t, r) {
            return e.lerp(t, r)
        }, THREE.VectorKeyframeTrack.prototype.compareValues = function (e, t) {
            return e.equals(t)
        }, THREE.VectorKeyframeTrack.prototype.clone = function () {
            for (var e = [], t = 0; t < this.keys.length; t++) {
                var r = this.keys[t]; e.push({
                    time: r.time, value: r.value.clone()
                })
            } return new THREE.VectorKeyframeTrack(this.name, e)
        }, THREE.VectorKeyframeTrack.parse = function (e) {
            for (var t = e.keys[0].value.length, r = THREE["Vector" + t], n = [], i = 0; i < e.keys.length; i++) {
                var o = e.keys[i]; n.push({
                    value: (new r).fromArray(o.value), time: o.time
                })
            } return new THREE.VectorKeyframeTrack(e.name, n)
        }, THREE.QuaternionKeyframeTrack = function (e, t) {
            THREE.KeyframeTrack.call(this, e, t), this.result = this.keys[0].value.clone()
        }, THREE.QuaternionKeyframeTrack.prototype = Object.create(THREE.KeyframeTrack.prototype), THREE.QuaternionKeyframeTrack.prototype.constructor = THREE.QuaternionKeyframeTrack, THREE.QuaternionKeyframeTrack.prototype.setResult = function (e) {
            this.result.copy(e)
        }, THREE.QuaternionKeyframeTrack.prototype.lerpValues = function (e, t, r) {
            return e.slerp(t, r)
        }, THREE.QuaternionKeyframeTrack.prototype.compareValues = function (e, t) {
            return e.equals(t)
        }, THREE.QuaternionKeyframeTrack.prototype.multiply = function (e) {
            for (var t = 0; t < this.keys.length; t++)this.keys[t].value.multiply(e); return this
        }, THREE.QuaternionKeyframeTrack.prototype.clone = function () {
            for (var e = [], t = 0; t < this.keys.length; t++) {
                var r = this.keys[t]; e.push({
                    time: r.time, value: r.value.clone()
                })
            } return new THREE.QuaternionKeyframeTrack(this.name, e)
        }, THREE.QuaternionKeyframeTrack.parse = function (e) {
            for (var t = [], r = 0; r < e.keys.length; r++) {
                var n = e.keys[r]; t.push({
                    value: (new THREE.Quaternion).fromArray(n.value), time: n.time
                })
            } return new THREE.QuaternionKeyframeTrack(e.name, t)
        }, THREE.StringKeyframeTrack = function (e, t) {
            THREE.KeyframeTrack.call(this, e, t), this.result = this.keys[0].value
        }, THREE.StringKeyframeTrack.prototype = Object.create(THREE.KeyframeTrack.prototype), THREE.StringKeyframeTrack.prototype.constructor = THREE.StringKeyframeTrack, THREE.StringKeyframeTrack.prototype.setResult = function (e) {
            this.result = e
        }, THREE.StringKeyframeTrack.prototype.lerpValues = function (e, t, r) {
            return 1 > r ? e : t
        }, THREE.StringKeyframeTrack.prototype.compareValues = function (e, t) {
            return e === t
        }, THREE.StringKeyframeTrack.prototype.clone = function () {
            for (var e = [], t = 0; t < this.keys.length; t++) {
                var r = this.keys[t]; e.push({
                    time: r.time, value: r.value
                })
            } return new THREE.StringKeyframeTrack(this.name, e)
        }, THREE.StringKeyframeTrack.parse = function (e) {
            return new THREE.StringKeyframeTrack(e.name, e.keys)
        }, THREE.BooleanKeyframeTrack = function (e, t) {
            THREE.KeyframeTrack.call(this, e, t), this.result = this.keys[0].value
        }, THREE.BooleanKeyframeTrack.prototype = Object.create(THREE.KeyframeTrack.prototype), THREE.BooleanKeyframeTrack.prototype.constructor = THREE.BooleanKeyframeTrack, THREE.BooleanKeyframeTrack.prototype.setResult = function (e) {
            this.result = e
        }, THREE.BooleanKeyframeTrack.prototype.lerpValues = function (e, t, r) {
            return 1 > r ? e : t
        }, THREE.BooleanKeyframeTrack.prototype.compareValues = function (e, t) {
            return e === t
        }, THREE.BooleanKeyframeTrack.prototype.clone = function () {
            for (var e = [], t = 0; t < this.keys.length; t++) {
                var r = this.keys[t]; e.push({
                    time: r.time, value: r.value
                })
            } return new THREE.BooleanKeyframeTrack(this.name, e)
        }, THREE.BooleanKeyframeTrack.parse = function (e) {
            return new THREE.BooleanKeyframeTrack(e.name, e.keys)
        }, THREE.NumberKeyframeTrack = function (e, t) {
            THREE.KeyframeTrack.call(this, e, t), this.result = this.keys[0].value
        }, THREE.NumberKeyframeTrack.prototype = Object.create(THREE.KeyframeTrack.prototype), THREE.NumberKeyframeTrack.prototype.constructor = THREE.NumberKeyframeTrack, THREE.NumberKeyframeTrack.prototype.setResult = function (e) {
            this.result = e
        }, THREE.NumberKeyframeTrack.prototype.lerpValues = function (e, t, r) {
            return e * (1 - r) + t * r
        }, THREE.NumberKeyframeTrack.prototype.compareValues = function (e, t) {
            return e === t
        }, THREE.NumberKeyframeTrack.prototype.clone = function () {
            for (var e = [], t = 0; t < this.keys.length; t++) {
                var r = this.keys[t]; e.push({
                    time: r.time, value: r.value
                })
            } return new THREE.NumberKeyframeTrack(this.name, e)
        }, THREE.NumberKeyframeTrack.parse = function (e) {
            return new THREE.NumberKeyframeTrack(e.name, e.keys)
        }, THREE.Camera = function () {
            THREE.Object3D.call(this), this.type = "Camera", this.matrixWorldInverse = new THREE.Matrix4, this.projectionMatrix = new THREE.Matrix4
        }, THREE.Camera.prototype = Object.create(THREE.Object3D.prototype), THREE.Camera.prototype.constructor = THREE.Camera, THREE.Camera.prototype.getWorldDirection = function () {
            var e = new THREE.Quaternion; return function (t) {
                var r = t || new THREE.Vector3; return this.getWorldQuaternion(e), r.set(0, 0, -1).applyQuaternion(e)
            }
        }(), THREE.Camera.prototype.lookAt = function () {
            var e = new THREE.Matrix4; return function (t) {
                e.lookAt(this.position, t, this.up), this.quaternion.setFromRotationMatrix(e)
            }
        }(), THREE.Camera.prototype.clone = function () {
            return (new this.constructor).copy(this)
        }, THREE.Camera.prototype.copy = function (e) {
            return THREE.Object3D.prototype.copy.call(this, e), this.matrixWorldInverse.copy(e.matrixWorldInverse), this.projectionMatrix.copy(e.projectionMatrix), this
        }, THREE.CubeCamera = function (e, t, r) {
            THREE.Object3D.call(this), this.type = "CubeCamera"; var n = 90, i = 1, o = new THREE.PerspectiveCamera(n, i, e, t); o.up.set(0, -1, 0), o.lookAt(new THREE.Vector3(1, 0, 0)), this.add(o); var a = new THREE.PerspectiveCamera(n, i, e, t); a.up.set(0, -1, 0), a.lookAt(new THREE.Vector3(-1, 0, 0)), this.add(a); var s = new THREE.PerspectiveCamera(n, i, e, t); s.up.set(0, 0, 1), s.lookAt(new THREE.Vector3(0, 1, 0)), this.add(s); var h = new THREE.PerspectiveCamera(n, i, e, t); h.up.set(0, 0, -1), h.lookAt(new THREE.Vector3(0, -1, 0)), this.add(h); var c = new THREE.PerspectiveCamera(n, i, e, t); c.up.set(0, -1, 0), c.lookAt(new THREE.Vector3(0, 0, 1)), this.add(c); var u = new THREE.PerspectiveCamera(n, i, e, t); u.up.set(0, -1, 0), u.lookAt(new THREE.Vector3(0, 0, -1)), this.add(u), this.renderTarget = new THREE.WebGLRenderTargetCube(r, r, {
                format: THREE.RGBFormat, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter
            }), this.updateCubeMap = function (e, t) {
                null === this.parent && this.updateMatrixWorld(); var r = this.renderTarget, n = r.texture.generateMipmaps; r.texture.generateMipmaps = !1, r.activeCubeFace = 0, e.render(t, o, r), r.activeCubeFace = 1, e.render(t, a, r), r.activeCubeFace = 2, e.render(t, s, r), r.activeCubeFace = 3, e.render(t, h, r), r.activeCubeFace = 4, e.render(t, c, r), r.texture.generateMipmaps = n, r.activeCubeFace = 5, e.render(t, u, r), e.setRenderTarget(null)
            }
        }, THREE.CubeCamera.prototype = Object.create(THREE.Object3D.prototype), THREE.CubeCamera.prototype.constructor = THREE.CubeCamera, THREE.OrthographicCamera = function (e, t, r, n, i, o) {
            THREE.Camera.call(this), this.type = "OrthographicCamera", this.zoom = 1, this.left = e, this.right = t, this.top = r, this.bottom = n, this.near = void 0 !== i ? i : .1, this.far = void 0 !== o ? o : 2e3, this.updateProjectionMatrix()
        }, THREE.OrthographicCamera.prototype = Object.create(THREE.Camera.prototype), THREE.OrthographicCamera.prototype.constructor = THREE.OrthographicCamera, THREE.OrthographicCamera.prototype.updateProjectionMatrix = function () {
            var e = (this.right - this.left) / (2 * this.zoom), t = (this.top - this.bottom) / (2 * this.zoom), r = (this.right + this.left) / 2, n = (this.top + this.bottom) / 2; this.projectionMatrix.makeOrthographic(r - e, r + e, n + t, n - t, this.near, this.far)
        }, THREE.OrthographicCamera.prototype.copy = function (e) {
            return THREE.Camera.prototype.copy.call(this, e), this.left = e.left, this.right = e.right, this.top = e.top, this.bottom = e.bottom, this.near = e.near, this.far = e.far, this.zoom = e.zoom, this
        }, THREE.OrthographicCamera.prototype.toJSON = function (e) {
            var t = THREE.Object3D.prototype.toJSON.call(this, e); return t.object.zoom = this.zoom, t.object.left = this.left, t.object.right = this.right, t.object.top = this.top, t.object.bottom = this.bottom, t.object.near = this.near, t.object.far = this.far, t
        }, THREE.PerspectiveCamera = function (e, t, r, n) {
            THREE.Camera.call(this), this.type = "PerspectiveCamera", this.zoom = 1, this.fov = void 0 !== e ? e : 50, this.aspect = void 0 !== t ? t : 1, this.near = void 0 !== r ? r : .1, this.far = void 0 !== n ? n : 2e3, this.updateProjectionMatrix()
        }, THREE.PerspectiveCamera.prototype = Object.create(THREE.Camera.prototype), THREE.PerspectiveCamera.prototype.constructor = THREE.PerspectiveCamera, THREE.PerspectiveCamera.prototype.setLens = function (e, t) {
            void 0 === t && (t = 24), this.fov = 2 * THREE.Math.radToDeg(Math.atan(t / (2 * e))), this.updateProjectionMatrix()
        }, THREE.PerspectiveCamera.prototype.setViewOffset = function (e, t, r, n, i, o) {
            this.fullWidth = e, this.fullHeight = t, this.x = r, this.y = n, this.width = i, this.height = o, this.updateProjectionMatrix()
        }, THREE.PerspectiveCamera.prototype.updateProjectionMatrix = function () {
            var e = THREE.Math.radToDeg(2 * Math.atan(Math.tan(.5 * THREE.Math.degToRad(this.fov)) / this.zoom)); if (this.fullWidth) {
                var t = this.fullWidth / this.fullHeight, r = Math.tan(THREE.Math.degToRad(.5 * e)) * this.near, n = -r, i = t * n, o = t * r, a = Math.abs(o - i), s = Math.abs(r - n); this.projectionMatrix.makeFrustum(i + this.x * a / this.fullWidth, i + (this.x + this.width) * a / this.fullWidth, r - (this.y + this.height) * s / this.fullHeight, r - this.y * s / this.fullHeight, this.near, this.far)
            } else this.projectionMatrix.makePerspective(e, this.aspect, this.near, this.far)
        }, THREE.PerspectiveCamera.prototype.copy = function (e) {
            return THREE.Camera.prototype.copy.call(this, e), this.fov = e.fov, this.aspect = e.aspect, this.near = e.near, this.far = e.far, this.zoom = e.zoom, this
        }, THREE.PerspectiveCamera.prototype.toJSON = function (e) {
            var t = THREE.Object3D.prototype.toJSON.call(this, e); return t.object.zoom = this.zoom, t.object.fov = this.fov, t.object.aspect = this.aspect, t.object.near = this.near, t.object.far = this.far, t
        }, THREE.Light = function (e) {
            THREE.Object3D.call(this), this.type = "Light", this.color = new THREE.Color(e), this.receiveShadow = void 0
        }, THREE.Light.prototype = Object.create(THREE.Object3D.prototype), THREE.Light.prototype.constructor = THREE.Light, Object.defineProperties(THREE.Light.prototype, {
            onlyShadow: {
                set: function (e) {
                    console.warn("THREE.Light: .onlyShadow has been removed.")
                }
            }, shadowCameraFov: {
                set: function (e) {
                    this.shadow.camera.fov = e
                }
            }, shadowCameraLeft: {
                set: function (e) {
                    this.shadow.camera.left = e
                }
            }, shadowCameraRight: {
                set: function (e) {
                    this.shadow.camera.right = e
                }
            }, shadowCameraTop: {
                set: function (e) {
                    this.shadow.camera.top = e
                }
            }, shadowCameraBottom: {
                set: function (e) {
                    this.shadow.camera.bottom = e
                }
            }, shadowCameraNear: {
                set: function (e) {
                    this.shadow.camera.near = e
                }
            }, shadowCameraFar: {
                set: function (e) {
                    this.shadow.camera.far = e
                }
            }, shadowCameraVisible: {
                set: function (e) {
                    console.warn("THREE.Light: .shadowCameraVisible has been removed. Use new THREE.CameraHelper( light.shadow ) instead.")
                }
            }, shadowBias: {
                set: function (e) {
                    this.shadow.bias = e
                }
            }, shadowDarkness: {
                set: function (e) {
                    this.shadow.darkness = e
                }
            }, shadowMapWidth: {
                set: function (e) {
                    this.shadow.mapSize.width = e
                }
            }, shadowMapHeight: {
                set: function (e) {
                    this.shadow.mapSize.height = e
                }
            }
        }), THREE.Light.prototype.copy = function (e) {
            return THREE.Object3D.prototype.copy.call(this, e), this.color.copy(e.color), this
        }, THREE.Light.prototype.toJSON = function (e) {
            var t = THREE.Object3D.prototype.toJSON.call(this, e); return t.object.color = this.color.getHex(), void 0 !== this.groundColor && (t.object.groundColor = this.groundColor.getHex()), void 0 !== this.intensity && (t.object.intensity = this.intensity), void 0 !== this.distance && (t.object.distance = this.distance), void 0 !== this.angle && (t.object.angle = this.angle), void 0 !== this.decay && (t.object.decay = this.decay), void 0 !== this.exponent && (t.object.exponent = this.exponent), t
        }, THREE.LightShadow = function (e) {
            this.camera = e, this.bias = 0, this.darkness = 1, this.mapSize = new THREE.Vector2(512, 512), this.map = null, this.matrix = null
        }, THREE.LightShadow.prototype = {
            constructor: THREE.LightShadow, copy: function (e) {
                this.camera = e.camera.clone(), this.bias = e.bias, this.darkness = e.darkness, this.mapSize.copy(e.mapSize)
            }, clone: function () {
                return (new this.constructor).copy(this)
            }
        }, THREE.AmbientLight = function (e) {
            THREE.Light.call(this, e), this.type = "AmbientLight", this.castShadow = void 0
        }, THREE.AmbientLight.prototype = Object.create(THREE.Light.prototype), THREE.AmbientLight.prototype.constructor = THREE.AmbientLight, THREE.DirectionalLight = function (e, t) {
            THREE.Light.call(this, e), this.type = "DirectionalLight", this.position.set(0, 1, 0), this.updateMatrix(), this.target = new THREE.Object3D, this.intensity = void 0 !== t ? t : 1, this.shadow = new THREE.LightShadow(new THREE.OrthographicCamera(-500, 500, 500, -500, 50, 5e3))
        }, THREE.DirectionalLight.prototype = Object.create(THREE.Light.prototype), THREE.DirectionalLight.prototype.constructor = THREE.DirectionalLight, THREE.DirectionalLight.prototype.copy = function (e) {
            return THREE.Light.prototype.copy.call(this, e), this.intensity = e.intensity, this.target = e.target.clone(), this.shadow = e.shadow.clone(), this
        }, THREE.HemisphereLight = function (e, t, r) {
            THREE.Light.call(this, e), this.type = "HemisphereLight", this.castShadow = void 0, this.position.set(0, 1, 0), this.updateMatrix(), this.groundColor = new THREE.Color(t), this.intensity = void 0 !== r ? r : 1
        }, THREE.HemisphereLight.prototype = Object.create(THREE.Light.prototype), THREE.HemisphereLight.prototype.constructor = THREE.HemisphereLight, THREE.HemisphereLight.prototype.copy = function (e) {
            return THREE.Light.prototype.copy.call(this, e), this.groundColor.copy(e.groundColor), this.intensity = e.intensity, this
        }, THREE.PointLight = function (e, t, r, n) {
            THREE.Light.call(this, e), this.type = "PointLight", this.intensity = void 0 !== t ? t : 1, this.distance = void 0 !== r ? r : 0, this.decay = void 0 !== n ? n : 1, this.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(90, 1, 1, 500))
        }, THREE.PointLight.prototype = Object.create(THREE.Light.prototype), THREE.PointLight.prototype.constructor = THREE.PointLight, THREE.PointLight.prototype.copy = function (e) {
            return THREE.Light.prototype.copy.call(this, e), this.intensity = e.intensity, this.distance = e.distance, this.decay = e.decay, this.shadow = e.shadow.clone(), this
        }, THREE.SpotLight = function (e, t, r, n, i, o) {
            THREE.Light.call(this, e), this.type = "SpotLight", this.position.set(0, 1, 0), this.updateMatrix(), this.target = new THREE.Object3D, this.intensity = void 0 !== t ? t : 1, this.distance = void 0 !== r ? r : 0, this.angle = void 0 !== n ? n : Math.PI / 3, this.exponent = void 0 !== i ? i : 10, this.decay = void 0 !== o ? o : 1, this.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 50, 5e3))
        }, THREE.SpotLight.prototype = Object.create(THREE.Light.prototype), THREE.SpotLight.prototype.constructor = THREE.SpotLight, THREE.SpotLight.prototype.copy = function (e) {
            return THREE.Light.prototype.copy.call(this, e), this.intensity = e.intensity, this.distance = e.distance, this.angle = e.angle, this.exponent = e.exponent, this.decay = e.decay, this.target = e.target.clone(), this.shadow = e.shadow.clone(), this
        }, THREE.Cache = {
            enabled: !1, files: {}, add: function (e, t) {
                this.enabled !== !1 && (this.files[e] = t)
            }, get: function (e) {
                return this.enabled !== !1 ? this.files[e] : void 0
            }, remove: function (e) {
                delete this.files[e]
            }, clear: function () {
                this.files = {}
            }
        }, THREE.Loader = function () {
            this.onLoadStart = function () {
            }, this.onLoadProgress = function () {
            }, this.onLoadComplete = function () {
            }
        }, THREE.Loader.prototype = {
            constructor: THREE.Loader, crossOrigin: void 0, extractUrlBase: function (e) {
                var t = e.split("/"); return 1 === t.length ? "./" : (t.pop(), t.join("/") + "/")
            }, initMaterials: function (e, t, r) {
                for (var n = [], i = 0; i < e.length; ++i)n[i] = this.createMaterial(e[i], t, r); return n
            }, createMaterial: function () {
                var e, t, r; return function (n, i, o) {
                    function a(e, r, n, a, h) {
                        var c, u = i + e, l = THREE.Loader.Handlers.get(u); null !== l ? c = l.load(u) : (t.setCrossOrigin(o), c = t.load(u)), void 0 !== r && (c.repeat.fromArray(r), 1 !== r[0] && (c.wrapS = THREE.RepeatWrapping), 1 !== r[1] && (c.wrapT = THREE.RepeatWrapping)), void 0 !== n && c.offset.fromArray(n), void 0 !== a && ("repeat" === a[0] && (c.wrapS = THREE.RepeatWrapping), "mirror" === a[0] && (c.wrapS = THREE.MirroredRepeatWrapping), "repeat" === a[1] && (c.wrapT = THREE.RepeatWrapping), "mirror" === a[1] && (c.wrapT = THREE.MirroredRepeatWrapping)), void 0 !== h && (c.anisotropy = h); var p = THREE.Math.generateUUID(); return s[p] = c, p
                    } void 0 === e && (e = new THREE.Color), void 0 === t && (t = new THREE.TextureLoader), void 0 === r && (r = new THREE.MaterialLoader); var s = {}, h = {
                        uuid: THREE.Math.generateUUID(), type: "MeshLambertMaterial"
                    }; for (var c in n) {
                        var u = n[c]; switch (c) {
                            case "DbgColor": h.color = u; break; case "DbgIndex": case "opticalDensity": case "illumination": break; case "DbgName": h.name = u; break; case "blending": h.blending = THREE[u]; break; case "colorDiffuse": h.color = e.fromArray(u).getHex(); break; case "colorSpecular": h.specular = e.fromArray(u).getHex(); break; case "colorEmissive": h.emissive = e.fromArray(u).getHex(); break; case "specularCoef": h.shininess = u; break; case "shading": "basic" === u.toLowerCase() && (h.type = "MeshBasicMaterial"), "phong" === u.toLowerCase() && (h.type = "MeshPhongMaterial"); break; case "mapDiffuse": h.map = a(u, n.mapDiffuseRepeat, n.mapDiffuseOffset, n.mapDiffuseWrap, n.mapDiffuseAnisotropy); break; case "mapDiffuseRepeat": case "mapDiffuseOffset": case "mapDiffuseWrap": case "mapDiffuseAnisotropy": break; case "mapLight": h.lightMap = a(u, n.mapLightRepeat, n.mapLightOffset, n.mapLightWrap, n.mapLightAnisotropy); break; case "mapLightRepeat": case "mapLightOffset": case "mapLightWrap": case "mapLightAnisotropy": break; case "mapAO": h.aoMap = a(u, n.mapAORepeat, n.mapAOOffset, n.mapAOWrap, n.mapAOAnisotropy); break; case "mapAORepeat": case "mapAOOffset": case "mapAOWrap": case "mapAOAnisotropy": break; case "mapBump": h.bumpMap = a(u, n.mapBumpRepeat, n.mapBumpOffset, n.mapBumpWrap, n.mapBumpAnisotropy); break; case "mapBumpScale": h.bumpScale = 0.1; break; case "mapBumpRepeat": case "mapBumpOffset": case "mapBumpWrap": case "mapBumpAnisotropy": break; case "mapNormal": h.normalMap = a(u, n.mapNormalRepeat, n.mapNormalOffset, n.mapNormalWrap, n.mapNormalAnisotropy); break; case "mapNormalFactor": h.normalScale = [u, u]; break; case "mapNormalRepeat": case "mapNormalOffset": case "mapNormalWrap": case "mapNormalAnisotropy": break; case "mapSpecular": h.specularMap = a(u, n.mapSpecularRepeat, n.mapSpecularOffset, n.mapSpecularWrap, n.mapSpecularAnisotropy); break; case "mapSpecularRepeat": case "mapSpecularOffset": case "mapSpecularWrap": case "mapSpecularAnisotropy": break; case "mapAlpha": h.alphaMap = a(u, n.mapAlphaRepeat, n.mapAlphaOffset, n.mapAlphaWrap, n.mapAlphaAnisotropy); break; case "mapAlphaRepeat": case "mapAlphaOffset": case "mapAlphaWrap": case "mapAlphaAnisotropy": break; case "flipSided": h.side = THREE.BackSide; break; case "doubleSided": h.side = THREE.DoubleSide; break; case "transparency": console.warn("THREE.Loader: transparency has been renamed to opacity"), h.opacity = u; break; case "opacity": case "transparent": case "depthTest": case "depthWrite": case "transparent": case "visible": case "wireframe": h[c] = u; break; case "vertexColors": u === !0 && (h.vertexColors = THREE.VertexColors), "face" === u && (h.vertexColors = THREE.FaceColors); break; default: console.error("Loader.createMaterial: Unsupported", c, u)
                        }
                    } return "MeshPhongMaterial" !== h.type && delete h.specular, h.opacity < 1 && (h.transparent = !0), r.setTextures(s), r.parse(h)
                }
            }()
        }, THREE.Loader.Handlers = {
            handlers: [], add: function (e, t) {
                this.handlers.push(e, t)
            }, get: function (e) {
                for (var t = this.handlers, r = 0, n = t.length; n > r; r += 2) {
                    var i = t[r], o = t[r + 1]; if (i.test(e)) return o
                } return null
            }
        }, THREE.XHRLoader = function (e) {
            this.manager = void 0 !== e ? e : THREE.DefaultLoadingManager
        }, THREE.XHRLoader.prototype = {
            constructor: THREE.XHRLoader, load: function (e, t, r, n) {
                var i = this, o = THREE.Cache.get(e); if (void 0 !== o) return t && setTimeout(function () {
                    t(o)
                }, 0), o; var a = new XMLHttpRequest; return a.open("GET", e, !0), a.addEventListener("load", function (r) {
                    var n = r.target.response; THREE.Cache.add(e, n), t && t(n), i.manager.itemEnd(e)
                }, !1), void 0 !== r && a.addEventListener("progress", function (e) {
                    r(e)
                }, !1), a.addEventListener("error", function (t) {
                    n && n(t), i.manager.itemError(e)
                }, !1), void 0 !== this.crossOrigin && (a.crossOrigin = this.crossOrigin), void 0 !== this.responseType && (a.responseType = this.responseType), void 0 !== this.withCredentials && (a.withCredentials = this.withCredentials), a.send(null), i.manager.itemStart(e), a
            }, setResponseType: function (e) {
                this.responseType = e
            }, setCrossOrigin: function (e) {
                this.crossOrigin = e
            }, setWithCredentials: function (e) {
                this.withCredentials = e
            }
        }, THREE.ImageLoader = function (e) {
            this.manager = void 0 !== e ? e : THREE.DefaultLoadingManager
        }, THREE.ImageLoader.prototype = {
            constructor: THREE.ImageLoader, load: function (e, t, r, n) {
                var i = this, o = THREE.Cache.get(e); if (void 0 !== o) return i.manager.itemStart(e), t ? setTimeout(function () {
                    t(o), i.manager.itemEnd(e)
                }, 0) : i.manager.itemEnd(e), o; var a = document.createElement("img"); return a.addEventListener("load", function (r) {
                    THREE.Cache.add(e, this), t && t(this), i.manager.itemEnd(e)
                }, !1), void 0 !== r && a.addEventListener("progress", function (e) {
                    r(e)
                }, !1), a.addEventListener("error", function (t) {
                    n && n(t), i.manager.itemError(e)
                }, !1), void 0 !== this.crossOrigin && (a.crossOrigin = this.crossOrigin), i.manager.itemStart(e), a.src = e, a
            }, setCrossOrigin: function (e) {
                this.crossOrigin = e
            }
        }, THREE.JSONLoader = function (e) {
            "boolean" == typeof e && (console.warn("THREE.JSONLoader: showStatus parameter has been removed from constructor."), e = void 0), this.manager = void 0 !== e ? e : THREE.DefaultLoadingManager, this.withCredentials = !1
        }, THREE.JSONLoader.prototype = {
            constructor: THREE.JSONLoader, get statusDomElement() {
                return void 0 === this._statusDomElement && (this._statusDomElement = document.createElement("div")), console.warn("THREE.JSONLoader: .statusDomElement has been removed."), this._statusDomElement
            }, load: function (e, t, r, n) {
                var i = this, o = this.texturePath && "string" == typeof this.texturePath ? this.texturePath : THREE.Loader.prototype.extractUrlBase(e), a = new THREE.XHRLoader(this.manager); a.setCrossOrigin(this.crossOrigin), a.setWithCredentials(this.withCredentials), a.load(e, function (r) {
                    var n = JSON.parse(r), a = n.metadata; if (void 0 !== a) {
                        if ("object" === a.type) return void console.error("THREE.JSONLoader: " + e + " should be loaded with THREE.ObjectLoader instead."); if ("scene" === a.type) return void console.error("THREE.JSONLoader: " + e + " should be loaded with THREE.SceneLoader instead.")
                    } var s = i.parse(n, o); t(s.geometry, s.materials)
                })
            }, setCrossOrigin: function (e) {
                this.crossOrigin = e
            }, setTexturePath: function (e) {
                this.texturePath = e
            }, parse: function (e, t) {
                function r(t) {
                    function r(e, t) {
                        return e & 1 << t
                    } var n, i, o, s, h, c, u, l, p, f, d, E, m, g, v, T, y, R, x, H, b, w, M, S, _, C, A, L = e.faces, k = e.vertices, P = e.normals, D = e.colors, O = 0; if (void 0 !== e.uvs) {
                        for (n = 0; n < e.uvs.length; n++)e.uvs[n].length && O++; for (n = 0; O > n; n++)a.faceVertexUvs[n] = []
                    } for (s = 0, h = k.length; h > s;)R = new THREE.Vector3, R.x = k[s++] * t, R.y = k[s++] * t, R.z = k[s++] * t, a.vertices.push(R); for (s = 0, h = L.length; h > s;)if (f = L[s++], d = r(f, 0), E = r(f, 1), m = r(f, 3), g = r(f, 4), v = r(f, 5), T = r(f, 6), y = r(f, 7), d) {
                        if (H = new THREE.Face3, H.a = L[s], H.b = L[s + 1], H.c = L[s + 3], b = new THREE.Face3, b.a = L[s + 1], b.b = L[s + 2], b.c = L[s + 3], s += 4, E && (p = L[s++], H.materialIndex = p, b.materialIndex = p), o = a.faces.length, m) for (n = 0; O > n; n++)for (S = e.uvs[n], a.faceVertexUvs[n][o] = [], a.faceVertexUvs[n][o + 1] = [], i = 0; 4 > i; i++)l = L[s++], C = S[2 * l], A = S[2 * l + 1], _ = new THREE.Vector2(C, A), 2 !== i && a.faceVertexUvs[n][o].push(_), 0 !== i && a.faceVertexUvs[n][o + 1].push(_); if (g && (u = 3 * L[s++], H.normal.set(P[u++], P[u++], P[u]), b.normal.copy(H.normal)), v) for (n = 0; 4 > n; n++)u = 3 * L[s++], M = new THREE.Vector3(P[u++], P[u++], P[u]), 2 !== n && H.vertexNormals.push(M), 0 !== n && b.vertexNormals.push(M); if (T && (c = L[s++], w = D[c], H.color.setHex(w), b.color.setHex(w)), y) for (n = 0; 4 > n; n++)c = L[s++], w = D[c], 2 !== n && H.vertexColors.push(new THREE.Color(w)), 0 !== n && b.vertexColors.push(new THREE.Color(w)); a.faces.push(H), a.faces.push(b)
                    } else {
                        if (x = new THREE.Face3, x.a = L[s++], x.b = L[s++], x.c = L[s++], E && (p = L[s++], x.materialIndex = p), o = a.faces.length, m) for (n = 0; O > n; n++)for (S = e.uvs[n], a.faceVertexUvs[n][o] = [], i = 0; 3 > i; i++)l = L[s++], C = S[2 * l], A = S[2 * l + 1], _ = new THREE.Vector2(C, A), a.faceVertexUvs[n][o].push(_); if (g && (u = 3 * L[s++], x.normal.set(P[u++], P[u++], P[u])), v) for (n = 0; 3 > n; n++)u = 3 * L[s++], M = new THREE.Vector3(P[u++], P[u++], P[u]), x.vertexNormals.push(M); if (T && (c = L[s++], x.color.setHex(D[c])), y) for (n = 0; 3 > n; n++)c = L[s++], x.vertexColors.push(new THREE.Color(D[c])); a.faces.push(x)
                    }
                } function n() {
                    var t = void 0 !== e.influencesPerVertex ? e.influencesPerVertex : 2; if (e.skinWeights) for (var r = 0, n = e.skinWeights.length; n > r; r += t) {
                        var i = e.skinWeights[r], o = t > 1 ? e.skinWeights[r + 1] : 0, s = t > 2 ? e.skinWeights[r + 2] : 0, h = t > 3 ? e.skinWeights[r + 3] : 0; a.skinWeights.push(new THREE.Vector4(i, o, s, h))
                    } if (e.skinIndices) for (var r = 0, n = e.skinIndices.length; n > r; r += t) {
                        var c = e.skinIndices[r], u = t > 1 ? e.skinIndices[r + 1] : 0, l = t > 2 ? e.skinIndices[r + 2] : 0, p = t > 3 ? e.skinIndices[r + 3] : 0; a.skinIndices.push(new THREE.Vector4(c, u, l, p))
                    } a.bones = e.bones, a.bones && a.bones.length > 0 && (a.skinWeights.length !== a.skinIndices.length || a.skinIndices.length !== a.vertices.length) && console.warn("When skinning, number of vertices (" + a.vertices.length + "), skinIndices (" + a.skinIndices.length + "), and skinWeights (" + a.skinWeights.length + ") should match.")
                } function i(t) {
                    if (void 0 !== e.morphTargets) for (var r = 0, n = e.morphTargets.length; n > r; r++) {
                        a.morphTargets[r] = {}, a.morphTargets[r].name = e.morphTargets[r].name, a.morphTargets[r].vertices = []; for (var i = a.morphTargets[r].vertices, o = e.morphTargets[r].vertices, s = 0, h = o.length; h > s; s += 3) {
                            var c = new THREE.Vector3; c.x = o[s] * t, c.y = o[s + 1] * t, c.z = o[s + 2] * t, i.push(c)
                        }
                    } if (void 0 !== e.morphColors && e.morphColors.length > 0) {
                        console.warn('THREE.JSONLoader: "morphColors" no longer supported. Using them as face colors.'); for (var u = a.faces, l = e.morphColors[0].colors, r = 0, n = u.length; n > r; r++)u[r].color.fromArray(l, 3 * r)
                    }
                } function o() {
                    var t = [], r = []; void 0 !== e.animation && r.push(e.animation), void 0 !== e.animations && (e.animations.length ? r = r.concat(e.animations) : r.push(e.animations)); for (var n = 0; n < r.length; n++) {
                        var i = THREE.AnimationClip.parseAnimation(r[n], a.bones); i && t.push(i)
                    } if (a.morphTargets) {
                        var o = THREE.AnimationClip.CreateClipsFromMorphTargetSequences(a.morphTargets, 10); t = t.concat(o)
                    } t.length > 0 && (a.animations = t)
                } var a = new THREE.Geometry, s = void 0 !== e.scale ? 1 / e.scale : 1; if (r(s), n(), i(s), o(), a.computeFaceNormals(), a.computeBoundingSphere(), void 0 === e.materials || 0 === e.materials.length) return {
                    geometry: a
                }; var h = THREE.Loader.prototype.initMaterials(e.materials, t, this.crossOrigin); return {
                    geometry: a, materials: h
                }
            }
        }, THREE.LoadingManager = function (e, t, r) {
            var n = this, i = !1, o = 0, a = 0; this.onStart = void 0, this.onLoad = e, this.onProgress = t, this.onError = r, this.itemStart = function (e) {
                a++, i === !1 && void 0 !== n.onStart && n.onStart(e, o, a), i = !0
            }, this.itemEnd = function (e) {
                o++, void 0 !== n.onProgress && n.onProgress(e, o, a), o === a && (i = !1, void 0 !== n.onLoad && n.onLoad())
            }, this.itemError = function (e) {
                void 0 !== n.onError && n.onError(e)
            }
        }, THREE.DefaultLoadingManager = new THREE.LoadingManager, THREE.BufferGeometryLoader = function (e) {
            this.manager = void 0 !== e ? e : THREE.DefaultLoadingManager
        }, THREE.BufferGeometryLoader.prototype = {
            constructor: THREE.BufferGeometryLoader, load: function (e, t, r, n) {
                var i = this, o = new THREE.XHRLoader(i.manager); o.setCrossOrigin(this.crossOrigin), o.load(e, function (e) {
                    t(i.parse(JSON.parse(e)))
                }, r, n)
            }, setCrossOrigin: function (e) {
                this.crossOrigin = e
            }, parse: function (e) {
                var t = new THREE.BufferGeometry, r = e.data.index; if (void 0 !== r) {
                    var n = new self[r.type](r.array); t.setIndex(new THREE.BufferAttribute(n, 1))
                } var i = e.data.attributes; for (var o in i) {
                    var a = i[o], n = new self[a.type](a.array); t.addAttribute(o, new THREE.BufferAttribute(n, a.itemSize))
                } var s = e.data.groups || e.data.drawcalls || e.data.offsets; if (void 0 !== s) for (var h = 0, c = s.length; h !== c; ++h) {
                    var u = s[h]; t.addGroup(u.start, u.count)
                } var l = e.data.boundingSphere; if (void 0 !== l) {
                    var p = new THREE.Vector3; void 0 !== l.center && p.fromArray(l.center), t.boundingSphere = new THREE.Sphere(p, l.radius)
                } return t
            }
        }, THREE.MaterialLoader = function (e) {
            this.manager = void 0 !== e ? e : THREE.DefaultLoadingManager, this.textures = {}
        }, THREE.MaterialLoader.prototype = {
            constructor: THREE.MaterialLoader, load: function (e, t, r, n) {
                var i = this, o = new THREE.XHRLoader(i.manager); o.setCrossOrigin(this.crossOrigin), o.load(e, function (e) {
                    t(i.parse(JSON.parse(e)))
                }, r, n)
            }, setCrossOrigin: function (e) {
                this.crossOrigin = e
            }, setTextures: function (e) {
                this.textures = e
            }, getTexture: function (e) {
                var t = this.textures; return void 0 === t[e] && console.warn("THREE.MaterialLoader: Undefined texture", e), t[e]
            }, parse: function (e) {
                var t = new THREE[e.type]; if (t.uuid = e.uuid, void 0 !== e.name && (t.name = e.name), void 0 !== e.color && t.color.setHex(e.color), void 0 !== e.emissive && t.emissive.setHex(e.emissive), void 0 !== e.specular && t.specular.setHex(e.specular), void 0 !== e.shininess && (t.shininess = e.shininess), void 0 !== e.uniforms && (t.uniforms = e.uniforms), void 0 !== e.vertexShader && (t.vertexShader = e.vertexShader), void 0 !== e.fragmentShader && (t.fragmentShader = e.fragmentShader), void 0 !== e.vertexColors && (t.vertexColors = e.vertexColors), void 0 !== e.shading && (t.shading = e.shading), void 0 !== e.blending && (t.blending = e.blending), void 0 !== e.side && (t.side = e.side), void 0 !== e.opacity && (t.opacity = e.opacity), void 0 !== e.transparent && (t.transparent = e.transparent), void 0 !== e.alphaTest && (t.alphaTest = e.alphaTest), void 0 !== e.depthTest && (t.depthTest = e.depthTest), void 0 !== e.depthWrite && (t.depthWrite = e.depthWrite), void 0 !== e.wireframe && (t.wireframe = e.wireframe), void 0 !== e.wireframeLinewidth && (t.wireframeLinewidth = e.wireframeLinewidth), void 0 !== e.size && (t.size = e.size), void 0 !== e.sizeAttenuation && (t.sizeAttenuation = e.sizeAttenuation), void 0 !== e.map && (t.map = this.getTexture(e.map)), void 0 !== e.alphaMap && (t.alphaMap = this.getTexture(e.alphaMap), t.transparent = !0), void 0 !== e.bumpMap && (t.bumpMap = this.getTexture(e.bumpMap)), void 0 !== e.bumpScale && (t.bumpScale = e.bumpScale), void 0 !== e.normalMap && (t.normalMap = this.getTexture(e.normalMap)), e.normalScale && (t.normalScale = new THREE.Vector2(e.normalScale, e.normalScale)), void 0 !== e.displacementMap && (t.displacementMap = this.getTexture(e.displacementMap)), void 0 !== e.displacementScale && (t.displacementScale = e.displacementScale), void 0 !== e.displacementBias && (t.displacementBias = e.displacementBias), void 0 !== e.specularMap && (t.specularMap = this.getTexture(e.specularMap)), void 0 !== e.envMap && (t.envMap = this.getTexture(e.envMap), t.combine = THREE.MultiplyOperation), e.reflectivity && (t.reflectivity = e.reflectivity), void 0 !== e.lightMap && (t.lightMap = this.getTexture(e.lightMap)), void 0 !== e.lightMapIntensity && (t.lightMapIntensity = e.lightMapIntensity), void 0 !== e.aoMap && (t.aoMap = this.getTexture(e.aoMap)), void 0 !== e.aoMapIntensity && (t.aoMapIntensity = e.aoMapIntensity), void 0 !== e.materials) for (var r = 0, n = e.materials.length; n > r; r++)t.materials.push(this.parse(e.materials[r])); return t
            }
        }, THREE.ObjectLoader = function (e) {
            this.manager = void 0 !== e ? e : THREE.DefaultLoadingManager, this.texturePath = ""
        }, THREE.ObjectLoader.prototype = {
            constructor: THREE.ObjectLoader, load: function (e, t, r, n) {
                "" === this.texturePath && (this.texturePath = e.substring(0, e.lastIndexOf("/") + 1)); var i = this, o = new THREE.XHRLoader(i.manager); o.setCrossOrigin(this.crossOrigin), o.load(e, function (e) {
                    i.parse(JSON.parse(e), t)
                }, r, n)
            }, setTexturePath: function (e) {
                this.texturePath = e
            }, setCrossOrigin: function (e) {
                this.crossOrigin = e
            }, parse: function (e, t) {
                var r = this.parseGeometries(e.geometries), n = this.parseImages(e.images, function () {
                    void 0 !== t && t(a)
                }), i = this.parseTextures(e.textures, n), o = this.parseMaterials(e.materials, i), a = this.parseObject(e.object, r, o); return e.animations && (a.animations = this.parseAnimations(e.animations)), (void 0 === e.images || 0 === e.images.length) && void 0 !== t && t(a), a
            }, parseGeometries: function (e) {
                var t = {}; if (void 0 !== e) for (var r = new THREE.JSONLoader, n = new THREE.BufferGeometryLoader, i = 0, o = e.length; o > i; i++) {
                    var a, s = e[i]; switch (s.type) {
                        case "PlaneGeometry": case "PlaneBufferGeometry": a = new THREE[s.type](s.width, s.height, s.widthSegments, s.heightSegments); break; case "BoxGeometry": case "CubeGeometry": a = new THREE.BoxGeometry(s.width, s.height, s.depth, s.widthSegments, s.heightSegments, s.depthSegments); break; case "CircleBufferGeometry": a = new THREE.CircleBufferGeometry(s.radius, s.segments, s.thetaStart, s.thetaLength); break; case "CircleGeometry": a = new THREE.CircleGeometry(s.radius, s.segments, s.thetaStart, s.thetaLength); break; case "CylinderGeometry": a = new THREE.CylinderGeometry(s.radiusTop, s.radiusBottom, s.height, s.radialSegments, s.heightSegments, s.openEnded, s.thetaStart, s.thetaLength); break; case "SphereGeometry": a = new THREE.SphereGeometry(s.radius, s.widthSegments, s.heightSegments, s.phiStart, s.phiLength, s.thetaStart, s.thetaLength); break; case "SphereBufferGeometry": a = new THREE.SphereBufferGeometry(s.radius, s.widthSegments, s.heightSegments, s.phiStart, s.phiLength, s.thetaStart, s.thetaLength); break; case "DodecahedronGeometry": a = new THREE.DodecahedronGeometry(s.radius, s.detail); break; case "IcosahedronGeometry": a = new THREE.IcosahedronGeometry(s.radius, s.detail); break; case "OctahedronGeometry": a = new THREE.OctahedronGeometry(s.radius, s.detail); break; case "TetrahedronGeometry": a = new THREE.TetrahedronGeometry(s.radius, s.detail); break; case "RingGeometry": a = new THREE.RingGeometry(s.innerRadius, s.outerRadius, s.thetaSegments, s.phiSegments, s.thetaStart, s.thetaLength); break; case "TorusGeometry": a = new THREE.TorusGeometry(s.radius, s.tube, s.radialSegments, s.tubularSegments, s.arc); break; case "TorusKnotGeometry": a = new THREE.TorusKnotGeometry(s.radius, s.tube, s.radialSegments, s.tubularSegments, s.p, s.q, s.heightScale); break; case "BufferGeometry": a = n.parse(s); break; case "Geometry": a = r.parse(s.data, this.texturePath).geometry; break; default: console.warn('THREE.ObjectLoader: Unsupported geometry type "' + s.type + '"'); continue
                    }a.uuid = s.uuid, void 0 !== s.name && (a.name = s.name), t[s.uuid] = a
                } return t
            }, parseMaterials: function (e, t) {
                var r = {}; if (void 0 !== e) {
                    var n = new THREE.MaterialLoader; n.setTextures(t); for (var i = 0, o = e.length; o > i; i++) {
                        var a = n.parse(e[i]); r[a.uuid] = a
                    }
                } return r
            }, parseAnimations: function (e) {
                for (var t = [], r = 0; r < e.length; r++) {
                    var n = THREE.AnimationClip.parse(e[r]); t.push(n)
                } return t
            }, parseImages: function (e, t) {
                function r(e) {
                    return n.manager.itemStart(e), a.load(e, function () {
                        n.manager.itemEnd(e)
                    })
                } var n = this, i = {}; if (void 0 !== e && e.length > 0) {
                    var o = new THREE.LoadingManager(t), a = new THREE.ImageLoader(o); a.setCrossOrigin(this.crossOrigin); for (var s = 0, h = e.length; h > s; s++) {
                        var c = e[s], u = /^(\/\/)|([a-z]+:(\/\/)?)/i.test(c.url) ? c.url : n.texturePath + c.url; i[c.uuid] = r(u)
                    }
                } return i
            }, parseTextures: function (e, t) {
                function r(e) {
                    return "number" == typeof e ? e : (console.warn("THREE.ObjectLoader.parseTexture: Constant should be in numeric form.", e), THREE[e])
                } var n = {}; if (void 0 !== e) for (var i = 0, o = e.length; o > i; i++) {
                    var a = e[i]; void 0 === a.image && console.warn('THREE.ObjectLoader: No "image" specified for', a.uuid), void 0 === t[a.image] && console.warn("THREE.ObjectLoader: Undefined image", a.image); var s = new THREE.Texture(t[a.image]); s.needsUpdate = !0, s.uuid = a.uuid, void 0 !== a.name && (s.name = a.name), void 0 !== a.mapping && (s.mapping = r(a.mapping)), void 0 !== a.offset && (s.offset = new THREE.Vector2(a.offset[0], a.offset[1])), void 0 !== a.repeat && (s.repeat = new THREE.Vector2(a.repeat[0], a.repeat[1])), void 0 !== a.minFilter && (s.minFilter = r(a.minFilter)), void 0 !== a.magFilter && (s.magFilter = r(a.magFilter)), void 0 !== a.anisotropy && (s.anisotropy = a.anisotropy), Array.isArray(a.wrap) && (s.wrapS = r(a.wrap[0]), s.wrapT = r(a.wrap[1])), n[a.uuid] = s
                } return n
            }, parseObject: function () {
                var e = new THREE.Matrix4; return function (t, r, n) {
                    function i(e) {
                        return void 0 === r[e] && console.warn("THREE.ObjectLoader: Undefined geometry", e), r[e]
                    } function o(e) {
                        return void 0 !== e ? (void 0 === n[e] && console.warn("THREE.ObjectLoader: Undefined material", e), n[e]) : void 0
                    } var a; switch (t.type) {
                        case "Scene": a = new THREE.Scene; break; case "PerspectiveCamera": a = new THREE.PerspectiveCamera(t.fov, t.aspect, t.near, t.far); break; case "OrthographicCamera": a = new THREE.OrthographicCamera(t.left, t.right, t.top, t.bottom, t.near, t.far); break; case "AmbientLight": a = new THREE.AmbientLight(t.color); break; case "DirectionalLight": a = new THREE.DirectionalLight(t.color, t.intensity); break; case "PointLight": a = new THREE.PointLight(t.color, t.intensity, t.distance, t.decay); break; case "SpotLight": a = new THREE.SpotLight(t.color, t.intensity, t.distance, t.angle, t.exponent, t.decay); break; case "HemisphereLight": a = new THREE.HemisphereLight(t.color, t.groundColor, t.intensity); break; case "Mesh": a = new THREE.Mesh(i(t.geometry), o(t.material)); break; case "LOD": a = new THREE.LOD; break; case "Line": a = new THREE.Line(i(t.geometry), o(t.material), t.mode); break; case "PointCloud": case "Points": a = new THREE.Points(i(t.geometry), o(t.material)); break; case "Sprite": a = new THREE.Sprite(o(t.material)); break; case "Group": a = new THREE.Group; break; default: a = new THREE.Object3D
                    }if (a.uuid = t.uuid, void 0 !== t.name && (a.name = t.name), void 0 !== t.matrix ? (e.fromArray(t.matrix), e.decompose(a.position, a.quaternion, a.scale)) : (void 0 !== t.position && a.position.fromArray(t.position), void 0 !== t.rotation && a.rotation.fromArray(t.rotation), void 0 !== t.scale && a.scale.fromArray(t.scale)), void 0 !== t.castShadow && (a.castShadow = t.castShadow), void 0 !== t.receiveShadow && (a.receiveShadow = t.receiveShadow), void 0 !== t.visible && (a.visible = t.visible), void 0 !== t.userData && (a.userData = t.userData), void 0 !== t.children) for (var s in t.children) a.add(this.parseObject(t.children[s], r, n)); if ("LOD" === t.type) for (var h = t.levels, c = 0; c < h.length; c++) {
                        var u = h[c], s = a.getObjectByProperty("uuid", u.object); void 0 !== s && a.addLevel(s, u.distance)
                    } return a
                }
            }()
        }, THREE.TextureLoader = function (e) {
            this.manager = void 0 !== e ? e : THREE.DefaultLoadingManager
        }, THREE.TextureLoader.prototype = {
            constructor: THREE.TextureLoader, load: function (e, t, r, n) {
                var i = new THREE.Texture, o = new THREE.ImageLoader(this.manager); return o.setCrossOrigin(this.crossOrigin), o.load(e, function (e) {
                    i.image = e, i.needsUpdate = !0, void 0 !== t && t(i)
                }, r, n), i
            }, setCrossOrigin: function (e) {
                this.crossOrigin = e
            }
        }, THREE.CubeTextureLoader = function (e) {
            this.manager = void 0 !== e ? e : THREE.DefaultLoadingManager
        }, THREE.CubeTextureLoader.prototype = {
            constructor: THREE.CubeTextureLoader, load: function (e, t, r, n) {
                function i(r) {
                    a.load(e[r], function (e) {
                        o.images[r] = e, s++, 6 === s && (o.needsUpdate = !0, t && t(o))
                    }, void 0, n)
                } var o = new THREE.CubeTexture([]), a = new THREE.ImageLoader; a.setCrossOrigin(this.crossOrigin); for (var s = 0, h = 0; h < e.length; ++h)i(h); return o
            }, setCrossOrigin: function (e) {
                this.crossOrigin = e
            }
        }, THREE.DataTextureLoader = THREE.BinaryTextureLoader = function (e) {
            this.manager = void 0 !== e ? e : THREE.DefaultLoadingManager, this._parser = null
        }, THREE.BinaryTextureLoader.prototype = {
            constructor: THREE.BinaryTextureLoader, load: function (e, t, r, n) {
                var i = this, o = new THREE.DataTexture, a = new THREE.XHRLoader(this.manager); return a.setCrossOrigin(this.crossOrigin), a.setResponseType("arraybuffer"), a.load(e, function (e) {
                    var r = i._parser(e); r && (void 0 !== r.image ? o.image = r.image : void 0 !== r.data && (o.image.width = r.width, o.image.height = r.height, o.image.data = r.data), o.wrapS = void 0 !== r.wrapS ? r.wrapS : THREE.ClampToEdgeWrapping, o.wrapT = void 0 !== r.wrapT ? r.wrapT : THREE.ClampToEdgeWrapping, o.magFilter = void 0 !== r.magFilter ? r.magFilter : THREE.LinearFilter, o.minFilter = void 0 !== r.minFilter ? r.minFilter : THREE.LinearMipMapLinearFilter, o.anisotropy = void 0 !== r.anisotropy ? r.anisotropy : 1, void 0 !== r.format && (o.format = r.format), void 0 !== r.type && (o.type = r.type), void 0 !== r.mipmaps && (o.mipmaps = r.mipmaps), 1 === r.mipmapCount && (o.minFilter = THREE.LinearFilter), o.needsUpdate = !0, t && t(o, r))
                }, r, n), o
            }, setCrossOrigin: function (e) {
                this.crossOrigin = e
            }
        }, THREE.CompressedTextureLoader = function (e) {
            this.manager = void 0 !== e ? e : THREE.DefaultLoadingManager, this._parser = null
        }, THREE.CompressedTextureLoader.prototype = {
            constructor: THREE.CompressedTextureLoader, load: function (e, t, r, n) {
                var i = this, o = [], a = new THREE.CompressedTexture; a.image = o; var s = new THREE.XHRLoader(this.manager); if (s.setCrossOrigin(this.crossOrigin), s.setResponseType("arraybuffer"), Array.isArray(e)) for (var h = 0, c = function (c) {
                    s.load(e[c], function (e) {
                        var r = i._parser(e, !0); o[c] = {
                            width: r.width, height: r.height, format: r.format, mipmaps: r.mipmaps
                        }, h += 1, 6 === h && (1 === r.mipmapCount && (a.minFilter = THREE.LinearFilter), a.format = r.format, a.needsUpdate = !0, t && t(a))
                    }, r, n)
                }, u = 0, l = e.length; l > u; ++u)c(u); else s.load(e, function (e) {
                    var r = i._parser(e, !0); if (r.isCubemap) for (var n = r.mipmaps.length / r.mipmapCount, s = 0; n > s; s++) {
                        o[s] = {
                            mipmaps: []
                        }; for (var h = 0; h < r.mipmapCount; h++)o[s].mipmaps.push(r.mipmaps[s * r.mipmapCount + h]), o[s].format = r.format, o[s].width = r.width, o[s].height = r.height
                    } else a.image.width = r.width, a.image.height = r.height, a.mipmaps = r.mipmaps; 1 === r.mipmapCount && (a.minFilter = THREE.LinearFilter), a.format = r.format, a.needsUpdate = !0, t && t(a)
                }, r, n); return a
            }, setCrossOrigin: function (e) {
                this.crossOrigin = e
            }
        }, THREE.Material = function () {
            Object.defineProperty(this, "id", {
                value: THREE.MaterialIdCount++
            }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.type = "Material", this.side = THREE.FrontSide, this.opacity = 1, this.transparent = !1, this.blending = THREE.NormalBlending, this.blendSrc = THREE.SrcAlphaFactor, this.blendDst = THREE.OneMinusSrcAlphaFactor, this.blendEquation = THREE.AddEquation, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.depthFunc = THREE.LessEqualDepth, this.depthTest = !0, this.depthWrite = !0, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.alphaTest = 0, this.overdraw = 0, this.visible = !0, this._needsUpdate = !0
        }, THREE.Material.prototype = {
            constructor: THREE.Material, get needsUpdate() {
                return this._needsUpdate
            }, set needsUpdate(e) {
                e === !0 && this.update(), this._needsUpdate = e
            }, setValues: function (e) {
                if (void 0 !== e) for (var t in e) {
                    var r = e[t]; if (void 0 !== r) {
                        var n = this[t]; void 0 !== n ? n instanceof THREE.Color ? n.set(r) : n instanceof THREE.Vector3 && r instanceof THREE.Vector3 ? n.copy(r) : "overdraw" === t ? this[t] = Number(r) : this[t] = r : console.warn("THREE." + this.type + ": '" + t + "' is not a property of this material.")
                    } else console.warn("THREE.Material: '" + t + "' parameter is undefined.")
                }
            }, toJSON: function (e) {
                var t = {
                    metadata: {
                        version: 4.4, type: "Material", generator: "Material.toJSON"
                    }
                }; return t.uuid = this.uuid, t.type = this.type, "" !== this.name && (t.name = this.name), this.color instanceof THREE.Color && (t.color = this.color.getHex()), this.emissive instanceof THREE.Color && (t.emissive = this.emissive.getHex()), this.specular instanceof THREE.Color && (t.specular = this.specular.getHex()), void 0 !== this.shininess && (t.shininess = this.shininess), this.map instanceof THREE.Texture && (t.map = this.map.toJSON(e).uuid), this.alphaMap instanceof THREE.Texture && (t.alphaMap = this.alphaMap.toJSON(e).uuid), this.lightMap instanceof THREE.Texture && (t.lightMap = this.lightMap.toJSON(e).uuid), this.bumpMap instanceof THREE.Texture && (t.bumpMap = this.bumpMap.toJSON(e).uuid, t.bumpScale = this.bumpScale), this.normalMap instanceof THREE.Texture && (t.normalMap = this.normalMap.toJSON(e).uuid, t.normalScale = this.normalScale), this.displacementMap instanceof THREE.Texture && (t.displacementMap = this.displacementMap.toJSON(e).uuid, t.displacementScale = this.displacementScale, t.displacementBias = this.displacementBias), this.specularMap instanceof THREE.Texture && (t.specularMap = this.specularMap.toJSON(e).uuid), this.envMap instanceof THREE.Texture && (t.envMap = this.envMap.toJSON(e).uuid, t.reflectivity = this.reflectivity), void 0 !== this.size && (t.size = this.size), void 0 !== this.sizeAttenuation && (t.sizeAttenuation = this.sizeAttenuation), void 0 !== this.vertexColors && this.vertexColors !== THREE.NoColors && (t.vertexColors = this.vertexColors), void 0 !== this.shading && this.shading !== THREE.SmoothShading && (t.shading = this.shading), void 0 !== this.blending && this.blending !== THREE.NormalBlending && (t.blending = this.blending), void 0 !== this.side && this.side !== THREE.FrontSide && (t.side = this.side), this.opacity < 1 && (t.opacity = this.opacity), this.transparent === !0 && (t.transparent = this.transparent), this.alphaTest > 0 && (t.alphaTest = this.alphaTest), this.wireframe === !0 && (t.wireframe = this.wireframe), this.wireframeLinewidth > 1 && (t.wireframeLinewidth = this.wireframeLinewidth), t
            }, clone: function () {
                return (new this.constructor).copy(this)
            }, copy: function (e) {
                return this.name = e.name, this.side = e.side, this.opacity = e.opacity, this.transparent = e.transparent, this.blending = e.blending, this.blendSrc = e.blendSrc, this.blendDst = e.blendDst, this.blendEquation = e.blendEquation, this.blendSrcAlpha = e.blendSrcAlpha, this.blendDstAlpha = e.blendDstAlpha, this.blendEquationAlpha = e.blendEquationAlpha, this.depthFunc = e.depthFunc, this.depthTest = e.depthTest, this.depthWrite = e.depthWrite, this.precision = e.precision, this.polygonOffset = e.polygonOffset, this.polygonOffsetFactor = e.polygonOffsetFactor, this.polygonOffsetUnits = e.polygonOffsetUnits, this.alphaTest = e.alphaTest, this.overdraw = e.overdraw, this.visible = e.visible, this
            }, update: function () {
                this.dispatchEvent({
                    type: "update"
                })
            }, dispose: function () {
                this.dispatchEvent({
                    type: "dispose"
                })
            }, get wrapAround() {
                console.warn("THREE." + this.type + ": .wrapAround has been removed.")
            }, set wrapAround(e) {
                console.warn("THREE." + this.type + ": .wrapAround has been removed.")
            }, get wrapRGB() {
                return console.warn("THREE." + this.type + ": .wrapRGB has been removed."), new THREE.Color
            }
        }, THREE.EventDispatcher.prototype.apply(THREE.Material.prototype), THREE.MaterialIdCount = 0, THREE.LineBasicMaterial = function (e) {
            THREE.Material.call(this), this.type = "LineBasicMaterial", this.color = new THREE.Color(16777215), this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.vertexColors = THREE.NoColors, this.fog = !0, this.setValues(e)
        }, THREE.LineBasicMaterial.prototype = Object.create(THREE.Material.prototype), THREE.LineBasicMaterial.prototype.constructor = THREE.LineBasicMaterial, THREE.LineBasicMaterial.prototype.copy = function (e) {
            return THREE.Material.prototype.copy.call(this, e), this.color.copy(e.color), this.linewidth = e.linewidth, this.linecap = e.linecap, this.linejoin = e.linejoin, this.vertexColors = e.vertexColors, this.fog = e.fog, this
        }, THREE.LineDashedMaterial = function (e) {
            THREE.Material.call(this), this.type = "LineDashedMaterial", this.color = new THREE.Color(16777215), this.linewidth = 1, this.scale = 1, this.dashSize = 3, this.gapSize = 1, this.vertexColors = !1, this.fog = !0, this.setValues(e)
        }, THREE.LineDashedMaterial.prototype = Object.create(THREE.Material.prototype), THREE.LineDashedMaterial.prototype.constructor = THREE.LineDashedMaterial, THREE.LineDashedMaterial.prototype.copy = function (e) {
            return THREE.Material.prototype.copy.call(this, e), this.color.copy(e.color), this.linewidth = e.linewidth, this.scale = e.scale, this.dashSize = e.dashSize, this.gapSize = e.gapSize, this.vertexColors = e.vertexColors, this.fog = e.fog, this
        }, THREE.MeshBasicMaterial = function (e) {
            THREE.Material.call(this), this.type = "MeshBasicMaterial", this.color = new THREE.Color(16777215), this.map = null, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.combine = THREE.MultiplyOperation, this.reflectivity = 1, this.refractionRatio = .98, this.fog = !0, this.shading = THREE.SmoothShading, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.vertexColors = THREE.NoColors, this.skinning = !1, this.morphTargets = !1, this.setValues(e)
        }, THREE.MeshBasicMaterial.prototype = Object.create(THREE.Material.prototype), THREE.MeshBasicMaterial.prototype.constructor = THREE.MeshBasicMaterial, THREE.MeshBasicMaterial.prototype.copy = function (e) {
            return THREE.Material.prototype.copy.call(this, e), this.color.copy(e.color), this.map = e.map, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.fog = e.fog, this.shading = e.shading, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.vertexColors = e.vertexColors, this.skinning = e.skinning, this.morphTargets = e.morphTargets, this
        }, THREE.MeshLambertMaterial = function (e) {
            THREE.Material.call(this), this.type = "MeshLambertMaterial", this.color = new THREE.Color(16777215), this.emissive = new THREE.Color(0), this.map = null, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.combine = THREE.MultiplyOperation, this.reflectivity = 1, this.refractionRatio = .98, this.fog = !0, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.vertexColors = THREE.NoColors, this.skinning = !1, this.morphTargets = !1, this.morphNormals = !1, this.setValues(e)
        }, THREE.MeshLambertMaterial.prototype = Object.create(THREE.Material.prototype), THREE.MeshLambertMaterial.prototype.constructor = THREE.MeshLambertMaterial, THREE.MeshLambertMaterial.prototype.copy = function (e) {
            return THREE.Material.prototype.copy.call(this, e), this.color.copy(e.color), this.emissive.copy(e.emissive), this.map = e.map, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.fog = e.fog, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.vertexColors = e.vertexColors, this.skinning = e.skinning, this.morphTargets = e.morphTargets, this.morphNormals = e.morphNormals, this
        }, THREE.MeshPhongMaterial = function (e) {
            THREE.Material.call(this), this.type = "MeshPhongMaterial", this.color = new THREE.Color(16777215), this.emissive = new THREE.Color(0), this.specular = new THREE.Color(1118481), this.shininess = 30, this.metal = !1, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalScale = new THREE.Vector2(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.combine = THREE.MultiplyOperation, this.reflectivity = 1, this.refractionRatio = .98, this.fog = !0, this.shading = THREE.SmoothShading, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.vertexColors = THREE.NoColors, this.skinning = !1, this.morphTargets = !1, this.morphNormals = !1, this.setValues(e)
        }, THREE.MeshPhongMaterial.prototype = Object.create(THREE.Material.prototype), THREE.MeshPhongMaterial.prototype.constructor = THREE.MeshPhongMaterial, THREE.MeshPhongMaterial.prototype.copy = function (e) {
            return THREE.Material.prototype.copy.call(this, e), this.color.copy(e.color), this.emissive.copy(e.emissive), this.specular.copy(e.specular), this.shininess = e.shininess, this.metal = e.metal, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissiveMap = e.emissiveMap, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.fog = e.fog, this.shading = e.shading, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.vertexColors = e.vertexColors, this.skinning = e.skinning, this.morphTargets = e.morphTargets, this.morphNormals = e.morphNormals, this
        }, THREE.MeshDepthMaterial = function (e) {
            THREE.Material.call(this), this.type = "MeshDepthMaterial", this.morphTargets = !1, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e)
        }, THREE.MeshDepthMaterial.prototype = Object.create(THREE.Material.prototype), THREE.MeshDepthMaterial.prototype.constructor = THREE.MeshDepthMaterial, THREE.MeshDepthMaterial.prototype.copy = function (e) {
            return THREE.Material.prototype.copy.call(this, e), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this
        }, THREE.MeshNormalMaterial = function (e) {
            THREE.Material.call(this, e), this.type = "MeshNormalMaterial", this.wireframe = !1, this.wireframeLinewidth = 1, this.morphTargets = !1, this.setValues(e)
        }, THREE.MeshNormalMaterial.prototype = Object.create(THREE.Material.prototype), THREE.MeshNormalMaterial.prototype.constructor = THREE.MeshNormalMaterial, THREE.MeshNormalMaterial.prototype.copy = function (e) {
            return THREE.Material.prototype.copy.call(this, e), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this
        }, THREE.MultiMaterial = function (e) {
            this.uuid = THREE.Math.generateUUID(), this.type = "MultiMaterial", this.materials = e instanceof Array ? e : [], this.visible = !0
        }, THREE.MultiMaterial.prototype = {
            constructor: THREE.MultiMaterial, toJSON: function () {
                for (var e = {
                    metadata: {
                        version: 4.2, type: "material", generator: "MaterialExporter"
                    }, uuid: this.uuid, type: this.type, materials: []
                }, t = 0, r = this.materials.length; r > t; t++)e.materials.push(this.materials[t].toJSON()); return e.visible = this.visible, e
            }, clone: function () {
                for (var e = new this.constructor, t = 0; t < this.materials.length; t++)e.materials.push(this.materials[t].clone()); return e.visible = this.visible, e
            }
        }, THREE.MeshFaceMaterial = THREE.MultiMaterial, THREE.PointsMaterial = function (e) {
            THREE.Material.call(this), this.type = "PointsMaterial", this.color = new THREE.Color(16777215), this.map = null, this.size = 1, this.sizeAttenuation = !0, this.vertexColors = THREE.NoColors, this.fog = !0, this.setValues(e)
        }, THREE.PointsMaterial.prototype = Object.create(THREE.Material.prototype), THREE.PointsMaterial.prototype.constructor = THREE.PointsMaterial, THREE.PointsMaterial.prototype.copy = function (e) {
            return THREE.Material.prototype.copy.call(this, e), this.color.copy(e.color), this.map = e.map, this.size = e.size, this.sizeAttenuation = e.sizeAttenuation, this.vertexColors = e.vertexColors, this.fog = e.fog, this
        }, THREE.PointCloudMaterial = function (e) {
            return console.warn("THREE.PointCloudMaterial has been renamed to THREE.PointsMaterial."), new THREE.PointsMaterial(e)
        }, THREE.ParticleBasicMaterial = function (e) {
            return console.warn("THREE.ParticleBasicMaterial has been renamed to THREE.PointsMaterial."), new THREE.PointsMaterial(e)
        }, THREE.ParticleSystemMaterial = function (e) {
            return console.warn("THREE.ParticleSystemMaterial has been renamed to THREE.PointsMaterial."), new THREE.PointsMaterial(e)
        }, THREE.ShaderMaterial = function (e) {
            THREE.Material.call(this), this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.vertexShader = "void main() {\n	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}", this.fragmentShader = "void main() {\n	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}", this.shading = THREE.SmoothShading, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.vertexColors = THREE.NoColors, this.skinning = !1, this.morphTargets = !1, this.morphNormals = !1, this.derivatives = !1, this.defaultAttributeValues = {
                color: [1, 1, 1], uv: [0, 0], uv2: [0, 0]
            }, this.index0AttributeName = void 0, void 0 !== e && (void 0 !== e.attributes && console.error("THREE.ShaderMaterial: attributes should now be defined in THREE.BufferGeometry instead."), this.setValues(e))
        }, THREE.ShaderMaterial.prototype = Object.create(THREE.Material.prototype), THREE.ShaderMaterial.prototype.constructor = THREE.ShaderMaterial, THREE.ShaderMaterial.prototype.copy = function (e) {
            return THREE.Material.prototype.copy.call(this, e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = THREE.UniformsUtils.clone(e.uniforms), this.attributes = e.attributes, this.defines = e.defines, this.shading = e.shading, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.vertexColors = e.vertexColors, this.skinning = e.skinning, this.morphTargets = e.morphTargets, this.morphNormals = e.morphNormals, this.derivatives = e.derivatives, this
        }, THREE.ShaderMaterial.prototype.toJSON = function (e) {
            var t = THREE.Material.prototype.toJSON.call(this, e); return t.uniforms = this.uniforms, t.attributes = this.attributes, t.vertexShader = this.vertexShader, t.fragmentShader = this.fragmentShader, t
        }, THREE.RawShaderMaterial = function (e) {
            THREE.ShaderMaterial.call(this, e), this.type = "RawShaderMaterial"
        }, THREE.RawShaderMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype), THREE.RawShaderMaterial.prototype.constructor = THREE.RawShaderMaterial, THREE.SpriteMaterial = function (e) {
            THREE.Material.call(this), this.type = "SpriteMaterial", this.color = new THREE.Color(16777215), this.map = null, this.rotation = 0, this.fog = !1, this.setValues(e)
        }, THREE.SpriteMaterial.prototype = Object.create(THREE.Material.prototype), THREE.SpriteMaterial.prototype.constructor = THREE.SpriteMaterial, THREE.SpriteMaterial.prototype.copy = function (e) {
            return THREE.Material.prototype.copy.call(this, e), this.color.copy(e.color), this.map = e.map, this.rotation = e.rotation, this.fog = e.fog, this
        }, THREE.Texture = function (e, t, r, n, i, o, a, s, h) {
            Object.defineProperty(this, "id", {
                value: THREE.TextureIdCount++
            }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.sourceFile = "", this.image = void 0 !== e ? e : THREE.Texture.DEFAULT_IMAGE, this.mipmaps = [], this.mapping = void 0 !== t ? t : THREE.Texture.DEFAULT_MAPPING, this.wrapS = void 0 !== r ? r : THREE.ClampToEdgeWrapping, this.wrapT = void 0 !== n ? n : THREE.ClampToEdgeWrapping, this.magFilter = void 0 !== i ? i : THREE.LinearFilter, this.minFilter = void 0 !== o ? o : THREE.LinearMipMapLinearFilter, this.anisotropy = void 0 !== h ? h : 1, this.format = void 0 !== a ? a : THREE.RGBAFormat, this.type = void 0 !== s ? s : THREE.UnsignedByteType, this.offset = new THREE.Vector2(0, 0), this.repeat = new THREE.Vector2(1, 1), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.version = 0, this.onUpdate = null
        }, THREE.Texture.DEFAULT_IMAGE = void 0, THREE.Texture.DEFAULT_MAPPING = THREE.UVMapping, THREE.Texture.prototype = {
            constructor: THREE.Texture, set needsUpdate(e) {
                e === !0 && this.version++
            }, clone: function () {
                return (new this.constructor).copy(this)
            }, copy: function (e) {
                return this.image = e.image, this.mipmaps = e.mipmaps.slice(0), this.mapping = e.mapping, this.wrapS = e.wrapS, this.wrapT = e.wrapT, this.magFilter = e.magFilter, this.minFilter = e.minFilter, this.anisotropy = e.anisotropy, this.format = e.format, this.type = e.type, this.offset.copy(e.offset), this.repeat.copy(e.repeat), this.generateMipmaps = e.generateMipmaps, this.premultiplyAlpha = e.premultiplyAlpha, this.flipY = e.flipY, this.unpackAlignment = e.unpackAlignment, this
            }, toJSON: function (e) {
                function t(e) {
                    var t; return void 0 !== e.toDataURL ? t = e : (t = document.createElement("canvas"), t.width = e.width, t.height = e.height, t.getContext("2d").drawImage(e, 0, 0, e.width, e.height)), t.width > 2048 || t.height > 2048 ? t.toDataURL("image/jpeg", .6) : t.toDataURL("image/png")
                } if (void 0 !== e.textures[this.uuid]) return e.textures[this.uuid]; var r = {
                    metadata: {
                        version: 4.4, type: "Texture", generator: "Texture.toJSON"
                    }, uuid: this.uuid, name: this.name, mapping: this.mapping, repeat: [this.repeat.x, this.repeat.y], offset: [this.offset.x, this.offset.y], wrap: [this.wrapS, this.wrapT], minFilter: this.minFilter, magFilter: this.magFilter, anisotropy: this.anisotropy
                }; if (void 0 !== this.image) {
                    var n = this.image; void 0 === n.uuid && (n.uuid = THREE.Math.generateUUID()), void 0 === e.images[n.uuid] && (e.images[n.uuid] = {
                        uuid: n.uuid, url: t(n)
                    }), r.image = n.uuid
                } return e.textures[this.uuid] = r, r
            }, dispose: function () {
                this.dispatchEvent({
                    type: "dispose"
                })
            }, transformUv: function (e) {
                if (this.mapping === THREE.UVMapping) {
                    if (e.multiply(this.repeat), e.add(this.offset), e.x < 0 || e.x > 1) switch (this.wrapS) {
                        case THREE.RepeatWrapping: e.x = e.x - Math.floor(e.x); break; case THREE.ClampToEdgeWrapping: e.x = e.x < 0 ? 0 : 1; break; case THREE.MirroredRepeatWrapping: 1 === Math.abs(Math.floor(e.x) % 2) ? e.x = Math.ceil(e.x) - e.x : e.x = e.x - Math.floor(e.x)
                    }if (e.y < 0 || e.y > 1) switch (this.wrapT) {
                        case THREE.RepeatWrapping: e.y = e.y - Math.floor(e.y); break; case THREE.ClampToEdgeWrapping: e.y = e.y < 0 ? 0 : 1; break; case THREE.MirroredRepeatWrapping: 1 === Math.abs(Math.floor(e.y) % 2) ? e.y = Math.ceil(e.y) - e.y : e.y = e.y - Math.floor(e.y)
                    }this.flipY && (e.y = 1 - e.y);
                }
            }
        }, THREE.EventDispatcher.prototype.apply(THREE.Texture.prototype), THREE.TextureIdCount = 0, THREE.CanvasTexture = function (e, t, r, n, i, o, a, s, h) {
            THREE.Texture.call(this, e, t, r, n, i, o, a, s, h), this.needsUpdate = !0
        }, THREE.CanvasTexture.prototype = Object.create(THREE.Texture.prototype), THREE.CanvasTexture.prototype.constructor = THREE.CanvasTexture, THREE.CubeTexture = function (e, t, r, n, i, o, a, s, h) {
            t = void 0 !== t ? t : THREE.CubeReflectionMapping, THREE.Texture.call(this, e, t, r, n, i, o, a, s, h), this.images = e, this.flipY = !1
        }, THREE.CubeTexture.prototype = Object.create(THREE.Texture.prototype), THREE.CubeTexture.prototype.constructor = THREE.CubeTexture, THREE.CubeTexture.prototype.copy = function (e) {
            return THREE.Texture.prototype.copy.call(this, e), this.images = e.images, this
        }, THREE.CompressedTexture = function (e, t, r, n, i, o, a, s, h, c, u) {
            THREE.Texture.call(this, null, o, a, s, h, c, n, i, u), this.image = {
                width: t, height: r
            }, this.mipmaps = e, this.flipY = !1, this.generateMipmaps = !1
        }, THREE.CompressedTexture.prototype = Object.create(THREE.Texture.prototype), THREE.CompressedTexture.prototype.constructor = THREE.CompressedTexture, THREE.DataTexture = function (e, t, r, n, i, o, a, s, h, c, u) {
            THREE.Texture.call(this, null, o, a, s, h, c, n, i, u), this.image = {
                data: e, width: t, height: r
            }, this.magFilter = void 0 !== h ? h : THREE.NearestFilter, this.minFilter = void 0 !== c ? c : THREE.NearestFilter, this.flipY = !1, this.generateMipmaps = !1
        }, THREE.DataTexture.prototype = Object.create(THREE.Texture.prototype), THREE.DataTexture.prototype.constructor = THREE.DataTexture, THREE.VideoTexture = function (e, t, r, n, i, o, a, s, h) {
            function c() {
                requestAnimationFrame(c), e.readyState === e.HAVE_ENOUGH_DATA && (u.needsUpdate = !0)
            } THREE.Texture.call(this, e, t, r, n, i, o, a, s, h), this.generateMipmaps = !1; var u = this; c()
        }, THREE.VideoTexture.prototype = Object.create(THREE.Texture.prototype), THREE.VideoTexture.prototype.constructor = THREE.VideoTexture, THREE.Group = function () {
            THREE.Object3D.call(this), this.type = "Group"
        }, THREE.Group.prototype = Object.create(THREE.Object3D.prototype), THREE.Group.prototype.constructor = THREE.Group, THREE.Points = function (e, t) {
            THREE.Object3D.call(this), this.type = "Points", this.geometry = void 0 !== e ? e : new THREE.Geometry, this.material = void 0 !== t ? t : new THREE.PointsMaterial({
                color: 16777215 * Math.random()
            })
        }, THREE.Points.prototype = Object.create(THREE.Object3D.prototype), THREE.Points.prototype.constructor = THREE.Points, THREE.Points.prototype.raycast = function () {
            var e = new THREE.Matrix4, t = new THREE.Ray; return function (r, n) {
                function i(e, i) {
                    var a = t.distanceSqToPoint(e); if (c > a) {
                        var s = t.closestPointToPoint(e); s.applyMatrix4(o.matrixWorld); var h = r.ray.origin.distanceTo(s); if (h < r.near || h > r.far) return; n.push({
                            distance: h, distanceToRay: Math.sqrt(a), point: s.clone(), index: i, face: null, object: o
                        })
                    }
                } var o = this, a = o.geometry, s = r.params.Points.threshold; if (e.getInverse(this.matrixWorld), t.copy(r.ray).applyMatrix4(e), null === a.boundingBox || t.isIntersectionBox(a.boundingBox) !== !1) {
                    var h = s / ((this.scale.x + this.scale.y + this.scale.z) / 3), c = h * h, u = new THREE.Vector3; if (a instanceof THREE.BufferGeometry) {
                        var l = a.index, p = a.attributes, f = p.position.array; if (null !== l) for (var d = l.array, E = 0, m = d.length; m > E; E++) {
                            var g = d[E]; u.fromArray(f, 3 * g), i(u, g)
                        } else for (var E = 0, v = f.length / 3; v > E; E++)u.fromArray(f, 3 * E), i(u, E)
                    } else for (var T = a.vertices, E = 0, v = T.length; v > E; E++)i(T[E], E)
                }
            }
        }(), THREE.Points.prototype.clone = function () {
            return new this.constructor(this.geometry, this.material).copy(this)
        }, THREE.PointCloud = function (e, t) {
            return console.warn("THREE.PointCloud has been renamed to THREE.Points."), new THREE.Points(e, t)
        }, THREE.ParticleSystem = function (e, t) {
            return console.warn("THREE.ParticleSystem has been renamed to THREE.Points."), new THREE.Points(e, t)
        }, THREE.Line = function (e, t, r) {
            return 1 === r ? (console.warn("THREE.Line: parameter THREE.LinePieces no longer supported. Created THREE.LineSegments instead."), new THREE.LineSegments(e, t)) : (THREE.Object3D.call(this), this.type = "Line", this.geometry = void 0 !== e ? e : new THREE.Geometry, void (this.material = void 0 !== t ? t : new THREE.LineBasicMaterial({
                color: 16777215 * Math.random()
            })))
        }, THREE.Line.prototype = Object.create(THREE.Object3D.prototype), THREE.Line.prototype.constructor = THREE.Line, THREE.Line.prototype.raycast = function () {
            var e = new THREE.Matrix4, t = new THREE.Ray, r = new THREE.Sphere; return function (n, i) {
                var o = n.linePrecision, a = o * o, s = this.geometry; if (null === s.boundingSphere && s.computeBoundingSphere(), r.copy(s.boundingSphere), r.applyMatrix4(this.matrixWorld), n.ray.isIntersectionSphere(r) !== !1) {
                    e.getInverse(this.matrixWorld), t.copy(n.ray).applyMatrix4(e); var h = new THREE.Vector3, c = new THREE.Vector3, u = new THREE.Vector3, l = new THREE.Vector3, p = this instanceof THREE.LineSegments ? 2 : 1; if (s instanceof THREE.BufferGeometry) {
                        var f = s.index, d = s.attributes; if (null !== f) for (var E = f.array, m = d.position.array, g = 0, v = E.length - 1; v > g; g += p) {
                            var T = E[g], y = E[g + 1]; h.fromArray(m, 3 * T), c.fromArray(m, 3 * y); var R = t.distanceSqToSegment(h, c, l, u); if (!(R > a)) {
                                l.applyMatrix4(this.matrixWorld); var x = n.ray.origin.distanceTo(l); x < n.near || x > n.far || i.push({
                                    distance: x, point: u.clone().applyMatrix4(this.matrixWorld), index: g, face: null, faceIndex: null, object: this
                                })
                            }
                        } else for (var m = d.position.array, g = 0, v = m.length / 3 - 1; v > g; g += p) {
                            h.fromArray(m, 3 * g), c.fromArray(m, 3 * g + 3); var R = t.distanceSqToSegment(h, c, l, u); if (!(R > a)) {
                                l.applyMatrix4(this.matrixWorld); var x = n.ray.origin.distanceTo(l); x < n.near || x > n.far || i.push({
                                    distance: x, point: u.clone().applyMatrix4(this.matrixWorld), index: g, face: null, faceIndex: null, object: this
                                })
                            }
                        }
                    } else if (s instanceof THREE.Geometry) for (var H = s.vertices, b = H.length, g = 0; b - 1 > g; g += p) {
                        var R = t.distanceSqToSegment(H[g], H[g + 1], l, u); if (!(R > a)) {
                            l.applyMatrix4(this.matrixWorld); var x = n.ray.origin.distanceTo(l); x < n.near || x > n.far || i.push({
                                distance: x, point: u.clone().applyMatrix4(this.matrixWorld), index: g, face: null, faceIndex: null, object: this
                            })
                        }
                    }
                }
            }
        }(), THREE.Line.prototype.clone = function () {
            return new this.constructor(this.geometry, this.material).copy(this)
        }, THREE.LineStrip = 0, THREE.LinePieces = 1, THREE.LineSegments = function (e, t) {
            THREE.Line.call(this, e, t), this.type = "LineSegments"
        }, THREE.LineSegments.prototype = Object.create(THREE.Line.prototype), THREE.LineSegments.prototype.constructor = THREE.LineSegments, THREE.Mesh = function (e, t) {
            THREE.Object3D.call(this), this.type = "Mesh", this.geometry = void 0 !== e ? e : new THREE.Geometry, this.material = void 0 !== t ? t : new THREE.MeshBasicMaterial({
                color: 16777215 * Math.random()
            }), this.updateMorphTargets()
        }, THREE.Mesh.prototype = Object.create(THREE.Object3D.prototype), THREE.Mesh.prototype.constructor = THREE.Mesh, THREE.Mesh.prototype.updateMorphTargets = function () {
            if (void 0 !== this.geometry.morphTargets && this.geometry.morphTargets.length > 0) {
                this.morphTargetBase = -1, this.morphTargetInfluences = [], this.morphTargetDictionary = {}; for (var e = 0, t = this.geometry.morphTargets.length; t > e; e++)this.morphTargetInfluences.push(0), this.morphTargetDictionary[this.geometry.morphTargets[e].name] = e
            }
        }, THREE.Mesh.prototype.getMorphTargetIndexByName = function (e) {
            return void 0 !== this.morphTargetDictionary[e] ? this.morphTargetDictionary[e] : (console.warn("THREE.Mesh.getMorphTargetIndexByName: morph target " + e + " does not exist. Returning 0."), 0)
        }, THREE.Mesh.prototype.raycast = function () {
            function e(e, t, r, n, i, o, a) {
                return THREE.Triangle.barycoordFromPoint(e, t, r, n, E), i.multiplyScalar(E.x), o.multiplyScalar(E.y), a.multiplyScalar(E.z), i.add(o).add(a), i.clone()
            } function t(e, t, r, n, i, o, a) {
                var s, h = e.material; if (s = h.side === THREE.BackSide ? r.intersectTriangle(o, i, n, !0, a) : r.intersectTriangle(n, i, o, h.side !== THREE.DoubleSide, a), null === s) return null; g.copy(a), g.applyMatrix4(e.matrixWorld); var c = t.ray.origin.distanceTo(g); return c < t.near || c > t.far ? null : {
                    distance: c, point: g.clone(), object: e
                }
            } function r(r, n, i, o, c, u, l, E) {
                a.fromArray(o, 3 * u), s.fromArray(o, 3 * l), h.fromArray(o, 3 * E); var g = t(r, n, i, a, s, h, m); return g && (c && (p.fromArray(c, 2 * u), f.fromArray(c, 2 * l), d.fromArray(c, 2 * E), g.uv = e(m, a, s, h, p, f, d)), g.face = new THREE.Face3(u, l, E, THREE.Triangle.normal(a, s, h)), g.faceIndex = u), g
            } var n = new THREE.Matrix4, i = new THREE.Ray, o = new THREE.Sphere, a = new THREE.Vector3, s = new THREE.Vector3, h = new THREE.Vector3, c = new THREE.Vector3, u = new THREE.Vector3, l = new THREE.Vector3, p = new THREE.Vector2, f = new THREE.Vector2, d = new THREE.Vector2, E = new THREE.Vector3, m = new THREE.Vector3, g = new THREE.Vector3; return function (E, g) {
                var v = this.geometry, T = this.material; if (void 0 !== T) {
                    null === v.boundingSphere && v.computeBoundingSphere(); var y = this.matrixWorld; if (o.copy(v.boundingSphere), o.applyMatrix4(y), E.ray.isIntersectionSphere(o) !== !1 && (n.getInverse(y), i.copy(E.ray).applyMatrix4(n), null === v.boundingBox || i.isIntersectionBox(v.boundingBox) !== !1)) {
                        var R, x; if (v instanceof THREE.BufferGeometry) {
                            var H, b, w, M = v.index, S = v.attributes, _ = S.position.array; if (void 0 !== S.uv && (R = S.uv.array), null !== M) for (var C = M.array, A = 0, L = C.length; L > A; A += 3)H = C[A], b = C[A + 1], w = C[A + 2], x = r(this, E, i, _, R, H, b, w), x && (x.faceIndex = Math.floor(A / 3), g.push(x)); else for (var A = 0, L = _.length; L > A; A += 9)H = A / 3, b = H + 1, w = H + 2, x = r(this, E, i, _, R, H, b, w), x && (x.index = H, g.push(x))
                        } else if (v instanceof THREE.Geometry) {
                            var k, P, D, O = T instanceof THREE.MeshFaceMaterial, F = O === !0 ? T.materials : null, N = v.vertices, V = v.faces, U = v.faceVertexUvs[0]; U.length > 0 && (R = U); for (var B = 0, I = V.length; I > B; B++) {
                                var G = V[B], z = O === !0 ? F[G.materialIndex] : T; if (void 0 !== z) {
                                    if (k = N[G.a], P = N[G.b], D = N[G.c], z.morphTargets === !0) {
                                        var j = v.morphTargets, W = this.morphTargetInfluences; a.set(0, 0, 0), s.set(0, 0, 0), h.set(0, 0, 0); for (var X = 0, q = j.length; q > X; X++) {
                                            var Y = W[X]; if (0 !== Y) {
                                                var K = j[X].vertices; a.addScaledVector(c.subVectors(K[G.a], k), Y), s.addScaledVector(u.subVectors(K[G.b], P), Y), h.addScaledVector(l.subVectors(K[G.c], D), Y)
                                            }
                                        } a.add(k), s.add(P), h.add(D), k = a, P = s, D = h
                                    } if (x = t(this, E, i, k, P, D, m)) {
                                        if (R) {
                                            var $ = R[B]; p.copy($[0]), f.copy($[1]), d.copy($[2]), x.uv = e(m, k, P, D, p, f, d)
                                        } x.face = G, x.faceIndex = B, g.push(x)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }(), THREE.Mesh.prototype.clone = function () {
            return new this.constructor(this.geometry, this.material).copy(this)
        }, THREE.Bone = function (e) {
            THREE.Object3D.call(this), this.type = "Bone", this.skin = e
        }, THREE.Bone.prototype = Object.create(THREE.Object3D.prototype), THREE.Bone.prototype.constructor = THREE.Bone, THREE.Bone.prototype.copy = function (e) {
            return THREE.Object3D.prototype.copy.call(this, e), this.skin = e.skin, this
        }, THREE.Skeleton = function (e, t, r) {
            if (this.useVertexTexture = void 0 !== r ? r : !0, this.identityMatrix = new THREE.Matrix4, e = e || [], this.bones = e.slice(0), this.useVertexTexture) {
                var n = Math.sqrt(4 * this.bones.length); n = THREE.Math.nextPowerOfTwo(Math.ceil(n)), n = Math.max(n, 4), this.boneTextureWidth = n, this.boneTextureHeight = n, this.boneMatrices = new Float32Array(this.boneTextureWidth * this.boneTextureHeight * 4), this.boneTexture = new THREE.DataTexture(this.boneMatrices, this.boneTextureWidth, this.boneTextureHeight, THREE.RGBAFormat, THREE.FloatType)
            } else this.boneMatrices = new Float32Array(16 * this.bones.length); if (void 0 === t) this.calculateInverses(); else if (this.bones.length === t.length) this.boneInverses = t.slice(0); else {
                console.warn("THREE.Skeleton bonInverses is the wrong length."), this.boneInverses = []; for (var i = 0, o = this.bones.length; o > i; i++)this.boneInverses.push(new THREE.Matrix4)
            }
        }, THREE.Skeleton.prototype.calculateInverses = function () {
            this.boneInverses = []; for (var e = 0, t = this.bones.length; t > e; e++) {
                var r = new THREE.Matrix4; this.bones[e] && r.getInverse(this.bones[e].matrixWorld), this.boneInverses.push(r)
            }
        }, THREE.Skeleton.prototype.pose = function () {
            for (var e, t = 0, r = this.bones.length; r > t; t++)e = this.bones[t], e && e.matrixWorld.getInverse(this.boneInverses[t]); for (var t = 0, r = this.bones.length; r > t; t++)e = this.bones[t], e && (e.parent ? (e.matrix.getInverse(e.parent.matrixWorld), e.matrix.multiply(e.matrixWorld)) : e.matrix.copy(e.matrixWorld), e.matrix.decompose(e.position, e.quaternion, e.scale))
        }, THREE.Skeleton.prototype.update = function () {
            var e = new THREE.Matrix4; return function () {
                for (var t = 0, r = this.bones.length; r > t; t++) {
                    var n = this.bones[t] ? this.bones[t].matrixWorld : this.identityMatrix; e.multiplyMatrices(n, this.boneInverses[t]), e.flattenToArrayOffset(this.boneMatrices, 16 * t)
                } this.useVertexTexture && (this.boneTexture.needsUpdate = !0)
            }
        }(), THREE.Skeleton.prototype.clone = function () {
            return new THREE.Skeleton(this.bones, this.boneInverses, this.useVertexTexture)
        }, THREE.SkinnedMesh = function (e, t, r) {
            THREE.Mesh.call(this, e, t), this.type = "SkinnedMesh", this.bindMode = "attached", this.bindMatrix = new THREE.Matrix4, this.bindMatrixInverse = new THREE.Matrix4; var n = []; if (this.geometry && void 0 !== this.geometry.bones) {
                for (var i, o, a = 0, s = this.geometry.bones.length; s > a; ++a)o = this.geometry.bones[a], i = new THREE.Bone(this), n.push(i), i.name = o.name, i.position.fromArray(o.pos), i.quaternion.fromArray(o.rotq), void 0 !== o.scl && i.scale.fromArray(o.scl); for (var a = 0, s = this.geometry.bones.length; s > a; ++a)o = this.geometry.bones[a], -1 !== o.parent && null !== o.parent ? n[o.parent].add(n[a]) : this.add(n[a])
            } this.normalizeSkinWeights(), this.updateMatrixWorld(!0), this.bind(new THREE.Skeleton(n, void 0, r), this.matrixWorld)
        }, THREE.SkinnedMesh.prototype = Object.create(THREE.Mesh.prototype), THREE.SkinnedMesh.prototype.constructor = THREE.SkinnedMesh, THREE.SkinnedMesh.prototype.bind = function (e, t) {
            this.skeleton = e, void 0 === t && (this.updateMatrixWorld(!0), this.skeleton.calculateInverses(), t = this.matrixWorld), this.bindMatrix.copy(t), this.bindMatrixInverse.getInverse(t)
        }, THREE.SkinnedMesh.prototype.pose = function () {
            this.skeleton.pose()
        }, THREE.SkinnedMesh.prototype.normalizeSkinWeights = function () {
            if (this.geometry instanceof THREE.Geometry) for (var e = 0; e < this.geometry.skinIndices.length; e++) {
                var t = this.geometry.skinWeights[e], r = 1 / t.lengthManhattan(); r !== 1 / 0 ? t.multiplyScalar(r) : t.set(1)
            }
        }, THREE.SkinnedMesh.prototype.updateMatrixWorld = function (e) {
            THREE.Mesh.prototype.updateMatrixWorld.call(this, !0), "attached" === this.bindMode ? this.bindMatrixInverse.getInverse(this.matrixWorld) : "detached" === this.bindMode ? this.bindMatrixInverse.getInverse(this.bindMatrix) : console.warn("THREE.SkinnedMesh unrecognized bindMode: " + this.bindMode)
        }, THREE.SkinnedMesh.prototype.clone = function () {
            return new this.constructor(this.geometry, this.material, this.useVertexTexture).copy(this)
        }, THREE.LOD = function () {
            THREE.Object3D.call(this), this.type = "LOD", Object.defineProperties(this, {
                levels: {
                    enumerable: !0, value: []
                }, objects: {
                    get: function () {
                        return console.warn("THREE.LOD: .objects has been renamed to .levels."), this.levels
                    }
                }
            })
        }, THREE.LOD.prototype = Object.create(THREE.Object3D.prototype), THREE.LOD.prototype.constructor = THREE.LOD, THREE.LOD.prototype.addLevel = function (e, t) {
            void 0 === t && (t = 0), t = Math.abs(t); for (var r = this.levels, n = 0; n < r.length && !(t < r[n].distance); n++); r.splice(n, 0, {
                distance: t, object: e
            }), this.add(e)
        }, THREE.LOD.prototype.getObjectForDistance = function (e) {
            for (var t = this.levels, r = 1, n = t.length; n > r && !(e < t[r].distance); r++); return t[r - 1].object
        }, THREE.LOD.prototype.raycast = function () {
            var e = new THREE.Vector3; return function (t, r) {
                e.setFromMatrixPosition(this.matrixWorld); var n = t.ray.origin.distanceTo(e); this.getObjectForDistance(n).raycast(t, r)
            }
        }(), THREE.LOD.prototype.update = function () {
            var e = new THREE.Vector3, t = new THREE.Vector3; return function (r) {
                var n = this.levels; if (n.length > 1) {
                    e.setFromMatrixPosition(r.matrixWorld), t.setFromMatrixPosition(this.matrixWorld); var i = e.distanceTo(t); n[0].object.visible = !0; for (var o = 1, a = n.length; a > o && i >= n[o].distance; o++)n[o - 1].object.visible = !1, n[o].object.visible = !0; for (; a > o; o++)n[o].object.visible = !1
                }
            }
        }(), THREE.LOD.prototype.copy = function (e) {
            THREE.Object3D.prototype.copy.call(this, e, !1); for (var t = e.levels, r = 0, n = t.length; n > r; r++) {
                var i = t[r]; this.addLevel(i.object.clone(), i.distance)
            } return this
        }, THREE.LOD.prototype.toJSON = function (e) {
            var t = THREE.Object3D.prototype.toJSON.call(this, e); t.object.levels = []; for (var r = this.levels, n = 0, i = r.length; i > n; n++) {
                var o = r[n]; t.object.levels.push({
                    object: o.object.uuid, distance: o.distance
                })
            } return t
        }, THREE.Sprite = function () {
            var e = new Uint16Array([0, 1, 2, 0, 2, 3]), t = new Float32Array([-.5, -.5, 0, .5, -.5, 0, .5, .5, 0, -.5, .5, 0]), r = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), n = new THREE.BufferGeometry; return n.setIndex(new THREE.BufferAttribute(e, 1)), n.addAttribute("position", new THREE.BufferAttribute(t, 3)), n.addAttribute("uv", new THREE.BufferAttribute(r, 2)), function (e) {
                THREE.Object3D.call(this), this.type = "Sprite", this.geometry = n, this.material = void 0 !== e ? e : new THREE.SpriteMaterial
            }
        }(), THREE.Sprite.prototype = Object.create(THREE.Object3D.prototype), THREE.Sprite.prototype.constructor = THREE.Sprite, THREE.Sprite.prototype.raycast = function () {
            var e = new THREE.Vector3; return function (t, r) {
                e.setFromMatrixPosition(this.matrixWorld); var n = t.ray.distanceSqToPoint(e), i = this.scale.x * this.scale.y; n > i || r.push({
                    distance: Math.sqrt(n), point: this.position, face: null, object: this
                })
            }
        }(), THREE.Sprite.prototype.clone = function () {
            return new this.constructor(this.material).copy(this)
        }, THREE.Particle = THREE.Sprite, THREE.LensFlare = function (e, t, r, n, i) {
            THREE.Object3D.call(this), this.lensFlares = [], this.positionScreen = new THREE.Vector3, this.customUpdateCallback = void 0, void 0 !== e && this.add(e, t, r, n, i)
        }, THREE.LensFlare.prototype = Object.create(THREE.Object3D.prototype), THREE.LensFlare.prototype.constructor = THREE.LensFlare, THREE.LensFlare.prototype.add = function (e, t, r, n, i, o) {
            void 0 === t && (t = -1), void 0 === r && (r = 0), void 0 === o && (o = 1), void 0 === i && (i = new THREE.Color(16777215)), void 0 === n && (n = THREE.NormalBlending), r = Math.min(r, Math.max(0, r)), this.lensFlares.push({
                texture: e, size: t, distance: r, x: 0, y: 0, z: 0, scale: 1, rotation: 0, opacity: o, color: i, blending: n
            })
        }, THREE.LensFlare.prototype.updateLensFlares = function () {
            var e, t, r = this.lensFlares.length, n = 2 * -this.positionScreen.x, i = 2 * -this.positionScreen.y; for (e = 0; r > e; e++)t = this.lensFlares[e], t.x = this.positionScreen.x + n * t.distance, t.y = this.positionScreen.y + i * t.distance, t.wantedRotation = t.x * Math.PI * .25, t.rotation += .25 * (t.wantedRotation - t.rotation)
        }, THREE.LensFlare.prototype.copy = function (e) {
            THREE.Object3D.prototype.copy.call(this, e), this.positionScreen.copy(e.positionScreen), this.customUpdateCallback = e.customUpdateCallback; for (var t = 0, r = e.lensFlares.length; r > t; t++)this.lensFlares.push(e.lensFlares[t]); return this
        }, THREE.Scene = function () {
            THREE.Object3D.call(this), this.type = "Scene", this.fog = null, this.overrideMaterial = null, this.autoUpdate = !0
        }, THREE.Scene.prototype = Object.create(THREE.Object3D.prototype), THREE.Scene.prototype.constructor = THREE.Scene, THREE.Scene.prototype.copy = function (e) {
            return THREE.Object3D.prototype.copy.call(this, e), null !== e.fog && (this.fog = e.fog.clone()), null !== e.overrideMaterial && (this.overrideMaterial = e.overrideMaterial.clone()), this.autoUpdate = e.autoUpdate, this.matrixAutoUpdate = e.matrixAutoUpdate, this
        }, THREE.Fog = function (e, t, r) {
            this.name = "", this.color = new THREE.Color(e), this.near = void 0 !== t ? t : 1, this.far = void 0 !== r ? r : 1e3
        }, THREE.Fog.prototype.clone = function () {
            return new THREE.Fog(this.color.getHex(), this.near, this.far)
        }, THREE.FogExp2 = function (e, t) {
            this.name = "", this.color = new THREE.Color(e), this.density = void 0 !== t ? t : 25e-5
        }, THREE.FogExp2.prototype.clone = function () {
            return new THREE.FogExp2(this.color.getHex(), this.density)
        }, THREE.ShaderChunk = {}, THREE.ShaderChunk.alphamap_fragment = "#ifdef USE_ALPHAMAP\n\n	diffuseColor.a *= texture2D( alphaMap, vUv ).g;\n\n#endif\n", THREE.ShaderChunk.alphamap_pars_fragment = "#ifdef USE_ALPHAMAP\n\n	uniform sampler2D alphaMap;\n\n#endif\n", THREE.ShaderChunk.alphatest_fragment = "#ifdef ALPHATEST\n\n	if ( diffuseColor.a < ALPHATEST ) discard;\n\n#endif\n", THREE.ShaderChunk.aomap_fragment = "#ifdef USE_AOMAP\n\n	totalAmbientLight *= ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;\n\n#endif\n", THREE.ShaderChunk.aomap_pars_fragment = "#ifdef USE_AOMAP\n\n	uniform sampler2D aoMap;\n	uniform float aoMapIntensity;\n\n#endif", THREE.ShaderChunk.begin_vertex = "\nvec3 transformed = vec3( position );\n", THREE.ShaderChunk.beginnormal_vertex = "\nvec3 objectNormal = vec3( normal );\n", THREE.ShaderChunk.bumpmap_pars_fragment = "#ifdef USE_BUMPMAP\n\n	uniform sampler2D bumpMap;\n	uniform float bumpScale;\n\n\n\n	vec2 dHdxy_fwd() {\n\n		vec2 dSTdx = dFdx( vUv );\n		vec2 dSTdy = dFdy( vUv );\n\n		float Hll = bumpScale * texture2D( bumpMap, vUv ).x;\n		float dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;\n		float dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;\n\n		return vec2( dBx, dBy );\n\n	}\n\n	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {\n\n		vec3 vSigmaX = dFdx( surf_pos );\n		vec3 vSigmaY = dFdy( surf_pos );\n		vec3 vN = surf_norm;\n		vec3 R1 = cross( vSigmaY, vN );\n		vec3 R2 = cross( vN, vSigmaX );\n\n		float fDet = dot( vSigmaX, R1 );\n\n		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );\n		return normalize( abs( fDet ) * surf_norm - vGrad );\n\n	}\n\n#endif\n", THREE.ShaderChunk.color_fragment = "#ifdef USE_COLOR\n\n	diffuseColor.rgb *= vColor;\n\n#endif", THREE.ShaderChunk.color_pars_fragment = "#ifdef USE_COLOR\n\n	varying vec3 vColor;\n\n#endif\n", THREE.ShaderChunk.color_pars_vertex = "#ifdef USE_COLOR\n\n	varying vec3 vColor;\n\n#endif", THREE.ShaderChunk.color_vertex = "#ifdef USE_COLOR\n\n	vColor.xyz = color.xyz;\n\n#endif", THREE.ShaderChunk.common = "#define PI 3.14159\n#define PI2 6.28318\n#define RECIPROCAL_PI2 0.15915494\n#define LOG2 1.442695\n#define EPSILON 1e-6\n\n#define saturate(a) clamp( a, 0.0, 1.0 )\n#define whiteCompliment(a) ( 1.0 - saturate( a ) )\n\nvec3 transformDirection( in vec3 normal, in mat4 matrix ) {\n\n	return normalize( ( matrix * vec4( normal, 0.0 ) ).xyz );\n\n}\n\nvec3 inverseTransformDirection( in vec3 normal, in mat4 matrix ) {\n\n	return normalize( ( vec4( normal, 0.0 ) * matrix ).xyz );\n\n}\n\nvec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\n	float distance = dot( planeNormal, point - pointOnPlane );\n\n	return - distance * planeNormal + point;\n\n}\n\nfloat sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\n	return sign( dot( point - pointOnPlane, planeNormal ) );\n\n}\n\nvec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\n	return lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) ) + pointOnLine;\n\n}\n\nfloat calcLightAttenuation( float lightDistance, float cutoffDistance, float decayExponent ) {\n\n	if ( decayExponent > 0.0 ) {\n\n	  return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );\n\n	}\n\n	return 1.0;\n\n}\n\nvec3 F_Schlick( in vec3 specularColor, in float dotLH ) {\n\n\n	float fresnel = exp2( ( -5.55437 * dotLH - 6.98316 ) * dotLH );\n\n	return ( 1.0 - specularColor ) * fresnel + specularColor;\n\n}\n\nfloat G_BlinnPhong_Implicit( /* in float dotNL, in float dotNV */ ) {\n\n\n	return 0.25;\n\n}\n\nfloat D_BlinnPhong( in float shininess, in float dotNH ) {\n\n\n	return ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );\n\n}\n\nvec3 BRDF_BlinnPhong( in vec3 specularColor, in float shininess, in vec3 normal, in vec3 lightDir, in vec3 viewDir ) {\n\n	vec3 halfDir = normalize( lightDir + viewDir );\n\n	float dotNH = saturate( dot( normal, halfDir ) );\n	float dotLH = saturate( dot( lightDir, halfDir ) );\n\n	vec3 F = F_Schlick( specularColor, dotLH );\n\n	float G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );\n\n	float D = D_BlinnPhong( shininess, dotNH );\n\n	return F * G * D;\n\n}\n\nvec3 inputToLinear( in vec3 a ) {\n\n	#ifdef GAMMA_INPUT\n\n		return pow( a, vec3( float( GAMMA_FACTOR ) ) );\n\n	#else\n\n		return a;\n\n	#endif\n\n}\n\nvec3 linearToOutput( in vec3 a ) {\n\n	#ifdef GAMMA_OUTPUT\n\n		return pow( a, vec3( 1.0 / float( GAMMA_FACTOR ) ) );\n\n	#else\n\n		return a;\n\n	#endif\n\n}\n", THREE.ShaderChunk.defaultnormal_vertex = "#ifdef FLIP_SIDED\n\n	objectNormal = -objectNormal;\n\n#endif\n\nvec3 transformedNormal = normalMatrix * objectNormal;\n", THREE.ShaderChunk.displacementmap_vertex = "#ifdef USE_DISPLACEMENTMAP\n\n	transformed += normal * ( texture2D( displacementMap, uv ).x * displacementScale + displacementBias );\n\n#endif\n", THREE.ShaderChunk.displacementmap_pars_vertex = "#ifdef USE_DISPLACEMENTMAP\n\n	uniform sampler2D displacementMap;\n	uniform float displacementScale;\n	uniform float displacementBias;\n\n#endif\n", THREE.ShaderChunk.emissivemap_fragment = "#ifdef USE_EMISSIVEMAP\n\n	vec4 emissiveColor = texture2D( emissiveMap, vUv );\n\n	emissiveColor.rgb = inputToLinear( emissiveColor.rgb );\n\n	totalEmissiveLight *= emissiveColor.rgb;\n\n#endif\n", THREE.ShaderChunk.emissivemap_pars_fragment = "#ifdef USE_EMISSIVEMAP\n\n	uniform sampler2D emissiveMap;\n\n#endif\n", THREE.ShaderChunk.envmap_fragment = "#ifdef USE_ENVMAP\n\n	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\n		vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );\n\n		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n\n		#ifdef ENVMAP_MODE_REFLECTION\n\n			vec3 reflectVec = reflect( cameraToVertex, worldNormal );\n\n		#else\n\n			vec3 reflectVec = refract( cameraToVertex, worldNormal, refractionRatio );\n\n		#endif\n\n	#else\n\n		vec3 reflectVec = vReflect;\n\n	#endif\n\n	#ifdef DOUBLE_SIDED\n		float flipNormal = ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n	#else\n		float flipNormal = 1.0;\n	#endif\n\n	#ifdef ENVMAP_TYPE_CUBE\n		vec4 envColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );\n\n	#elif defined( ENVMAP_TYPE_EQUIREC )\n		vec2 sampleUV;\n		sampleUV.y = saturate( flipNormal * reflectVec.y * 0.5 + 0.5 );\n		sampleUV.x = atan( flipNormal * reflectVec.z, flipNormal * reflectVec.x ) * RECIPROCAL_PI2 + 0.5;\n		vec4 envColor = texture2D( envMap, sampleUV );\n\n	#elif defined( ENVMAP_TYPE_SPHERE )\n		vec3 reflectView = flipNormal * normalize((viewMatrix * vec4( reflectVec, 0.0 )).xyz + vec3(0.0,0.0,1.0));\n		vec4 envColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5 );\n	#endif\n\n	envColor.xyz = inputToLinear( envColor.xyz );\n\n	#ifdef ENVMAP_BLENDING_MULTIPLY\n\n		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );\n\n	#elif defined( ENVMAP_BLENDING_MIX )\n\n		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );\n\n	#elif defined( ENVMAP_BLENDING_ADD )\n\n		outgoingLight += envColor.xyz * specularStrength * reflectivity;\n\n	#endif\n\n#endif\n", THREE.ShaderChunk.envmap_pars_fragment = "#ifdef USE_ENVMAP\n\n	uniform float reflectivity;\n	#ifdef ENVMAP_TYPE_CUBE\n		uniform samplerCube envMap;\n	#else\n		uniform sampler2D envMap;\n	#endif\n	uniform float flipEnvMap;\n\n	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\n		uniform float refractionRatio;\n\n	#else\n\n		varying vec3 vReflect;\n\n	#endif\n\n#endif\n", THREE.ShaderChunk.envmap_pars_vertex = "#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP ) && ! defined( PHONG )\n\n	varying vec3 vReflect;\n\n	uniform float refractionRatio;\n\n#endif\n", THREE.ShaderChunk.envmap_vertex = "#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP ) && ! defined( PHONG )\n\n	vec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );\n\n	vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );\n\n	#ifdef ENVMAP_MODE_REFLECTION\n\n		vReflect = reflect( cameraToVertex, worldNormal );\n\n	#else\n\n		vReflect = refract( cameraToVertex, worldNormal, refractionRatio );\n\n	#endif\n\n#endif\n", THREE.ShaderChunk.fog_fragment = "#ifdef USE_FOG\n\n	#ifdef USE_LOGDEPTHBUF_EXT\n\n		float depth = gl_FragDepthEXT / gl_FragCoord.w;\n\n	#else\n\n		float depth = gl_FragCoord.z / gl_FragCoord.w;\n\n	#endif\n\n	#ifdef FOG_EXP2\n\n		float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * depth * depth * LOG2 ) );\n\n	#else\n\n		float fogFactor = smoothstep( fogNear, fogFar, depth );\n\n	#endif\n	\n	outgoingLight = mix( outgoingLight, fogColor, fogFactor );\n\n#endif", THREE.ShaderChunk.fog_pars_fragment = "#ifdef USE_FOG\n\n	uniform vec3 fogColor;\n\n	#ifdef FOG_EXP2\n\n		uniform float fogDensity;\n\n	#else\n\n		uniform float fogNear;\n		uniform float fogFar;\n	#endif\n\n#endif", THREE.ShaderChunk.hemilight_fragment = "#if MAX_HEMI_LIGHTS > 0\n\n	for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {\n\n		vec3 lightDir = hemisphereLightDirection[ i ];\n\n		float dotProduct = dot( normal, lightDir );\n\n		float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;\n\n		vec3 lightColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );\n\n		totalAmbientLight += lightColor;\n\n	}\n\n#endif\n\n", THREE.ShaderChunk.lightmap_fragment = "#ifdef USE_LIGHTMAP\n\n	totalAmbientLight += texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;\n\n#endif\n", THREE.ShaderChunk.lightmap_pars_fragment = "#ifdef USE_LIGHTMAP\n\n	uniform sampler2D lightMap;\n	uniform float lightMapIntensity;\n\n#endif", THREE.ShaderChunk.lights_lambert_pars_vertex = "#if MAX_DIR_LIGHTS > 0\n\n	uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];\n	uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];\n\n#endif\n\n#if MAX_HEMI_LIGHTS > 0\n\n	uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];\n	uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];\n	uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];\n\n#endif\n\n#if MAX_POINT_LIGHTS > 0\n\n	uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];\n	uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\n	uniform float pointLightDistance[ MAX_POINT_LIGHTS ];\n	uniform float pointLightDecay[ MAX_POINT_LIGHTS ];\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0\n\n	uniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];\n	uniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];\n	uniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];\n	uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];\n	uniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];\n	uniform float spotLightExponent[ MAX_SPOT_LIGHTS ];\n	uniform float spotLightDecay[ MAX_SPOT_LIGHTS ];\n\n#endif\n", THREE.ShaderChunk.lights_lambert_vertex = "vLightFront = vec3( 0.0 );\n\n#ifdef DOUBLE_SIDED\n\n	vLightBack = vec3( 0.0 );\n\n#endif\n\nvec3 normal = normalize( transformedNormal );\n\n#if MAX_POINT_LIGHTS > 0\n\n	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {\n\n		vec3 lightColor = pointLightColor[ i ];\n\n		vec3 lVector = pointLightPosition[ i ] - mvPosition.xyz;\n		vec3 lightDir = normalize( lVector );\n\n\n		float attenuation = calcLightAttenuation( length( lVector ), pointLightDistance[ i ], pointLightDecay[ i ] );\n\n\n		float dotProduct = dot( normal, lightDir );\n\n		vLightFront += lightColor * attenuation * saturate( dotProduct );\n\n		#ifdef DOUBLE_SIDED\n\n			vLightBack += lightColor * attenuation * saturate( - dotProduct );\n\n		#endif\n\n	}\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0\n\n	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {\n\n		vec3 lightColor = spotLightColor[ i ];\n\n		vec3 lightPosition = spotLightPosition[ i ];\n		vec3 lVector = lightPosition - mvPosition.xyz;\n		vec3 lightDir = normalize( lVector );\n\n		float spotEffect = dot( spotLightDirection[ i ], lightDir );\n\n		if ( spotEffect > spotLightAngleCos[ i ] ) {\n\n			spotEffect = saturate( pow( saturate( spotEffect ), spotLightExponent[ i ] ) );\n\n\n			float attenuation = calcLightAttenuation( length( lVector ), spotLightDistance[ i ], spotLightDecay[ i ] );\n\n			attenuation *= spotEffect;\n\n\n			float dotProduct = dot( normal, lightDir );\n\n			vLightFront += lightColor * attenuation * saturate( dotProduct );\n\n			#ifdef DOUBLE_SIDED\n\n				vLightBack += lightColor * attenuation * saturate( - dotProduct );\n\n			#endif\n\n		}\n\n	}\n\n#endif\n\n#if MAX_DIR_LIGHTS > 0\n\n	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {\n\n		vec3 lightColor = directionalLightColor[ i ];\n\n		vec3 lightDir = directionalLightDirection[ i ];\n\n\n		float dotProduct = dot( normal, lightDir );\n\n		vLightFront += lightColor * saturate( dotProduct );\n\n		#ifdef DOUBLE_SIDED\n\n			vLightBack += lightColor * saturate( - dotProduct );\n\n		#endif\n\n	}\n\n#endif\n\n#if MAX_HEMI_LIGHTS > 0\n\n	for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {\n\n		vec3 lightDir = hemisphereLightDirection[ i ];\n\n\n		float dotProduct = dot( normal, lightDir );\n\n		float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;\n\n		vLightFront += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );\n\n		#ifdef DOUBLE_SIDED\n\n			float hemiDiffuseWeightBack = - 0.5 * dotProduct + 0.5;\n\n			vLightBack += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeightBack );\n\n		#endif\n\n	}\n\n#endif\n",
        THREE.ShaderChunk.lights_phong_fragment = "vec3 viewDir = normalize( vViewPosition );\n\nvec3 totalDiffuseLight = vec3( 0.0 );\nvec3 totalSpecularLight = vec3( 0.0 );\n\n#if MAX_POINT_LIGHTS > 0\n\n	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {\n\n		vec3 lightColor = pointLightColor[ i ];\n\n		vec3 lightPosition = pointLightPosition[ i ];\n		vec3 lVector = lightPosition + vViewPosition.xyz;\n		vec3 lightDir = normalize( lVector );\n\n\n		float attenuation = calcLightAttenuation( length( lVector ), pointLightDistance[ i ], pointLightDecay[ i ] );\n\n\n		float cosineTerm = saturate( dot( normal, lightDir ) );\n\n		totalDiffuseLight += lightColor * attenuation * cosineTerm;\n\n\n		vec3 brdf = BRDF_BlinnPhong( specular, shininess, normal, lightDir, viewDir );\n\n		totalSpecularLight += brdf * specularStrength * lightColor * attenuation * cosineTerm;\n\n\n	}\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0\n\n	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {\n\n		vec3 lightColor = spotLightColor[ i ];\n\n		vec3 lightPosition = spotLightPosition[ i ];\n		vec3 lVector = lightPosition + vViewPosition.xyz;\n		vec3 lightDir = normalize( lVector );\n\n		float spotEffect = dot( spotLightDirection[ i ], lightDir );\n\n		if ( spotEffect > spotLightAngleCos[ i ] ) {\n\n			spotEffect = saturate( pow( saturate( spotEffect ), spotLightExponent[ i ] ) );\n\n\n			float attenuation = calcLightAttenuation( length( lVector ), spotLightDistance[ i ], spotLightDecay[ i ] );\n\n			attenuation *= spotEffect;\n\n\n			float cosineTerm = saturate( dot( normal, lightDir ) );\n\n			totalDiffuseLight += lightColor * attenuation * cosineTerm;\n\n\n			vec3 brdf = BRDF_BlinnPhong( specular, shininess, normal, lightDir, viewDir );\n\n			totalSpecularLight += brdf * specularStrength * lightColor * attenuation * cosineTerm;\n\n		}\n\n	}\n\n#endif\n\n#if MAX_DIR_LIGHTS > 0\n\n	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {\n\n		vec3 lightColor = directionalLightColor[ i ];\n\n		vec3 lightDir = directionalLightDirection[ i ];\n\n\n		float cosineTerm = saturate( dot( normal, lightDir ) );\n\n		totalDiffuseLight += lightColor * cosineTerm;\n\n\n		vec3 brdf = BRDF_BlinnPhong( specular, shininess, normal, lightDir, viewDir );\n\n		totalSpecularLight += brdf * specularStrength * lightColor * cosineTerm;\n\n	}\n\n#endif\n", THREE.ShaderChunk.lights_phong_pars_fragment = "uniform vec3 ambientLightColor;\n\n#if MAX_DIR_LIGHTS > 0\n\n	uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];\n	uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];\n\n#endif\n\n#if MAX_HEMI_LIGHTS > 0\n\n	uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];\n	uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];\n	uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];\n\n#endif\n\n#if MAX_POINT_LIGHTS > 0\n\n	uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];\n\n	uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\n	uniform float pointLightDistance[ MAX_POINT_LIGHTS ];\n	uniform float pointLightDecay[ MAX_POINT_LIGHTS ];\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0\n\n	uniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];\n	uniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];\n	uniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];\n	uniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];\n	uniform float spotLightExponent[ MAX_SPOT_LIGHTS ];\n	uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];\n	uniform float spotLightDecay[ MAX_SPOT_LIGHTS ];\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0 || defined( USE_ENVMAP )\n\n	varying vec3 vWorldPosition;\n\n#endif\n\nvarying vec3 vViewPosition;\n\n#ifndef FLAT_SHADED\n\n	varying vec3 vNormal;\n\n#endif\n", THREE.ShaderChunk.lights_phong_pars_vertex = "#if MAX_SPOT_LIGHTS > 0 || defined( USE_ENVMAP )\n\n	varying vec3 vWorldPosition;\n\n#endif\n\n#if MAX_POINT_LIGHTS > 0\n\n	uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\n\n#endif\n", THREE.ShaderChunk.lights_phong_vertex = "#if MAX_SPOT_LIGHTS > 0 || defined( USE_ENVMAP )\n\n	vWorldPosition = worldPosition.xyz;\n\n#endif\n", THREE.ShaderChunk.linear_to_gamma_fragment = "\n	outgoingLight = linearToOutput( outgoingLight );\n", THREE.ShaderChunk.logdepthbuf_fragment = "#if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT)\n\n	gl_FragDepthEXT = log2(vFragDepth) * logDepthBufFC * 0.5;\n\n#endif", THREE.ShaderChunk.logdepthbuf_pars_fragment = "#ifdef USE_LOGDEPTHBUF\n\n	uniform float logDepthBufFC;\n\n	#ifdef USE_LOGDEPTHBUF_EXT\n\n		varying float vFragDepth;\n\n	#endif\n\n#endif\n", THREE.ShaderChunk.logdepthbuf_pars_vertex = "#ifdef USE_LOGDEPTHBUF\n\n	#ifdef USE_LOGDEPTHBUF_EXT\n\n		varying float vFragDepth;\n\n	#endif\n\n	uniform float logDepthBufFC;\n\n#endif", THREE.ShaderChunk.logdepthbuf_vertex = "#ifdef USE_LOGDEPTHBUF\n\n	gl_Position.z = log2(max( EPSILON, gl_Position.w + 1.0 )) * logDepthBufFC;\n\n	#ifdef USE_LOGDEPTHBUF_EXT\n\n		vFragDepth = 1.0 + gl_Position.w;\n\n#else\n\n		gl_Position.z = (gl_Position.z - 1.0) * gl_Position.w;\n\n	#endif\n\n#endif", THREE.ShaderChunk.map_fragment = "#ifdef USE_MAP\n\n	vec4 texelColor = texture2D( map, vUv );\n\n	texelColor.xyz = inputToLinear( texelColor.xyz );\n\n	diffuseColor *= texelColor;\n\n#endif\n", THREE.ShaderChunk.map_pars_fragment = "#ifdef USE_MAP\n\n	uniform sampler2D map;\n\n#endif", THREE.ShaderChunk.map_particle_fragment = "#ifdef USE_MAP\n\n	diffuseColor *= texture2D( map, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) * offsetRepeat.zw + offsetRepeat.xy );\n\n#endif\n", THREE.ShaderChunk.map_particle_pars_fragment = "#ifdef USE_MAP\n\n	uniform vec4 offsetRepeat;\n	uniform sampler2D map;\n\n#endif\n", THREE.ShaderChunk.morphnormal_vertex = "#ifdef USE_MORPHNORMALS\n\n	objectNormal += ( morphNormal0 - normal ) * morphTargetInfluences[ 0 ];\n	objectNormal += ( morphNormal1 - normal ) * morphTargetInfluences[ 1 ];\n	objectNormal += ( morphNormal2 - normal ) * morphTargetInfluences[ 2 ];\n	objectNormal += ( morphNormal3 - normal ) * morphTargetInfluences[ 3 ];\n\n#endif\n", THREE.ShaderChunk.morphtarget_pars_vertex = "#ifdef USE_MORPHTARGETS\n\n	#ifndef USE_MORPHNORMALS\n\n	uniform float morphTargetInfluences[ 8 ];\n\n	#else\n\n	uniform float morphTargetInfluences[ 4 ];\n\n	#endif\n\n#endif", THREE.ShaderChunk.morphtarget_vertex = "#ifdef USE_MORPHTARGETS\n\n	transformed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];\n	transformed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];\n	transformed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];\n	transformed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];\n\n	#ifndef USE_MORPHNORMALS\n\n	transformed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];\n	transformed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];\n	transformed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];\n	transformed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];\n\n	#endif\n\n#endif\n", THREE.ShaderChunk.normal_phong_fragment = "#ifndef FLAT_SHADED\n\n	vec3 normal = normalize( vNormal );\n\n	#ifdef DOUBLE_SIDED\n\n		normal = normal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );\n\n	#endif\n\n#else\n\n	vec3 fdx = dFdx( vViewPosition );\n	vec3 fdy = dFdy( vViewPosition );\n	vec3 normal = normalize( cross( fdx, fdy ) );\n\n#endif\n\n#ifdef USE_NORMALMAP\n\n	normal = perturbNormal2Arb( -vViewPosition, normal );\n\n#elif defined( USE_BUMPMAP )\n\n	normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );\n\n#endif\n\n", THREE.ShaderChunk.normalmap_pars_fragment = "#ifdef USE_NORMALMAP\n\n	uniform sampler2D normalMap;\n	uniform vec2 normalScale;\n\n\n	vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm ) {\n\n		vec3 q0 = dFdx( eye_pos.xyz );\n		vec3 q1 = dFdy( eye_pos.xyz );\n		vec2 st0 = dFdx( vUv.st );\n		vec2 st1 = dFdy( vUv.st );\n\n		vec3 S = normalize( q0 * st1.t - q1 * st0.t );\n		vec3 T = normalize( -q0 * st1.s + q1 * st0.s );\n		vec3 N = normalize( surf_norm );\n\n		vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;\n		mapN.xy = normalScale * mapN.xy;\n		mat3 tsn = mat3( S, T, N );\n		return normalize( tsn * mapN );\n\n	}\n\n#endif\n", THREE.ShaderChunk.project_vertex = "#ifdef USE_SKINNING\n\n	vec4 mvPosition = modelViewMatrix * skinned;\n\n#else\n\n	vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );\n\n#endif\n\ngl_Position = projectionMatrix * mvPosition;\n", THREE.ShaderChunk.shadowmap_fragment = "#ifdef USE_SHADOWMAP\n\n	for ( int i = 0; i < MAX_SHADOWS; i ++ ) {\n\n		float texelSizeY =  1.0 / shadowMapSize[ i ].y;\n\n		float shadow = 0.0;\n\n#if defined( POINT_LIGHT_SHADOWS )\n\n		bool isPointLight = shadowDarkness[ i ] < 0.0;\n\n		if ( isPointLight ) {\n\n			float realShadowDarkness = abs( shadowDarkness[ i ] );\n\n			vec3 lightToPosition = vShadowCoord[ i ].xyz;\n\n	#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT )\n\n			vec3 bd3D = normalize( lightToPosition );\n			float dp = length( lightToPosition );\n\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D, texelSizeY ) ), shadowBias[ i ], shadow );\n\n\n	#if defined( SHADOWMAP_TYPE_PCF )\n			const float Dr = 1.25;\n	#elif defined( SHADOWMAP_TYPE_PCF_SOFT )\n			const float Dr = 2.25;\n	#endif\n\n			float os = Dr *  2.0 * texelSizeY;\n\n			const vec3 Gsd = vec3( - 1, 0, 1 );\n\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zzz * os, texelSizeY ) ), shadowBias[ i ], shadow );\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zxz * os, texelSizeY ) ), shadowBias[ i ], shadow );\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xxz * os, texelSizeY ) ), shadowBias[ i ], shadow );\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xzz * os, texelSizeY ) ), shadowBias[ i ], shadow );\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zzx * os, texelSizeY ) ), shadowBias[ i ], shadow );\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zxx * os, texelSizeY ) ), shadowBias[ i ], shadow );\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xxx * os, texelSizeY ) ), shadowBias[ i ], shadow );\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xzx * os, texelSizeY ) ), shadowBias[ i ], shadow );\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zzy * os, texelSizeY ) ), shadowBias[ i ], shadow );\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zxy * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xxy * os, texelSizeY ) ), shadowBias[ i ], shadow );\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xzy * os, texelSizeY ) ), shadowBias[ i ], shadow );\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zyz * os, texelSizeY ) ), shadowBias[ i ], shadow );\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xyz * os, texelSizeY ) ), shadowBias[ i ], shadow );\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zyx * os, texelSizeY ) ), shadowBias[ i ], shadow );\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xyx * os, texelSizeY ) ), shadowBias[ i ], shadow );\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.yzz * os, texelSizeY ) ), shadowBias[ i ], shadow );\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.yxz * os, texelSizeY ) ), shadowBias[ i ], shadow );\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.yxx * os, texelSizeY ) ), shadowBias[ i ], shadow );\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.yzx * os, texelSizeY ) ), shadowBias[ i ], shadow );\n\n			shadow *= realShadowDarkness * ( 1.0 / 21.0 );\n\n	#else \n			vec3 bd3D = normalize( lightToPosition );\n			float dp = length( lightToPosition );\n\n			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D, texelSizeY ) ), shadowBias[ i ], shadow );\n\n			shadow *= realShadowDarkness;\n\n	#endif\n\n		} else {\n\n#endif \n			float texelSizeX =  1.0 / shadowMapSize[ i ].x;\n\n			vec3 shadowCoord = vShadowCoord[ i ].xyz / vShadowCoord[ i ].w;\n\n\n			bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );\n			bool inFrustum = all( inFrustumVec );\n\n			bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );\n\n			bool frustumTest = all( frustumTestVec );\n\n			if ( frustumTest ) {\n\n	#if defined( SHADOWMAP_TYPE_PCF )\n\n\n				/*\n					for ( float y = -1.25; y <= 1.25; y += 1.25 )\n						for ( float x = -1.25; x <= 1.25; x += 1.25 ) {\n							vec4 rgbaDepth = texture2D( shadowMap[ i ], vec2( x * xPixelOffset, y * yPixelOffset ) + shadowCoord.xy );\n							float fDepth = unpackDepth( rgbaDepth );\n							if ( fDepth < shadowCoord.z )\n								shadow += 1.0;\n					}\n					shadow /= 9.0;\n				*/\n\n				shadowCoord.z += shadowBias[ i ];\n\n				const float ShadowDelta = 1.0 / 9.0;\n\n				float xPixelOffset = texelSizeX;\n				float yPixelOffset = texelSizeY;\n\n				float dx0 = - 1.25 * xPixelOffset;\n				float dy0 = - 1.25 * yPixelOffset;\n				float dx1 = 1.25 * xPixelOffset;\n				float dy1 = 1.25 * yPixelOffset;\n\n				float fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );\n				if ( fDepth < shadowCoord.z ) shadow += ShadowDelta;\n\n				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );\n				if ( fDepth < shadowCoord.z ) shadow += ShadowDelta;\n\n				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );\n				if ( fDepth < shadowCoord.z ) shadow += ShadowDelta;\n\n				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );\n				if ( fDepth < shadowCoord.z ) shadow += ShadowDelta;\n\n				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );\n				if ( fDepth < shadowCoord.z ) shadow += ShadowDelta;\n\n				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );\n				if ( fDepth < shadowCoord.z ) shadow += ShadowDelta;\n\n				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );\n				if ( fDepth < shadowCoord.z ) shadow += ShadowDelta;\n\n				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );\n				if ( fDepth < shadowCoord.z ) shadow += ShadowDelta;\n\n				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );\n				if ( fDepth < shadowCoord.z ) shadow += ShadowDelta;\n\n				shadow *= shadowDarkness[ i ];\n\n	#elif defined( SHADOWMAP_TYPE_PCF_SOFT )\n\n\n				shadowCoord.z += shadowBias[ i ];\n\n				float xPixelOffset = texelSizeX;\n				float yPixelOffset = texelSizeY;\n\n				float dx0 = - 1.0 * xPixelOffset;\n				float dy0 = - 1.0 * yPixelOffset;\n				float dx1 = 1.0 * xPixelOffset;\n				float dy1 = 1.0 * yPixelOffset;\n\n				mat3 shadowKernel;\n				mat3 depthKernel;\n\n				depthKernel[ 0 ][ 0 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );\n				depthKernel[ 0 ][ 1 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );\n				depthKernel[ 0 ][ 2 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );\n				depthKernel[ 1 ][ 0 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );\n				depthKernel[ 1 ][ 1 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );\n				depthKernel[ 1 ][ 2 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );\n				depthKernel[ 2 ][ 0 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );\n				depthKernel[ 2 ][ 1 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );\n				depthKernel[ 2 ][ 2 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );\n\n				vec3 shadowZ = vec3( shadowCoord.z );\n				shadowKernel[ 0 ] = vec3( lessThan( depthKernel[ 0 ], shadowZ ) );\n				shadowKernel[ 0 ] *= vec3( 0.25 );\n\n				shadowKernel[ 1 ] = vec3( lessThan( depthKernel[ 1 ], shadowZ ) );\n				shadowKernel[ 1 ] *= vec3( 0.25 );\n\n				shadowKernel[ 2 ] = vec3( lessThan( depthKernel[ 2 ], shadowZ ) );\n				shadowKernel[ 2 ] *= vec3( 0.25 );\n\n				vec2 fractionalCoord = 1.0 - fract( shadowCoord.xy * shadowMapSize[ i ].xy );\n\n				shadowKernel[ 0 ] = mix( shadowKernel[ 1 ], shadowKernel[ 0 ], fractionalCoord.x );\n				shadowKernel[ 1 ] = mix( shadowKernel[ 2 ], shadowKernel[ 1 ], fractionalCoord.x );\n\n				vec4 shadowValues;\n				shadowValues.x = mix( shadowKernel[ 0 ][ 1 ], shadowKernel[ 0 ][ 0 ], fractionalCoord.y );\n				shadowValues.y = mix( shadowKernel[ 0 ][ 2 ], shadowKernel[ 0 ][ 1 ], fractionalCoord.y );\n				shadowValues.z = mix( shadowKernel[ 1 ][ 1 ], shadowKernel[ 1 ][ 0 ], fractionalCoord.y );\n				shadowValues.w = mix( shadowKernel[ 1 ][ 2 ], shadowKernel[ 1 ][ 1 ], fractionalCoord.y );\n\n				shadow = dot( shadowValues, vec4( 1.0 ) ) * shadowDarkness[ i ];\n\n	#else \n				shadowCoord.z += shadowBias[ i ];\n\n				vec4 rgbaDepth = texture2D( shadowMap[ i ], shadowCoord.xy );\n				float fDepth = unpackDepth( rgbaDepth );\n\n				if ( fDepth < shadowCoord.z )\n					shadow = shadowDarkness[ i ];\n\n	#endif\n\n			}\n\n#ifdef SHADOWMAP_DEBUG\n\n			if ( inFrustum ) {\n\n				if ( i == 0 ) {\n\n					outgoingLight *= vec3( 1.0, 0.5, 0.0 );\n\n				} else if ( i == 1 ) {\n\n					outgoingLight *= vec3( 0.0, 1.0, 0.8 );\n\n				} else {\n\n					outgoingLight *= vec3( 0.0, 0.5, 1.0 );\n\n				}\n\n			}\n\n#endif\n\n#if defined( POINT_LIGHT_SHADOWS )\n\n		}\n\n#endif\n\n		shadowMask = shadowMask * vec3( 1.0 - shadow );\n\n	}\n\n#endif\n", THREE.ShaderChunk.shadowmap_pars_fragment = "#ifdef USE_SHADOWMAP\n\n	uniform sampler2D shadowMap[ MAX_SHADOWS ];\n	uniform vec2 shadowMapSize[ MAX_SHADOWS ];\n\n	uniform float shadowDarkness[ MAX_SHADOWS ];\n	uniform float shadowBias[ MAX_SHADOWS ];\n\n	varying vec4 vShadowCoord[ MAX_SHADOWS ];\n\n	float unpackDepth( const in vec4 rgba_depth ) {\n\n		const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );\n		float depth = dot( rgba_depth, bit_shift );\n		return depth;\n\n	}\n\n	#if defined(POINT_LIGHT_SHADOWS)\n\n\n		void adjustShadowValue1K( const float testDepth, const vec4 textureData, const float bias, inout float shadowValue ) {\n\n			const vec4 bitSh = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );\n			if ( testDepth >= dot( textureData, bitSh ) * 1000.0 + bias )\n				shadowValue += 1.0;\n\n		}\n\n\n		vec2 cubeToUV( vec3 v, float texelSizeY ) {\n\n\n			vec3 absV = abs( v );\n\n\n			float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );\n			absV *= scaleToCube;\n\n\n			v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );\n\n\n\n			vec2 planar = v.xy;\n\n			float almostATexel = 1.5 * texelSizeY;\n			float almostOne = 1.0 - almostATexel;\n\n			if ( absV.z >= almostOne ) {\n\n				if ( v.z > 0.0 )\n					planar.x = 4.0 - v.x;\n\n			} else if ( absV.x >= almostOne ) {\n\n				float signX = sign( v.x );\n				planar.x = v.z * signX + 2.0 * signX;\n\n			} else if ( absV.y >= almostOne ) {\n\n				float signY = sign( v.y );\n				planar.x = v.x + 2.0 * signY + 2.0;\n				planar.y = v.z * signY - 2.0;\n\n			}\n\n\n			return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );\n\n		}\n\n	#endif\n\n#endif\n", THREE.ShaderChunk.shadowmap_pars_vertex = "#ifdef USE_SHADOWMAP\n\n	uniform float shadowDarkness[ MAX_SHADOWS ];\n	uniform mat4 shadowMatrix[ MAX_SHADOWS ];\n	varying vec4 vShadowCoord[ MAX_SHADOWS ];\n\n#endif", THREE.ShaderChunk.shadowmap_vertex = "#ifdef USE_SHADOWMAP\n\n	for ( int i = 0; i < MAX_SHADOWS; i ++ ) {\n\n			vShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;\n\n	}\n\n#endif", THREE.ShaderChunk.skinbase_vertex = "#ifdef USE_SKINNING\n\n	mat4 boneMatX = getBoneMatrix( skinIndex.x );\n	mat4 boneMatY = getBoneMatrix( skinIndex.y );\n	mat4 boneMatZ = getBoneMatrix( skinIndex.z );\n	mat4 boneMatW = getBoneMatrix( skinIndex.w );\n\n#endif", THREE.ShaderChunk.skinning_pars_vertex = "#ifdef USE_SKINNING\n\n	uniform mat4 bindMatrix;\n	uniform mat4 bindMatrixInverse;\n\n	#ifdef BONE_TEXTURE\n\n		uniform sampler2D boneTexture;\n		uniform int boneTextureWidth;\n		uniform int boneTextureHeight;\n\n		mat4 getBoneMatrix( const in float i ) {\n\n			float j = i * 4.0;\n			float x = mod( j, float( boneTextureWidth ) );\n			float y = floor( j / float( boneTextureWidth ) );\n\n			float dx = 1.0 / float( boneTextureWidth );\n			float dy = 1.0 / float( boneTextureHeight );\n\n			y = dy * ( y + 0.5 );\n\n			vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );\n			vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );\n			vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );\n			vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );\n\n			mat4 bone = mat4( v1, v2, v3, v4 );\n\n			return bone;\n\n		}\n\n	#else\n\n		uniform mat4 boneGlobalMatrices[ MAX_BONES ];\n\n		mat4 getBoneMatrix( const in float i ) {\n\n			mat4 bone = boneGlobalMatrices[ int(i) ];\n			return bone;\n\n		}\n\n	#endif\n\n#endif\n", THREE.ShaderChunk.skinning_vertex = "#ifdef USE_SKINNING\n\n	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );\n\n	vec4 skinned = vec4( 0.0 );\n	skinned += boneMatX * skinVertex * skinWeight.x;\n	skinned += boneMatY * skinVertex * skinWeight.y;\n	skinned += boneMatZ * skinVertex * skinWeight.z;\n	skinned += boneMatW * skinVertex * skinWeight.w;\n	skinned  = bindMatrixInverse * skinned;\n\n#endif\n", THREE.ShaderChunk.skinnormal_vertex = "#ifdef USE_SKINNING\n\n	mat4 skinMatrix = mat4( 0.0 );\n	skinMatrix += skinWeight.x * boneMatX;\n	skinMatrix += skinWeight.y * boneMatY;\n	skinMatrix += skinWeight.z * boneMatZ;\n	skinMatrix += skinWeight.w * boneMatW;\n	skinMatrix  = bindMatrixInverse * skinMatrix * bindMatrix;\n\n	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;\n\n#endif\n", THREE.ShaderChunk.specularmap_fragment = "float specularStrength;\n\n#ifdef USE_SPECULARMAP\n\n	vec4 texelSpecular = texture2D( specularMap, vUv );\n	specularStrength = texelSpecular.r;\n\n#else\n\n	specularStrength = 1.0;\n\n#endif", THREE.ShaderChunk.specularmap_pars_fragment = "#ifdef USE_SPECULARMAP\n\n	uniform sampler2D specularMap;\n\n#endif", THREE.ShaderChunk.uv2_pars_fragment = "#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\n	varying vec2 vUv2;\n\n#endif", THREE.ShaderChunk.uv2_pars_vertex = "#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\n	attribute vec2 uv2;\n	varying vec2 vUv2;\n\n#endif", THREE.ShaderChunk.uv2_vertex = "#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\n	vUv2 = uv2;\n\n#endif", THREE.ShaderChunk.uv_pars_fragment = "#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP )\n\n	varying vec2 vUv;\n\n#endif", THREE.ShaderChunk.uv_pars_vertex = "#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP )\n\n	varying vec2 vUv;\n	uniform vec4 offsetRepeat;\n\n#endif\n", THREE.ShaderChunk.uv_vertex = "#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP )\n\n	vUv = uv * offsetRepeat.zw + offsetRepeat.xy;\n\n#endif", THREE.ShaderChunk.worldpos_vertex = "#if defined( USE_ENVMAP ) || defined( PHONG ) || defined( LAMBERT ) || defined ( USE_SHADOWMAP )\n\n	#ifdef USE_SKINNING\n\n		vec4 worldPosition = modelMatrix * skinned;\n\n	#else\n\n		vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );\n\n	#endif\n\n#endif\n", THREE.UniformsUtils = {
            merge: function (e) {
                for (var t = {}, r = 0; r < e.length; r++) {
                    var n = this.clone(e[r]); for (var i in n) t[i] = n[i]
                } return t
            }, clone: function (e) {
                var t = {}; for (var r in e) {
                    t[r] = {}; for (var n in e[r]) {
                        var i = e[r][n]; i instanceof THREE.Color || i instanceof THREE.Vector2 || i instanceof THREE.Vector3 || i instanceof THREE.Vector4 || i instanceof THREE.Matrix3 || i instanceof THREE.Matrix4 || i instanceof THREE.Texture ? t[r][n] = i.clone() : Array.isArray(i) ? t[r][n] = i.slice() : t[r][n] = i
                    }
                } return t
            }
        }, THREE.UniformsLib = {
            common: {
                diffuse: {
                    type: "c", value: new THREE.Color(15658734)
                }, opacity: {
                    type: "f", value: 1
                }, map: {
                    type: "t", value: null
                }, offsetRepeat: {
                    type: "v4", value: new THREE.Vector4(0, 0, 1, 1)
                }, specularMap: {
                    type: "t", value: null
                }, alphaMap: {
                    type: "t", value: null
                }, envMap: {
                    type: "t", value: null
                }, flipEnvMap: {
                    type: "f", value: -1
                }, reflectivity: {
                    type: "f", value: 1
                }, refractionRatio: {
                    type: "f", value: .98
                }
            }, aomap: {
                aoMap: {
                    type: "t", value: null
                }, aoMapIntensity: {
                    type: "f", value: 1
                }
            }, lightmap: {
                lightMap: {
                    type: "t", value: null
                }, lightMapIntensity: {
                    type: "f", value: 1
                }
            }, emissivemap: {
                emissiveMap: {
                    type: "t", value: null
                }
            }, bumpmap: {
                bumpMap: {
                    type: "t", value: null
                }, bumpScale: {
                    type: "f", value: 1
                }
            }, normalmap: {
                normalMap: {
                    type: "t", value: null
                }, normalScale: {
                    type: "v2", value: new THREE.Vector2(1, 1)
                }
            }, displacementmap: {
                displacementMap: {
                    type: "t", value: null
                }, displacementScale: {
                    type: "f", value: 1
                }, displacementBias: {
                    type: "f", value: 0
                }
            }, fog: {
                fogDensity: {
                    type: "f", value: 25e-5
                }, fogNear: {
                    type: "f", value: 1
                }, fogFar: {
                    type: "f", value: 2e3
                }, fogColor: {
                    type: "c", value: new THREE.Color(16777215)
                }
            }, lights: {
                ambientLightColor: {
                    type: "fv", value: []
                }, directionalLightDirection: {
                    type: "fv", value: []
                }, directionalLightColor: {
                    type: "fv", value: []
                }, hemisphereLightDirection: {
                    type: "fv", value: []
                }, hemisphereLightSkyColor: {
                    type: "fv", value: []
                }, hemisphereLightGroundColor: {
                    type: "fv", value: []
                }, pointLightColor: {
                    type: "fv", value: []
                }, pointLightPosition: {
                    type: "fv", value: []
                }, pointLightDistance: {
                    type: "fv1", value: []
                }, pointLightDecay: {
                    type: "fv1", value: []
                }, spotLightColor: {
                    type: "fv", value: []
                }, spotLightPosition: {
                    type: "fv", value: []
                }, spotLightDirection: {
                    type: "fv", value: []
                }, spotLightDistance: {
                    type: "fv1", value: []
                }, spotLightAngleCos: {
                    type: "fv1", value: []
                }, spotLightExponent: {
                    type: "fv1", value: []
                }, spotLightDecay: {
                    type: "fv1", value: []
                }
            }, points: {
                psColor: {
                    type: "c", value: new THREE.Color(15658734)
                }, opacity: {
                    type: "f", value: 1
                }, size: {
                    type: "f", value: 1
                }, scale: {
                    type: "f", value: 1
                }, map: {
                    type: "t", value: null
                }, offsetRepeat: {
                    type: "v4", value: new THREE.Vector4(0, 0, 1, 1)
                }, fogDensity: {
                    type: "f", value: 25e-5
                }, fogNear: {
                    type: "f", value: 1
                }, fogFar: {
                    type: "f", value: 2e3
                }, fogColor: {
                    type: "c", value: new THREE.Color(16777215)
                }
            }, shadowmap: {
                shadowMap: {
                    type: "tv", value: []
                }, shadowMapSize: {
                    type: "v2v", value: []
                }, shadowBias: {
                    type: "fv1", value: []
                }, shadowDarkness: {
                    type: "fv1", value: []
                }, shadowMatrix: {
                    type: "m4v", value: []
                }
            }
        }, THREE.ShaderLib = {
            basic: {
                uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.aomap, THREE.UniformsLib.fog, THREE.UniformsLib.shadowmap]), vertexShader: [THREE.ShaderChunk.common, THREE.ShaderChunk.uv_pars_vertex, THREE.ShaderChunk.uv2_pars_vertex, THREE.ShaderChunk.envmap_pars_vertex, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.skinning_pars_vertex, THREE.ShaderChunk.shadowmap_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.uv_vertex, THREE.ShaderChunk.uv2_vertex, THREE.ShaderChunk.color_vertex, THREE.ShaderChunk.skinbase_vertex, "	#ifdef USE_ENVMAP", THREE.ShaderChunk.beginnormal_vertex, THREE.ShaderChunk.morphnormal_vertex, THREE.ShaderChunk.skinnormal_vertex, THREE.ShaderChunk.defaultnormal_vertex, "	#endif", THREE.ShaderChunk.begin_vertex, THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.skinning_vertex, THREE.ShaderChunk.project_vertex, THREE.ShaderChunk.logdepthbuf_vertex, THREE.ShaderChunk.worldpos_vertex, THREE.ShaderChunk.envmap_vertex, THREE.ShaderChunk.shadowmap_vertex, "}"].join("\n"), fragmentShader: ["uniform vec3 diffuse;", "uniform float opacity;", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.uv_pars_fragment, THREE.ShaderChunk.uv2_pars_fragment, THREE.ShaderChunk.map_pars_fragment, THREE.ShaderChunk.alphamap_pars_fragment, THREE.ShaderChunk.aomap_pars_fragment, THREE.ShaderChunk.envmap_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.shadowmap_pars_fragment, THREE.ShaderChunk.specularmap_pars_fragment, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", "	vec3 outgoingLight = vec3( 0.0 );", "	vec4 diffuseColor = vec4( diffuse, opacity );", "	vec3 totalAmbientLight = vec3( 1.0 );", "	vec3 shadowMask = vec3( 1.0 );", THREE.ShaderChunk.logdepthbuf_fragment, THREE.ShaderChunk.map_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.alphamap_fragment, THREE.ShaderChunk.alphatest_fragment, THREE.ShaderChunk.specularmap_fragment, THREE.ShaderChunk.aomap_fragment, THREE.ShaderChunk.shadowmap_fragment, "	outgoingLight = diffuseColor.rgb * totalAmbientLight * shadowMask;", THREE.ShaderChunk.envmap_fragment, THREE.ShaderChunk.linear_to_gamma_fragment, THREE.ShaderChunk.fog_fragment, "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );", "}"].join("\n")
            }, lambert: {
                uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.fog, THREE.UniformsLib.lights, THREE.UniformsLib.shadowmap, {
                    emissive: {
                        type: "c", value: new THREE.Color(0)
                    }
                }]), vertexShader: ["#define LAMBERT", "varying vec3 vLightFront;", "#ifdef DOUBLE_SIDED", "	varying vec3 vLightBack;", "#endif", THREE.ShaderChunk.common, THREE.ShaderChunk.uv_pars_vertex, THREE.ShaderChunk.uv2_pars_vertex, THREE.ShaderChunk.envmap_pars_vertex, THREE.ShaderChunk.lights_lambert_pars_vertex, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.skinning_pars_vertex, THREE.ShaderChunk.shadowmap_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.uv_vertex, THREE.ShaderChunk.uv2_vertex, THREE.ShaderChunk.color_vertex, THREE.ShaderChunk.beginnormal_vertex, THREE.ShaderChunk.morphnormal_vertex, THREE.ShaderChunk.skinbase_vertex, THREE.ShaderChunk.skinnormal_vertex, THREE.ShaderChunk.defaultnormal_vertex, THREE.ShaderChunk.begin_vertex, THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.skinning_vertex, THREE.ShaderChunk.project_vertex, THREE.ShaderChunk.logdepthbuf_vertex, THREE.ShaderChunk.worldpos_vertex, THREE.ShaderChunk.envmap_vertex, THREE.ShaderChunk.lights_lambert_vertex, THREE.ShaderChunk.shadowmap_vertex, "}"].join("\n"), fragmentShader: ["uniform vec3 diffuse;", "uniform vec3 emissive;", "uniform float opacity;", "uniform vec3 ambientLightColor;", "varying vec3 vLightFront;", "#ifdef DOUBLE_SIDED", "	varying vec3 vLightBack;", "#endif", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.uv_pars_fragment, THREE.ShaderChunk.uv2_pars_fragment, THREE.ShaderChunk.map_pars_fragment, THREE.ShaderChunk.alphamap_pars_fragment, THREE.ShaderChunk.envmap_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.shadowmap_pars_fragment, THREE.ShaderChunk.specularmap_pars_fragment, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", "	vec3 outgoingLight = vec3( 0.0 );", "	vec4 diffuseColor = vec4( diffuse, opacity );", "	vec3 totalAmbientLight = ambientLightColor;", "	vec3 shadowMask = vec3( 1.0 );", THREE.ShaderChunk.logdepthbuf_fragment, THREE.ShaderChunk.map_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.alphamap_fragment, THREE.ShaderChunk.alphatest_fragment, THREE.ShaderChunk.specularmap_fragment, THREE.ShaderChunk.shadowmap_fragment, "	#ifdef DOUBLE_SIDED", "		if ( gl_FrontFacing )", "			outgoingLight += diffuseColor.rgb * ( vLightFront * shadowMask + totalAmbientLight ) + emissive;", "		else", "			outgoingLight += diffuseColor.rgb * ( vLightBack * shadowMask + totalAmbientLight ) + emissive;", "	#else", "		outgoingLight += diffuseColor.rgb * ( vLightFront * shadowMask + totalAmbientLight ) + emissive;", "	#endif", THREE.ShaderChunk.envmap_fragment, THREE.ShaderChunk.linear_to_gamma_fragment, THREE.ShaderChunk.fog_fragment, "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );", "}"].join("\n")
            }, phong: {
                uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.aomap, THREE.UniformsLib.lightmap, THREE.UniformsLib.emissivemap, THREE.UniformsLib.bumpmap, THREE.UniformsLib.normalmap, THREE.UniformsLib.displacementmap, THREE.UniformsLib.fog, THREE.UniformsLib.lights, THREE.UniformsLib.shadowmap, {
                    emissive: {
                        type: "c", value: new THREE.Color(0)
                    }, specular: {
                        type: "c", value: new THREE.Color(1118481)
                    }, shininess: {
                        type: "f", value: 30
                    }
                }]), vertexShader: ["#define PHONG", "varying vec3 vViewPosition;", "#ifndef FLAT_SHADED", "	varying vec3 vNormal;", "#endif", THREE.ShaderChunk.common, THREE.ShaderChunk.uv_pars_vertex, THREE.ShaderChunk.uv2_pars_vertex, THREE.ShaderChunk.displacementmap_pars_vertex, THREE.ShaderChunk.envmap_pars_vertex, THREE.ShaderChunk.lights_phong_pars_vertex, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.skinning_pars_vertex, THREE.ShaderChunk.shadowmap_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.uv_vertex, THREE.ShaderChunk.uv2_vertex, THREE.ShaderChunk.color_vertex, THREE.ShaderChunk.beginnormal_vertex, THREE.ShaderChunk.morphnormal_vertex, THREE.ShaderChunk.skinbase_vertex, THREE.ShaderChunk.skinnormal_vertex, THREE.ShaderChunk.defaultnormal_vertex, "#ifndef FLAT_SHADED", "	vNormal = normalize( transformedNormal );", "#endif", THREE.ShaderChunk.begin_vertex, THREE.ShaderChunk.displacementmap_vertex, THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.skinning_vertex, THREE.ShaderChunk.project_vertex, THREE.ShaderChunk.logdepthbuf_vertex, "	vViewPosition = - mvPosition.xyz;", THREE.ShaderChunk.worldpos_vertex, THREE.ShaderChunk.envmap_vertex, THREE.ShaderChunk.lights_phong_vertex, THREE.ShaderChunk.shadowmap_vertex, "}"].join("\n"), fragmentShader: ["#define PHONG", "uniform vec3 diffuse;", "uniform vec3 emissive;", "uniform vec3 specular;", "uniform float shininess;", "uniform float opacity;", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.uv_pars_fragment, THREE.ShaderChunk.uv2_pars_fragment, THREE.ShaderChunk.map_pars_fragment, THREE.ShaderChunk.alphamap_pars_fragment, THREE.ShaderChunk.aomap_pars_fragment, THREE.ShaderChunk.lightmap_pars_fragment, THREE.ShaderChunk.emissivemap_pars_fragment, THREE.ShaderChunk.envmap_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.lights_phong_pars_fragment, THREE.ShaderChunk.shadowmap_pars_fragment, THREE.ShaderChunk.bumpmap_pars_fragment, THREE.ShaderChunk.normalmap_pars_fragment, THREE.ShaderChunk.specularmap_pars_fragment, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", "	vec3 outgoingLight = vec3( 0.0 );", "	vec4 diffuseColor = vec4( diffuse, opacity );", "	vec3 totalAmbientLight = ambientLightColor;", "	vec3 totalEmissiveLight = emissive;", "	vec3 shadowMask = vec3( 1.0 );", THREE.ShaderChunk.logdepthbuf_fragment, THREE.ShaderChunk.map_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.alphamap_fragment, THREE.ShaderChunk.alphatest_fragment, THREE.ShaderChunk.specularmap_fragment, THREE.ShaderChunk.normal_phong_fragment, THREE.ShaderChunk.lightmap_fragment, THREE.ShaderChunk.hemilight_fragment, THREE.ShaderChunk.aomap_fragment, THREE.ShaderChunk.emissivemap_fragment, THREE.ShaderChunk.lights_phong_fragment, THREE.ShaderChunk.shadowmap_fragment, "totalDiffuseLight *= shadowMask;", "totalSpecularLight *= shadowMask;", "#ifdef METAL", "	outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) * specular + totalSpecularLight + totalEmissiveLight;", "#else", "	outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) + totalSpecularLight + totalEmissiveLight;", "#endif", THREE.ShaderChunk.envmap_fragment, THREE.ShaderChunk.linear_to_gamma_fragment, THREE.ShaderChunk.fog_fragment, "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );", "}"].join("\n")
            }, points: {
                uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.points, THREE.UniformsLib.shadowmap]), vertexShader: ["uniform float size;", "uniform float scale;", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.shadowmap_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.color_vertex, "	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );", "	#ifdef USE_SIZEATTENUATION", "		gl_PointSize = size * ( scale / length( mvPosition.xyz ) );", "	#else", "		gl_PointSize = size;", "	#endif", "	gl_Position = projectionMatrix * mvPosition;", THREE.ShaderChunk.logdepthbuf_vertex, THREE.ShaderChunk.worldpos_vertex, THREE.ShaderChunk.shadowmap_vertex, "}"].join("\n"), fragmentShader: ["uniform vec3 psColor;", "uniform float opacity;", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.map_particle_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.shadowmap_pars_fragment, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", "	vec3 outgoingLight = vec3( 0.0 );", "	vec4 diffuseColor = vec4( psColor, opacity );", "	vec3 shadowMask = vec3( 1.0 );", THREE.ShaderChunk.logdepthbuf_fragment, THREE.ShaderChunk.map_particle_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.alphatest_fragment, THREE.ShaderChunk.shadowmap_fragment, "	outgoingLight = diffuseColor.rgb * shadowMask;", THREE.ShaderChunk.fog_fragment, "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );", "}"].join("\n")
            }, dashed: {
                uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.fog, {
                    scale: {
                        type: "f", value: 1
                    }, dashSize: {
                        type: "f", value: 1
                    }, totalSize: {
                        type: "f", value: 2
                    }
                }]), vertexShader: ["uniform float scale;", "attribute float lineDistance;", "varying float vLineDistance;", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.color_vertex, "	vLineDistance = scale * lineDistance;", "	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );", "	gl_Position = projectionMatrix * mvPosition;", THREE.ShaderChunk.logdepthbuf_vertex, "}"].join("\n"), fragmentShader: ["uniform vec3 diffuse;", "uniform float opacity;", "uniform float dashSize;", "uniform float totalSize;", "varying float vLineDistance;", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", "	if ( mod( vLineDistance, totalSize ) > dashSize ) {", "		discard;", "	}", "	vec3 outgoingLight = vec3( 0.0 );", "	vec4 diffuseColor = vec4( diffuse, opacity );", THREE.ShaderChunk.logdepthbuf_fragment, THREE.ShaderChunk.color_fragment, "	outgoingLight = diffuseColor.rgb;", THREE.ShaderChunk.fog_fragment, "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );", "}"].join("\n")
            }, depth: {
                uniforms: {
                    mNear: {
                        type: "f", value: 1
                    }, mFar: {
                        type: "f", value: 2e3
                    }, opacity: {
                        type: "f", value: 1
                    }
                }, vertexShader: [THREE.ShaderChunk.common, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.begin_vertex, THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.project_vertex, THREE.ShaderChunk.logdepthbuf_vertex, "}"].join("\n"), fragmentShader: ["uniform float mNear;", "uniform float mFar;", "uniform float opacity;", THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", THREE.ShaderChunk.logdepthbuf_fragment, "	#ifdef USE_LOGDEPTHBUF_EXT", "		float depth = gl_FragDepthEXT / gl_FragCoord.w;", "	#else", "		float depth = gl_FragCoord.z / gl_FragCoord.w;", "	#endif", "	float color = 1.0 - smoothstep( mNear, mFar, depth );", "	gl_FragColor = vec4( vec3( color ), opacity );", "}"].join("\n")
            }, normal: {
                uniforms: {
                    opacity: {
                        type: "f", value: 1
                    }
                }, vertexShader: ["varying vec3 vNormal;", THREE.ShaderChunk.common, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", "	vNormal = normalize( normalMatrix * normal );", THREE.ShaderChunk.begin_vertex, THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.project_vertex, THREE.ShaderChunk.logdepthbuf_vertex, "}"].join("\n"), fragmentShader: ["uniform float opacity;", "varying vec3 vNormal;", THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", "	gl_FragColor = vec4( 0.5 * normalize( vNormal ) + 0.5, opacity );", THREE.ShaderChunk.logdepthbuf_fragment, "}"].join("\n")
            }, cube: {
                uniforms: {
                    tCube: {
                        type: "t", value: null
                    }, tFlip: {
                        type: "f", value: -1
                    }
                }, vertexShader: ["varying vec3 vWorldPosition;", THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", "	vWorldPosition = transformDirection( position, modelMatrix );", "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", THREE.ShaderChunk.logdepthbuf_vertex, "}"].join("\n"), fragmentShader: ["uniform samplerCube tCube;", "uniform float tFlip;", "varying vec3 vWorldPosition;", THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", "	gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );", THREE.ShaderChunk.logdepthbuf_fragment, "}"].join("\n")
            }, equirect: {
                uniforms: {
                    tEquirect: {
                        type: "t", value: null
                    }, tFlip: {
                        type: "f", value: -1
                    }
                }, vertexShader: ["varying vec3 vWorldPosition;", THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", "	vWorldPosition = transformDirection( position, modelMatrix );", "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", THREE.ShaderChunk.logdepthbuf_vertex, "}"].join("\n"), fragmentShader: ["uniform sampler2D tEquirect;", "uniform float tFlip;", "varying vec3 vWorldPosition;", THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", "vec3 direction = normalize( vWorldPosition );", "vec2 sampleUV;", "sampleUV.y = saturate( tFlip * direction.y * -0.5 + 0.5 );", "sampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;", "gl_FragColor = texture2D( tEquirect, sampleUV );", THREE.ShaderChunk.logdepthbuf_fragment, "}"].join("\n")
            }, depthRGBA: {
                uniforms: {}, vertexShader: [THREE.ShaderChunk.common, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.skinning_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.skinbase_vertex, THREE.ShaderChunk.begin_vertex, THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.skinning_vertex, THREE.ShaderChunk.project_vertex, THREE.ShaderChunk.logdepthbuf_vertex, "}"].join("\n"), fragmentShader: [THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_fragment, "vec4 pack_depth( const in float depth ) {", "	const vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );", "	const vec4 bit_mask = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );", "	vec4 res = mod( depth * bit_shift * vec4( 255 ), vec4( 256 ) ) / vec4( 255 );", "	res -= res.xxyz * bit_mask;", "	return res;", "}", "void main() {", THREE.ShaderChunk.logdepthbuf_fragment, "	#ifdef USE_LOGDEPTHBUF_EXT", "		gl_FragData[ 0 ] = pack_depth( gl_FragDepthEXT );", "	#else", "		gl_FragData[ 0 ] = pack_depth( gl_FragCoord.z );", "	#endif", "}"].join("\n")
            }, distanceRGBA: {
                uniforms: {
                    lightPos: {
                        type: "v3", value: new THREE.Vector3(0, 0, 0)
                    }
                }, vertexShader: ["varying vec4 vWorldPosition;", THREE.ShaderChunk.common, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.skinning_pars_vertex, "void main() {", THREE.ShaderChunk.skinbase_vertex, THREE.ShaderChunk.begin_vertex, THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.skinning_vertex, THREE.ShaderChunk.project_vertex, THREE.ShaderChunk.worldpos_vertex, "vWorldPosition = worldPosition;", "}"].join("\n"), fragmentShader: ["uniform vec3 lightPos;", "varying vec4 vWorldPosition;", THREE.ShaderChunk.common, "vec4 pack1K ( float depth ) {", "   depth /= 1000.0;", "   const vec4 bitSh = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );", "	const vec4 bitMsk = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );", "	vec4 res = fract( depth * bitSh );", "	res -= res.xxyz * bitMsk;", "	return res; ", "}", "float unpack1K ( vec4 color ) {", "	const vec4 bitSh = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );", "	return dot( color, bitSh ) * 1000.0;", "}", "void main () {", "	gl_FragColor = pack1K( length( vWorldPosition.xyz - lightPos.xyz ) );", "}"].join("\n")
            }
        }, THREE.WebGLRenderer = function (e) {
            function t(e, t, r, n) {
                oe === !0 && (e *= n, t *= n, r *= n), Ve.clearColor(e, t, r, n)
            } function r() {
                ze.init(), Ve.viewport(be, we, Me, Se), t(se.r, se.g, se.b, he)
            } function n() {
                ve = null, xe = null, Re = "", ye = -1, De = !0, ze.reset()
            } function i(e) {
                e.preventDefault(), n(), r(), je.clear()
            } function o(e) {
                var t = e.target; t.removeEventListener("dispose", o), h(t), Fe.textures--
            } function a(e) {
                var t = e.target; t.removeEventListener("dispose", a), c(t), Fe.textures--
            } function s(e) {
                var t = e.target; t.removeEventListener("dispose", s), u(t)
            } function h(e) {
                var t = je.get(e); if (e.image && t.__image__webglTextureCube) Ve.deleteTexture(t.__image__webglTextureCube); else {
                    if (void 0 === t.__webglInit) return; Ve.deleteTexture(t.__webglTexture)
                } je["delete"](e)
            } function c(e) {
                var t = je.get(e), r = je.get(e.texture); if (e && void 0 !== r.__webglTexture) {
                    if (Ve.deleteTexture(r.__webglTexture), e instanceof THREE.WebGLRenderTargetCube) for (var n = 0; 6 > n; n++)Ve.deleteFramebuffer(t.__webglFramebuffer[n]), Ve.deleteRenderbuffer(t.__webglRenderbuffer[n]); else Ve.deleteFramebuffer(t.__webglFramebuffer), Ve.deleteRenderbuffer(t.__webglRenderbuffer); je["delete"](e.texture), je["delete"](e)
                }
            } function u(e) {
                l(e), je["delete"](e)
            } function l(e) {
                var t = je.get(e).program; e.program = void 0, void 0 !== t && Xe.releaseProgram(t)
            } function p(e, t, r, n) {
                var i; if (r instanceof THREE.InstancedBufferGeometry && (i = Ie.get("ANGLE_instanced_arrays"), null === i)) return void console.error("THREE.WebGLRenderer.setupVertexAttributes: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays."); void 0 === n && (n = 0), ze.initAttributes(); var o = r.attributes, a = t.getAttributes(), s = e.defaultAttributeValues; for (var h in a) {
                    var c = a[h]; if (c >= 0) {
                        var u = o[h]; if (void 0 !== u) {
                            var l = u.itemSize, p = We.getAttributeBuffer(u); if (u instanceof THREE.InterleavedBufferAttribute) {
                                var f = u.data, d = f.stride, E = u.offset; f instanceof THREE.InstancedInterleavedBuffer ? (ze.enableAttributeAndDivisor(c, f.meshPerAttribute, i), void 0 === r.maxInstancedCount && (r.maxInstancedCount = f.meshPerAttribute * f.count)) : ze.enableAttribute(c), Ve.bindBuffer(Ve.ARRAY_BUFFER, p), Ve.vertexAttribPointer(c, l, Ve.FLOAT, !1, d * f.array.BYTES_PER_ELEMENT, (n * d + E) * f.array.BYTES_PER_ELEMENT)
                            } else u instanceof THREE.InstancedBufferAttribute ? (ze.enableAttributeAndDivisor(c, u.meshPerAttribute, i), void 0 === r.maxInstancedCount && (r.maxInstancedCount = u.meshPerAttribute * u.count)) : ze.enableAttribute(c), Ve.bindBuffer(Ve.ARRAY_BUFFER, p), Ve.vertexAttribPointer(c, l, Ve.FLOAT, !1, 0, n * l * 4)
                        } else if (void 0 !== s) {
                            var m = s[h]; if (void 0 !== m) switch (m.length) {
                                case 2: Ve.vertexAttrib2fv(c, m); break; case 3: Ve.vertexAttrib3fv(c, m); break; case 4: Ve.vertexAttrib4fv(c, m); break; default: Ve.vertexAttrib1fv(c, m)
                            }
                        }
                    }
                } ze.disableUnusedAttributes()
            } function f(e, t) {
                return t[0] - e[0]
            } function d(e, t) {
                return e.object.renderOrder !== t.object.renderOrder ? e.object.renderOrder - t.object.renderOrder : e.material.id !== t.material.id ? e.material.id - t.material.id : e.z !== t.z ? e.z - t.z : e.id - t.id
            } function E(e, t) {
                return e.object.renderOrder !== t.object.renderOrder ? e.object.renderOrder - t.object.renderOrder : e.z !== t.z ? t.z - e.z : e.id - t.id
            } function m(e, t, r, n, i) {
                var o, a; r.transparent ? (o = pe, a = ++fe) : (o = ue, a = ++le); var s = o[a]; void 0 !== s ? (s.id = e.id, s.object = e, s.geometry = t, s.material = r, s.z = ke.z, s.group = i) : (s = {
                    id: e.id, object: e, geometry: t, material: r, z: ke.z, group: i
                }, o.push(s))
            } function g(e, t) {
                if (e.visible !== !1) {
                    if (0 !== (e.channels.mask & t.channels.mask)) if (e instanceof THREE.Light) ce.push(e); else if (e instanceof THREE.Sprite) Ee.push(e); else if (e instanceof THREE.LensFlare) me.push(e); else if (e instanceof THREE.ImmediateRenderObject) ge.sortObjects === !0 && (ke.setFromMatrixPosition(e.matrixWorld), ke.applyProjection(Le)), m(e, null, e.material, ke.z, null); else if ((e instanceof THREE.Mesh || e instanceof THREE.Line || e instanceof THREE.Points) && (e instanceof THREE.SkinnedMesh && e.skeleton.update(), e.frustumCulled === !1 || Ae.intersectsObject(e) === !0)) {
                        var r = e.material; if (r.visible === !0) {
                            ge.sortObjects === !0 && (ke.setFromMatrixPosition(e.matrixWorld), ke.applyProjection(Le)); var n = We.update(e); if (r instanceof THREE.MeshFaceMaterial) for (var i = n.groups, o = r.materials, a = 0, s = i.length; s > a; a++) {
                                var h = i[a], c = o[h.materialIndex]; c.visible === !0 && m(e, n, c, ke.z, h)
                            } else m(e, n, r, ke.z, null)
                        }
                    } for (var u = e.children, a = 0, s = u.length; s > a; a++)g(u[a], t)
                }
            } function v(e, t, r, n, i) {
                for (var o = 0, a = e.length; a > o; o++) {
                    var s = e[o], h = s.object, c = s.geometry, u = void 0 === i ? s.material : i, l = s.group; if (h.modelViewMatrix.multiplyMatrices(t.matrixWorldInverse, h.matrixWorld), h.normalMatrix.getNormalMatrix(h.modelViewMatrix), h instanceof THREE.ImmediateRenderObject) {
                        y(u); var p = x(t, r, n, u, h); Re = "", h.render(function (e) {
                            ge.renderBufferImmediate(e, p, u)
                        })
                    } else ge.renderBufferDirect(t, r, n, c, u, h, l)
                }
            } function T(e, t, r, n) {
                var i = je.get(e), o = Xe.getParameters(e, t, r, n), a = Xe.getProgramCode(e, o), h = i.program, c = !0; if (void 0 === h) e.addEventListener("dispose", s); else if (h.code !== a) l(e); else {
                    if (void 0 !== o.shaderID) return; c = !1
                } if (c) {
                    if (o.shaderID) {
                        var u = THREE.ShaderLib[o.shaderID]; i.__webglShader = {
                            name: e.type, uniforms: THREE.UniformsUtils.clone(u.uniforms), vertexShader: u.vertexShader, fragmentShader: u.fragmentShader
                        }
                    } else i.__webglShader = {
                        name: e.type, uniforms: e.uniforms, vertexShader: e.vertexShader, fragmentShader: e.fragmentShader
                    }; e.__webglShader = i.__webglShader, h = Xe.acquireProgram(e, o, a), i.program = h, e.program = h
                } var p = h.getAttributes(); if (e.morphTargets) {
                    e.numSupportedMorphTargets = 0; for (var f = 0; f < ge.maxMorphTargets; f++)p["morphTarget" + f] >= 0 && e.numSupportedMorphTargets++
                } if (e.morphNormals) for (e.numSupportedMorphNormals = 0, f = 0; f < ge.maxMorphNormals; f++)p["morphNormal" + f] >= 0 && e.numSupportedMorphNormals++; i.uniformsList = []; var d = i.program.getUniforms(); for (var E in i.__webglShader.uniforms) {
                    var m = d[E]; m && i.uniformsList.push([i.__webglShader.uniforms[E], m])
                }
            } function y(e) {
                R(e), e.transparent === !0 ? ze.setBlending(e.blending, e.blendEquation, e.blendSrc, e.blendDst, e.blendEquationAlpha, e.blendSrcAlpha, e.blendDstAlpha) : ze.setBlending(THREE.NoBlending), ze.setDepthFunc(e.depthFunc), ze.setDepthTest(e.depthTest), ze.setDepthWrite(e.depthWrite), ze.setColorWrite(e.colorWrite), ze.setPolygonOffset(e.polygonOffset, e.polygonOffsetFactor, e.polygonOffsetUnits)
            } function R(e) {
                e.side !== THREE.DoubleSide ? ze.enable(Ve.CULL_FACE) : ze.disable(Ve.CULL_FACE), ze.setFlipSided(e.side === THREE.BackSide)
            } function x(e, t, r, n, i) {
                He = 0; var o = je.get(n); (n.needsUpdate || !o.program) && (T(n, t, r, i), n.needsUpdate = !1); var a = !1, s = !1, h = !1, c = o.program, u = c.getUniforms(), l = o.__webglShader.uniforms; if (c.id !== ve && (Ve.useProgram(c.program), ve = c.id, a = !0, s = !0, h = !0), n.id !== ye && (-1 === ye && (h = !0), ye = n.id, s = !0), (a || e !== xe) && (Ve.uniformMatrix4fv(u.projectionMatrix, !1, e.projectionMatrix.elements), Ge.logarithmicDepthBuffer && Ve.uniform1f(u.logDepthBufFC, 2 / (Math.log(e.far + 1) / Math.LN2)), e !== xe && (xe = e), (n instanceof THREE.ShaderMaterial || n instanceof THREE.MeshPhongMaterial || n.envMap) && void 0 !== u.cameraPosition && (ke.setFromMatrixPosition(e.matrixWorld), Ve.uniform3f(u.cameraPosition, ke.x, ke.y, ke.z)), (n instanceof THREE.MeshPhongMaterial || n instanceof THREE.MeshLambertMaterial || n instanceof THREE.MeshBasicMaterial || n instanceof THREE.ShaderMaterial || n.skinning) && void 0 !== u.viewMatrix && Ve.uniformMatrix4fv(u.viewMatrix, !1, e.matrixWorldInverse.elements)), n.skinning) if (i.bindMatrix && void 0 !== u.bindMatrix && Ve.uniformMatrix4fv(u.bindMatrix, !1, i.bindMatrix.elements), i.bindMatrixInverse && void 0 !== u.bindMatrixInverse && Ve.uniformMatrix4fv(u.bindMatrixInverse, !1, i.bindMatrixInverse.elements), Ge.floatVertexTextures && i.skeleton && i.skeleton.useVertexTexture) {
                    if (void 0 !== u.boneTexture) {
                        var p = P(); Ve.uniform1i(u.boneTexture, p), ge.setTexture(i.skeleton.boneTexture, p)
                    } void 0 !== u.boneTextureWidth && Ve.uniform1i(u.boneTextureWidth, i.skeleton.boneTextureWidth), void 0 !== u.boneTextureHeight && Ve.uniform1i(u.boneTextureHeight, i.skeleton.boneTextureHeight)
                } else i.skeleton && i.skeleton.boneMatrices && void 0 !== u.boneGlobalMatrices && Ve.uniformMatrix4fv(u.boneGlobalMatrices, !1, i.skeleton.boneMatrices); return s && (r && n.fog && S(l, r), (n instanceof THREE.MeshPhongMaterial || n instanceof THREE.MeshLambertMaterial || n.lights) && (De && (h = !0, F(t, e), De = !1), h ? (C(l, Oe), A(l, !0)) : A(l, !1)), (n instanceof THREE.MeshBasicMaterial || n instanceof THREE.MeshLambertMaterial || n instanceof THREE.MeshPhongMaterial) && H(l, n), n instanceof THREE.LineBasicMaterial ? b(l, n) : n instanceof THREE.LineDashedMaterial ? (b(l, n), w(l, n)) : n instanceof THREE.PointsMaterial ? M(l, n) : n instanceof THREE.MeshPhongMaterial ? _(l, n) : n instanceof THREE.MeshDepthMaterial ? (l.mNear.value = e.near, l.mFar.value = e.far, l.opacity.value = n.opacity) : n instanceof THREE.MeshNormalMaterial && (l.opacity.value = n.opacity), i.receiveShadow && !n._shadowPass && L(l, t, e), D(o.uniformsList)), k(u, i), void 0 !== u.modelMatrix && Ve.uniformMatrix4fv(u.modelMatrix, !1, i.matrixWorld.elements), c
            } function H(e, t) {
                e.opacity.value = t.opacity, e.diffuse.value = t.color, t.emissive && (e.emissive.value = t.emissive), e.map.value = t.map, e.specularMap.value = t.specularMap, e.alphaMap.value = t.alphaMap, t.aoMap && (e.aoMap.value = t.aoMap, e.aoMapIntensity.value = t.aoMapIntensity); var r; if (t.map ? r = t.map : t.specularMap ? r = t.specularMap : t.displacementMap ? r = t.displacementMap : t.normalMap ? r = t.normalMap : t.bumpMap ? r = t.bumpMap : t.alphaMap ? r = t.alphaMap : t.emissiveMap && (r = t.emissiveMap), void 0 !== r) {
                    r instanceof THREE.WebGLRenderTarget && (r = r.texture); var n = r.offset, i = r.repeat; e.offsetRepeat.value.set(n.x, n.y, i.x, i.y)
                } e.envMap.value = t.envMap, e.flipEnvMap.value = t.envMap instanceof THREE.WebGLRenderTargetCube ? 1 : -1, e.reflectivity.value = t.reflectivity, e.refractionRatio.value = t.refractionRatio
            } function b(e, t) {
                e.diffuse.value = t.color, e.opacity.value = t.opacity
            } function w(e, t) {
                e.dashSize.value = t.dashSize, e.totalSize.value = t.dashSize + t.gapSize, e.scale.value = t.scale
            } function M(e, t) {
                if (e.psColor.value = t.color, e.opacity.value = t.opacity, e.size.value = t.size, e.scale.value = $.height / 2, e.map.value = t.map, null !== t.map) {
                    var r = t.map.offset, n = t.map.repeat; e.offsetRepeat.value.set(r.x, r.y, n.x, n.y)
                }
            } function S(e, t) {
                e.fogColor.value = t.color, t instanceof THREE.Fog ? (e.fogNear.value = t.near, e.fogFar.value = t.far) : t instanceof THREE.FogExp2 && (e.fogDensity.value = t.density)
            } function _(e, t) {
                e.specular.value = t.specular, e.shininess.value = Math.max(t.shininess, 1e-4), t.lightMap && (e.lightMap.value = t.lightMap, e.lightMapIntensity.value = t.lightMapIntensity), t.emissiveMap && (e.emissiveMap.value = t.emissiveMap), t.bumpMap && (e.bumpMap.value = t.bumpMap, e.bumpScale.value = t.bumpScale), t.normalMap && (e.normalMap.value = t.normalMap, e.normalScale.value.copy(t.normalScale)), t.displacementMap && (e.displacementMap.value = t.displacementMap, e.displacementScale.value = t.displacementScale, e.displacementBias.value = t.displacementBias)
            } function C(e, t) {
                e.ambientLightColor.value = t.ambient, e.directionalLightColor.value = t.directional.colors, e.directionalLightDirection.value = t.directional.positions, e.pointLightColor.value = t.point.colors, e.pointLightPosition.value = t.point.positions, e.pointLightDistance.value = t.point.distances, e.pointLightDecay.value = t.point.decays, e.spotLightColor.value = t.spot.colors, e.spotLightPosition.value = t.spot.positions, e.spotLightDistance.value = t.spot.distances, e.spotLightDirection.value = t.spot.directions, e.spotLightAngleCos.value = t.spot.anglesCos, e.spotLightExponent.value = t.spot.exponents, e.spotLightDecay.value = t.spot.decays, e.hemisphereLightSkyColor.value = t.hemi.skyColors, e.hemisphereLightGroundColor.value = t.hemi.groundColors, e.hemisphereLightDirection.value = t.hemi.positions
            } function A(e, t) {
                e.ambientLightColor.needsUpdate = t, e.directionalLightColor.needsUpdate = t, e.directionalLightDirection.needsUpdate = t, e.pointLightColor.needsUpdate = t, e.pointLightPosition.needsUpdate = t, e.pointLightDistance.needsUpdate = t, e.pointLightDecay.needsUpdate = t, e.spotLightColor.needsUpdate = t, e.spotLightPosition.needsUpdate = t, e.spotLightDistance.needsUpdate = t, e.spotLightDirection.needsUpdate = t, e.spotLightAngleCos.needsUpdate = t, e.spotLightExponent.needsUpdate = t, e.spotLightDecay.needsUpdate = t, e.hemisphereLightSkyColor.needsUpdate = t, e.hemisphereLightGroundColor.needsUpdate = t, e.hemisphereLightDirection.needsUpdate = t
            } function L(e, t, r) {
                if (e.shadowMatrix) for (var n = 0, i = 0, o = t.length; o > i; i++) {
                    var a = t[i]; if (a.castShadow === !0 && (a instanceof THREE.PointLight || a instanceof THREE.SpotLight || a instanceof THREE.DirectionalLight)) {
                        var s = a.shadow; a instanceof THREE.PointLight ? (ke.setFromMatrixPosition(a.matrixWorld).negate(), s.matrix.identity().setPosition(ke), e.shadowDarkness.value[n] = -s.darkness) : e.shadowDarkness.value[n] = s.darkness, e.shadowMatrix.value[n] = s.matrix, e.shadowMap.value[n] = s.map, e.shadowMapSize.value[n] = s.mapSize, e.shadowBias.value[n] = s.bias, n++
                    }
                }
            } function k(e, t) {
                Ve.uniformMatrix4fv(e.modelViewMatrix, !1, t.modelViewMatrix.elements), e.normalMatrix && Ve.uniformMatrix3fv(e.normalMatrix, !1, t.normalMatrix.elements)
            } function P() {
                var e = He; return e >= Ge.maxTextures && console.warn("WebGLRenderer: trying to use " + e + " texture units while this GPU supports only " + Ge.maxTextures), He += 1, e
            } function D(e) {
                for (var t, r, n = 0, i = e.length; i > n; n++) {
                    var o = e[n][0]; if (o.needsUpdate !== !1) {
                        var a = o.type, s = o.value, h = e[n][1]; switch (a) {
                            case "1i": Ve.uniform1i(h, s); break; case "1f": Ve.uniform1f(h, s); break; case "2f": Ve.uniform2f(h, s[0], s[1]); break; case "3f": Ve.uniform3f(h, s[0], s[1], s[2]); break; case "4f": Ve.uniform4f(h, s[0], s[1], s[2], s[3]); break; case "1iv": Ve.uniform1iv(h, s); break; case "3iv": Ve.uniform3iv(h, s); break; case "1fv": Ve.uniform1fv(h, s); break; case "2fv": Ve.uniform2fv(h, s); break; case "3fv": Ve.uniform3fv(h, s); break; case "4fv": Ve.uniform4fv(h, s); break; case "Matrix3fv": Ve.uniformMatrix3fv(h, !1, s); break; case "Matrix4fv": Ve.uniformMatrix4fv(h, !1, s); break; case "i": Ve.uniform1i(h, s); break; case "f": Ve.uniform1f(h, s); break; case "v2": Ve.uniform2f(h, s.x, s.y); break; case "v3": Ve.uniform3f(h, s.x, s.y, s.z); break; case "v4": Ve.uniform4f(h, s.x, s.y, s.z, s.w); break; case "c": Ve.uniform3f(h, s.r, s.g, s.b); break; case "iv1": Ve.uniform1iv(h, s); break; case "iv": Ve.uniform3iv(h, s); break; case "fv1": Ve.uniform1fv(h, s); break; case "fv": Ve.uniform3fv(h, s); break; case "v2v": void 0 === o._array && (o._array = new Float32Array(2 * s.length)); for (var c = 0, u = 0, l = s.length; l > c; c++, u += 2)o._array[u + 0] = s[c].x, o._array[u + 1] = s[c].y; Ve.uniform2fv(h, o._array); break; case "v3v": void 0 === o._array && (o._array = new Float32Array(3 * s.length)); for (var c = 0, p = 0, l = s.length; l > c; c++, p += 3)o._array[p + 0] = s[c].x, o._array[p + 1] = s[c].y, o._array[p + 2] = s[c].z; Ve.uniform3fv(h, o._array); break; case "v4v": void 0 === o._array && (o._array = new Float32Array(4 * s.length)); for (var c = 0, f = 0, l = s.length; l > c; c++, f += 4)o._array[f + 0] = s[c].x, o._array[f + 1] = s[c].y, o._array[f + 2] = s[c].z, o._array[f + 3] = s[c].w; Ve.uniform4fv(h, o._array); break; case "m3": Ve.uniformMatrix3fv(h, !1, s.elements); break; case "m3v": void 0 === o._array && (o._array = new Float32Array(9 * s.length)); for (var c = 0, l = s.length; l > c; c++)s[c].flattenToArrayOffset(o._array, 9 * c); Ve.uniformMatrix3fv(h, !1, o._array); break; case "m4": Ve.uniformMatrix4fv(h, !1, s.elements); break; case "m4v": void 0 === o._array && (o._array = new Float32Array(16 * s.length)); for (var c = 0, l = s.length; l > c; c++)s[c].flattenToArrayOffset(o._array, 16 * c); Ve.uniformMatrix4fv(h, !1, o._array); break; case "t": if (t = s, r = P(), Ve.uniform1i(h, r), !t) continue; t instanceof THREE.CubeTexture || Array.isArray(t.image) && 6 === t.image.length ? z(t, r) : t instanceof THREE.WebGLRenderTargetCube ? j(t.texture, r) : t instanceof THREE.WebGLRenderTarget ? ge.setTexture(t.texture, r) : ge.setTexture(t, r); break; case "tv": void 0 === o._array && (o._array = []); for (var c = 0, l = o.value.length; l > c; c++)o._array[c] = P(); Ve.uniform1iv(h, o._array); for (var c = 0, l = o.value.length; l > c; c++)t = o.value[c], r = o._array[c], t && (t instanceof THREE.CubeTexture || t.image instanceof Array && 6 === t.image.length ? z(t, r) : t instanceof THREE.WebGLRenderTarget ? ge.setTexture(t.texture, r) : t instanceof THREE.WebGLRenderTargetCube ? j(t.texture, r) : ge.setTexture(t, r)); break; default: console.warn("THREE.WebGLRenderer: Unknown uniform type: " + a)
                        }
                    }
                }
            } function O(e, t, r, n) {
                e[t + 0] = r.r * n, e[t + 1] = r.g * n, e[t + 2] = r.b * n
            } function F(e, t) {
                var r, n, i, o, a, s, h, c, u = 0, l = 0, p = 0, f = Oe, d = t.matrixWorldInverse, E = f.directional.colors, m = f.directional.positions, g = f.point.colors, v = f.point.positions, T = f.point.distances, y = f.point.decays, R = f.spot.colors, x = f.spot.positions, H = f.spot.distances, b = f.spot.directions, w = f.spot.anglesCos, M = f.spot.exponents, S = f.spot.decays, _ = f.hemi.skyColors, C = f.hemi.groundColors, A = f.hemi.positions, L = 0, k = 0, P = 0, D = 0, F = 0, N = 0, V = 0, U = 0, B = 0, I = 0, G = 0, z = 0; for (r = 0, n = e.length; n > r; r++)if (i = e[r], o = i.color, h = i.intensity, c = i.distance, i instanceof THREE.AmbientLight) {
                    if (!i.visible) continue; u += o.r, l += o.g, p += o.b
                } else if (i instanceof THREE.DirectionalLight) {
                    if (F += 1, !i.visible) continue; Pe.setFromMatrixPosition(i.matrixWorld), ke.setFromMatrixPosition(i.target.matrixWorld), Pe.sub(ke), Pe.transformDirection(d), B = 3 * L, m[B + 0] = Pe.x, m[B + 1] = Pe.y, m[B + 2] = Pe.z, O(E, B, o, h), L += 1
                } else if (i instanceof THREE.PointLight) {
                    if (N += 1, !i.visible) continue; I = 3 * k, O(g, I, o, h), ke.setFromMatrixPosition(i.matrixWorld), ke.applyMatrix4(d), v[I + 0] = ke.x, v[I + 1] = ke.y, v[I + 2] = ke.z, T[k] = c, y[k] = 0 === i.distance ? 0 : i.decay, k += 1
                } else if (i instanceof THREE.SpotLight) {
                    if (V += 1, !i.visible) continue; G = 3 * P, O(R, G, o, h), Pe.setFromMatrixPosition(i.matrixWorld), ke.copy(Pe).applyMatrix4(d), x[G + 0] = ke.x, x[G + 1] = ke.y, x[G + 2] = ke.z, H[P] = c, ke.setFromMatrixPosition(i.target.matrixWorld), Pe.sub(ke), Pe.transformDirection(d), b[G + 0] = Pe.x, b[G + 1] = Pe.y, b[G + 2] = Pe.z, w[P] = Math.cos(i.angle), M[P] = i.exponent, S[P] = 0 === i.distance ? 0 : i.decay, P += 1
                } else if (i instanceof THREE.HemisphereLight) {
                    if (U += 1, !i.visible) continue; Pe.setFromMatrixPosition(i.matrixWorld), Pe.transformDirection(d), z = 3 * D, A[z + 0] = Pe.x, A[z + 1] = Pe.y, A[z + 2] = Pe.z, a = i.color, s = i.groundColor, O(_, z, a, h), O(C, z, s, h), D += 1
                } for (r = 3 * L, n = Math.max(E.length, 3 * F); n > r; r++)E[r] = 0; for (r = 3 * k, n = Math.max(g.length, 3 * N); n > r; r++)g[r] = 0; for (r = 3 * P, n = Math.max(R.length, 3 * V); n > r; r++)R[r] = 0; for (r = 3 * D, n = Math.max(_.length, 3 * U); n > r; r++)_[r] = 0; for (r = 3 * D, n = Math.max(C.length, 3 * U); n > r; r++)C[r] = 0; f.directional.length = L, f.point.length = k, f.spot.length = P, f.hemi.length = D, f.ambient[0] = u, f.ambient[1] = l, f.ambient[2] = p
            } function N(e, t, r) {
                var n; if (r ? (Ve.texParameteri(e, Ve.TEXTURE_WRAP_S, K(t.wrapS)), Ve.texParameteri(e, Ve.TEXTURE_WRAP_T, K(t.wrapT)), Ve.texParameteri(e, Ve.TEXTURE_MAG_FILTER, K(t.magFilter)), Ve.texParameteri(e, Ve.TEXTURE_MIN_FILTER, K(t.minFilter))) : (Ve.texParameteri(e, Ve.TEXTURE_WRAP_S, Ve.CLAMP_TO_EDGE), Ve.texParameteri(e, Ve.TEXTURE_WRAP_T, Ve.CLAMP_TO_EDGE), (t.wrapS !== THREE.ClampToEdgeWrapping || t.wrapT !== THREE.ClampToEdgeWrapping) && console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping.", t), Ve.texParameteri(e, Ve.TEXTURE_MAG_FILTER, Y(t.magFilter)), Ve.texParameteri(e, Ve.TEXTURE_MIN_FILTER, Y(t.minFilter)), t.minFilter !== THREE.NearestFilter && t.minFilter !== THREE.LinearFilter && console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.", t)), n = Ie.get("EXT_texture_filter_anisotropic")) {
                    if (t.type === THREE.FloatType && null === Ie.get("OES_texture_float_linear")) return; if (t.type === THREE.HalfFloatType && null === Ie.get("OES_texture_half_float_linear")) return; (t.anisotropy > 1 || je.get(t).__currentAnisotropy) && (Ve.texParameterf(e, n.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(t.anisotropy, ge.getMaxAnisotropy())), je.get(t).__currentAnisotropy = t.anisotropy)
                }
            } function V(e, t, r) {
                void 0 === e.__webglInit && (e.__webglInit = !0, t.addEventListener("dispose", o), e.__webglTexture = Ve.createTexture(), Fe.textures++), ze.activeTexture(Ve.TEXTURE0 + r), ze.bindTexture(Ve.TEXTURE_2D, e.__webglTexture), Ve.pixelStorei(Ve.UNPACK_FLIP_Y_WEBGL, t.flipY), Ve.pixelStorei(Ve.UNPACK_PREMULTIPLY_ALPHA_WEBGL, t.premultiplyAlpha), Ve.pixelStorei(Ve.UNPACK_ALIGNMENT, t.unpackAlignment), t.image = U(t.image, Ge.maxTextureSize), I(t) && B(t.image) === !1 && (t.image = G(t.image)); var n = t.image, i = B(n), a = K(t.format), s = K(t.type); N(Ve.TEXTURE_2D, t, i); var h, c = t.mipmaps; if (t instanceof THREE.DataTexture) if (c.length > 0 && i) {
                    for (var u = 0, l = c.length; l > u; u++)h = c[u], ze.texImage2D(Ve.TEXTURE_2D, u, a, h.width, h.height, 0, a, s, h.data); t.generateMipmaps = !1
                } else ze.texImage2D(Ve.TEXTURE_2D, 0, a, n.width, n.height, 0, a, s, n.data); else if (t instanceof THREE.CompressedTexture) for (var u = 0, l = c.length; l > u; u++)h = c[u], t.format !== THREE.RGBAFormat && t.format !== THREE.RGBFormat ? ze.getCompressedTextureFormats().indexOf(a) > -1 ? ze.compressedTexImage2D(Ve.TEXTURE_2D, u, a, h.width, h.height, 0, h.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : ze.texImage2D(Ve.TEXTURE_2D, u, a, h.width, h.height, 0, a, s, h.data); else if (c.length > 0 && i) {
                    for (var u = 0, l = c.length; l > u; u++)h = c[u], ze.texImage2D(Ve.TEXTURE_2D, u, a, a, s, h); t.generateMipmaps = !1
                } else ze.texImage2D(Ve.TEXTURE_2D, 0, a, a, s, t.image); t.generateMipmaps && i && Ve.generateMipmap(Ve.TEXTURE_2D), e.__version = t.version, t.onUpdate && t.onUpdate(t)
            } function U(e, t) {
                if (e.width > t || e.height > t) {
                    var r = t / Math.max(e.width, e.height), n = document.createElement("canvas"); n.width = Math.floor(e.width * r), n.height = Math.floor(e.height * r); var i = n.getContext("2d"); return i.drawImage(e, 0, 0, e.width, e.height, 0, 0, n.width, n.height), console.warn("THREE.WebGLRenderer: image is too big (" + e.width + "x" + e.height + "). Resized to " + n.width + "x" + n.height, e), n
                } return e
            } function B(e) {
                return THREE.Math.isPowerOfTwo(e.width) && THREE.Math.isPowerOfTwo(e.height)
            } function I(e) {
                return e.wrapS !== THREE.ClampToEdgeWrapping || e.wrapT !== THREE.ClampToEdgeWrapping ? !0 : e.minFilter !== THREE.NearestFilter && e.minFilter !== THREE.LinearFilter ? !0 : !1
            } function G(e) {
                if (e instanceof HTMLImageElement || e instanceof HTMLCanvasElement) {
                    var t = document.createElement("canvas"); t.width = THREE.Math.nearestPowerOfTwo(e.width), t.height = THREE.Math.nearestPowerOfTwo(e.height); var r = t.getContext("2d"); return r.drawImage(e, 0, 0, t.width, t.height), console.warn("THREE.WebGLRenderer: image is not power of two (" + e.width + "x" + e.height + "). Resized to " + t.width + "x" + t.height, e), t
                } return e
            } function z(e, t) {
                var r = je.get(e); if (6 === e.image.length) if (e.version > 0 && r.__version !== e.version) {
                    r.__image__webglTextureCube || (e.addEventListener("dispose", o), r.__image__webglTextureCube = Ve.createTexture(), Fe.textures++), ze.activeTexture(Ve.TEXTURE0 + t), ze.bindTexture(Ve.TEXTURE_CUBE_MAP, r.__image__webglTextureCube), Ve.pixelStorei(Ve.UNPACK_FLIP_Y_WEBGL, e.flipY); for (var n = e instanceof THREE.CompressedTexture, i = e.image[0] instanceof THREE.DataTexture, a = [], s = 0; 6 > s; s++)!ge.autoScaleCubemaps || n || i ? a[s] = i ? e.image[s].image : e.image[s] : a[s] = U(e.image[s], Ge.maxCubemapSize); var h = a[0], c = B(h), u = K(e.format), l = K(e.type); N(Ve.TEXTURE_CUBE_MAP, e, c); for (var s = 0; 6 > s; s++)if (n) for (var p, f = a[s].mipmaps, d = 0, E = f.length; E > d; d++)p = f[d], e.format !== THREE.RGBAFormat && e.format !== THREE.RGBFormat ? ze.getCompressedTextureFormats().indexOf(u) > -1 ? ze.compressedTexImage2D(Ve.TEXTURE_CUBE_MAP_POSITIVE_X + s, d, u, p.width, p.height, 0, p.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setCubeTexture()") : ze.texImage2D(Ve.TEXTURE_CUBE_MAP_POSITIVE_X + s, d, u, p.width, p.height, 0, u, l, p.data); else i ? ze.texImage2D(Ve.TEXTURE_CUBE_MAP_POSITIVE_X + s, 0, u, a[s].width, a[s].height, 0, u, l, a[s].data) : ze.texImage2D(Ve.TEXTURE_CUBE_MAP_POSITIVE_X + s, 0, u, u, l, a[s]); e.generateMipmaps && c && Ve.generateMipmap(Ve.TEXTURE_CUBE_MAP), r.__version = e.version, e.onUpdate && e.onUpdate(e)
                } else ze.activeTexture(Ve.TEXTURE0 + t), ze.bindTexture(Ve.TEXTURE_CUBE_MAP, r.__image__webglTextureCube)
            } function j(e, t) {
                ze.activeTexture(Ve.TEXTURE0 + t), ze.bindTexture(Ve.TEXTURE_CUBE_MAP, je.get(e).__webglTexture)
            } function W(e, t, r) {
                Ve.bindFramebuffer(Ve.FRAMEBUFFER, e), Ve.framebufferTexture2D(Ve.FRAMEBUFFER, Ve.COLOR_ATTACHMENT0, r, je.get(t.texture).__webglTexture, 0)
            } function X(e, t) {
                Ve.bindRenderbuffer(Ve.RENDERBUFFER, e), t.depthBuffer && !t.stencilBuffer ? (Ve.renderbufferStorage(Ve.RENDERBUFFER, Ve.DEPTH_COMPONENT16, t.width, t.height), Ve.framebufferRenderbuffer(Ve.FRAMEBUFFER, Ve.DEPTH_ATTACHMENT, Ve.RENDERBUFFER, e)) : t.depthBuffer && t.stencilBuffer ? (Ve.renderbufferStorage(Ve.RENDERBUFFER, Ve.DEPTH_STENCIL, t.width, t.height), Ve.framebufferRenderbuffer(Ve.FRAMEBUFFER, Ve.DEPTH_STENCIL_ATTACHMENT, Ve.RENDERBUFFER, e)) : Ve.renderbufferStorage(Ve.RENDERBUFFER, Ve.RGBA4, t.width, t.height)
            } function q(e) {
                var t = e instanceof THREE.WebGLRenderTargetCube ? Ve.TEXTURE_CUBE_MAP : Ve.TEXTURE_2D, r = je.get(e.texture).__webglTexture; ze.bindTexture(t, r), Ve.generateMipmap(t), ze.bindTexture(t, null)
            } function Y(e) {
                return e === THREE.NearestFilter || e === THREE.NearestMipMapNearestFilter || e === THREE.NearestMipMapLinearFilter ? Ve.NEAREST : Ve.LINEAR
            } function K(e) {
                var t; if (e === THREE.RepeatWrapping) return Ve.REPEAT; if (e === THREE.ClampToEdgeWrapping) return Ve.CLAMP_TO_EDGE; if (e === THREE.MirroredRepeatWrapping) return Ve.MIRRORED_REPEAT; if (e === THREE.NearestFilter) return Ve.NEAREST; if (e === THREE.NearestMipMapNearestFilter) return Ve.NEAREST_MIPMAP_NEAREST; if (e === THREE.NearestMipMapLinearFilter) return Ve.NEAREST_MIPMAP_LINEAR; if (e === THREE.LinearFilter) return Ve.LINEAR; if (e === THREE.LinearMipMapNearestFilter) return Ve.LINEAR_MIPMAP_NEAREST; if (e === THREE.LinearMipMapLinearFilter) return Ve.LINEAR_MIPMAP_LINEAR; if (e === THREE.UnsignedByteType) return Ve.UNSIGNED_BYTE; if (e === THREE.UnsignedShort4444Type) return Ve.UNSIGNED_SHORT_4_4_4_4; if (e === THREE.UnsignedShort5551Type) return Ve.UNSIGNED_SHORT_5_5_5_1; if (e === THREE.UnsignedShort565Type) return Ve.UNSIGNED_SHORT_5_6_5; if (e === THREE.ByteType) return Ve.BYTE; if (e === THREE.ShortType) return Ve.SHORT; if (e === THREE.UnsignedShortType) return Ve.UNSIGNED_SHORT; if (e === THREE.IntType) return Ve.INT; if (e === THREE.UnsignedIntType) return Ve.UNSIGNED_INT; if (e === THREE.FloatType) return Ve.FLOAT; if (t = Ie.get("OES_texture_half_float"), null !== t && e === THREE.HalfFloatType) return t.HALF_FLOAT_OES; if (e === THREE.AlphaFormat) return Ve.ALPHA; if (e === THREE.RGBFormat) return Ve.RGB; if (e === THREE.RGBAFormat) return Ve.RGBA; if (e === THREE.LuminanceFormat) return Ve.LUMINANCE; if (e === THREE.LuminanceAlphaFormat) return Ve.LUMINANCE_ALPHA; if (e === THREE.AddEquation) return Ve.FUNC_ADD; if (e === THREE.SubtractEquation) return Ve.FUNC_SUBTRACT; if (e === THREE.ReverseSubtractEquation) return Ve.FUNC_REVERSE_SUBTRACT; if (e === THREE.ZeroFactor) return Ve.ZERO; if (e === THREE.OneFactor) return Ve.ONE; if (e === THREE.SrcColorFactor) return Ve.SRC_COLOR; if (e === THREE.OneMinusSrcColorFactor) return Ve.ONE_MINUS_SRC_COLOR; if (e === THREE.SrcAlphaFactor) return Ve.SRC_ALPHA; if (e === THREE.OneMinusSrcAlphaFactor) return Ve.ONE_MINUS_SRC_ALPHA; if (e === THREE.DstAlphaFactor) return Ve.DST_ALPHA; if (e === THREE.OneMinusDstAlphaFactor) return Ve.ONE_MINUS_DST_ALPHA; if (e === THREE.DstColorFactor) return Ve.DST_COLOR; if (e === THREE.OneMinusDstColorFactor) return Ve.ONE_MINUS_DST_COLOR; if (e === THREE.SrcAlphaSaturateFactor) return Ve.SRC_ALPHA_SATURATE; if (t = Ie.get("WEBGL_compressed_texture_s3tc"), null !== t) {
                    if (e === THREE.RGB_S3TC_DXT1_Format) return t.COMPRESSED_RGB_S3TC_DXT1_EXT; if (e === THREE.RGBA_S3TC_DXT1_Format) return t.COMPRESSED_RGBA_S3TC_DXT1_EXT; if (e === THREE.RGBA_S3TC_DXT3_Format) return t.COMPRESSED_RGBA_S3TC_DXT3_EXT; if (e === THREE.RGBA_S3TC_DXT5_Format) return t.COMPRESSED_RGBA_S3TC_DXT5_EXT
                } if (t = Ie.get("WEBGL_compressed_texture_pvrtc"), null !== t) {
                    if (e === THREE.RGB_PVRTC_4BPPV1_Format) return t.COMPRESSED_RGB_PVRTC_4BPPV1_IMG; if (e === THREE.RGB_PVRTC_2BPPV1_Format) return t.COMPRESSED_RGB_PVRTC_2BPPV1_IMG; if (e === THREE.RGBA_PVRTC_4BPPV1_Format) return t.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG; if (e === THREE.RGBA_PVRTC_2BPPV1_Format) return t.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG
                } if (t = Ie.get("EXT_blend_minmax"), null !== t) {
                    if (e === THREE.MinEquation) return t.MIN_EXT; if (e === THREE.MaxEquation) return t.MAX_EXT
                } return 0
            } console.log("THREE.WebGLRenderer", THREE.REVISION), e = e || {}; var $ = void 0 !== e.canvas ? e.canvas : document.createElement("canvas"), Z = void 0 !== e.context ? e.context : null, Q = $.width, J = $.height, ee = 1, te = void 0 !== e.alpha ? e.alpha : !1, re = void 0 !== e.depth ? e.depth : !0, ne = void 0 !== e.stencil ? e.stencil : !0, ie = void 0 !== e.antialias ? e.antialias : !1, oe = void 0 !== e.premultipliedAlpha ? e.premultipliedAlpha : !0, ae = void 0 !== e.preserveDrawingBuffer ? e.preserveDrawingBuffer : !1, se = new THREE.Color(0), he = 0, ce = [], ue = [], le = -1, pe = [], fe = -1, de = new Float32Array(8), Ee = [], me = []; this.domElement = $, this.context = null, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.gammaFactor = 2, this.gammaInput = !1, this.gammaOutput = !1, this.maxMorphTargets = 8, this.maxMorphNormals = 4, this.autoScaleCubemaps = !0; var ge = this, ve = null, Te = null, ye = -1, Re = "", xe = null, He = 0, be = 0, we = 0, Me = $.width, Se = $.height, _e = 0, Ce = 0, Ae = new THREE.Frustum, Le = new THREE.Matrix4, ke = new THREE.Vector3, Pe = new THREE.Vector3, De = !0, Oe = {
                ambient: [0, 0, 0], directional: {
                    length: 0, colors: [], positions: []
                }, point: {
                    length: 0, colors: [], positions: [], distances: [], decays: []
                }, spot: {
                    length: 0, colors: [], positions: [], distances: [], directions: [], anglesCos: [], exponents: [], decays: []
                }, hemi: {
                    length: 0, skyColors: [], groundColors: [], positions: []
                }
            }, Fe = {
                geometries: 0, textures: 0
            }, Ne = {
                calls: 0, vertices: 0, faces: 0, points: 0
            }; this.info = {
                render: Ne, memory: Fe, programs: null
            }; var Ve; try {
                var Ue = {
                    alpha: te, depth: re, stencil: ne, antialias: ie, premultipliedAlpha: oe, preserveDrawingBuffer: ae
                }; if (Ve = Z || $.getContext("webgl", Ue) || $.getContext("experimental-webgl", Ue), null === Ve) throw null !== $.getContext("webgl") ? "Error creating WebGL context with your selected attributes." : "Error creating WebGL context."; $.addEventListener("webglcontextlost", i, !1)
            } catch (Be) {
                console.error("THREE.WebGLRenderer: " + Be)
            } var Ie = new THREE.WebGLExtensions(Ve); Ie.get("OES_texture_float"), Ie.get("OES_texture_float_linear"), Ie.get("OES_texture_half_float"), Ie.get("OES_texture_half_float_linear"), Ie.get("OES_standard_derivatives"), Ie.get("ANGLE_instanced_arrays"), Ie.get("OES_element_index_uint") && (THREE.BufferGeometry.MaxIndex = 4294967296); var Ge = new THREE.WebGLCapabilities(Ve, Ie, e), ze = new THREE.WebGLState(Ve, Ie, K), je = new THREE.WebGLProperties, We = new THREE.WebGLObjects(Ve, je, this.info), Xe = new THREE.WebGLPrograms(this, Ge); this.info.programs = Xe.programs; var qe = new THREE.WebGLBufferRenderer(Ve, Ie, Ne), Ye = new THREE.WebGLIndexedBufferRenderer(Ve, Ie, Ne); r(), this.context = Ve, this.capabilities = Ge, this.extensions = Ie, this.state = ze; var Ke = new THREE.WebGLShadowMap(this, ce, We); this.shadowMap = Ke; var $e = new THREE.SpritePlugin(this, Ee), Ze = new THREE.LensFlarePlugin(this, me); this.getContext = function () {
                return Ve
            }, this.getContextAttributes = function () {
                return Ve.getContextAttributes()
            }, this.forceContextLoss = function () {
                Ie.get("WEBGL_lose_context").loseContext()
            }, this.getMaxAnisotropy = function () {
                var e; return function () {
                    if (void 0 !== e) return e; var t = Ie.get("EXT_texture_filter_anisotropic"); return e = null !== t ? Ve.getParameter(t.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0
                }
            }(), this.getPrecision = function () {
                return Ge.precision
            }, this.getPixelRatio = function () {
                return ee
            }, this.setPixelRatio = function (e) {
                void 0 !== e && (ee = e)
            }, this.getSize = function () {
                return {
                    width: Q, height: J
                }
            }, this.setSize = function (e, t, r) {
                Q = e, J = t, $.width = e * ee, $.height = t * ee, r !== !1 && ($.style.width = e + "px", $.style.height = t + "px"), this.setViewport(0, 0, e, t)
            }, this.setViewport = function (e, t, r, n) {
                be = e * ee, we = t * ee, Me = r * ee, Se = n * ee, Ve.viewport(be, we, Me, Se)
            }, this.getViewport = function (e) {
                e.x = be / ee, e.y = we / ee, e.z = Me / ee, e.w = Se / ee
            }, this.setScissor = function (e, t, r, n) {
                Ve.scissor(e * ee, t * ee, r * ee, n * ee)
            }, this.enableScissorTest = function (e) {
                ze.setScissorTest(e)
            }, this.getClearColor = function () {
                return se
            }, this.setClearColor = function (e, r) {
                se.set(e), he = void 0 !== r ? r : 1, t(se.r, se.g, se.b, he)
            }, this.getClearAlpha = function () {
                return he
            }, this.setClearAlpha = function (e) {
                he = e, t(se.r, se.g, se.b, he)
            }, this.clear = function (e, t, r) {
                var n = 0; (void 0 === e || e) && (n |= Ve.COLOR_BUFFER_BIT), (void 0 === t || t) && (n |= Ve.DEPTH_BUFFER_BIT), (void 0 === r || r) && (n |= Ve.STENCIL_BUFFER_BIT), Ve.clear(n)
            }, this.clearColor = function () {
                Ve.clear(Ve.COLOR_BUFFER_BIT)
            }, this.clearDepth = function () {
                Ve.clear(Ve.DEPTH_BUFFER_BIT)
            }, this.clearStencil = function () {
                Ve.clear(Ve.STENCIL_BUFFER_BIT)
            }, this.clearTarget = function (e, t, r, n) {
                this.setRenderTarget(e), this.clear(t, r, n)
            }, this.resetGLState = n, this.dispose = function () {
                $.removeEventListener("webglcontextlost", i, !1)
            }, this.renderBufferImmediate = function (e, t, r) {
                ze.initAttributes(); var n = je.get(e); e.hasPositions && !n.position && (n.position = Ve.createBuffer()), e.hasNormals && !n.normal && (n.normal = Ve.createBuffer()), e.hasUvs && !n.uv && (n.uv = Ve.createBuffer()), e.hasColors && !n.color && (n.color = Ve.createBuffer()); var i = t.getAttributes(); if (e.hasPositions && (Ve.bindBuffer(Ve.ARRAY_BUFFER, n.position), Ve.bufferData(Ve.ARRAY_BUFFER, e.positionArray, Ve.DYNAMIC_DRAW), ze.enableAttribute(i.position), Ve.vertexAttribPointer(i.position, 3, Ve.FLOAT, !1, 0, 0)), e.hasNormals) {
                    if (Ve.bindBuffer(Ve.ARRAY_BUFFER, n.normal), "MeshPhongMaterial" !== r.type && r.shading === THREE.FlatShading) for (var o = 0, a = 3 * e.count; a > o; o += 9) {
                        var s = e.normalArray, h = (s[o + 0] + s[o + 3] + s[o + 6]) / 3, c = (s[o + 1] + s[o + 4] + s[o + 7]) / 3, u = (s[o + 2] + s[o + 5] + s[o + 8]) / 3; s[o + 0] = h, s[o + 1] = c, s[o + 2] = u, s[o + 3] = h, s[o + 4] = c, s[o + 5] = u, s[o + 6] = h, s[o + 7] = c, s[o + 8] = u
                    } Ve.bufferData(Ve.ARRAY_BUFFER, e.normalArray, Ve.DYNAMIC_DRAW), ze.enableAttribute(i.normal), Ve.vertexAttribPointer(i.normal, 3, Ve.FLOAT, !1, 0, 0)
                } e.hasUvs && r.map && (Ve.bindBuffer(Ve.ARRAY_BUFFER, n.uv), Ve.bufferData(Ve.ARRAY_BUFFER, e.uvArray, Ve.DYNAMIC_DRAW), ze.enableAttribute(i.uv), Ve.vertexAttribPointer(i.uv, 2, Ve.FLOAT, !1, 0, 0)), e.hasColors && r.vertexColors !== THREE.NoColors && (Ve.bindBuffer(Ve.ARRAY_BUFFER, n.color), Ve.bufferData(Ve.ARRAY_BUFFER, e.colorArray, Ve.DYNAMIC_DRAW), ze.enableAttribute(i.color), Ve.vertexAttribPointer(i.color, 3, Ve.FLOAT, !1, 0, 0)), ze.disableUnusedAttributes(), Ve.drawArrays(Ve.TRIANGLES, 0, e.count), e.count = 0
            }, this.renderBufferDirect = function (e, t, r, n, i, o, a) {
                y(i); var s = x(e, t, r, i, o), h = !1, c = n.id + "_" + s.id + "_" + i.wireframe; c !== Re && (Re = c, h = !0); var u = o.morphTargetInfluences; if (void 0 !== u) {
                    for (var l = [], d = 0, E = u.length; E > d; d++) {
                        var m = u[d]; l.push([m, d])
                    } l.sort(f), l.length > 8 && (l.length = 8); for (var g = n.morphAttributes, d = 0, E = l.length; E > d; d++) {
                        var m = l[d]; if (de[d] = m[0], 0 !== m[0]) {
                            var v = m[1]; i.morphTargets === !0 && g.position && n.addAttribute("morphTarget" + d, g.position[v]), i.morphNormals === !0 && g.normal && n.addAttribute("morphNormal" + d, g.normal[v])
                        } else i.morphTargets === !0 && n.removeAttribute("morphTarget" + d), i.morphNormals === !0 && n.removeAttribute("morphNormal" + d)
                    } var T = s.getUniforms(); null !== T.morphTargetInfluences && Ve.uniform1fv(T.morphTargetInfluences, de), h = !0
                } var v = n.index, R = n.attributes.position; i.wireframe === !0 && (v = We.getWireframeAttribute(n)); var H; null !== v ? (H = Ye, H.setIndex(v)) : H = qe, h && (p(i, s, n), null !== v && Ve.bindBuffer(Ve.ELEMENT_ARRAY_BUFFER, We.getAttributeBuffer(v))); var b = 0, w = 1 / 0; null !== v ? w = v.count : void 0 !== R && (w = R.count); var M = n.drawRange.start, S = n.drawRange.count, _ = null !== a ? a.start : 0, C = null !== a ? a.count : 1 / 0, A = Math.max(b, M, _), L = Math.min(b + w, M + S, _ + C) - 1, k = Math.max(0, L - A + 1); if (o instanceof THREE.Mesh) i.wireframe === !0 ? (ze.setLineWidth(i.wireframeLinewidth * ee), H.setMode(Ve.LINES)) : H.setMode(Ve.TRIANGLES), n instanceof THREE.InstancedBufferGeometry && n.maxInstancedCount > 0 ? H.renderInstances(n) : H.render(A, k); else if (o instanceof THREE.Line) {
                    var P = i.linewidth; void 0 === P && (P = 1), ze.setLineWidth(P * ee), o instanceof THREE.LineSegments ? H.setMode(Ve.LINES) : H.setMode(Ve.LINE_STRIP), H.render(A, k)
                } else o instanceof THREE.Points && (H.setMode(Ve.POINTS), H.render(A, k))
            }, this.render = function (e, t, r, n) {
                if (t instanceof THREE.Camera == !1) return void console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera."); var i = e.fog; if (Re = "", ye = -1, xe = null, De = !0, e.autoUpdate === !0 && e.updateMatrixWorld(), null === t.parent && t.updateMatrixWorld(), t.matrixWorldInverse.getInverse(t.matrixWorld), Le.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), Ae.setFromMatrix(Le), ce.length = 0, le = -1, fe = -1, Ee.length = 0, me.length = 0, g(e, t), ue.length = le + 1, pe.length = fe + 1, ge.sortObjects === !0 && (ue.sort(d), pe.sort(E)), Ke.render(e), Ne.calls = 0, Ne.vertices = 0, Ne.faces = 0, Ne.points = 0, this.setRenderTarget(r), (this.autoClear || n) && this.clear(this.autoClearColor, this.autoClearDepth, this.autoClearStencil), e.overrideMaterial) {
                    var o = e.overrideMaterial; v(ue, t, ce, i, o), v(pe, t, ce, i, o)
                } else ze.setBlending(THREE.NoBlending), v(ue, t, ce, i), v(pe, t, ce, i); if ($e.render(e, t), Ze.render(e, t, _e, Ce), r) {
                    var a = r.texture, s = B(r); a.generateMipmaps && s && a.minFilter !== THREE.NearestFilter && a.minFilter !== THREE.LinearFilter && q(r)
                } ze.setDepthTest(!0), ze.setDepthWrite(!0), ze.setColorWrite(!0)
            }, this.setFaceCulling = function (e, t) {
                e === THREE.CullFaceNone ? ze.disable(Ve.CULL_FACE) : (t === THREE.FrontFaceDirectionCW ? Ve.frontFace(Ve.CW) : Ve.frontFace(Ve.CCW), e === THREE.CullFaceBack ? Ve.cullFace(Ve.BACK) : e === THREE.CullFaceFront ? Ve.cullFace(Ve.FRONT) : Ve.cullFace(Ve.FRONT_AND_BACK), ze.enable(Ve.CULL_FACE))
            }, this.setTexture = function (e, t) {
                var r = je.get(e); if (e.version > 0 && r.__version !== e.version) {
                    var n = e.image; return void 0 === n ? void console.warn("THREE.WebGLRenderer: Texture marked for update but image is undefined", e) : n.complete === !1 ? void console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete", e) : void V(r, e, t)
                } ze.activeTexture(Ve.TEXTURE0 + t), ze.bindTexture(Ve.TEXTURE_2D, r.__webglTexture)
            }, this.setRenderTarget = function (e) {
                var t = e instanceof THREE.WebGLRenderTargetCube; if (e && void 0 === je.get(e).__webglFramebuffer) {
                    var r = je.get(e), n = je.get(e.texture); void 0 === e.depthBuffer && (e.depthBuffer = !0), void 0 === e.stencilBuffer && (e.stencilBuffer = !0), e.addEventListener("dispose", a), n.__webglTexture = Ve.createTexture(), Fe.textures++; var i = B(e), o = K(e.texture.format), s = K(e.texture.type); if (t) {
                        r.__webglFramebuffer = [], r.__webglRenderbuffer = [], ze.bindTexture(Ve.TEXTURE_CUBE_MAP, n.__webglTexture), N(Ve.TEXTURE_CUBE_MAP, e.texture, i); for (var h = 0; 6 > h; h++)r.__webglFramebuffer[h] = Ve.createFramebuffer(), r.__webglRenderbuffer[h] = Ve.createRenderbuffer(), ze.texImage2D(Ve.TEXTURE_CUBE_MAP_POSITIVE_X + h, 0, o, e.width, e.height, 0, o, s, null), W(r.__webglFramebuffer[h], e, Ve.TEXTURE_CUBE_MAP_POSITIVE_X + h), X(r.__webglRenderbuffer[h], e); e.texture.generateMipmaps && i && Ve.generateMipmap(Ve.TEXTURE_CUBE_MAP)
                    } else r.__webglFramebuffer = Ve.createFramebuffer(), e.shareDepthFrom ? r.__webglRenderbuffer = e.shareDepthFrom.__webglRenderbuffer : r.__webglRenderbuffer = Ve.createRenderbuffer(), ze.bindTexture(Ve.TEXTURE_2D, n.__webglTexture), N(Ve.TEXTURE_2D, e.texture, i), ze.texImage2D(Ve.TEXTURE_2D, 0, o, e.width, e.height, 0, o, s, null), W(r.__webglFramebuffer, e, Ve.TEXTURE_2D), e.shareDepthFrom ? e.depthBuffer && !e.stencilBuffer ? Ve.framebufferRenderbuffer(Ve.FRAMEBUFFER, Ve.DEPTH_ATTACHMENT, Ve.RENDERBUFFER, r.__webglRenderbuffer) : e.depthBuffer && e.stencilBuffer && Ve.framebufferRenderbuffer(Ve.FRAMEBUFFER, Ve.DEPTH_STENCIL_ATTACHMENT, Ve.RENDERBUFFER, r.__webglRenderbuffer) : X(r.__webglRenderbuffer, e), e.texture.generateMipmaps && i && Ve.generateMipmap(Ve.TEXTURE_2D); t ? ze.bindTexture(Ve.TEXTURE_CUBE_MAP, null) : ze.bindTexture(Ve.TEXTURE_2D, null), Ve.bindRenderbuffer(Ve.RENDERBUFFER, null), Ve.bindFramebuffer(Ve.FRAMEBUFFER, null)
                } var c, u, l, p, f; if (e) {
                    var r = je.get(e); c = t ? r.__webglFramebuffer[e.activeCubeFace] : r.__webglFramebuffer, u = e.width, l = e.height, p = 0, f = 0
                } else c = null, u = Me, l = Se, p = be, f = we; if (c !== Te && (Ve.bindFramebuffer(Ve.FRAMEBUFFER, c), Ve.viewport(p, f, u, l), Te = c), t) {
                    var n = je.get(e.texture); Ve.framebufferTexture2D(Ve.FRAMEBUFFER, Ve.COLOR_ATTACHMENT0, Ve.TEXTURE_CUBE_MAP_POSITIVE_X + e.activeCubeFace, n.__webglTexture, 0)
                } _e = u, Ce = l
            }, this.readRenderTargetPixels = function (e, t, r, n, i, o) {
                if (e instanceof THREE.WebGLRenderTarget == !1) return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget."); var a = je.get(e).__webglFramebuffer; if (a) {
                    var s = !1; a !== Te && (Ve.bindFramebuffer(Ve.FRAMEBUFFER, a), s = !0); try {
                        var h = e.texture; if (h.format !== THREE.RGBAFormat && K(h.format) !== Ve.getParameter(Ve.IMPLEMENTATION_COLOR_READ_FORMAT)) return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format."); if (!(h.type === THREE.UnsignedByteType || K(h.type) === Ve.getParameter(Ve.IMPLEMENTATION_COLOR_READ_TYPE) || h.type === THREE.FloatType && Ie.get("WEBGL_color_buffer_float") || h.type === THREE.HalfFloatType && Ie.get("EXT_color_buffer_half_float"))) return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type."); Ve.checkFramebufferStatus(Ve.FRAMEBUFFER) === Ve.FRAMEBUFFER_COMPLETE ? Ve.readPixels(t, r, n, i, K(h.format), K(h.type), o) : console.error("THREE.WebGLRenderer.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not complete.")
                    } finally {
                        s && Ve.bindFramebuffer(Ve.FRAMEBUFFER, Te)
                    }
                }
            }, this.supportsFloatTextures = function () {
                return console.warn("THREE.WebGLRenderer: .supportsFloatTextures() is now .extensions.get( 'OES_texture_float' )."), Ie.get("OES_texture_float")
            }, this.supportsHalfFloatTextures = function () {
                return console.warn("THREE.WebGLRenderer: .supportsHalfFloatTextures() is now .extensions.get( 'OES_texture_half_float' )."), Ie.get("OES_texture_half_float")
            }, this.supportsStandardDerivatives = function () {
                return console.warn("THREE.WebGLRenderer: .supportsStandardDerivatives() is now .extensions.get( 'OES_standard_derivatives' )."), Ie.get("OES_standard_derivatives")
            }, this.supportsCompressedTextureS3TC = function () {
                return console.warn("THREE.WebGLRenderer: .supportsCompressedTextureS3TC() is now .extensions.get( 'WEBGL_compressed_texture_s3tc' )."), Ie.get("WEBGL_compressed_texture_s3tc")
            }, this.supportsCompressedTexturePVRTC = function () {
                return console.warn("THREE.WebGLRenderer: .supportsCompressedTexturePVRTC() is now .extensions.get( 'WEBGL_compressed_texture_pvrtc' )."), Ie.get("WEBGL_compressed_texture_pvrtc")
            }, this.supportsBlendMinMax = function () {
                return console.warn("THREE.WebGLRenderer: .supportsBlendMinMax() is now .extensions.get( 'EXT_blend_minmax' )."), Ie.get("EXT_blend_minmax")
            }, this.supportsVertexTextures = function () {
                return Ge.vertexTextures
            }, this.supportsInstancedArrays = function () {
                return console.warn("THREE.WebGLRenderer: .supportsInstancedArrays() is now .extensions.get( 'ANGLE_instanced_arrays' )."), Ie.get("ANGLE_instanced_arrays")
            }, this.initMaterial = function () {
                console.warn("THREE.WebGLRenderer: .initMaterial() has been removed.")
            }, this.addPrePlugin = function () {
                console.warn("THREE.WebGLRenderer: .addPrePlugin() has been removed.")
            }, this.addPostPlugin = function () {
                console.warn("THREE.WebGLRenderer: .addPostPlugin() has been removed.")
            }, this.updateShadowMap = function () {
                console.warn("THREE.WebGLRenderer: .updateShadowMap() has been removed.")
            }, Object.defineProperties(this, {
                shadowMapEnabled: {
                    get: function () {
                        return Ke.enabled
                    }, set: function (e) {
                        console.warn("THREE.WebGLRenderer: .shadowMapEnabled is now .shadowMap.enabled."), Ke.enabled = e
                    }
                }, shadowMapType: {
                    get: function () {
                        return Ke.type
                    }, set: function (e) {
                        console.warn("THREE.WebGLRenderer: .shadowMapType is now .shadowMap.type."), Ke.type = e
                    }
                }, shadowMapCullFace: {
                    get: function () {
                        return Ke.cullFace
                    }, set: function (e) {
                        console.warn("THREE.WebGLRenderer: .shadowMapCullFace is now .shadowMap.cullFace."), Ke.cullFace = e
                    }
                }, shadowMapDebug: {
                    get: function () {
                        return Ke.debug
                    }, set: function (e) {
                        console.warn("THREE.WebGLRenderer: .shadowMapDebug is now .shadowMap.debug."), Ke.debug = e
                    }
                }
            })
        }, THREE.WebGLRenderTarget = function (e, t, r) {
            this.uuid = THREE.Math.generateUUID(), this.width = e, this.height = t, r = r || {}, void 0 === r.minFilter && (r.minFilter = THREE.LinearFilter), this.texture = new THREE.Texture(void 0, void 0, r.wrapS, r.wrapT, r.magFilter, r.minFilter, r.format, r.type, r.anisotropy), this.depthBuffer = void 0 !== r.depthBuffer ? r.depthBuffer : !0, this.stencilBuffer = void 0 !== r.stencilBuffer ? r.stencilBuffer : !0, this.shareDepthFrom = void 0 !== r.shareDepthFrom ? r.shareDepthFrom : null
        }, THREE.WebGLRenderTarget.prototype = {
            constructor: THREE.WebGLRenderTarget, get wrapS() {
                return console.warn("THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS."), this.texture.wrapS
            }, set wrapS(e) {
                console.warn("THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS."), this.texture.wrapS = e
            }, get wrapT() {
                return console.warn("THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT."), this.texture.wrapT
            }, set wrapT(e) {
                console.warn("THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT."), this.texture.wrapT = e
            }, get magFilter() {
                return console.warn("THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter."), this.texture.magFilter
            }, set magFilter(e) {
                console.warn("THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter."), this.texture.magFilter = e
            }, get minFilter() {
                return console.warn("THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter."), this.texture.minFilter
            }, set minFilter(e) {
                console.warn("THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter."), this.texture.minFilter = e
            }, get anisotropy() {
                return console.warn("THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy."), this.texture.anisotropy
            }, set anisotropy(e) {
                console.warn("THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy."), this.texture.anisotropy = e
            }, get offset() {
                return console.warn("THREE.WebGLRenderTarget: .offset is now .texture.offset."), this.texture.offset
            }, set offset(e) {
                console.warn("THREE.WebGLRenderTarget: .offset is now .texture.offset."), this.texture.offset = e
            }, get repeat() {
                return console.warn("THREE.WebGLRenderTarget: .repeat is now .texture.repeat."), this.texture.repeat
            }, set repeat(e) {
                console.warn("THREE.WebGLRenderTarget: .repeat is now .texture.repeat."), this.texture.repeat = e
            }, get format() {
                return console.warn("THREE.WebGLRenderTarget: .format is now .texture.format."), this.texture.format
            }, set format(e) {
                console.warn("THREE.WebGLRenderTarget: .format is now .texture.format."), this.texture.format = e
            }, get type() {
                return console.warn("THREE.WebGLRenderTarget: .type is now .texture.type."), this.texture.type
            }, set type(e) {
                console.warn("THREE.WebGLRenderTarget: .type is now .texture.type."), this.texture.type = e
            }, get generateMipmaps() {
                return console.warn("THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps."), this.texture.generateMipmaps
            }, set generateMipmaps(e) {
                console.warn("THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps."), this.texture.generateMipmaps = e
            }, setSize: function (e, t) {
                (this.width !== e || this.height !== t) && (this.width = e, this.height = t, this.dispose())
            }, clone: function () {
                return (new this.constructor).copy(this)
            }, copy: function (e) {
                return this.width = e.width, this.height = e.height, this.texture = e.texture.clone(), this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, this.shareDepthFrom = e.shareDepthFrom, this
            }, dispose: function () {
                this.dispatchEvent({
                    type: "dispose"
                })
            }
        }, THREE.EventDispatcher.prototype.apply(THREE.WebGLRenderTarget.prototype), THREE.WebGLRenderTargetCube = function (e, t, r) {
            THREE.WebGLRenderTarget.call(this, e, t, r), this.activeCubeFace = 0
        }, THREE.WebGLRenderTargetCube.prototype = Object.create(THREE.WebGLRenderTarget.prototype), THREE.WebGLRenderTargetCube.prototype.constructor = THREE.WebGLRenderTargetCube, THREE.WebGLBufferRenderer = function (e, t, r) {
            function n(e) {
                a = e
            } function i(t, n) {
                e.drawArrays(a, t, n), r.calls++, r.vertices += n, a === e.TRIANGLES && (r.faces += n / 3)
            } function o(e) {
                var r = t.get("ANGLE_instanced_arrays"); if (null === r) return void console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays."); var n = e.attributes.position; n instanceof THREE.InterleavedBufferAttribute ? r.drawArraysInstancedANGLE(a, 0, n.data.count, e.maxInstancedCount) : r.drawArraysInstancedANGLE(a, 0, n.count, e.maxInstancedCount)
            } var a; this.setMode = n, this.render = i, this.renderInstances = o
        }, THREE.WebGLIndexedBufferRenderer = function (e, t, r) {
            function n(e) {
                s = e
            } function i(r) {
                r.array instanceof Uint32Array && t.get("OES_element_index_uint") ? (h = e.UNSIGNED_INT, c = 4) : (h = e.UNSIGNED_SHORT, c = 2)
            } function o(t, n) {
                e.drawElements(s, n, h, t * c), r.calls++, r.vertices += n, s === e.TRIANGLES && (r.faces += n / 3)
            } function a(e) {
                var r = t.get("ANGLE_instanced_arrays"); if (null === r) return void console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays."); var n = e.index; r.drawElementsInstancedANGLE(s, n.array.length, h, 0, e.maxInstancedCount)
            } var s, h, c; this.setMode = n, this.setIndex = i, this.render = o, this.renderInstances = a
        }, THREE.WebGLExtensions = function (e) {
            var t = {}; this.get = function (r) {
                if (void 0 !== t[r]) return t[r]; var n; switch (r) {
                    case "EXT_texture_filter_anisotropic": n = e.getExtension("EXT_texture_filter_anisotropic") || e.getExtension("MOZ_EXT_texture_filter_anisotropic") || e.getExtension("WEBKIT_EXT_texture_filter_anisotropic"); break; case "WEBGL_compressed_texture_s3tc": n = e.getExtension("WEBGL_compressed_texture_s3tc") || e.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || e.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc"); break; case "WEBGL_compressed_texture_pvrtc": n = e.getExtension("WEBGL_compressed_texture_pvrtc") || e.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"); break; default: n = e.getExtension(r)
                }return null === n && console.warn("THREE.WebGLRenderer: " + r + " extension not supported."), t[r] = n, n
            }
        }, THREE.WebGLCapabilities = function (e, t, r) {
            function n(t) {
                if ("highp" === t) {
                    if (e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.HIGH_FLOAT).precision > 0 && e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.HIGH_FLOAT).precision > 0) return "highp"; t = "mediump"
                } return "mediump" === t && e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.MEDIUM_FLOAT).precision > 0 && e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp"
            } this.getMaxPrecision = n, this.precision = void 0 !== r.precision ? r.precision : "highp", this.logarithmicDepthBuffer = void 0 !== r.logarithmicDepthBuffer ? r.logarithmicDepthBuffer : !1, this.maxTextures = e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS), this.maxVertexTextures = e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS), this.maxTextureSize = e.getParameter(e.MAX_TEXTURE_SIZE), this.maxCubemapSize = e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE), this.maxAttributes = e.getParameter(e.MAX_VERTEX_ATTRIBS), this.maxVertexUniforms = e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS), this.maxVaryings = e.getParameter(e.MAX_VARYING_VECTORS), this.maxFragmentUniforms = e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS), this.vertexTextures = this.maxVertexTextures > 0, this.floatFragmentTextures = !!t.get("OES_texture_float"), this.floatVertexTextures = this.vertexTextures && this.floatFragmentTextures; var i = n(this.precision); i !== this.precision && (console.warn("THREE.WebGLRenderer:", this.precision, "not supported, using", i, "instead."), this.precision = i), this.logarithmicDepthBuffer && (this.logarithmicDepthBuffer = !!t.get("EXT_frag_depth"))
        }, THREE.WebGLGeometries = function (e, t, r) {
            function n(e) {
                var t = e.geometry; if (void 0 !== c[t.id]) return c[t.id]; t.addEventListener("dispose", i); var n; return t instanceof THREE.BufferGeometry ? n = t : t instanceof THREE.Geometry && (void 0 === t._bufferGeometry && (t._bufferGeometry = (new THREE.BufferGeometry).setFromObject(e)), n = t._bufferGeometry), c[t.id] = n, r.memory.geometries++, n
            } function i(e) {
                var n = e.target, o = c[n.id]; s(o.attributes), n.removeEventListener("dispose", i), delete c[n.id]; var h = t.get(n); h.wireframe && a(h.wireframe), r.memory.geometries--
            } function o(e) {
                return e instanceof THREE.InterleavedBufferAttribute ? t.get(e.data).__webglBuffer : t.get(e).__webglBuffer
            } function a(t) {
                var r = o(t); void 0 !== r && (e.deleteBuffer(r), h(t))
            } function s(e) {
                for (var t in e) a(e[t])
            } function h(e) {
                e instanceof THREE.InterleavedBufferAttribute ? t["delete"](e.data) : t["delete"](e)
            } var c = {}; this.get = n
        }, THREE.WebGLObjects = function (e, t, r) {
            function n(t) {
                var r = u.get(t); t.geometry instanceof THREE.Geometry && r.updateFromObject(t); var n = r.index, o = r.attributes; null !== n && i(n, e.ELEMENT_ARRAY_BUFFER); for (var a in o) i(o[a], e.ARRAY_BUFFER); var s = r.morphAttributes; for (var a in s) for (var h = s[a], c = 0, l = h.length; l > c; c++)i(h[c], e.ARRAY_BUFFER); return r
            } function i(e, r) {
                var n = e instanceof THREE.InterleavedBufferAttribute ? e.data : e, i = t.get(n); void 0 === i.__webglBuffer ? o(i, n, r) : i.version !== n.version && a(i, n, r)
            } function o(t, r, n) {
                t.__webglBuffer = e.createBuffer(), e.bindBuffer(n, t.__webglBuffer); var i = r.dynamic ? e.DYNAMIC_DRAW : e.STATIC_DRAW; e.bufferData(n, r.array, i), t.version = r.version
            } function a(t, r, n) {
                e.bindBuffer(n, t.__webglBuffer), r.dynamic === !1 || -1 === r.updateRange.count ? e.bufferSubData(n, 0, r.array) : 0 === r.updateRange.count ? console.error("THREE.WebGLObjects.updateBuffer: dynamic THREE.BufferAttribute marked as needsUpdate but updateRange.count is 0, ensure you are using set methods or updating manually.") : (e.bufferSubData(n, r.updateRange.offset * r.array.BYTES_PER_ELEMENT, r.array.subarray(r.updateRange.offset, r.updateRange.offset + r.updateRange.count)), r.updateRange.count = 0), t.version = r.version
            } function s(e) {
                return e instanceof THREE.InterleavedBufferAttribute ? t.get(e.data).__webglBuffer : t.get(e).__webglBuffer
            } function h(r) {
                var n = t.get(r); if (void 0 !== n.wireframe) return n.wireframe; var o = [], a = r.index, s = r.attributes, h = s.position; if (null !== a) for (var u = {}, l = a.array, p = 0, f = l.length; f > p; p += 3) {
                    var d = l[p + 0], E = l[p + 1], m = l[p + 2]; c(u, d, E) && o.push(d, E), c(u, E, m) && o.push(E, m), c(u, m, d) && o.push(m, d)
                } else for (var l = s.position.array, p = 0, f = l.length / 3 - 1; f > p; p += 3) {
                    var d = p + 0, E = p + 1, m = p + 2; o.push(d, E, E, m, m, d)
                } var g = h.count > 65535 ? Uint32Array : Uint16Array, v = new THREE.BufferAttribute(new g(o), 1); return i(v, e.ELEMENT_ARRAY_BUFFER), n.wireframe = v, v
            } function c(e, t, r) {
                if (t > r) {
                    var n = t; t = r, r = n
                } var i = e[t]; return void 0 === i ? (e[t] = [r], !0) : -1 === i.indexOf(r) ? (i.push(r), !0) : !1
            } var u = new THREE.WebGLGeometries(e, t, r); this.getAttributeBuffer = s, this.getWireframeAttribute = h, this.update = n
        }, THREE.WebGLProgram = function () {
            function e(e) {
                var t = []; for (var r in e) {
                    var n = e[r]; n !== !1 && t.push("#define " + r + " " + n)
                } return t.join("\n")
            } function t(e, t, r) {
                for (var n = {}, i = e.getProgramParameter(t, e.ACTIVE_UNIFORMS), o = 0; i > o; o++) {
                    var a = e.getActiveUniform(t, o), s = a.name, h = e.getUniformLocation(t, s), c = s.lastIndexOf("[0]"); -1 !== c && c === s.length - 3 && (n[s.substr(0, c)] = h), n[s] = h
                } return n
            } function r(e, t, r) {
                for (var n = {}, i = e.getProgramParameter(t, e.ACTIVE_ATTRIBUTES), o = 0; i > o; o++) {
                    var a = e.getActiveAttrib(t, o), s = a.name; n[s] = e.getAttribLocation(t, s)
                } return n
            } function n(e) {
                return "" !== e
            } var i = 0; return function (o, a, s, h) {
                var c = o.context, u = s.defines, l = s.__webglShader.vertexShader, p = s.__webglShader.fragmentShader, f = "SHADOWMAP_TYPE_BASIC"; h.shadowMapType === THREE.PCFShadowMap ? f = "SHADOWMAP_TYPE_PCF" : h.shadowMapType === THREE.PCFSoftShadowMap && (f = "SHADOWMAP_TYPE_PCF_SOFT"); var d = "ENVMAP_TYPE_CUBE", E = "ENVMAP_MODE_REFLECTION", m = "ENVMAP_BLENDING_MULTIPLY"; if (h.envMap) {
                    switch (s.envMap.mapping) {
                        case THREE.CubeReflectionMapping: case THREE.CubeRefractionMapping: d = "ENVMAP_TYPE_CUBE"; break; case THREE.EquirectangularReflectionMapping: case THREE.EquirectangularRefractionMapping: d = "ENVMAP_TYPE_EQUIREC"; break; case THREE.SphericalReflectionMapping: d = "ENVMAP_TYPE_SPHERE"
                    }switch (s.envMap.mapping) {
                        case THREE.CubeRefractionMapping: case THREE.EquirectangularRefractionMapping: E = "ENVMAP_MODE_REFRACTION"
                    }switch (s.combine) {
                        case THREE.MultiplyOperation: m = "ENVMAP_BLENDING_MULTIPLY"; break; case THREE.MixOperation: m = "ENVMAP_BLENDING_MIX"; break; case THREE.AddOperation: m = "ENVMAP_BLENDING_ADD"
                    }
                } var g, v, T = o.gammaFactor > 0 ? o.gammaFactor : 1, y = e(u), R = c.createProgram(); s instanceof THREE.RawShaderMaterial ? (g = "", v = "") : (g = ["precision " + h.precision + " float;", "precision " + h.precision + " int;", "#define SHADER_NAME " + s.__webglShader.name, y, h.supportsVertexTextures ? "#define VERTEX_TEXTURES" : "", o.gammaInput ? "#define GAMMA_INPUT" : "", o.gammaOutput ? "#define GAMMA_OUTPUT" : "", "#define GAMMA_FACTOR " + T, "#define MAX_DIR_LIGHTS " + h.maxDirLights, "#define MAX_POINT_LIGHTS " + h.maxPointLights, "#define MAX_SPOT_LIGHTS " + h.maxSpotLights, "#define MAX_HEMI_LIGHTS " + h.maxHemiLights, "#define MAX_SHADOWS " + h.maxShadows, "#define MAX_BONES " + h.maxBones, h.map ? "#define USE_MAP" : "", h.envMap ? "#define USE_ENVMAP" : "", h.envMap ? "#define " + E : "", h.lightMap ? "#define USE_LIGHTMAP" : "", h.aoMap ? "#define USE_AOMAP" : "", h.emissiveMap ? "#define USE_EMISSIVEMAP" : "", h.bumpMap ? "#define USE_BUMPMAP" : "", h.normalMap ? "#define USE_NORMALMAP" : "", h.displacementMap && h.supportsVertexTextures ? "#define USE_DISPLACEMENTMAP" : "", h.specularMap ? "#define USE_SPECULARMAP" : "", h.alphaMap ? "#define USE_ALPHAMAP" : "", h.vertexColors ? "#define USE_COLOR" : "", h.flatShading ? "#define FLAT_SHADED" : "", h.skinning ? "#define USE_SKINNING" : "", h.useVertexTexture ? "#define BONE_TEXTURE" : "", h.morphTargets ? "#define USE_MORPHTARGETS" : "", h.morphNormals && h.flatShading === !1 ? "#define USE_MORPHNORMALS" : "", h.doubleSided ? "#define DOUBLE_SIDED" : "", h.flipSided ? "#define FLIP_SIDED" : "", h.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", h.shadowMapEnabled ? "#define " + f : "", h.shadowMapDebug ? "#define SHADOWMAP_DEBUG" : "", h.pointLightShadows > 0 ? "#define POINT_LIGHT_SHADOWS" : "", h.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "", h.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", h.logarithmicDepthBuffer && o.extensions.get("EXT_frag_depth") ? "#define USE_LOGDEPTHBUF_EXT" : "", "uniform mat4 modelMatrix;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform mat4 viewMatrix;", "uniform mat3 normalMatrix;", "uniform vec3 cameraPosition;", "attribute vec3 position;", "attribute vec3 normal;", "attribute vec2 uv;", "#ifdef USE_COLOR", "	attribute vec3 color;", "#endif", "#ifdef USE_MORPHTARGETS", "	attribute vec3 morphTarget0;", "	attribute vec3 morphTarget1;", "	attribute vec3 morphTarget2;", "	attribute vec3 morphTarget3;", "	#ifdef USE_MORPHNORMALS", "		attribute vec3 morphNormal0;", "		attribute vec3 morphNormal1;", "		attribute vec3 morphNormal2;", "		attribute vec3 morphNormal3;", "	#else", "		attribute vec3 morphTarget4;", "		attribute vec3 morphTarget5;", "		attribute vec3 morphTarget6;", "		attribute vec3 morphTarget7;", "	#endif", "#endif", "#ifdef USE_SKINNING", "	attribute vec4 skinIndex;", "	attribute vec4 skinWeight;", "#endif", "\n"].filter(n).join("\n"), v = [h.bumpMap || h.normalMap || h.flatShading || s.derivatives ? "#extension GL_OES_standard_derivatives : enable" : "", h.logarithmicDepthBuffer && o.extensions.get("EXT_frag_depth") ? "#extension GL_EXT_frag_depth : enable" : "", "precision " + h.precision + " float;", "precision " + h.precision + " int;", "#define SHADER_NAME " + s.__webglShader.name, y, "#define MAX_DIR_LIGHTS " + h.maxDirLights, "#define MAX_POINT_LIGHTS " + h.maxPointLights, "#define MAX_SPOT_LIGHTS " + h.maxSpotLights, "#define MAX_HEMI_LIGHTS " + h.maxHemiLights, "#define MAX_SHADOWS " + h.maxShadows, h.alphaTest ? "#define ALPHATEST " + h.alphaTest : "", o.gammaInput ? "#define GAMMA_INPUT" : "", o.gammaOutput ? "#define GAMMA_OUTPUT" : "", "#define GAMMA_FACTOR " + T, h.useFog && h.fog ? "#define USE_FOG" : "", h.useFog && h.fogExp ? "#define FOG_EXP2" : "", h.map ? "#define USE_MAP" : "", h.envMap ? "#define USE_ENVMAP" : "", h.envMap ? "#define " + d : "", h.envMap ? "#define " + E : "", h.envMap ? "#define " + m : "", h.lightMap ? "#define USE_LIGHTMAP" : "", h.aoMap ? "#define USE_AOMAP" : "", h.emissiveMap ? "#define USE_EMISSIVEMAP" : "", h.bumpMap ? "#define USE_BUMPMAP" : "", h.normalMap ? "#define USE_NORMALMAP" : "", h.specularMap ? "#define USE_SPECULARMAP" : "", h.alphaMap ? "#define USE_ALPHAMAP" : "", h.vertexColors ? "#define USE_COLOR" : "", h.flatShading ? "#define FLAT_SHADED" : "", h.metal ? "#define METAL" : "", h.doubleSided ? "#define DOUBLE_SIDED" : "", h.flipSided ? "#define FLIP_SIDED" : "", h.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", h.shadowMapEnabled ? "#define " + f : "", h.shadowMapDebug ? "#define SHADOWMAP_DEBUG" : "", h.pointLightShadows > 0 ? "#define POINT_LIGHT_SHADOWS" : "", h.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", h.logarithmicDepthBuffer && o.extensions.get("EXT_frag_depth") ? "#define USE_LOGDEPTHBUF_EXT" : "", "uniform mat4 viewMatrix;", "uniform vec3 cameraPosition;", "\n"].filter(n).join("\n")); var x = g + l, H = v + p, b = THREE.WebGLShader(c, c.VERTEX_SHADER, x), w = THREE.WebGLShader(c, c.FRAGMENT_SHADER, H); c.attachShader(R, b), c.attachShader(R, w), void 0 !== s.index0AttributeName ? c.bindAttribLocation(R, 0, s.index0AttributeName) : h.morphTargets === !0 && c.bindAttribLocation(R, 0, "position"), c.linkProgram(R); var M = c.getProgramInfoLog(R), S = c.getShaderInfoLog(b), _ = c.getShaderInfoLog(w), C = !0, A = !0; c.getProgramParameter(R, c.LINK_STATUS) === !1 ? (C = !1, console.error("THREE.WebGLProgram: shader error: ", c.getError(), "gl.VALIDATE_STATUS", c.getProgramParameter(R, c.VALIDATE_STATUS), "gl.getProgramInfoLog", M, S, _)) : "" !== M ? console.warn("THREE.WebGLProgram: gl.getProgramInfoLog()", M) : ("" === S || "" === _) && (A = !1), A && (this.diagnostics = {
                    runnable: C, material: s, programLog: M, vertexShader: {
                        log: S, prefix: g
                    }, fragmentShader: {
                        log: _, prefix: v
                    }
                }), c.deleteShader(b), c.deleteShader(w); var L; this.getUniforms = function () {
                    return void 0 === L && (L = t(c, R)), L
                }; var k; return this.getAttributes = function () {
                    return void 0 === k && (k = r(c, R)), k
                }, this.destroy = function () {
                    c.deleteProgram(R), this.program = void 0
                }, Object.defineProperties(this, {
                    uniforms: {
                        get: function () {
                            return console.warn("THREE.WebGLProgram: .uniforms is now .getUniforms()."), this.getUniforms()
                        }
                    }, attributes: {
                        get: function () {
                            return console.warn("THREE.WebGLProgram: .attributes is now .getAttributes()."), this.getAttributes()
                        }
                    }
                }), this.id = i++, this.code = a, this.usedTimes = 1, this.program = R, this.vertexShader = b, this.fragmentShader = w, this
            }
        }(), THREE.WebGLPrograms = function (e, t) {
            function r(e) {
                if (t.floatVertexTextures && e && e.skeleton && e.skeleton.useVertexTexture) return 1024; var r = t.maxVertexUniforms, n = Math.floor((r - 20) / 4), i = n; return void 0 !== e && e instanceof THREE.SkinnedMesh && (i = Math.min(e.skeleton.bones.length, i), i < e.skeleton.bones.length && console.warn("WebGLRenderer: too many bones - " + e.skeleton.bones.length + ", this GPU supports just " + i + " (try OpenGL instead of ANGLE)")), i
            } function n(e) {
                for (var t = 0, r = 0, n = 0, i = 0, o = 0, a = e.length; a > o; o++) {
                    var s = e[o]; s.visible !== !1 && (s instanceof THREE.DirectionalLight && t++, s instanceof THREE.PointLight && r++, s instanceof THREE.SpotLight && n++, s instanceof THREE.HemisphereLight && i++)
                } return {
                    directional: t, point: r, spot: n, hemi: i
                }
            } function i(e) {
                for (var t = 0, r = 0, n = 0, i = e.length; i > n; n++) {
                    var o = e[n]; o.castShadow && ((o instanceof THREE.SpotLight || o instanceof THREE.DirectionalLight) && t++, o instanceof THREE.PointLight && (t++, r++))
                } return {
                    maxShadows: t, pointLightShadows: r
                }
            } var o = [], a = {
                MeshDepthMaterial: "depth", MeshNormalMaterial: "normal", MeshBasicMaterial: "basic", MeshLambertMaterial: "lambert", MeshPhongMaterial: "phong", LineBasicMaterial: "basic", LineDashedMaterial: "dashed", PointsMaterial: "points"
            }, s = ["precision", "supportsVertexTextures", "map", "envMap", "envMapMode", "lightMap", "aoMap", "emissiveMap", "bumpMap", "normalMap", "displacementMap", "specularMap", "alphaMap", "combine", "vertexColors", "fog", "useFog", "fogExp", "flatShading", "sizeAttenuation", "logarithmicDepthBuffer", "skinning", "maxBones", "useVertexTexture", "morphTargets", "morphNormals", "maxMorphTargets", "maxMorphNormals", "maxDirLights", "maxPointLights", "maxSpotLights", "maxHemiLights", "maxShadows", "shadowMapEnabled", "pointLightShadows", "shadowMapType", "shadowMapDebug", "alphaTest", "metal", "doubleSided", "flipSided"]; this.getParameters = function (o, s, h, c) {
                var u = a[o.type], l = n(s), p = i(s), f = r(c), d = e.getPrecision(); null !== o.precision && (d = t.getMaxPrecision(o.precision), d !== o.precision && console.warn("THREE.WebGLRenderer.initMaterial:", o.precision, "not supported, using", d, "instead.")); var E = {
                    shaderID: u, precision: d, supportsVertexTextures: t.vertexTextures, map: !!o.map, envMap: !!o.envMap, envMapMode: o.envMap && o.envMap.mapping, lightMap: !!o.lightMap, aoMap: !!o.aoMap, emissiveMap: !!o.emissiveMap, bumpMap: !!o.bumpMap, normalMap: !!o.normalMap, displacementMap: !!o.displacementMap, specularMap: !!o.specularMap, alphaMap: !!o.alphaMap, combine: o.combine, vertexColors: o.vertexColors, fog: h, useFog: o.fog, fogExp: h instanceof THREE.FogExp2, flatShading: o.shading === THREE.FlatShading, sizeAttenuation: o.sizeAttenuation, logarithmicDepthBuffer: t.logarithmicDepthBuffer, skinning: o.skinning, maxBones: f, useVertexTexture: t.floatVertexTextures && c && c.skeleton && c.skeleton.useVertexTexture, morphTargets: o.morphTargets, morphNormals: o.morphNormals, maxMorphTargets: e.maxMorphTargets, maxMorphNormals: e.maxMorphNormals, maxDirLights: l.directional, maxPointLights: l.point, maxSpotLights: l.spot, maxHemiLights: l.hemi, maxShadows: p.maxShadows, pointLightShadows: p.pointLightShadows, shadowMapEnabled: e.shadowMap.enabled && c.receiveShadow && p.maxShadows > 0, shadowMapType: e.shadowMap.type, shadowMapDebug: e.shadowMap.debug, alphaTest: o.alphaTest, metal: o.metal, doubleSided: o.side === THREE.DoubleSide, flipSided: o.side === THREE.BackSide
                }; return E
            }, this.getProgramCode = function (e, t) {
                var r = []; if (t.shaderID ? r.push(t.shaderID) : (r.push(e.fragmentShader), r.push(e.vertexShader)), void 0 !== e.defines) for (var n in e.defines) r.push(n), r.push(e.defines[n]); for (var i = 0; i < s.length; i++) {
                    var o = s[i]; r.push(o), r.push(t[o])
                } return r.join()
            }, this.acquireProgram = function (t, r, n) {
                for (var i, a = 0, s = o.length; s > a; a++) {
                    var h = o[a]; if (h.code === n) {
                        i = h, ++i.usedTimes; break
                    }
                } return void 0 === i && (i = new THREE.WebGLProgram(e, n, t, r), o.push(i)), i
            }, this.releaseProgram = function (e) {
                if (0 === --e.usedTimes) {
                    var t = o.indexOf(e); o[t] = o[o.length - 1], o.pop(), e.destroy()
                }
            }, this.programs = o
        }, THREE.WebGLProperties = function () {
            var e = {}; this.get = function (t) {
                var r = t.uuid, n = e[r]; return void 0 === n && (n = {}, e[r] = n), n
            }, this["delete"] = function (t) {
                delete e[t.uuid]
            }, this.clear = function () {
                e = {}
            }
        }, THREE.WebGLShader = function () {
            function e(e) {
                for (var t = e.split("\n"), r = 0; r < t.length; r++)t[r] = r + 1 + ": " + t[r]; return t.join("\n")
            } return function (t, r, n) {
                var i = t.createShader(r); return t.shaderSource(i, n), t.compileShader(i), t.getShaderParameter(i, t.COMPILE_STATUS) === !1 && console.error("THREE.WebGLShader: Shader couldn't compile."), "" !== t.getShaderInfoLog(i) && console.warn("THREE.WebGLShader: gl.getShaderInfoLog()", r === t.VERTEX_SHADER ? "vertex" : "fragment", t.getShaderInfoLog(i), e(n)), i
            }
        }(), THREE.WebGLShadowMap = function (e, t, r) {
            function n(e, t, r, n) {
                var i = e.geometry, o = null, a = E, s = e.customDepthMaterial; if (r && (a = m, s = e.customDistanceMaterial), s) o = s; else {
                    var h = void 0 !== i.morphTargets && i.morphTargets.length > 0 && t.morphTargets, c = e instanceof THREE.SkinnedMesh && t.skinning, u = 0; h && (u |= p), c && (u |= f), o = a[u]
                } return o.visible = t.visible, o.wireframe = t.wireframe, o.wireframeLinewidth = t.wireframeLinewidth, r && void 0 !== o.uniforms.lightPos && o.uniforms.lightPos.value.copy(n), o
            } function i(e, t) {
                if (e.visible !== !1) {
                    if ((e instanceof THREE.Mesh || e instanceof THREE.Line || e instanceof THREE.Points) && e.castShadow && (e.frustumCulled === !1 || s.intersectsObject(e) === !0)) {
                        var r = e.material; r.visible === !0 && (e.modelViewMatrix.multiplyMatrices(t.matrixWorldInverse, e.matrixWorld), l.push(e))
                    } for (var n = e.children, o = 0, a = n.length; a > o; o++)i(n[o], t)
                }
            } for (var o = e.context, a = e.state, s = new THREE.Frustum, h = new THREE.Matrix4, c = (new THREE.Vector3, new THREE.Vector3, new THREE.Vector3), u = new THREE.Vector3, l = [], p = 1, f = 2, d = (p | f) + 1, E = new Array(d), m = new Array(d), g = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0)], v = [new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)], T = [new THREE.Vector4, new THREE.Vector4, new THREE.Vector4, new THREE.Vector4, new THREE.Vector4, new THREE.Vector4], y = new THREE.Vector4, R = THREE.ShaderLib.depthRGBA, x = THREE.UniformsUtils.clone(R.uniforms), H = THREE.ShaderLib.distanceRGBA, b = THREE.UniformsUtils.clone(H.uniforms), w = 0; w !== d; ++w) {
                var M = 0 !== (w & p), S = 0 !== (w & f), _ = new THREE.ShaderMaterial({
                    uniforms: x, vertexShader: R.vertexShader, fragmentShader: R.fragmentShader, morphTargets: M, skinning: S
                }); _._shadowPass = !0, E[w] = _; var C = new THREE.ShaderMaterial({
                    uniforms: b, vertexShader: H.vertexShader, fragmentShader: H.fragmentShader, morphTargets: M, skinning: S
                }); C._shadowPass = !0, m[w] = C
            } var A = this; this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = THREE.PCFShadowMap, this.cullFace = THREE.CullFaceFront, this.render = function (p) {
                var f, d; if (A.enabled !== !1 && (A.autoUpdate !== !1 || A.needsUpdate !== !1)) {
                    o.clearColor(1, 1, 1, 1), a.disable(o.BLEND), a.enable(o.CULL_FACE), o.frontFace(o.CCW), o.cullFace(A.cullFace === THREE.CullFaceFront ? o.FRONT : o.BACK), a.setDepthTest(!0), e.getViewport(y); for (var E = 0, m = t.length; m > E; E++) {
                        var R = t[E]; if (R.castShadow === !0) {
                            var x = R.shadow, H = x.camera, b = x.mapSize; if (R instanceof THREE.PointLight) {
                                f = 6, d = !0; var w = b.x / 4, M = b.y / 2; T[0].set(2 * w, M, w, M), T[1].set(0, M, w, M), T[2].set(3 * w, M, w, M), T[3].set(w, M, w, M), T[4].set(3 * w, 0, w, M), T[5].set(w, 0, w, M)
                            } else f = 1, d = !1; if (null === x.map) {
                                var S = THREE.LinearFilter; A.type === THREE.PCFSoftShadowMap && (S = THREE.NearestFilter); var _ = {
                                    minFilter: S, magFilter: S, format: THREE.RGBAFormat
                                }; x.map = new THREE.WebGLRenderTarget(b.x, b.y, _), x.matrix = new THREE.Matrix4, R instanceof THREE.SpotLight && (H.aspect = b.x / b.y), H.updateProjectionMatrix()
                            } var C = x.map, L = x.matrix; u.setFromMatrixPosition(R.matrixWorld), H.position.copy(u), e.setRenderTarget(C), e.clear(); for (var k = 0; f > k; k++) {
                                if (d) {
                                    c.copy(H.position), c.add(g[k]), H.up.copy(v[k]), H.lookAt(c); var P = T[k]; e.setViewport(P.x, P.y, P.z, P.w)
                                } else c.setFromMatrixPosition(R.target.matrixWorld), H.lookAt(c); H.updateMatrixWorld(), H.matrixWorldInverse.getInverse(H.matrixWorld), L.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1), L.multiply(H.projectionMatrix), L.multiply(H.matrixWorldInverse), h.multiplyMatrices(H.projectionMatrix, H.matrixWorldInverse), s.setFromMatrix(h), l.length = 0, i(p, H); for (var D = 0, O = l.length; O > D; D++) {
                                    var F = l[D], N = r.update(F), V = F.material; if (V instanceof THREE.MeshFaceMaterial) for (var U = N.groups, B = V.materials, I = 0, G = U.length; G > I; I++) {
                                        var z = U[I], j = B[z.materialIndex]; if (j.visible === !0) {
                                            var W = n(F, j, d, u); e.renderBufferDirect(H, t, null, N, W, F, z)
                                        }
                                    } else {
                                        var W = n(F, V, d, u); e.renderBufferDirect(H, t, null, N, W, F, null)
                                    }
                                }
                            } e.resetGLState()
                        }
                    } e.setViewport(y.x, y.y, y.z, y.w); var X = e.getClearColor(), q = e.getClearAlpha(); e.setClearColor(X, q), a.enable(o.BLEND), A.cullFace === THREE.CullFaceFront && o.cullFace(o.BACK), e.resetGLState(), A.needsUpdate = !1
                }
            }
        }, THREE.WebGLState = function (e, t, r) {
            var n = this, i = new Uint8Array(16), o = new Uint8Array(16), a = new Uint8Array(16), s = {}, h = null, c = null, u = null, l = null, p = null, f = null, d = null, E = null, m = null, g = null, v = null, T = null, y = null, R = null, x = null, H = e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS), b = void 0, w = {}; this.init = function () {
                e.clearColor(0, 0, 0, 1), e.clearDepth(1), e.clearStencil(0), this.enable(e.DEPTH_TEST), e.depthFunc(e.LEQUAL), e.frontFace(e.CCW), e.cullFace(e.BACK), this.enable(e.CULL_FACE), this.enable(e.BLEND), e.blendEquation(e.FUNC_ADD), e.blendFunc(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA)
            }, this.initAttributes = function () {
                for (var e = 0, t = i.length; t > e; e++)i[e] = 0
            }, this.enableAttribute = function (r) {
                if (i[r] = 1, 0 === o[r] && (e.enableVertexAttribArray(r), o[r] = 1), 0 !== a[r]) {
                    var n = t.get("ANGLE_instanced_arrays"); n.vertexAttribDivisorANGLE(r, 0), a[r] = 0
                }
            }, this.enableAttributeAndDivisor = function (t, r, n) {
                i[t] = 1, 0 === o[t] && (e.enableVertexAttribArray(t), o[t] = 1), a[t] !== r && (n.vertexAttribDivisorANGLE(t, r), a[t] = r)
            }, this.disableUnusedAttributes = function () {
                for (var t = 0, r = o.length; r > t; t++)o[t] !== i[t] && (e.disableVertexAttribArray(t), o[t] = 0)
            }, this.enable = function (t) {
                s[t] !== !0 && (e.enable(t), s[t] = !0)
            }, this.disable = function (t) {
                s[t] !== !1 && (e.disable(t), s[t] = !1)
            }, this.getCompressedTextureFormats = function () {
                if (null === h && (h = [], t.get("WEBGL_compressed_texture_pvrtc") || t.get("WEBGL_compressed_texture_s3tc"))) for (var r = e.getParameter(e.COMPRESSED_TEXTURE_FORMATS), n = 0; n < r.length; n++)h.push(r[n]); return h
            }, this.setBlending = function (t, n, i, o, a, s, h) {
                t !== c && (t === THREE.NoBlending ? this.disable(e.BLEND) : t === THREE.AdditiveBlending ? (this.enable(e.BLEND), e.blendEquation(e.FUNC_ADD), e.blendFunc(e.SRC_ALPHA, e.ONE)) : t === THREE.SubtractiveBlending ? (this.enable(e.BLEND), e.blendEquation(e.FUNC_ADD), e.blendFunc(e.ZERO, e.ONE_MINUS_SRC_COLOR)) : t === THREE.MultiplyBlending ? (this.enable(e.BLEND), e.blendEquation(e.FUNC_ADD), e.blendFunc(e.ZERO, e.SRC_COLOR)) : t === THREE.CustomBlending ? this.enable(e.BLEND) : (this.enable(e.BLEND), e.blendEquationSeparate(e.FUNC_ADD, e.FUNC_ADD), e.blendFuncSeparate(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA, e.ONE, e.ONE_MINUS_SRC_ALPHA)), c = t), t === THREE.CustomBlending ? (a = a || n, s = s || i, h = h || o, (n !== u || a !== f) && (e.blendEquationSeparate(r(n), r(a)), u = n, f = a), (i !== l || o !== p || s !== d || h !== E) && (e.blendFuncSeparate(r(i), r(o), r(s), r(h)), l = i, p = o, d = s, E = h)) : (u = null, l = null, p = null, f = null, d = null, E = null)
            }, this.setDepthFunc = function (t) {
                if (m !== t) {
                    if (t) switch (t) {
                        case THREE.NeverDepth: e.depthFunc(e.NEVER); break; case THREE.AlwaysDepth: e.depthFunc(e.ALWAYS); break; case THREE.LessDepth: e.depthFunc(e.LESS); break; case THREE.LessEqualDepth: e.depthFunc(e.LEQUAL); break; case THREE.EqualDepth: e.depthFunc(e.EQUAL); break; case THREE.GreaterEqualDepth: e.depthFunc(e.GEQUAL); break; case THREE.GreaterDepth: e.depthFunc(e.GREATER); break; case THREE.NotEqualDepth: e.depthFunc(e.NOTEQUAL); break; default: e.depthFunc(e.LEQUAL)
                    } else e.depthFunc(e.LEQUAL); m = t
                }
            }, this.setDepthTest = function (t) {
                t ? this.enable(e.DEPTH_TEST) : this.disable(e.DEPTH_TEST)
            }, this.setDepthWrite = function (t) {
                g !== t && (e.depthMask(t), g = t)
            }, this.setColorWrite = function (t) {
                v !== t && (e.colorMask(t, t, t, t), v = t)
            }, this.setFlipSided = function (t) {
                T !== t && (t ? e.frontFace(e.CW) : e.frontFace(e.CCW), T = t)
            }, this.setLineWidth = function (t) {
                t !== y && (e.lineWidth(t), y = t)
            }, this.setPolygonOffset = function (t, r, n) {
                t ? this.enable(e.POLYGON_OFFSET_FILL) : this.disable(e.POLYGON_OFFSET_FILL), !t || R === r && x === n || (e.polygonOffset(r, n), R = r, x = n)
            }, this.setScissorTest = function (t) {
                t ? this.enable(e.SCISSOR_TEST) : this.disable(e.SCISSOR_TEST)
            }, this.activeTexture = function (t) {
                void 0 === t && (t = e.TEXTURE0 + H - 1), b !== t && (e.activeTexture(t), b = t)
            }, this.bindTexture = function (t, r) {
                void 0 === b && n.activeTexture(); var i = w[b]; void 0 === i && (i = {
                    type: void 0, texture: void 0
                }, w[b] = i), (i.type !== t || i.texture !== r) && (e.bindTexture(t, r), i.type = t, i.texture = r)
            }, this.compressedTexImage2D = function () {
                try {
                    e.compressedTexImage2D.apply(e, arguments)
                } catch (t) {
                    console.error(t)
                }
            }, this.texImage2D = function () {
                try {
                    e.texImage2D.apply(e, arguments)
                } catch (t) {
                    console.error(t)
                }
            }, this.reset = function () {
                for (var t = 0; t < o.length; t++)1 === o[t] && (e.disableVertexAttribArray(t), o[t] = 0); s = {}, h = null, c = null, g = null, v = null, T = null
            }
        }, THREE.LensFlarePlugin = function (e, t) {
            function r() {
                var e = new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, 1, 1, 1, 1, -1, 1, 0, 1]), t = new Uint16Array([0, 1, 2, 0, 2, 3]); i = p.createBuffer(), o = p.createBuffer(), p.bindBuffer(p.ARRAY_BUFFER, i), p.bufferData(p.ARRAY_BUFFER, e, p.STATIC_DRAW), p.bindBuffer(p.ELEMENT_ARRAY_BUFFER, o), p.bufferData(p.ELEMENT_ARRAY_BUFFER, t, p.STATIC_DRAW), u = p.createTexture(), l = p.createTexture(), f.bindTexture(p.TEXTURE_2D, u), p.texImage2D(p.TEXTURE_2D, 0, p.RGB, 16, 16, 0, p.RGB, p.UNSIGNED_BYTE, null), p.texParameteri(p.TEXTURE_2D, p.TEXTURE_WRAP_S, p.CLAMP_TO_EDGE), p.texParameteri(p.TEXTURE_2D, p.TEXTURE_WRAP_T, p.CLAMP_TO_EDGE), p.texParameteri(p.TEXTURE_2D, p.TEXTURE_MAG_FILTER, p.NEAREST), p.texParameteri(p.TEXTURE_2D, p.TEXTURE_MIN_FILTER, p.NEAREST), f.bindTexture(p.TEXTURE_2D, l), p.texImage2D(p.TEXTURE_2D, 0, p.RGBA, 16, 16, 0, p.RGBA, p.UNSIGNED_BYTE, null), p.texParameteri(p.TEXTURE_2D, p.TEXTURE_WRAP_S, p.CLAMP_TO_EDGE), p.texParameteri(p.TEXTURE_2D, p.TEXTURE_WRAP_T, p.CLAMP_TO_EDGE), p.texParameteri(p.TEXTURE_2D, p.TEXTURE_MAG_FILTER, p.NEAREST), p.texParameteri(p.TEXTURE_2D, p.TEXTURE_MIN_FILTER, p.NEAREST), c = p.getParameter(p.MAX_VERTEX_TEXTURE_IMAGE_UNITS) > 0; var r; r = c ? {
                    vertexShader: ["uniform lowp int renderType;", "uniform vec3 screenPosition;", "uniform vec2 scale;", "uniform float rotation;", "uniform sampler2D occlusionMap;", "attribute vec2 position;", "attribute vec2 uv;", "varying vec2 vUV;", "varying float vVisibility;", "void main() {", "vUV = uv;", "vec2 pos = position;", "if ( renderType == 2 ) {", "vec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) );", "visibility += texture2D( occlusionMap, vec2( 0.5, 0.1 ) );", "visibility += texture2D( occlusionMap, vec2( 0.9, 0.1 ) );", "visibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) );", "visibility += texture2D( occlusionMap, vec2( 0.9, 0.9 ) );", "visibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) );", "visibility += texture2D( occlusionMap, vec2( 0.1, 0.9 ) );", "visibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) );", "visibility += texture2D( occlusionMap, vec2( 0.5, 0.5 ) );", "vVisibility =        visibility.r / 9.0;", "vVisibility *= 1.0 - visibility.g / 9.0;", "vVisibility *=       visibility.b / 9.0;", "vVisibility *= 1.0 - visibility.a / 9.0;", "pos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;", "pos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;", "}", "gl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );", "}"].join("\n"), fragmentShader: ["uniform lowp int renderType;", "uniform sampler2D map;", "uniform float opacity;", "uniform vec3 color;", "varying vec2 vUV;", "varying float vVisibility;", "void main() {", "if ( renderType == 0 ) {", "gl_FragColor = vec4( 1.0, 0.0, 1.0, 0.0 );", "} else if ( renderType == 1 ) {", "gl_FragColor = texture2D( map, vUV );", "} else {", "vec4 texture = texture2D( map, vUV );", "texture.a *= opacity * vVisibility;", "gl_FragColor = texture;", "gl_FragColor.rgb *= color;", "}", "}"].join("\n")
                } : {
                    vertexShader: ["uniform lowp int renderType;", "uniform vec3 screenPosition;", "uniform vec2 scale;", "uniform float rotation;", "attribute vec2 position;", "attribute vec2 uv;", "varying vec2 vUV;", "void main() {", "vUV = uv;", "vec2 pos = position;", "if ( renderType == 2 ) {", "pos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;", "pos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;", "}", "gl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );", "}"].join("\n"), fragmentShader: ["precision mediump float;", "uniform lowp int renderType;", "uniform sampler2D map;", "uniform sampler2D occlusionMap;", "uniform float opacity;", "uniform vec3 color;", "varying vec2 vUV;", "void main() {", "if ( renderType == 0 ) {", "gl_FragColor = vec4( texture2D( map, vUV ).rgb, 0.0 );", "} else if ( renderType == 1 ) {", "gl_FragColor = texture2D( map, vUV );", "} else {", "float visibility = texture2D( occlusionMap, vec2( 0.5, 0.1 ) ).a;", "visibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) ).a;", "visibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) ).a;", "visibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) ).a;", "visibility = ( 1.0 - visibility / 4.0 );", "vec4 texture = texture2D( map, vUV );", "texture.a *= opacity * visibility;", "gl_FragColor = texture;", "gl_FragColor.rgb *= color;", "}", "}"].join("\n")
                }, a = n(r), s = {
                    vertex: p.getAttribLocation(a, "position"), uv: p.getAttribLocation(a, "uv")
                }, h = {
                    renderType: p.getUniformLocation(a, "renderType"), map: p.getUniformLocation(a, "map"), occlusionMap: p.getUniformLocation(a, "occlusionMap"), opacity: p.getUniformLocation(a, "opacity"), color: p.getUniformLocation(a, "color"), scale: p.getUniformLocation(a, "scale"), rotation: p.getUniformLocation(a, "rotation"), screenPosition: p.getUniformLocation(a, "screenPosition")
                }
            } function n(t) {
                var r = p.createProgram(), n = p.createShader(p.FRAGMENT_SHADER), i = p.createShader(p.VERTEX_SHADER), o = "precision " + e.getPrecision() + " float;\n"; return p.shaderSource(n, o + t.fragmentShader), p.shaderSource(i, o + t.vertexShader), p.compileShader(n), p.compileShader(i), p.attachShader(r, n), p.attachShader(r, i), p.linkProgram(r), r
            } var i, o, a, s, h, c, u, l, p = e.context, f = e.state; this.render = function (n, d, E, m) {
                if (0 !== t.length) {
                    var g = new THREE.Vector3, v = m / E, T = .5 * E, y = .5 * m, R = 16 / m, x = new THREE.Vector2(R * v, R), H = new THREE.Vector3(1, 1, 0), b = new THREE.Vector2(1, 1); void 0 === a && r(), p.useProgram(a), f.initAttributes(), f.enableAttribute(s.vertex), f.enableAttribute(s.uv), f.disableUnusedAttributes(), p.uniform1i(h.occlusionMap, 0), p.uniform1i(h.map, 1), p.bindBuffer(p.ARRAY_BUFFER, i), p.vertexAttribPointer(s.vertex, 2, p.FLOAT, !1, 16, 0), p.vertexAttribPointer(s.uv, 2, p.FLOAT, !1, 16, 8), p.bindBuffer(p.ELEMENT_ARRAY_BUFFER, o), f.disable(p.CULL_FACE), p.depthMask(!1); for (var w = 0, M = t.length; M > w; w++) {
                        R = 16 / m, x.set(R * v, R); var S = t[w]; if (g.set(S.matrixWorld.elements[12], S.matrixWorld.elements[13], S.matrixWorld.elements[14]), g.applyMatrix4(d.matrixWorldInverse), g.applyProjection(d.projectionMatrix), H.copy(g), b.x = H.x * T + T, b.y = H.y * y + y, c || b.x > 0 && b.x < E && b.y > 0 && b.y < m) {
                            f.activeTexture(p.TEXTURE0), f.bindTexture(p.TEXTURE_2D, null), f.activeTexture(p.TEXTURE1), f.bindTexture(p.TEXTURE_2D, u), p.copyTexImage2D(p.TEXTURE_2D, 0, p.RGB, b.x - 8, b.y - 8, 16, 16, 0), p.uniform1i(h.renderType, 0), p.uniform2f(h.scale, x.x, x.y), p.uniform3f(h.screenPosition, H.x, H.y, H.z), f.disable(p.BLEND), f.enable(p.DEPTH_TEST), p.drawElements(p.TRIANGLES, 6, p.UNSIGNED_SHORT, 0), f.activeTexture(p.TEXTURE0), f.bindTexture(p.TEXTURE_2D, l), p.copyTexImage2D(p.TEXTURE_2D, 0, p.RGBA, b.x - 8, b.y - 8, 16, 16, 0), p.uniform1i(h.renderType, 1), f.disable(p.DEPTH_TEST), f.activeTexture(p.TEXTURE1), f.bindTexture(p.TEXTURE_2D, u), p.drawElements(p.TRIANGLES, 6, p.UNSIGNED_SHORT, 0), S.positionScreen.copy(H), S.customUpdateCallback ? S.customUpdateCallback(S) : S.updateLensFlares(), p.uniform1i(h.renderType, 2), f.enable(p.BLEND); for (var _ = 0, C = S.lensFlares.length; C > _; _++) {
                                var A = S.lensFlares[_]; A.opacity > .001 && A.scale > .001 && (H.x = A.x, H.y = A.y, H.z = A.z, R = A.size * A.scale / m, x.x = R * v, x.y = R, p.uniform3f(h.screenPosition, H.x, H.y, H.z), p.uniform2f(h.scale, x.x, x.y), p.uniform1f(h.rotation, A.rotation), p.uniform1f(h.opacity, A.opacity), p.uniform3f(h.color, A.color.r, A.color.g, A.color.b), f.setBlending(A.blending, A.blendEquation, A.blendSrc, A.blendDst), e.setTexture(A.texture, 1), p.drawElements(p.TRIANGLES, 6, p.UNSIGNED_SHORT, 0))
                            }
                        }
                    } f.enable(p.CULL_FACE), f.enable(p.DEPTH_TEST), p.depthMask(!0), e.resetGLState()
                }
            }
        }, THREE.SpritePlugin = function (e, t) {
            function r() {
                var e = new Float32Array([-.5, -.5, 0, 0, .5, -.5, 1, 0, .5, .5, 1, 1, -.5, .5, 0, 1]), t = new Uint16Array([0, 1, 2, 0, 2, 3]); o = l.createBuffer(), a = l.createBuffer(), l.bindBuffer(l.ARRAY_BUFFER, o), l.bufferData(l.ARRAY_BUFFER, e, l.STATIC_DRAW), l.bindBuffer(l.ELEMENT_ARRAY_BUFFER, a), l.bufferData(l.ELEMENT_ARRAY_BUFFER, t, l.STATIC_DRAW), s = n(), h = {
                    position: l.getAttribLocation(s, "position"), uv: l.getAttribLocation(s, "uv")
                }, c = {
                    uvOffset: l.getUniformLocation(s, "uvOffset"), uvScale: l.getUniformLocation(s, "uvScale"), rotation: l.getUniformLocation(s, "rotation"), scale: l.getUniformLocation(s, "scale"), color: l.getUniformLocation(s, "color"), map: l.getUniformLocation(s, "map"), opacity: l.getUniformLocation(s, "opacity"), modelViewMatrix: l.getUniformLocation(s, "modelViewMatrix"), projectionMatrix: l.getUniformLocation(s, "projectionMatrix"), fogType: l.getUniformLocation(s, "fogType"), fogDensity: l.getUniformLocation(s, "fogDensity"), fogNear: l.getUniformLocation(s, "fogNear"), fogFar: l.getUniformLocation(s, "fogFar"), fogColor: l.getUniformLocation(s, "fogColor"), alphaTest: l.getUniformLocation(s, "alphaTest")
                }; var r = document.createElement("canvas"); r.width = 8, r.height = 8; var i = r.getContext("2d"); i.fillStyle = "white", i.fillRect(0, 0, 8, 8), u = new THREE.Texture(r), u.needsUpdate = !0
            } function n() {
                var t = l.createProgram(), r = l.createShader(l.VERTEX_SHADER), n = l.createShader(l.FRAGMENT_SHADER); return l.shaderSource(r, ["precision " + e.getPrecision() + " float;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform float rotation;", "uniform vec2 scale;", "uniform vec2 uvOffset;", "uniform vec2 uvScale;", "attribute vec2 position;", "attribute vec2 uv;", "varying vec2 vUV;", "void main() {", "vUV = uvOffset + uv * uvScale;", "vec2 alignedPosition = position * scale;", "vec2 rotatedPosition;", "rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;", "rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;", "vec4 finalPosition;", "finalPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );", "finalPosition.xy += rotatedPosition;", "finalPosition = projectionMatrix * finalPosition;", "gl_Position = finalPosition;", "}"].join("\n")), l.shaderSource(n, ["precision " + e.getPrecision() + " float;", "uniform vec3 color;", "uniform sampler2D map;", "uniform float opacity;", "uniform int fogType;", "uniform vec3 fogColor;", "uniform float fogDensity;", "uniform float fogNear;", "uniform float fogFar;", "uniform float alphaTest;", "varying vec2 vUV;", "void main() {", "vec4 texture = texture2D( map, vUV );", "if ( texture.a < alphaTest ) discard;", "gl_FragColor = vec4( color * texture.xyz, texture.a * opacity );", "if ( fogType > 0 ) {", "float depth = gl_FragCoord.z / gl_FragCoord.w;", "float fogFactor = 0.0;", "if ( fogType == 1 ) {", "fogFactor = smoothstep( fogNear, fogFar, depth );", "} else {", "const float LOG2 = 1.442695;", "fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );", "fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );", "}", "gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );", "}", "}"].join("\n")), l.compileShader(r), l.compileShader(n), l.attachShader(t, r), l.attachShader(t, n), l.linkProgram(t), t
            } function i(e, t) {
                return e.z !== t.z ? t.z - e.z : t.id - e.id
            } var o, a, s, h, c, u, l = e.context, p = e.state, f = new THREE.Vector3, d = new THREE.Quaternion, E = new THREE.Vector3; this.render = function (n, m) {
                if (0 !== t.length) {
                    void 0 === s && r(), l.useProgram(s), p.initAttributes(), p.enableAttribute(h.position), p.enableAttribute(h.uv), p.disableUnusedAttributes(), p.disable(l.CULL_FACE), p.enable(l.BLEND), l.bindBuffer(l.ARRAY_BUFFER, o), l.vertexAttribPointer(h.position, 2, l.FLOAT, !1, 16, 0), l.vertexAttribPointer(h.uv, 2, l.FLOAT, !1, 16, 8), l.bindBuffer(l.ELEMENT_ARRAY_BUFFER, a), l.uniformMatrix4fv(c.projectionMatrix, !1, m.projectionMatrix.elements), p.activeTexture(l.TEXTURE0), l.uniform1i(c.map, 0); var g = 0, v = 0, T = n.fog; T ? (l.uniform3f(c.fogColor, T.color.r, T.color.g, T.color.b), T instanceof THREE.Fog ? (l.uniform1f(c.fogNear, T.near), l.uniform1f(c.fogFar, T.far), l.uniform1i(c.fogType, 1), g = 1, v = 1) : T instanceof THREE.FogExp2 && (l.uniform1f(c.fogDensity, T.density), l.uniform1i(c.fogType, 2),
                        g = 2, v = 2)) : (l.uniform1i(c.fogType, 0), g = 0, v = 0); for (var y = 0, R = t.length; R > y; y++) {
                            var x = t[y]; x.modelViewMatrix.multiplyMatrices(m.matrixWorldInverse, x.matrixWorld), x.z = -x.modelViewMatrix.elements[14]
                        } t.sort(i); for (var H = [], y = 0, R = t.length; R > y; y++) {
                            var x = t[y], b = x.material; l.uniform1f(c.alphaTest, b.alphaTest), l.uniformMatrix4fv(c.modelViewMatrix, !1, x.modelViewMatrix.elements), x.matrixWorld.decompose(f, d, E), H[0] = E.x, H[1] = E.y; var w = 0; n.fog && b.fog && (w = v), g !== w && (l.uniform1i(c.fogType, w), g = w), null !== b.map ? (l.uniform2f(c.uvOffset, b.map.offset.x, b.map.offset.y), l.uniform2f(c.uvScale, b.map.repeat.x, b.map.repeat.y)) : (l.uniform2f(c.uvOffset, 0, 0), l.uniform2f(c.uvScale, 1, 1)), l.uniform1f(c.opacity, b.opacity), l.uniform3f(c.color, b.color.r, b.color.g, b.color.b), l.uniform1f(c.rotation, b.rotation), l.uniform2fv(c.scale, H), p.setBlending(b.blending, b.blendEquation, b.blendSrc, b.blendDst), p.setDepthTest(b.depthTest), p.setDepthWrite(b.depthWrite), b.map && b.map.image && b.map.image.width ? e.setTexture(b.map, 0) : e.setTexture(u, 0), l.drawElements(l.TRIANGLES, 6, l.UNSIGNED_SHORT, 0)
                        } p.enable(l.CULL_FACE), e.resetGLState()
                }
            }
        }, THREE.CurveUtils = {
            tangentQuadraticBezier: function (e, t, r, n) {
                return 2 * (1 - e) * (r - t) + 2 * e * (n - r)
            }, tangentCubicBezier: function (e, t, r, n, i) {
                return -3 * t * (1 - e) * (1 - e) + 3 * r * (1 - e) * (1 - e) - 6 * e * r * (1 - e) + 6 * e * n * (1 - e) - 3 * e * e * n + 3 * e * e * i
            }, tangentSpline: function (e, t, r, n, i) {
                var o = 6 * e * e - 6 * e, a = 3 * e * e - 4 * e + 1, s = -6 * e * e + 6 * e, h = 3 * e * e - 2 * e; return o + a + s + h
            }, interpolate: function (e, t, r, n, i) {
                var o = .5 * (r - e), a = .5 * (n - t), s = i * i, h = i * s; return (2 * t - 2 * r + o + a) * h + (-3 * t + 3 * r - 2 * o - a) * s + o * i + t
            }
        }, THREE.GeometryUtils = {
            merge: function (e, t, r) {
                console.warn("THREE.GeometryUtils: .merge() has been moved to Geometry. Use geometry.merge( geometry2, matrix, materialIndexOffset ) instead."); var n; t instanceof THREE.Mesh && (t.matrixAutoUpdate && t.updateMatrix(), n = t.matrix, t = t.geometry), e.merge(t, n, r)
            }, center: function (e) {
                return console.warn("THREE.GeometryUtils: .center() has been moved to Geometry. Use geometry.center() instead."), e.center()
            }
        }, THREE.ImageUtils = {
            crossOrigin: void 0, loadTexture: function (e, t, r, n) {
                console.warn("THREE.ImageUtils.loadTexture is being deprecated. Use THREE.TextureLoader() instead."); var i = new THREE.TextureLoader; i.setCrossOrigin(this.crossOrigin); var o = i.load(e, r, void 0, n); return t && (o.mapping = t), o
            }, loadTextureCube: function (e, t, r, n) {
                console.warn("THREE.ImageUtils.loadTextureCube is being deprecated. Use THREE.CubeTextureLoader() instead."); var i = new THREE.CubeTextureLoader; i.setCrossOrigin(this.crossOrigin); var o = i.load(e, r, void 0, n); return t && (o.mapping = t), o
            }, loadCompressedTexture: function () {
                console.error("THREE.ImageUtils.loadCompressedTexture has been removed. Use THREE.DDSLoader instead.")
            }, loadCompressedTextureCube: function () {
                console.error("THREE.ImageUtils.loadCompressedTextureCube has been removed. Use THREE.DDSLoader instead.")
            }
        }, THREE.SceneUtils = {
            createMultiMaterialObject: function (e, t) {
                for (var r = new THREE.Group, n = 0, i = t.length; i > n; n++)r.add(new THREE.Mesh(e, t[n])); return r
            }, detach: function (e, t, r) {
                e.applyMatrix(t.matrixWorld), t.remove(e), r.add(e)
            }, attach: function (e, t, r) {
                var n = new THREE.Matrix4; n.getInverse(r.matrixWorld), e.applyMatrix(n), t.remove(e), r.add(e)
            }
        }, THREE.ShapeUtils = {
            area: function (e) {
                for (var t = e.length, r = 0, n = t - 1, i = 0; t > i; n = i++)r += e[n].x * e[i].y - e[i].x * e[n].y; return .5 * r
            }, triangulate: function () {
                function e(e, t, r, n, i, o) {
                    var a, s, h, c, u, l, p, f, d; if (s = e[o[t]].x, h = e[o[t]].y, c = e[o[r]].x, u = e[o[r]].y, l = e[o[n]].x, p = e[o[n]].y, Number.EPSILON > (c - s) * (p - h) - (u - h) * (l - s)) return !1; var E, m, g, v, T, y, R, x, H, b, w, M, S, _, C; for (E = l - c, m = p - u, g = s - l, v = h - p, T = c - s, y = u - h, a = 0; i > a; a++)if (f = e[o[a]].x, d = e[o[a]].y, !(f === s && d === h || f === c && d === u || f === l && d === p) && (R = f - s, x = d - h, H = f - c, b = d - u, w = f - l, M = d - p, C = E * b - m * H, S = T * x - y * R, _ = g * M - v * w, C >= -Number.EPSILON && _ >= -Number.EPSILON && S >= -Number.EPSILON)) return !1; return !0
                } return function (t, r) {
                    var n = t.length; if (3 > n) return null; var i, o, a, s = [], h = [], c = []; if (THREE.ShapeUtils.area(t) > 0) for (o = 0; n > o; o++)h[o] = o; else for (o = 0; n > o; o++)h[o] = n - 1 - o; var u = n, l = 2 * u; for (o = u - 1; u > 2;) {
                        if (l-- <= 0) return console.warn("THREE.ShapeUtils: Unable to triangulate polygon! in triangulate()"), r ? c : s; if (i = o, i >= u && (i = 0), o = i + 1, o >= u && (o = 0), a = o + 1, a >= u && (a = 0), e(t, i, o, a, u, h)) {
                            var p, f, d, E, m; for (p = h[i], f = h[o], d = h[a], s.push([t[p], t[f], t[d]]), c.push([h[i], h[o], h[a]]), E = o, m = o + 1; u > m; E++, m++)h[E] = h[m]; u--, l = 2 * u
                        }
                    } return r ? c : s
                }
            }(), triangulateShape: function (e, t) {
                function r(e, t, r) {
                    return e.x !== t.x ? e.x < t.x ? e.x <= r.x && r.x <= t.x : t.x <= r.x && r.x <= e.x : e.y < t.y ? e.y <= r.y && r.y <= t.y : t.y <= r.y && r.y <= e.y
                } function n(e, t, n, i, o) {
                    var a = t.x - e.x, s = t.y - e.y, h = i.x - n.x, c = i.y - n.y, u = e.x - n.x, l = e.y - n.y, p = s * h - a * c, f = s * u - a * l; if (Math.abs(p) > Number.EPSILON) {
                        var d; if (p > 0) {
                            if (0 > f || f > p) return []; if (d = c * u - h * l, 0 > d || d > p) return []
                        } else {
                            if (f > 0 || p > f) return []; if (d = c * u - h * l, d > 0 || p > d) return []
                        } if (0 === d) return !o || 0 !== f && f !== p ? [e] : []; if (d === p) return !o || 0 !== f && f !== p ? [t] : []; if (0 === f) return [n]; if (f === p) return [i]; var E = d / p; return [{
                            x: e.x + E * a, y: e.y + E * s
                        }]
                    } if (0 !== f || c * u !== h * l) return []; var m = 0 === a && 0 === s, g = 0 === h && 0 === c; if (m && g) return e.x !== n.x || e.y !== n.y ? [] : [e]; if (m) return r(n, i, e) ? [e] : []; if (g) return r(e, t, n) ? [n] : []; var v, T, y, R, x, H, b, w; return 0 !== a ? (e.x < t.x ? (v = e, y = e.x, T = t, R = t.x) : (v = t, y = t.x, T = e, R = e.x), n.x < i.x ? (x = n, b = n.x, H = i, w = i.x) : (x = i, b = i.x, H = n, w = n.x)) : (e.y < t.y ? (v = e, y = e.y, T = t, R = t.y) : (v = t, y = t.y, T = e, R = e.y), n.y < i.y ? (x = n, b = n.y, H = i, w = i.y) : (x = i, b = i.y, H = n, w = n.y)), b >= y ? b > R ? [] : R === b ? o ? [] : [x] : w >= R ? [x, T] : [x, H] : y > w ? [] : y === w ? o ? [] : [v] : w >= R ? [v, T] : [v, H]
                } function i(e, t, r, n) {
                    var i = t.x - e.x, o = t.y - e.y, a = r.x - e.x, s = r.y - e.y, h = n.x - e.x, c = n.y - e.y, u = i * s - o * a, l = i * c - o * h; if (Math.abs(u) > Number.EPSILON) {
                        var p = h * s - c * a; return u > 0 ? l >= 0 && p >= 0 : l >= 0 || p >= 0
                    } return l > 0
                } function o(e, t) {
                    function r(e, t) {
                        var r = v.length - 1, n = e - 1; 0 > n && (n = r); var o = e + 1; o > r && (o = 0); var a = i(v[e], v[n], v[o], s[t]); if (!a) return !1; var h = s.length - 1, c = t - 1; 0 > c && (c = h); var u = t + 1; return u > h && (u = 0), a = i(s[t], s[c], s[u], v[e]), a ? !0 : !1
                    } function o(e, t) {
                        var r, i, o; for (r = 0; r < v.length; r++)if (i = r + 1, i %= v.length, o = n(e, t, v[r], v[i], !0), o.length > 0) return !0; return !1
                    } function a(e, r) {
                        var i, o, a, s, h; for (i = 0; i < T.length; i++)for (o = t[T[i]], a = 0; a < o.length; a++)if (s = a + 1, s %= o.length, h = n(e, r, o[a], o[s], !0), h.length > 0) return !0; return !1
                    } for (var s, h, c, u, l, p, f, d, E, m, g, v = e.concat(), T = [], y = [], R = 0, x = t.length; x > R; R++)T.push(R); for (var H = 0, b = 2 * T.length; T.length > 0;) {
                        if (b--, 0 > b) {
                            console.log("Infinite Loop! Holes left:" + T.length + ", Probably Hole outside Shape!"); break
                        } for (c = H; c < v.length; c++) {
                            u = v[c], h = -1; for (var R = 0; R < T.length; R++)if (p = T[R], f = u.x + ":" + u.y + ":" + p, void 0 === y[f]) {
                                s = t[p]; for (var w = 0; w < s.length; w++)if (l = s[w], r(c, w) && !o(u, l) && !a(u, l)) {
                                    h = w, T.splice(R, 1), d = v.slice(0, c + 1), E = v.slice(c), m = s.slice(h), g = s.slice(0, h + 1), v = d.concat(m).concat(g).concat(E), H = c; break
                                } if (h >= 0) break; y[f] = !0
                            } if (h >= 0) break
                        }
                    } return v
                } for (var a, s, h, c, u, l, p = {}, f = e.concat(), d = 0, E = t.length; E > d; d++)Array.prototype.push.apply(f, t[d]); for (a = 0, s = f.length; s > a; a++)u = f[a].x + ":" + f[a].y, void 0 !== p[u] && console.warn("THREE.Shape: Duplicate point", u), p[u] = a; var m = o(e, t), g = THREE.ShapeUtils.triangulate(m, !1); for (a = 0, s = g.length; s > a; a++)for (c = g[a], h = 0; 3 > h; h++)u = c[h].x + ":" + c[h].y, l = p[u], void 0 !== l && (c[h] = l); return g.concat()
            }, isClockWise: function (e) {
                return THREE.ShapeUtils.area(e) < 0
            }, b2: function () {
                function e(e, t) {
                    var r = 1 - e; return r * r * t
                } function t(e, t) {
                    return 2 * (1 - e) * e * t
                } function r(e, t) {
                    return e * e * t
                } return function (n, i, o, a) {
                    return e(n, i) + t(n, o) + r(n, a)
                }
            }(), b3: function () {
                function e(e, t) {
                    var r = 1 - e; return r * r * r * t
                } function t(e, t) {
                    var r = 1 - e; return 3 * r * r * e * t
                } function r(e, t) {
                    var r = 1 - e; return 3 * r * e * e * t
                } function n(e, t) {
                    return e * e * e * t
                } return function (i, o, a, s, h) {
                    return e(i, o) + t(i, a) + r(i, s) + n(i, h)
                }
            }()
        }, THREE.Audio = function (e) {
            THREE.Object3D.call(this), this.type = "Audio", this.context = e.context, this.source = this.context.createBufferSource(), this.source.onended = this.onEnded.bind(this), this.gain = this.context.createGain(), this.gain.connect(this.context.destination), this.panner = this.context.createPanner(), this.panner.connect(this.gain), this.autoplay = !1, this.startTime = 0, this.playbackRate = 1, this.isPlaying = !1
        }, THREE.Audio.prototype = Object.create(THREE.Object3D.prototype), THREE.Audio.prototype.constructor = THREE.Audio, THREE.Audio.prototype.load = function (e) {
            var t = this, r = new XMLHttpRequest; return r.open("GET", e, !0), r.responseType = "arraybuffer", r.onload = function (e) {
                t.context.decodeAudioData(this.response, function (e) {
                    t.source.buffer = e, t.autoplay && t.play()
                })
            }, r.send(), this
        }, THREE.Audio.prototype.play = function () {
            if (this.isPlaying === !0) return void console.warn("THREE.Audio: Audio is already playing."); var e = this.context.createBufferSource(); e.buffer = this.source.buffer, e.loop = this.source.loop, e.onended = this.source.onended, e.start(0, this.startTime), e.playbackRate.value = this.playbackRate, this.isPlaying = !0, this.source = e, this.connect()
        }, THREE.Audio.prototype.pause = function () {
            this.source.stop(), this.startTime = this.context.currentTime
        }, THREE.Audio.prototype.stop = function () {
            this.source.stop(), this.startTime = 0
        }, THREE.Audio.prototype.connect = function () {
            void 0 !== this.filter ? (this.source.connect(this.filter), this.filter.connect(this.panner)) : this.source.connect(this.panner)
        }, THREE.Audio.prototype.disconnect = function () {
            void 0 !== this.filter ? (this.source.disconnect(this.filter), this.filter.disconnect(this.panner)) : this.source.disconnect(this.panner)
        }, THREE.Audio.prototype.setFilter = function (e) {
            this.isPlaying === !0 ? (this.disconnect(), this.filter = e, this.connect()) : this.filter = e
        }, THREE.Audio.prototype.getFilter = function () {
            return this.filter
        }, THREE.Audio.prototype.setPlaybackRate = function (e) {
            this.playbackRate = e, this.isPlaying === !0 && (this.source.playbackRate.value = this.playbackRate)
        }, THREE.Audio.prototype.getPlaybackRate = function () {
            return this.playbackRate
        }, THREE.Audio.prototype.onEnded = function () {
            this.isPlaying = !1
        }, THREE.Audio.prototype.setLoop = function (e) {
            this.source.loop = e
        }, THREE.Audio.prototype.getLoop = function () {
            return this.source.loop
        }, THREE.Audio.prototype.setRefDistance = function (e) {
            this.panner.refDistance = e
        }, THREE.Audio.prototype.getRefDistance = function () {
            return this.panner.refDistance
        }, THREE.Audio.prototype.setRolloffFactor = function (e) {
            this.panner.rolloffFactor = e
        }, THREE.Audio.prototype.getRolloffFactor = function () {
            return this.panner.rolloffFactor
        }, THREE.Audio.prototype.setVolume = function (e) {
            this.gain.gain.value = e
        }, THREE.Audio.prototype.getVolume = function () {
            return this.gain.gain.value
        }, THREE.Audio.prototype.updateMatrixWorld = function () {
            var e = new THREE.Vector3; return function (t) {
                THREE.Object3D.prototype.updateMatrixWorld.call(this, t), e.setFromMatrixPosition(this.matrixWorld), this.panner.setPosition(e.x, e.y, e.z)
            }
        }(), THREE.AudioListener = function () {
            THREE.Object3D.call(this), this.type = "AudioListener", this.context = new (window.AudioContext || window.webkitAudioContext)
        }, THREE.AudioListener.prototype = Object.create(THREE.Object3D.prototype), THREE.AudioListener.prototype.constructor = THREE.AudioListener, THREE.AudioListener.prototype.updateMatrixWorld = function () {
            var e = new THREE.Vector3, t = new THREE.Quaternion, r = new THREE.Vector3, n = new THREE.Vector3; return function (i) {
                THREE.Object3D.prototype.updateMatrixWorld.call(this, i); var o = this.context.listener, a = this.up; this.matrixWorld.decompose(e, t, r), n.set(0, 0, -1).applyQuaternion(t), o.setPosition(e.x, e.y, e.z), o.setOrientation(n.x, n.y, n.z, a.x, a.y, a.z)
            }
        }(), THREE.Curve = function () {
        }, THREE.Curve.prototype = {
            constructor: THREE.Curve, getPoint: function (e) {
                return console.warn("THREE.Curve: Warning, getPoint() not implemented!"), null
            }, getPointAt: function (e) {
                var t = this.getUtoTmapping(e); return this.getPoint(t)
            }, getPoints: function (e) {
                e || (e = 5); var t, r = []; for (t = 0; e >= t; t++)r.push(this.getPoint(t / e)); return r
            }, getSpacedPoints: function (e) {
                e || (e = 5); var t, r = []; for (t = 0; e >= t; t++)r.push(this.getPointAt(t / e)); return r
            }, getLength: function () {
                var e = this.getLengths(); return e[e.length - 1]
            }, getLengths: function (e) {
                if (e || (e = this.__arcLengthDivisions ? this.__arcLengthDivisions : 200), this.cacheArcLengths && this.cacheArcLengths.length === e + 1 && !this.needsUpdate) return this.cacheArcLengths; this.needsUpdate = !1; var t, r, n = [], i = this.getPoint(0), o = 0; for (n.push(0), r = 1; e >= r; r++)t = this.getPoint(r / e), o += t.distanceTo(i), n.push(o), i = t; return this.cacheArcLengths = n, n
            }, updateArcLengths: function () {
                this.needsUpdate = !0, this.getLengths()
            }, getUtoTmapping: function (e, t) {
                var r, n = this.getLengths(), i = 0, o = n.length; r = t ? t : e * n[o - 1]; for (var a, s = 0, h = o - 1; h >= s;)if (i = Math.floor(s + (h - s) / 2), a = n[i] - r, 0 > a) s = i + 1; else {
                    if (!(a > 0)) {
                        h = i; break
                    } h = i - 1
                } if (i = h, n[i] === r) {
                    var c = i / (o - 1); return c
                } var u = n[i], l = n[i + 1], p = l - u, f = (r - u) / p, c = (i + f) / (o - 1); return c
            }, getTangent: function (e) {
                var t = 1e-4, r = e - t, n = e + t; 0 > r && (r = 0), n > 1 && (n = 1); var i = this.getPoint(r), o = this.getPoint(n), a = o.clone().sub(i); return a.normalize()
            }, getTangentAt: function (e) {
                var t = this.getUtoTmapping(e); return this.getTangent(t)
            }
        }, THREE.Curve.Utils = THREE.CurveUtils, THREE.Curve.create = function (e, t) {
            return e.prototype = Object.create(THREE.Curve.prototype), e.prototype.constructor = e, e.prototype.getPoint = t, e
        }, THREE.CurvePath = function () {
            this.curves = [], this.autoClose = !1
        }, THREE.CurvePath.prototype = Object.create(THREE.Curve.prototype), THREE.CurvePath.prototype.constructor = THREE.CurvePath, THREE.CurvePath.prototype.add = function (e) {
            this.curves.push(e)
        }, THREE.CurvePath.prototype.closePath = function () {
            var e = this.curves[0].getPoint(0), t = this.curves[this.curves.length - 1].getPoint(1); e.equals(t) || this.curves.push(new THREE.LineCurve(t, e))
        }, THREE.CurvePath.prototype.getPoint = function (e) {
            for (var t = e * this.getLength(), r = this.getCurveLengths(), n = 0; n < r.length;) {
                if (r[n] >= t) {
                    var i = r[n] - t, o = this.curves[n], a = 1 - i / o.getLength(); return o.getPointAt(a)
                } n++
            } return null
        }, THREE.CurvePath.prototype.getLength = function () {
            var e = this.getCurveLengths(); return e[e.length - 1]
        }, THREE.CurvePath.prototype.getCurveLengths = function () {
            if (this.cacheLengths && this.cacheLengths.length === this.curves.length) return this.cacheLengths; for (var e = [], t = 0, r = 0, n = this.curves.length; n > r; r++)t += this.curves[r].getLength(), e.push(t); return this.cacheLengths = e, e
        }, THREE.CurvePath.prototype.createPointsGeometry = function (e) {
            var t = this.getPoints(e, !0); return this.createGeometry(t)
        }, THREE.CurvePath.prototype.createSpacedPointsGeometry = function (e) {
            var t = this.getSpacedPoints(e, !0); return this.createGeometry(t)
        }, THREE.CurvePath.prototype.createGeometry = function (e) {
            for (var t = new THREE.Geometry, r = 0, n = e.length; n > r; r++) {
                var i = e[r]; t.vertices.push(new THREE.Vector3(i.x, i.y, i.z || 0))
            } return t
        }, THREE.Path = function (e) {
            THREE.CurvePath.call(this), this.actions = [], e && this.fromPoints(e)
        }, THREE.Path.prototype = Object.create(THREE.CurvePath.prototype), THREE.Path.prototype.constructor = THREE.Path, THREE.Path.prototype.fromPoints = function (e) {
            this.moveTo(e[0].x, e[0].y); for (var t = 1, r = e.length; r > t; t++)this.lineTo(e[t].x, e[t].y)
        }, THREE.Path.prototype.moveTo = function (e, t) {
            this.actions.push({
                action: "moveTo", args: [e, t]
            })
        }, THREE.Path.prototype.lineTo = function (e, t) {
            var r = this.actions[this.actions.length - 1].args, n = r[r.length - 2], i = r[r.length - 1], o = new THREE.LineCurve(new THREE.Vector2(n, i), new THREE.Vector2(e, t)); this.curves.push(o), this.actions.push({
                action: "lineTo", args: [e, t]
            })
        }, THREE.Path.prototype.quadraticCurveTo = function (e, t, r, n) {
            var i = this.actions[this.actions.length - 1].args, o = i[i.length - 2], a = i[i.length - 1], s = new THREE.QuadraticBezierCurve(new THREE.Vector2(o, a), new THREE.Vector2(e, t), new THREE.Vector2(r, n)); this.curves.push(s), this.actions.push({
                action: "quadraticCurveTo", args: [e, t, r, n]
            })
        }, THREE.Path.prototype.bezierCurveTo = function (e, t, r, n, i, o) {
            var a = this.actions[this.actions.length - 1].args, s = a[a.length - 2], h = a[a.length - 1], c = new THREE.CubicBezierCurve(new THREE.Vector2(s, h), new THREE.Vector2(e, t), new THREE.Vector2(r, n), new THREE.Vector2(i, o)); this.curves.push(c), this.actions.push({
                action: "bezierCurveTo", args: [e, t, r, n, i, o]
            })
        }, THREE.Path.prototype.splineThru = function (e) {
            var t = Array.prototype.slice.call(arguments), r = this.actions[this.actions.length - 1].args, n = r[r.length - 2], i = r[r.length - 1], o = [new THREE.Vector2(n, i)]; Array.prototype.push.apply(o, e); var a = new THREE.SplineCurve(o); this.curves.push(a), this.actions.push({
                action: "splineThru", args: t
            })
        }, THREE.Path.prototype.arc = function (e, t, r, n, i, o) {
            var a = this.actions[this.actions.length - 1].args, s = a[a.length - 2], h = a[a.length - 1]; this.absarc(e + s, t + h, r, n, i, o)
        }, THREE.Path.prototype.absarc = function (e, t, r, n, i, o) {
            this.absellipse(e, t, r, r, n, i, o)
        }, THREE.Path.prototype.ellipse = function (e, t, r, n, i, o, a, s) {
            var h = this.actions[this.actions.length - 1].args, c = h[h.length - 2], u = h[h.length - 1]; this.absellipse(e + c, t + u, r, n, i, o, a, s)
        }, THREE.Path.prototype.absellipse = function (e, t, r, n, i, o, a, s) {
            var h = [e, t, r, n, i, o, a, s || 0], c = new THREE.EllipseCurve(e, t, r, n, i, o, a, s); this.curves.push(c); var u = c.getPoint(1); h.push(u.x), h.push(u.y), this.actions.push({
                action: "ellipse", args: h
            })
        }, THREE.Path.prototype.getSpacedPoints = function (e, t) {
            e || (e = 40); for (var r = [], n = 0; e > n; n++)r.push(this.getPoint(n / e)); return r
        }, THREE.Path.prototype.getPoints = function (e, t) {
            e = e || 12; for (var r, n, i, o, a, s, h, c, u, l, p, f = THREE.ShapeUtils.b2, d = THREE.ShapeUtils.b3, E = [], m = 0, g = this.actions.length; g > m; m++) {
                var v = this.actions[m], T = v.action, y = v.args; switch (T) {
                    case "moveTo": E.push(new THREE.Vector2(y[0], y[1])); break; case "lineTo": E.push(new THREE.Vector2(y[0], y[1])); break; case "quadraticCurveTo": r = y[2], n = y[3], a = y[0], s = y[1], E.length > 0 ? (u = E[E.length - 1], h = u.x, c = u.y) : (u = this.actions[m - 1].args, h = u[u.length - 2], c = u[u.length - 1]); for (var R = 1; e >= R; R++) {
                        var x = R / e; l = f(x, h, a, r), p = f(x, c, s, n), E.push(new THREE.Vector2(l, p))
                    } break; case "bezierCurveTo": r = y[4], n = y[5], a = y[0], s = y[1], i = y[2], o = y[3], E.length > 0 ? (u = E[E.length - 1], h = u.x, c = u.y) : (u = this.actions[m - 1].args, h = u[u.length - 2], c = u[u.length - 1]); for (var R = 1; e >= R; R++) {
                        var x = R / e; l = d(x, h, a, i, r), p = d(x, c, s, o, n), E.push(new THREE.Vector2(l, p))
                    } break; case "splineThru": u = this.actions[m - 1].args; var H = new THREE.Vector2(u[u.length - 2], u[u.length - 1]), b = [H], w = e * y[0].length; b = b.concat(y[0]); for (var M = new THREE.SplineCurve(b), R = 1; w >= R; R++)E.push(M.getPointAt(R / w)); break; case "arc": for (var S, _ = y[0], C = y[1], A = y[2], L = y[3], k = y[4], P = !!y[5], D = k - L, O = 2 * e, R = 1; O >= R; R++) {
                        var x = R / O; P || (x = 1 - x), S = L + x * D, l = _ + A * Math.cos(S), p = C + A * Math.sin(S), E.push(new THREE.Vector2(l, p))
                    } break; case "ellipse": var S, F, N, _ = y[0], C = y[1], V = y[2], U = y[3], L = y[4], k = y[5], P = !!y[6], B = y[7], D = k - L, O = 2 * e; 0 !== B && (F = Math.cos(B), N = Math.sin(B)); for (var R = 1; O >= R; R++) {
                        var x = R / O; if (P || (x = 1 - x), S = L + x * D, l = _ + V * Math.cos(S), p = C + U * Math.sin(S), 0 !== B) {
                            var I = l, G = p; l = (I - _) * F - (G - C) * N + _, p = (I - _) * N + (G - C) * F + C
                        } E.push(new THREE.Vector2(l, p))
                    }
                }
            } var z = E[E.length - 1]; return Math.abs(z.x - E[0].x) < Number.EPSILON && Math.abs(z.y - E[0].y) < Number.EPSILON && E.splice(E.length - 1, 1), t && E.push(E[0]), E
        }, THREE.Path.prototype.toShapes = function (e, t) {
            function r(e) {
                for (var t = [], r = new THREE.Path, n = 0, i = e.length; i > n; n++) {
                    var o = e[n], a = o.args, s = o.action; "moveTo" === s && 0 !== r.actions.length && (t.push(r), r = new THREE.Path), r[s].apply(r, a)
                } return 0 !== r.actions.length && t.push(r), t
            } function n(e) {
                for (var t = [], r = 0, n = e.length; n > r; r++) {
                    var i = e[r], o = new THREE.Shape; o.actions = i.actions, o.curves = i.curves, t.push(o)
                } return t
            } function i(e, t) {
                for (var r = t.length, n = !1, i = r - 1, o = 0; r > o; i = o++) {
                    var a = t[i], s = t[o], h = s.x - a.x, c = s.y - a.y; if (Math.abs(c) > Number.EPSILON) {
                        if (0 > c && (a = t[o], h = -h, s = t[i], c = -c), e.y < a.y || e.y > s.y) continue; if (e.y === a.y) {
                            if (e.x === a.x) return !0
                        } else {
                            var u = c * (e.x - a.x) - h * (e.y - a.y); if (0 === u) return !0; if (0 > u) continue; n = !n
                        }
                    } else {
                        if (e.y !== a.y) continue; if (s.x <= e.x && e.x <= a.x || a.x <= e.x && e.x <= s.x) return !0
                    }
                } return n
            } var o = THREE.ShapeUtils.isClockWise, a = r(this.actions); if (0 === a.length) return []; if (t === !0) return n(a); var s, h, c, u = []; if (1 === a.length) return h = a[0], c = new THREE.Shape, c.actions = h.actions, c.curves = h.curves, u.push(c), u; var l = !o(a[0].getPoints()); l = e ? !l : l; var p, f = [], d = [], E = [], m = 0; d[m] = void 0, E[m] = []; for (var g = 0, v = a.length; v > g; g++)h = a[g], p = h.getPoints(), s = o(p), s = e ? !s : s, s ? (!l && d[m] && m++, d[m] = {
                s: new THREE.Shape, p: p
            }, d[m].s.actions = h.actions, d[m].s.curves = h.curves, l && m++, E[m] = []) : E[m].push({
                h: h, p: p[0]
            }); if (!d[0]) return n(a); if (d.length > 1) {
                for (var T = !1, y = [], R = 0, x = d.length; x > R; R++)f[R] = []; for (var R = 0, x = d.length; x > R; R++)for (var H = E[R], b = 0; b < H.length; b++) {
                    for (var w = H[b], M = !0, S = 0; S < d.length; S++)i(w.p, d[S].p) && (R !== S && y.push({
                        froms: R, tos: S, hole: b
                    }), M ? (M = !1, f[S].push(w)) : T = !0); M && f[R].push(w)
                } y.length > 0 && (T || (E = f))
            } for (var _, g = 0, C = d.length; C > g; g++) {
                c = d[g].s, u.push(c), _ = E[g]; for (var A = 0, L = _.length; L > A; A++)c.holes.push(_[A].h)
            } return u
        }, THREE.Shape = function () {
            THREE.Path.apply(this, arguments), this.holes = []
        }, THREE.Shape.prototype = Object.create(THREE.Path.prototype), THREE.Shape.prototype.constructor = THREE.Shape, THREE.Shape.prototype.extrude = function (e) {
            return new THREE.ExtrudeGeometry(this, e)
        }, THREE.Shape.prototype.makeGeometry = function (e) {
            return new THREE.ShapeGeometry(this, e)
        }, THREE.Shape.prototype.getPointsHoles = function (e) {
            for (var t = [], r = 0, n = this.holes.length; n > r; r++)t[r] = this.holes[r].getPoints(e); return t
        }, THREE.Shape.prototype.extractAllPoints = function (e) {
            return {
                shape: this.getPoints(e), holes: this.getPointsHoles(e)
            }
        }, THREE.Shape.prototype.extractPoints = function (e) {
            return this.extractAllPoints(e)
        }, THREE.Shape.Utils = THREE.ShapeUtils, THREE.LineCurve = function (e, t) {
            this.v1 = e, this.v2 = t
        }, THREE.LineCurve.prototype = Object.create(THREE.Curve.prototype), THREE.LineCurve.prototype.constructor = THREE.LineCurve, THREE.LineCurve.prototype.getPoint = function (e) {
            var t = this.v2.clone().sub(this.v1); return t.multiplyScalar(e).add(this.v1), t
        }, THREE.LineCurve.prototype.getPointAt = function (e) {
            return this.getPoint(e)
        }, THREE.LineCurve.prototype.getTangent = function (e) {
            var t = this.v2.clone().sub(this.v1); return t.normalize()
        }, THREE.QuadraticBezierCurve = function (e, t, r) {
            this.v0 = e, this.v1 = t, this.v2 = r
        }, THREE.QuadraticBezierCurve.prototype = Object.create(THREE.Curve.prototype), THREE.QuadraticBezierCurve.prototype.constructor = THREE.QuadraticBezierCurve, THREE.QuadraticBezierCurve.prototype.getPoint = function (e) {
            var t = THREE.ShapeUtils.b2; return new THREE.Vector2(t(e, this.v0.x, this.v1.x, this.v2.x), t(e, this.v0.y, this.v1.y, this.v2.y))
        }, THREE.QuadraticBezierCurve.prototype.getTangent = function (e) {
            var t = THREE.CurveUtils.tangentQuadraticBezier; return new THREE.Vector2(t(e, this.v0.x, this.v1.x, this.v2.x), t(e, this.v0.y, this.v1.y, this.v2.y)).normalize()
        }, THREE.CubicBezierCurve = function (e, t, r, n) {
            this.v0 = e, this.v1 = t, this.v2 = r, this.v3 = n
        }, THREE.CubicBezierCurve.prototype = Object.create(THREE.Curve.prototype), THREE.CubicBezierCurve.prototype.constructor = THREE.CubicBezierCurve, THREE.CubicBezierCurve.prototype.getPoint = function (e) {
            var t = THREE.ShapeUtils.b3; return new THREE.Vector2(t(e, this.v0.x, this.v1.x, this.v2.x, this.v3.x), t(e, this.v0.y, this.v1.y, this.v2.y, this.v3.y))
        }, THREE.CubicBezierCurve.prototype.getTangent = function (e) {
            var t = THREE.CurveUtils.tangentCubicBezier; return new THREE.Vector2(t(e, this.v0.x, this.v1.x, this.v2.x, this.v3.x), t(e, this.v0.y, this.v1.y, this.v2.y, this.v3.y)).normalize()
        }, THREE.SplineCurve = function (e) {
            this.points = void 0 == e ? [] : e
        }, THREE.SplineCurve.prototype = Object.create(THREE.Curve.prototype), THREE.SplineCurve.prototype.constructor = THREE.SplineCurve, THREE.SplineCurve.prototype.getPoint = function (e) {
            var t = this.points, r = (t.length - 1) * e, n = Math.floor(r), i = r - n, o = t[0 === n ? n : n - 1], a = t[n], s = t[n > t.length - 2 ? t.length - 1 : n + 1], h = t[n > t.length - 3 ? t.length - 1 : n + 2], c = THREE.CurveUtils.interpolate; return new THREE.Vector2(c(o.x, a.x, s.x, h.x, i), c(o.y, a.y, s.y, h.y, i))
        }, THREE.EllipseCurve = function (e, t, r, n, i, o, a, s) {
            this.aX = e, this.aY = t, this.xRadius = r, this.yRadius = n, this.aStartAngle = i, this.aEndAngle = o, this.aClockwise = a, this.aRotation = s || 0
        }, THREE.EllipseCurve.prototype = Object.create(THREE.Curve.prototype), THREE.EllipseCurve.prototype.constructor = THREE.EllipseCurve, THREE.EllipseCurve.prototype.getPoint = function (e) {
            var t = this.aEndAngle - this.aStartAngle; 0 > t && (t += 2 * Math.PI), t > 2 * Math.PI && (t -= 2 * Math.PI); var r; r = this.aClockwise === !0 ? this.aEndAngle + (1 - e) * (2 * Math.PI - t) : this.aStartAngle + e * t; var n = this.aX + this.xRadius * Math.cos(r), i = this.aY + this.yRadius * Math.sin(r); if (0 !== this.aRotation) {
                var o = Math.cos(this.aRotation), a = Math.sin(this.aRotation), s = n, h = i; n = (s - this.aX) * o - (h - this.aY) * a + this.aX, i = (s - this.aX) * a + (h - this.aY) * o + this.aY
            } return new THREE.Vector2(n, i)
        }, THREE.ArcCurve = function (e, t, r, n, i, o) {
            THREE.EllipseCurve.call(this, e, t, r, r, n, i, o)
        }, THREE.ArcCurve.prototype = Object.create(THREE.EllipseCurve.prototype), THREE.ArcCurve.prototype.constructor = THREE.ArcCurve, THREE.LineCurve3 = THREE.Curve.create(function (e, t) {
            this.v1 = e, this.v2 = t
        }, function (e) {
            var t = new THREE.Vector3; return t.subVectors(this.v2, this.v1), t.multiplyScalar(e), t.add(this.v1), t
        }), THREE.QuadraticBezierCurve3 = THREE.Curve.create(function (e, t, r) {
            this.v0 = e, this.v1 = t, this.v2 = r
        }, function (e) {
            var t = THREE.ShapeUtils.b2; return new THREE.Vector3(t(e, this.v0.x, this.v1.x, this.v2.x), t(e, this.v0.y, this.v1.y, this.v2.y), t(e, this.v0.z, this.v1.z, this.v2.z))
        }), THREE.CubicBezierCurve3 = THREE.Curve.create(function (e, t, r, n) {
            this.v0 = e, this.v1 = t, this.v2 = r, this.v3 = n
        }, function (e) {
            var t = THREE.ShapeUtils.b3; return new THREE.Vector3(t(e, this.v0.x, this.v1.x, this.v2.x, this.v3.x), t(e, this.v0.y, this.v1.y, this.v2.y, this.v3.y), t(e, this.v0.z, this.v1.z, this.v2.z, this.v3.z))
        }), THREE.SplineCurve3 = THREE.Curve.create(function (e) {
            console.warn("THREE.SplineCurve3 will be deprecated. Please use THREE.CatmullRomCurve3"), this.points = void 0 == e ? [] : e
        }, function (e) {
            var t = this.points, r = (t.length - 1) * e, n = Math.floor(r), i = r - n, o = t[0 == n ? n : n - 1], a = t[n], s = t[n > t.length - 2 ? t.length - 1 : n + 1], h = t[n > t.length - 3 ? t.length - 1 : n + 2], c = THREE.CurveUtils.interpolate; return new THREE.Vector3(c(o.x, a.x, s.x, h.x, i), c(o.y, a.y, s.y, h.y, i), c(o.z, a.z, s.z, h.z, i))
        }), THREE.CatmullRomCurve3 = function () {
            function e() {
            } var t = new THREE.Vector3, r = new e, n = new e, i = new e; return e.prototype.init = function (e, t, r, n) {
                this.c0 = e, this.c1 = r, this.c2 = -3 * e + 3 * t - 2 * r - n, this.c3 = 2 * e - 2 * t + r + n
            }, e.prototype.initNonuniformCatmullRom = function (e, t, r, n, i, o, a) {
                var s = (t - e) / i - (r - e) / (i + o) + (r - t) / o, h = (r - t) / o - (n - t) / (o + a) + (n - r) / a; s *= o, h *= o, this.init(t, r, s, h)
            }, e.prototype.initCatmullRom = function (e, t, r, n, i) {
                this.init(t, r, i * (r - e), i * (n - t))
            }, e.prototype.calc = function (e) {
                var t = e * e, r = t * e; return this.c0 + this.c1 * e + this.c2 * t + this.c3 * r
            }, THREE.Curve.create(function (e) {
                this.points = e || []
            }, function (e) {
                var o, a, s, h, c = this.points; h = c.length, 2 > h && console.log("duh, you need at least 2 points"), o = (h - 1) * e, a = Math.floor(o), s = o - a, 0 === s && a === h - 1 && (a = h - 2, s = 1); var u, l, p, f; if (0 === a ? (t.subVectors(c[0], c[1]).add(c[0]), u = t) : u = c[a - 1], l = c[a], p = c[a + 1], h > a + 2 ? f = c[a + 2] : (t.subVectors(c[h - 1], c[h - 2]).add(c[h - 2]), f = t), void 0 === this.type || "centripetal" === this.type || "chordal" === this.type) {
                    var d = "chordal" === this.type ? .5 : .25, E = Math.pow(u.distanceToSquared(l), d), m = Math.pow(l.distanceToSquared(p), d), g = Math.pow(p.distanceToSquared(f), d); 1e-4 > m && (m = 1), 1e-4 > E && (E = m), 1e-4 > g && (g = m), r.initNonuniformCatmullRom(u.x, l.x, p.x, f.x, E, m, g), n.initNonuniformCatmullRom(u.y, l.y, p.y, f.y, E, m, g), i.initNonuniformCatmullRom(u.z, l.z, p.z, f.z, E, m, g)
                } else if ("catmullrom" === this.type) {
                    var v = void 0 !== this.tension ? this.tension : .5; r.initCatmullRom(u.x, l.x, p.x, f.x, v), n.initCatmullRom(u.y, l.y, p.y, f.y, v), i.initCatmullRom(u.z, l.z, p.z, f.z, v)
                } var T = new THREE.Vector3(r.calc(s), n.calc(s), i.calc(s)); return T
            })
        }(), THREE.ClosedSplineCurve3 = THREE.Curve.create(function (e) {
            this.points = void 0 == e ? [] : e
        }, function (e) {
            var t = this.points, r = (t.length - 0) * e, n = Math.floor(r), i = r - n; n += n > 0 ? 0 : (Math.floor(Math.abs(n) / t.length) + 1) * t.length; var o = t[(n - 1) % t.length], a = t[n % t.length], s = t[(n + 1) % t.length], h = t[(n + 2) % t.length], c = THREE.CurveUtils.interpolate; return new THREE.Vector3(c(o.x, a.x, s.x, h.x, i), c(o.y, a.y, s.y, h.y, i), c(o.z, a.z, s.z, h.z, i))
        }), THREE.BoxGeometry = function (e, t, r, n, i, o) {
            function a(e, t, r, n, i, o, a, h) {
                var c, u, l, p = s.widthSegments, f = s.heightSegments, d = i / 2, E = o / 2, m = s.vertices.length; "x" === e && "y" === t || "y" === e && "x" === t ? c = "z" : "x" === e && "z" === t || "z" === e && "x" === t ? (c = "y", f = s.depthSegments) : ("z" === e && "y" === t || "y" === e && "z" === t) && (c = "x", p = s.depthSegments); var g = p + 1, v = f + 1, T = i / p, y = o / f, R = new THREE.Vector3; for (R[c] = a > 0 ? 1 : -1, l = 0; v > l; l++)for (u = 0; g > u; u++) {
                    var x = new THREE.Vector3; x[e] = (u * T - d) * r, x[t] = (l * y - E) * n, x[c] = a, s.vertices.push(x)
                } for (l = 0; f > l; l++)for (u = 0; p > u; u++) {
                    var H = u + g * l, b = u + g * (l + 1), w = u + 1 + g * (l + 1), M = u + 1 + g * l, S = new THREE.Vector2(u / p, 1 - l / f), _ = new THREE.Vector2(u / p, 1 - (l + 1) / f), C = new THREE.Vector2((u + 1) / p, 1 - (l + 1) / f), A = new THREE.Vector2((u + 1) / p, 1 - l / f), L = new THREE.Face3(H + m, b + m, M + m); L.normal.copy(R), L.vertexNormals.push(R.clone(), R.clone(), R.clone()), L.materialIndex = h, s.faces.push(L), s.faceVertexUvs[0].push([S, _, A]), L = new THREE.Face3(b + m, w + m, M + m), L.normal.copy(R), L.vertexNormals.push(R.clone(), R.clone(), R.clone()), L.materialIndex = h, s.faces.push(L), s.faceVertexUvs[0].push([_.clone(), C, A.clone()])
                }
            } THREE.Geometry.call(this), this.type = "BoxGeometry", this.parameters = {
            
                width: e,
                height: t,
                depth: r,
                widthSegments: 60,
                heightSegments: 60,
                depthSegments: o
            }, this.widthSegments = n || 1, this.heightSegments = i || 1, this.depthSegments = o || 1; var s = this, h = e / 2, c = t / 2, u = r / 2; a("z", "y", -1, -1, r, t, h, 0), a("z", "y", 1, -1, r, t, -h, 1), a("x", "z", 1, 1, e, r, c, 2), a("x", "z", 1, -1, e, r, -c, 3), a("x", "y", 1, -1, e, t, u, 4), a("x", "y", -1, -1, e, t, -u, 5), this.mergeVertices()
        }, THREE.BoxGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.BoxGeometry.prototype.constructor = THREE.BoxGeometry, THREE.BoxGeometry.prototype.clone = function () {
            var e = this.parameters; return new THREE.BoxGeometry(e.width, e.height, e.depth, e.widthSegments, e.heightSegments, e.depthSegments)
        }, THREE.CubeGeometry = THREE.BoxGeometry, THREE.CircleGeometry = function (e, t, r, n) {
            THREE.Geometry.call(this), this.type = "CircleGeometry", this.parameters = {
                radius: e, segments: t, thetaStart: r, thetaLength: n
            }, this.fromBufferGeometry(new THREE.CircleBufferGeometry(e, t, r, n))
        }, THREE.CircleGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.CircleGeometry.prototype.constructor = THREE.CircleGeometry, THREE.CircleGeometry.prototype.clone = function () {
            var e = this.parameters; return new THREE.CircleGeometry(e.radius, e.segments, e.thetaStart, e.thetaLength)
        }, THREE.CircleBufferGeometry = function (e, t, r, n) {
            THREE.BufferGeometry.call(this), this.type = "CircleBufferGeometry", this.parameters = {
                radius: e, segments: t, thetaStart: r, thetaLength: n
            }, e = e || 50, t = void 0 !== t ? Math.max(3, t) : 8, r = void 0 !== r ? r : 0, n = void 0 !== n ? n : 2 * Math.PI; var i = t + 2, o = new Float32Array(3 * i), a = new Float32Array(3 * i), s = new Float32Array(2 * i); a[2] = 1, s[0] = .5, s[1] = .5; for (var h = 0, c = 3, u = 2; t >= h; h++, c += 3, u += 2) {
                var l = r + h / t * n; o[c] = e * Math.cos(l), o[c + 1] = e * Math.sin(l), a[c + 2] = 1, s[u] = (o[c] / e + 1) / 2, s[u + 1] = (o[c + 1] / e + 1) / 2
            } for (var p = [], c = 1; t >= c; c++)p.push(c, c + 1, 0); this.setIndex(new THREE.BufferAttribute(new Uint16Array(p), 1)), this.addAttribute("position", new THREE.BufferAttribute(o, 3)), this.addAttribute("normal", new THREE.BufferAttribute(a, 3)), this.addAttribute("uv", new THREE.BufferAttribute(s, 2)), this.boundingSphere = new THREE.Sphere(new THREE.Vector3, e)
        }, THREE.CircleBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.CircleBufferGeometry.prototype.constructor = THREE.CircleBufferGeometry, THREE.CircleBufferGeometry.prototype.clone = function () {
            var e = this.parameters; return new THREE.CircleBufferGeometry(e.radius, e.segments, e.thetaStart, e.thetaLength)
        }, THREE.CylinderGeometry = function (e, t, r, n, i, o, a, s) {
            THREE.Geometry.call(this), this.type = "CylinderGeometry", this.parameters = {
                radiusTop: e, radiusBottom: t, height: r, radialSegments: n, heightSegments: i, openEnded: o, thetaStart: a, thetaLength: s
            }, e = void 0 !== e ? e : 20, t = void 0 !== t ? t : 20, r = void 0 !== r ? r : 100, n = n || 8, i = i || 1, o = void 0 !== o ? o : !1, a = void 0 !== a ? a : 0, s = void 0 !== s ? s : 2 * Math.PI; var h, c, u = r / 2, l = [], p = []; for (c = 0; i >= c; c++) {
                var f = [], d = [], E = c / i, m = E * (t - e) + e; for (h = 0; n >= h; h++) {
                    var g = h / n, v = new THREE.Vector3; v.x = m * Math.sin(g * s + a), v.y = -E * r + u, v.z = m * Math.cos(g * s + a), this.vertices.push(v), f.push(this.vertices.length - 1), d.push(new THREE.Vector2(g, 1 - E))
                } l.push(f), p.push(d)
            } var T, y, R = (t - e) / r; for (h = 0; n > h; h++)for (0 !== e ? (T = this.vertices[l[0][h]].clone(), y = this.vertices[l[0][h + 1]].clone()) : (T = this.vertices[l[1][h]].clone(), y = this.vertices[l[1][h + 1]].clone()), T.setY(Math.sqrt(T.x * T.x + T.z * T.z) * R).normalize(), y.setY(Math.sqrt(y.x * y.x + y.z * y.z) * R).normalize(), c = 0; i > c; c++) {
                var x = l[c][h], H = l[c + 1][h], b = l[c + 1][h + 1], w = l[c][h + 1], M = T.clone(), S = T.clone(), _ = y.clone(), C = y.clone(), A = p[c][h].clone(), L = p[c + 1][h].clone(), k = p[c + 1][h + 1].clone(), P = p[c][h + 1].clone(); this.faces.push(new THREE.Face3(x, H, w, [M, S, C])), this.faceVertexUvs[0].push([A, L, P]), this.faces.push(new THREE.Face3(H, b, w, [S.clone(), _, C.clone()])), this.faceVertexUvs[0].push([L.clone(), k, P.clone()])
            } if (o === !1 && e > 0) for (this.vertices.push(new THREE.Vector3(0, u, 0)), h = 0; n > h; h++) {
                var x = l[0][h], H = l[0][h + 1], b = this.vertices.length - 1, M = new THREE.Vector3(0, 1, 0), S = new THREE.Vector3(0, 1, 0), _ = new THREE.Vector3(0, 1, 0), A = p[0][h].clone(), L = p[0][h + 1].clone(), k = new THREE.Vector2(L.x, 0);
                this.faces.push(new THREE.Face3(x, H, b, [M, S, _], void 0, 1)), this.faceVertexUvs[0].push([A, L, k])
            } if (o === !1 && t > 0) for (this.vertices.push(new THREE.Vector3(0, -u, 0)), h = 0; n > h; h++) {
                var x = l[i][h + 1], H = l[i][h], b = this.vertices.length - 1, M = new THREE.Vector3(0, -1, 0), S = new THREE.Vector3(0, -1, 0), _ = new THREE.Vector3(0, -1, 0), A = p[i][h + 1].clone(), L = p[i][h].clone(), k = new THREE.Vector2(L.x, 1); this.faces.push(new THREE.Face3(x, H, b, [M, S, _], void 0, 2)), this.faceVertexUvs[0].push([A, L, k])
            } this.computeFaceNormals()
        }, THREE.CylinderGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.CylinderGeometry.prototype.constructor = THREE.CylinderGeometry, THREE.CylinderGeometry.prototype.clone = function () {
            var e = this.parameters; return new THREE.CylinderGeometry(e.radiusTop, e.radiusBottom, e.height, e.radialSegments, e.heightSegments, e.openEnded, e.thetaStart, e.thetaLength)
        }, THREE.EdgesGeometry = function (e, t) {
            function r(e, t) {
                return e - t
            } THREE.BufferGeometry.call(this), t = void 0 !== t ? t : 1; var n, i = Math.cos(THREE.Math.degToRad(t)), o = [0, 0], a = {}, s = ["a", "b", "c"]; e instanceof THREE.BufferGeometry ? (n = new THREE.Geometry, n.fromBufferGeometry(e)) : n = e.clone(), n.mergeVertices(), n.computeFaceNormals(); for (var h = n.vertices, c = n.faces, u = 0, l = c.length; l > u; u++)for (var p = c[u], f = 0; 3 > f; f++) {
                o[0] = p[s[f]], o[1] = p[s[(f + 1) % 3]], o.sort(r); var d = o.toString(); void 0 === a[d] ? a[d] = {
                    vert1: o[0], vert2: o[1], face1: u, face2: void 0
                } : a[d].face2 = u
            } var E = []; for (var d in a) {
                var m = a[d]; if (void 0 === m.face2 || c[m.face1].normal.dot(c[m.face2].normal) <= i) {
                    var g = h[m.vert1]; E.push(g.x), E.push(g.y), E.push(g.z), g = h[m.vert2], E.push(g.x), E.push(g.y), E.push(g.z)
                }
            } this.addAttribute("position", new THREE.BufferAttribute(new Float32Array(E), 3))
        }, THREE.EdgesGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.EdgesGeometry.prototype.constructor = THREE.EdgesGeometry, THREE.ExtrudeGeometry = function (e, t) {
            return "undefined" == typeof e ? void (e = []) : (THREE.Geometry.call(this), this.type = "ExtrudeGeometry", e = Array.isArray(e) ? e : [e], this.addShapeList(e, t), void this.computeFaceNormals())
        }, THREE.ExtrudeGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.ExtrudeGeometry.prototype.constructor = THREE.ExtrudeGeometry, THREE.ExtrudeGeometry.prototype.addShapeList = function (e, t) {
            for (var r = e.length, n = 0; r > n; n++) {
                var i = e[n]; this.addShape(i, t)
            }
        }, THREE.ExtrudeGeometry.prototype.addShape = function (e, t) {
            function r(e, t, r) {
                return t || console.error("THREE.ExtrudeGeometry: vec does not exist"), t.clone().multiplyScalar(r).add(e)
            } function n(e, t, r) {
                var n, i, o = 1, a = e.x - t.x, s = e.y - t.y, h = r.x - e.x, c = r.y - e.y, u = a * a + s * s, l = a * c - s * h; if (Math.abs(l) > Number.EPSILON) {
                    var p = Math.sqrt(u), f = Math.sqrt(h * h + c * c), d = t.x - s / p, E = t.y + a / p, m = r.x - c / f, g = r.y + h / f, v = ((m - d) * c - (g - E) * h) / (a * c - s * h); n = d + a * v - e.x, i = E + s * v - e.y; var T = n * n + i * i; if (2 >= T) return new THREE.Vector2(n, i); o = Math.sqrt(T / 2)
                } else {
                    var y = !1; a > Number.EPSILON ? h > Number.EPSILON && (y = !0) : a < -Number.EPSILON ? h < -Number.EPSILON && (y = !0) : Math.sign(s) === Math.sign(c) && (y = !0), y ? (n = -s, i = a, o = Math.sqrt(u)) : (n = a, i = s, o = Math.sqrt(u / 2))
                } return new THREE.Vector2(n / o, i / o)
            } function i() {
                if (T) {
                    var e = 0, t = G * e; for (W = 0; z > W; W++)I = D[W], h(I[2] + t, I[1] + t, I[0] + t); for (e = R + 2 * v, t = G * e, W = 0; z > W; W++)I = D[W], h(I[0] + t, I[1] + t, I[2] + t)
                } else {
                    for (W = 0; z > W; W++)I = D[W], h(I[2], I[1], I[0]); for (W = 0; z > W; W++)I = D[W], h(I[0] + G * R, I[1] + G * R, I[2] + G * R)
                }
            } function o() {
                var e = 0; for (a(O, e), e += O.length, M = 0, S = k.length; S > M; M++)w = k[M], a(w, e), e += w.length
            } function a(e, t) {
                var r, n; for (W = e.length; --W >= 0;) {
                    r = W, n = W - 1, 0 > n && (n = e.length - 1); var i = 0, o = R + 2 * v; for (i = 0; o > i; i++) {
                        var a = G * i, s = G * (i + 1), h = t + r + a, u = t + n + a, l = t + n + s, p = t + r + s; c(h, u, l, p, e, i, o, r, n)
                    }
                }
            } function s(e, t, r) {
                _.vertices.push(new THREE.Vector3(e, t, r))
            } function h(e, t, r) {
                e += C, t += C, r += C, _.faces.push(new THREE.Face3(e, t, r, null, null, 0)); var n = b.generateTopUV(_, e, t, r); _.faceVertexUvs[0].push(n)
            } function c(e, t, r, n, i, o, a, s, h) {
                e += C, t += C, r += C, n += C, _.faces.push(new THREE.Face3(e, t, n, null, null, 1)), _.faces.push(new THREE.Face3(t, r, n, null, null, 1)); var c = b.generateSideWallUV(_, e, t, r, n); _.faceVertexUvs[0].push([c[0], c[1], c[3]]), _.faceVertexUvs[0].push([c[1], c[2], c[3]])
            } var u, l, p, f, d, E = void 0 !== t.amount ? t.amount : 100, m = void 0 !== t.bevelThickness ? t.bevelThickness : 6, g = void 0 !== t.bevelSize ? t.bevelSize : m - 2, v = void 0 !== t.bevelSegments ? t.bevelSegments : 3, T = void 0 !== t.bevelEnabled ? t.bevelEnabled : !0, y = void 0 !== t.curveSegments ? t.curveSegments : 12, R = void 0 !== t.steps ? t.steps : 1, x = t.extrudePath, H = !1, b = void 0 !== t.UVGenerator ? t.UVGenerator : THREE.ExtrudeGeometry.WorldUVGenerator; x && (u = x.getSpacedPoints(R), H = !0, T = !1, l = void 0 !== t.frames ? t.frames : new THREE.TubeGeometry.FrenetFrames(x, R, !1), p = new THREE.Vector3, f = new THREE.Vector3, d = new THREE.Vector3), T || (v = 0, m = 0, g = 0); var w, M, S, _ = this, C = this.vertices.length, A = e.extractPoints(y), L = A.shape, k = A.holes, P = !THREE.ShapeUtils.isClockWise(L); if (P) {
                for (L = L.reverse(), M = 0, S = k.length; S > M; M++)w = k[M], THREE.ShapeUtils.isClockWise(w) && (k[M] = w.reverse()); P = !1
            } var D = THREE.ShapeUtils.triangulateShape(L, k), O = L; for (M = 0, S = k.length; S > M; M++)w = k[M], L = L.concat(w); for (var F, N, V, U, B, I, G = L.length, z = D.length, j = [], W = 0, X = O.length, q = X - 1, Y = W + 1; X > W; W++, q++, Y++)q === X && (q = 0), Y === X && (Y = 0), j[W] = n(O[W], O[q], O[Y]); var K, $ = [], Z = j.concat(); for (M = 0, S = k.length; S > M; M++) {
                for (w = k[M], K = [], W = 0, X = w.length, q = X - 1, Y = W + 1; X > W; W++, q++, Y++)q === X && (q = 0), Y === X && (Y = 0), K[W] = n(w[W], w[q], w[Y]); $.push(K), Z = Z.concat(K)
            } for (F = 0; v > F; F++) {
                for (V = F / v, U = m * (1 - V), N = g * Math.sin(V * Math.PI / 2), W = 0, X = O.length; X > W; W++)B = r(O[W], j[W], N), s(B.x, B.y, -U); for (M = 0, S = k.length; S > M; M++)for (w = k[M], K = $[M], W = 0, X = w.length; X > W; W++)B = r(w[W], K[W], N), s(B.x, B.y, -U)
            } for (N = g, W = 0; G > W; W++)B = T ? r(L[W], Z[W], N) : L[W], H ? (f.copy(l.normals[0]).multiplyScalar(B.x), p.copy(l.binormals[0]).multiplyScalar(B.y), d.copy(u[0]).add(f).add(p), s(d.x, d.y, d.z)) : s(B.x, B.y, 0); var Q; for (Q = 1; R >= Q; Q++)for (W = 0; G > W; W++)B = T ? r(L[W], Z[W], N) : L[W], H ? (f.copy(l.normals[Q]).multiplyScalar(B.x), p.copy(l.binormals[Q]).multiplyScalar(B.y), d.copy(u[Q]).add(f).add(p), s(d.x, d.y, d.z)) : s(B.x, B.y, E / R * Q); for (F = v - 1; F >= 0; F--) {
                for (V = F / v, U = m * (1 - V), N = g * Math.sin(V * Math.PI / 2), W = 0, X = O.length; X > W; W++)B = r(O[W], j[W], N), s(B.x, B.y, E + U); for (M = 0, S = k.length; S > M; M++)for (w = k[M], K = $[M], W = 0, X = w.length; X > W; W++)B = r(w[W], K[W], N), H ? s(B.x, B.y + u[R - 1].y, u[R - 1].x + U) : s(B.x, B.y, E + U)
            } i(), o()
        }, THREE.ExtrudeGeometry.WorldUVGenerator = {
            generateTopUV: function (e, t, r, n) {
                var i = e.vertices, o = i[t], a = i[r], s = i[n]; return [new THREE.Vector2(o.x, o.y), new THREE.Vector2(a.x, a.y), new THREE.Vector2(s.x, s.y)]
            }, generateSideWallUV: function (e, t, r, n, i) {
                var o = e.vertices, a = o[t], s = o[r], h = o[n], c = o[i]; return Math.abs(a.y - s.y) < .01 ? [new THREE.Vector2(a.x, 1 - a.z), new THREE.Vector2(s.x, 1 - s.z), new THREE.Vector2(h.x, 1 - h.z), new THREE.Vector2(c.x, 1 - c.z)] : [new THREE.Vector2(a.y, 1 - a.z), new THREE.Vector2(s.y, 1 - s.z), new THREE.Vector2(h.y, 1 - h.z), new THREE.Vector2(c.y, 1 - c.z)]
            }
        }, THREE.ShapeGeometry = function (e, t) {
            THREE.Geometry.call(this), this.type = "ShapeGeometry", Array.isArray(e) === !1 && (e = [e]), this.addShapeList(e, t), this.computeFaceNormals()
        }, THREE.ShapeGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.ShapeGeometry.prototype.constructor = THREE.ShapeGeometry, THREE.ShapeGeometry.prototype.addShapeList = function (e, t) {
            for (var r = 0, n = e.length; n > r; r++)this.addShape(e[r], t); return this
        }, THREE.ShapeGeometry.prototype.addShape = function (e, t) {
            void 0 === t && (t = {}); var r, n, i, o = void 0 !== t.curveSegments ? t.curveSegments : 12, a = t.material, s = void 0 === t.UVGenerator ? THREE.ExtrudeGeometry.WorldUVGenerator : t.UVGenerator, h = this.vertices.length, c = e.extractPoints(o), u = c.shape, l = c.holes, p = !THREE.ShapeUtils.isClockWise(u); if (p) {
                for (u = u.reverse(), r = 0, n = l.length; n > r; r++)i = l[r], THREE.ShapeUtils.isClockWise(i) && (l[r] = i.reverse()); p = !1
            } var f = THREE.ShapeUtils.triangulateShape(u, l); for (r = 0, n = l.length; n > r; r++)i = l[r], u = u.concat(i); var d, E, m = u.length, g = f.length; for (r = 0; m > r; r++)d = u[r], this.vertices.push(new THREE.Vector3(d.x, d.y, 0)); for (r = 0; g > r; r++) {
                E = f[r]; var v = E[0] + h, T = E[1] + h, y = E[2] + h; this.faces.push(new THREE.Face3(v, T, y, null, null, a)), this.faceVertexUvs[0].push(s.generateTopUV(this, v, T, y))
            }
        }, THREE.LatheGeometry = function (e, t, r, n) {
            THREE.Geometry.call(this), this.type = "LatheGeometry", this.parameters = {
                points: e, segments: t, phiStart: r, phiLength: n
            }, t = t || 12, r = r || 0, n = n || 2 * Math.PI; for (var i = 1 / (e.length - 1), o = 1 / t, a = 0, s = t; s >= a; a++)for (var h = r + a * o * n, c = Math.cos(h), u = Math.sin(h), l = 0, p = e.length; p > l; l++) {
                var f = e[l], d = new THREE.Vector3; d.x = c * f.x - u * f.y, d.y = u * f.x + c * f.y, d.z = f.z, this.vertices.push(d)
            } for (var E = e.length, a = 0, s = t; s > a; a++)for (var l = 0, p = e.length - 1; p > l; l++) {
                var m = l + E * a, g = m, v = m + E, c = m + 1 + E, T = m + 1, y = a * o, R = l * i, x = y + o, H = R + i; this.faces.push(new THREE.Face3(g, v, T)), this.faceVertexUvs[0].push([new THREE.Vector2(y, R), new THREE.Vector2(x, R), new THREE.Vector2(y, H)]), this.faces.push(new THREE.Face3(v, c, T)), this.faceVertexUvs[0].push([new THREE.Vector2(x, R), new THREE.Vector2(x, H), new THREE.Vector2(y, H)])
            } this.mergeVertices(), this.computeFaceNormals(), this.computeVertexNormals()
        }, THREE.LatheGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.LatheGeometry.prototype.constructor = THREE.LatheGeometry, THREE.PlaneGeometry = function (e, t, r, n) {
            THREE.Geometry.call(this), this.type = "PlaneGeometry", this.parameters = {
                width: e, height: t, widthSegments: r, heightSegments: n
            }, this.fromBufferGeometry(new THREE.PlaneBufferGeometry(e, t, r, n))
        }, THREE.PlaneGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.PlaneGeometry.prototype.constructor = THREE.PlaneGeometry, THREE.PlaneGeometry.prototype.clone = function () {
            var e = this.parameters; return new THREE.PlaneGeometry(e.width, e.height, e.widthSegments, e.heightSegments)
        }, THREE.PlaneBufferGeometry = function (e, t, r, n) {
            THREE.BufferGeometry.call(this), this.type = "PlaneBufferGeometry", this.parameters = {
                width: e, height: t, widthSegments: r, heightSegments: n
            }; for (var i = e / 2, o = t / 2, a = Math.floor(r) || 1, s = Math.floor(n) || 1, h = a + 1, c = s + 1, u = e / a, l = t / s, p = new Float32Array(h * c * 3), f = new Float32Array(h * c * 3), d = new Float32Array(h * c * 2), E = 0, m = 0, g = 0; c > g; g++)for (var v = g * l - o, T = 0; h > T; T++) {
                var y = T * u - i; p[E] = y, p[E + 1] = -v, f[E + 2] = 1, d[m] = T / a, d[m + 1] = 1 - g / s, E += 3, m += 2
            } E = 0; for (var R = new (p.length / 3 > 65535 ? Uint32Array : Uint16Array)(a * s * 6), g = 0; s > g; g++)for (var T = 0; a > T; T++) {
                var x = T + h * g, H = T + h * (g + 1), b = T + 1 + h * (g + 1), w = T + 1 + h * g; R[E] = x, R[E + 1] = H, R[E + 2] = w, R[E + 3] = H, R[E + 4] = b, R[E + 5] = w, E += 6
            } this.setIndex(new THREE.BufferAttribute(R, 1)), this.addAttribute("position", new THREE.BufferAttribute(p, 3)), this.addAttribute("normal", new THREE.BufferAttribute(f, 3)), this.addAttribute("uv", new THREE.BufferAttribute(d, 2))
        }, THREE.PlaneBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.PlaneBufferGeometry.prototype.constructor = THREE.PlaneBufferGeometry, THREE.PlaneBufferGeometry.prototype.clone = function () {
            var e = this.parameters; return new THREE.PlaneBufferGeometry(e.width, e.height, e.widthSegments, e.heightSegments)
        }, THREE.RingGeometry = function (e, t, r, n, i, o) {
            THREE.Geometry.call(this), this.type = "RingGeometry", this.parameters = {
                innerRadius: e, outerRadius: t, thetaSegments: r, phiSegments: n, thetaStart: i, thetaLength: o
            }, e = e || 0, t = t || 50, i = void 0 !== i ? i : 0, o = void 0 !== o ? o : 2 * Math.PI, r = void 0 !== r ? Math.max(3, r) : 8, n = void 0 !== n ? Math.max(1, n) : 8; var a, s, h = [], c = e, u = (t - e) / n; for (a = 0; n + 1 > a; a++) {
                for (s = 0; r + 1 > s; s++) {
                    var l = new THREE.Vector3, p = i + s / r * o; l.x = c * Math.cos(p), l.y = c * Math.sin(p), this.vertices.push(l), h.push(new THREE.Vector2((l.x / t + 1) / 2, (l.y / t + 1) / 2))
                } c += u
            } var f = new THREE.Vector3(0, 0, 1); for (a = 0; n > a; a++) {
                var d = a * (r + 1); for (s = 0; r > s; s++) {
                    var p = s + d, E = p, m = p + r + 1, g = p + r + 2; this.faces.push(new THREE.Face3(E, m, g, [f.clone(), f.clone(), f.clone()])), this.faceVertexUvs[0].push([h[E].clone(), h[m].clone(), h[g].clone()]), E = p, m = p + r + 2, g = p + 1, this.faces.push(new THREE.Face3(E, m, g, [f.clone(), f.clone(), f.clone()])), this.faceVertexUvs[0].push([h[E].clone(), h[m].clone(), h[g].clone()])
                }
            } this.computeFaceNormals(), this.boundingSphere = new THREE.Sphere(new THREE.Vector3, c)
        }, THREE.RingGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.RingGeometry.prototype.constructor = THREE.RingGeometry, THREE.RingGeometry.prototype.clone = function () {
            var e = this.parameters; return new THREE.RingGeometry(e.innerRadius, e.outerRadius, e.thetaSegments, e.phiSegments, e.thetaStart, e.thetaLength)
        }, THREE.SphereGeometry = function (e, t, r, n, i, o, a) {
            THREE.Geometry.call(this), this.type = "SphereGeometry", this.parameters = {
                radius: e, widthSegments: t, heightSegments: r, phiStart: n, phiLength: i, thetaStart: o, thetaLength: a
            }, this.fromBufferGeometry(new THREE.SphereBufferGeometry(e, t, r, n, i, o, a))
        }, THREE.SphereGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.SphereGeometry.prototype.constructor = THREE.SphereGeometry, THREE.SphereGeometry.prototype.clone = function () {
            var e = this.parameters; return new THREE.SphereGeometry(e.radius, e.widthSegments, e.heightSegments, e.phiStart, e.phiLength, e.thetaStart, e.thetaLength)
        }, THREE.SphereBufferGeometry = function (e, t, r, n, i, o, a) {
            THREE.BufferGeometry.call(this), this.type = "SphereBufferGeometry", this.parameters = {
                radius: e, widthSegments: t, heightSegments: r, phiStart: n, phiLength: i, thetaStart: o, thetaLength: a
            }, e = e || 50, t = Math.max(3, Math.floor(t) || 8), r = Math.max(2, Math.floor(r) || 6), n = void 0 !== n ? n : 0, i = void 0 !== i ? i : 2 * Math.PI, o = void 0 !== o ? o : 0, a = void 0 !== a ? a : Math.PI; for (var s = o + a, h = (t + 1) * (r + 1), c = new THREE.BufferAttribute(new Float32Array(3 * h), 3), u = new THREE.BufferAttribute(new Float32Array(3 * h), 3), l = new THREE.BufferAttribute(new Float32Array(2 * h), 2), p = 0, f = [], d = new THREE.Vector3, E = 0; r >= E; E++) {
                for (var m = [], g = E / r, v = 0; t >= v; v++) {
                    var T = v / t, y = -e * Math.cos(n + T * i) * Math.sin(o + g * a), R = e * Math.cos(o + g * a), x = e * Math.sin(n + T * i) * Math.sin(o + g * a); d.set(y, R, x).normalize(), c.setXYZ(p, y, R, x), u.setXYZ(p, d.x, d.y, d.z), l.setXY(p, T, 1 - g), m.push(p), p++
                } f.push(m)
            } for (var H = [], E = 0; r > E; E++)for (var v = 0; t > v; v++) {
                var b = f[E][v + 1], w = f[E][v], M = f[E + 1][v], S = f[E + 1][v + 1]; (0 !== E || o > 0) && H.push(b, w, S), (E !== r - 1 || s < Math.PI) && H.push(w, M, S)
            } this.setIndex(new (c.count > 65535 ? THREE.Uint32Attribute : THREE.Uint16Attribute)(H, 1)), this.addAttribute("position", c), this.addAttribute("normal", u), this.addAttribute("uv", l), this.boundingSphere = new THREE.Sphere(new THREE.Vector3, e)
        }, THREE.SphereBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.SphereBufferGeometry.prototype.constructor = THREE.SphereBufferGeometry, THREE.SphereBufferGeometry.prototype.clone = function () {
            var e = this.parameters; return new THREE.SphereBufferGeometry(e.radius, e.widthSegments, e.heightSegments, e.phiStart, e.phiLength, e.thetaStart, e.thetaLength)
        }, THREE.TorusGeometry = function (e, t, r, n, i) {
            THREE.Geometry.call(this), this.type = "TorusGeometry", this.parameters = {
                radius: e, tube: t, radialSegments: r, tubularSegments: n, arc: i
            }, e = e || 100, t = t || 40, r = r || 8, n = n || 6, i = i || 2 * Math.PI; for (var o = new THREE.Vector3, a = [], s = [], h = 0; r >= h; h++)for (var c = 0; n >= c; c++) {
                var u = c / n * i, l = h / r * Math.PI * 2; o.x = e * Math.cos(u), o.y = e * Math.sin(u); var p = new THREE.Vector3; p.x = (e + t * Math.cos(l)) * Math.cos(u), p.y = (e + t * Math.cos(l)) * Math.sin(u), p.z = t * Math.sin(l), this.vertices.push(p), a.push(new THREE.Vector2(c / n, h / r)), s.push(p.clone().sub(o).normalize())
            } for (var h = 1; r >= h; h++)for (var c = 1; n >= c; c++) {
                var f = (n + 1) * h + c - 1, d = (n + 1) * (h - 1) + c - 1, E = (n + 1) * (h - 1) + c, m = (n + 1) * h + c, g = new THREE.Face3(f, d, m, [s[f].clone(), s[d].clone(), s[m].clone()]); this.faces.push(g), this.faceVertexUvs[0].push([a[f].clone(), a[d].clone(), a[m].clone()]), g = new THREE.Face3(d, E, m, [s[d].clone(), s[E].clone(), s[m].clone()]), this.faces.push(g), this.faceVertexUvs[0].push([a[d].clone(), a[E].clone(), a[m].clone()])
            } this.computeFaceNormals()
        }, THREE.TorusGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.TorusGeometry.prototype.constructor = THREE.TorusGeometry, THREE.TorusGeometry.prototype.clone = function () {
            var e = this.parameters; return new THREE.TorusGeometry(e.radius, e.tube, e.radialSegments, e.tubularSegments, e.arc)
        }, THREE.TorusKnotGeometry = function (e, t, r, n, i, o, a) {
            function s(e, t, r, n, i) {
                var o = Math.cos(e), a = Math.sin(e), s = t / r * e, h = Math.cos(s), c = n * (2 + h) * .5 * o, u = n * (2 + h) * a * .5, l = i * n * Math.sin(s) * .5; return new THREE.Vector3(c, u, l)
            } THREE.Geometry.call(this), this.type = "TorusKnotGeometry", this.parameters = {
                radius: e, tube: t, radialSegments: r, tubularSegments: n, p: i, q: o, heightScale: a
            }, e = e || 100, t = t || 40, r = r || 64, n = n || 8, i = i || 2, o = o || 3, a = a || 1; for (var h = new Array(r), c = new THREE.Vector3, u = new THREE.Vector3, l = new THREE.Vector3, p = 0; r > p; ++p) {
                h[p] = new Array(n); var f = p / r * 2 * i * Math.PI, d = s(f, o, i, e, a), E = s(f + .01, o, i, e, a); c.subVectors(E, d), u.addVectors(E, d), l.crossVectors(c, u), u.crossVectors(l, c), l.normalize(), u.normalize(); for (var m = 0; n > m; ++m) {
                    var g = m / n * 2 * Math.PI, v = -t * Math.cos(g), T = t * Math.sin(g), y = new THREE.Vector3; y.x = d.x + v * u.x + T * l.x, y.y = d.y + v * u.y + T * l.y, y.z = d.z + v * u.z + T * l.z, h[p][m] = this.vertices.push(y) - 1
                }
            } for (var p = 0; r > p; ++p)for (var m = 0; n > m; ++m) {
                var R = (p + 1) % r, x = (m + 1) % n, H = h[p][m], b = h[R][m], w = h[R][x], M = h[p][x], S = new THREE.Vector2(p / r, m / n), _ = new THREE.Vector2((p + 1) / r, m / n), C = new THREE.Vector2((p + 1) / r, (m + 1) / n), A = new THREE.Vector2(p / r, (m + 1) / n); this.faces.push(new THREE.Face3(H, b, M)), this.faceVertexUvs[0].push([S, _, A]), this.faces.push(new THREE.Face3(b, w, M)), this.faceVertexUvs[0].push([_.clone(), C, A.clone()])
            } this.computeFaceNormals(), this.computeVertexNormals()
        }, THREE.TorusKnotGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.TorusKnotGeometry.prototype.constructor = THREE.TorusKnotGeometry, THREE.TorusKnotGeometry.prototype.clone = function () {
            var e = this.parameters; return new THREE.TorusKnotGeometry(e.radius, e.tube, e.radialSegments, e.tubularSegments, e.p, e.q, e.heightScale)
        }, THREE.TubeGeometry = function (e, t, r, n, i, o) {
            function a(e, t, r) {
                return C.vertices.push(new THREE.Vector3(e, t, r)) - 1
            } THREE.Geometry.call(this), this.type = "TubeGeometry", this.parameters = {
                path: e, segments: t, radius: r, radialSegments: n, closed: i, taper: o
            }, t = t || 64, r = r || 1, n = n || 8, i = i || !1, o = o || THREE.TubeGeometry.NoTaper; var s, h, c, u, l, p, f, d, E, m, g, v, T, y, R, x, H, b, w, M, S, _ = [], C = this, A = t + 1, L = new THREE.Vector3, k = new THREE.TubeGeometry.FrenetFrames(e, t, i), P = k.tangents, D = k.normals, O = k.binormals; for (this.tangents = P, this.normals = D, this.binormals = O, m = 0; A > m; m++)for (_[m] = [], u = m / (A - 1), E = e.getPointAt(u), s = P[m], h = D[m], c = O[m], p = r * o(u), g = 0; n > g; g++)l = g / n * 2 * Math.PI, f = -p * Math.cos(l), d = p * Math.sin(l), L.copy(E), L.x += f * h.x + d * c.x, L.y += f * h.y + d * c.y, L.z += f * h.z + d * c.z, _[m][g] = a(L.x, L.y, L.z); for (m = 0; t > m; m++)for (g = 0; n > g; g++)v = i ? (m + 1) % t : m + 1, T = (g + 1) % n, y = _[m][g], R = _[v][g], x = _[v][T], H = _[m][T], b = new THREE.Vector2(m / t, g / n), w = new THREE.Vector2((m + 1) / t, g / n), M = new THREE.Vector2((m + 1) / t, (g + 1) / n), S = new THREE.Vector2(m / t, (g + 1) / n), this.faces.push(new THREE.Face3(y, R, H)), this.faceVertexUvs[0].push([b, w, S]), this.faces.push(new THREE.Face3(R, x, H)), this.faceVertexUvs[0].push([w.clone(), M, S.clone()]); this.computeFaceNormals(), this.computeVertexNormals()
        }, THREE.TubeGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.TubeGeometry.prototype.constructor = THREE.TubeGeometry, THREE.TubeGeometry.prototype.clone = function () {
            return new this.constructor(this.parameters.path, this.parameters.segments, this.parameters.radius, this.parameters.radialSegments, this.parameters.closed, this.parameters.taper)
        }, THREE.TubeGeometry.NoTaper = function (e) {
            return 1
        }, THREE.TubeGeometry.SinusoidalTaper = function (e) {
            return Math.sin(Math.PI * e)
        }, THREE.TubeGeometry.FrenetFrames = function (e, t, r) {
            function n() {
                f[0] = new THREE.Vector3, d[0] = new THREE.Vector3, o = Number.MAX_VALUE, a = Math.abs(p[0].x), s = Math.abs(p[0].y), h = Math.abs(p[0].z), o >= a && (o = a, l.set(1, 0, 0)), o >= s && (o = s, l.set(0, 1, 0)), o >= h && l.set(0, 0, 1), E.crossVectors(p[0], l).normalize(), f[0].crossVectors(p[0], E), d[0].crossVectors(p[0], f[0])
            } var i, o, a, s, h, c, u, l = new THREE.Vector3, p = [], f = [], d = [], E = new THREE.Vector3, m = new THREE.Matrix4, g = t + 1; for (this.tangents = p, this.normals = f, this.binormals = d, c = 0; g > c; c++)u = c / (g - 1), p[c] = e.getTangentAt(u), p[c].normalize(); for (n(), c = 1; g > c; c++)f[c] = f[c - 1].clone(), d[c] = d[c - 1].clone(), E.crossVectors(p[c - 1], p[c]), E.length() > Number.EPSILON && (E.normalize(), i = Math.acos(THREE.Math.clamp(p[c - 1].dot(p[c]), -1, 1)), f[c].applyMatrix4(m.makeRotationAxis(E, i))), d[c].crossVectors(p[c], f[c]); if (r) for (i = Math.acos(THREE.Math.clamp(f[0].dot(f[g - 1]), -1, 1)), i /= g - 1, p[0].dot(E.crossVectors(f[0], f[g - 1])) > 0 && (i = -i), c = 1; g > c; c++)f[c].applyMatrix4(m.makeRotationAxis(p[c], i * c)), d[c].crossVectors(p[c], f[c])
        }, THREE.PolyhedronGeometry = function (e, t, r, n) {
            function i(e) {
                var t = e.normalize().clone(); t.index = u.vertices.push(t) - 1; var r = s(e) / 2 / Math.PI + .5, n = h(e) / Math.PI + .5; return t.uv = new THREE.Vector2(r, 1 - n), t
            } function o(e, t, r, n) {
                var i = new THREE.Face3(e.index, t.index, r.index, [e.clone(), t.clone(), r.clone()], void 0, n); u.faces.push(i), T.copy(e).add(t).add(r).divideScalar(3); var o = s(T); u.faceVertexUvs[0].push([c(e.uv, e, o), c(t.uv, t, o), c(r.uv, r, o)])
            } function a(e, t) {
                for (var r = Math.pow(2, t), n = i(u.vertices[e.a]), a = i(u.vertices[e.b]), s = i(u.vertices[e.c]), h = [], c = e.materialIndex, l = 0; r >= l; l++) {
                    h[l] = []; for (var p = i(n.clone().lerp(s, l / r)), f = i(a.clone().lerp(s, l / r)), d = r - l, E = 0; d >= E; E++)0 === E && l === r ? h[l][E] = p : h[l][E] = i(p.clone().lerp(f, E / d))
                } for (var l = 0; r > l; l++)for (var E = 0; 2 * (r - l) - 1 > E; E++) {
                    var m = Math.floor(E / 2); E % 2 === 0 ? o(h[l][m + 1], h[l + 1][m], h[l][m], c) : o(h[l][m + 1], h[l + 1][m + 1], h[l + 1][m], c)
                }
            } function s(e) {
                return Math.atan2(e.z, -e.x)
            } function h(e) {
                return Math.atan2(-e.y, Math.sqrt(e.x * e.x + e.z * e.z))
            } function c(e, t, r) {
                return 0 > r && 1 === e.x && (e = new THREE.Vector2(e.x - 1, e.y)), 0 === t.x && 0 === t.z && (e = new THREE.Vector2(r / 2 / Math.PI + .5, e.y)), e.clone()
            } THREE.Geometry.call(this), this.type = "PolyhedronGeometry", this.parameters = {
                vertices: e, indices: t, radius: r, detail: n
            }, r = r || 1, n = n || 0; for (var u = this, l = 0, p = e.length; p > l; l += 3)i(new THREE.Vector3(e[l], e[l + 1], e[l + 2])); for (var f = this.vertices, d = [], l = 0, E = 0, p = t.length; p > l; l += 3, E++) {
                var m = f[t[l]], g = f[t[l + 1]], v = f[t[l + 2]]; d[E] = new THREE.Face3(m.index, g.index, v.index, [m.clone(), g.clone(), v.clone()], void 0, E)
            } for (var T = new THREE.Vector3, l = 0, p = d.length; p > l; l++)a(d[l], n); for (var l = 0, p = this.faceVertexUvs[0].length; p > l; l++) {
                var y = this.faceVertexUvs[0][l], R = y[0].x, x = y[1].x, H = y[2].x, b = Math.max(R, x, H), w = Math.min(R, x, H); b > .9 && .1 > w && (.2 > R && (y[0].x += 1), .2 > x && (y[1].x += 1), .2 > H && (y[2].x += 1))
            } for (var l = 0, p = this.vertices.length; p > l; l++)this.vertices[l].multiplyScalar(r); this.mergeVertices(), this.computeFaceNormals(), this.boundingSphere = new THREE.Sphere(new THREE.Vector3, r)
        }, THREE.PolyhedronGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.PolyhedronGeometry.prototype.constructor = THREE.PolyhedronGeometry, THREE.PolyhedronGeometry.prototype.clone = function () {
            var e = this.parameters; return new THREE.PolyhedronGeometry(e.vertices, e.indices, e.radius, e.detail)
        }, THREE.DodecahedronGeometry = function (e, t) {
            var r = (1 + Math.sqrt(5)) / 2, n = 1 / r, i = [-1, -1, -1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, -1, -1, 1, -1, 1, 1, 1, -1, 1, 1, 1, 0, -n, -r, 0, -n, r, 0, n, -r, 0, n, r, -n, -r, 0, -n, r, 0, n, -r, 0, n, r, 0, -r, 0, -n, r, 0, -n, -r, 0, n, r, 0, n], o = [3, 11, 7, 3, 7, 15, 3, 15, 13, 7, 19, 17, 7, 17, 6, 7, 6, 15, 17, 4, 8, 17, 8, 10, 17, 10, 6, 8, 0, 16, 8, 16, 2, 8, 2, 10, 0, 12, 1, 0, 1, 18, 0, 18, 16, 6, 10, 2, 6, 2, 13, 6, 13, 15, 2, 16, 18, 2, 18, 3, 2, 3, 13, 18, 1, 9, 18, 9, 11, 18, 11, 3, 4, 14, 12, 4, 12, 0, 4, 0, 8, 11, 9, 5, 11, 5, 19, 11, 19, 7, 19, 5, 14, 19, 14, 4, 19, 4, 17, 1, 12, 14, 1, 14, 5, 1, 5, 9]; THREE.PolyhedronGeometry.call(this, i, o, e, t), this.type = "DodecahedronGeometry", this.parameters = {
                radius: e, detail: t
            }
        }, THREE.DodecahedronGeometry.prototype = Object.create(THREE.PolyhedronGeometry.prototype), THREE.DodecahedronGeometry.prototype.constructor = THREE.DodecahedronGeometry, THREE.DodecahedronGeometry.prototype.clone = function () {
            var e = this.parameters; return new THREE.DodecahedronGeometry(e.radius, e.detail)
        }, THREE.IcosahedronGeometry = function (e, t) {
            var r = (1 + Math.sqrt(5)) / 2, n = [-1, r, 0, 1, r, 0, -1, -r, 0, 1, -r, 0, 0, -1, r, 0, 1, r, 0, -1, -r, 0, 1, -r, r, 0, -1, r, 0, 1, -r, 0, -1, -r, 0, 1], i = [0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1]; THREE.PolyhedronGeometry.call(this, n, i, e, t), this.type = "IcosahedronGeometry", this.parameters = {
                radius: e, detail: t
            }
        }, THREE.IcosahedronGeometry.prototype = Object.create(THREE.PolyhedronGeometry.prototype), THREE.IcosahedronGeometry.prototype.constructor = THREE.IcosahedronGeometry, THREE.IcosahedronGeometry.prototype.clone = function () {
            var e = this.parameters; return new THREE.IcosahedronGeometry(e.radius, e.detail)
        }, THREE.OctahedronGeometry = function (e, t) {
            var r = [1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1], n = [0, 2, 4, 0, 4, 3, 0, 3, 5, 0, 5, 2, 1, 2, 5, 1, 5, 3, 1, 3, 4, 1, 4, 2]; THREE.PolyhedronGeometry.call(this, r, n, e, t), this.type = "OctahedronGeometry", this.parameters = {
                radius: e, detail: t
            }
        }, THREE.OctahedronGeometry.prototype = Object.create(THREE.PolyhedronGeometry.prototype), THREE.OctahedronGeometry.prototype.constructor = THREE.OctahedronGeometry, THREE.OctahedronGeometry.prototype.clone = function () {
            var e = this.parameters; return new THREE.OctahedronGeometry(e.radius, e.detail)
        }, THREE.TetrahedronGeometry = function (e, t) {
            var r = [1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1], n = [2, 1, 0, 0, 3, 2, 1, 3, 0, 2, 3, 1]; THREE.PolyhedronGeometry.call(this, r, n, e, t), this.type = "TetrahedronGeometry", this.parameters = {
                radius: e, detail: t
            }
        }, THREE.TetrahedronGeometry.prototype = Object.create(THREE.PolyhedronGeometry.prototype), THREE.TetrahedronGeometry.prototype.constructor = THREE.TetrahedronGeometry, THREE.TetrahedronGeometry.prototype.clone = function () {
            var e = this.parameters; return new THREE.TetrahedronGeometry(e.radius, e.detail)
        }, THREE.ParametricGeometry = function (e, t, r) {
            THREE.Geometry.call(this), this.type = "ParametricGeometry", this.parameters = {
                func: e, slices: t, stacks: r
            }; var n, i, o, a, s, h = this.vertices, c = this.faces, u = this.faceVertexUvs[0], l = t + 1; for (n = 0; r >= n; n++)for (s = n / r, i = 0; t >= i; i++)a = i / t, o = e(a, s), h.push(o); var p, f, d, E, m, g, v, T; for (n = 0; r > n; n++)for (i = 0; t > i; i++)p = n * l + i, f = n * l + i + 1, d = (n + 1) * l + i + 1, E = (n + 1) * l + i, m = new THREE.Vector2(i / t, n / r), g = new THREE.Vector2((i + 1) / t, n / r), v = new THREE.Vector2((i + 1) / t, (n + 1) / r), T = new THREE.Vector2(i / t, (n + 1) / r), c.push(new THREE.Face3(p, f, E)), u.push([m, g, T]), c.push(new THREE.Face3(f, d, E)), u.push([g.clone(), v, T.clone()]); this.computeFaceNormals(), this.computeVertexNormals()
        }, THREE.ParametricGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.ParametricGeometry.prototype.constructor = THREE.ParametricGeometry, THREE.WireframeGeometry = function (e) {
            function t(e, t) {
                return e - t
            } THREE.BufferGeometry.call(this); var r = [0, 0], n = {}, i = ["a", "b", "c"]; if (e instanceof THREE.Geometry) {
                for (var o = e.vertices, a = e.faces, s = 0, h = new Uint32Array(6 * a.length), c = 0, u = a.length; u > c; c++)for (var l = a[c], p = 0; 3 > p; p++) {
                    r[0] = l[i[p]], r[1] = l[i[(p + 1) % 3]], r.sort(t); var f = r.toString(); void 0 === n[f] && (h[2 * s] = r[0], h[2 * s + 1] = r[1], n[f] = !0, s++)
                } for (var d = new Float32Array(2 * s * 3), c = 0, u = s; u > c; c++)for (var p = 0; 2 > p; p++) {
                    var E = o[h[2 * c + p]], m = 6 * c + 3 * p; d[m + 0] = E.x, d[m + 1] = E.y, d[m + 2] = E.z
                } this.addAttribute("position", new THREE.BufferAttribute(d, 3))
            } else if (e instanceof THREE.BufferGeometry) if (null !== e.index) {
                var g = e.index.array, o = e.attributes.position, v = e.drawcalls, s = 0; 0 === v.length && e.addGroup(0, g.length); for (var h = new Uint32Array(2 * g.length), T = 0, y = v.length; y > T; ++T)for (var R = v[T], x = R.start, H = R.count, c = x, b = x + H; b > c; c += 3)for (var p = 0; 3 > p; p++) {
                    r[0] = g[c + p], r[1] = g[c + (p + 1) % 3], r.sort(t); var f = r.toString(); void 0 === n[f] && (h[2 * s] = r[0], h[2 * s + 1] = r[1], n[f] = !0, s++)
                } for (var d = new Float32Array(2 * s * 3), c = 0, u = s; u > c; c++)for (var p = 0; 2 > p; p++) {
                    var m = 6 * c + 3 * p, w = h[2 * c + p]; d[m + 0] = o.getX(w), d[m + 1] = o.getY(w), d[m + 2] = o.getZ(w)
                } this.addAttribute("position", new THREE.BufferAttribute(d, 3))
            } else {
                for (var o = e.attributes.position.array, s = o.length / 3, M = s / 3, d = new Float32Array(2 * s * 3), c = 0, u = M; u > c; c++)for (var p = 0; 3 > p; p++) {
                    var m = 18 * c + 6 * p, S = 9 * c + 3 * p; d[m + 0] = o[S], d[m + 1] = o[S + 1], d[m + 2] = o[S + 2]; var w = 9 * c + 3 * ((p + 1) % 3); d[m + 3] = o[w], d[m + 4] = o[w + 1], d[m + 5] = o[w + 2]
                } this.addAttribute("position", new THREE.BufferAttribute(d, 3))
            }
        }, THREE.WireframeGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.WireframeGeometry.prototype.constructor = THREE.WireframeGeometry, THREE.AxisHelper = function (e) {
            e = e || 1; var t = new Float32Array([0, 0, 0, e, 0, 0, 0, 0, 0, 0, e, 0, 0, 0, 0, 0, 0, e]), r = new Float32Array([1, 0, 0, 1, .6, 0, 0, 1, 0, .6, 1, 0, 0, 0, 1, 0, .6, 1]), n = new THREE.BufferGeometry; n.addAttribute("position", new THREE.BufferAttribute(t, 3)), n.addAttribute("color", new THREE.BufferAttribute(r, 3)); var i = new THREE.LineBasicMaterial({
                vertexColors: THREE.VertexColors
            }); THREE.LineSegments.call(this, n, i)
        }, THREE.AxisHelper.prototype = Object.create(THREE.LineSegments.prototype), THREE.AxisHelper.prototype.constructor = THREE.AxisHelper, THREE.ArrowHelper = function () {
            var e = new THREE.Geometry; e.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)); var t = new THREE.CylinderGeometry(0, .5, 1, 5, 1); return t.translate(0, -.5, 0), function (r, n, i, o, a, s) {
                THREE.Object3D.call(this), void 0 === o && (o = 16776960), void 0 === i && (i = 1), void 0 === a && (a = .2 * i), void 0 === s && (s = .2 * a), this.position.copy(n), i > a && (this.line = new THREE.Line(e, new THREE.LineBasicMaterial({
                    color: o
                })), this.line.matrixAutoUpdate = !1, this.add(this.line)), this.cone = new THREE.Mesh(t, new THREE.MeshBasicMaterial({
                    color: o
                })), this.cone.matrixAutoUpdate = !1, this.add(this.cone), this.setDirection(r), this.setLength(i, a, s)
            }
        }(), THREE.ArrowHelper.prototype = Object.create(THREE.Object3D.prototype), THREE.ArrowHelper.prototype.constructor = THREE.ArrowHelper, THREE.ArrowHelper.prototype.setDirection = function () {
            var e, t = new THREE.Vector3; return function (r) {
                r.y > .99999 ? this.quaternion.set(0, 0, 0, 1) : r.y < -.99999 ? this.quaternion.set(1, 0, 0, 0) : (t.set(r.z, 0, -r.x).normalize(), e = Math.acos(r.y), this.quaternion.setFromAxisAngle(t, e))
            }
        }(), THREE.ArrowHelper.prototype.setLength = function (e, t, r) {
            void 0 === t && (t = .2 * e), void 0 === r && (r = .2 * t), e > t && (this.line.scale.set(1, e - t, 1), this.line.updateMatrix()), this.cone.scale.set(r, t, r), this.cone.position.y = e, this.cone.updateMatrix()
        }, THREE.ArrowHelper.prototype.setColor = function (e) {
            void 0 !== this.line && this.line.material.color.set(e), this.cone.material.color.set(e)
        }, THREE.BoxHelper = function (e) {
            var t = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]), r = new Float32Array(24), n = new THREE.BufferGeometry; n.setIndex(new THREE.BufferAttribute(t, 1)), n.addAttribute("position", new THREE.BufferAttribute(r, 3)), THREE.LineSegments.call(this, n, new THREE.LineBasicMaterial({
                color: 16776960
            })), void 0 !== e && this.update(e)
        }, THREE.BoxHelper.prototype = Object.create(THREE.LineSegments.prototype), THREE.BoxHelper.prototype.constructor = THREE.BoxHelper, THREE.BoxHelper.prototype.update = function () {
            var e = new THREE.Box3; return function (t) {
                if (e.setFromObject(t), !e.empty()) {
                    var r = e.min, n = e.max, i = this.geometry.attributes.position, o = i.array; o[0] = n.x, o[1] = n.y, o[2] = n.z, o[3] = r.x, o[4] = n.y, o[5] = n.z, o[6] = r.x, o[7] = r.y, o[8] = n.z, o[9] = n.x, o[10] = r.y, o[11] = n.z, o[12] = n.x, o[13] = n.y, o[14] = r.z, o[15] = r.x, o[16] = n.y, o[17] = r.z, o[18] = r.x, o[19] = r.y, o[20] = r.z, o[21] = n.x, o[22] = r.y, o[23] = r.z, i.needsUpdate = !0, this.geometry.computeBoundingSphere()
                }
            }
        }(), THREE.BoundingBoxHelper = function (e, t) {
            var r = void 0 !== t ? t : 8947848; this.object = e, this.box = new THREE.Box3, THREE.Mesh.call(this, new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({
                color: r, wireframe: !0
            }))
        }, THREE.BoundingBoxHelper.prototype = Object.create(THREE.Mesh.prototype), THREE.BoundingBoxHelper.prototype.constructor = THREE.BoundingBoxHelper, THREE.BoundingBoxHelper.prototype.update = function () {
            this.box.setFromObject(this.object), this.box.size(this.scale), this.box.center(this.position)
        }, THREE.CameraHelper = function (e) {
            function t(e, t, n) {
                r(e, n), r(t, n)
            } function r(e, t) {
                n.vertices.push(new THREE.Vector3), n.colors.push(new THREE.Color(t)), void 0 === o[e] && (o[e] = []), o[e].push(n.vertices.length - 1)
            } var n = new THREE.Geometry, i = new THREE.LineBasicMaterial({
                color: 16777215, vertexColors: THREE.FaceColors
            }), o = {}, a = 16755200, s = 16711680, h = 43775, c = 16777215, u = 3355443; t("n1", "n2", a), t("n2", "n4", a), t("n4", "n3", a), t("n3", "n1", a), t("f1", "f2", a), t("f2", "f4", a), t("f4", "f3", a), t("f3", "f1", a), t("n1", "f1", a), t("n2", "f2", a), t("n3", "f3", a), t("n4", "f4", a), t("p", "n1", s), t("p", "n2", s), t("p", "n3", s), t("p", "n4", s), t("u1", "u2", h), t("u2", "u3", h), t("u3", "u1", h), t("c", "t", c), t("p", "c", u), t("cn1", "cn2", u), t("cn3", "cn4", u), t("cf1", "cf2", u), t("cf3", "cf4", u), THREE.LineSegments.call(this, n, i), this.camera = e, this.camera.updateProjectionMatrix(), this.matrix = e.matrixWorld, this.matrixAutoUpdate = !1, this.pointMap = o, this.update()
        }, THREE.CameraHelper.prototype = Object.create(THREE.LineSegments.prototype), THREE.CameraHelper.prototype.constructor = THREE.CameraHelper, THREE.CameraHelper.prototype.update = function () {
            function e(e, o, a, s) {
                n.set(o, a, s).unproject(i); var h = r[e]; if (void 0 !== h) for (var c = 0, u = h.length; u > c; c++)t.vertices[h[c]].copy(n)
            } var t, r, n = new THREE.Vector3, i = new THREE.Camera; return function () {
                t = this.geometry, r = this.pointMap; var n = 1, o = 1; i.projectionMatrix.copy(this.camera.projectionMatrix), e("c", 0, 0, -1), e("t", 0, 0, 1), e("n1", -n, -o, -1), e("n2", n, -o, -1), e("n3", -n, o, -1), e("n4", n, o, -1),
                    e("f1", -n, -o, 1), e("f2", n, -o, 1), e("f3", -n, o, 1), e("f4", n, o, 1), e("u1", .7 * n, 1.1 * o, -1), e("u2", .7 * -n, 1.1 * o, -1), e("u3", 0, 2 * o, -1), e("cf1", -n, 0, 1), e("cf2", n, 0, 1), e("cf3", 0, -o, 1), e("cf4", 0, o, 1), e("cn1", -n, 0, -1), e("cn2", n, 0, -1), e("cn3", 0, -o, -1), e("cn4", 0, o, -1), t.verticesNeedUpdate = !0
            }
        }(), THREE.DirectionalLightHelper = function (e, t) {
            THREE.Object3D.call(this), this.light = e, this.light.updateMatrixWorld(), this.matrix = e.matrixWorld, this.matrixAutoUpdate = !1, t = t || 1; var r = new THREE.Geometry; r.vertices.push(new THREE.Vector3(-t, t, 0), new THREE.Vector3(t, t, 0), new THREE.Vector3(t, -t, 0), new THREE.Vector3(-t, -t, 0), new THREE.Vector3(-t, t, 0)); var n = new THREE.LineBasicMaterial({
                fog: !1
            }); n.color.copy(this.light.color).multiplyScalar(this.light.intensity), this.lightPlane = new THREE.Line(r, n), this.add(this.lightPlane), r = new THREE.Geometry, r.vertices.push(new THREE.Vector3, new THREE.Vector3), n = new THREE.LineBasicMaterial({
                fog: !1
            }), n.color.copy(this.light.color).multiplyScalar(this.light.intensity), this.targetLine = new THREE.Line(r, n), this.add(this.targetLine), this.update()
        }, THREE.DirectionalLightHelper.prototype = Object.create(THREE.Object3D.prototype), THREE.DirectionalLightHelper.prototype.constructor = THREE.DirectionalLightHelper, THREE.DirectionalLightHelper.prototype.dispose = function () {
            this.lightPlane.geometry.dispose(), this.lightPlane.material.dispose(), this.targetLine.geometry.dispose(), this.targetLine.material.dispose()
        }, THREE.DirectionalLightHelper.prototype.update = function () {
            var e = new THREE.Vector3, t = new THREE.Vector3, r = new THREE.Vector3; return function () {
                e.setFromMatrixPosition(this.light.matrixWorld), t.setFromMatrixPosition(this.light.target.matrixWorld), r.subVectors(t, e), this.lightPlane.lookAt(r), this.lightPlane.material.color.copy(this.light.color).multiplyScalar(this.light.intensity), this.targetLine.geometry.vertices[1].copy(r), this.targetLine.geometry.verticesNeedUpdate = !0, this.targetLine.material.color.copy(this.lightPlane.material.color)
            }
        }(), THREE.EdgesHelper = function (e, t, r) {
            var n = void 0 !== t ? t : 16777215; THREE.LineSegments.call(this, new THREE.EdgesGeometry(e.geometry, r), new THREE.LineBasicMaterial({
                color: n
            })), this.matrix = e.matrixWorld, this.matrixAutoUpdate = !1
        }, THREE.EdgesHelper.prototype = Object.create(THREE.LineSegments.prototype), THREE.EdgesHelper.prototype.constructor = THREE.EdgesHelper, THREE.FaceNormalsHelper = function (e, t, r, n) {
            this.object = e, this.size = void 0 !== t ? t : 1; var i = void 0 !== r ? r : 16776960, o = void 0 !== n ? n : 1, a = 0, s = this.object.geometry; s instanceof THREE.Geometry ? a = s.faces.length : console.warn("THREE.FaceNormalsHelper: only THREE.Geometry is supported. Use THREE.VertexNormalsHelper, instead."); var h = new THREE.BufferGeometry, c = new THREE.Float32Attribute(2 * a * 3, 3); h.addAttribute("position", c), THREE.LineSegments.call(this, h, new THREE.LineBasicMaterial({
                color: i, linewidth: o
            })), this.matrixAutoUpdate = !1, this.update()
        }, THREE.FaceNormalsHelper.prototype = Object.create(THREE.LineSegments.prototype), THREE.FaceNormalsHelper.prototype.constructor = THREE.FaceNormalsHelper, THREE.FaceNormalsHelper.prototype.update = function () {
            var e = new THREE.Vector3, t = new THREE.Vector3, r = new THREE.Matrix3; return function () {
                this.object.updateMatrixWorld(!0), r.getNormalMatrix(this.object.matrixWorld); for (var n = this.object.matrixWorld, i = this.geometry.attributes.position, o = this.object.geometry, a = o.vertices, s = o.faces, h = 0, c = 0, u = s.length; u > c; c++) {
                    var l = s[c], p = l.normal; e.copy(a[l.a]).add(a[l.b]).add(a[l.c]).divideScalar(3).applyMatrix4(n), t.copy(p).applyMatrix3(r).normalize().multiplyScalar(this.size).add(e), i.setXYZ(h, e.x, e.y, e.z), h += 1, i.setXYZ(h, t.x, t.y, t.z), h += 1
                } return i.needsUpdate = !0, this
            }
        }(), THREE.GridHelper = function (e, t) {
            var r = new THREE.Geometry, n = new THREE.LineBasicMaterial({
                vertexColors: THREE.VertexColors
            }); this.color1 = new THREE.Color(4473924), this.color2 = new THREE.Color(8947848); for (var i = -e; e >= i; i += t) {
                r.vertices.push(new THREE.Vector3(-e, 0, i), new THREE.Vector3(e, 0, i), new THREE.Vector3(i, 0, -e), new THREE.Vector3(i, 0, e)); var o = 0 === i ? this.color1 : this.color2; r.colors.push(o, o, o, o)
            } THREE.LineSegments.call(this, r, n)
        }, THREE.GridHelper.prototype = Object.create(THREE.LineSegments.prototype), THREE.GridHelper.prototype.constructor = THREE.GridHelper, THREE.GridHelper.prototype.setColors = function (e, t) {
            this.color1.set(e), this.color2.set(t), this.geometry.colorsNeedUpdate = !0
        }, THREE.HemisphereLightHelper = function (e, t) {
            THREE.Object3D.call(this), this.light = e, this.light.updateMatrixWorld(), this.matrix = e.matrixWorld, this.matrixAutoUpdate = !1, this.colors = [new THREE.Color, new THREE.Color]; var r = new THREE.SphereGeometry(t, 4, 2); r.rotateX(-Math.PI / 2); for (var n = 0, i = 8; i > n; n++)r.faces[n].color = this.colors[4 > n ? 0 : 1]; var o = new THREE.MeshBasicMaterial({
                vertexColors: THREE.FaceColors, wireframe: !0
            }); this.lightSphere = new THREE.Mesh(r, o), this.add(this.lightSphere), this.update()
        }, THREE.HemisphereLightHelper.prototype = Object.create(THREE.Object3D.prototype), THREE.HemisphereLightHelper.prototype.constructor = THREE.HemisphereLightHelper, THREE.HemisphereLightHelper.prototype.dispose = function () {
            this.lightSphere.geometry.dispose(), this.lightSphere.material.dispose()
        }, THREE.HemisphereLightHelper.prototype.update = function () {
            var e = new THREE.Vector3; return function () {
                this.colors[0].copy(this.light.color).multiplyScalar(this.light.intensity), this.colors[1].copy(this.light.groundColor).multiplyScalar(this.light.intensity), this.lightSphere.lookAt(e.setFromMatrixPosition(this.light.matrixWorld).negate()), this.lightSphere.geometry.colorsNeedUpdate = !0
            }
        }(), THREE.PointLightHelper = function (e, t) {
            this.light = e, this.light.updateMatrixWorld(); var r = new THREE.SphereGeometry(t, 4, 2), n = new THREE.MeshBasicMaterial({
                wireframe: !0, fog: !1
            }); n.color.copy(this.light.color).multiplyScalar(this.light.intensity), THREE.Mesh.call(this, r, n), this.matrix = this.light.matrixWorld, this.matrixAutoUpdate = !1
        }, THREE.PointLightHelper.prototype = Object.create(THREE.Mesh.prototype), THREE.PointLightHelper.prototype.constructor = THREE.PointLightHelper, THREE.PointLightHelper.prototype.dispose = function () {
            this.geometry.dispose(), this.material.dispose()
        }, THREE.PointLightHelper.prototype.update = function () {
            this.material.color.copy(this.light.color).multiplyScalar(this.light.intensity)
        }, THREE.SkeletonHelper = function (e) {
            this.bones = this.getBoneList(e); for (var t = new THREE.Geometry, r = 0; r < this.bones.length; r++) {
                var n = this.bones[r]; n.parent instanceof THREE.Bone && (t.vertices.push(new THREE.Vector3), t.vertices.push(new THREE.Vector3), t.colors.push(new THREE.Color(0, 0, 1)), t.colors.push(new THREE.Color(0, 1, 0)))
            } t.dynamic = !0; var i = new THREE.LineBasicMaterial({
                vertexColors: THREE.VertexColors, depthTest: !1, depthWrite: !1, transparent: !0
            }); THREE.LineSegments.call(this, t, i), this.root = e, this.matrix = e.matrixWorld, this.matrixAutoUpdate = !1, this.update()
        }, THREE.SkeletonHelper.prototype = Object.create(THREE.LineSegments.prototype), THREE.SkeletonHelper.prototype.constructor = THREE.SkeletonHelper, THREE.SkeletonHelper.prototype.getBoneList = function (e) {
            var t = []; e instanceof THREE.Bone && t.push(e); for (var r = 0; r < e.children.length; r++)t.push.apply(t, this.getBoneList(e.children[r])); return t
        }, THREE.SkeletonHelper.prototype.update = function () {
            for (var e = this.geometry, t = (new THREE.Matrix4).getInverse(this.root.matrixWorld), r = new THREE.Matrix4, n = 0, i = 0; i < this.bones.length; i++) {
                var o = this.bones[i]; o.parent instanceof THREE.Bone && (r.multiplyMatrices(t, o.matrixWorld), e.vertices[n].setFromMatrixPosition(r), r.multiplyMatrices(t, o.parent.matrixWorld), e.vertices[n + 1].setFromMatrixPosition(r), n += 2)
            } e.verticesNeedUpdate = !0, e.computeBoundingSphere()
        }, THREE.SpotLightHelper = function (e) {
            THREE.Object3D.call(this), this.light = e, this.light.updateMatrixWorld(), this.matrix = e.matrixWorld, this.matrixAutoUpdate = !1; var t = new THREE.CylinderGeometry(0, 1, 1, 8, 1, !0); t.translate(0, -.5, 0), t.rotateX(-Math.PI / 2); var r = new THREE.MeshBasicMaterial({
                wireframe: !0, fog: !1
            }); this.cone = new THREE.Mesh(t, r), this.add(this.cone), this.update()
        }, THREE.SpotLightHelper.prototype = Object.create(THREE.Object3D.prototype), THREE.SpotLightHelper.prototype.constructor = THREE.SpotLightHelper, THREE.SpotLightHelper.prototype.dispose = function () {
            this.cone.geometry.dispose(), this.cone.material.dispose()
        }, THREE.SpotLightHelper.prototype.update = function () {
            var e = new THREE.Vector3, t = new THREE.Vector3; return function () {
                var r = this.light.distance ? this.light.distance : 1e4, n = r * Math.tan(this.light.angle); this.cone.scale.set(n, n, r), e.setFromMatrixPosition(this.light.matrixWorld), t.setFromMatrixPosition(this.light.target.matrixWorld), this.cone.lookAt(t.sub(e)), this.cone.material.color.copy(this.light.color).multiplyScalar(this.light.intensity)
            }
        }(), THREE.VertexNormalsHelper = function (e, t, r, n) {
            this.object = e, this.size = void 0 !== t ? t : 1; var i = void 0 !== r ? r : 16711680, o = void 0 !== n ? n : 1, a = 0, s = this.object.geometry; s instanceof THREE.Geometry ? a = 3 * s.faces.length : s instanceof THREE.BufferGeometry && (a = s.attributes.normal.count); var h = new THREE.BufferGeometry, c = new THREE.Float32Attribute(2 * a * 3, 3); h.addAttribute("position", c), THREE.LineSegments.call(this, h, new THREE.LineBasicMaterial({
                color: i, linewidth: o
            })), this.matrixAutoUpdate = !1, this.update()
        }, THREE.VertexNormalsHelper.prototype = Object.create(THREE.LineSegments.prototype), THREE.VertexNormalsHelper.prototype.constructor = THREE.VertexNormalsHelper, THREE.VertexNormalsHelper.prototype.update = function () {
            var e = new THREE.Vector3, t = new THREE.Vector3, r = new THREE.Matrix3; return function () {
                var n = ["a", "b", "c"]; this.object.updateMatrixWorld(!0), r.getNormalMatrix(this.object.matrixWorld); var i = this.object.matrixWorld, o = this.geometry.attributes.position, a = this.object.geometry; if (a instanceof THREE.Geometry) for (var s = a.vertices, h = a.faces, c = 0, u = 0, l = h.length; l > u; u++)for (var p = h[u], f = 0, d = p.vertexNormals.length; d > f; f++) {
                    var E = s[p[n[f]]], m = p.vertexNormals[f]; e.copy(E).applyMatrix4(i), t.copy(m).applyMatrix3(r).normalize().multiplyScalar(this.size).add(e), o.setXYZ(c, e.x, e.y, e.z), c += 1, o.setXYZ(c, t.x, t.y, t.z), c += 1
                } else if (a instanceof THREE.BufferGeometry) for (var g = a.attributes.position, v = a.attributes.normal, c = 0, f = 0, d = g.count; d > f; f++)e.set(g.getX(f), g.getY(f), g.getZ(f)).applyMatrix4(i), t.set(v.getX(f), v.getY(f), v.getZ(f)), t.applyMatrix3(r).normalize().multiplyScalar(this.size).add(e), o.setXYZ(c, e.x, e.y, e.z), c += 1, o.setXYZ(c, t.x, t.y, t.z), c += 1; return o.needsUpdate = !0, this
            }
        }(), THREE.WireframeHelper = function (e, t) {
            var r = void 0 !== t ? t : 16777215; THREE.LineSegments.call(this, new THREE.WireframeGeometry(e.geometry), new THREE.LineBasicMaterial({
                color: r
            })), this.matrix = e.matrixWorld, this.matrixAutoUpdate = !1
        }, THREE.WireframeHelper.prototype = Object.create(THREE.LineSegments.prototype), THREE.WireframeHelper.prototype.constructor = THREE.WireframeHelper, THREE.ImmediateRenderObject = function (e) {
            THREE.Object3D.call(this), this.material = e, this.render = function (e) {
            }
        }, THREE.ImmediateRenderObject.prototype = Object.create(THREE.Object3D.prototype), THREE.ImmediateRenderObject.prototype.constructor = THREE.ImmediateRenderObject, THREE.MorphBlendMesh = function (e, t) {
            THREE.Mesh.call(this, e, t), this.animationsMap = {}, this.animationsList = []; var r = this.geometry.morphTargets.length, n = "__default", i = 0, o = r - 1, a = r / 1; this.createAnimation(n, i, o, a), this.setAnimationWeight(n, 1)
        }, THREE.MorphBlendMesh.prototype = Object.create(THREE.Mesh.prototype), THREE.MorphBlendMesh.prototype.constructor = THREE.MorphBlendMesh, THREE.MorphBlendMesh.prototype.createAnimation = function (e, t, r, n) {
            var i = {
                start: t, end: r, length: r - t + 1, fps: n, duration: (r - t) / n, lastFrame: 0, currentFrame: 0, active: !1, time: 0, direction: 1, weight: 1, directionBackwards: !1, mirroredLoop: !1
            }; this.animationsMap[e] = i, this.animationsList.push(i)
        }, THREE.MorphBlendMesh.prototype.autoCreateAnimations = function (e) {
            for (var t, r = /([a-z]+)_?(\d+)/, n = {}, i = this.geometry, o = 0, a = i.morphTargets.length; a > o; o++) {
                var s = i.morphTargets[o], h = s.name.match(r); if (h && h.length > 1) {
                    var c = h[1]; n[c] || (n[c] = {
                        start: 1 / 0, end: -(1 / 0)
                    }); var u = n[c]; o < u.start && (u.start = o), o > u.end && (u.end = o), t || (t = c)
                }
            } for (var c in n) {
                var u = n[c]; this.createAnimation(c, u.start, u.end, e)
            } this.firstAnimation = t
        }, THREE.MorphBlendMesh.prototype.setAnimationDirectionForward = function (e) {
            var t = this.animationsMap[e]; t && (t.direction = 1, t.directionBackwards = !1)
        }, THREE.MorphBlendMesh.prototype.setAnimationDirectionBackward = function (e) {
            var t = this.animationsMap[e]; t && (t.direction = -1, t.directionBackwards = !0)
        }, THREE.MorphBlendMesh.prototype.setAnimationFPS = function (e, t) {
            var r = this.animationsMap[e]; r && (r.fps = t, r.duration = (r.end - r.start) / r.fps)
        }, THREE.MorphBlendMesh.prototype.setAnimationDuration = function (e, t) {
            var r = this.animationsMap[e]; r && (r.duration = t, r.fps = (r.end - r.start) / r.duration)
        }, THREE.MorphBlendMesh.prototype.setAnimationWeight = function (e, t) {
            var r = this.animationsMap[e]; r && (r.weight = t)
        }, THREE.MorphBlendMesh.prototype.setAnimationTime = function (e, t) {
            var r = this.animationsMap[e]; r && (r.time = t)
        }, THREE.MorphBlendMesh.prototype.getAnimationTime = function (e) {
            var t = 0, r = this.animationsMap[e]; return r && (t = r.time), t
        }, THREE.MorphBlendMesh.prototype.getAnimationDuration = function (e) {
            var t = -1, r = this.animationsMap[e]; return r && (t = r.duration), t
        }, THREE.MorphBlendMesh.prototype.playAnimation = function (e) {
            var t = this.animationsMap[e]; t ? (t.time = 0, t.active = !0) : console.warn("THREE.MorphBlendMesh: animation[" + e + "] undefined in .playAnimation()")
        }, THREE.MorphBlendMesh.prototype.stopAnimation = function (e) {
            var t = this.animationsMap[e]; t && (t.active = !1)
        }, THREE.MorphBlendMesh.prototype.update = function (e) {
            for (var t = 0, r = this.animationsList.length; r > t; t++) {
                var n = this.animationsList[t]; if (n.active) {
                    var i = n.duration / n.length; n.time += n.direction * e, n.mirroredLoop ? (n.time > n.duration || n.time < 0) && (n.direction *= -1, n.time > n.duration && (n.time = n.duration, n.directionBackwards = !0), n.time < 0 && (n.time = 0, n.directionBackwards = !1)) : (n.time = n.time % n.duration, n.time < 0 && (n.time += n.duration)); var o = n.start + THREE.Math.clamp(Math.floor(n.time / i), 0, n.length - 1), a = n.weight; o !== n.currentFrame && (this.morphTargetInfluences[n.lastFrame] = 0, this.morphTargetInfluences[n.currentFrame] = 1 * a, this.morphTargetInfluences[o] = 0, n.lastFrame = n.currentFrame, n.currentFrame = o); var s = n.time % i / i; n.directionBackwards && (s = 1 - s), n.currentFrame !== n.lastFrame ? (this.morphTargetInfluences[n.currentFrame] = s * a, this.morphTargetInfluences[n.lastFrame] = (1 - s) * a) : this.morphTargetInfluences[n.currentFrame] = a
                }
            }
        }, function () {
            if ("performance" in window == !1 && (window.performance = {}), Date.now = Date.now || function () {
                return (new Date).getTime()
            }, "now" in window.performance == !1) {
                var e = window.performance.timing && window.performance.timing.navigationStart ? window.performance.timing.navigationStart : Date.now(); window.performance.now = function () {
                    return Date.now() - e
                }
            }
        }(); var TWEEN = TWEEN || function () {
            var e = []; return {
                getAll: function () {
                    return e
                }, removeAll: function () {
                    e = []
                }, add: function (t) {
                    e.push(t)
                }, remove: function (t) {
                    var r = e.indexOf(t); -1 !== r && e.splice(r, 1)
                }, update: function (t) {
                    if (0 === e.length) return !1; var r = 0; for (t = void 0 !== t ? t : window.performance.now(); r < e.length;)e[r].update(t) ? r++ : e.splice(r, 1); return !0
                }
            }
        }(); TWEEN.Tween = function (e) {
            var t = e, r = {}, n = {}, i = {}, o = 1e3, a = 0, s = !1, h = !1, c = !1, u = 0, l = null, p = TWEEN.Easing.Linear.None, f = TWEEN.Interpolation.Linear, d = [], E = null, m = !1, g = null, v = null, T = null; for (var y in e) r[y] = parseFloat(e[y], 10); this.to = function (e, t) {
                return void 0 !== t && (o = t), n = e, this
            }, this.start = function (e) {
                TWEEN.add(this), h = !0, m = !1, l = void 0 !== e ? e : window.performance.now(), l += u; for (var o in n) {
                    if (n[o] instanceof Array) {
                        if (0 === n[o].length) continue; n[o] = [t[o]].concat(n[o])
                    } r[o] = t[o], r[o] instanceof Array == !1 && (r[o] *= 1), i[o] = r[o] || 0
                } return this
            }, this.stop = function () {
                return h ? (TWEEN.remove(this), h = !1, null !== T && T.call(t), this.stopChainedTweens(), this) : this
            }, this.stopChainedTweens = function () {
                for (var e = 0, t = d.length; t > e; e++)d[e].stop()
            }, this.delay = function (e) {
                return u = e, this
            }, this.repeat = function (e) {
                return a = e, this
            }, this.yoyo = function (e) {
                return s = e, this
            }, this.easing = function (e) {
                return p = e, this
            }, this.interpolation = function (e) {
                return f = e, this
            }, this.chain = function () {
                return d = arguments, this
            }, this.onStart = function (e) {
                return E = e, this
            }, this.onUpdate = function (e) {
                return g = e, this
            }, this.onComplete = function (e) {
                return v = e, this
            }, this.onStop = function (e) {
                return T = e, this
            }, this.update = function (e) {
                var h, T, y; if (l > e) return !0; m === !1 && (null !== E && E.call(t), m = !0), T = (e - l) / o, T = T > 1 ? 1 : T, y = p(T); for (h in n) {
                    var R = r[h] || 0, x = n[h]; x instanceof Array ? t[h] = f(x, y) : ("string" == typeof x && (x = R + parseFloat(x, 10)), "number" == typeof x && (t[h] = R + (x - R) * y))
                } if (null !== g && g.call(t, y), 1 === T) {
                    if (a > 0) {
                        isFinite(a) && a--; for (h in i) {
                            if ("string" == typeof n[h] && (i[h] = i[h] + parseFloat(n[h], 10)), s) {
                                var H = i[h]; i[h] = n[h], n[h] = H
                            } r[h] = i[h]
                        } return s && (c = !c), l = e + u, !0
                    } null !== v && v.call(t); for (var b = 0, w = d.length; w > b; b++)d[b].start(l + o); return !1
                } return !0
            }
        }, TWEEN.Easing = {
            Linear: {
                None: function (e) {
                    return e
                }
            }, Quadratic: {
                In: function (e) {
                    return e * e
                }, Out: function (e) {
                    return e * (2 - e)
                }, InOut: function (e) {
                    return (e *= 2) < 1 ? .5 * e * e : -.5 * (--e * (e - 2) - 1)
                }
            }, Cubic: {
                In: function (e) {
                    return e * e * e
                }, Out: function (e) {
                    return --e * e * e + 1
                }, InOut: function (e) {
                    return (e *= 2) < 1 ? .5 * e * e * e : .5 * ((e -= 2) * e * e + 2)
                }
            }, Quartic: {
                In: function (e) {
                    return e * e * e * e
                }, Out: function (e) {
                    return 1 - --e * e * e * e
                }, InOut: function (e) {
                    return (e *= 2) < 1 ? .5 * e * e * e * e : -.5 * ((e -= 2) * e * e * e - 2)
                }
            }, Quintic: {
                In: function (e) {
                    return e * e * e * e * e
                }, Out: function (e) {
                    return --e * e * e * e * e + 1
                }, InOut: function (e) {
                    return (e *= 2) < 1 ? .5 * e * e * e * e * e : .5 * ((e -= 2) * e * e * e * e + 2)
                }
            }, Sinusoidal: {
                In: function (e) {
                    return 1 - Math.cos(e * Math.PI / 2)
                }, Out: function (e) {
                    return Math.sin(e * Math.PI / 2)
                }, InOut: function (e) {
                    return .5 * (1 - Math.cos(Math.PI * e))
                }
            }, Exponential: {
                In: function (e) {
                    return 0 === e ? 0 : Math.pow(1024, e - 1)
                }, Out: function (e) {
                    return 1 === e ? 1 : 1 - Math.pow(2, -10 * e)
                }, InOut: function (e) {
                    return 0 === e ? 0 : 1 === e ? 1 : (e *= 2) < 1 ? .5 * Math.pow(1024, e - 1) : .5 * (-Math.pow(2, -10 * (e - 1)) + 2)
                }
            }, Circular: {
                In: function (e) {
                    return 1 - Math.sqrt(1 - e * e)
                }, Out: function (e) {
                    return Math.sqrt(1 - --e * e)
                }, InOut: function (e) {
                    return (e *= 2) < 1 ? -.5 * (Math.sqrt(1 - e * e) - 1) : .5 * (Math.sqrt(1 - (e -= 2) * e) + 1)
                }
            }, Elastic: {
                In: function (e) {
                    var t, r = .1, n = .4; return 0 === e ? 0 : 1 === e ? 1 : (!r || 1 > r ? (r = 1, t = n / 4) : t = n * Math.asin(1 / r) / (2 * Math.PI), -(r * Math.pow(2, 10 * (e -= 1)) * Math.sin((e - t) * (2 * Math.PI) / n)))
                }, Out: function (e) {
                    var t, r = .1, n = .4; return 0 === e ? 0 : 1 === e ? 1 : (!r || 1 > r ? (r = 1, t = n / 4) : t = n * Math.asin(1 / r) / (2 * Math.PI), r * Math.pow(2, -10 * e) * Math.sin((e - t) * (2 * Math.PI) / n) + 1)
                }, InOut: function (e) {
                    var t, r = .1, n = .4; return 0 === e ? 0 : 1 === e ? 1 : (!r || 1 > r ? (r = 1, t = n / 4) : t = n * Math.asin(1 / r) / (2 * Math.PI), (e *= 2) < 1 ? -.5 * (r * Math.pow(2, 10 * (e -= 1)) * Math.sin((e - t) * (2 * Math.PI) / n)) : r * Math.pow(2, -10 * (e -= 1)) * Math.sin((e - t) * (2 * Math.PI) / n) * .5 + 1)
                }
            }, Back: {
                In: function (e) {
                    var t = 1.70158; return e * e * ((t + 1) * e - t)
                }, Out: function (e) {
                    var t = 1.70158; return --e * e * ((t + 1) * e + t) + 1
                }, InOut: function (e) {
                    var t = 2.5949095; return (e *= 2) < 1 ? .5 * (e * e * ((t + 1) * e - t)) : .5 * ((e -= 2) * e * ((t + 1) * e + t) + 2)
                }
            }, Bounce: {
                In: function (e) {
                    return 1 - TWEEN.Easing.Bounce.Out(1 - e)
                }, Out: function (e) {
                    return 1 / 2.75 > e ? 7.5625 * e * e : 2 / 2.75 > e ? 7.5625 * (e -= 1.5 / 2.75) * e + .75 : 2.5 / 2.75 > e ? 7.5625 * (e -= 2.25 / 2.75) * e + .9375 : 7.5625 * (e -= 2.625 / 2.75) * e + .984375
                }, InOut: function (e) {
                    return .5 > e ? .5 * TWEEN.Easing.Bounce.In(2 * e) : .5 * TWEEN.Easing.Bounce.Out(2 * e - 1) + .5
                }
            }
        }, TWEEN.Interpolation = {
            Linear: function (e, t) {
                var r = e.length - 1, n = r * t, i = Math.floor(n), o = TWEEN.Interpolation.Utils.Linear; return 0 > t ? o(e[0], e[1], n) : t > 1 ? o(e[r], e[r - 1], r - n) : o(e[i], e[i + 1 > r ? r : i + 1], n - i)
            }, Bezier: function (e, t) {
                for (var r = 0, n = e.length - 1, i = Math.pow, o = TWEEN.Interpolation.Utils.Bernstein, a = 0; n >= a; a++)r += i(1 - t, n - a) * i(t, a) * e[a] * o(n, a); return r
            }, CatmullRom: function (e, t) {
                var r = e.length - 1, n = r * t, i = Math.floor(n), o = TWEEN.Interpolation.Utils.CatmullRom; return e[0] === e[r] ? (0 > t && (i = Math.floor(n = r * (1 + t))), o(e[(i - 1 + r) % r], e[i], e[(i + 1) % r], e[(i + 2) % r], n - i)) : 0 > t ? e[0] - (o(e[0], e[0], e[1], e[1], -n) - e[0]) : t > 1 ? e[r] - (o(e[r], e[r], e[r - 1], e[r - 1], n - r) - e[r]) : o(e[i ? i - 1 : 0], e[i], e[i + 1 > r ? r : i + 1], e[i + 2 > r ? r : i + 2], n - i)
            }, Utils: {
                Linear: function (e, t, r) {
                    return (t - e) * r + e
                }, Bernstein: function (e, t) {
                    var r = TWEEN.Interpolation.Utils.Factorial; return r(e) / r(t) / r(e - t)
                }, Factorial: function () {
                    var e = [1]; return function (t) {
                        var r = 1; if (e[t]) return e[t]; for (var n = t; n > 1; n--)r *= n; return e[t] = r, r
                    }
                }(), CatmullRom: function (e, t, r, n, i) {
                    var o = .5 * (r - e), a = .5 * (n - t), s = i * i, h = i * s; return (2 * t - 2 * r + o + a) * h + (-3 * t + 3 * r - 2 * o - a) * s + o * i + t
                }
            }
        }, function (e) {
            "function" == typeof define && define.amd ? define([], function () {
                return TWEEN
            }) : "object" == typeof exports ? module.exports = TWEEN : e.TWEEN = TWEEN
        }(this), function () {
            function e() {
            } function t(e) {
                return e
            } function r(e) {
                return !!e
            } function n(e) {
                return !e
            } function i(e) {
                return function () {
                    if (null === e) throw new Error("Callback was already called."); e.apply(this, arguments), e = null
                }
            } function o(e) {
                return function () {
                    null !== e && (e.apply(this, arguments), e = null)
                }
            } function a(e) {
                return F(e) || "number" == typeof e.length && e.length >= 0 && e.length % 1 === 0
            } function s(e, t) {
                for (var r = -1, n = e.length; ++r < n;)t(e[r], r, e)
            } function h(e, t) {
                for (var r = -1, n = e.length, i = Array(n); ++r < n;)i[r] = t(e[r], r, e); return i
            } function c(e) {
                return h(Array(e), function (e, t) {
                    return t
                })
            } function u(e, t, r) {
                return s(e, function (e, n, i) {
                    r = t(r, e, n, i)
                }), r
            } function l(e, t) {
                s(V(e), function (r) {
                    t(e[r], r)
                })
            } function p(e, t) {
                for (var r = 0; r < e.length; r++)if (e[r] === t) return r; return -1
            } function f(e) {
                var t, r, n = -1; return a(e) ? (t = e.length, function () {
                    return n++, t > n ? n : null
                }) : (r = V(e), t = r.length, function () {
                    return n++, t > n ? r[n] : null
                })
            } function d(e, t) {
                return t = null == t ? e.length - 1 : +t, function () {
                    for (var r = Math.max(arguments.length - t, 0), n = Array(r), i = 0; r > i; i++)n[i] = arguments[i + t]; switch (t) {
                        case 0: return e.call(this, n); case 1: return e.call(this, arguments[0], n)
                    }
                }
            } function E(e) {
                return function (t, r, n) {
                    return e(t, n)
                }
            } function m(t) {
                return function (r, n, a) {
                    a = o(a || e), r = r || []; var s = f(r); if (0 >= t) return a(null); var h = !1, c = 0, u = !1; !function l() {
                        if (h && 0 >= c) return a(null); for (; t > c && !u;) {
                            var e = s(); if (null === e) return h = !0, void (0 >= c && a(null)); c += 1, n(r[e], e, i(function (e) {
                                c -= 1, e ? (a(e), u = !0) : l()
                            }))
                        }
                    }()
                }
            } function g(e) {
                return function (t, r, n) {
                    return e(P.eachOf, t, r, n)
                }
            } function v(e) {
                return function (t, r, n, i) {
                    return e(m(r), t, n, i)
                }
            } function T(e) {
                return function (t, r, n) {
                    return e(P.eachOfSeries, t, r, n)
                }
            } function y(t, r, n, i) {
                i = o(i || e), r = r || []; var s = a(r) ? [] : {}; t(r, function (e, t, r) {
                    n(e, function (e, n) {
                        s[t] = n, r(e)
                    })
                }, function (e) {
                    i(e, s)
                })
            } function R(e, t, r, n) {
                var i = []; e(t, function (e, t, n) {
                    r(e, function (r) {
                        r && i.push({
                            index: t, value: e
                        }), n()
                    })
                }, function () {
                    n(h(i.sort(function (e, t) {
                        return e.index - t.index
                    }), function (e) {
                        return e.value
                    }))
                })
            } function x(e, t, r, n) {
                R(e, t, function (e, t) {
                    r(e, function (e) {
                        t(!e)
                    })
                }, n)
            } function H(e, t, r) {
                return function (n, i, o, a) {
                    function s() {
                        a && a(r(!1, void 0))
                    } function h(e, n, i) {
                        return a ? void o(e, function (n) {
                            a && t(n) && (a(r(!0, e)), a = o = !1), i()
                        }) : i()
                    } arguments.length > 3 ? e(n, i, h, s) : (a = o, o = i, e(n, h, s))
                }
            } function b(e, t) {
                return t
            } function w(t, r, n) {
                n = n || e; var i = a(r) ? [] : {}; t(r, function (e, t, r) {
                    e(d(function (e, n) {
                        n.length <= 1 && (n = n[0]), i[t] = n, r(e)
                    }))
                }, function (e) {
                    n(e, i)
                })
            } function M(e, t, r, n) {
                var i = []; e(t, function (e, t, n) {
                    r(e, function (e, t) {
                        i = i.concat(t || []), n(e)
                    })
                }, function (e) {
                    n(e, i)
                })
            } function S(t, r, n) {
                function o(t, r, n, i) {
                    if (null != i && "function" != typeof i) throw new Error("task callback must be a function"); return t.started = !0, F(r) || (r = [r]), 0 === r.length && t.idle() ? P.setImmediate(function () {
                        t.drain()
                    }) : (s(r, function (r) {
                        var o = {
                            data: r, callback: i || e
                        }; n ? t.tasks.unshift(o) : t.tasks.push(o), t.tasks.length === t.concurrency && t.saturated()
                    }), void P.setImmediate(t.process))
                } function a(e, t) {
                    return function () {
                        c -= 1; var r = !1, n = arguments; s(t, function (e) {
                            s(u, function (t, n) {
                                t !== e || r || (u.splice(n, 1), r = !0)
                            }), e.callback.apply(e, n)
                        }), e.tasks.length + c === 0 && e.drain(), e.process()
                    }
                } if (null == r) r = 1; else if (0 === r) throw new Error("Concurrency must not be zero"); var c = 0, u = [], l = {
                    tasks: [], concurrency: r, payload: n, saturated: e, empty: e, drain: e, started: !1, paused: !1, push: function (e, t) {
                        o(l, e, !1, t)
                    }, kill: function () {
                        l.drain = e, l.tasks = []
                    }, unshift: function (e, t) {
                        o(l, e, !0, t)
                    }, process: function () {
                        if (!l.paused && c < l.concurrency && l.tasks.length) for (; c < l.concurrency && l.tasks.length;) {
                            var e = l.payload ? l.tasks.splice(0, l.payload) : l.tasks.splice(0, l.tasks.length), r = h(e, function (e) {
                                return e.data
                            }); 0 === l.tasks.length && l.empty(), c += 1, u.push(e[0]); var n = i(a(l, e)); t(r, n)
                        }
                    }, length: function () {
                        return l.tasks.length
                    }, running: function () {
                        return c
                    }, workersList: function () {
                        return u
                    }, idle: function () {
                        return l.tasks.length + c === 0
                    }, pause: function () {
                        l.paused = !0
                    }, resume: function () {
                        if (l.paused !== !1) {
                            l.paused = !1; for (var e = Math.min(l.concurrency, l.tasks.length), t = 1; e >= t; t++)P.setImmediate(l.process)
                        }
                    }
                }; return l
            } function _(e) {
                return d(function (t, r) {
                    t.apply(null, r.concat([d(function (t, r) {
                        "object" == typeof console && (t ? console.error && console.error(t) : console[e] && s(r, function (t) {
                            console[e](t)
                        }))
                    })]))
                })
            } function C(e) {
                return function (t, r, n) {
                    e(c(t), r, n)
                }
            } function A(e) {
                return d(function (t, r) {
                    var n = d(function (r) {
                        var n = this, i = r.pop(); return e(t, function (e, t, i) {
                            e.apply(n, r.concat([i]))
                        }, i)
                    }); return r.length ? n.apply(this, r) : n
                })
            } function L(e) {
                return d(function (t) {
                    var r = t.pop(); t.push(function () {
                        var e = arguments; n ? P.setImmediate(function () {
                            r.apply(null, e)
                        }) : r.apply(null, e)
                    }); var n = !0; e.apply(this, t), n = !1
                })
            } var k, P = {}, D = "object" == typeof self && self.self === self && self || "object" == typeof global && global.global === global && global || this; null != D && (k = D.async), P.noConflict = function () {
                return D.async = k, P
            }; var O = Object.prototype.toString, F = Array.isArray || function (e) {
                return "[object Array]" === O.call(e)
            }, N = function (e) {
                var t = typeof e; return "function" === t || "object" === t && !!e
            }, V = Object.keys || function (e) {
                var t = []; for (var r in e) e.hasOwnProperty(r) && t.push(r); return t
            }, U = "function" == typeof setImmediate && setImmediate, B = U ? function (e) {
                U(e)
            } : function (e) {
                setTimeout(e, 0)
            }; "object" == typeof process && "function" == typeof process.nextTick ? P.nextTick = process.nextTick : P.nextTick = B, P.setImmediate = U ? B : P.nextTick, P.forEach = P.each = function (e, t, r) {
                return P.eachOf(e, E(t), r)
            }, P.forEachSeries = P.eachSeries = function (e, t, r) {
                return P.eachOfSeries(e, E(t), r)
            }, P.forEachLimit = P.eachLimit = function (e, t, r, n) {
                return m(t)(e, E(r), n)
            }, P.forEachOf = P.eachOf = function (t, r, n) {
                function a(e) {
                    c--, e ? n(e) : null === s && 0 >= c && n(null)
                } n = o(n || e), t = t || []; for (var s, h = f(t), c = 0; null != (s = h());)c += 1, r(t[s], s, i(a)); 0 === c && n(null)
            }, P.forEachOfSeries = P.eachOfSeries = function (t, r, n) {
                function a() {
                    var e = !0; return null === h ? n(null) : (r(t[h], h, i(function (t) {
                        if (t) n(t); else {
                            if (h = s(), null === h) return n(null); e ? P.setImmediate(a) : a()
                        }
                    })), void (e = !1))
                } n = o(n || e), t = t || []; var s = f(t), h = s(); a()
            }, P.forEachOfLimit = P.eachOfLimit = function (e, t, r, n) {
                m(t)(e, r, n)
            }, P.map = g(y), P.mapSeries = T(y), P.mapLimit = v(y), P.inject = P.foldl = P.reduce = function (e, t, r, n) {
                P.eachOfSeries(e, function (e, n, i) {
                    r(t, e, function (e, r) {
                        t = r, i(e)
                    })
                }, function (e) {
                    n(e, t)
                })
            }, P.foldr = P.reduceRight = function (e, r, n, i) {
                var o = h(e, t).reverse(); P.reduce(o, r, n, i)
            }, P.transform = function (e, t, r, n) {
                3 === arguments.length && (n = r, r = t, t = F(e) ? [] : {}), P.eachOf(e, function (e, n, i) {
                    r(t, e, n, i)
                }, function (e) {
                    n(e, t)
                })
            }, P.select = P.filter = g(R), P.selectLimit = P.filterLimit = v(R), P.selectSeries = P.filterSeries = T(R), P.reject = g(x), P.rejectLimit = v(x), P.rejectSeries = T(x), P.any = P.some = H(P.eachOf, r, t), P.someLimit = H(P.eachOfLimit, r, t), P.all = P.every = H(P.eachOf, n, n), P.everyLimit = H(P.eachOfLimit, n, n), P.detect = H(P.eachOf, t, b), P.detectSeries = H(P.eachOfSeries, t, b), P.detectLimit = H(P.eachOfLimit, t, b), P.sortBy = function (e, t, r) {
                function n(e, t) {
                    var r = e.criteria, n = t.criteria; return n > r ? -1 : r > n ? 1 : 0
                } P.map(e, function (e, r) {
                    t(e, function (t, n) {
                        t ? r(t) : r(null, {
                            value: e, criteria: n
                        })
                    })
                }, function (e, t) {
                    return e ? r(e) : void r(null, h(t.sort(n), function (e) {
                        return e.value
                    }))
                })
            }, P.auto = function (t, r, n) {
                function i(e) {
                    g.unshift(e)
                } function a(e) {
                    var t = p(g, e); t >= 0 && g.splice(t, 1)
                } function h() {
                    f--, s(g.slice(0), function (e) {
                        e()
                    })
                } n || (n = r, r = null), n = o(n || e); var c = V(t), f = c.length; if (!f) return n(null); r || (r = f); var E = {}, m = 0, g = []; i(function () {
                    f || n(null, E)
                }), s(c, function (e) {
                    function o() {
                        return r > m && u(v, function (e, t) {
                            return e && E.hasOwnProperty(t)
                        }, !0) && !E.hasOwnProperty(e)
                    } function s() {
                        o() && (m++, a(s), f[f.length - 1](g, E))
                    } for (var c, f = F(t[e]) ? t[e] : [t[e]], g = d(function (t, r) {
                        if (m--, r.length <= 1 && (r = r[0]), t) {
                            var i = {}; l(E, function (e, t) {
                                i[t] = e
                            }), i[e] = r, n(t, i)
                        } else E[e] = r, P.setImmediate(h)
                    }), v = f.slice(0, f.length - 1), T = v.length; T--;) {
                        if (!(c = t[v[T]])) throw new Error("Has inexistant dependency"); if (F(c) && p(c, e) >= 0) throw new Error("Has cyclic dependencies")
                    } o() ? (m++, f[f.length - 1](g, E)) : i(s)
                })
            }, P.retry = function (e, t, r) {
                function n(e, t) {
                    if ("number" == typeof t) e.times = parseInt(t, 10) || o; else {
                        if ("object" != typeof t) throw new Error("Unsupported argument type for 'times': " + typeof t); e.times = parseInt(t.times, 10) || o, e.interval = parseInt(t.interval, 10) || a
                    }
                } function i(e, t) {
                    function r(e, r) {
                        return function (n) {
                            e(function (e, t) {
                                n(!e || r, {
                                    err: e, result: t
                                })
                            }, t)
                        }
                    } function n(e) {
                        return function (t) {
                            setTimeout(function () {
                                t(null)
                            }, e)
                        }
                    } for (; h.times;) {
                        var i = !(h.times -= 1); s.push(r(h.task, i)), !i && h.interval > 0 && s.push(n(h.interval))
                    } P.series(s, function (t, r) {
                        r = r[r.length - 1], (e || h.callback)(r.err, r.result)
                    })
                } var o = 5, a = 0, s = [], h = {
                    times: o, interval: a
                }, c = arguments.length; if (1 > c || c > 3) throw new Error("Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)"); return 2 >= c && "function" == typeof e && (r = t, t = e), "function" != typeof e && n(h, e), h.callback = r, h.task = t, h.callback ? i() : i
            }, P.waterfall = function (t, r) {
                function n(e) {
                    return d(function (t, i) {
                        if (t) r.apply(null, [t].concat(i)); else {
                            var o = e.next(); o ? i.push(n(o)) : i.push(r), L(e).apply(null, i)
                        }
                    })
                } if (r = o(r || e), !F(t)) {
                    var i = new Error("First argument to waterfall must be an array of functions"); return r(i)
                } return t.length ? void n(P.iterator(t))() : r()
            }, P.parallel = function (e, t) {
                w(P.eachOf, e, t)
            }, P.parallelLimit = function (e, t, r) {
                w(m(t), e, r)
            }, P.series = function (e, t) {
                w(P.eachOfSeries, e, t)
            }, P.iterator = function (e) {
                function t(r) {
                    function n() {
                        return e.length && e[r].apply(null, arguments), n.next()
                    } return n.next = function () {
                        return r < e.length - 1 ? t(r + 1) : null
                    }, n
                } return t(0)
            }, P.apply = d(function (e, t) {
                return d(function (r) {
                    return e.apply(null, t.concat(r))
                })
            }), P.concat = g(M), P.concatSeries = T(M), P.whilst = function (t, r, n) {
                if (n = n || e, t()) {
                    var i = d(function (e, o) {
                        e ? n(e) : t.apply(this, o) ? r(i) : n(null)
                    }); r(i)
                } else n(null)
            }, P.doWhilst = function (e, t, r) {
                var n = 0; return P.whilst(function () {
                    return ++n <= 1 || t.apply(this, arguments)
                }, e, r)
            }, P.until = function (e, t, r) {
                return P.whilst(function () {
                    return !e.apply(this, arguments)
                }, t, r)
            }, P.doUntil = function (e, t, r) {
                return P.doWhilst(e, function () {
                    return !t.apply(this, arguments)
                }, r)
            }, P.during = function (t, r, n) {
                n = n || e; var i = d(function (e, r) {
                    e ? n(e) : (r.push(o), t.apply(this, r))
                }), o = function (e, t) {
                    e ? n(e) : t ? r(i) : n(null)
                }; t(o)
            }, P.doDuring = function (e, t, r) {
                var n = 0; P.during(function (e) {
                    n++ < 1 ? e(null, !0) : t.apply(this, arguments)
                }, e, r)
            }, P.queue = function (e, t) {
                var r = S(function (t, r) {
                    e(t[0], r)
                }, t, 1); return r
            }, P.priorityQueue = function (t, r) {
                function n(e, t) {
                    return e.priority - t.priority
                } function i(e, t, r) {
                    for (var n = -1, i = e.length - 1; i > n;) {
                        var o = n + (i - n + 1 >>> 1); r(t, e[o]) >= 0 ? n = o : i = o - 1
                    } return n
                } function o(t, r, o, a) {
                    if (null != a && "function" != typeof a) throw new Error("task callback must be a function"); return t.started = !0, F(r) || (r = [r]), 0 === r.length ? P.setImmediate(function () {
                        t.drain()
                    }) : void s(r, function (r) {
                        var s = {
                            data: r, priority: o, callback: "function" == typeof a ? a : e
                        }; t.tasks.splice(i(t.tasks, s, n) + 1, 0, s), t.tasks.length === t.concurrency && t.saturated(), P.setImmediate(t.process)
                    })
                } var a = P.queue(t, r); return a.push = function (e, t, r) {
                    o(a, e, t, r)
                }, delete a.unshift, a
            }, P.cargo = function (e, t) {
                return S(e, 1, t)
            }, P.log = _("log"), P.dir = _("dir"), P.memoize = function (e, r) {
                var n = {}, i = {}; r = r || t; var o = d(function (t) {
                    var o = t.pop(), a = r.apply(null, t); a in n ? P.setImmediate(function () {
                        o.apply(null, n[a])
                    }) : a in i ? i[a].push(o) : (i[a] = [o], e.apply(null, t.concat([d(function (e) {
                        n[a] = e; var t = i[a]; delete i[a]; for (var r = 0, o = t.length; o > r; r++)t[r].apply(null, e)
                    })])))
                }); return o.memo = n, o.unmemoized = e, o
            }, P.unmemoize = function (e) {
                return function () {
                    return (e.unmemoized || e).apply(null, arguments)
                }
            }, P.times = C(P.map), P.timesSeries = C(P.mapSeries), P.timesLimit = function (e, t, r, n) {
                return P.mapLimit(c(e), t, r, n)
            }, P.seq = function () {
                var t = arguments; return d(function (r) {
                    var n = this,
                    i = r[r.length - 1];
                    "function" == typeof i ? r.pop() : i = e,
                    P.reduce(t,
                    r,
                    function (e, t, r) {
                        t.apply(n, e.concat([d(function (e, t) {
                            r(e, t)
                        })]))
                    }, function (e, t) {
                        i.apply(n, [e].concat(t))
                    })
                })
            }, P.compose = function () {
                return P.seq.apply(null, Array.prototype.reverse.call(arguments))
            }, P.applyEach = A(P.eachOf), P.applyEachSeries = A(P.eachOfSeries), P.forever = function (t, r) {
                function n(e) {
                    return e ? o(e) : void a(n)
                } var o = i(r || e), a = L(t); n()
            }, P.ensureAsync = L, P.constant = d(function (e) {
                var t = [null].concat(e); return function (e) {
                    return e.apply(this, t)
                }
            }), P.wrapSync = P.asyncify = function (e) {
                return d(function (t) {
                    var r, n = t.pop(); try {
                        r = e.apply(this, t)
                    } catch (i) {
                        return n(i)
                    } N(r) && "function" == typeof r.then ? r.then(function (e) {
                        n(null, e)
                    })["catch"](function (e) {
                        n(e.message ? e : new Error(e))
                    }) : n(null, r)
                })
            }, "object" == typeof module && module.exports ? module.exports = P : "function" == typeof define && define.amd ? define([], function () {
                return P
            }) : D.async = P
        }(), !function (e) {
            function t() {
                var e = arguments[0], r = t.cache; return r[e] && r.hasOwnProperty(e) || (r[e] = t.parse(e)), t.format.call(null, r[e], arguments)
            } function r(e) {
                return Object.prototype.toString.call(e).slice(8, -1).toLowerCase()
            } function n(e, t) {
                return Array(t + 1).join(e)
            } var i = {
                not_string: /[^s]/, number: /[diefg]/, json: /[j]/, not_json: /[^j]/, text: /^[^\x25]+/, modulo: /^\x25{2}/, placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijosuxX])/, key: /^([a-z_][a-z_\d]*)/i, key_access: /^\.([a-z_][a-z_\d]*)/i, index_access: /^\[(\d+)\]/, sign: /^[\+\-]/
            }; t.format = function (e, o) {
                var a, s, h, c, u, l, p, f = 1, d = e.length, E = "", m = [], g = !0, v = ""; for (s = 0; d > s; s++)if (E = r(e[s]), "string" === E) m[m.length] = e[s]; else if ("array" === E) {
                    if (c = e[s], c[2]) for (a = o[f], h = 0; h < c[2].length; h++) {
                        if (!a.hasOwnProperty(c[2][h])) throw new Error(t("[sprintf] property '%s' does not exist", c[2][h])); a = a[c[2][h]]
                    } else a = c[1] ? o[c[1]] : o[f++]; if ("function" == r(a) && (a = a()), i.not_string.test(c[8]) && i.not_json.test(c[8]) && "number" != r(a) && isNaN(a)) throw new TypeError(t("[sprintf] expecting number but found %s", r(a))); switch (i.number.test(c[8]) && (g = a >= 0), c[8]) {
                        case "b": a = a.toString(2); break; case "c": a = String.fromCharCode(a); break; case "d": case "i": a = parseInt(a, 10); break; case "j": a = JSON.stringify(a, null, c[6] ? parseInt(c[6]) : 0); break; case "e": a = c[7] ? a.toExponential(c[7]) : a.toExponential(); break; case "f": a = c[7] ? parseFloat(a).toFixed(c[7]) : parseFloat(a); break; case "g": a = c[7] ? parseFloat(a).toPrecision(c[7]) : parseFloat(a); break; case "o": a = a.toString(8); break; case "s": a = (a = String(a)) && c[7] ? a.substring(0, c[7]) : a; break; case "u": a >>>= 0; break; case "x": a = a.toString(16); break; case "X": a = a.toString(16).toUpperCase()
                    }i.json.test(c[8]) ? m[m.length] = a : (!i.number.test(c[8]) || g && !c[3] ? v = "" : (v = g ? "+" : "-", a = a.toString().replace(i.sign, "")), l = c[4] ? "0" === c[4] ? "0" : c[4].charAt(1) : " ", p = c[6] - (v + a).length, u = c[6] && p > 0 ? n(l, p) : "", m[m.length] = c[5] ? v + a + u : "0" === l ? v + u + a : u + v + a)
                } return m.join("")
            }, t.cache = {}, t.parse = function (e) {
                for (var t = e, r = [], n = [], o = 0; t;) {
                    if (null !== (r = i.text.exec(t))) n[n.length] = r[0]; else if (null !== (r = i.modulo.exec(t))) n[n.length] = "%"; else {
                        if (null === (r = i.placeholder.exec(t))) throw new SyntaxError("[sprintf] unexpected placeholder"); if (r[2]) {
                            o |= 1; var a = [], s = r[2], h = []; if (null === (h = i.key.exec(s))) throw new SyntaxError("[sprintf] failed to parse named argument key"); for (a[a.length] = h[1]; "" !== (s = s.substring(h[0].length));)if (null !== (h = i.key_access.exec(s))) a[a.length] = h[1]; else {
                                if (null === (h = i.index_access.exec(s))) throw new SyntaxError("[sprintf] failed to parse named argument key"); a[a.length] = h[1]
                            } r[2] = a
                        } else o |= 2; if (3 === o) throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported"); n[n.length] = r
                    } t = t.substring(r[0].length)
                } return n
            }; var o = function (e, r, n) {
                return n = (r || []).slice(0), n.splice(0, 0, e), t.apply(null, n)
            }; "undefined" != typeof exports ? (exports.sprintf = t, exports.vsprintf = o) : (e.sprintf = t, e.vsprintf = o, "function" == typeof define && define.amd && define(function () {
                return {
                    sprintf: t, vsprintf: o
                }
            }))
        }("undefined" == typeof window ? this : window); var globe, markers, mouse = new THREE.Vector2(-2, -2), raycaster = new THREE.Raycaster, mouseDown = !1, clicked = !1, touch = !1, activeClick = !1, tweens = [], globeCount = 0, API_URL = "http://66.94.126.40:30014/association/getAll"; $(function () {
            return Detector.webgl ? ($(window).on("resize", onWindowResize), $(window).on("keyup", onKeyUp), $("#globe").on("mousewheel", onZoom), $("#globe").on("mousemove", onMouseMove), $("#globe").on("mousedown", onMouseDown), $("#globe").on("touchend", onTouchEnd), $("#globe").on("click", onClick), $(document).bind("touchmove", function (e) {
                e.preventDefault()
            }), $("#close-zoom").on("click", function (e) {
                e.stopPropagation(), exitZoom()
            }), $("#globe").on(function (e) {
                for (var t in markers) markers[t].tick()
            }), void loadTextures(function () {
                createGlobe(), markers = new Markers(globe.scene), getSites(function (e) {
                    var t = $(".search__list"); for (var r in e) {
                        var n = new Installation(globe, parseFloat(e[r].latitude), parseFloat(e[r].longitude), e[r]); n.id = e[r].id, markers.add(n); var i = $.parseHTML('<li><a class="search__item" href="#"><span class="search__item__text"></span></a></li>'); $(i).attr("id", "search__item-" + e[r].id), $(i).find(".search__item").data("id", e[r].id), $(i).find(".search__item").data("match", !0), $(i).find(".search__item__text").text(e[r].name), t.append(i)
                    } markers.createCluster(1, .1), markers.createCluster(2, .03), markers.activateLevel(1), $(".js-flex-height").flexHeight()
                })
            })) : void Detector.addGetWebGLMessage({
                parent: document.getElementById("globe")
            })
        }); var Detector = {
            canvas: !!window.CanvasRenderingContext2D, webgl: function () {
                try {
                    var e = document.createElement("canvas"); return !(!window.WebGLRenderingContext || !e.getContext("webgl") && !e.getContext("experimental-webgl"))
                } catch (t) {
                    return !1
                }
            }(), workers: !!window.Worker, fileapi: window.File && window.FileReader && window.FileList && window.Blob, getWebGLErrorMessage: function () {
                var e = document.createElement("div"); return e.id = "webgl-error-message", e.style.fontFamily = "monospace", e.style.fontSize = "13px", e.style.fontWeight = "normal", e.style.textAlign = "center", e.style.background = "#fff", e.style.color = "#000", e.style.padding = "1.5em", e.style.width = "400px", e.style.margin = "5em auto 0", this.webgl || (e.innerHTML = window.WebGLRenderingContext ? ['Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />', 'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'].join("\n") : ['Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>', 'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'].join("\n")), e
            }, addGetWebGLMessage: function (e) {
                var t, r, n; e = e || {}, t = void 0 !== e.parent ? e.parent : document.body, r = void 0 !== e.id ? e.id : "oldie", n = Detector.getWebGLErrorMessage(), n.id = r, t.appendChild(n)
            }
        }; "object" == typeof module && (module.exports = Detector), $(document).ready(function () {
            $(".js-filter-list").on("keyup", function () {
                var e = $(".js-filter > li > a"), t = $(this).val().toLowerCase(); "" === t ? (e.data("match", !0), e.parent("li").show()) : e.each(function () {
                    var e = $(this).text().toLowerCase(); $(this).parent("li"); $(this).data("match", e.indexOf(t) >= 0)
                }), filterSearch()
            }), $(".js-filter-list").on("click", function (e) {
                e.preventDefault()
            })
        }), function (e) {
            e.fn.flexHeight = function () {
                var t = this, r = function () {
                    t.each(function () {
                        var t = e(this), r = Math.min(t.parent().height(), e(window).height()), n = t.parent().outerHeight(!0) - t.parent().height(); t.siblings().each(function () {
                            n += e(this).outerHeight(!0)
                        }), t.height(r - n)
                    })
                }; e(window).resize(r), r()
            }
        }(jQuery); var latLonToXYZ = function (e, t, r, n) {
            var i = Math.floor(e / 2 + e / 360 * n), o = Math.floor(t / 2 + t / 180 * r); return {
                x: i, y: o
            }
        }, latLon2d = function (e, t) {
            var r = 2 + Math.abs(e) / 90 * 15; return {
                x: e + 90, y: t + 180, rad: r
            }
        }, createSphere = function (e, t) {
            return new THREE.Mesh(new THREE.SphereGeometry(e, t, t), new THREE.MeshPhongMaterial({
                map: textures.map, bumpMap: textures.mapBumpMap, bumpScale: .005, specularMap: textures.mapSpecular, specular: new THREE.Color("gray")
            }))
        }, createStarfield = function (e, t) {
            return new THREE.Mesh(new THREE.SphereGeometry(e, t, t), new THREE.MeshBasicMaterial({
                map: textures.mapStarfield, side: THREE.BackSide
            }))
        }, createOuterGlow = function (e, t) {
            return new THREE.Mesh(new THREE.PlaneGeometry(e, e, t, t), new THREE.MeshBasicMaterial({
                map: textures.mapGlow, opacity: .35, transparent: !0, depthWrite: !1
            }))
        }, createInnerGlow = function (e, t) {
            return new THREE.Mesh(new THREE.PlaneGeometry(e, e, t, t), new THREE.MeshBasicMaterial({
                map: textures.mapGlowInner, opacity: .35, depthWrite: !1, depthTest: !1, transparent: !0
            }))
        }, createInnerShadow = function (e, t) {
            return new THREE.Mesh(new THREE.PlaneGeometry(e, e, t, t), new THREE.MeshBasicMaterial({
                map: textures.mapShadow, opacity: .6, depthWrite: !1, depthTest: !1, transparent: !0
            }))
        }, createClouds = function () {
            var e, t = 3, r = 30, n = new THREE.Object3D; for (e = 0; r > e; e++) {
                var i = new THREE.SpriteMaterial({
                    map: textures["cloud" + e % t], depthWrite: !1, depthTest: !1, opacity: .05, transparent: !0, rotation: 2 * Math.PI * Math.random()
                }), o = new THREE.Sprite(i); o.alpha = .1; var a = Math.random() * Math.PI * 2, s = Math.random() * Math.PI, h = .2 + .2 * Math.random(); o.position.x = h * Math.sin(a) * Math.cos(s), o.position.y = h * Math.sin(a) * Math.sin(s), o.position.z = h * Math.cos(a); var c = .4 + .4 * Math.random(); o.scale.set(c, c, c), n.add(o)
            } return n
        }, createStar = function (e) {
            var t = this.mapStarLarge; switch (e) {
                case "xs": t = textures.mapStarExtraSmall; break; case "s": t = textures.mapStarSmall; break; case "l": t = textures.mapStarLarge
            }var r = new THREE.Sprite(new THREE.SpriteMaterial({
                map: t, color: 16777215, fog: !0, transparent: !0
            })); return r.scale.set(.05, .05, .05), r
        }; Globe.prototype.init = function (e) {
            this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, .01, 300), this.camera.position.z = this.cameraDistance, this.controls = new THREE.OrbitControls(this.camera, $("#globe")[0]), this.controls.noPan = !0, this.controls.noZoom = !1, this.controls.minPolarAngle = 0, this.controls.maxPolarAngle = Math.PI, this.cameraAngle = 0, this.scene = new THREE.Scene, this.scene.add(new THREE.AmbientLight(13421772)); var t = new THREE.DirectionalLight(16777215, .2); t.position.set(5, 3, 5), this.scene.add(t), this.clouds = createClouds.call(this), this.scene.add(this.clouds), this.earth = createSphere.call(this, .5, 32), this.scene.add(this.earth), this.outerGlow = createOuterGlow.call(this, 1.2, 1), this.scene.add(this.outerGlow), this.innerShadow = createInnerShadow.call(this, 1.03, 1), this.scene.add(this.innerShadow), this.innerGlow = createInnerGlow.call(this, 1.03, 1), this.scene.add(this.innerGlow), this.stars = []; for (var r = 0; 100 > r; r++) {
                var n = "xs"; switch (Math.floor(2 * Math.random())) {
                    case 0: n = "xs"; break; case 1: n = "s"; break; case 2: n = "l"
                }this.stars[r] = createStar.call(this, n), this.stars[r].position.x = -2 + 4 * Math.random(), this.stars[r].position.y = -2 + 4 * Math.random(), this.stars[r].position.z = -2 + 4 * Math.random(), this.scene.add(this.stars[r])
            } this.rotationSpeed = 5, this.zoom = 1, setTimeout(e, 500)
        }, Globe.prototype.destroy = function (e) {
            var t = this; this.active = !1, setTimeout(function () {
                for (; t.scene.children.length > 0;)t.scene.remove(t.scene.children[0]); "function" == typeof e && e()
            }, 1e3)
        }, Globe.prototype.setScale = function (e) {
            this.scale = e, this.cameraDistance = 10 / e, this.scene && this.camera.updateProjectionMatrix()
        }, Globe.prototype.setPosition = function (e, t) {
            var r = {
                phi: this.controls.getPolarAngle(), theta: this.controls.getAzimuthalAngle()
            }, n = {
                phi: e, theta: t + this.earth.rotation.y - Math.PI / 2
            }, i = (n.theta - r.theta) % (2 * Math.PI); i > Math.PI && (i -= 2 * Math.PI), n.theta = r.theta + i; var o = this; tweens.push(new TWEEN.Tween(r).to(n, 500).easing(TWEEN.Easing.Cubic.Out).onUpdate(function () {
                o.controls.rotateLeft(o.controls.getAzimuthalAngle() - r.theta), o.controls.rotateUp(o.controls.getPolarAngle() - r.phi)
            }))
        }, Globe.prototype.setZoom = function (e) {
            this.setCustomZoom(e); var t = this; tweens.push(new TWEEN.Tween(this.camera).to({
                zoom: e
            }, 500).easing(TWEEN.Easing.Cubic.Out).onUpdate(function () {
                t.camera.updateProjectionMatrix()
            }))
        }, Globe.prototype.setCustomZoom = function (e) {
            this.zoom = e; var t = this; for (var r in this.clouds.children) tweens.push(new TWEEN.Tween(this.clouds.children[r].material).to({
                opacity: e > 1 ? .01 : .05
            }, 100)); this.rotationSpeed = e > 1 ? 0 : 5, this.controls.rotateSpeed = e > 1 ? .15 : 1, tweens.push(new TWEEN.Tween(this.stars[0].material).to({
                opacity: e > 1 ? 0 : 1
            }, 100).onUpdate(function () {
                for (var e in t.stars) t.stars[e].material.opacity = t.stars[0].material.opacity
            }))
        }, Globe.prototype.tick = function () {
            if (this.camera) {
                this.firstRunTime || (this.firstRunTime = Date.now()), this.lastRenderDate || (this.lastRenderDate = new Date), this.firstRenderDate || (this.firstRenderDate = new Date), this.totalRunTime = new Date - this.firstRenderDate; var e = new Date - this.lastRenderDate; this.lastRenderDate = new Date; var t = this.rotationSpeed * Math.PI / (this.dayLength / e), r = (this.rotationSpeed + .2) * Math.PI / (this.dayLength / e) * 10; this.eulerRotation || (this.eulerRotation = new THREE.Euler), this.eulerRotation.setFromVector3(this.earth.rotation), this.earth && (this.earth.rotation.y += t), this.clouds.rotation.y -= r, this.active || (this.cameraDistance += 1e3 * e / 1e3), this.controls.update(), this.camera.lookAt(this.scene.position), this.outerGlow.lookAt(this.camera.position), this.innerGlow.lookAt(this.camera.position), this.innerShadow.lookAt(this.camera.position)
            }
        }, Globe.prototype.render = function () {
            this.renderer.render(this.scene, this.camera)
        }; var numberedClusterTextures = {}, hideMarkers = !1; Marker.prototype.tick = function () {
            var e = this.move(), t = e.distanceTo(this.globe.camera.position), r = 1.8, n = 1.9; this.shadowMaterial.opacity = this.material.opacity = t > r ? t > 2 ? 0 : 1 - (t - r) / (n - r) : 1, this.visible = 2 > t
        }, Marker.prototype.move = function () {
            var e = this.position.clone(); if (this.globe.eulerRotation && this.show && this.sprite.scale.x > 0) {
                e.applyEuler(this.globe.eulerRotation); var t = this.globe.camera.matrix.elements, r = this.sprite.scale.y / 2, n = new THREE.Vector3(t[4], t[5], t[6]); n.multiplyScalar(r), e.add(n), this.shadowSprite.position.set(-n.x / this.sprite.scale.x, -n.y / this.sprite.scale.y, -n.z / this.sprite.scale.z)
            } return this.sprite.position.set(e.x, e.y, e.z), e
        }, Marker.prototype.resize = function () {
            var e = this.selected || this.active ? .1 / this.zoom : hideMarkers ? 0 : .06 / this.zoom, t = {
                x: e, y: e, z: e
            }, r = this; tweens.push(new TWEEN.Tween(this.sprite.scale).to(t, 500).easing(TWEEN.Easing.Elastic.Out).onUpdate(function () {
                r.move()
            }))
        }, Marker.prototype.setSelected = function (e) {
            e = e && this.visible, e != this.selected && (this.selected = e, this.resize())
        }, Marker.prototype.setActive = function (e) {
            e != this.active && (this.active = e, this.resize())
        }, Marker.prototype.toScreen = function () {
            var e = this.sprite.position.clone(); projScreenMat = new THREE.Matrix4, projScreenMat.multiplyMatrices(this.globe.camera.projectionMatrix, this.globe.camera.matrixWorldInverse), e.applyProjection(projScreenMat); var t = $("#globe"); return {
                x: (e.x + 1) * t.width() / 2 + t.offset().left, y: (-e.y + 1) * t.height() / 2 + t.offset().top
            }
        }, Installation.prototype = Object.create(Marker.prototype), Installation.prototype.constructor = Installation, Installation.prototype.tick = function () {
            if (Marker.prototype.tick.call(this), this.active) {
                var e = $(".popup"), t = this.toScreen(); e.attr("style", "transform: translate(" + Math.round(t.x - e.width() / 2) + "px, " + Math.round(t.y - e.height() - 80) + "px)")
            }
        }, Installation.prototype.setActive = function (e) {
            $(".search__list > .is-active").removeClass("is-active"), Marker.prototype.setActive.call(this, e), this.active ? ($("#search__item-" + this.data.id).addClass("is-active"), $(".popup").removeClass("hidden"), load_tooltip(this.data), animate_tooltip()) : $(".popup").addClass("hidden")
        }, Cluster.prototype = Object.create(Marker.prototype), Cluster.prototype.constructor = Cluster, Cluster.prototype.setActive = function (e) {
            Marker.prototype.setActive.call(this, e), this.active && showSearchList()
        }, Markers.prototype.add = function (e) {
            this.markers[e.id] = e, this.root.add(e.sprite), e.show = !0, this.zoom = 1, this.level = 1, this.scale = .6
        }, Markers.prototype.activateLevel = function (e) {
            this.level = e; for (var t in this.clusters) for (var r in this.clusters[t]) {
                this.root.remove(this.clusters[t][r].sprite), this.clusters[t][r].show = !1; for (var n in this.clusters[t][r].markers) this.root.add(this.clusters[t][r].markers[n].sprite), this.clusters[t][r].markers[n].cluster = null, this.clusters[t][r].markers[n].show = !0
            } for (var t in this.clusters[e]) {
                this.root.add(this.clusters[e][t].sprite), this.clusters[e][t].show = !0; for (var r in this.clusters[e][t].markers) this.root.remove(this.clusters[e][t].markers[r].sprite), this.clusters[e][t].markers[r].cluster = this.clusters[e][t], this.clusters[e][t].markers[r].show = !1
            }
        }, Markers.prototype.createCluster = function (e, t) {
            if (this.clusters[e]) for (var r in this.clusters[e]) this.root.remove(this.clusters[r].sprite), this.clusters[r].show = !1; this.clusters[e] = []; for (var n in this.markers) this.markers[n].clustered = !1; e: for (var n in this.markers) {
                var i = this.markers[n]; if (!i.clustered) {
                    for (var r in this.clusters[e]) {
                        var o = this.clusters[e][r].position.distanceTo(i.position); if (t > o) {
                            this.clusters[e][r].markers[n] = i, i.clustered = !0; continue e
                        }
                    } for (var r in this.markers) if (!(r >= n)) {
                        var o = this.markers[r].position.distanceTo(i.position); if (!this.markers[r].clustered && t > o) {
                            var a = this.markers[r], s = new Cluster(a.globe, a.lat, a.lon); s.markers[r] = a, s.markers[n] = i, a.clustered = !0, i.clustered = !0, this.clusters[e].push(s); continue e
                        }
                    }
                }
            } for (var r in this.clusters[e]) {
                var h = Object.keys(this.clusters[e][r].markers).length; void 0 == numberedClusterTextures[h] && (numberedClusterTextures[h] = createNumberedTexture(h)), this.clusters[e][r].sprite.material.map = numberedClusterTextures[h], this.clusters[e][r].sprite.material.map.needsUpdate = !0
            }
        }, Markers.prototype.resize = function () {
            var e = hideMarkers ? 0 : .06 / this.zoom, t = this; tweens.push(new TWEEN.Tween(this).to({
                scale: e
            }, 500).delay(100).easing(TWEEN.Easing.Elastic.Out).onUpdate(function () {
                for (var e in t.markers) t.markers[e].active || t.markers[e].sprite.scale.set(t.scale, t.scale, t.scale); for (var e in this.clusters[this.level]) t.clusters[this.level][e].active || t.clusters[this.level][e].sprite.scale.set(t.scale, t.scale, t.scale)
            }))
        }, Markers.prototype.setZoom = function (e) {
            if (this.zoom != e) {
                this.zoom = e, 4 == this.zoom ? this.activateLevel(2) : this.activateLevel(1); for (var t in this.markers) this.markers[t].zoom = e; for (var t in this.clusters[this.level]) this.clusters[this.level][t].zoom = e; this.resize()
            }
        }, Markers.prototype.setActive = function (e) {
            this.activeMarker && (this.activeMarker.setActive(!1), this.activeMarker.cluster && (this.root.remove(this.activeMarker.sprite), this.activeMarker.show = !1)), this.activeMarker = e, e ? (e instanceof Cluster && (this.activeCluster && this.activeCluster.setActive(!1), this.activeCluster = e), e.setActive(!0), e instanceof Installation && (hideMarkers = !0, e.cluster && (this.root.add(this.activeMarker.sprite), this.activeMarker.show = !0))) : (hideMarkers = !1, this.activeCluster = null), this.resize()
        }, THREE.OrbitControls = function (e, t) {
            function r() {
                return 2 * Math.PI / 60 / 60 * d.autoRotateSpeed
            } function n() {
                return Math.pow(.95, d.zoomSpeed)
            } function i(e) {
                if (d.enabled !== !1) {
                    if (e.preventDefault(), e.button === d.mouseButtons.ORBIT) {
                        if (d.noRotate === !0) return; V = N.ROTATE, m.set(e.clientX, e.clientY)
                    } else if (e.button === d.mouseButtons.ZOOM) {
                        if (d.noZoom === !0) return; V = N.DOLLY, b.set(e.clientX, e.clientY)
                    } else if (e.button === d.mouseButtons.PAN) {
                        if (d.noPan === !0) return; V = N.PAN, T.set(e.clientX, e.clientY)
                    } V !== N.NONE && (document.addEventListener("mousemove", o, !1), document.addEventListener("mouseup", a, !1), d.dispatchEvent(G))
                }
            } function o(e) {
                if (d.enabled !== !1) {
                    e.preventDefault(); var t = d.domElement === document ? d.domElement.body : d.domElement; if (V === N.ROTATE) {
                        if (d.noRotate === !0) return; g.set(e.clientX, e.clientY), v.subVectors(g, m), S += 2 * Math.PI * v.x / t.clientWidth * d.rotateSpeed, _ += 2 * Math.PI * v.y / t.clientHeight * d.rotateSpeed, m.copy(g)
                    } else if (V === N.DOLLY) {
                        if (d.noZoom === !0) return; w.set(e.clientX, e.clientY), M.subVectors(w, b), M.y > 0 ? d.dollyIn() : d.dollyOut(), b.copy(w)
                    } else if (V === N.PAN) {
                        if (d.noPan === !0) return; y.set(e.clientX, e.clientY), R.subVectors(y, T), d.pan(R.x, R.y), T.copy(y)
                    } V !== N.NONE && d.update()
                }
            } function a() {
                d.enabled !== !1 && (document.removeEventListener("mousemove", o, !1), document.removeEventListener("mouseup", a, !1), d.dispatchEvent(z), V = N.NONE)
            } function s(e) {
                if (d.enabled !== !1 && d.noZoom !== !0 && V === N.NONE) {
                    e.preventDefault(), e.stopPropagation(); var t = 0; void 0 !== e.wheelDelta ? t = e.wheelDelta : void 0 !== e.detail && (t = -e.detail), t > 0 ? d.dollyIn() : d.dollyOut(), d.update(), d.dispatchEvent(G), d.dispatchEvent(z)
                }
            } function h(e) {
                if (d.enabled !== !1 && d.noKeys !== !0 && d.noPan !== !0) switch (e.keyCode) {
                    case d.keys.UP: d.pan(0, d.keyPanSpeed), d.update(); break; case d.keys.BOTTOM: d.pan(0, -d.keyPanSpeed), d.update(); break; case d.keys.LEFT: d.pan(d.keyPanSpeed, 0), d.update(); break; case d.keys.RIGHT: d.pan(-d.keyPanSpeed, 0), d.update()
                }
            } function c(e) {
                if (d.enabled !== !1) {
                    switch (e.touches.length) {
                        case 1: if (d.noRotate === !0) return; V = N.TOUCH_ROTATE, m.set(e.touches[0].pageX, e.touches[0].pageY); break; case 2: if (d.noZoom === !0) return; V = N.TOUCH_DOLLY; var t = e.touches[0].pageX - e.touches[1].pageX, r = e.touches[0].pageY - e.touches[1].pageY, n = Math.sqrt(t * t + r * r); b.set(0, n); break; case 3: if (d.noPan === !0) return; V = N.TOUCH_PAN, T.set(e.touches[0].pageX, e.touches[0].pageY); break; default: V = N.NONE
                    }V !== N.NONE && d.dispatchEvent(G)
                }
            } function u(e) {
                if (d.enabled !== !1) {
                    e.preventDefault(), e.stopPropagation(); var t = d.domElement === document ? d.domElement.body : d.domElement; switch (e.touches.length) {
                        case 1: if (d.noRotate === !0) return; if (V !== N.TOUCH_ROTATE) return; g.set(e.touches[0].pageX, e.touches[0].pageY), v.subVectors(g, m), d.rotateLeft(2 * Math.PI * v.x / t.clientWidth * d.rotateSpeed), d.rotateUp(2 * Math.PI * v.y / t.clientHeight * d.rotateSpeed), m.copy(g), d.update(); break; case 2: if (d.noZoom === !0) return; if (V !== N.TOUCH_DOLLY) return; var r = e.touches[0].pageX - e.touches[1].pageX, n = e.touches[0].pageY - e.touches[1].pageY, i = Math.sqrt(r * r + n * n); w.set(0, i), M.subVectors(w, b), M.y > 0 ? d.dollyOut() : d.dollyIn(), b.copy(w), d.update(); break; case 3: if (d.noPan === !0) return; if (V !== N.TOUCH_PAN) return; y.set(e.touches[0].pageX, e.touches[0].pageY), R.subVectors(y, T), d.pan(R.x, R.y), T.copy(y), d.update(); break; default: V = N.NONE
                    }
                }
            } function l() {
                d.enabled !== !1 && (d.dispatchEvent(z), V = N.NONE)
            } this.object = e, this.domElement = void 0 !== t ? t : document, this.enabled = !0, this.target = new THREE.Vector3, this.center = this.target, this.noZoom = !1, this.zoomSpeed = .75, this.maxZoom = 4, this.minZoom = 0.5, this.minDistance = 0, this.maxDistance = 1 / 0, this.currentDistance = 0, this.noRotate = !1, this.rotateSpeed = 1, this.noPan = !1, this.keyPanSpeed = 7, this.autoRotate = !1, this.autoRotateSpeed = 2, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -(1 / 0), this.maxAzimuthAngle = 1 / 0, this.noKeys = !1, this.friction = .97, this.accelerationX = 0, this.accelerationY = 0, this.keys = {
                LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40
            }, this.mouseButtons = {
                ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT
            }; var p, f, d = this, E = 1e-6, m = new THREE.Vector2, g = new THREE.Vector2, v = new THREE.Vector2, T = new THREE.Vector2, y = new THREE.Vector2, R = new THREE.Vector2, x = new THREE.Vector3, H = new THREE.Vector3, b = new THREE.Vector2, w = new THREE.Vector2, M = new THREE.Vector2, S = 0, _ = 0, C = 0, A = 0, L = 0, k = 0, P = 1, D = new THREE.Vector3, O = new THREE.Vector3, F = new THREE.Quaternion, N = {
                NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5
            }, V = N.NONE; this.target0 = this.target.clone(), this.position0 = this.object.position.clone(); var U = (new THREE.Quaternion).setFromUnitVectors(e.up, new THREE.Vector3(0, 1, 0)), B = U.clone().inverse(), I = {
                type: "change"
            }, G = {
                type: "start"
            }, z = {
                type: "end"
            }; this.rotateLeft = function (e) {
                void 0 === e && (e = r()), k -= e
            }, this.rotateUp = function (e) {
                void 0 === e && (e = r()), L -= e
            }, this.panLeft = function (e) {
                var t = this.object.matrix.elements; x.set(t[0], t[1], t[2]), x.multiplyScalar(-e), D.add(x)
            }, this.panUp = function (e) {
                var t = this.object.matrix.elements; x.set(t[4], t[5], t[6]), x.multiplyScalar(e), D.add(x)
            }, this.pan = function (e, t) {
                var r = d.domElement === document ? d.domElement.body : d.domElement; if (void 0 !== d.object.fov) {
                    var n = d.object.position, i = n.clone().sub(d.target), o = i.length(); o *= Math.tan(d.object.fov / 2 * Math.PI / 180), d.panLeft(2 * e * o / r.clientHeight), d.panUp(2 * t * o / r.clientHeight)
                } else void 0 !== d.object.top ? (d.panLeft(e * (d.object.right - d.object.left) / r.clientWidth), d.panUp(t * (d.object.top - d.object.bottom) / r.clientHeight)) : console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.")
            }, this.dollyIn = function (e) {
                void 0 === e && (e = n()), this.object.zoom /= e, this.object.zoom >= this.maxZoom && (this.object.zoom = this.maxZoom)
            }, this.dollyOut = function (e) {
                void 0 === e && (e = n()), this.object.zoom *= e, this.object.zoom <= this.minZoom && (this.object.zoom = this.minZoom)
            }, this.update = function () {
                var e = this.object.position; H.copy(e).sub(this.target), H.applyQuaternion(U), p = Math.atan2(H.x, H.z), f = Math.atan2(Math.sqrt(H.x * H.x + H.z * H.z), H.y), this.autoRotate && V === N.NONE && this.rotateLeft(r()), p += k, f += L, p = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, p)), f = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, f)), f = Math.max(E, Math.min(Math.PI - E, f)); var t = H.length() * P; this.currentDistance = t = Math.max(this.minDistance, Math.min(this.maxDistance, t)), this.target.add(D), H.x = t * Math.sin(f) * Math.sin(p), H.y = t * Math.cos(f), H.z = t * Math.sin(f) * Math.cos(p), H.applyQuaternion(B), e.copy(this.target).add(H), this.object.lookAt(this.target), k = 0, L = 0, P = 1, D.set(0, 0, 0), (O.distanceToSquared(this.object.position) > E || 8 * (1 - F.dot(this.object.quaternion)) > E) && (this.dispatchEvent(I), O.copy(this.object.position), F.copy(this.object.quaternion)), V == N.ROTATE ? (this.accelerationX += S - C, this.accelerationY += _ - A) : (S = 0, _ = 0), C += this.accelerationX, A += this.accelerationY, C *= this.friction, A *= this.friction, this.accelerationX = 0, this.accelerationY = 0, d.rotateLeft(C), d.rotateUp(A), S -= C, _ -= A
            }, this.reset = function () {
                V = N.NONE, this.target.copy(this.target0), this.object.position.copy(this.position0), this.update()
            }, this.getPolarAngle = function () {
                return f
            }, this.getAzimuthalAngle = function () {
                return p
            }, this.domElement.addEventListener("contextmenu", function (e) {
                e.preventDefault()
            }, !1), this.domElement.addEventListener("mousedown", i, !1), this.domElement.addEventListener("mousewheel", s, !1), this.domElement.addEventListener("DOMMouseScroll", s, !1), this.domElement.addEventListener("touchstart", c, !1), this.domElement.addEventListener("touchend", l, !1), this.domElement.addEventListener("touchmove", u, !1), window.addEventListener("keydown", h, !1), this.update()
        }, THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype), THREE.OrbitControls.prototype.constructor = THREE.OrbitControls, $(document).ready(function () {
            $(".js-search-show").on("click", function (e) {
                e.preventDefault(), showSearchList()
            }), $(".js-search").on("click", ".js-search-close", function (e) {
                e.preventDefault(), hideSearchList()
            }), $(".search__list").on("click", ".search__item", function (e) {
                var t = $(this).data("id"); t && (clickMarker(markers.markers[t]), markers.setActive(markers.markers[t])), e.stopPropagation()
            })
        }); var textures = {
            map: "./assets/img/simplemap.jpg", mapBumpMap: "./assets/img/simplemap-bump.jpg", mapGlowInner: "./assets/img/glow-inner.png", mapShadow: "./assets/img/shadow.png", mapSpecular: "./assets/img/simplemap-specular.jpg", mapGlow: "./assets/img/glow.png", mapStarExtraSmall: "./assets/img/star-extra-small.png", mapStarSmall: "./assets/img/star-small.png", cloud0: "./assets/img/transp.png", cloud1: "./assets/img/transp.png", cloud2: "./assets/img/transp.png", marker: "./assets/img/marker.png", cluster: "./assets/img/cluster.png", shadow: "./assets/img/marker-shadow.png"
        };
