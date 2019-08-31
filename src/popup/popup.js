require("babel-polyfill");
import Vue from 'vue';
import App from './components/App.vue';

import 'materialize-css/dist/js/materialize.min.js';
import 'materialize-css/dist/css/materialize.min.css';


new Vue({
    el: '#app',
    render: h => h(App)
});