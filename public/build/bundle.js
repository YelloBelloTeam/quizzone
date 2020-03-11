
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
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
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
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
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.2' }, detail)));
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
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
        $capture_state() { }
        $inject_state() { }
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

    const _idify = (r) => r
    	.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Convert accented letters to ASCII
    	.replace(/[^\w\s-]/g, "") // Remove remaining non-ASCII characters
    	.trim().replace(/\s+/g, "-") // Convert whitespace to hyphens
    	.toLowerCase();

    /* src/qtypes/parosito.svelte generated by Svelte v3.19.2 */
    const file = "src/qtypes/parosito.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (113:3) {:else}
    function create_else_block(ctx) {
    	let p;
    	let t_value = /*q*/ ctx[17] + "";
    	let t;
    	let p_alt_value;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "selectable");
    			attr_dev(p, "alt", p_alt_value = String.fromCharCode(65 + /*i*/ ctx[16]));
    			add_location(p, file, 113, 3, 2974);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*qs*/ 2 && t_value !== (t_value = /*q*/ ctx[17] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(113:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (111:3) {#if q.startsWith('/')}
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "selectable");
    			if (img.src !== (img_src_value = /*q*/ ctx[17])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = String.fromCharCode(65 + /*i*/ ctx[16]));
    			add_location(img, file, 111, 3, 2891);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*qs*/ 2 && img.src !== (img_src_value = /*q*/ ctx[17])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(111:3) {#if q.startsWith('/')}",
    		ctx
    	});

    	return block;
    }

    // (109:2) {#each qs as q, i}
    function create_each_block_1(ctx) {
    	let figure;
    	let show_if;
    	let t;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty & /*qs*/ 2) show_if = !!/*q*/ ctx[17].startsWith("/");
    		if (show_if) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			if_block.c();
    			t = space();
    			attr_dev(figure, "class", "abcd");
    			add_location(figure, file, 109, 2, 2818);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			if_block.m(figure, null);
    			append_dev(figure, t);
    			dispose = listen_dev(figure, "click", /*_focusFig*/ ctx[4], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(figure, t);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figure);
    			if_block.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(109:2) {#each qs as q, i}",
    		ctx
    	});

    	return block;
    }

    // (120:2) {#each as as a, i}
    function create_each_block(ctx) {
    	let figcaption;
    	let t_value = /*a*/ ctx[14] + "";
    	let t;
    	let figcaption_id_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			figcaption = element("figcaption");
    			t = text(t_value);
    			attr_dev(figcaption, "id", figcaption_id_value = _idify(/*a*/ ctx[14]));
    			attr_dev(figcaption, "draggable", "true");
    			set_style(figcaption, "order", /*i*/ ctx[16]);
    			add_location(figcaption, file, 120, 2, 3130);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figcaption, anchor);
    			append_dev(figcaption, t);
    			dispose = listen_dev(figcaption, "click", /*_moveTxt*/ ctx[6], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*as*/ 4 && t_value !== (t_value = /*a*/ ctx[14] + "")) set_data_dev(t, t_value);

    			if (dirty & /*as*/ 4 && figcaption_id_value !== (figcaption_id_value = _idify(/*a*/ ctx[14]))) {
    				attr_dev(figcaption, "id", figcaption_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figcaption);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(120:2) {#each as as a, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let div2;
    	let div0;
    	let t2;
    	let div1;
    	let dispose;
    	let each_value_1 = /*qs*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*as*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file, 105, 0, 2639);
    			attr_dev(div0, "class", "multi");
    			add_location(div0, file, 107, 1, 2750);
    			attr_dev(div1, "class", "multi sticky");
    			add_location(div1, file, 118, 1, 3080);
    			attr_dev(div2, "id", /*id*/ ctx[3]);
    			attr_dev(div2, "class", "slide");
    			add_location(div2, file, 106, 0, 2655);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			dispose = [
    				listen_dev(div0, "click", self(/*_blurFig*/ ctx[5]), false, false, false),
    				listen_dev(div2, "drop", /*_drop*/ ctx[8], false, false, false),
    				listen_dev(div2, "dragstart", _dragstart, false, false, false),
    				listen_dev(div2, "dragover", /*_dragover*/ ctx[7], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);

    			if (dirty & /*_focusFig, qs, String*/ 18) {
    				each_value_1 = /*qs*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*_idify, as, _moveTxt*/ 68) {
    				each_value = /*as*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
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
    	var selection, slide;
    	let { idx } = $$props, { name } = $$props, { qs } = $$props, { as } = $$props;
    	const id = `s${idx}`;

    	onMount(() => {
    		slide = document.querySelector("#" + id);
    	});

    	function _focusFig(e) {
    		let el = e;

    		if (e.currentTarget) {
    			e.cancelBubble = true;
    			e.preventDefault();
    			el = e.currentTarget;
    		}

    		_blurEls();
    		el.querySelector(".selectable").style.outline = getComputedStyle(document.documentElement).getPropertyValue("--outline-selected");
    		selection = el;
    	}

    	function _blurEls() {
    		let old = slide.querySelectorAll(".selectable");
    		for (let o of old) o.style.outline = "";
    		selection = null;
    	}

    	function _blurFig(ev) {
    		ev.cancelBubble = true;
    		ev.preventDefault();
    		_blurEls();
    	}

    	function _moveTxt(e) {
    		let el = e.target;

    		if (selection && selection.tagName == "FIGURE") {
    			let old = selection.querySelector("figcaption");
    			if (old) slide.querySelector(".sticky").appendChild(old);

    			if (old != el) {
    				// selection.appendChild(el)
    				_dispatch(el);

    				if (selection.nextElementSibling) _focusFig(selection.nextElementSibling); else _focusFig(selection.parentNode.firstElementChild);
    			}
    		} else {
    			slide.querySelector(".sticky").appendChild(el);
    		}
    	}

    	function _dragover(e) {
    		e.preventDefault();

    		//console.log('_dragover',e.dataTransfer.getData("text"))/* miért nincs meg a text? */
    		if (e.dataTransfer.getData("text") || true) {
    			let el = e.target;
    			_blurEls();
    			if (el.tagName == "FIGURE") _focusFig(el); /* console.log(e); */
    			if (el.parentNode.tagName == "FIGURE") _focusFig(el.parentNode);
    		}
    	}

    	function _drop(e) {
    		e.preventDefault();
    		let el = document.getElementById(e.dataTransfer.getData("text"));

    		if (el && el.tagName == "FIGCAPTION") {
    			let selection = e.target.parentNode;

    			if (selection.tagName == "FIGURE") {
    				let old = selection.querySelector("figcaption");
    				if (old) slide.querySelector(".sticky").appendChild(old);

    				// selection.appendChild(el)
    				_dispatch(el);

    				if (selection.nextElementSibling) _focusFig(selection.nextElementSibling); else _focusFig(selection.parentNode.firstElementChild);
    			} else {
    				slide.querySelector(".sticky").appendChild(el);
    			}
    		}
    	}

    	function _dispatch(el) {
    		selection.appendChild(el);

    		// console.log(selection.querySelector('#' + id + ' img').alt)
    		let c = count;

    		c[selection.querySelector(".selectable").alt] = el.id;
    		count.set(c);
    	}

    	const writable_props = ["idx", "name", "qs", "as"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Parosito> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Parosito", $$slots, []);

    	$$self.$set = $$props => {
    		if ("idx" in $$props) $$invalidate(9, idx = $$props.idx);
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("qs" in $$props) $$invalidate(1, qs = $$props.qs);
    		if ("as" in $$props) $$invalidate(2, as = $$props.as);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		count,
    		_idify,
    		selection,
    		slide,
    		idx,
    		name,
    		qs,
    		as,
    		id,
    		_focusFig,
    		_blurEls,
    		_blurFig,
    		_moveTxt,
    		_dragover,
    		_dragstart,
    		_drop,
    		_dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("selection" in $$props) selection = $$props.selection;
    		if ("slide" in $$props) slide = $$props.slide;
    		if ("idx" in $$props) $$invalidate(9, idx = $$props.idx);
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("qs" in $$props) $$invalidate(1, qs = $$props.qs);
    		if ("as" in $$props) $$invalidate(2, as = $$props.as);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, qs, as, id, _focusFig, _blurFig, _moveTxt, _dragover, _drop, idx];
    }

    class Parosito extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { idx: 9, name: 0, qs: 1, as: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Parosito",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*idx*/ ctx[9] === undefined && !("idx" in props)) {
    			console.warn("<Parosito> was created without expected prop 'idx'");
    		}

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<Parosito> was created without expected prop 'name'");
    		}

    		if (/*qs*/ ctx[1] === undefined && !("qs" in props)) {
    			console.warn("<Parosito> was created without expected prop 'qs'");
    		}

    		if (/*as*/ ctx[2] === undefined && !("as" in props)) {
    			console.warn("<Parosito> was created without expected prop 'as'");
    		}
    	}

    	get idx() {
    		throw new Error("<Parosito>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set idx(value) {
    		throw new Error("<Parosito>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Parosito>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Parosito>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get qs() {
    		throw new Error("<Parosito>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set qs(value) {
    		throw new Error("<Parosito>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get as() {
    		throw new Error("<Parosito>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error("<Parosito>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/qtypes/felelet.svelte generated by Svelte v3.19.2 */
    const file$1 = "src/qtypes/felelet.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (57:3) {:else}
    function create_else_block$1(ctx) {
    	let p;
    	let t_value = /*a*/ ctx[11] + "";
    	let t;
    	let p_alt_value;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "selectable");
    			attr_dev(p, "alt", p_alt_value = "a" + /*i*/ ctx[13]);
    			add_location(p, file$1, 57, 3, 1211);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*as*/ 4 && t_value !== (t_value = /*a*/ ctx[11] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(57:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (55:3) {#if a.startsWith('/')}
    function create_if_block_1(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "selectable");
    			if (img.src !== (img_src_value = /*a*/ ctx[11])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = String.fromCharCode(65 + /*i*/ ctx[13]));
    			add_location(img, file$1, 55, 3, 1128);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*as*/ 4 && img.src !== (img_src_value = /*a*/ ctx[11])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(55:3) {#if a.startsWith('/')}",
    		ctx
    	});

    	return block;
    }

    // (53:2) {#each as as a, i}
    function create_each_block$1(ctx) {
    	let figure;
    	let show_if;
    	let t;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty & /*as*/ 4) show_if = !!/*a*/ ctx[11].startsWith("/");
    		if (show_if) return create_if_block_1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			if_block.c();
    			t = space();
    			attr_dev(figure, "class", "abcd");
    			add_location(figure, file$1, 53, 2, 1055);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			if_block.m(figure, null);
    			append_dev(figure, t);
    			dispose = listen_dev(figure, "click", /*_focusFig*/ ctx[5], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(figure, t);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figure);
    			if_block.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(53:2) {#each as as a, i}",
    		ctx
    	});

    	return block;
    }

    // (64:10) {#if author}
    function create_if_block$1(ctx) {
    	let span;
    	let t0;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("(");
    			t1 = text(/*author*/ ctx[3]);
    			t2 = text(")");
    			attr_dev(span, "class", "author");
    			add_location(span, file$1, 63, 22, 1338);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*author*/ 8) set_data_dev(t1, /*author*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(64:10) {#if author}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let div2;
    	let div0;
    	let t2;
    	let div1;
    	let p;
    	let t3;
    	let t4;
    	let each_value = /*as*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block = /*author*/ ctx[3] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			p = element("p");
    			t3 = text(/*qs*/ ctx[1]);
    			t4 = space();
    			if (if_block) if_block.c();
    			add_location(h1, file$1, 49, 0, 967);
    			attr_dev(div0, "class", "multi");
    			add_location(div0, file$1, 51, 1, 1012);
    			add_location(p, file$1, 63, 2, 1318);
    			attr_dev(div1, "class", "qs sticky");
    			add_location(div1, file$1, 62, 1, 1292);
    			attr_dev(div2, "id", /*id*/ ctx[4]);
    			attr_dev(div2, "class", "slide");
    			add_location(div2, file$1, 50, 0, 983);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			if (if_block) if_block.m(p, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);

    			if (dirty & /*_focusFig, as, String*/ 36) {
    				each_value = /*as*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*qs*/ 2) set_data_dev(t3, /*qs*/ ctx[1]);

    			if (/*author*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(p, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
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
    	var selection, slide;

    	let { idx } = $$props,
    		{ name } = $$props,
    		{ qs } = $$props,
    		{ as } = $$props,
    		{ author } = $$props;

    	const id = `s${idx}`;

    	onMount(() => {
    		slide = document.querySelector("#" + id);
    	});

    	function _focusFig(e) {
    		let el = e;

    		if (e.currentTarget) {
    			/* e.cancelBubble = true;
    e.preventDefault(); */
    			el = e.currentTarget;
    		}

    		_blurEls();
    		el.querySelector(".selectable").style.outline = getComputedStyle(document.documentElement).getPropertyValue("--outline-selected");
    		selection = el;
    	}

    	function _blurEls() {
    		let old = slide.querySelectorAll(".selectable");
    		for (let o of old) o.style.outline = "";
    		selection = null;
    	}

    	function _dispatch(el) {
    		selection.appendChild(el);

    		// console.log(selection.querySelector('#' + id + ' img').alt)
    		let c = count;

    		c[selection.querySelector("img").alt] = el.id;
    		count.set(c);
    	}

    	const writable_props = ["idx", "name", "qs", "as", "author"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Felelet> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Felelet", $$slots, []);

    	$$self.$set = $$props => {
    		if ("idx" in $$props) $$invalidate(6, idx = $$props.idx);
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("qs" in $$props) $$invalidate(1, qs = $$props.qs);
    		if ("as" in $$props) $$invalidate(2, as = $$props.as);
    		if ("author" in $$props) $$invalidate(3, author = $$props.author);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		count,
    		selection,
    		slide,
    		idx,
    		name,
    		qs,
    		as,
    		author,
    		id,
    		_focusFig,
    		_blurEls,
    		_dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("selection" in $$props) selection = $$props.selection;
    		if ("slide" in $$props) slide = $$props.slide;
    		if ("idx" in $$props) $$invalidate(6, idx = $$props.idx);
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("qs" in $$props) $$invalidate(1, qs = $$props.qs);
    		if ("as" in $$props) $$invalidate(2, as = $$props.as);
    		if ("author" in $$props) $$invalidate(3, author = $$props.author);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, qs, as, author, id, _focusFig, idx];
    }

    class Felelet extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { idx: 6, name: 0, qs: 1, as: 2, author: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Felelet",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*idx*/ ctx[6] === undefined && !("idx" in props)) {
    			console.warn("<Felelet> was created without expected prop 'idx'");
    		}

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<Felelet> was created without expected prop 'name'");
    		}

    		if (/*qs*/ ctx[1] === undefined && !("qs" in props)) {
    			console.warn("<Felelet> was created without expected prop 'qs'");
    		}

    		if (/*as*/ ctx[2] === undefined && !("as" in props)) {
    			console.warn("<Felelet> was created without expected prop 'as'");
    		}

    		if (/*author*/ ctx[3] === undefined && !("author" in props)) {
    			console.warn("<Felelet> was created without expected prop 'author'");
    		}
    	}

    	get idx() {
    		throw new Error("<Felelet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set idx(value) {
    		throw new Error("<Felelet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Felelet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Felelet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get qs() {
    		throw new Error("<Felelet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set qs(value) {
    		throw new Error("<Felelet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get as() {
    		throw new Error("<Felelet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error("<Felelet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get author() {
    		throw new Error("<Felelet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set author(value) {
    		throw new Error("<Felelet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/qtypes/szabad.svelte generated by Svelte v3.19.2 */
    const file$2 = "src/qtypes/szabad.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (69:1) {:else}
    function create_else_block_1(ctx) {
    	let div0;
    	let figure;
    	let label;
    	let show_if;
    	let t;
    	let div1;
    	let input;
    	let dispose;

    	function select_block_type_2(ctx, dirty) {
    		if (show_if == null || dirty & /*qs*/ 2) show_if = !!/*qs*/ ctx[1].startsWith("/");
    		if (show_if) return create_if_block_2;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_2(ctx, -1);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			figure = element("figure");
    			label = element("label");
    			if_block.c();
    			t = space();
    			div1 = element("div");
    			input = element("input");
    			attr_dev(label, "for", "qsolo");
    			add_location(label, file$2, 71, 3, 1461);
    			add_location(figure, file$2, 70, 2, 1449);
    			attr_dev(div0, "class", "solo");
    			add_location(div0, file$2, 69, 1, 1428);
    			attr_dev(input, "id", "qsolo");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", "as");
    			input.value = /*as*/ ctx[2];
    			add_location(input, file$2, 81, 2, 1695);
    			attr_dev(div1, "class", "sticky free");
    			add_location(div1, file$2, 80, 1, 1667);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, figure);
    			append_dev(figure, label);
    			if_block.m(label, null);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, input);
    			dispose = listen_dev(label, "click", /*_focusFig*/ ctx[4], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(label, null);
    				}
    			}

    			if (dirty & /*as*/ 4 && input.value !== /*as*/ ctx[2]) {
    				prop_dev(input, "value", /*as*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if_block.d();
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(69:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (52:1) {#if Array.isArray(qs)}
    function create_if_block$2(ctx) {
    	let div;
    	let each_value = /*qs*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "multi");
    			add_location(div, file$2, 52, 1, 1010);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*as, _focusFig, qs, String*/ 22) {
    				each_value = /*qs*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(52:1) {#if Array.isArray(qs)}",
    		ctx
    	});

    	return block;
    }

    // (75:4) {:else}
    function create_else_block_2(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*qs*/ ctx[1]);
    			attr_dev(p, "class", "selectable");
    			add_location(p, file$2, 75, 4, 1593);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*qs*/ 2) set_data_dev(t, /*qs*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(75:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (73:4) {#if qs.startsWith('/')}
    function create_if_block_2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "selectable");
    			if (img.src !== (img_src_value = /*qs*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "q");
    			add_location(img, file$2, 73, 4, 1535);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*qs*/ 2 && img.src !== (img_src_value = /*qs*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(73:4) {#if qs.startsWith('/')}",
    		ctx
    	});

    	return block;
    }

    // (59:4) {:else}
    function create_else_block$2(ctx) {
    	let p;
    	let t_value = /*q*/ ctx[11] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "selectable");
    			add_location(p, file$2, 59, 4, 1234);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*qs*/ 2 && t_value !== (t_value = /*q*/ ctx[11] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(59:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (57:4) {#if q.startsWith('/')}
    function create_if_block_1$1(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "selectable");
    			if (img.src !== (img_src_value = /*q*/ ctx[11])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = String.fromCharCode(97 + /*i*/ ctx[13]));
    			add_location(img, file$2, 57, 4, 1149);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*qs*/ 2 && img.src !== (img_src_value = /*q*/ ctx[11])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(57:4) {#if q.startsWith('/')}",
    		ctx
    	});

    	return block;
    }

    // (54:1) {#each qs as q, i}
    function create_each_block$2(ctx) {
    	let figure;
    	let label;
    	let show_if;
    	let label_for_value;
    	let t0;
    	let div;
    	let input;
    	let input_id_value;
    	let input_name_value;
    	let input_value_value;
    	let t1;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (show_if == null || dirty & /*qs*/ 2) show_if = !!/*q*/ ctx[11].startsWith("/");
    		if (show_if) return create_if_block_1$1;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type_1(ctx, -1);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			label = element("label");
    			if_block.c();
    			t0 = space();
    			div = element("div");
    			input = element("input");
    			t1 = space();
    			attr_dev(label, "for", label_for_value = "q" + /*i*/ ctx[13]);
    			add_location(label, file$2, 55, 3, 1077);
    			attr_dev(input, "id", input_id_value = "q" + /*i*/ ctx[13]);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", input_name_value = "a[" + /*i*/ ctx[13] + "]");
    			input.value = input_value_value = /*as*/ ctx[2][/*i*/ ctx[13]];
    			add_location(input, file$2, 63, 4, 1319);
    			attr_dev(div, "class", "sticky free");
    			add_location(div, file$2, 62, 3, 1289);
    			attr_dev(figure, "class", "abcd");
    			add_location(figure, file$2, 54, 2, 1052);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			append_dev(figure, label);
    			if_block.m(label, null);
    			append_dev(figure, t0);
    			append_dev(figure, div);
    			append_dev(div, input);
    			append_dev(figure, t1);
    			dispose = listen_dev(label, "click", /*_focusFig*/ ctx[4], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(label, null);
    				}
    			}

    			if (dirty & /*as*/ 4 && input_value_value !== (input_value_value = /*as*/ ctx[2][/*i*/ ctx[13]]) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figure);
    			if_block.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(54:1) {#each qs as q, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let div;
    	let show_if;

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty & /*qs*/ 2) show_if = !!Array.isArray(/*qs*/ ctx[1]);
    		if (show_if) return create_if_block$2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			div = element("div");
    			if_block.c();
    			add_location(h1, file$2, 49, 0, 940);
    			attr_dev(div, "id", /*id*/ ctx[3]);
    			attr_dev(div, "class", "slide");
    			add_location(div, file$2, 50, 0, 956);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);

    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			if_block.d();
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
    	var selection, slide;

    	let { idx } = $$props,
    		{ name } = $$props,
    		{ qs } = $$props,
    		{ as } = $$props,
    		{ author } = $$props;

    	const id = `s${idx}`;

    	onMount(() => {
    		slide = document.querySelector("#" + id);
    	});

    	function _focusFig(e) {
    		let el = e;

    		if (e.currentTarget) {
    			/* e.cancelBubble = true;
    e.preventDefault(); */
    			el = e.currentTarget;
    		}

    		_blurEls();
    		el.querySelector(".selectable").style.outline = getComputedStyle(document.documentElement).getPropertyValue("--outline-selected");
    		selection = el;
    	}

    	function _blurEls() {
    		let old = slide.querySelectorAll(".selectable");
    		for (let o of old) o.style.outline = "";
    		selection = null;
    	}

    	function _dispatch(el) {
    		selection.appendChild(el);

    		// console.log(selection.querySelector('#' + id + ' img').alt)
    		let c = count;

    		c[selection.querySelector(".selectable").alt] = el.id;
    		count.set(c);
    	}

    	const writable_props = ["idx", "name", "qs", "as", "author"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Szabad> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Szabad", $$slots, []);

    	$$self.$set = $$props => {
    		if ("idx" in $$props) $$invalidate(5, idx = $$props.idx);
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("qs" in $$props) $$invalidate(1, qs = $$props.qs);
    		if ("as" in $$props) $$invalidate(2, as = $$props.as);
    		if ("author" in $$props) $$invalidate(6, author = $$props.author);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		count,
    		selection,
    		slide,
    		idx,
    		name,
    		qs,
    		as,
    		author,
    		id,
    		_focusFig,
    		_blurEls,
    		_dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("selection" in $$props) selection = $$props.selection;
    		if ("slide" in $$props) slide = $$props.slide;
    		if ("idx" in $$props) $$invalidate(5, idx = $$props.idx);
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("qs" in $$props) $$invalidate(1, qs = $$props.qs);
    		if ("as" in $$props) $$invalidate(2, as = $$props.as);
    		if ("author" in $$props) $$invalidate(6, author = $$props.author);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, qs, as, id, _focusFig, idx, author];
    }

    class Szabad extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { idx: 5, name: 0, qs: 1, as: 2, author: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Szabad",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*idx*/ ctx[5] === undefined && !("idx" in props)) {
    			console.warn("<Szabad> was created without expected prop 'idx'");
    		}

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<Szabad> was created without expected prop 'name'");
    		}

    		if (/*qs*/ ctx[1] === undefined && !("qs" in props)) {
    			console.warn("<Szabad> was created without expected prop 'qs'");
    		}

    		if (/*as*/ ctx[2] === undefined && !("as" in props)) {
    			console.warn("<Szabad> was created without expected prop 'as'");
    		}

    		if (/*author*/ ctx[6] === undefined && !("author" in props)) {
    			console.warn("<Szabad> was created without expected prop 'author'");
    		}
    	}

    	get idx() {
    		throw new Error("<Szabad>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set idx(value) {
    		throw new Error("<Szabad>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Szabad>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Szabad>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get qs() {
    		throw new Error("<Szabad>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set qs(value) {
    		throw new Error("<Szabad>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get as() {
    		throw new Error("<Szabad>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error("<Szabad>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get author() {
    		throw new Error("<Szabad>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set author(value) {
    		throw new Error("<Szabad>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.19.2 */
    const file$3 = "src/App.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (35:2) {#each components as component}
    function create_each_block$3(ctx) {
    	let option;
    	let t0_value = /*component*/ ctx[6].idx + "";
    	let t0;
    	let t1;
    	let t2_value = /*component*/ ctx[6].name + "";
    	let t2;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = text(". ");
    			t2 = text(t2_value);
    			option.__value = option_value_value = /*component*/ ctx[6];
    			option.value = option.__value;
    			add_location(option, file$3, 35, 3, 2238);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(35:2) {#each components as component}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let header;
    	let h1;
    	let t1;
    	let p;
    	let t2;
    	let br;
    	let t3;
    	let t4;
    	let select;
    	let t5;
    	let main;
    	let t6;
    	let footer;
    	let h6;
    	let current;
    	let dispose;
    	let each_value = /*components*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	var switch_value = /*selected*/ ctx[0].qtype;

    	function switch_props(ctx) {
    		return {
    			props: {
    				idx: /*selected*/ ctx[0].idx,
    				qs: /*selected*/ ctx[0].q,
    				as: /*selected*/ ctx[0].a,
    				name: /*selected*/ ctx[0].name,
    				author: /*selected*/ ctx[0].author
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Quizzone experiments!";
    			t1 = space();
    			p = element("p");
    			t2 = text("Nem vagyunk \"bezárva\" egy képernyőbe, mint a projektoron! ");
    			br = element("br");
    			t3 = text("Scrollozhatunk! Drag & drop! Select & pair!");
    			t4 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			main = element("main");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t6 = space();
    			footer = element("footer");
    			h6 = element("h6");
    			h6.textContent = "2020. MÁRcius";
    			add_location(h1, file$3, 26, 1, 1841);
    			add_location(br, file$3, 27, 62, 1934);
    			add_location(p, file$3, 27, 1, 1873);
    			if (/*selected*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			add_location(select, file$3, 33, 1, 2170);
    			add_location(header, file$3, 25, 0, 1831);
    			attr_dev(main, "id", "slides");
    			add_location(main, file$3, 41, 0, 2340);
    			add_location(h6, file$3, 46, 1, 2519);
    			add_location(footer, file$3, 45, 0, 2509);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(header, t1);
    			append_dev(header, p);
    			append_dev(p, t2);
    			append_dev(p, br);
    			append_dev(p, t3);
    			append_dev(header, t4);
    			append_dev(header, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selected*/ ctx[0]);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, main, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, main, null);
    			}

    			insert_dev(target, t6, anchor);
    			insert_dev(target, footer, anchor);
    			append_dev(footer, h6);
    			current = true;
    			dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[5]);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*components*/ 2) {
    				each_value = /*components*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selected*/ 1) {
    				select_option(select, /*selected*/ ctx[0]);
    			}

    			const switch_instance_changes = {};
    			if (dirty & /*selected*/ 1) switch_instance_changes.idx = /*selected*/ ctx[0].idx;
    			if (dirty & /*selected*/ 1) switch_instance_changes.qs = /*selected*/ ctx[0].q;
    			if (dirty & /*selected*/ 1) switch_instance_changes.as = /*selected*/ ctx[0].a;
    			if (dirty & /*selected*/ 1) switch_instance_changes.name = /*selected*/ ctx[0].name;
    			if (dirty & /*selected*/ 1) switch_instance_changes.author = /*selected*/ ctx[0].author;

    			if (switch_value !== (switch_value = /*selected*/ ctx[0].qtype)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, main, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(main);
    			if (switch_instance) destroy_component(switch_instance);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(footer);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const components = [
    		{
    			idx: 1,
    			name: "Párosító",
    			qtype: Parosito,
    			q: [
    				"/images/city.jpeg",
    				"/images/transport.jpeg",
    				"A harmadik egy szöveges",
    				"/images/animals.jpeg",
    				"/images/nature.jpeg",
    				"/images/people.jpeg"
    			],
    			a: ["People", "Nature", "Animals", "Transport", "City"]
    		},
    		{
    			idx: 2,
    			name: "Feleletválasztó - képes",
    			qtype: Felelet,
    			q: "Melyiküknek nincs PhD-fokozata?",
    			a: [
    				"/images/city.jpeg",
    				"/images/transport.jpeg",
    				"/images/animals.jpeg",
    				"/images/nature.jpeg"
    			]
    		},
    		{
    			idx: 3,
    			name: "Feleletválasztó - szöveges",
    			qtype: Felelet,
    			q: "Douglas Adams Galaxis útikalauz stopposoknak című regényében honnan ered a 42, azaz a válasz a kérdések kérdésére?",
    			a: [
    				"Az angol To be kifejezésből, ahol a betűk abc sorszáma 4 és 2",
    				"Az ASCII kódolásban a 42 a „*” karaktert jelenti, ami az informatikában helyettesítő karakter, ami bármit helyettesíthet",
    				"Ez csak egy egyszerű poén, semmi jelentése nincs",
    				"Kínaiul a 4 (shi), japánul a 2 (ni), ha ezt összerakjuk (shini), és kanjikkal leírjuk, akkor a halál kifejezést kapjuk"
    			],
    			author: "Laci, Júdea Népe Front"
    		},
    		{
    			idx: 4,
    			name: "Szabadválasz - vegyes",
    			qtype: Szabad,
    			q: [
    				"/images/city.jpeg",
    				"/images/transport.jpeg",
    				"A harmadik egy szöveges",
    				"/images/animals.jpeg",
    				"/images/nature.jpeg",
    				"/images/people.jpeg",
    				"Az utolsó is szöveges"
    			],
    			a: []
    		},
    		{
    			idx: 5,
    			name: "Szabadválasz - solo",
    			qtype: Szabad,
    			q: "Melyik az egyetlen nyári olimpiai sportág, melynek a székhelye Budapesten található és a nemzetközi szövetség elnöke is magyar?"
    		}
    	];

    	let selected = components[0];
    	let q, a, author;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(0, selected);
    		$$invalidate(1, components);
    	}

    	$$self.$capture_state = () => ({
    		Parosito,
    		Felelet,
    		Szabad,
    		count,
    		components,
    		selected,
    		q,
    		a,
    		author
    	});

    	$$self.$inject_state = $$props => {
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    		if ("q" in $$props) q = $$props.q;
    		if ("a" in $$props) a = $$props.a;
    		if ("author" in $$props) author = $$props.author;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, components, q, a, author, select_change_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
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
      if ((document.hidden || document.msHidden || document.webkitHidden)) {
        // the page has been hidden
    		if (visibility) {
    			console.log(`Másik tabon gugliztál? ${visibility}`);
    			visibility = false;
    		}
      } else {
        // the page has become visible
    		visibility = true;
        //alert('Jó, hogy visszajöttél!')
      }
    });

    window.addEventListener('onblur', () => {
      // the page has been hidden
    	alert('Majdnem elhagytál?');
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
