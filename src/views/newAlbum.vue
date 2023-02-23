<template>
    <div class="newAlbum">
        <h1>{{ $t('home.newAlbum') }}</h1>
        <div class="playlist-row">
            <div class="playlists">
                <CoverRow type="album" :items="albums" sub-text="artist" :show-play-button="true" />
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { getNewAlbums } from '@/api/album';
import { done } from 'nprogress';

import CoverRow from '@/components/CoverRow.vue';
import { ref } from 'vue';

const albums = ref<Array<any>>([]);
const { data } = await getNewAlbums({
    area: 'EA',
    limit: 100,
})
albums.value = data.albums;
done();

</script>
<style lang="scss" scoped>
h1 {
    color: var(--color-text);
    font-size: 56px;
}
</style>