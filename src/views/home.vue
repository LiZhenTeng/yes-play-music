<template>
    <div v-show="show" class="home">
        <div v-if="settings.showPlaylistsByAppleMusic !== false" class="index-row first-row">
            <div class="title"> by Apple Music </div>
            <CoverRow :type="'playlist'" :items="byAppleMusic" sub-text="appleMusic" :image-size="1024" />
        </div>
        <div class="index-row">
            <div class="title">
                {{ $t('home.recommendPlaylist') }}
                <router-link to="/explore?category=推荐歌单">{{
                    $t('home.seeMore')
                }}</router-link>
            </div>
            <CoverRow :type="'playlist'" :items="recommendPlaylist.items" sub-text="copywriter" />
        </div>
        <div class="index-row">
            <div class="title"> For You </div>
            <div class="for-you-row">
                <DailyTracksCard ref="dailyTracksCard" />
                <FMCard />
            </div>
        </div>
        <div class="index-row">
            <div class="title">{{ $t('home.recommendArtist') }}</div>
            <CoverRow type="artist" :column-number="6" :items="recommendArtists.items" />
        </div>
        <div class="index-row">
            <div class="title">
                {{ $t('home.newAlbum') }}
                <router-link to="/new-album">{{ $t('home.seeMore') }}</router-link>
            </div>
            <CoverRow type="album" :items="newReleasesAlbum.items" sub-text="artist" />
        </div>
        <div class="index-row">
            <div class="title">
                {{ $t('home.charts') }}
                <router-link to="/explore?category=排行榜">{{
                    $t('home.seeMore')
                }}</router-link>
            </div>
            <CoverRow type="playlist" :items="topList.items" sub-text="updateFrequency" :image-size="1024" />
        </div>
    </div>

</template>
<script lang="ts" setup>
import { getToplists } from '@/api/playlist';
import { getToplistOfArtists } from '@/api/artist';
import { getNewAlbums } from '@/api/album';
import { baseByAppleMusic } from '@/utils/staticData';
import { useGetRecommendPlayList } from '@/hooks/playList';
import NProgress from 'nprogress';
import CoverRow from '@/components/CoverRow.vue';
import FMCard from '@/components/FMCard.vue';
import DailyTracksCard from '@/components/DailyTracksCard.vue';
import { ref, reactive, computed, onActivated, getCurrentInstance } from 'vue';
import { useIndexStore } from '@/store';
import { storeToRefs } from 'pinia';

const indexStore = useIndexStore();
const { settings } = storeToRefs(indexStore);
const instance = getCurrentInstance();

const dailyTracksCard=ref<any>(null);
const show = ref(false);
const recommendPlaylist = reactive({ items: new Array() });
const newReleasesAlbum = reactive({ items: new Array() });
const topList = reactive({
    items: new Array(),
    ids: [19723756, 180106, 60198, 3812895, 60131],
})
const recommendArtists = reactive({
    items: new Array(),
    indexs: new Array(),
})

const byAppleMusic = computed(() => {
    return baseByAppleMusic;
})

const loadData = () => {
    setTimeout(() => {
        if (!show.value) NProgress.start();
    }, 1000);
    useGetRecommendPlayList(10, false).then(items => {
        recommendPlaylist.items = items;
        NProgress.done();
        show.value = true;
    });
    getNewAlbums({
        area: settings.value.musicLanguage ?? 'ALL',
        limit: 10,
    }).then(({data}) => {
        newReleasesAlbum.items = data?.albums;
    });

    const toplistOfArtistsAreaTable: { [key: string]: any } = {
        all: null,
        zh: 1,
        ea: 2,
        jp: 4,
        kr: 3,
    };
    getToplistOfArtists(
        toplistOfArtistsAreaTable[settings.value?.musicLanguage ?? 'all']
    ).then(({data}) => {
        let indexs = new Array();
        while (indexs.length < 6) {
            let tmp = ~~(Math.random() * 100);
            if (!indexs.includes(tmp)) indexs.push(tmp);
        }
        recommendArtists.indexs = indexs;
        recommendArtists.items = data.list.artists.filter((l: any, index: any) =>
            indexs.includes(index)
        );
    });
    getToplists().then(({data}) => {
        topList.items = data.list.filter((l: { id: any; }) =>
            topList.ids.includes(l.id)
        );
    });
    //dailyTracksCard.value?.loadDailyTracks();
}
onActivated(() => {
    loadData();
    (instance?.parent?.refs?.scrollbar as any)?.restorePosition();
})
</script>
<style lang="scss" scoped>
.index-row {
    margin-top: 54px;
}

.index-row.first-row {
    margin-top: 32px;
}

.playlists {
    display: flex;
    flex-wrap: wrap;

    margin: {
        right: -12px;
        left: -12px;
    }

    .index-playlist {
        margin: 12px 12px 24px 12px;
    }
}

.title {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 20px;
    font-size: 28px;
    font-weight: 700;
    color: var(--color-text);

    a {
        font-size: 13px;
        font-weight: 600;
        opacity: 0.68;
    }
}

footer {
    display: flex;
    justify-content: center;
    margin-top: 48px;
}

.for-you-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-bottom: 78px;
}
</style>
