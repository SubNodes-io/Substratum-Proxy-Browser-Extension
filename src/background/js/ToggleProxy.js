require("babel-polyfill");
const browser = chrome || browser;

class ToggleProxy {
    constructor() {
        this.proxySettings = null;
        this.isChrome = typeof InstallTrigger === 'undefined'; // InstallTrigger is defined only on Firefox
        this._isProxyOn = false;
        this._isControllableObj = null;

        this.proxyChangeCallback = null;
        this.controlChangeCallback = null;
    }

    get isProxyOn() {
        return this._isProxyOn;
    }

    set isProxyOn(val) {
        this._isProxyOn = val;

        if(this.proxyChangeCallback !== null) {
            // proxy change event subscribed to
            this.proxyChangeCallback(this.isProxyOn);
        }
    }

    set isControllableObj(obj) {
        this._isControllableObj = obj;

        // if extension currently controls proxy
        if(obj.levelOfControl === 'controlled_by_this_extension') {
            // update extManagement of current control
            this.isProxyOn = true;
        }

        // controllable insight change event subscribed to
        if(this.controlChangeCallback !== null) {
            // control insight updated
            this.controlChangeCallback(obj);
        }
    }

    onControlInsight(callback) {
        this.controlChangeCallback = callback;
    }

    onStatus(callback){
        this.proxyChangeCallback = callback;
    }

    setProxySettings(proxySettings) {
        console.log('proxy settings changed');
        this.proxySettings = proxySettings;
    }

    generateProxyConfig() {
        let proxyConfig; // Either Chrome or Firefox structured

        // Determine current browser for specific settings structure
        if(this.isChrome) {
            // Chrome
            proxyConfig = {
                mode: "fixed_servers",
                rules: {
                    bypassList: ["<local>"]
                },
            };

            if(this.proxySettings.http.active) {
                proxyConfig.rules['proxyForHttp'] = {
                    host: this.proxySettings.http.host,
                    port: parseInt(this.proxySettings.http.port)
                };
            }

            if(this.proxySettings.ssl.active) {
                proxyConfig.rules['proxyForHttps'] = {
                    host: this.proxySettings.ssl.host,
                    port: parseInt(this.proxySettings.ssl.port)
                }
            }
        } else {
            // assume FireFox
            proxyConfig = {
                proxyType: "manual"
            }
    
            if(this.proxySettings.http.active) {
                // client settings indicate HTTP proxy
                proxyConfig['http'] = `${this.proxySettings.http.protocol}://${this.proxySettings.http.host}:${this.proxySettings.http.port}`;
            }
    
            if(this.proxySettings.ssl.active) {
                // client settings indicate SSL proxy
                proxyConfig['ssl'] = `${this.proxySettings.ssl.protocol}://${this.proxySettings.ssl.host}:${this.proxySettings.ssl.port}`;
            }
        }

        return proxyConfig;
    }

    async toggle() {

        if(this.isProxyOn) {
            // Proxy is on. Clear settings and return
            browser.proxy.settings.clear(
                {}, 
                function() {
                    this.isProxyOn = false;
                }.bind(this)
            );

            return;
        }

        // Change browser proxy settings
        const proxyConfig = this.generateProxyConfig();

        try {
            if(this.isChrome) {
                // Chrome
                // use callback | no private browsing exception like Firefox
                browser.proxy.settings.set(
                    {value: proxyConfig, scope: 'regular'}, // 'scope' property is Chrome required only
                    function() {
                        this.isProxyOn = true;
                    }.bind(this)
                );
            } else {
                // Firefox
                await browser.proxy.settings.set({value: proxyConfig});

                this.isProxyOn = true;
            }
        } catch (e) {
            // Error
            console.error(`Could not change proxy settings: ${e}`);
            this.isProxyOn = false;
            // test control settings again
            this.testSettingControl();
        }
    }

    parseProxyControl(result) {
        switch (result.levelOfControl){
            case 'not_controllable':
                return {allowed: false, levelOfControl: result.levelOfControl, reason: 'Cannot control proxy settings'}
            
            case 'controlled_by_other_extensions':
                return {allowed: false, levelOfControl: result.levelOfControl, reason: 'Proxy controlled by another extension'}

            case 'controllable_by_this_extension':
                return {allowed: true, levelOfControl: result.levelOfControl, reason: 'Extension can change proxy'}
            
            case 'controlled_by_this_extension':
                return {allowed: true, levelOfControl: result.levelOfControl, reason: 'Proxy already controlled by this extension'}

            default:
                // just assume it is allowed
                return {allowed: true, levelOfControl: 'Unknown', reason: 'Unknown control access (Error)'}
        }
    }

    testSettingControl() {
        try {
            browser.proxy.settings.get({}, function(result) {
                this.isControllableObj = this.parseProxyControl(result);
            }.bind(this));
        } catch (e) {
            console.error(`Unable to check proxy control: ${e}`);
            this.isControllableObj = {allowed: false, levelOfControl: 'failed check', reason: 'failed check'}
        }
        
    }
}

export { ToggleProxy as default }