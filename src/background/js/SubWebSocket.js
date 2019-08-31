require("babel-polyfill");
const browser = chrome || browser;

class SubWebSocket {
    constructor() {
        this.webSocketSettings = null;
        this.ws = null; // websocket instance: PUBLIC
        this._status = false;

        this.wsChangeCallback = null;
        this.onMessageCallback = null;

        // available SubstratumNode websocket messages
        this.GET_FINACIALS = '"GetFinancialStatisticsMessage"';
    }

    onMessage(callback) {
        this.onMessageCallback = callback;
    }

    get isWSConnected() {
        return this._status;
    }

    set isWSConnected(val) {
        this._status = val;

        if(this.wsChangeCallback !== null) {
            // websocket change event for subscriber
            this.wsChangeCallback(val);
        }
    }

    onStatus(callback) {
        this.wsChangeCallback = callback;
    }

    connect() {
        if(this.ws !== null && this.ws.readyState === WebSocket.OPEN) {
            // connection already established
            return;
        }

        try {
            const wsUrl = `${this.webSocketSettings.protocol}://${this.webSocketSettings.host}:${this.webSocketSettings.port}`;

            this.ws = new WebSocket(wsUrl, this.webSocketSettings.subProtocol);

            // websocket event listeners
            this.ws.onerror = this.wsError.bind(this);
            this.ws.onopen = this.wsOpen.bind(this);
            this.ws.onmessage = this.wsMessage.bind(this);
            this.ws.onclose = this.wsClose.bind(this);

        } catch(e) {
            console.error(`Error connecting to ${this.url}: ${e}`);
        }
    }

    setWebSocketSettings(webSocketSettings) {
        this.webSocketSettings = webSocketSettings;
    }

    send(message) {
        if(this.ws.readyState !== WebSocket.OPEN) {
            // not connected
            return;
        }
        try {
            this.ws.send(message);
        } catch (e) {
            console.error(`Error sending message to websocket: ${e}`);
        }
    }

    wsOpen(e) {
        console.log(`WebSocket CONNECTED`);
        this.isWSConnected = true;
    }

    wsClose(e) {
        console.log(`WebSocket CLOSED`);
        this.isWSConnected = false;
    }

    wsError(e) {
        console.error(`WebSocket Error: ${e}`);
        this.isWSConnected = false;
    }

    wsMessage(msg) {
        // messge callback
        if(this.onMessageCallback !== null) {
            this.onMessageCallback(msg);
        }
    }
}

export { SubWebSocket as default }