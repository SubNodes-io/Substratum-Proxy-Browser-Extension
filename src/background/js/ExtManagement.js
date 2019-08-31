require("babel-polyfill");
const browser = chrome || browser;

import Defaults from './Defaults.js';

class ExtManagement {
    constructor() {
        this._settings = null;
        this.newSettingsCallback = null;
        this.financialsCallback = null;

        this.isChrome = typeof InstallTrigger === 'undefined'; // InstallTrigger is defined only on Firefox

        this._proxyStatus = false;
        this._webSocketStatus  = false;
        this._isIncognitoAllowed = false;
        this._isProxyControllable = true; // will assume it will be

        this._tempFinancialLast = null;
        this._financialsArray = [];

        this.FINANCIAL_FETCH_INTERVAL = 10000; // 10 seconds
        this._financialsFetchInterval = null; // holds interval that gets financials when proxy is on

        this.loadSettings();
        this.checkIncognitoPermission();
    }

    isPopupOpen() {
        const views = browser.extension.getViews({ type: "popup" });
        return views.length > 0;
    }

    startFinancialsInterval(subWebSocket) {
        // clear fin. interval if already started
        if(this._financialsFetchInterval !== null) {
            this.clearFinancialsInterval();
        }

        // set fin. fetch interval
        this._financialsFetchInterval = setInterval(function() {
            subWebSocket.send(subWebSocket.GET_FINACIALS); // send subnode fin. request
        }.bind(this), this.FINANCIAL_FETCH_INTERVAL);
    }

    clearFinancialsInterval() {
        // clear fin. interval
        if(this._financialsFetchInterval !== null) {
            clearInterval(this._financialsFetchInterval);
        }
    }

    set financialsArray(financials) {
        this._financialsArray = financials;
        // financials change callback
        if(this.financialsCallback !== null) {
            this.financialsCallback(this._financialsArray);
        }
    }

    get financialsArray() {
        return this._financialsArray;
    }

    onFinancialsChange(callback) {
        this.financialsCallback = callback;
    }

    statusUI(mainMsg, errorMsg = null) {
        const statusPayload = {
            websocket: this._webSocketStatus,
            proxy: this._proxyStatus,

            mainMessage: mainMsg,
            errorMessage: errorMsg
        }

        if(errorMsg !== null) {
            browser.browserAction.setBadgeText({text: '!'});
        } else if(this._proxyStatus) {
            browser.browserAction.setBadgeText({text: 'on'});
        } else {
            browser.browserAction.setBadgeText({text: ''});
        }
        // try to send status data to popup
        try {
            // check if popup is open before sending
            if(this.isPopupOpen()) {
                browser.runtime.sendMessage({action: 'status', data: statusPayload});
            }
        } catch(e) {
            console.log(`Can't send 'status' to popup: ${e}`);
        }
    }

    statusProcess() {
        // get ready for lots of if statements ¯\_(ツ)_/¯
        let mainMsg = '';
        let errorMsg;

        if(!this._isProxyControllable) {
            // this extension can't control proxy settings
            errorMsg = 'Another extension controls proxy'; // probably | firefox doesn't inform extension of incognito exception with test
        }

        if(!this.isChrome && !this._isIncognitoAllowed) {
            // Firefox user needs to manually allow this extension private browsing permission
            errorMsg = 'Needs incognito permission <a href="https://techdows.com/2019/03/firefox-changes-to-extensions-in-private-browsing.html">fix</a>';
        }

        if(!this._proxyStatus && this._webSocketStatus) {
            // Proxy off, SubstratumNode is detected
            mainMsg = 'SubstratumNode is detected';
        }
        
        if (!this._proxyStatus && !this._webSocketStatus) {
            // Proxy off, SubstratumNode is NOT detected
            mainMsg = 'SubstratumNode is not detected';
        }

        if(this._proxyStatus && !this._webSocketStatus) {
            // Proxy on, SubstratumNode likely down
            mainMsg = 'Proxy still configured'
            errorMsg = 'SubstratumNode may be down?';
        }

        // BEST CASE
        if(this._proxyStatus && this._webSocketStatus) {
            // Proxy on, SubstratumNode is detected 
            mainMsg = 'Proxy configured!';
        }

        this.statusUI(mainMsg, errorMsg);
    }

    set isProxyControllable(status) {
        this._isProxyControllable = status;
        this.statusProcess();
    }

    set proxyStatus(status) {
        this._proxyStatus = status;
        this.checkIncognitoPermission();
        this.statusProcess();
    }

    get proxyStatus() {
        return this._proxyStatus;
    }

    set webSocketStatus(status) {
        this._webSocketStatus = status;
        this.statusProcess();
    }

    set isIncognitoAllowed(isAllowed) {
        this._isIncognitoAllowed = isAllowed;
    }

    get settings() {
        return this._settings;
    }

    set settings(settings) {
        this._settings = settings;

        if(this.newSettingsCallback !== null) {
            this.newSettingsCallback(this.settings);
        }
    }

    onNewSettings(callback) {
        this.newSettingsCallback = callback;
    }

    checkIncognitoPermission() {
        // check incognito/private browsing permission
        browser.extension.isAllowedIncognitoAccess(function(isAllowed) {
            this.isIncognitoAllowed = isAllowed;
        }.bind(this));
    }

    loadSettings() {
        // try getting local stored settings
        browser.storage.local.get('settings', function(data) {
            if(data.hasOwnProperty('settings')) {
                // settings in local storage
                this.settings = data['settings'];
            } else {
                // settings not in local storage
                // save default settings to local storage
                this.setSettings(Defaults.getDefaultSettings());
    
                this.settings = Defaults.getDefaultSettings();
            }
        }.bind(this));
    }

    clearFinancials() {
        browser.storage.local.set({financials: []}, function() {
            this._tempFinancialLast = null;
            this.financialsArray = [];
        }.bind(this));
    }

    appendFinancials(financials) {
        const timeMsNow = new Date().getTime(); // time now (milliseconds)

        // continue appending if time since last fin. snapshot is at least this.FINANCIAL_FETCH_INTERVAL elapsed (ms)
        if(this._tempFinancialLast !== null && (timeMsNow - this._tempFinancialLast.time) < this.FINANCIAL_FETCH_INTERVAL) { 
            return; // exit appending
        }

        // COMMENT OUT IN PRODUCTION
        /*financials = this._tempFinancialLast || {pendingCredit: 439759587, pendingDebt: 1160918601};
        financials.pendingCredit *= Math.random() > 0.7 ? (1 + Math.random() * 0.2) : 1;
        financials.pendingDebt *= Math.random() > 0.25 ? (1 + Math.random() * 0.4) : 1;*/

        this._tempFinancialLast = financials;
        this._tempFinancialLast['time'] = timeMsNow; // add time to fin. object

        try {
             // add financials to local storage financials array
             browser.storage.local.get({financials: []}, function(result) {
                const financials = result.financials;

                // prepend fin. obj (THIS FUNCTION SHOULD REALLY BE CALLED PREpendFinancials)
                financials.unshift(this._tempFinancialLast);

                // update fin. array and remove out of scope (time) fin. snapshots (now you know why prepend was inportant)
                this.financialsArray = financials.slice(0, 3600/(this.FINANCIAL_FETCH_INTERVAL/1000)); // x per hour (3600s/hr) worth of this.FINANCIAL_FETCH_INTERVAL ms->second snapshots
                
                browser.storage.local.set({financials: financials}, function() {}); // save updated financials
             }.bind(this));
        } catch(e) {
            console.error(`Can't append financials in storage: ${e}`);
        }
    }

    setSettings(settings) {
        try {
            // save settings to local storage
            browser.storage.local.set(
                {settings: settings}, 
                function() {
                    this.settings = settings; // local copy
                }.bind(this)
            );
        } catch(e) {
            console.error(`Unable write to local storage: ${e}`);
        }
    }
}

export { ExtManagement as default }