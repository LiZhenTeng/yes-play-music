<template>
    <div class="next-tracks">
        <h1>{{ $t('next.nowPlaying') }}</h1>
        <TrackList :tracks="[currentTrack]" type="playlist" dbclick-track-func="none" />
        <h1 v-show="playNextList.length > 0">插队播放
            <button @click="player.clearPlayNextList()">清除队列</button>
        </h1>
        <TrackList v-show="playNextList.length > 0" :tracks="playNextTracks" type="playlist"
            :highlight-playing-track="false" dbclick-track-func="playTrackOnListByID" item-key="id+index"
            :extra-context-menu-item="['removeTrackFromQueue']" />
        <h1>{{ $t('next.nextUp') }}</h1>
        <TrackList :tracks="filteredTracks" type="playlist" :highlight-playing-track="false"
            dbclick-track-func="playTrackOnListByID" />
    </div>
</template>
<script lang="ts" setup>
import { getTrackDetail } from '@/api/track';
import TrackList from '@/components/TrackList.vue';
import { useIndexStore } from '@/store';
import { storeToRefs } from 'pinia';
import { ref, computed, watch, onActivated, inject } from 'vue';

const restorePosition: Function | undefined = inject('restorePosition');
const indexStore = useIndexStore();
const { player } = storeToRefs(indexStore);

const tracks = ref<Array<any>>([]);

const currentTrack = computed(() => {
    return player.value.currentTrack;
})
const playerShuffle = computed(() => {
    return player.value.shuffle;
})
const filteredTracks = computed(() => {
    let trackIDs = player.value.list.slice(
        player.value.current + 1,
        player.value.current + 100
    );
    return tracks.value.filter(t => trackIDs.includes(t.id));
})
const playNextList = computed(() => {
    return player.value.playNextList;
})
const playNextTracks = computed(() => {
    return playNextList.value.map((tid: any) => {
        return tracks.value.find(t => t.id === tid);
    });
})

const loadTracks = async () => {
    // 获取播放列表当前歌曲后100首歌
    let trackIDs = player.value.list.slice(
        player.value.current + 1,
        player.value.current + 100
    );

    // 将playNextList的歌曲加进trackIDs
    trackIDs.push(...playNextList.value);

    // 获取已经加载了的歌曲
    let loadedTrackIDs = tracks.value.map(t => t.id);

    if (trackIDs.length > 0) {
        const { data } = await getTrackDetail(trackIDs.join(','))
        let newTracks = data.songs.filter(
            (t: any) => !loadedTrackIDs.includes(t.id)
        );
        tracks.value.push(...newTracks);
    }
}


watch(currentTrack, async () => {
    await loadTracks()
})
watch(playerShuffle, async () => {
    await loadTracks()
})
watch(playNextList, async () => {
    await loadTracks()
})

onActivated(() => {
    loadTracks();
    if (restorePosition)
        restorePosition();
})

</script>
<style lang="scss" scoped>
h1 {
    margin-top: 36px;
    margin-bottom: 18px;
    cursor: default;
    color: var(--color-text);
    display: flex;
    justify-content: space-between;

    button {
        color: var(--color-text);
        border-radius: 8px;
        padding: 0 14px;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: 0.2s;
        opacity: 0.68;
        font-weight: 500;

        &:hover {
            opacity: 1;
            background: var(--color-secondary-bg);
        }

        &:active {
            opacity: 1;
            transform: scale(0.92);
        }
    }
}
</style>