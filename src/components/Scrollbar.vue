<template>
    <div>
        <transition name="fade">
            <div v-show="show" id="scrollbar" :class="{ 'on-drag': isOnDrag }" @click="handleClick">
                <div id="thumbContainer" :class="{ active }" :style="thumbStyle" @mouseenter="handleMouseenter"
                    @mouseleave="handleMouseleave" @mousedown="handleDragStart" @click.stop>
                    <div></div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, getCurrentInstance, defineEmits, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';


const instance = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const emit = defineEmits(['userSelectNone']);

const top = ref(0);
const thumbHeight = ref(0);
const active = ref(false);
const show = ref(false);
const hideTimer = ref<NodeJS.Timeout | null>(null);
const isOnDrag = ref(false);
const onDragClientY = ref(0);
const positions = reactive<{ [key: string]: any }>({
    home: { scrollTop: 0, params: {} }
})

const thumbStyle = computed(() => {
    return {
        transform: `translateY(${top.value}px)`,
        height: `${thumbHeight.value}px`,
    };
})

const main = computed(() => {
    return instance?.parent?.refs?.main as HTMLElement;
})

const handleScroll = () => {
    const clintHeight = main.value?.clientHeight - 128;
    const scrollHeight = main.value?.scrollHeight - 128;
    const scrollTop = main.value?.scrollTop;
    let topValue = ~~((scrollTop / scrollHeight) * clintHeight);
    let thumbHeightValue = ~~((clintHeight / scrollHeight) * clintHeight);

    if (thumbHeightValue < 24) thumbHeightValue = 24;
    if (topValue > clintHeight - thumbHeightValue) {
        topValue = clintHeight - thumbHeightValue;
    }
    top.value = topValue;
    thumbHeight.value = thumbHeightValue;

    if (!show.value && clintHeight !== thumbHeightValue) show.value = true;
    setScrollbarHideTimeout();

    if (route.meta.savePosition) {
        positions[route.name?.toString() || ''] = { scrollTop, params: route.params };
    }
}
const handleMouseenter = () => {
    active.value = true;
}

const handleMouseleave = () => {
    active.value = false;
    setScrollbarHideTimeout();
}
const handleDragStart = (e: any) => {
    onDragClientY.value = e.clientY;
    isOnDrag.value = true;
    //this.$parent.userSelectNone = true;
    emit('userSelectNone', true);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
}
const handleDragMove = (e: any) => {
    if (!isOnDrag.value) return;
    const clintHeight = main.value?.clientHeight - 128;
    const scrollHeight = main.value?.scrollHeight - 128;
    const clientY = e.clientY;
    const scrollTop = main.value?.scrollTop;
    const offset = ~~(
        ((clientY - onDragClientY.value) / clintHeight) *
        scrollHeight
    );
    top.value = ~~((scrollTop / scrollHeight) * clintHeight);
    main.value.scrollBy(0, offset);
    onDragClientY.value = clientY;
}
const handleDragEnd = () => {
    isOnDrag.value = false;
    //this.$parent.userSelectNone = false;
    emit('userSelectNone', false);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
}
const handleClick = (e: any) => {
    let scrollTop;
    if (e.clientY < top.value + 84) {
        scrollTop = -256;
    } else {
        scrollTop = 256;
    }
    main.value.scrollBy({
        top: scrollTop,
        behavior: 'smooth',
    });
}
const setScrollbarHideTimeout = () => {
    if (hideTimer.value !== null) clearTimeout(hideTimer.value);
    hideTimer.value = setTimeout(() => {
        if (!active.value) show.value = false;
        hideTimer.value = null;
    }, 4000);
}
const restorePosition = () => {
    if (
        !route.meta.savePosition ||
        positions[route.name?.toString() || ''] === undefined ||
        main.value === undefined
    ) {
        return;
    }
    main.value.scrollTo({ top: positions[route.name?.toString() as string].scrollTop });
}

onMounted(() => {
    router.beforeEach((to, from, next) => {
        show.value = false;
        next();
    });

})

</script>
<style lang="scss" scoped>
#scrollbar {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: 16px;
    z-index: 1000;

    #thumbContainer {
        margin-top: 64px;

        div {
            transition: background 0.4s;
            position: absolute;
            right: 2px;
            width: 8px;
            height: 100%;
            border-radius: 4px;
            background: rgba(128, 128, 128, 0.38);
        }
    }

    #thumbContainer.active div {
        background: rgba(128, 128, 128, 0.58);
    }
}

[data-theme='dark'] {
    #thumbContainer div {
        background: var(--color-secondary-bg);
    }
}

#scrollbar.on-drag {
    left: 0;
    width: auto;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
