<template>
    <div class="mv-row" :class="{ 'without-padding': withoutPadding }">
        <div v-for="mv in mvs" :key="getID(mv)" class="mv">
            <div class="cover" @mouseover="hoverVideoID = getID(mv)" @mouseleave="hoverVideoID = 0"
                @click="goToMv(getID(mv))">
                <img :src="getUrl(mv)" loading="lazy" />
                <transition name="fade">
                    <div v-show="hoverVideoID === getID(mv)" class="shadow"
                        :style="{ background: 'url(' + getUrl(mv) + ')' }"></div>
                </transition>
            </div>
            <div class="info">
                <div class="title">
                    <router-link :to="'/mv/' + getID(mv)">{{ getTitle(mv) }}</router-link>
                </div>
                <div class="artist" v-html="getSubtitle(mv)"></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useIndexStore } from '@/store';
import { storeToRefs } from 'pinia';
import { ref, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';

const { mvs, subtitle, withoutPadding } = defineProps({
    mvs: Array<any>,
    subtitle: {
        type: String,
        default: 'artist',
    },
    withoutPadding: { type: Boolean, default: false },
})

const router = useRouter();
const indexStore = useIndexStore();
const { player } = storeToRefs(indexStore);
const instance = getCurrentInstance()

const hoverVideoID = ref(0);
const goToMv = (id: number) => {
    let query = {};
    if (instance?.parent?.refs.player !== undefined) {
        query = { autoplay: (instance?.parent?.refs?.player as { [k: string]: any })?.playing };
    }
    router.push({ path: '/mv/' + id, query });
}
const getUrl = (mv: any) => {
    let url = mv.imgurl16v9 ?? mv.cover ?? mv.coverUrl;
    return url.replace(/^http:/, 'https:') + '?param=464y260';
}
const getID = (mv: any) => {
    if (mv.id !== undefined) return mv.id;
    if (mv.vid !== undefined) return mv.vid;
}
const getTitle = (mv: any) => {
    if (mv.name !== undefined) return mv.name;
    if (mv.title !== undefined) return mv.title;
}
const getSubtitle = (mv: any) => {
    if (subtitle === 'artist') {
        let artistName = 'null';
        let artistID = 0;
        if (mv.artistName !== undefined) {
            artistName = mv.artistName;
            artistID = mv.artistId;
        } else if (mv.creator !== undefined) {
            artistName = mv.creator[0].userName;
            artistID = mv.creator[0].userId;
        }
        return `<a href="/#/artist/${artistID}">${artistName}</a>`;
    } else if (subtitle === 'publishTime') {
        return mv.publishTime;
    }
}


</script>

<style lang="scss" scoped>
.mv-row {
    --col-num: 5;
    display: grid;
    grid-template-columns: repeat(var(--col-num), 1fr);
    gap: 36px 24px;
    padding: var(--main-content-padding);
}

.mv-row.without-padding {
    padding: 0;
}

@media (max-width: 900px) {
    .mv-row {
        --col-num: 4;
    }
}

@media (max-width: 800px) {
    .mv-row {
        --col-num: 3;
    }
}

@media (max-width: 700px) {
    .mv-row {
        --col-num: 2;
    }
}

@media (max-width: 550px) {
    .mv-row {
        --col-num: 1;
    }
}

.mv {
    color: var(--color-text);

    .title {
        font-size: 16px;
        font-weight: 600;
        opacity: 0.88;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        word-break: break-all;
    }

    .artist {
        font-size: 12px;
        opacity: 0.68;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
    }
}

.cover {
    position: relative;
    transition: transform 0.3s;

    &:hover {
        cursor: pointer;
    }
}

img {
    border-radius: 0.75em;
    width: 100%;
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
</style>
