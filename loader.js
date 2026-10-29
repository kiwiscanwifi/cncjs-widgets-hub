/**
 * CNCjs Universal Native Widget Extension Loader & Generic Hook Engine
 * Single inclusion script loaded in index.hbs
 * 
 * Provides:
 *  1. window.CNCjsHooks: Pure generic hook interface for CNCjs core
 *     - getWidgets(): returns list of installed widgets for native Manage Widgets
 *     - getComponent(id, defaultComp): maps installed widgets to the container
 *     - getDefaults(id): provides URL and Title defaults on widget mount
 *     - getSettings(id): routes the Edit icon (⚙️) to the custom settings page
 *  2. Real-time BroadcastChannel sync with zero page refreshes
 *  3. Global modal dismissal helper (window.CNCjsCloseModal)
 */
(function() {
    'use strict';

    console.log('[WidgetHub] Initializing Universal Native Widget Loader & Generic Hook Engine');

    const SERVER_STATE_FILE = 'widgets/widget_hub_state.json';
    const REGISTRY_URL = '/widgets/registry.json';

    // 1. Cross-Widget Event Bus
    window.CNCjsWidgetBus = window.BroadcastChannel ? new BroadcastChannel('cncjs:widgets') : null;

    // 2. Synchronous Default Registry (ensures immediate availability on boot)
    const DEFAULT_REGISTRY = {
        "widget-hub": {
            "id": "widget-hub",
            "name": "Widget Hub",
            "url": "/widgets/widget-hub/",
            "settingsUrl": "/widgets/widget-hub/settings.html",
            "settingsHeight": "540px",
            "description": "CNCjs Custom Widget manager and catalog with server-side persistence and version contracts.",
            "header": {
                "showRefresh": true,
                "showSettings": true,
                "showCollapse": true,
                "showDropdown": true,
                "showFullscreen": true,
                "showFork": false,
                "showRemove": false,
                "hideHeader": false
            }
        },
        "potentiometer": {
            "id": "potentiometer",
            "name": "Potentiometer",
            "url": "/widgets/potentiometer/",
            "settingsUrl": "/widgets/potentiometer/settings.html",
            "settingsHeight": "390px",
            "description": "Tactile Feed Rate and Spindle RPM override dials with Makita RT0700C speed dial"
        },
        "touch-probe-status": {
            "id": "touch-probe-status",
            "name": "Touch Probe Status",
            "url": "/widgets/touch-probe-status/",
            "description": "Real-time M119 electrical continuity interlock indicator and Z-50mm test probe cycle."
        },
        "surfacing": {
            "id": "surfacing",
            "name": "Surfacing",
            "url": "/widgets/surfacing/",
            "description": "Interactive spoilboard and stock surfacing toolpath generator."
        },
        "system-manager": {
            "id": "system-manager",
            "name": "System Manager",
            "url": "/widgets/system-manager/",
            "settingsUrl": "/widgets/system-manager/settings.html",
            "settingsHeight": "400px",
            "description": "Host OS power management (reboot, shutdown, CNCjs restart, and sync) with active-cut interlock."
        }
    };

    window.CNCjsRegistry = Object.assign({}, DEFAULT_REGISTRY);
    var _cachedInstalled = null;
    try {
        var _c = localStorage.getItem('cncjs_installed_widgets');
        if (_c) _cachedInstalled = JSON.parse(_c);
    } catch(e) {}
    window.CNCjsActiveWidgets = Array.isArray(_cachedInstalled) 
        ? _cachedInstalled 
        : Object.keys(DEFAULT_REGISTRY);

    // 3. Global Modal Closer Bridge for settings iframes
    window.CNCjsCloseModal = function() {
        // Find and click the native TrendMicro / Bootstrap modal close button
        const closeBtn = document.querySelector(
            '.modal---modal-content---3pwnC .modal---close---28rLZ, ' +
            '.modal---modal-footer---20LPi button, ' +
            '.modal-header button.close, ' +
            '.modal-footer button.btn-default'
        );
        if (closeBtn) {
            closeBtn.click();
        } else {
            const modalOverlay = document.querySelector('.modal---modal-overlay---3D5Nr, .modal.in, .modal-backdrop');
            if (modalOverlay) modalOverlay.style.display = 'none';
        }
    };


    // Global Theme & Header Governance Engine
    function applyTheme(theme) {
        if (!theme) return;
        try { localStorage.setItem('cncjs_hub_theme', theme); } catch(e) {}
        if (typeof document !== 'undefined' && document.documentElement) {
            document.documentElement.setAttribute('data-theme', theme);
        }
        var iframes = document.querySelectorAll('iframe');
        for (var i = 0; i < iframes.length; i++) {
            try {
                if (iframes[i].contentDocument && iframes[i].contentDocument.documentElement) {
                    iframes[i].contentDocument.documentElement.setAttribute('data-theme', theme);
                }
            } catch(e) {}
        }
    }

    function applyHubConfig(cfg) {
        if (!cfg) return;
        if (cfg.theme) {
            applyTheme(cfg.theme);
        }
        if (cfg.headers && window.CNCjsRegistry) {
            for (var wid in cfg.headers) {
                if (window.CNCjsRegistry[wid]) {
                    window.CNCjsRegistry[wid].header = Object.assign({}, window.CNCjsRegistry[wid].header || {}, cfg.headers[wid]);
                }
            }
            if (typeof scanAndSizeIframes === 'function') {
                scanAndSizeIframes();
            }
        }
    }

    function loadHubConfig() {
        return fetch('/api/watch/file?file=widgets/widget-hub/config.json&_t=' + Date.now())
            .then(function(r) { return r.json(); })
            .then(function(res) {
                if (res && res.data) {
                    var cfg = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
                    applyHubConfig(cfg);
                }
            })
            .catch(function() {});
    }

    // Initialize initial theme from localStorage on boot
    try {
        var _bootTheme = localStorage.getItem('cncjs_hub_theme');
        if (_bootTheme && document.documentElement) {
            document.documentElement.setAttribute('data-theme', _bootTheme);
        }
    } catch(e) {}

    // 4. Fetch Widget Registry Asynchronously
    function fetchRegistry() {
        return fetch(REGISTRY_URL + '?_t=' + Date.now())
            .then(r => r.json())
            .then(data => {
                if (data && typeof data === 'object') {
                    window.CNCjsRegistry = Object.assign({}, DEFAULT_REGISTRY, data);
                    console.log('[WidgetHub] Loaded widget registry:', Object.keys(window.CNCjsRegistry));
                    loadHubConfig();
                }
            })
            .catch(err => {
                console.warn('[WidgetHub] Could not load registry.json, using defaults:', err);
            });
    }

    // 5. Dynamic Active Widgets List from Server
    function syncActiveWidgetsFromServer() {
        return fetch('/api/watch/file?file=' + encodeURIComponent(SERVER_STATE_FILE) + '&_t=' + Date.now())
            .then(r => r.json())
            .then(res => {
                if (res && res.data) {
                    try {
                        const parsed = JSON.parse(res.data);
                        const installed = Array.isArray(parsed.installed) ? parsed.installed : Object.keys(window.CNCjsRegistry).filter(k => k !== 'widget-hub');
                        window.CNCjsActiveWidgets = installed;
                        try {
                            localStorage.setItem('cncjs_installed_widgets', JSON.stringify(window.CNCjsActiveWidgets));
                        } catch(e) {}
                        console.log('[WidgetHub] Synced active native widgets from server:', window.CNCjsActiveWidgets);
                    } catch(e) {}
                }
            })
            .catch(err => {
                console.warn('[WidgetHub] Could not load server state:', err);
            });
    }

    // Initialize registry and server state
    
    // Run immediate store sync on boot
    registerWidgetsInStore();
    fetchRegistry().then(() => {
        syncActiveWidgetsFromServer();
    });

    // Listen for live state updates from Widget Hub
    if (window.CNCjsWidgetBus) {
        window.CNCjsWidgetBus.onmessage = function(event) {
            const data = event.data || {};
            if (data.action === 'registryStateUpdated') {
                console.log('[WidgetHub] Received registryStateUpdated. Live updating active widgets...');
                if (data.state && Array.isArray(data.state.installed)) {
                    window.CNCjsActiveWidgets = data.state.installed;
                    try {
                        localStorage.setItem('cncjs_installed_widgets', JSON.stringify(window.CNCjsActiveWidgets));
                    } catch(e) {}
                }
                fetchRegistry().then(() => {
                    syncActiveWidgetsFromServer();
                });
            }
        };
    }

    // 6. Define Pure Generic Hook API on window.CNCjsHooks
    window.CNCjsHooks = {
        // Return dynamic native widgets installed in Widget Hub
        getWidgets: function() {
            registerWidgetsInStore();
            if (!window.CNCjsActiveWidgets || !window.CNCjsRegistry) return [];
            return window.CNCjsActiveWidgets.map(function(id) {
                var meta = window.CNCjsRegistry[id] || {};
                return {
                    id: id,
                    caption: meta.name || id,
                    details: meta.description || '',
                    visible: true,
                    disabled: false
                };
            });
        },

        // Resolve React Component for custom widgets (maps to native UP container)
        getComponent: function(widgetId, defaultCustomComponent) {
            if (window.CNCjsRegistry && window.CNCjsRegistry[widgetId]) {
                return defaultCustomComponent;
            }
            return null;
        },

        // Resolve default URL and Title for custom widgets
        getDefaults: function(widgetId) {
            var meta = (window.CNCjsRegistry && window.CNCjsRegistry[widgetId]) || {};
            return {
                title: meta.name || '',
                url: meta.url || ''
            };
        },

        // Resolve custom settings page metadata for any widget
        getSettings: function(widgetId) {
            var meta = (window.CNCjsRegistry && window.CNCjsRegistry[widgetId]) || {};
            // Match by registered URL or common alias
            if (!meta.settingsUrl && widgetId) {
                for (var k in window.CNCjsRegistry) {
                    var candidate = window.CNCjsRegistry[k];
                    if (candidate.url && widgetId.indexOf(candidate.url) !== -1) {
                        meta = candidate;
                        break;
                    }
                }
                if (!meta.settingsUrl) {
                    if (widgetId.indexOf('/potentiometer/') !== -1) {
                        meta = window.CNCjsRegistry['potentiometer'] || meta;
                    } else if (widgetId.indexOf('/surfacing/') !== -1) {
                        meta = window.CNCjsRegistry['surfacing'] || meta;
                    }
                }
            }

            if (meta && meta.settingsUrl) {
                return {
                    title: '⚙️ ' + (meta.name || widgetId) + ' Settings',
                    url: meta.settingsUrl,
                    height: meta.settingsHeight || '480px'
                };
            }
            return null;
        },

        // Check if a widget is managed by the Widget Hub registry
                // Resolve header control visibility from widget.json manifest & defaults
        getHeaderConfig: function(widgetId) {
            var meta = (window.CNCjsRegistry && window.CNCjsRegistry[widgetId]) || {};
            var h = meta.header || {};
            return {
                showRefresh: h.showRefresh !== false,
                showSettings: h.showSettings !== undefined ? !!h.showSettings : (!!meta.settingsUrl || !!meta.settings),
                showCollapse: h.showCollapse !== false,
                showDropdown: h.showDropdown !== false,
                showFullscreen: h.showFullscreen === true,
                showFork: h.showFork === true, // Fork disabled by default for managed widgets
                showRemove: h.showRemove !== false,
                hideHeader: h.hideHeader === true
            };
        },

        isManagedWidget: function(widgetId, widgetUrl) {
            if (!widgetId && !widgetUrl) return false;
            if (window.CNCjsRegistry && window.CNCjsRegistry[widgetId]) {
                return true;
            }
            if (widgetUrl && window.CNCjsRegistry) {
                for (var k in window.CNCjsRegistry) {
                    var candidate = window.CNCjsRegistry[k];
                    if (candidate.url && (widgetUrl.indexOf(candidate.url) !== -1 || candidate.url.indexOf(widgetUrl) !== -1)) {
                        return true;
                    }
                }
            }
            return false;
        },

        // Check if widget is active in CNCjs primary/secondary workspace containers
        isWidgetActive: function(widgetId) {
            if (!widgetId) return false;

            // 1. Direct DOM check in main window and parent/top documents
            try {
                var docs = [];
                if (typeof document !== 'undefined') docs.push(document);
                if (typeof window !== 'undefined' && window.parent && window.parent.document && docs.indexOf(window.parent.document) === -1) {
                    docs.push(window.parent.document);
                }
                if (typeof window !== 'undefined' && window.top && window.top.document && docs.indexOf(window.top.document) === -1) {
                    docs.push(window.top.document);
                }

                for (var d = 0; d < docs.length; d++) {
                    var doc = docs[d];
                    // Check widget container attributes
                    var sel = '[data-widget-id="' + widgetId + '"], [data-widget-id^="' + widgetId + ':"]';
                    if (doc.querySelector(sel)) {
                        return true;
                    }
                    // Check iframes mounted in workspace
                    var iframes = doc.querySelectorAll('iframe');
                    for (var i = 0; i < iframes.length; i++) {
                        var src = iframes[i].getAttribute('src') || iframes[i].src || '';
                        if (src.indexOf('/' + widgetId + '/') !== -1 || src.indexOf('/' + widgetId + '?') !== -1 || src.indexOf('/widgets/' + widgetId + '/') !== -1) {
                            return true;
                        }
                    }
                }
            } catch(e) {}

            // 2. Direct localStorage 'cnc' state check
            try {
                var raw = localStorage.getItem('cnc');
                if (raw) {
                    var cnc = JSON.parse(raw);
                    var state = cnc.state || cnc;
                    var ws = state.workspace || {};
                    var containers = ws.container || {};
                    var primary = (containers.primary && containers.primary.widgets) || [];
                    var secondary = (containers.secondary && containers.secondary.widgets) || [];
                    var all = primary.concat(secondary);

                    for (var j = 0; j < all.length; j++) {
                        var item = all[j];
                        if (!item) continue;
                        var baseId = item.split(':')[0];
                        if (baseId === widgetId || item === widgetId) {
                            return true;
                        }
                        var wCfg = (state.widgets && (state.widgets[item] || state.widgets[baseId]));
                        if (wCfg && wCfg.url && (wCfg.url.indexOf('/' + widgetId + '/') !== -1 || wCfg.url.indexOf('/' + widgetId + '?') !== -1)) {
                            return true;
                        }
                    }
                }
            } catch(e) {}

            // 3. Store check if Dr is present
            try {
                var store = (window.CNCjsHooks && window.CNCjsHooks.store) || window.Dr || (typeof Dr !== 'undefined' ? Dr : null);
                if (store && store.get) {
                    var p = (store.get("workspace.container.primary.widgets", []) || []).slice();
                    var sec = (store.get("workspace.container.secondary.widgets", []) || []).slice();
                    var allWidgets = p.concat(sec);

                    for (var k = 0; k < allWidgets.length; k++) {
                        var entry = allWidgets[k];
                        var bId = entry.split(":")[0];
                        if (bId === widgetId || entry === widgetId) {
                            return true;
                        }
                        var cfg = store.get('widgets["' + entry + '"]') || store.get('widgets.' + entry);
                        if (cfg && cfg.url && (cfg.url.indexOf('/' + widgetId + '/') !== -1 || cfg.url.indexOf('/' + widgetId + '?') !== -1)) {
                            return true;
                        }
                    }
                }
            } catch(e) {}

            return false;
        },

        // Auto-enable newly installed widget in primary workspace container
        enableWidgetInWorkspace: function(widgetId) {
            if (typeof Dr !== 'undefined' && Dr.get && Dr.set) {
                var p = (Dr.get("workspace.container.primary.widgets") || []).slice();
                if (p.indexOf(widgetId) === -1) {
                    p.push(widgetId);
                    Dr.set("workspace.container.primary.widgets", p);
                    if (typeof s === 'function' && s().publish) {
                        s().publish("updatePrimaryWidgets", p);
                    }
                }
            }
        },

        // Hook called whenever a widget is removed via native dropdown or UI action
        onWidgetRemoved: function(widgetId) {
            console.log('[WidgetHub] onWidgetRemoved invoked for:', widgetId);
            if (typeof Dr !== 'undefined' && Dr.get && Dr.set) {
                var isGhost = function(id) {
                    return id === widgetId ;
                };
                var p = (Dr.get("workspace.container.primary.widgets") || []).filter(function(id) { return !isGhost(id); });
                var sec = (Dr.get("workspace.container.secondary.widgets") || []).filter(function(id) { return !isGhost(id); });
                Dr.set("workspace.container.primary.widgets", p);
                Dr.set("workspace.container.secondary.widgets", sec);
            }
            if (window.CNCjsWidgetBus) {
                window.CNCjsWidgetBus.postMessage({
                    origin: 'loader',
                    action: 'workspaceUpdated',
                    removed: widgetId
                });
            }
        },

        // Remove uninstalled or disabled widget from workspace containers
        removeWidgetFromWorkspace: function(widgetId) {
            try {
                var raw = localStorage.getItem("cnc");
                if (raw) {
                    var cnc = JSON.parse(raw);
                    var state = cnc.state || cnc;
                    if (state.workspace && state.workspace.container) {
                        var p = (state.workspace.container.primary && state.workspace.container.primary.widgets) || [];
                        var sec = (state.workspace.container.secondary && state.workspace.container.secondary.widgets) || [];
                        var filterFn = function(id) {
                            return id !== widgetId && id.split(":")[0] !== widgetId;
                        };
                        if (state.workspace.container.primary) {
                            state.workspace.container.primary.widgets = p.filter(filterFn);
                        }
                        if (state.workspace.container.secondary) {
                            state.workspace.container.secondary.widgets = sec.filter(filterFn);
                        }
                        localStorage.setItem("cnc", JSON.stringify(cnc));
                    }
                }
            } catch(e) {}
            if (typeof Dr !== 'undefined' && Dr.get && Dr.set) {
                var isGhost = function(id) {
                    return id === widgetId ;
                };
                var pStore = (Dr.get("workspace.container.primary.widgets") || []).filter(function(id) { return !isGhost(id); });
                var secStore = (Dr.get("workspace.container.secondary.widgets") || []).filter(function(id) { return !isGhost(id); });
                Dr.set("workspace.container.primary.widgets", pStore);
                Dr.set("workspace.container.secondary.widgets", secStore);
                if (typeof s === 'function' && s().publish) {
                    s().publish("updatePrimaryWidgets", pStore);
                    s().publish("updateSecondaryWidgets", secStore);
                }
            }
            try {
                var el = document.querySelector('[data-widget-id="' + widgetId + '"], [data-widget-id^="' + widgetId + ':"]');
                if (el && el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            } catch(e) {}
            if (window.CNCjsWidgetBus) {
                window.CNCjsWidgetBus.postMessage({
                    origin: 'loader',
                    action: 'workspaceUpdated',
                    removed: widgetId
                });
            }
        },

        // Update widget display title in CNCjs store and DOM
        updateWidgetTitle: function(widgetId, newTitle) {
            if (!widgetId || !newTitle) return;
            try {
                var raw = localStorage.getItem("cnc");
                if (raw) {
                    var cnc = JSON.parse(raw);
                    var state = cnc.state || cnc;
                    if (!state.widgets) state.widgets = {};
                    if (!state.widgets[widgetId]) state.widgets[widgetId] = {};
                    state.widgets[widgetId].title = newTitle;
                    localStorage.setItem("cnc", JSON.stringify(cnc));
                }
            } catch(e) {}
            if (typeof Dr !== 'undefined' && Dr.get && Dr.set) {
                var cfg = Dr.get("widgets." + widgetId) || {};
                cfg.title = newTitle;
                Dr.set("widgets." + widgetId, cfg);
            }
            if (window.CNCjsRegistry && window.CNCjsRegistry[widgetId]) {
                window.CNCjsRegistry[widgetId].name = newTitle;
            }
            if (window.CNCjsWidgetBus) {
                window.CNCjsWidgetBus.postMessage({
                    origin: 'loader',
                    action: 'widgetTitleUpdated',
                    widgetId: widgetId,
                    title: newTitle
                });
            }
        },

        // Factory reset widget config on uninstall
        resetWidgetConfig: function(widgetId) {
            if (!widgetId) return;
            try {
                var raw = localStorage.getItem("cnc");
                if (raw) {
                    var cnc = JSON.parse(raw);
                    var state = cnc.state || cnc;
                    if (state.widgets) {
                        delete state.widgets[widgetId];
                        localStorage.setItem("cnc", JSON.stringify(cnc));
                    }
                }
            } catch(e) {}
            if (typeof Dr !== 'undefined' && Dr.get && Dr.set) {
                Dr.set("widgets." + widgetId, undefined);
            }
            try {
                localStorage.removeItem("cnc.widgets." + widgetId);
            } catch(e) {}
            if (window.CNCjsRegistry && DEFAULT_REGISTRY[widgetId]) {
                window.CNCjsRegistry[widgetId].name = DEFAULT_REGISTRY[widgetId].name;
            }
            if (window.CNCjsWidgetBus) {
                window.CNCjsWidgetBus.postMessage({
                    origin: 'loader',
                    action: 'widgetConfigReset',
                    widgetId: widgetId
                });
            }
        },

        // Shared Native Socket & Controller Bridge (1 Socket for Entire Workspace)
        getSocket: function() {
            if (window.CNCjsHooks && window.CNCjsHooks.socket) {
                return window.CNCjsHooks.socket;
            }
            if (window.__cnc_socket) {
                return window.__cnc_socket;
            }
            if (window.__cnc_controller && window.__cnc_controller.socket) {
                return window.__cnc_controller.socket;
            }
            return null;
        },

        getController: function() {
            return window.__cnc_controller || (window.CNCjsHooks && window.CNCjsHooks.controller) || null;
        },

        // Universal event subscriber for custom widgets
        on: function(event, callback) {
            var ctrl = this.getController();
            if (ctrl && ctrl.addListener) {
                ctrl.addListener(event, callback);
                return function() {
                    ctrl.removeListener(event, callback);
                };
            }
            var sock = this.getSocket();
            if (sock && sock.on) {
                sock.on(event, callback);
                return function() {
                    if (sock.off) sock.off(event, callback);
                };
            }
            return function() {};
        },

        // Universal command dispatcher for custom widgets
        command: function() {
            var ctrl = this.getController();
            if (ctrl && ctrl.command) {
                ctrl.command.apply(ctrl, arguments);
            } else {
                var sock = this.getSocket();
                if (sock && sock.emit) {
                    var args = Array.prototype.slice.call(arguments);
                    var port = (ctrl && ctrl.port) || (window.Dr && window.Dr.get && window.Dr.get('port')) || '';
                    sock.emit.apply(sock, ['command', port].concat(args));
                }
            }
        },

        writeln: function(data) {
            var ctrl = this.getController();
            if (ctrl && ctrl.writeln) {
                ctrl.writeln(data);
            } else {
                var sock = this.getSocket();
                if (sock && sock.emit) {
                    var port = (ctrl && ctrl.port) || '';
                    sock.emit('writeln', port, data);
                }
            }
        }
    };

    // Ensure all active catalog widgets are registered in CNCjs store & localStorage
    function registerWidgetsInStore() {
        var store = (typeof window !== 'undefined' && window.Dr) || (window.CNCjsHooks && window.CNCjsHooks.store) || (typeof Dr !== 'undefined' ? Dr : null);
        var registry = window.CNCjsRegistry || DEFAULT_REGISTRY;
        var activeList = window.CNCjsActiveWidgets || Object.keys(registry);

        // 1. Ensure in localStorage state.widgets so CNCjs cold boot picks them up
        try {
            var raw = localStorage.getItem('cnc');
            var cnc = raw ? JSON.parse(raw) : {};
            if (!cnc.state) cnc.state = {};
            if (!cnc.state.widgets) cnc.state.widgets = {};
            var lsChanged = false;

            activeList.forEach(function(id) {
                var meta = registry[id];
                if (!meta) return;
                if (!cnc.state.widgets[id]) {
                    cnc.state.widgets[id] = {
                        title: meta.name || id,
                        url: meta.url || '',
                        disabled: false,
                        minimized: false
                    };
                    lsChanged = true;
                } else if (meta.url && cnc.state.widgets[id].url !== meta.url) {
                    // Normalize legacy URLs to /widgets/*
                    cnc.state.widgets[id].url = meta.url;
                    lsChanged = true;
                }
            });

            if (lsChanged) {
                localStorage.setItem('cnc', JSON.stringify(cnc));
                console.log('[WidgetHub] Registered missing widgets in localStorage.cnc.state.widgets');
            }
        } catch(e) {}

        // 2. Ensure in Dr store in memory if available so Manage Widgets modal OK immediately succeeds
        if (store && store.get && store.set) {
            activeList.forEach(function(id) {
                var meta = registry[id];
                if (!meta) return;
                var curr = store.get("widgets." + id);
                if (!curr) {
                    store.set("widgets." + id, {
                        title: meta.name || id,
                        url: meta.url || '',
                        disabled: false,
                        minimized: false
                    });
                    console.log('[WidgetHub] Registered widget in Dr store:', id);
                } else if (meta.url && curr.url !== meta.url) {
                    curr.url = meta.url;
                    store.set("widgets." + id, curr);
                    console.log('[WidgetHub] Updated widget URL in Dr store to /widgets/*:', id);
                }
            });
        }
    }

    // Intercept Dr.set to notify Widget Hub whenever workspace containers are modified
    function setupStoreInterceptors() {
        if (typeof Dr !== 'undefined' && Dr.set && !Dr.__hub_intercepted) {
            Dr.__hub_intercepted = true;
            var origSet = Dr.set;
            Dr.set = function(path, value) {
                var res = origSet.apply(this, arguments);
                if (typeof path === 'string' && path.indexOf('workspace.container') !== -1) {
                    if (window.CNCjsWidgetBus) {
                        window.CNCjsWidgetBus.postMessage({
                            origin: 'workspace',
                            action: 'workspaceUpdated'
                        });
                    }
                }
                return res;
            };
        }
    }

    // Automatic cleanup of unconfigured orphan widgets (disabled so users can configure custom widgets)
    function scrubGhostWidgets() {
        // Preserves custom widgets added by user in CNCjs settings
    }
    window.addEventListener('load', function() {
        setupStoreInterceptors();
        registerWidgetsInStore();
        setTimeout(function() {
            setupStoreInterceptors();
            registerWidgetsInStore();
            scrubGhostWidgets();
        }, 500);
        setTimeout(function() {
            registerWidgetsInStore();
            scrubGhostWidgets();
        }, 2000);
    });

    // PubSub Bridge: notify Widget Hub whenever workspace containers change & neutralize un-scoped resize
    function initPubsubBridge() {
        if (typeof s === 'function' && s().subscribe) {
            if (!s().__resize_guarded && s().publish) {
                s().__resize_guarded = true;
                var _origPub = s().publish.bind(s());
                s().publish = function(topic, msg) {
                    if (topic === 'message:resize') {
                        // Suppress CNCjs core's un-scoped broadcast that pollutes sibling widget heights!
                        return false;
                    }
                    return _origPub(topic, msg);
                };
            }
            s().subscribe("updatePrimaryWidgets", function() {
                if (window.CNCjsWidgetBus) {
                    window.CNCjsWidgetBus.postMessage({
                        origin: 'workspace',
                        action: 'workspaceUpdated'
                    });
                }
            });
            s().subscribe("updateSecondaryWidgets", function() {
                if (window.CNCjsWidgetBus) {
                    window.CNCjsWidgetBus.postMessage({
                        origin: 'workspace',
                        action: 'workspaceUpdated'
                    });
                }
            });
        } else {
            setTimeout(initPubsubBridge, 500);
        }
    }
    
    // Intercept localStorage.setItem to notify Widget Hub whenever workspace is updated
    try {
        var _origSetItem = localStorage.setItem.bind(localStorage);
        localStorage.setItem = function(key, val) {
            _origSetItem(key, val);
            if (key === 'cnc' && window.CNCjsWidgetBus) {
                window.CNCjsWidgetBus.postMessage({
                    origin: 'localStorage',
                    action: 'workspaceUpdated'
                });
            }
        };
    } catch(e) {}

    // Storage event listener for cross-window / tab changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'cnc' && window.CNCjsWidgetBus) {
            window.CNCjsWidgetBus.postMessage({
                origin: 'storageEvent',
                action: 'workspaceUpdated'
            });
        }
    });

    // Targeted, throttled DOM observer: watches only custom widget additions and removals
    var _scanRaf = null;
    function scheduleScanAndSize() {
        if (_scanRaf) return;
        _scanRaf = requestAnimationFrame(function() {
            _scanRaf = null;
            scanAndSizeIframes();
        });
    }

    if (typeof MutationObserver !== 'undefined') {
        var _lastActiveSignature = '';
        var _domDebounce = null;
        var observer = new MutationObserver(function(mutations) {
            var iframeOrCardChanged = false;
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                if (m.type === 'childList') {
                    for (var a = 0; a < m.addedNodes.length; a++) {
                        var node = m.addedNodes[a];
                        if (node.nodeType === 1 && (node.tagName === 'IFRAME' || (node.querySelector && node.querySelector('iframe, [role="region"], [data-widget-id]')))) {
                            iframeOrCardChanged = true;
                            break;
                        }
                    }
                    if (iframeOrCardChanged) break;
                    for (var r = 0; r < m.removedNodes.length; r++) {
                        var rNode = m.removedNodes[r];
                        if (rNode.nodeType === 1 && (rNode.tagName === 'IFRAME' || (rNode.querySelector && rNode.querySelector('iframe, [role="region"], [data-widget-id]')))) {
                            iframeOrCardChanged = true;
                            break;
                        }
                    }
                    if (iframeOrCardChanged) break;
                }
            }

            if (iframeOrCardChanged) {
                scheduleScanAndSize();

                if (_domDebounce) clearTimeout(_domDebounce);
                _domDebounce = setTimeout(function() {
                    var currentIframes = Array.from(document.querySelectorAll('iframe')).map(function(f) {
                        return (f.getAttribute('src') || f.src || '').split('?')[0];
                    }).sort().join('|');

                    if (currentIframes !== _lastActiveSignature) {
                        _lastActiveSignature = currentIframes;
                        if (window.CNCjsWidgetBus) {
                            window.CNCjsWidgetBus.postMessage({
                                origin: 'domMutation',
                                action: 'workspaceUpdated'
                            });
                        }
                    }
                }, 1000);
            }
        });

        function attachObserver() {
            var target = document.body;
            if (target) {
                observer.observe(target, { childList: true, subtree: true });
            } else {
                window.addEventListener('DOMContentLoaded', attachObserver);
            }
        }
        attachObserver();
    }


    // 7. Isolated Custom Widget Iframe Auto-Resizer & Cross-Pollution Guard
    // Blocks CNCjs global PubSub broadcast of 'message:resize' which corrupts sibling widget heights
    window.addEventListener('message', function(event) {
        var data = event.data || {};
        var action = data.action;
        var targetHeight = null;

        if (action && typeof action === 'object' && action.type === 'resize') {
            var p = action.payload || {};
            targetHeight = Number(p.scrollHeight || p.height || 0);
        } else if (action === 'resizeWidgetHub' || (data.action === 'resize' && data.height)) {
            targetHeight = Number(data.height || (action && action.height) || 0);
        }

        if (targetHeight && targetHeight > 0) {
            var iframes = document.querySelectorAll('iframe');
            for (var i = 0; i < iframes.length; i++) {
                if (iframes[i].contentWindow === event.source) {
                    iframes[i].style.height = targetHeight + 'px';
                    iframes[i].__self_sized = true;
                    break;
                }
            }
            // CRITICAL: Stop immediate propagation in capture phase so CNCjs core's
            // global s().publish("message:resize") does NOT broadcast this widget's height
            // to all other custom widgets!
            event.stopImmediatePropagation();
        }
    }, true);

    function autoSizeIframe(iframe) {
        try {
            if (!iframe) return;
            // If the child widget already sized itself via postMessage, do not override or fight it!
            if (iframe.__self_sized) return;
            if (!iframe.contentDocument) return;
            var doc = iframe.contentDocument;
            var body = doc.body;
            if (!body) return;

            // Measure true content height needed by iframe body
            var scrollH = Math.max(body.scrollHeight || 0, doc.documentElement.scrollHeight || 0, body.offsetHeight || 0);

            if (scrollH >= 40 && scrollH <= 3000) {
                var targetPx = scrollH + 'px';
                if (iframe.style.height !== targetPx) {
                    iframe.style.height = targetPx;
                }
            }
        } catch(e) {}
    }

    function attachIframeAutoResizer(iframe) {
        if (!iframe || iframe.__auto_resize_attached) return;
        iframe.__auto_resize_attached = true;

        var measure = function() {
            autoSizeIframe(iframe);
        };

        iframe.addEventListener('load', function() {
            measure();
            try {
                var doc = iframe.contentDocument;
                if (doc && doc.body) {
                    if (typeof ResizeObserver !== 'undefined') {
                        var ro = new ResizeObserver(function() {
                            measure();
                        });
                        ro.observe(doc.body);
                        var mainEl = doc.querySelector('.probe-panel, .touch-probe-panel, .touch-probe-panel, .pot-card, .system-manager-card, .surfacing-container') || doc.body.firstElementChild;
                        if (mainEl && mainEl !== doc.body) {
                            ro.observe(mainEl);
                        }
                    }
                }
            } catch(e) {}
            setTimeout(measure, 50);
            setTimeout(measure, 150);
            setTimeout(measure, 400);
            setTimeout(measure, 1000);
        });

        if (iframe.contentDocument && (iframe.contentDocument.readyState === 'complete' || iframe.contentDocument.readyState === 'interactive')) {
            measure();
            setTimeout(measure, 100);
        }
    }

        function injectHostHeaderStyles() {
        if (typeof document === 'undefined') return;
        if (document.getElementById('cncjs-widget-header-styles')) return;
        var style = document.createElement('style');
        style.id = 'cncjs-widget-header-styles';
        style.textContent = [
            '/* CNCjs Widget Title Bar & Header Controls Governance */',
            '[data-widget-id].cnc-header-hidden [class*="widget-header"], [data-widget-id][data-hide-header="true"] [class*="widget-header"] { display: none !important; }',
            '.cnc-no-fork [class*="menu-item"]:has(.fa-code-fork), .cnc-no-fork div[role="presentation"]:has(.fa-code-fork) { display: none !important; }',
            '[data-widget-id].cnc-no-fullscreen [class*="menu-item"]:has(.fa-expand), [data-widget-id].cnc-no-fullscreen div[role="presentation"]:has(.fa-expand) { display: none !important; }',
            '[data-widget-id].cnc-no-settings a:has(.fa-cog), [data-widget-id].cnc-no-settings button:has(.fa-cog) { display: none !important; }',
            '[data-widget-id].cnc-no-refresh a:has(.fa-refresh), [data-widget-id].cnc-no-refresh button:has(.fa-refresh) { display: none !important; }',
            '[data-widget-id].cnc-no-collapse a:has(.fa-chevron-up), [data-widget-id].cnc-no-collapse a:has(.fa-chevron-down), [data-widget-id].cnc-no-collapse button:has(.fa-chevron-up), [data-widget-id].cnc-no-collapse button:has(.fa-chevron-down) { display: none !important; }',
            '[data-widget-id].cnc-no-dropdown [class*="dropdown-toggle"], [data-widget-id].cnc-no-dropdown [class*="dropdown-menu"] { display: none !important; }'
        ].join('\n');
        if (document.head) {
            document.head.appendChild(style);
        } else {
            window.addEventListener('DOMContentLoaded', function() {
                if (document.head) document.head.appendChild(style);
            });
        }
    }

    function decorateWidgetCard(iframe) {
        try {
            var card = iframe.closest('[data-widget-id]') || iframe.closest('[role="region"]') || iframe.closest('[class*="widget--"]');
            if (!card) return;
            var widgetId = card.getAttribute('data-widget-id');
            var src = iframe.getAttribute('src') || iframe.src || '';
            if (!widgetId) {
                if (window.CNCjsRegistry) {
                    for (var k in window.CNCjsRegistry) {
                        var candidate = window.CNCjsRegistry[k];
                        if ((candidate.url && src.indexOf(candidate.url) !== -1) || src.indexOf('/' + k + '/') !== -1 || src.indexOf('/' + k + '?') !== -1) {
                            widgetId = k;
                            break;
                        }
                    }
                }
                if (!widgetId) {
                    var m = src.match(/\/widgets\/([^\/?#]+)/);
                    if (m) widgetId = m[1];
                }
                if (widgetId && card.getAttribute('data-widget-id') !== widgetId) {
                    card.setAttribute('data-widget-id', widgetId);
                }
            }
            if (!widgetId) return;

            function toggleCardClass(cls, shouldHave) {
                var has = card.classList.contains(cls);
                if (shouldHave && !has) {
                    card.classList.add(cls);
                } else if (!shouldHave && has) {
                    card.classList.remove(cls);
                }
            }

            var cfg = (window.CNCjsHooks && window.CNCjsHooks.getHeaderConfig) ? window.CNCjsHooks.getHeaderConfig(widgetId) : null;
            if (cfg) {
                toggleCardClass('cnc-header-hidden', !!cfg.hideHeader);
                if (cfg.hideHeader) {
                    if (card.getAttribute('data-hide-header') !== 'true') card.setAttribute('data-hide-header', 'true');
                } else {
                    if (card.hasAttribute('data-hide-header')) card.removeAttribute('data-hide-header');
                }
                toggleCardClass('cnc-no-fork', cfg.showFork === false);
                toggleCardClass('cnc-no-settings', cfg.showSettings === false);
                toggleCardClass('cnc-no-refresh', cfg.showRefresh === false);
                toggleCardClass('cnc-no-collapse', cfg.showCollapse === false);
                toggleCardClass('cnc-no-dropdown', cfg.showDropdown === false);
                toggleCardClass('cnc-no-fullscreen', cfg.showFullscreen === false);
            }
        } catch(e) {}
    }

    function scanAndSizeIframes() {
        injectHostHeaderStyles();
        var iframes = document.querySelectorAll('iframe');
        for (var i = 0; i < iframes.length; i++) {
            var src = iframes[i].getAttribute('src') || iframes[i].src || '';
            if (src.indexOf('/widgets/') !== -1 || src.indexOf('/touch-probe-status/') !== -1 || src.indexOf('/system-manager/') !== -1 || src.indexOf('/widget-hub/') !== -1 || src.indexOf('/potentiometer/') !== -1 || src.indexOf('/surfacing/') !== -1) {
                var curTheme = (document.documentElement && document.documentElement.getAttribute('data-theme')) || localStorage.getItem('cncjs_hub_theme') || 'dark';
                try {
                    if (iframes[i].contentDocument && iframes[i].contentDocument.documentElement) {
                        if (iframes[i].contentDocument.documentElement.getAttribute('data-theme') !== curTheme) {
                            iframes[i].contentDocument.documentElement.setAttribute('data-theme', curTheme);
                        }
                    }
                } catch(e) {}
                decorateWidgetCard(iframes[i]);
                attachIframeAutoResizer(iframes[i]);
                autoSizeIframe(iframes[i]);
            }
        }
    }

    window.addEventListener('resize', scanAndSizeIframes);
    [50, 150, 300, 600, 1200, 2500, 5000].forEach(function(delay) {
        setTimeout(scanAndSizeIframes, delay);
    });


    // Listen for real-time Hub Config & Theme changes
    if (window.CNCjsWidgetBus) {
        window.CNCjsWidgetBus.addEventListener('message', function(evt) {
            var data = evt.data || {};
            if (data.action === 'hubConfigUpdated' && data.config) {
                applyHubConfig(data.config);
            } else if (data.action === 'themeChanged' && data.theme) {
                applyTheme(data.theme);
            }
        });
    }

    loadHubConfig();
    initPubsubBridge();
})();
