<template>
    <div>
        <div v-if="settings !== null">
            <!-- WebSocket - SubstratumNode -->
            <h6>WebSocket</h6>
            <div class="row">
                <div class="input-field col s8">
                    <input v-model="settings.extension.websocket.host" id="first_name" type="text">
                    <label class="active" for="first_name">Host</label>
                </div>
                <div class="input-field col s4">
                    <input v-model.number="settings.extension.websocket.port" id="ws_port" type="number" class="validate">
                    <label class="active" for="ws_port">Port</label>
                </div>
            </div>
            <!-- Proxy - HTTP -->
            <h6>HTTP Proxy</h6>
            <div class="row valign-wrapper">
                <div class="col s2">
                    <label>
                        <input type="checkbox" class="filled-in" v-model="settings.proxy.http.active" v-bind:checked="settings.proxy.http.active" />
                        <span></span>
                    </label>
                </div>
                <div class="input-field col s6">
                    <input v-bind:disabled="!settings.proxy.http.active" v-model="settings.proxy.http.host" id="http_host" type="text">
                    <label class="active" for="http_host">Host</label>
                </div>
                <div class="input-field col s4">
                    <input v-bind:disabled="!settings.proxy.http.active" v-model.number="settings.proxy.http.port" id="http_port" type="number">
                    <label class="active" for="http_port">Port</label>
                </div>
            </div>
            <!-- Proxy - SSL -->
            <h6>SSL Proxy</h6>
            <div class="row valign-wrapper">
                <div class="col s2">
                    <label>
                        <input type="checkbox" class="filled-in" v-model="settings.proxy.ssl.active" v-bind:checked="settings.proxy.ssl.active" />
                        <span></span>
                    </label>
                </div>
                <div class="input-field col s6">
                    <input v-bind:disabled="!settings.proxy.ssl.active" v-model="settings.proxy.ssl.host" id="ssl_host" type="text">
                    <label class="active" for="ssl_host">Host</label>
                </div>
                <div class="input-field col s4">
                    <input v-bind:disabled="!settings.proxy.ssl.active" v-model.number="settings.proxy.ssl.port" id="ssl_port" type="number">
                    <label class="active" for="ssl_port">Port</label>
                </div>
            </div>
            <a class="waves-effect waves-light btn-small right" v-on:click="saveSettings">Save</a>
        </div>
    </div>
</template>

<style scoped>
    .row {
        margin-bottom: 0;
    }
    input {
        color: white;
    }
</style>

<script>
const browser = chrome || browser;

export default {
    props: ['settings'],
    methods: {
        saveSettings: function() {
            browser.runtime.sendMessage({action: 'saveSettings', data: this.settings});
        }
    }
}
</script>