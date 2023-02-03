<template>
    <div class="explore-page">
        <h1>{{ $t('explore.explore') }}</h1>
        <div class="buttons">
            <div v-for="category in settings.enabledPlaylistCategories" :key="category" class="button"
                :class="{ active: category === activeCategory && !showCatOptions }" @click="goToCategory(category)">
                {{ category }}
            </div>
            <div class="button more" :class="{ active: showCatOptions }" @click="showCatOptions = !showCatOptions">
                <svg-icon icon-class="more"></svg-icon>
            </div>
        </div>

        <div v-show="showCatOptions" class="panel">
            <div v-for="bigCat in allBigCats" :key="bigCat" class="big-cat">
                <div class="name">{{ bigCat }}</div>
                <div class="cats">
                    <div v-for="cat in getCatsByBigCat(bigCat)" :key="cat.name" class="cat" :class="{
                        active: settings.enabledPlaylistCategories.includes(cat.name),
                    }" @click="toggleCat(cat.name)"><span>{{ cat.name }}</span></div>
                </div>
            </div>
        </div>

        <div class="playlists">
            <CoverRow type="playlist" :items="playlists" :sub-text="subText" :show-play-button="true"
                :show-play-count="activeCategory !== '排行榜' ? true : false"
                :image-size="activeCategory !== '排行榜' ? 512 : 1024" />
        </div>
        <div v-show="['推荐歌单', '排行榜'].includes(activeCategory) === false" class="load-more">
            <ButtonTwoTone v-show="showLoadMoreButton && hasMore" color="grey" :loading="loadingMore"
                @click.native="getPlaylist">{{ $t('explore.loadMore') }}</ButtonTwoTone>
        </div>
    </div>

</template>
<script lang="ts" setup>
import { start, done } from 'nprogress';
import { getTopPlaylist, getHighQualityPlaylist, getToplists } from '@/api/playlist';
import { playlistCategories } from '@/utils/staticData';
import { useGetRecommendPlayList } from '@/hooks/playList';
import ButtonTwoTone from '@/components/ButtonTwoTone.vue';
import CoverRow from '@/components/CoverRow.vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';
import { ref, reactive, computed, onMounted, onActivated, getCurrentInstance } from 'vue';
import { useIndexStore } from '@/store';
import { storeToRefs } from 'pinia';

const indexStore = useIndexStore();
const { togglePlaylistCategory } = indexStore;
const { settings } = storeToRefs(indexStore);
const instance = getCurrentInstance();
const route = useRoute();
const router = useRouter();

const show = ref(false);
const playlists = reactive(new Array());
const activeCategory = ref('全部');
const loadingMore = ref(false);
const showLoadMoreButton = ref(false);
const hasMore = ref(true);
const allBigCats = reactive(['语种', '风格', '场景', '情感', '主题']);
const showCatOptions = ref(false);
const offset = ref(0);

const subText = computed(() => {
    if (activeCategory.value === '排行榜') return 'updateFrequency';
    if (activeCategory.value === '推荐歌单') return 'copywriter';
    return 'none';
})

const loadData = () => {
    setTimeout(() => {
        if (!show.value) start();
    }, 1000);
    activeCategory.value =
        route.query.category === undefined
            ? '全部'
            : route.query.category as string;
    getPlaylist();
}

const goToCategory = (category: any) => {
    showCatOptions.value = false;
    router.push({ name: 'explore', query: { category } });
}
const updatePlaylist = (arg: Array<any>) => {
    playlists.push(...arg);
    loadingMore.value = false;
    showLoadMoreButton.value = true;
    done();
    show.value = true;
}
const getPlaylist = () => {
    loadingMore.value = true;
    if (activeCategory.value === '推荐歌单') {
        return getRecommendPlayList();
    }
    if (activeCategory.value === '精品歌单') {
        return getHighQualityPlaylistFn();
    }
    if (activeCategory.value === '排行榜') {
        return getTopLists();
    }
    return getTopPlayList();
}
const getRecommendPlayList = () => {
    useGetRecommendPlayList(100, true).then((list: any) => {
        playlists.length = 0;
        updatePlaylist(list);
    });
}
const getHighQualityPlaylistFn = async () => {
    let d = playlists;
    let before =
        d.length !== 0 ? d[d.length - 1].updateTime : 0;
    const { data } = await getHighQualityPlaylist({ limit: 50, before })
    updatePlaylist(data.playlists);
    hasMore.value = data.more;
}
const getTopLists = async () => {
    const { data } = await getToplists();
    playlists.length = 0;
    updatePlaylist(data.list);

}
const getTopPlayList = async () => {
    getTopPlaylist({
        cat: activeCategory.value,
        offset: playlists.length,
    }).then(({ data }) => {
        updatePlaylist(data.playlists);
        hasMore.value = data.more;
    });
}
const getCatsByBigCat = (name: any) => {
    return playlistCategories.filter(c => c.bigCat === name);
}
const toggleCat = (name: any) => {
    togglePlaylistCategory(name);
}

onActivated(() => {
    loadData();
    (instance?.parent?.refs?.scrollbar as any)?.restorePosition();
})


onBeforeRouteUpdate((to, from, next) => {
    showLoadMoreButton.value = false;
    hasMore.value = true;
    playlists.length = 0;
    offset.value = 1;
    activeCategory.value = to.query.category as string;
    getPlaylist();
    next();
})

</script>
<style lang="scss" scoped>
h1 {
    color: var(--color-text);
    font-size: 56px;
}

.buttons {
    display: flex;
    flex-wrap: wrap;
}

.button {
    user-select: none;
    cursor: pointer;
    padding: 8px 16px;
    margin: 10px 16px 6px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 600;
    font-size: 18px;
    border-radius: 10px;
    background-color: var(--color-secondary-bg);
    color: var(--color-secondary);
    transition: 0.2s;

    &:hover {
        background-color: var(--color-primary-bg);
        color: var(--color-primary);
    }
}

.button.active {
    background-color: var(--color-primary-bg);
    color: var(--color-primary);
}

.panel {
    margin-top: 10px;
    background: var(--color-secondary-bg);
    border-radius: 10px;
    padding: 8px;
    color: var(--color-text);

    .big-cat {
        display: flex;
        margin-bottom: 32px;
    }

    .name {
        font-size: 24px;
        font-weight: 700;
        opacity: 0.68;
        margin-left: 24px;
        min-width: 54px;
        height: 26px;
        margin-top: 8px;
    }

    .cats {
        margin-left: 24px;
        display: flex;
        flex-wrap: wrap;
    }

    .cat {
        user-select: none;
        margin: 4px 0px 0 0;
        display: flex;
        // justify-content: center;
        align-items: center;
        font-weight: 500;
        font-size: 16px;
        transition: 0.2s;
        min-width: 98px;

        span {
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            padding: 6px 12px;
            height: 26px;
            border-radius: 10px;
            opacity: 0.88;

            &:hover {
                opacity: 1;
                background-color: var(--color-primary-bg);
                color: var(--color-primary);
            }
        }
    }

    .cat.active {
        color: var(--color-primary);
    }
}

.playlists {
    margin-top: 24px;
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
