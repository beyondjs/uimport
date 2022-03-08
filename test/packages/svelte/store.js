define(["svelte/internal"], (dep_0) => {
    const dependencies = new Map([['svelte/internal', dep_0]]);
    const require = dependency => dependencies.get(dependency);
    const module = {};

    const code = (module, require) => {
        var __defProp = Object.defineProperty;
        var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
        var __getOwnPropNames = Object.getOwnPropertyNames;
        var __hasOwnProp = Object.prototype.hasOwnProperty;

        var __markAsModule = target => __defProp(target, "__esModule", {
            value: true
        });

        var __export = (target, all) => {
            for (var name in all) __defProp(target, name, {
                get: all[name],
                enumerable: true
            });
        };

        var __reExport = (target, module2, copyDefault, desc) => {
            if (module2 && typeof module2 === "object" || typeof module2 === "function") {
                for (let key of __getOwnPropNames(module2)) if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default")) __defProp(target, key, {
                    get: () => module2[key],
                    enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable
                });
            }

            return target;
        };

        var __toCommonJS = /* @__PURE__ */(cache => {
            return (module2, temp) => {
                return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
            };
        })(typeof WeakMap !== "undefined" ? /* @__PURE__ */new WeakMap() : 0); // .temp/input.js


        var input_exports = {};

        __export(input_exports, {
            derived: () => derived,
            get: () => import_internal2.get_store_value,
            readable: () => readable,
            writable: () => writable
        }); // node_modules/svelte/store/index.mjs


        var import_internal = require("svelte/internal");

        var import_internal2 = require("svelte/internal");

        var subscriber_queue = [];

        function readable(value, start) {
            return {
                subscribe: writable(value, start).subscribe
            };
        }

        function writable(value, start = import_internal.noop) {
            let stop;
            const subscribers = /* @__PURE__ */new Set();

            function set(new_value) {
                if ((0, import_internal.safe_not_equal)(value, new_value)) {
                    value = new_value;

                    if (stop) {
                        const run_queue = !subscriber_queue.length;

                        for (const subscriber of subscribers) {
                            subscriber[1]();
                            subscriber_queue.push(subscriber, value);
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

            function subscribe2(run, invalidate = import_internal.noop) {
                const subscriber = [run, invalidate];
                subscribers.add(subscriber);

                if (subscribers.size === 1) {
                    stop = start(set) || import_internal.noop;
                }

                run(value);
                return () => {
                    subscribers.delete(subscriber);

                    if (subscribers.size === 0) {
                        stop();
                        stop = null;
                    }
                };
            }

            return {
                set,
                update,
                subscribe: subscribe2
            };
        }

        function derived(stores, fn, initial_value) {
            const single = !Array.isArray(stores);
            const stores_array = single ? [stores] : stores;
            const auto = fn.length < 2;
            return readable(initial_value, set => {
                let inited = false;
                const values = [];
                let pending = 0;
                let cleanup = import_internal.noop;

                const sync = () => {
                    if (pending) {
                        return;
                    }

                    cleanup();
                    const result = fn(single ? values[0] : values, set);

                    if (auto) {
                        set(result);
                    } else {
                        cleanup = (0, import_internal.is_function)(result) ? result : import_internal.noop;
                    }
                };

                const unsubscribers = stores_array.map((store, i) => (0, import_internal.subscribe)(store, value => {
                    values[i] = value;
                    pending &= ~(1 << i);

                    if (inited) {
                        sync();
                    }
                }, () => {
                    pending |= 1 << i;
                }));
                inited = true;
                sync();
                return function stop() {
                    (0, import_internal.run_all)(unsubscribers);
                    cleanup();
                };
            });
        }

        module.exports = __toCommonJS(input_exports);
    };

    code(module, require);
    return module.exports;
});

