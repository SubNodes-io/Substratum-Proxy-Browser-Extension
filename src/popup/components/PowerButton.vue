<template>
    <div class="row">
        <div class="col s12">
            <div class="power-outer" v-on:click="toggleProxySettings">
                <div class="power-inner valign-wrapper" v-bind:class="{'active': status == 'active', 'inactive': status == 'inactive', 'dead': status == 'dead' }">
                    <div class="power-icon center-align">
                        <i class="material-icons">power_settings_new</i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .power-outer {
        margin: 0 auto;
        width: 150px;
        height: 150px;
        border: 8px solid #263238;
        border-radius: 50%;
        cursor: pointer;
    }

    .power-inner {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 3px solid #00e676;
        color: #00e676;
    }

    .power-inner.dead {
        border: 3px solid #CCC;
        color: #CCC;
        cursor: not-allowed;
    }

    .power-inner.active {
        border: 3px solid #00e676;
        color: #00e676;
    }

    .power-inner.active:hover {
        border-color: #69f0ae;
        color: #69f0ae;
    }

    .power-inner.inactive {
        border: 3px solid #ffca28;
        color: #ffca28;
    }

    .power-inner.inactive:hover {
        border-color: #ffd54f;
        color: #ffd54f;
    }

    .power-icon {
        width: 100%;
    }

    .power-icon > .material-icons {
        user-select: none;
        font-size: 45px;
    }
</style>

<script>
const browser = chrome || browser;

export default {
    props: ['status'],
    methods: {
        toggleProxySettings: function() {
            if (this.status !== 'dead') {
                browser.runtime.sendMessage({ action: 'toggleProxySettings' });
            }
        }
    }
}
</script>