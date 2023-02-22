<template>
    <div v-show="show" class="artist-page">
        <div class="artist-info">
            <div class="head">
                <img :src="useResizeImage(artist.img1v1Url, 1024)" loading="lazy" />
            </div>
            <div>
                <div class="name">{{ artist.name }}</div>
                <div class="artist">{{ $t('artist.artist') }}</div>
                <div class="statistics">
                    <a @click="scrollTo('popularTracks')">{{ artist.musicSize }} {{ $t('common.songs') }}</a>
                    ·
                    <a @click="scrollTo('seeMore', 'start')">{{ artist.albumSize }} {{ $t('artist.withAlbums') }}</a>
                    ·
                    <a @click="scrollTo('mvs')">{{ artist.mvSize }} {{ $t('artist.videos') }}</a>
                </div>
                <div class="description" @click="toggleFullDescription">
                    {{ artist.briefDesc }}
                </div>
                <div class="buttons">
                    <ButtonTwoTone icon-class="play" @click.native="playPopularSongs()">
                        {{ $t('common.play') }}
                    </ButtonTwoTone>
                    <ButtonTwoTone color="grey" @click.native="followArtist">
                        <span v-if="artist.followed">{{ $t('artist.following') }}</span>
                        <span v-else>{{ $t('artist.follow') }}</span>
                    </ButtonTwoTone>
                    <ButtonTwoTone icon-class="more" :icon-button="true" :horizontal-padding="0" color="grey"
                        @click.native="openMenu">
                    </ButtonTwoTone>
                </div>
            </div>
        </div>
        <div v-if="latestRelease !== undefined" class="latest-release">
            <div class="section-title">{{ $t('artist.latestRelease') }}</div>
            <div class="release">
                <div class="container">
                    <Cover :id="latestRelease.id" :image-url="useResizeImage(latestRelease.picUrl)" type="album"
                        :fixed-size="128" :play-button-size="30" />
                    <div class="info">
                        <div class="name">
                            <router-link :to="`/album/${latestRelease.id}`">{{
                                latestRelease.name
                            }}</router-link>
                        </div>
                        <div class="date">
                            {{ useFormatDate(latestRelease.publishTime) }}
                        </div>
                        <div class="type">
                            {{ useFormatAlbumType(latestRelease.type, latestRelease) }} ·
                            {{ latestRelease.size }} {{ $t('common.songs') }}
                        </div>
                    </div>
                </div>
                <div v-show="latestMV.id" class="container latest-mv">
                    <div class="cover" @mouseover="mvHover = true" @mouseleave="mvHover = false"
                        @click="goToMv(latestMV.id)">
                        <img :src="latestMV.coverUrl" loading="lazy" />
                        <transition name="fade">
                            <div v-show="mvHover" class="shadow" :style="{
                                background: 'url(' + latestMV.coverUrl + ')',
                            }"></div>
                        </transition>
                    </div>
                    <div class="info">
                        <div class="name">
                            <router-link :to="'/mv/' + latestMV.id">{{
                                latestMV.name
                            }}</router-link>
                        </div>
                        <div class="date">
                            {{ useFormatDate(latestMV.publishTime) }}
                        </div>
                        <div class="type">{{ $t('artist.latestMV') }}</div>
                    </div>
                </div>
                <div v-show="!latestMV.id"></div>
            </div>
        </div>
        <div id="popularTracks" class="popular-tracks">
            <div class="section-title">{{ $t('artist.popularSongs') }}</div>
            <TrackList :tracks="popularTracks.slice(0, showMorePopTracks ? 24 : 12)" :type="'tracklist'" />

            <div id="seeMore" class="show-more">
                <button @click="showMorePopTracks = !showMorePopTracks">
                    <span v-show="!showMorePopTracks">{{ $t('artist.showMore') }}</span>
                    <span v-show="showMorePopTracks">{{ $t('artist.showLess') }}</span>
                </button>
            </div>
        </div>
        <div v-if="albums.length !== 0" id="albums" class="albums">
            <div class="section-title">{{ $t('artist.albums') }}</div>
            <CoverRow :type="'album'" :items="albums" :sub-text="'releaseYear'" :show-play-button="true" />
        </div>
        <div v-if="mvs.length !== 0" id="mvs" class="mvs">
            <div class="section-title">MVs
                <router-link v-show="hasMoreMV" :to="`/artist/${artist.id}/mv`">{{
                    $t('home.seeMore')
                }}</router-link>
            </div>
            <MvRow :mvs="mvs" subtitle="publishTime" />
        </div>
        <div v-if="eps.length !== 0" class="eps">
            <div class="section-title">{{ $t('artist.EPsSingles') }}</div>
            <CoverRow :type="'album'" :items="eps" :sub-text="'albumType+releaseYear'" :show-play-button="true" />
        </div>

        <div v-if="similarArtists.length !== 0" class="similar-artists">
            <div class="section-title">{{ $t('artist.similarArtists') }}</div>
            <CoverRow type="artist" :column-number="6" gap="36px 28px" :items="similarArtists.slice(0, 12)" />
        </div>

        <Modal :show="showFullDescription" :close="toggleFullDescription" :show-footer="false" :click-outside-hide="true"
            :title="$t('artist.artistDesc')">
            <p class="description-fulltext">
                {{ artist.briefDesc }}
            </p>
        </Modal>

        <ContextMenu ref="artistMenu">
            <div class="item" @click="copyUrl(artist.id)">{{
                $t('contextMenu.copyUrl')
            }}</div>
            <div class="item" @click="openInBrowser(artist.id)">{{
                $t('contextMenu.openInBrowser')
            }}</div>
        </ContextMenu>
    </div>
</template>

<script lang="ts" setup>
import {
    getArtist,
    getArtistAlbum,
    getArtistMv,
    followAArtist,
    getSimilarArtists,
} from '@/api/artist';
import locale from '@/locale';
import { start, done } from 'nprogress';

import ButtonTwoTone from '@/components/ButtonTwoTone.vue';
import ContextMenu from '@/components/ContextMenu.vue';
import TrackList from '@/components/TrackList.vue';
import CoverRow from '@/components/CoverRow.vue';
import Cover from '@/components/Cover.vue';
import MvRow from '@/components/MvRow.vue';
import Modal from '@/components/Modal.vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';
import { ref, computed, onActivated, inject } from 'vue';
import { useIndexStore } from '@/store';
import { storeToRefs } from 'pinia';
import useClipboard from 'vue-clipboard3'
import { useResizeImage, useFormatAlbumType, useFormatDate } from '@/utils/common'

const route = useRoute();
const router = useRouter();
const indexStore = useIndexStore();
const { showToast } = indexStore;
const { player, useIsAccountLoggedIn, enableScrolling } = storeToRefs(indexStore)
const { toClipboard } = useClipboard();
const restorePosition: any = inject('restorePosition')
const main:any=inject('main')

const show = ref(false);
const artist = ref<{ [k: string]: any }>({
    img1v1Url:
        'https://p1.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg',
})
const popularTracks = ref<Array<any>>([]);
const albumsData = ref<Array<any>>([]);
const latestRelease = ref<{ [k: string]: any }>({
    picUrl: '',
    publishTime: 0,
    id: 0,
    name: '',
    type: '',
    size: '',
});
const showMorePopTracks = ref(false);
const showFullDescription = ref(false);
const mvs = ref<Array<any>>([]);
const hasMoreMV = ref(false);
const similarArtists = ref<Array<any>>([]);
const mvHover = ref(false);
const artistMenu = ref();

const albums = computed(() => {
    return albumsData.value.filter(a => a.type === '专辑');
})
const eps = computed(() => {
    return albumsData.value.filter(a =>
        ['EP/Single', 'EP', 'Single'].includes(a.type)
    );
})
const latestMV = computed(() => {
    const mv = mvs.value[0] || {};
    return {
        id: mv.id || mv.vid,
        name: mv.name || mv.title,
        coverUrl: `${mv.imgurl16v9 || mv.cover || mv.coverUrl}?param=464y260`,
        publishTime: mv.publishTime,
    };
})

const loadData = async (id: number, next: undefined | Function = undefined) => {
    setTimeout(() => {
        if (!show.value) start();
    }, 1000);
    show.value = false;
    main.value.scrollTo({top: 0});
    const { data } = await getArtist(id);
    artist.value = data.artist;
    popularTracks.value = data.hotSongs;
    if (next !== undefined) next();
    done();
    show.value = true;
    const a = await getArtistAlbum({ id: id, limit: 200 })
    albumsData.value = a.data.hotAlbums;
    latestRelease.value = a.data.hotAlbums[0];
    const m = await getArtistMv({ id })
    mvs.value = m.data.mvs;
    hasMoreMV.value = m.data.hasMore;
    /* const s = await getSimilarArtists(id)
    similarArtists.value = s.data.artists; */
}

const goToAlbum = (id: string) => {
    router.push({
        name: 'album',
        params: { id },
    });
}
const goToMv = (id: string) => {
    router.push({ path: '/mv/' + id });
}
const playPopularSongs = (trackID = 'first') => {
    let trackIDs = popularTracks.value.map(t => t.id);
    player.value.replacePlaylist(
        trackIDs,
        artist.value.id,
        'artist',
        trackID
    );
}
const followArtist = async () => {
    if (!useIsAccountLoggedIn.value) {
        showToast(locale.global.t('toast.needToLogin'));
        return;
    }
    try {
        const { data } = await followAArtist({
            id: artist.value.id,
            t: artist.value.followed ? 0 : 1,
        })
        if (data.code === 200) artist.value.followed = !artist.value.followed;
    } catch (error) {

    }
}

const scrollTo = (div: string, block: ScrollLogicalPosition = "center") => {
    document.getElementById(div)?.scrollIntoView({
        behavior: 'smooth',
        block
    });
}
const toggleFullDescription = () => {
    showFullDescription.value = !showFullDescription.value;
    if (showFullDescription.value) {
        enableScrolling.value = false;
    } else {
        enableScrolling.value = true;
    }
}
const openMenu = (e: any) => {
    artistMenu.value.openMenu(e);
}
const copyUrl = async (id: string) => {

    try {
        await toClipboard(`https://music.163.com/#/artist?id=${id}`)
        showToast(locale.global.t('toast.copied'));
    } catch (error) {
        showToast(`${locale.global.t('toast.copyFailed')}${error}`);
    }
}
const openInBrowser = (id: string) => {
    const url = `https://music.163.com/#/artist?id=${id}`;
    window.open(url);
}

onActivated(() => {
    if (artist.value?.id?.toString() !== route.params.id) {
        loadData(Number(route.params.id));
    } else {
        restorePosition();
    }
})

onBeforeRouteUpdate((to, from, next) => {
    artist.value.img1v1Url =
        'https://p1.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg';
    loadData(Number(to.params.id), next);
})

</script>

<style lang="scss" scoped>
.artist-page {
    margin-top: 32px;
}

.artist-info {
    display: flex;
    align-items: center;
    margin-bottom: 26px;
    color: var(--color-text);

    img {
        height: 248px;
        width: 248px;
        border-radius: 50%;
        margin-right: 56px;
        box-shadow: rgba(0, 0, 0, 0.2) 0px 12px 16px -8px;
    }

    .name {
        font-size: 56px;
        font-weight: 700;
    }

    .artist {
        font-size: 18px;
        opacity: 0.88;
        margin-top: 24px;
    }

    .statistics {
        font-size: 14px;
        opacity: 0.68;
        margin-top: 2px;
    }

    .buttons {
        margin-top: 26px;
        display: flex;

        .shuffle {
            padding: 8px 11px;

            .svg-icon {
                margin: 0;
            }
        }
    }

    .description {
        user-select: none;
        font-size: 14px;
        opacity: 0.68;
        margin-top: 24px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        cursor: pointer;
        white-space: pre-line;

        &:hover {
            transition: opacity 0.3s;
            opacity: 0.88;
        }
    }
}

.section-title {
    font-weight: 600;
    font-size: 22px;
    opacity: 0.88;
    color: var(--color-text);
    margin-bottom: 16px;
    padding-top: 46px;

    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    a {
        font-size: 13px;
        font-weight: 600;
        opacity: 0.68;
    }
}

.latest-release {
    color: var(--color-text);

    .release {
        display: flex;
    }

    .container {
        display: flex;
        flex: 1;
        align-items: center;
        border-radius: 12px;
    }

    img {
        height: 96px;
        border-radius: 8px;
    }

    .info {
        margin-left: 24px;
    }

    .name {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
    }

    .date {
        font-size: 14px;
        opacity: 0.78;
    }

    .type {
        margin-top: 2px;
        font-size: 12px;
        opacity: 0.68;
    }
}

.popular-tracks {
    .show-more {
        display: flex;

        button {
            padding: 4px 8px;
            margin-top: 8px;
            border-radius: 6px;
            font-size: 12px;
            opacity: 0.78;
            color: var(--color-secondary);
            font-weight: 600;

            &:hover {
                opacity: 1;
            }
        }
    }
}

.similar-artists {
    .section-title {
        margin-bottom: 24px;
    }
}

.latest-mv {
    .cover {
        position: relative;
        transition: transform 0.3s;

        &:hover {
            cursor: pointer;
        }
    }

    img {
        border-radius: 0.75em;
        height: 128px;
        object-fit: cover;
        user-select: none;
    }

    .shadow {
        position: absolute;
        top: 6px;
        height: 100%;
        width: 100%;
        filter: blur(16px) opacity(0.4);
        transform: scale(0.9, 0.9);
        z-index: -1;
        background-size: cover;
        border-radius: 0.75em;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.3s;
    }

    .fade-enter,
    .fade-leave-to

    /* .fade-leave-active below version 2.1.8 */
        {
        opacity: 0;
    }
}

.description-fulltext {
    font-size: 16px;
    margin-top: 24px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: pre-line;
}
</style>
