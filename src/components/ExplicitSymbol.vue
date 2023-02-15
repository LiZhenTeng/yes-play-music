<template>
    <svg-icon icon-class="explicit" :style="svgStyle"></svg-icon>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const { size } = defineProps({
    size: {
        type: Number,
        default: 16,
    },
})

const svgStyle = ref({
    height: size + 'px',
    width: size + 'px',
    position: 'relative',
    left: '-1px',
});
</script>