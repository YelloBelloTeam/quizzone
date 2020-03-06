
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function self(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    //import { readable } from 'svelte/store';

    const count = writable(0);
    // export const q = readable(0);

    /* src/qtypes/parosito.svelte generated by Svelte v3.16.7 */
    const file = "src/qtypes/parosito.svelte";

    function create_fragment(ctx) {
    	let h2;
    	let t1;
    	let div2;
    	let div0;
    	let figure0;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let figure1;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let figure2;
    	let img2;
    	let img2_src_value;
    	let t4;
    	let figure3;
    	let img3;
    	let img3_src_value;
    	let t5;
    	let figure4;
    	let img4;
    	let img4_src_value;
    	let t6;
    	let div1;
    	let figcaption0;
    	let t8;
    	let figcaption1;
    	let t10;
    	let figcaption2;
    	let t12;
    	let figcaption3;
    	let t14;
    	let figcaption4;
    	let dispose;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Párosító";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			figure0 = element("figure");
    			img0 = element("img");
    			t2 = space();
    			figure1 = element("figure");
    			img1 = element("img");
    			t3 = space();
    			figure2 = element("figure");
    			img2 = element("img");
    			t4 = space();
    			figure3 = element("figure");
    			img3 = element("img");
    			t5 = space();
    			figure4 = element("figure");
    			img4 = element("img");
    			t6 = space();
    			div1 = element("div");
    			figcaption0 = element("figcaption");
    			figcaption0.textContent = "A) PEOPLE";
    			t8 = space();
    			figcaption1 = element("figcaption");
    			figcaption1.textContent = "B) NATURE";
    			t10 = space();
    			figcaption2 = element("figcaption");
    			figcaption2.textContent = "C) ANIMALS";
    			t12 = space();
    			figcaption3 = element("figcaption");
    			figcaption3.textContent = "D) TRANSPORT";
    			t14 = space();
    			figcaption4 = element("figcaption");
    			figcaption4.textContent = "E) CITY";
    			add_location(h2, file, 91, 1, 2538);
    			if (img0.src !== (img0_src_value = "/images/city.jpeg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "1");
    			add_location(img0, file, 95, 4, 2720);
    			attr_dev(figure0, "class", "svelte-mxugya");
    			add_location(figure0, file, 94, 3, 2686);
    			if (img1.src !== (img1_src_value = "/images/transport.jpeg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "2");
    			add_location(img1, file, 98, 4, 2808);
    			attr_dev(figure1, "class", "svelte-mxugya");
    			add_location(figure1, file, 97, 3, 2774);
    			if (img2.src !== (img2_src_value = "/images/animals.jpeg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "3");
    			add_location(img2, file, 101, 4, 2901);
    			attr_dev(figure2, "class", "svelte-mxugya");
    			add_location(figure2, file, 100, 3, 2867);
    			if (img3.src !== (img3_src_value = "/images/nature.jpeg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "4");
    			add_location(img3, file, 104, 4, 2992);
    			attr_dev(figure3, "class", "svelte-mxugya");
    			add_location(figure3, file, 103, 3, 2958);
    			if (img4.src !== (img4_src_value = "/images/people.jpeg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "5");
    			add_location(img4, file, 107, 4, 3082);
    			attr_dev(figure4, "class", "svelte-mxugya");
    			add_location(figure4, file, 106, 3, 3048);
    			attr_dev(div0, "class", "qs svelte-mxugya");
    			add_location(div0, file, 93, 2, 2641);
    			attr_dev(figcaption0, "draggable", "true");
    			attr_dev(figcaption0, "id", "txt-1");
    			attr_dev(figcaption0, "class", "svelte-mxugya");
    			add_location(figcaption0, file, 111, 3, 3166);
    			attr_dev(figcaption1, "draggable", "true");
    			attr_dev(figcaption1, "id", "txt-2");
    			attr_dev(figcaption1, "class", "svelte-mxugya");
    			add_location(figcaption1, file, 112, 3, 3252);
    			attr_dev(figcaption2, "draggable", "true");
    			attr_dev(figcaption2, "id", "txt-3");
    			attr_dev(figcaption2, "class", "svelte-mxugya");
    			add_location(figcaption2, file, 113, 3, 3338);
    			attr_dev(figcaption3, "draggable", "true");
    			attr_dev(figcaption3, "id", "txt-4");
    			attr_dev(figcaption3, "class", "svelte-mxugya");
    			add_location(figcaption3, file, 114, 3, 3425);
    			attr_dev(figcaption4, "draggable", "true");
    			attr_dev(figcaption4, "id", "txt-5");
    			attr_dev(figcaption4, "class", "svelte-mxugya");
    			add_location(figcaption4, file, 115, 3, 3514);
    			attr_dev(div1, "class", "as svelte-mxugya");
    			add_location(div1, file, 110, 2, 3146);
    			attr_dev(div2, "id", /*id*/ ctx[0]);
    			add_location(div2, file, 92, 1, 2557);

    			dispose = [
    				listen_dev(figure0, "click", /*_focusFig*/ ctx[1], false, false, false),
    				listen_dev(figure1, "click", /*_focusFig*/ ctx[1], false, false, false),
    				listen_dev(figure2, "click", /*_focusFig*/ ctx[1], false, false, false),
    				listen_dev(figure3, "click", /*_focusFig*/ ctx[1], false, false, false),
    				listen_dev(figure4, "click", /*_focusFig*/ ctx[1], false, false, false),
    				listen_dev(div0, "click", self(/*_blurFig*/ ctx[2]), false, false, false),
    				listen_dev(figcaption0, "click", /*_moveTxt*/ ctx[3], false, false, false),
    				listen_dev(figcaption1, "click", /*_moveTxt*/ ctx[3], false, false, false),
    				listen_dev(figcaption2, "click", /*_moveTxt*/ ctx[3], false, false, false),
    				listen_dev(figcaption3, "click", /*_moveTxt*/ ctx[3], false, false, false),
    				listen_dev(figcaption4, "click", /*_moveTxt*/ ctx[3], false, false, false),
    				listen_dev(div2, "drop", /*_drop*/ ctx[5], false, false, false),
    				listen_dev(div2, "dragstart", _dragstart, false, false, false),
    				listen_dev(div2, "dragover", /*_dragover*/ ctx[4], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, figure0);
    			append_dev(figure0, img0);
    			append_dev(div0, t2);
    			append_dev(div0, figure1);
    			append_dev(figure1, img1);
    			append_dev(div0, t3);
    			append_dev(div0, figure2);
    			append_dev(figure2, img2);
    			append_dev(div0, t4);
    			append_dev(div0, figure3);
    			append_dev(figure3, img3);
    			append_dev(div0, t5);
    			append_dev(div0, figure4);
    			append_dev(figure4, img4);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, figcaption0);
    			append_dev(div1, t8);
    			append_dev(div1, figcaption1);
    			append_dev(div1, t10);
    			append_dev(div1, figcaption2);
    			append_dev(div1, t12);
    			append_dev(div1, figcaption3);
    			append_dev(div1, t14);
    			append_dev(div1, figcaption4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function _dragstart(e) {
    	e.dataTransfer.setData("text", e.target.id);
    	e.dataTransfer.dropEffect = "copy";
    }

    function instance($$self, $$props, $$invalidate) {
    	var selected;
    	let { idx } = $$props;
    	const id = `s${idx}`;

    	function _focusFig(e) {
    		let el = e;

    		if (e.currentTarget) {
    			e.cancelBubble = true;
    			e.preventDefault();
    			el = e.currentTarget;
    		}

    		_blurEls();
    		el.querySelector("#" + id + " img").style.outline = getComputedStyle(document.documentElement).getPropertyValue("--outline-selected");
    		selected = el;
    	}

    	function _blurEls() {
    		let old = document.querySelectorAll("#" + id + " img");
    		for (let o of old) o.style.outline = "";
    		selected = null;
    	}

    	function _blurFig(ev) {
    		ev.cancelBubble = true;
    		ev.preventDefault();
    		_blurEls();
    	}

    	function _moveTxt(e) {
    		let el = e.target;

    		if (selected && selected.tagName == "FIGURE") {
    			let old = selected.querySelector("#" + id + " figcaption");
    			if (old) document.querySelector("#" + id + " .as").appendChild(old);

    			if (old != el) {
    				_dispatch(el);
    				if (selected.nextElementSibling) _focusFig(selected.nextElementSibling); else _focusFig(selected.parentNode.firstElementChild);
    			}
    		} else {
    			document.querySelector("#" + id + " .as").appendChild(el);
    		}
    	}

    	function _dragover(e) {
    		e.preventDefault();

    		if (e.dataTransfer.getData("text") || true) {
    			let el = e.target;
    			_blurEls();
    			if (el.tagName == "FIGURE") _focusFig(el);
    			if (el.parentNode.tagName == "FIGURE") _focusFig(el.parentNode);
    		}
    	}

    	function _drop(e) {
    		e.preventDefault();
    		let el = document.getElementById(e.dataTransfer.getData("text"));

    		if (el && el.tagName == "FIGCAPTION") {
    			let selected = e.target.parentNode;

    			if (selected.tagName == "FIGURE") {
    				let old = selected.querySelector("#" + id + " figcaption");
    				if (old) document.querySelector("#" + id + " .as").appendChild(old);
    				_dispatch(el);
    				if (selected.nextElementSibling) _focusFig(selected.nextElementSibling); else _focusFig(selected.parentNode.firstElementChild);
    			} else {
    				document.querySelector("#" + id + " .as").appendChild(el);
    			}
    		}
    	}

    	function _dispatch(el) {
    		selected.appendChild(el);
    		let c = count;
    		c[selected.querySelector("#" + id + " img").alt] = el.id;
    		count.set(c);
    	}

    	const writable_props = ["idx"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Parosito> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("idx" in $$props) $$invalidate(6, idx = $$props.idx);
    	};

    	$$self.$capture_state = () => {
    		return { selected, idx };
    	};

    	$$self.$inject_state = $$props => {
    		if ("selected" in $$props) selected = $$props.selected;
    		if ("idx" in $$props) $$invalidate(6, idx = $$props.idx);
    	};

    	return [id, _focusFig, _blurFig, _moveTxt, _dragover, _drop, idx];
    }

    class Parosito extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { idx: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Parosito",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*idx*/ ctx[6] === undefined && !("idx" in props)) {
    			console.warn("<Parosito> was created without expected prop 'idx'");
    		}
    	}

    	get idx() {
    		throw new Error("<Parosito>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set idx(value) {
    		throw new Error("<Parosito>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/qtypes/felelet.svelte generated by Svelte v3.16.7 */
    const file$1 = "src/qtypes/felelet.svelte";

    function create_fragment$1(ctx) {
    	let h2;
    	let t1;
    	let div2;
    	let div0;
    	let h1;
    	let t3;
    	let div1;
    	let figure0;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let figure1;
    	let img1;
    	let img1_src_value;
    	let t5;
    	let figure2;
    	let img2;
    	let img2_src_value;
    	let t6;
    	let figure3;
    	let img3;
    	let img3_src_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Feleletválasztó";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Melyiküknek nincs PhD-fokozata?";
    			t3 = space();
    			div1 = element("div");
    			figure0 = element("figure");
    			img0 = element("img");
    			t4 = space();
    			figure1 = element("figure");
    			img1 = element("img");
    			t5 = space();
    			figure2 = element("figure");
    			img2 = element("img");
    			t6 = space();
    			figure3 = element("figure");
    			img3 = element("img");
    			add_location(h2, file$1, 35, 1, 815);
    			add_location(h1, file$1, 38, 3, 879);
    			attr_dev(div0, "class", "qs svelte-mxugya");
    			add_location(div0, file$1, 37, 2, 859);
    			if (img0.src !== (img0_src_value = "/images/city.jpeg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "A");
    			add_location(img0, file$1, 42, 4, 985);
    			attr_dev(figure0, "class", "svelte-mxugya");
    			add_location(figure0, file$1, 41, 3, 951);
    			if (img1.src !== (img1_src_value = "/images/transport.jpeg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "B");
    			add_location(img1, file$1, 45, 4, 1073);
    			attr_dev(figure1, "class", "svelte-mxugya");
    			add_location(figure1, file$1, 44, 3, 1039);
    			if (img2.src !== (img2_src_value = "/images/animals.jpeg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "C");
    			add_location(img2, file$1, 48, 4, 1166);
    			attr_dev(figure2, "class", "svelte-mxugya");
    			add_location(figure2, file$1, 47, 3, 1132);
    			if (img3.src !== (img3_src_value = "/images/nature.jpeg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "D");
    			add_location(img3, file$1, 51, 4, 1257);
    			attr_dev(figure3, "class", "svelte-mxugya");
    			add_location(figure3, file$1, 50, 3, 1223);
    			attr_dev(div1, "class", "as svelte-mxugya");
    			add_location(div1, file$1, 40, 2, 931);
    			attr_dev(div2, "id", /*id*/ ctx[0]);
    			add_location(div2, file$1, 36, 1, 841);

    			dispose = [
    				listen_dev(figure0, "click", /*_focusFig*/ ctx[1], false, false, false),
    				listen_dev(figure1, "click", /*_focusFig*/ ctx[1], false, false, false),
    				listen_dev(figure2, "click", /*_focusFig*/ ctx[1], false, false, false),
    				listen_dev(figure3, "click", /*_focusFig*/ ctx[1], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, figure0);
    			append_dev(figure0, img0);
    			append_dev(div1, t4);
    			append_dev(div1, figure1);
    			append_dev(figure1, img1);
    			append_dev(div1, t5);
    			append_dev(div1, figure2);
    			append_dev(figure2, img2);
    			append_dev(div1, t6);
    			append_dev(div1, figure3);
    			append_dev(figure3, img3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	var selected;
    	let { idx } = $$props;
    	const id = `s${idx}`;

    	function _focusFig(e) {
    		let el = e;

    		if (e.currentTarget) {
    			e.cancelBubble = true;
    			e.preventDefault();
    			el = e.currentTarget;
    		}

    		_blurEls();
    		el.querySelector("#" + id + " img").style.outline = getComputedStyle(document.documentElement).getPropertyValue("--outline-selected");
    		selected = el;
    	}

    	function _blurEls() {
    		let old = document.querySelectorAll("#" + id + " img");
    		for (let o of old) o.style.outline = "";
    		selected = null;
    	}

    	const writable_props = ["idx"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Felelet> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("idx" in $$props) $$invalidate(2, idx = $$props.idx);
    	};

    	$$self.$capture_state = () => {
    		return { selected, idx };
    	};

    	$$self.$inject_state = $$props => {
    		if ("selected" in $$props) selected = $$props.selected;
    		if ("idx" in $$props) $$invalidate(2, idx = $$props.idx);
    	};

    	return [id, _focusFig, idx];
    }

    class Felelet extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { idx: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Felelet",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*idx*/ ctx[2] === undefined && !("idx" in props)) {
    			console.warn("<Felelet> was created without expected prop 'idx'");
    		}
    	}

    	get idx() {
    		throw new Error("<Felelet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set idx(value) {
    		throw new Error("<Felelet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.16.7 */
    const file$2 = "src/App.svelte";

    function create_fragment$2(ctx) {
    	let header;
    	let h1;
    	let t1;
    	let h2;
    	let t3;
    	let p;
    	let t4;
    	let br0;
    	let t5;
    	let t6;
    	let span0;
    	let t7;
    	let t8_value = /*$count*/ ctx[0][1] + "";
    	let t8;
    	let br1;
    	let t9;
    	let span1;
    	let t10;
    	let t11_value = /*$count*/ ctx[0][2] + "";
    	let t11;
    	let br2;
    	let t12;
    	let span2;
    	let t13;
    	let t14_value = /*$count*/ ctx[0][3] + "";
    	let t14;
    	let br3;
    	let t15;
    	let span3;
    	let t16;
    	let t17_value = /*$count*/ ctx[0][4] + "";
    	let t17;
    	let br4;
    	let t18;
    	let span4;
    	let t19;
    	let t20_value = /*$count*/ ctx[0][5] + "";
    	let t20;
    	let br5;
    	let t21;
    	let main;
    	let t22;
    	let br6;
    	let t23;
    	let t24;
    	let footer;
    	let h6;
    	let current;
    	const felelet = new Felelet({ props: { idx: 1 }, $$inline: true });
    	const parosito = new Parosito({ props: { idx: 2 }, $$inline: true });

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Quizzone experiment!";
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "Kép-szöveg párosító";
    			t3 = space();
    			p = element("p");
    			t4 = text("Nem vagyunk \"bezárva\" egy képernyőbe, mint a projektoron! ");
    			br0 = element("br");
    			t5 = text("Scrollozhatunk! Drag & drop! Select & pair!");
    			t6 = space();
    			span0 = element("span");
    			t7 = text("1.: ");
    			t8 = text(t8_value);
    			br1 = element("br");
    			t9 = space();
    			span1 = element("span");
    			t10 = text("2.: ");
    			t11 = text(t11_value);
    			br2 = element("br");
    			t12 = space();
    			span2 = element("span");
    			t13 = text("3.: ");
    			t14 = text(t14_value);
    			br3 = element("br");
    			t15 = space();
    			span3 = element("span");
    			t16 = text("4.: ");
    			t17 = text(t17_value);
    			br4 = element("br");
    			t18 = space();
    			span4 = element("span");
    			t19 = text("5.: ");
    			t20 = text(t20_value);
    			br5 = element("br");
    			t21 = space();
    			main = element("main");
    			create_component(felelet.$$.fragment);
    			t22 = space();
    			br6 = element("br");
    			t23 = space();
    			create_component(parosito.$$.fragment);
    			t24 = space();
    			footer = element("footer");
    			h6 = element("h6");
    			h6.textContent = "2020. FEBruár";
    			add_location(h1, file$2, 12, 1, 245);
    			add_location(h2, file$2, 13, 1, 276);
    			add_location(br0, file$2, 14, 62, 367);
    			add_location(p, file$2, 14, 1, 306);
    			add_location(span0, file$2, 15, 2, 421);
    			add_location(br1, file$2, 15, 30, 449);
    			add_location(span1, file$2, 16, 2, 456);
    			add_location(br2, file$2, 16, 30, 484);
    			add_location(span2, file$2, 17, 2, 491);
    			add_location(br3, file$2, 17, 30, 519);
    			add_location(span3, file$2, 18, 2, 526);
    			add_location(br4, file$2, 18, 30, 554);
    			add_location(span4, file$2, 19, 2, 561);
    			add_location(br5, file$2, 19, 30, 589);
    			add_location(header, file$2, 11, 0, 235);
    			add_location(br6, file$2, 24, 1, 649);
    			attr_dev(main, "id", "questions");
    			add_location(main, file$2, 22, 0, 605);
    			add_location(h6, file$2, 29, 1, 695);
    			add_location(footer, file$2, 28, 0, 685);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(header, t1);
    			append_dev(header, h2);
    			append_dev(header, t3);
    			append_dev(header, p);
    			append_dev(p, t4);
    			append_dev(p, br0);
    			append_dev(p, t5);
    			append_dev(header, t6);
    			append_dev(header, span0);
    			append_dev(span0, t7);
    			append_dev(span0, t8);
    			append_dev(header, br1);
    			append_dev(header, t9);
    			append_dev(header, span1);
    			append_dev(span1, t10);
    			append_dev(span1, t11);
    			append_dev(header, br2);
    			append_dev(header, t12);
    			append_dev(header, span2);
    			append_dev(span2, t13);
    			append_dev(span2, t14);
    			append_dev(header, br3);
    			append_dev(header, t15);
    			append_dev(header, span3);
    			append_dev(span3, t16);
    			append_dev(span3, t17);
    			append_dev(header, br4);
    			append_dev(header, t18);
    			append_dev(header, span4);
    			append_dev(span4, t19);
    			append_dev(span4, t20);
    			append_dev(header, br5);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(felelet, main, null);
    			append_dev(main, t22);
    			append_dev(main, br6);
    			append_dev(main, t23);
    			mount_component(parosito, main, null);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, footer, anchor);
    			append_dev(footer, h6);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$count*/ 1) && t8_value !== (t8_value = /*$count*/ ctx[0][1] + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*$count*/ 1) && t11_value !== (t11_value = /*$count*/ ctx[0][2] + "")) set_data_dev(t11, t11_value);
    			if ((!current || dirty & /*$count*/ 1) && t14_value !== (t14_value = /*$count*/ ctx[0][3] + "")) set_data_dev(t14, t14_value);
    			if ((!current || dirty & /*$count*/ 1) && t17_value !== (t17_value = /*$count*/ ctx[0][4] + "")) set_data_dev(t17, t17_value);
    			if ((!current || dirty & /*$count*/ 1) && t20_value !== (t20_value = /*$count*/ ctx[0][5] + "")) set_data_dev(t20, t20_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(felelet.$$.fragment, local);
    			transition_in(parosito.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(felelet.$$.fragment, local);
    			transition_out(parosito.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(main);
    			destroy_component(felelet);
    			destroy_component(parosito);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $count;
    	validate_store(count, "count");
    	component_subscribe($$self, count, $$value => $$invalidate(0, $count = $$value));
    	let idx;

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("idx" in $$props) idx = $$props.idx;
    		if ("$count" in $$props) count.set($count = $$props.$count);
    	};

    	return [$count];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    var visibility = true;

    document.addEventListener('visibilitychange', () => {
    	console.log(visibility);
      if ((document.hidden || document.msHidden || document.webkitHidden) && visibility) {
        // the page has been hidden
        visibility = false;
    		alert(`Másik tabon gugliztál? ${visibility}`);
        visibility = true;
      }
    });

    window.addEventListener('onblur', () => {
      // the page has been hidden
    	alert('Majdnem elhagytál?');
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
