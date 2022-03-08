define(["@vue/shared","@vue/reactivity","@vue/runtime-core","@vue/runtime-dom"], (dep_0, dep_1, dep_2, dep_3) => {
    const dependencies = new Map([['@vue/shared', dep_0],['@vue/reactivity', dep_1],['@vue/runtime-core', dep_2],['@vue/runtime-dom', dep_3]]);
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
            compile: () => compile
        }); // node_modules/vue/dist/vue.runtime.esm-bundler.js


        var vue_runtime_esm_bundler_exports = {};

        __export(vue_runtime_esm_bundler_exports, {
            compile: () => compile
        });

        var import_runtime_dom = require("@vue/runtime-dom");

        __reExport(vue_runtime_esm_bundler_exports, require("@vue/runtime-dom"));

        function initDev() {
            {
                (0, import_runtime_dom.initCustomFormatter)();
            }
        }

        if (true) {
            initDev();
        }

        var compile = () => {
            if (true) {
                (0, import_runtime_dom.warn)(`Runtime compilation is not supported in this build of Vue. Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".`);
            }
        }; // .temp/input.js


        __reExport(input_exports, vue_runtime_esm_bundler_exports);

        module.exports = __toCommonJS(input_exports);
    };

    code(module, require);
    return module.exports;
});

