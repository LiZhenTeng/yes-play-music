<template>
    <div v-show="show">
        <div class="special-playlist">
            <div class="title gradient"> 每日歌曲推荐 </div>
            <div class="subtitle">根据你的音乐口味生成 · 每天6:00更新</div>
        </div>

        <TrackList :tracks="dailyTracks" type="playlist" dbclick-track-func="dailyTracks" />
    </div>
</template>
<script lang="ts" setup>
import { start, done } from 'nprogress';
import { getDailyRecommendTracks } from '@/api/playlist';
import TrackList from '@/components/TrackList.vue';
import { ref, onMounted, inject } from 'vue';
import type { Ref } from 'vue';
import { useIndexStore } from '@/store';
import { storeToRefs } from 'pinia';

const main: Ref<HTMLElement> | undefined = inject('main')

const indexStore = useIndexStore();
const { updateDailyTracks } = indexStore;
const { dailyTracks } = storeToRefs(indexStore);

const show = ref(false);

const loadDailyTracks = async () => {
    const { data } = await getDailyRecommendTracks();
    updateDailyTracks(data.data.dailySongs);
    done();
    show.value = true;
}

onMounted(() => {
    if (dailyTracks.value.length === 0) {
        setTimeout(() => {
            if (!show.value) start();
        }, 1000);
        loadDailyTracks();
    } else {
        show.value = true;
    }
    main?.value.scrollTo(0, 0);
})


</script>