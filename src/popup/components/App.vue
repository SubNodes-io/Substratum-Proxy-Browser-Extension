<template>
    <div>
        <Navbar v-bind:view="view"></Navbar>

        <div class="container">
            <div v-show="view == 'main'">
                <div class="row main-message">
                    <div class="col s12 center-align">
                        <span>{{ mainMessage }}</span>
                        <a href="#" v-show="!wsStatus" v-on:click="retryWebsocket">retry</a>
                    </div>
                </div>
                <ErrorMessage v-bind:message="errorMessage" v-if="errorMessage !== null"></ErrorMessage>
                <PowerButton v-bind:status="statusBtnState"></PowerButton>
                <Financials v-bind:financials="financials" v-bind:financialsArray="financialsArray"></Financials>
            </div>
            <div v-show="view == 'settings'">
                <Settings v-bind:settings="settings"></Settings>
            </div>
            <Footer></Footer>
        </div>
    </div>
</template>

<style>
    @import '~material-design-icons/iconfont/material-icons.css';

    html, body {
        width: 350px;
        max-width: 320px;
        min-height: 475px;
        color: white;
        font-size: 14px;
        margin: 0;
    }

    .main-message {
        margin-top: 12px;
    }
</style>

<script>
const browser = chrome || browser;

import Navbar from './Navbar.vue';
import ErrorMessage from './ErrorMessage.vue';
import PowerButton from './PowerButton.vue';
import Financials from './Financials.vue';
import Settings from './Settings.vue';
import Footer from './Footer.vue';

export default {
    data: function() {
        return {
            view: 'main',
            settings: null,
            wsStatus: false,
            proxyStatus: false,
            mainMessage: 'checking...',
            errorMessage: null,
            financials: null, // lastest
            financialsArray: null, // all in time scope
        }
    },
    components: {
        Navbar,
        ErrorMessage,
        PowerButton,
        Financials,
        Settings,
        Footer
    },
    computed: {
        statusBtnState: function() {
            if (this.proxyStatus) {
                return 'active';
            } else if (!this.wsStatus) {
                return 'dead';
            } else {
                return 'inactive';
            }
        }
    },
    watch: {
        wsStatus: function(newStatus, oldStatus) {
            if(newStatus) {
                browser.runtime.sendMessage({action: 'getFinancials'});
            }
        }
    },
    methods: {
        retryWebsocket: function() {
            M.toast({html: 'Checking...'});
            browser.runtime.sendMessage({action: 'retryWebSocket'});
        }
    },
    mounted: function() {
        browser.runtime.sendMessage({action: 'status'});
        browser.runtime.sendMessage({action: 'getSettings'});

        browser.runtime.onMessage.addListener((msg, sender) => {
            switch (msg.action) {
                case 'settings':
                    this.settings = msg.data;
                    break;

                case 'settingsSaved':
                    const toastMsg = (this.proxyStatus) ? 'Saved! Restart proxy' : 'Saved!';
                    M.toast({html: toastMsg});
                    break;

                case 'financials':
                    this.financials = msg.data;
                    break;

                case 'financialsArray':
                    this.financialsArray = msg.data;
                    break;

                case 'status':
                    this.wsStatus = msg.data.websocket;
                    this.proxyStatus = msg.data.proxy;
                    this.mainMessage = msg.data.mainMessage;
                    this.errorMessage = msg.data.errorMessage;
            }
        });
    }
}
</script>