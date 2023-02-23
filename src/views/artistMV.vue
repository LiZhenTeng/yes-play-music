<template>
    <div v-show="show">
        <h1>
            <img class="avatar" :src="useResizeImage(artist.img1v1Url, 1024)" loading="lazy" />{{ artist.name }}'s Music
            Videos
        </h1>
        <MvRow :mvs="mvs" subtitle="publishTime" />
        <div class="load-more">
            <ButtonTwoTone v-show="hasMore" color="grey" @click.native="loadMVs">{{
                $t('explore.loadMore')
            }}</ButtonTwoTone>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { getArtistMv, getArtist } from '@/api/artist';
import { start, done } from 'nprogress';
import ButtonTwoTone from '@/components/ButtonTwoTone.vue';
import MvRow from '@/components/MvRow.vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import { ref, onMounted, onActivated } from 'vue';
import { useResizeImage } from '@/utils/common';

const route = useRoute();

const id = ref(0);
const show = ref(false);
const hasMore = ref(false);
const artist = ref<{ [k: string]: any }>({});
const mvs = ref<Array<any>>([]);

const loadData = async () => {
    setTimeout(() => {
        if (!show.value) start();
    }, 1000);
    const { data } = await getArtist(id.value)
    artist.value = data.artist;
    loadMVs();
}
const loadMVs = async () => {
    const { data } = await getArtistMv({ id: id.value, limit: 100, offset: mvs.value.length })
    mvs.value.push(...data.mvs);
    hasMore.value = data.hasMore;
    done();
    show.value = true;
}

onMounted(() => {
    id.value = Number(route.params.id);
    loadData();
})
onActivated(() => {
    if (Number(route.params.id) !== id.value) {
        id.value = Number(route.params.id);
        mvs.value = [];
        artist.value = {};
        show.value = false;
        hasMore.value = true;
        loadData();
    }
})

onBeforeRouteUpdate((to, from, next) => {
    id.value = Number(to.params.id);
    loadData();
    next();
})

</script>
<style lang="scss" scoped>
h1 {
    font-size: 42px;
    color: var(--color-text);

    .avatar {
        height: 44px;
        margin-right: 12px;
        vertical-align: -7px;
        border-radius: 50%;
        border: rgba(0, 0, 0, 0.2);
    }
}

.load-more {
    display: flex;
    justify-content: center;
}
</style>
