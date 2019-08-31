<template>
    
    <nav>
        <div class="nav-wrapper red darken-1">
            <a href="#" class="brand-logo left">Substratum Proxy Toggle</a>
            <ul id="nav-mobile" class="right">
                <li v-show="view == 'main'"><a href="#" v-on:click="changeView($event, 'settings')"><i class="material-icons">settings</i></a></li>
                <li v-show="view != 'main'"><a href="#" v-on:click="changeView($event, 'main')"><i class="material-icons">home</i></a></li>
            </ul>
        </div>
    </nav>
        
</template>

<style scoped>
    nav, nav * {
        height: 45px !important;
        line-height: 45px !important;
    }
    .brand-logo, .material-icons {
        font-size: 1.3rem;
    }
</style>

<script>
export default {
    props: ['view'],
    methods: {
        changeView: function(e, viewName) {
            this.$parent.view = viewName;
        }
    }
}
</script>