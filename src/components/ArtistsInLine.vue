<template>
    <span class="artist-in-line">
        {{ computedPrefix }}
        <span v-for="(ar, index) in filteredArtists" :key="index">
            <router-link v-if="ar.id !== 0" :to="`/artist/${ar.id}`">{{
                ar.name
            }}</router-link>
            <span v-else>{{ ar.name }}</span>
            <span v-if="index !== filteredArtists.length - 1" class="separator">,</span>
        </span>
    </span>
</template>
<script lang="ts" setup>
import { computed } from 'vue';

const { artists, exclude, prefix } = defineProps({
    artists: {
        type: Array<any>,
        required: true,
    },
    exclude: {
        type: String,
        default: '',
    },
    prefix: {
        type: String,
        default: '',
    },
})

const filteredArtists = computed(() => {
    return artists.filter(a => a.name !== exclude);
})

const computedPrefix = computed(() => {
    return filteredArtists.value.length !== 0 ? prefix : '';
})

</script>
<style lang="scss" scoped>
.separator {
    /* make separator distinct enough in long list */
    margin-left: 1px;
    margin-right: 4px;
    position: relative;
    top: 0.5px;
}
</style>
