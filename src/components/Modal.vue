<template>
    <div v-show="show" class="shade" @click="clickOutside">
        <div class="modal" :style="modalStyles" @click.stop>
            <div class="header">
                <div class="title">{{ title }}</div>
                <button class="close" @click="() => { if (close) close(); }"><svg-icon icon-class="x" /></button>
            </div>
            <div class="content">
                <slot></slot>
            </div>
            <div v-if="showFooter" class="footer">
                <!-- <button>取消</button>
        <button class="primary">确定</button> -->
                <slot name="footer"></slot>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';

const { show, close, title, showFooter, width, clickOutsideHide, minWidth } = defineProps({
    show: Boolean,
    close: Function,
    title: {
        type: String,
        default: 'Title',
    },
    showFooter: {
        type: Boolean,
        default: true,
    },
    width: {
        type: String,
        default: '50vw',
    },
    clickOutsideHide: {
        type: Boolean,
        default: false,
    },
    minWidth: {
        type: String,
        default: 'calc(min(23rem, 100vw))',
    }
})

const modalStyles = computed(() => {
    return {
        width,
        minWidth,
    };
})
const clickOutside = () => {
    if (clickOutsideHide) {
        if (close)
            close();
    }
}
</script>