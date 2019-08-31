require("babel-polyfill");
const browser = chrome || browser;

import ExtManagement from './js/ExtManagement.js';
import ToggleProxy from './js/ToggleProxy.js';
import SubWebSocket from './js/SubWebSocket.js';

const extManagement = new ExtManagement();
const toggleProxy = new ToggleProxy();
const subWebSocket = new SubWebSocket();

// proxy controllable insight listener
toggleProxy.onControlInsight(function(data) {
    extManagement.isProxyControllable = data.allowed;
});

// websocket status listener
subWebSocket.onStatus(function(status) {
    extManagement.webSocketStatus = status;
});

// proxy setting success/error listener
toggleProxy.onStatus(function(status) {
    extManagement.proxyStatus = status;

    // when proxy is on, start fetching fianncials at intervals
    if(status) {
        extManagement.startFinancialsInterval(subWebSocket);
    } else {
        // clear intervals when proxy off
        extManagement.clearFinancialsInterval();
    }

    extManagement.clearFinancials(); // clear financials for fresh session
});

// Settings listener
extManagement.onNewSettings(function() {
    toggleProxy.setProxySettings(extManagement.settings.proxy);
    subWebSocket.setWebSocketSettings(extManagement.settings.extension.websocket);

    // inform UI of saved settings
    try {
        // check if popup is open before sending
        if(extManagement.isPopupOpen()) {
            browser.runtime.sendMessage({action: 'settingsSaved', data: true});
        }
    } catch(e) {
        console.log(`Can't send 'settingsSaved' to popup: ${e}`);
    }

    subWebSocket.connect(); // won't connect if websocket is connected already
});

// financials array listener
extManagement.onFinancialsChange(function(financialsArray) {
    try {
        // check if popup is open before sending
        if(extManagement.isPopupOpen()) {
            browser.runtime.sendMessage({action: 'financialsArray', data: financialsArray});
        }
    } catch(e) {
        console.log(`Can't send 'financialsArray' to popup: ${e}`);
    }
});

// websocket message listener
subWebSocket.onMessage(function(msg) {
    const dataJSON = JSON.parse(msg.data);
    
    const responseType = Object.keys(dataJSON)[0];

    switch(responseType) {
        case 'FinancialStatisticsResponse':
            try {
                // update financialsArray if proxy is ON
                if(extManagement.proxyStatus) {
                    extManagement.appendFinancials(dataJSON[responseType]);
                    // check if popup is open before sending
                    if(extManagement.isPopupOpen()) {
                        browser.runtime.sendMessage({action: 'financialsArray', data: extManagement.financialsArray}); // send popup financialsArray
                    }
                }

                // check if popup is open before sending
                if(extManagement.isPopupOpen()) {
                    browser.runtime.sendMessage({action: 'financials', data: dataJSON[responseType]});
                }
            } catch(e) {
                console.log(`Can't send financials to popup: ${e}`);
            }
            break;
        
        default:
            console.log('Unknown subnode response');
    }
});

// test proxy controllable
toggleProxy.testSettingControl();

// messages from popup window
browser.runtime.onMessage.addListener((msg, sender) => {
    switch (msg.action) {
        case 'getSettings':
            try {
                browser.runtime.sendMessage({action: 'settings', data: extManagement.settings});
            } catch(e) {
                console.log(`Can't send 'settings' to popup: ${e}`);
            }
            break;

        case 'saveSettings':
            extManagement.setSettings(msg.data);
            break;
        
        case 'getFinancials':
            if(subWebSocket.ws.readyState === WebSocket.OPEN) {
                // send request to SubstratumNode websocket for financials
                subWebSocket.send(subWebSocket.GET_FINACIALS);
            }
            break;

        case 'toggleProxySettings':
            toggleProxy.toggle();
            break;

        case 'retryWebSocket':
            subWebSocket.connect();
            break;

        case 'status':
            extManagement.statusProcess();
            subWebSocket.connect(); // will reconnect if not connected 
            break;

        default:
            console.error('action unknown');
            break;
    }
});