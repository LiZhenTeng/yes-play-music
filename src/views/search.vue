<template>
    <div v-show="show" class="search-page">
        <div v-show="artists.length > 0 || albums.length > 0" class="row">
            <div v-show="artists.length > 0" class="artists">
                <div v-show="artists.length > 0" class="section-title">{{ $t('search.artist')
                }}<router-link :to="`/search/${keywords}/artists`">{{
    $t('home.seeMore')
}}</router-link></div>
                <CoverRow type="artist" :column-number="3" :items="artists.slice(0, 3)" gap="34px 24px" />
            </div>

            <div class="albums">
                <div v-show="albums.length > 0" class="section-title">{{ $t('search.album')
                }}<router-link :to="`/search/${keywords}/albums`">{{
    $t('home.seeMore')
}}</router-link></div>
                <CoverRow type="album" :items="albums.slice(0, 3)" sub-text="artist" :column-number="3"
                    sub-text-font-size="14px" gap="34px 24px" :play-button-size="26" />
            </div>
        </div>

        <div v-show="tracks.length > 0" class="tracks">
            <div class="section-title">{{ $t('search.song')
            }}<router-link :to="`/search/${keywords}/tracks`">{{
    $t('home.seeMore')
}}</router-link></div>
            <TrackList :tracks="tracks" type="tracklist" />
        </div>

        <div v-show="musicVideos.length > 0" class="music-videos">
            <div class="section-title">{{ $t('search.mv')
            }}<router-link :to="`/search/${keywords}/music-videos`">{{
    $t('home.seeMore')
}}</router-link></div>
            <MvRow :mvs="musicVideos.slice(0, 5)" />
        </div>

        <div v-show="playlists.length > 0" class="playlists">
            <div class="section-title">{{ $t('search.playlist')
            }}<router-link :to="`/search/${keywords}/playlists`">{{
    $t('home.seeMore')
}}</router-link></div>
            <CoverRow type="playlist" :items="playlists.slice(0, 12)" sub-text="title" :column-number="6"
                sub-text-font-size="14px" gap="34px 24px" :play-button-size="26" />
        </div>

        <div v-show="!haveResult" class="no-results">
            <div><svg-icon icon-class="search" />
                {{
                    keywords.length === 0 ? '输入关键字搜索' : $t('search.noResult')
                }}</div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { getTrackDetail } from '@/api/track';
import { getSearch } from '@/api/others';
import { start, done } from 'nprogress';
import { ref, computed, watch, onMounted } from 'vue';

import TrackList from '@/components/TrackList.vue';
import MvRow from '@/components/MvRow.vue';
import CoverRow from '@/components/CoverRow.vue';
import { useRoute } from 'vue-router';
import { useIndexStore } from '@/store';
import { storeToRefs } from 'pinia';

const route = useRoute();
const indexStore = useIndexStore();
const { showToast } = indexStore;
const { player } = storeToRefs(indexStore);

const show = ref(false);
const tracks = ref<Array<any>>([]);
const artists = ref<Array<any>>([]);
const albums = ref<Array<any>>([]);
const playlists = ref<Array<any>>([]);
const musicVideos = ref<Array<any>>([]);
const r = ref();

const keywords = computed(() => {
    return route.params.keywords ?? '';
})
const haveResult = computed(() => {
    return (
        tracks.value.length +
        artists.value.length +
        albums.value.length +
        playlists.value.length +
        musicVideos.value.length >
        0
    );
})

const search = async (type = 'all') => {
    const typeTable: { [k: string]: any } = {
        all: 1018,
        musicVideos: 1004,
        tracks: 1,
        albums: 10,
        artists: 100,
        playlists: 1000,
    };
    try {
        const { data } = await getSearch({
            keywords: keywords.value.toString(),
            type: typeTable[type],
            limit: 16,
        })
        return { result: data.result, type };
    } catch (error: any) {
        showToast(error.response.data.msg || error.response.data.message);
    }
}
const getData = async () => {
    setTimeout(() => {
        if (!show.value) start();
    }, 1000);
    show.value = false;

    const requestAll = async (requests: Array<Promise<{
        result: any;
        type: string;
    } | undefined>>) => {
        const k = keywords.value;
        const results = await Promise.all(requests)
        if (k != keywords.value) return;
        results.map(async (result) => {
            const searchType = result?.type;
            if (result?.result === undefined) return;
            const data = result.result;
            switch (searchType) {
                case 'all':
                    r.value = data;
                    break;
                case 'musicVideos':
                    musicVideos.value = data.mvs ?? [];
                    break;
                case 'artists':
                    artists.value = data.artists ?? [];
                    break;
                case 'albums':
                    albums.value = data.albums ?? [];
                    break;
                case 'tracks':
                    tracks.value = data.songs ?? [];
                    await getTracksDetail();
                    break;
                case 'playlists':
                    playlists.value = data.playlists ?? [];
                    break;
            }
        });
        done();
        show.value = true;
    };

    await requestAll([
        search('artists'),
        search('albums'),
        search('tracks'),
        search('musicVideos'),
        search('playlists')
    ]);
}
const getTracksDetail = async () => {
    const trackIDs = tracks.value.map(t => t.id);
    if (trackIDs.length === 0) return;
    const { data } = await getTrackDetail(trackIDs.join(','))
    tracks.value = data.songs;
}

onMounted(async () => {
    await getData();
})

watch(keywords, async (state) => {
    if (state.length === 0) return;
    await getData();
})

</script>

<style lang="scss" scoped>
.section-title {
    font-weight: 600;
    font-size: 22px;
    opacity: 0.88;
    color: var(--color-text);
    margin-bottom: 16px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    a {
        font-size: 13px;
        font-weight: 600;
        opacity: 0.68;
    }
}

.row {
    display: flex;
    flex-wrap: wrap;
    margin-top: 32px;

    .artists {
        flex: 1;
        margin-right: 8rem;
    }

    .albums {
        flex: 1;
    }
}

.tracks,
.music-videos,
.playlists {
    margin-top: 46px;
}

.no-results {
    position: absolute;
    top: 64px;
    right: 0;
    left: 0;
    bottom: 64px;
    font-size: 24px;
    color: var(--color-text);
    opacity: 0.38;
    display: flex;
    justify-content: center;
    align-items: center;

    div {
        display: flex;
        align-items: center;
    }

    .svg-icon {
        height: 24px;
        width: 24px;
        margin-right: 16px;
    }
}
</style>