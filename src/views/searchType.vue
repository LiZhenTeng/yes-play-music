<template>
    <div v-show="show" class="search">
        <h1>
            <span>{{ $t('search.searchFor') }} {{ typeNameTable[type] }}</span> "{{
                keywords
            }}"
        </h1>

        <div v-if="type === 'artists'">
            <CoverRow type="artist" :items="result" :column-number="6" />
        </div>
        <div v-if="type === 'albums'">
            <CoverRow type="album" :items="result" sub-text="artist" sub-text-font-size="14px" />
        </div>
        <div v-if="type === 'tracks'">
            <TrackList :tracks="result" type="playlist" dbclick-track-func="playAList" />
        </div>
        <div v-if="type === 'musicVideos'">
            <MvRow :mvs="result" />
        </div>
        <div v-if="type === 'playlists'">
            <CoverRow type="playlist" :items="result" sub-text="title" />
        </div>

        <div class="load-more">
            <ButtonTwoTone v-show="hasMore" color="grey" @click.native="fetchData">{{
                $t('explore.loadMore')
            }}</ButtonTwoTone>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { getTrackDetail } from '@/api/track';
import { getSearch } from '@/api/others';
import locale from '@/locale';
import { camelCase } from 'change-case';
import { start, done } from 'nprogress';

import TrackList from '@/components/TrackList.vue';
import MvRow from '@/components/MvRow.vue';
import CoverRow from '@/components/CoverRow.vue';
import ButtonTwoTone from '@/components/ButtonTwoTone.vue';
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const show = ref(false);
const hasMore = ref(false);
const result = ref<Array<any>>([]);

const keywords = computed(() => {
    return route.params.keywords;
})
const type = computed(() => {
    return camelCase(route.params.type);
})
const typeNameTable = computed(() => {
    const d: { [k: string]: any } = {
        musicVideos: locale.global.t('search.mv'),
        tracks: locale.global.t('search.song'),
        albums: locale.global.t('search.album'),
        artists: locale.global.t('search.artist'),
        playlists: locale.global.t('search.playlist'),
    };
    return d;
})

const fetchData = async () => {
    const typeTable: { [k: string]: any } = {
        musicVideos: 1004,
        tracks: 1,
        albums: 10,
        artists: 100,
        playlists: 1000,
    };
    const { data } = await getSearch({
        keywords: keywords.value.toString(),
        type: typeTable[type.value],
        offset: result.value.length,
    })
    const r = data.result;
    hasMore.value = r.hasMore ?? true;
    switch (type.value) {
        case 'musicVideos':
            result.value.push(...r.mvs);
            if (r.mvCount <= result.value.length) {
                hasMore.value = false;
            }
            break;
        case 'artists':
            result.value.push(...r.artists);
            break;
        case 'albums':
            result.value.push(...r.albums);
            if (r.albumCount <= result.value.length) {
                hasMore.value = false;
            }
            break;
        case 'tracks':
            result.value.push(...r.songs);
            await getTracksDetail();
            break;
        case 'playlists':
            result.value.push(...r.playlists);
            break;
    }
    done();
    show.value = true;
}

const getTracksDetail = async () => {
    const trackIDs = result.value.map(t => t.id);
    if (trackIDs.length === 0) return;
    const { data } = await getTrackDetail(trackIDs.join(','))
    result.value = data.songs;
}


onMounted(() => {
    fetchData();
})


</script>
<style lang="scss" scoped>
h1 {
    margin-top: 32px;
    margin-bottom: 28px;
    color: var(--color-text);

    span {
        opacity: 0.58;
    }
}

.load-more {
    display: flex;
    justify-content: center;
    margin-top: 32px;
}

.button.more {
    .svg-icon {
        height: 24px;
        width: 24px;
    }
}
</style>
