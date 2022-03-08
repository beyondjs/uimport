define(["@vue/shared"], (dep_0) => {
    const dependencies = new Map([['@vue/shared', dep_0]]);
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
            EffectScope: () => EffectScope,
            ITERATE_KEY: () => ITERATE_KEY,
            ReactiveEffect: () => ReactiveEffect,
            computed: () => computed,
            customRef: () => customRef,
            deferredComputed: () => deferredComputed,
            effect: () => effect,
            effectScope: () => effectScope,
            enableTracking: () => enableTracking,
            getCurrentScope: () => getCurrentScope,
            isProxy: () => isProxy,
            isReactive: () => isReactive,
            isReadonly: () => isReadonly,
            isRef: () => isRef,
            isShallow: () => isShallow,
            markRaw: () => markRaw,
            onScopeDispose: () => onScopeDispose,
            pauseTracking: () => pauseTracking,
            proxyRefs: () => proxyRefs,
            reactive: () => reactive,
            readonly: () => readonly,
            ref: () => ref,
            resetTracking: () => resetTracking,
            shallowReactive: () => shallowReactive,
            shallowReadonly: () => shallowReadonly,
            shallowRef: () => shallowRef,
            stop: () => stop,
            toRaw: () => toRaw,
            toRef: () => toRef,
            toRefs: () => toRefs,
            track: () => track,
            trigger: () => trigger,
            triggerRef: () => triggerRef,
            unref: () => unref
        }); // node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js


        var import_shared = require("@vue/shared");

        function warn(msg, ...args) {
            console.warn(`[Vue warn] ${msg}`, ...args);
        }

        var activeEffectScope;
        var EffectScope = class {
            constructor(detached = false) {
                this.active = true;
                this.effects = [];
                this.cleanups = [];

                if (!detached && activeEffectScope) {
                    this.parent = activeEffectScope;
                    this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
                }
            }

            run(fn) {
                if (this.active) {
                    try {
                        activeEffectScope = this;
                        return fn();
                    } finally {
                        activeEffectScope = this.parent;
                    }
                } else if (true) {
                    warn(`cannot run an inactive effect scope.`);
                }
            }

            on() {
                activeEffectScope = this;
            }

            off() {
                activeEffectScope = this.parent;
            }

            stop(fromParent) {
                if (this.active) {
                    let i, l;

                    for (i = 0, l = this.effects.length; i < l; i++) {
                        this.effects[i].stop();
                    }

                    for (i = 0, l = this.cleanups.length; i < l; i++) {
                        this.cleanups[i]();
                    }

                    if (this.scopes) {
                        for (i = 0, l = this.scopes.length; i < l; i++) {
                            this.scopes[i].stop(true);
                        }
                    }

                    if (this.parent && !fromParent) {
                        const last = this.parent.scopes.pop();

                        if (last && last !== this) {
                            this.parent.scopes[this.index] = last;
                            last.index = this.index;
                        }
                    }

                    this.active = false;
                }
            }

        };

        function effectScope(detached) {
            return new EffectScope(detached);
        }

        function recordEffectScope(effect2, scope = activeEffectScope) {
            if (scope && scope.active) {
                scope.effects.push(effect2);
            }
        }

        function getCurrentScope() {
            return activeEffectScope;
        }

        function onScopeDispose(fn) {
            if (activeEffectScope) {
                activeEffectScope.cleanups.push(fn);
            } else if (true) {
                warn(`onScopeDispose() is called when there is no active effect scope to be associated with.`);
            }
        }

        var createDep = effects => {
            const dep = new Set(effects);
            dep.w = 0;
            dep.n = 0;
            return dep;
        };

        var wasTracked = dep => (dep.w & trackOpBit) > 0;

        var newTracked = dep => (dep.n & trackOpBit) > 0;

        var initDepMarkers = ({
                                  deps
                              }) => {
            if (deps.length) {
                for (let i = 0; i < deps.length; i++) {
                    deps[i].w |= trackOpBit;
                }
            }
        };

        var finalizeDepMarkers = effect2 => {
            const {
                deps
            } = effect2;

            if (deps.length) {
                let ptr = 0;

                for (let i = 0; i < deps.length; i++) {
                    const dep = deps[i];

                    if (wasTracked(dep) && !newTracked(dep)) {
                        dep.delete(effect2);
                    } else {
                        deps[ptr++] = dep;
                    }

                    dep.w &= ~trackOpBit;
                    dep.n &= ~trackOpBit;
                }

                deps.length = ptr;
            }
        };

        var targetMap = /* @__PURE__ */new WeakMap();
        var effectTrackDepth = 0;
        var trackOpBit = 1;
        var maxMarkerBits = 30;
        var activeEffect;
        var ITERATE_KEY = Symbol(true ? "iterate" : "");
        var MAP_KEY_ITERATE_KEY = Symbol(true ? "Map key iterate" : "");
        var ReactiveEffect = class {
            constructor(fn, scheduler2 = null, scope) {
                this.fn = fn;
                this.scheduler = scheduler2;
                this.active = true;
                this.deps = [];
                this.parent = void 0;
                recordEffectScope(this, scope);
            }

            run() {
                if (!this.active) {
                    return this.fn();
                }

                let parent = activeEffect;
                let lastShouldTrack = shouldTrack;

                while (parent) {
                    if (parent === this) {
                        return;
                    }

                    parent = parent.parent;
                }

                try {
                    this.parent = activeEffect;
                    activeEffect = this;
                    shouldTrack = true;
                    trackOpBit = 1 << ++effectTrackDepth;

                    if (effectTrackDepth <= maxMarkerBits) {
                        initDepMarkers(this);
                    } else {
                        cleanupEffect(this);
                    }

                    return this.fn();
                } finally {
                    if (effectTrackDepth <= maxMarkerBits) {
                        finalizeDepMarkers(this);
                    }

                    trackOpBit = 1 << --effectTrackDepth;
                    activeEffect = this.parent;
                    shouldTrack = lastShouldTrack;
                    this.parent = void 0;
                }
            }

            stop() {
                if (this.active) {
                    cleanupEffect(this);

                    if (this.onStop) {
                        this.onStop();
                    }

                    this.active = false;
                }
            }

        };

        function cleanupEffect(effect2) {
            const {
                deps
            } = effect2;

            if (deps.length) {
                for (let i = 0; i < deps.length; i++) {
                    deps[i].delete(effect2);
                }

                deps.length = 0;
            }
        }

        function effect(fn, options) {
            if (fn.effect) {
                fn = fn.effect.fn;
            }

            const _effect = new ReactiveEffect(fn);

            if (options) {
                (0, import_shared.extend)(_effect, options);
                if (options.scope) recordEffectScope(_effect, options.scope);
            }

            if (!options || !options.lazy) {
                _effect.run();
            }

            const runner = _effect.run.bind(_effect);

            runner.effect = _effect;
            return runner;
        }

        function stop(runner) {
            runner.effect.stop();
        }

        var shouldTrack = true;
        var trackStack = [];

        function pauseTracking() {
            trackStack.push(shouldTrack);
            shouldTrack = false;
        }

        function enableTracking() {
            trackStack.push(shouldTrack);
            shouldTrack = true;
        }

        function resetTracking() {
            const last = trackStack.pop();
            shouldTrack = last === void 0 ? true : last;
        }

        function track(target, type, key) {
            if (shouldTrack && activeEffect) {
                let depsMap = targetMap.get(target);

                if (!depsMap) {
                    targetMap.set(target, depsMap = /* @__PURE__ */new Map());
                }

                let dep = depsMap.get(key);

                if (!dep) {
                    depsMap.set(key, dep = createDep());
                }

                const eventInfo = true ? {
                    effect: activeEffect,
                    target,
                    type,
                    key
                } : void 0;
                trackEffects(dep, eventInfo);
            }
        }

        function trackEffects(dep, debuggerEventExtraInfo) {
            let shouldTrack2 = false;

            if (effectTrackDepth <= maxMarkerBits) {
                if (!newTracked(dep)) {
                    dep.n |= trackOpBit;
                    shouldTrack2 = !wasTracked(dep);
                }
            } else {
                shouldTrack2 = !dep.has(activeEffect);
            }

            if (shouldTrack2) {
                dep.add(activeEffect);
                activeEffect.deps.push(dep);

                if (activeEffect.onTrack) {
                    activeEffect.onTrack(Object.assign({
                        effect: activeEffect
                    }, debuggerEventExtraInfo));
                }
            }
        }

        function trigger(target, type, key, newValue, oldValue, oldTarget) {
            const depsMap = targetMap.get(target);

            if (!depsMap) {
                return;
            }

            let deps = [];

            if (type === "clear") {
                deps = [...depsMap.values()];
            } else if (key === "length" && (0, import_shared.isArray)(target)) {
                depsMap.forEach((dep, key2) => {
                    if (key2 === "length" || key2 >= newValue) {
                        deps.push(dep);
                    }
                });
            } else {
                if (key !== void 0) {
                    deps.push(depsMap.get(key));
                }

                switch (type) {
                    case "add":
                        if (!(0, import_shared.isArray)(target)) {
                            deps.push(depsMap.get(ITERATE_KEY));

                            if ((0, import_shared.isMap)(target)) {
                                deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
                            }
                        } else if ((0, import_shared.isIntegerKey)(key)) {
                            deps.push(depsMap.get("length"));
                        }

                        break;

                    case "delete":
                        if (!(0, import_shared.isArray)(target)) {
                            deps.push(depsMap.get(ITERATE_KEY));

                            if ((0, import_shared.isMap)(target)) {
                                deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
                            }
                        }

                        break;

                    case "set":
                        if ((0, import_shared.isMap)(target)) {
                            deps.push(depsMap.get(ITERATE_KEY));
                        }

                        break;
                }
            }

            const eventInfo = true ? {
                target,
                type,
                key,
                newValue,
                oldValue,
                oldTarget
            } : void 0;

            if (deps.length === 1) {
                if (deps[0]) {
                    if (true) {
                        triggerEffects(deps[0], eventInfo);
                    } else {
                        triggerEffects(deps[0]);
                    }
                }
            } else {
                const effects = [];

                for (const dep of deps) {
                    if (dep) {
                        effects.push(...dep);
                    }
                }

                if (true) {
                    triggerEffects(createDep(effects), eventInfo);
                } else {
                    triggerEffects(createDep(effects));
                }
            }
        }

        function triggerEffects(dep, debuggerEventExtraInfo) {
            for (const effect2 of (0, import_shared.isArray)(dep) ? dep : [...dep]) {
                if (effect2 !== activeEffect || effect2.allowRecurse) {
                    if (effect2.onTrigger) {
                        effect2.onTrigger((0, import_shared.extend)({
                            effect: effect2
                        }, debuggerEventExtraInfo));
                    }

                    if (effect2.scheduler) {
                        effect2.scheduler();
                    } else {
                        effect2.run();
                    }
                }
            }
        }

        var isNonTrackableKeys = /* @__PURE__ */(0, import_shared.makeMap)(`__proto__,__v_isRef,__isVue`);
        var builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol).map(key => Symbol[key]).filter(import_shared.isSymbol));
        var get = /* @__PURE__ */createGetter();
        var shallowGet = /* @__PURE__ */createGetter(false, true);
        var readonlyGet = /* @__PURE__ */createGetter(true);
        var shallowReadonlyGet = /* @__PURE__ */createGetter(true, true);
        var arrayInstrumentations = /* @__PURE__ */createArrayInstrumentations();

        function createArrayInstrumentations() {
            const instrumentations = {};
            ["includes", "indexOf", "lastIndexOf"].forEach(key => {
                instrumentations[key] = function (...args) {
                    const arr = toRaw(this);

                    for (let i = 0, l = this.length; i < l; i++) {
                        track(arr, "get", i + "");
                    }

                    const res = arr[key](...args);

                    if (res === -1 || res === false) {
                        return arr[key](...args.map(toRaw));
                    } else {
                        return res;
                    }
                };
            });
            ["push", "pop", "shift", "unshift", "splice"].forEach(key => {
                instrumentations[key] = function (...args) {
                    pauseTracking();
                    const res = toRaw(this)[key].apply(this, args);
                    resetTracking();
                    return res;
                };
            });
            return instrumentations;
        }

        function createGetter(isReadonly2 = false, shallow = false) {
            return function get2(target, key, receiver) {
                if (key === "__v_isReactive") {
                    return !isReadonly2;
                } else if (key === "__v_isReadonly") {
                    return isReadonly2;
                } else if (key === "__v_isShallow") {
                    return shallow;
                } else if (key === "__v_raw" && receiver === (isReadonly2 ? shallow ? shallowReadonlyMap : readonlyMap : shallow ? shallowReactiveMap : reactiveMap).get(target)) {
                    return target;
                }

                const targetIsArray = (0, import_shared.isArray)(target);

                if (!isReadonly2 && targetIsArray && (0, import_shared.hasOwn)(arrayInstrumentations, key)) {
                    return Reflect.get(arrayInstrumentations, key, receiver);
                }

                const res = Reflect.get(target, key, receiver);

                if ((0, import_shared.isSymbol)(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
                    return res;
                }

                if (!isReadonly2) {
                    track(target, "get", key);
                }

                if (shallow) {
                    return res;
                }

                if (isRef(res)) {
                    const shouldUnwrap = !targetIsArray || !(0, import_shared.isIntegerKey)(key);
                    return shouldUnwrap ? res.value : res;
                }

                if ((0, import_shared.isObject)(res)) {
                    return isReadonly2 ? readonly(res) : reactive(res);
                }

                return res;
            };
        }

        var set = /* @__PURE__ */createSetter();
        var shallowSet = /* @__PURE__ */createSetter(true);

        function createSetter(shallow = false) {
            return function set2(target, key, value, receiver) {
                let oldValue = target[key];

                if (isReadonly(oldValue) && isRef(oldValue) && !isRef(value)) {
                    return false;
                }

                if (!shallow && !isReadonly(value)) {
                    if (!isShallow(value)) {
                        value = toRaw(value);
                        oldValue = toRaw(oldValue);
                    }

                    if (!(0, import_shared.isArray)(target) && isRef(oldValue) && !isRef(value)) {
                        oldValue.value = value;
                        return true;
                    }
                }

                const hadKey = (0, import_shared.isArray)(target) && (0, import_shared.isIntegerKey)(key) ? Number(key) < target.length : (0, import_shared.hasOwn)(target, key);
                const result = Reflect.set(target, key, value, receiver);

                if (target === toRaw(receiver)) {
                    if (!hadKey) {
                        trigger(target, "add", key, value);
                    } else if ((0, import_shared.hasChanged)(value, oldValue)) {
                        trigger(target, "set", key, value, oldValue);
                    }
                }

                return result;
            };
        }

        function deleteProperty(target, key) {
            const hadKey = (0, import_shared.hasOwn)(target, key);
            const oldValue = target[key];
            const result = Reflect.deleteProperty(target, key);

            if (result && hadKey) {
                trigger(target, "delete", key, void 0, oldValue);
            }

            return result;
        }

        function has(target, key) {
            const result = Reflect.has(target, key);

            if (!(0, import_shared.isSymbol)(key) || !builtInSymbols.has(key)) {
                track(target, "has", key);
            }

            return result;
        }

        function ownKeys(target) {
            track(target, "iterate", (0, import_shared.isArray)(target) ? "length" : ITERATE_KEY);
            return Reflect.ownKeys(target);
        }

        var mutableHandlers = {
            get,
            set,
            deleteProperty,
            has,
            ownKeys
        };
        var readonlyHandlers = {
            get: readonlyGet,

            set(target, key) {
                if (true) {
                    console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
                }

                return true;
            },

            deleteProperty(target, key) {
                if (true) {
                    console.warn(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
                }

                return true;
            }

        };
        var shallowReactiveHandlers = /* @__PURE__ */(0, import_shared.extend)({}, mutableHandlers, {
            get: shallowGet,
            set: shallowSet
        });
        var shallowReadonlyHandlers = /* @__PURE__ */(0, import_shared.extend)({}, readonlyHandlers, {
            get: shallowReadonlyGet
        });

        var toShallow = value => value;

        var getProto = v => Reflect.getPrototypeOf(v);

        function get$1(target, key, isReadonly2 = false, isShallow2 = false) {
            target = target["__v_raw"];
            const rawTarget = toRaw(target);
            const rawKey = toRaw(key);

            if (key !== rawKey) {
                !isReadonly2 && track(rawTarget, "get", key);
            }

            !isReadonly2 && track(rawTarget, "get", rawKey);
            const {
                has: has2
            } = getProto(rawTarget);
            const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;

            if (has2.call(rawTarget, key)) {
                return wrap(target.get(key));
            } else if (has2.call(rawTarget, rawKey)) {
                return wrap(target.get(rawKey));
            } else if (target !== rawTarget) {
                target.get(key);
            }
        }

        function has$1(key, isReadonly2 = false) {
            const target = this["__v_raw"];
            const rawTarget = toRaw(target);
            const rawKey = toRaw(key);

            if (key !== rawKey) {
                !isReadonly2 && track(rawTarget, "has", key);
            }

            !isReadonly2 && track(rawTarget, "has", rawKey);
            return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
        }

        function size(target, isReadonly2 = false) {
            target = target["__v_raw"];
            !isReadonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
            return Reflect.get(target, "size", target);
        }

        function add(value) {
            value = toRaw(value);
            const target = toRaw(this);
            const proto = getProto(target);
            const hadKey = proto.has.call(target, value);

            if (!hadKey) {
                target.add(value);
                trigger(target, "add", value, value);
            }

            return this;
        }

        function set$1(key, value) {
            value = toRaw(value);
            const target = toRaw(this);
            const {
                has: has2,
                get: get2
            } = getProto(target);
            let hadKey = has2.call(target, key);

            if (!hadKey) {
                key = toRaw(key);
                hadKey = has2.call(target, key);
            } else if (true) {
                checkIdentityKeys(target, has2, key);
            }

            const oldValue = get2.call(target, key);
            target.set(key, value);

            if (!hadKey) {
                trigger(target, "add", key, value);
            } else if ((0, import_shared.hasChanged)(value, oldValue)) {
                trigger(target, "set", key, value, oldValue);
            }

            return this;
        }

        function deleteEntry(key) {
            const target = toRaw(this);
            const {
                has: has2,
                get: get2
            } = getProto(target);
            let hadKey = has2.call(target, key);

            if (!hadKey) {
                key = toRaw(key);
                hadKey = has2.call(target, key);
            } else if (true) {
                checkIdentityKeys(target, has2, key);
            }

            const oldValue = get2 ? get2.call(target, key) : void 0;
            const result = target.delete(key);

            if (hadKey) {
                trigger(target, "delete", key, void 0, oldValue);
            }

            return result;
        }

        function clear() {
            const target = toRaw(this);
            const hadItems = target.size !== 0;
            const oldTarget = true ? (0, import_shared.isMap)(target) ? new Map(target) : new Set(target) : void 0;
            const result = target.clear();

            if (hadItems) {
                trigger(target, "clear", void 0, void 0, oldTarget);
            }

            return result;
        }

        function createForEach(isReadonly2, isShallow2) {
            return function forEach(callback, thisArg) {
                const observed = this;
                const target = observed["__v_raw"];
                const rawTarget = toRaw(target);
                const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
                !isReadonly2 && track(rawTarget, "iterate", ITERATE_KEY);
                return target.forEach((value, key) => {
                    return callback.call(thisArg, wrap(value), wrap(key), observed);
                });
            };
        }

        function createIterableMethod(method, isReadonly2, isShallow2) {
            return function (...args) {
                const target = this["__v_raw"];
                const rawTarget = toRaw(target);
                const targetIsMap = (0, import_shared.isMap)(rawTarget);
                const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
                const isKeyOnly = method === "keys" && targetIsMap;
                const innerIterator = target[method](...args);
                const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
                !isReadonly2 && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
                return {
                    next() {
                        const {
                            value,
                            done
                        } = innerIterator.next();
                        return done ? {
                            value,
                            done
                        } : {
                            value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
                            done
                        };
                    },

                    [Symbol.iterator]() {
                        return this;
                    }

                };
            };
        }

        function createReadonlyMethod(type) {
            return function (...args) {
                if (true) {
                    const key = args[0] ? `on key "${args[0]}" ` : ``;
                    console.warn(`${(0, import_shared.capitalize)(type)} operation ${key}failed: target is readonly.`, toRaw(this));
                }

                return type === "delete" ? false : this;
            };
        }

        function createInstrumentations() {
            const mutableInstrumentations2 = {
                get(key) {
                    return get$1(this, key);
                },

                get size() {
                    return size(this);
                },

                has: has$1,
                add,
                set: set$1,
                delete: deleteEntry,
                clear,
                forEach: createForEach(false, false)
            };
            const shallowInstrumentations2 = {
                get(key) {
                    return get$1(this, key, false, true);
                },

                get size() {
                    return size(this);
                },

                has: has$1,
                add,
                set: set$1,
                delete: deleteEntry,
                clear,
                forEach: createForEach(false, true)
            };
            const readonlyInstrumentations2 = {
                get(key) {
                    return get$1(this, key, true);
                },

                get size() {
                    return size(this, true);
                },

                has(key) {
                    return has$1.call(this, key, true);
                },

                add: createReadonlyMethod("add"),
                set: createReadonlyMethod("set"),
                delete: createReadonlyMethod("delete"),
                clear: createReadonlyMethod("clear"),
                forEach: createForEach(true, false)
            };
            const shallowReadonlyInstrumentations2 = {
                get(key) {
                    return get$1(this, key, true, true);
                },

                get size() {
                    return size(this, true);
                },

                has(key) {
                    return has$1.call(this, key, true);
                },

                add: createReadonlyMethod("add"),
                set: createReadonlyMethod("set"),
                delete: createReadonlyMethod("delete"),
                clear: createReadonlyMethod("clear"),
                forEach: createForEach(true, true)
            };
            const iteratorMethods = ["keys", "values", "entries", Symbol.iterator];
            iteratorMethods.forEach(method => {
                mutableInstrumentations2[method] = createIterableMethod(method, false, false);
                readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
                shallowInstrumentations2[method] = createIterableMethod(method, false, true);
                shallowReadonlyInstrumentations2[method] = createIterableMethod(method, true, true);
            });
            return [mutableInstrumentations2, readonlyInstrumentations2, shallowInstrumentations2, shallowReadonlyInstrumentations2];
        }

        var [mutableInstrumentations, readonlyInstrumentations, shallowInstrumentations, shallowReadonlyInstrumentations] = /* @__PURE__ */createInstrumentations();

        function createInstrumentationGetter(isReadonly2, shallow) {
            const instrumentations = shallow ? isReadonly2 ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly2 ? readonlyInstrumentations : mutableInstrumentations;
            return (target, key, receiver) => {
                if (key === "__v_isReactive") {
                    return !isReadonly2;
                } else if (key === "__v_isReadonly") {
                    return isReadonly2;
                } else if (key === "__v_raw") {
                    return target;
                }

                return Reflect.get((0, import_shared.hasOwn)(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
            };
        }

        var mutableCollectionHandlers = {
            get: /* @__PURE__ */createInstrumentationGetter(false, false)
        };
        var shallowCollectionHandlers = {
            get: /* @__PURE__ */createInstrumentationGetter(false, true)
        };
        var readonlyCollectionHandlers = {
            get: /* @__PURE__ */createInstrumentationGetter(true, false)
        };
        var shallowReadonlyCollectionHandlers = {
            get: /* @__PURE__ */createInstrumentationGetter(true, true)
        };

        function checkIdentityKeys(target, has2, key) {
            const rawKey = toRaw(key);

            if (rawKey !== key && has2.call(target, rawKey)) {
                const type = (0, import_shared.toRawType)(target);
                console.warn(`Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`);
            }
        }

        var reactiveMap = /* @__PURE__ */new WeakMap();
        var shallowReactiveMap = /* @__PURE__ */new WeakMap();
        var readonlyMap = /* @__PURE__ */new WeakMap();
        var shallowReadonlyMap = /* @__PURE__ */new WeakMap();

        function targetTypeMap(rawType) {
            switch (rawType) {
                case "Object":
                case "Array":
                    return 1;

                case "Map":
                case "Set":
                case "WeakMap":
                case "WeakSet":
                    return 2;

                default:
                    return 0;
            }
        }

        function getTargetType(value) {
            return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap((0, import_shared.toRawType)(value));
        }

        function reactive(target) {
            if (isReadonly(target)) {
                return target;
            }

            return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
        }

        function shallowReactive(target) {
            return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
        }

        function readonly(target) {
            return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
        }

        function shallowReadonly(target) {
            return createReactiveObject(target, true, shallowReadonlyHandlers, shallowReadonlyCollectionHandlers, shallowReadonlyMap);
        }

        function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
            if (!(0, import_shared.isObject)(target)) {
                if (true) {
                    console.warn(`value cannot be made reactive: ${String(target)}`);
                }

                return target;
            }

            if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
                return target;
            }

            const existingProxy = proxyMap.get(target);

            if (existingProxy) {
                return existingProxy;
            }

            const targetType = getTargetType(target);

            if (targetType === 0) {
                return target;
            }

            const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
            proxyMap.set(target, proxy);
            return proxy;
        }

        function isReactive(value) {
            if (isReadonly(value)) {
                return isReactive(value["__v_raw"]);
            }

            return !!(value && value["__v_isReactive"]);
        }

        function isReadonly(value) {
            return !!(value && value["__v_isReadonly"]);
        }

        function isShallow(value) {
            return !!(value && value["__v_isShallow"]);
        }

        function isProxy(value) {
            return isReactive(value) || isReadonly(value);
        }

        function toRaw(observed) {
            const raw = observed && observed["__v_raw"];
            return raw ? toRaw(raw) : observed;
        }

        function markRaw(value) {
            (0, import_shared.def)(value, "__v_skip", true);
            return value;
        }

        var toReactive = value => (0, import_shared.isObject)(value) ? reactive(value) : value;

        var toReadonly = value => (0, import_shared.isObject)(value) ? readonly(value) : value;

        function trackRefValue(ref2) {
            if (shouldTrack && activeEffect) {
                ref2 = toRaw(ref2);

                if (true) {
                    trackEffects(ref2.dep || (ref2.dep = createDep()), {
                        target: ref2,
                        type: "get",
                        key: "value"
                    });
                } else {
                    trackEffects(ref2.dep || (ref2.dep = createDep()));
                }
            }
        }

        function triggerRefValue(ref2, newVal) {
            ref2 = toRaw(ref2);

            if (ref2.dep) {
                if (true) {
                    triggerEffects(ref2.dep, {
                        target: ref2,
                        type: "set",
                        key: "value",
                        newValue: newVal
                    });
                } else {
                    triggerEffects(ref2.dep);
                }
            }
        }

        function isRef(r) {
            return !!(r && r.__v_isRef === true);
        }

        function ref(value) {
            return createRef(value, false);
        }

        function shallowRef(value) {
            return createRef(value, true);
        }

        function createRef(rawValue, shallow) {
            if (isRef(rawValue)) {
                return rawValue;
            }

            return new RefImpl(rawValue, shallow);
        }

        var RefImpl = class {
            constructor(value, __v_isShallow) {
                this.__v_isShallow = __v_isShallow;
                this.dep = void 0;
                this.__v_isRef = true;
                this._rawValue = __v_isShallow ? value : toRaw(value);
                this._value = __v_isShallow ? value : toReactive(value);
            }

            get value() {
                trackRefValue(this);
                return this._value;
            }

            set value(newVal) {
                newVal = this.__v_isShallow ? newVal : toRaw(newVal);

                if ((0, import_shared.hasChanged)(newVal, this._rawValue)) {
                    this._rawValue = newVal;
                    this._value = this.__v_isShallow ? newVal : toReactive(newVal);
                    triggerRefValue(this, newVal);
                }
            }

        };

        function triggerRef(ref2) {
            triggerRefValue(ref2, true ? ref2.value : void 0);
        }

        function unref(ref2) {
            return isRef(ref2) ? ref2.value : ref2;
        }

        var shallowUnwrapHandlers = {
            get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
            set: (target, key, value, receiver) => {
                const oldValue = target[key];

                if (isRef(oldValue) && !isRef(value)) {
                    oldValue.value = value;
                    return true;
                } else {
                    return Reflect.set(target, key, value, receiver);
                }
            }
        };

        function proxyRefs(objectWithRefs) {
            return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
        }

        var CustomRefImpl = class {
            constructor(factory) {
                this.dep = void 0;
                this.__v_isRef = true;
                const {
                    get: get2,
                    set: set2
                } = factory(() => trackRefValue(this), () => triggerRefValue(this));
                this._get = get2;
                this._set = set2;
            }

            get value() {
                return this._get();
            }

            set value(newVal) {
                this._set(newVal);
            }

        };

        function customRef(factory) {
            return new CustomRefImpl(factory);
        }

        function toRefs(object) {
            if (!isProxy(object)) {
                console.warn(`toRefs() expects a reactive object but received a plain one.`);
            }

            const ret = (0, import_shared.isArray)(object) ? new Array(object.length) : {};

            for (const key in object) {
                ret[key] = toRef(object, key);
            }

            return ret;
        }

        var ObjectRefImpl = class {
            constructor(_object, _key, _defaultValue) {
                this._object = _object;
                this._key = _key;
                this._defaultValue = _defaultValue;
                this.__v_isRef = true;
            }

            get value() {
                const val = this._object[this._key];
                return val === void 0 ? this._defaultValue : val;
            }

            set value(newVal) {
                this._object[this._key] = newVal;
            }

        };

        function toRef(object, key, defaultValue) {
            const val = object[key];
            return isRef(val) ? val : new ObjectRefImpl(object, key, defaultValue);
        }

        var ComputedRefImpl = class {
            constructor(getter, _setter, isReadonly2, isSSR) {
                this._setter = _setter;
                this.dep = void 0;
                this.__v_isRef = true;
                this._dirty = true;
                this.effect = new ReactiveEffect(getter, () => {
                    if (!this._dirty) {
                        this._dirty = true;
                        triggerRefValue(this);
                    }
                });
                this.effect.computed = this;
                this.effect.active = this._cacheable = !isSSR;
                this["__v_isReadonly"] = isReadonly2;
            }

            get value() {
                const self = toRaw(this);
                trackRefValue(self);

                if (self._dirty || !self._cacheable) {
                    self._dirty = false;
                    self._value = self.effect.run();
                }

                return self._value;
            }

            set value(newValue) {
                this._setter(newValue);
            }

        };

        function computed(getterOrOptions, debugOptions, isSSR = false) {
            let getter;
            let setter;
            const onlyGetter = (0, import_shared.isFunction)(getterOrOptions);

            if (onlyGetter) {
                getter = getterOrOptions;
                setter = true ? () => {
                    console.warn("Write operation failed: computed value is readonly");
                } : import_shared.NOOP;
            } else {
                getter = getterOrOptions.get;
                setter = getterOrOptions.set;
            }

            const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);

            if (debugOptions && !isSSR) {
                cRef.effect.onTrack = debugOptions.onTrack;
                cRef.effect.onTrigger = debugOptions.onTrigger;
            }

            return cRef;
        }

        var _a;

        var tick = Promise.resolve();
        var queue = [];
        var queued = false;

        var scheduler = fn => {
            queue.push(fn);

            if (!queued) {
                queued = true;
                tick.then(flush);
            }
        };

        var flush = () => {
            for (let i = 0; i < queue.length; i++) {
                queue[i]();
            }

            queue.length = 0;
            queued = false;
        };

        var DeferredComputedRefImpl = class {
            constructor(getter) {
                this.dep = void 0;
                this._dirty = true;
                this.__v_isRef = true;
                this[_a] = true;
                let compareTarget;
                let hasCompareTarget = false;
                let scheduled = false;
                this.effect = new ReactiveEffect(getter, computedTrigger => {
                    if (this.dep) {
                        if (computedTrigger) {
                            compareTarget = this._value;
                            hasCompareTarget = true;
                        } else if (!scheduled) {
                            const valueToCompare = hasCompareTarget ? compareTarget : this._value;
                            scheduled = true;
                            hasCompareTarget = false;
                            scheduler(() => {
                                if (this.effect.active && this._get() !== valueToCompare) {
                                    triggerRefValue(this);
                                }

                                scheduled = false;
                            });
                        }

                        for (const e of this.dep) {
                            if (e.computed instanceof DeferredComputedRefImpl) {
                                e.scheduler(true);
                            }
                        }
                    }

                    this._dirty = true;
                });
                this.effect.computed = this;
            }

            _get() {
                if (this._dirty) {
                    this._dirty = false;
                    return this._value = this.effect.run();
                }

                return this._value;
            }

            get value() {
                trackRefValue(this);
                return toRaw(this)._get();
            }

        };
        _a = "__v_isReadonly";

        function deferredComputed(getter) {
            return new DeferredComputedRefImpl(getter);
        }

        module.exports = __toCommonJS(input_exports);
    };

    code(module, require);
    return module.exports;
});

