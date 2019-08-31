<template>
    <div class="row error-row">
        <div class="col s12 valign-wrapper">
            <i class="material-icons">error_outline</i>
            <span v-html="message"></span>
        </div>
    </div>
</template>

<style scoped>
    .row {
        color: #424242;
        border-radius: 4px;
    }

    .error-row {
        background: #ffff8d;
        border: 2px solid #ffea00;
        border-radius: 3px;
        color: #424242;
        padding: 5px;
    }
</style>

<script>
export default {
    props: ['message']
}
</script>