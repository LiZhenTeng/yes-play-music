<template>
    <div class="mv-page">
        <div class="current-video">
            <div class="video">
                <video ref="videoPlayer" class="plyr"></video>
            </div>
            <div class="video-info">
                <div class="title">
                    <router-link :to="'/artist/' + mv.data.artistId">{{
                        mv.data.artistName
                    }}</router-link>
                    -
                    {{ mv.data.name }}
                    <div class="buttons">
                        <button-icon class="button" @click.native="likeMV">
                            <svg-icon v-if="mv.subed" icon-class="heart-solid"></svg-icon>
                            <svg-icon v-else icon-class="heart"></svg-icon>
                        </button-icon>
                        <button-icon class="button" @click.native="openMenu">
                            <svg-icon icon-class="more"></svg-icon>
                        </button-icon>
                    </div>
                </div>
                <div class="info">
                    {{ useFormatPlayCount(mv.data.playCount) }} Views ·
                    {{ mv.data.publishTime }}
                </div>
            </div>
        </div>
        <div class="more-video">
            <div class="section-title">{{ $t('mv.moreVideo') }}</div>
            <MvRow :mvs="simiMvs" />
        </div>
        <ContextMenu ref="mvMenu">
            <div class="item" @click="copyUrl(mv.data.id)">{{
                $t('contextMenu.copyUrl')
            }}</div>
            <div class="item" @click="openInBrowser(mv.data.id)">{{
                $t('contextMenu.openInBrowser')
            }}</div>
        </ContextMenu>
    </div>
</template>
<script lang="ts" setup>
import { getMvDetail, getMvUrl, getSimiMv, likeAMV } from '@/api/mv';
import { done } from 'nprogress';
import locale from '@/locale';
import '@/assets/css/plyr.css';
import Plyr from 'plyr';
import { useFormatPlayCount } from '@/utils/common';

import ButtonIcon from '@/components/ButtonIcon.vue';
import ContextMenu from '@/components/ContextMenu.vue';
import MvRow from '@/components/MvRow.vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import { useIndexStore } from '@/store';
import { storeToRefs } from 'pinia';
import useClipboard from 'vue-clipboard3'

const { toClipboard } = useClipboard();
const route = useRoute();
const indexStore = useIndexStore();
const { showToast } = indexStore;
const { player, useIsAccountLoggedIn } = storeToRefs(indexStore);

const mv = ref<{ [k: string]: any }>({
    url: '',
    data: {
        name: '',
        artistName: '',
        playCount: '',
        publishTime: '',
    },
})
const p = ref<Plyr | null>(null);
const simiMvs = ref<Array<any>>([]);
const videoPlayer = ref();
const mvMenu = ref();

const getData = async (id: number) => {
    const { data } = await getMvDetail(id)
    mv.value = data;
    let requests = data.data.brs.map((br: any) => {
        return getMvUrl({ id, r: br.br });
    });

    Promise.all(requests).then(results => {
        let sources = results.map(result => {
            return {
                src: result.data.data.url.replace(/^http:/, 'https:'),
                type: 'video/mp4',
                size: result.data.r,
            };
        });
        if (p.value)
            p.value.source = {
                type: 'video',
                title: mv.value.data.name,
                sources: sources,
                poster: mv.value.data.cover.replace(/^http:/, 'https:'),
            };
        done();
    });
    const s = await getSimiMv(id)
    simiMvs.value = s.data.mvs;
}
const likeMV = async () => {
    if (!useIsAccountLoggedIn.value) {
        showToast(locale.global.t('toast.needToLogin'));
        return;
    }
    const { data } = await likeAMV({
        mvid: mv.value.data.id,
        t: mv.value.subed ? 0 : 1,
    })
    if (data.code === 200) mv.value.subed = !mv.value.subed;
}
const openMenu = (e: any) => {
    mvMenu.value.openMenu(e);
}
const copyUrl = async (id: number | string) => {
    try {
        await toClipboard(`https://music.163.com/#/mv?id=${id}`)
        showToast(locale.global.t('toast.copied'));
    } catch (error) {
        showToast(`${locale.global.t('toast.copyFailed')}${error}`);
    }
}
const openInBrowser = (id: number | string) => {
    const url = `https://music.163.com/#/mv?id=${id}`;
    window.open(url);
}

onMounted(() => {
    let videoOptions = {
        settings: ['quality'],
        autoplay: false,
        quality: {
            default: 1080,
            options: [1080, 720, 480, 240],
        },
    };
    if (route.query.autoplay === 'true') videoOptions.autoplay = true;
    p.value = new Plyr(videoPlayer.value, videoOptions);
    if (p.value) {
        p.value.volume = player.value.volume;
        p.value.on('playing', () => {
            player.value.pause();
        });
    }
    getData(Number(route.params.id));
})

onBeforeRouteLeave((to, from, next) => {
    console.log(1)
    getData(Number(to.params.id));
    next();
})
</script>

<style lang="scss" scoped>
.video {
    --plyr-color-main: #335eea;
    --plyr-control-radius: 8px;
}

.mv-page {
    width: 100%;
    margin-top: 32px;
}

.current-video {
    width: 100%;
}

.video {
    border-radius: 16px;
    background: transparent;
    overflow: hidden;
    max-height: 100vh;
}

.video-info {
    margin-top: 12px;
    color: var(--color-text);

    .title {
        font-size: 24px;
        font-weight: 600;
    }

    .artist {
        font-size: 14px;
        opacity: 0.88;
        margin-top: 2px;
        font-weight: 600;
    }

    .info {
        font-size: 12px;
        opacity: 0.68;
        margin-top: 12px;
    }
}

.more-video {
    margin-top: 48px;

    .section-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-text);
        opacity: 0.88;
        margin-bottom: 12px;
    }
}

.buttons {
    display: inline-block;

    .button {
        display: inline-block;
    }

    .svg-icon {
        height: 18px;
        width: 18px;
        color: var(--color-primary);
    }
}
</style>
