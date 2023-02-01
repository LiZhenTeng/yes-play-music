<template>
    <Modal class="add-track-to-playlist-modal" :show="show" :close="close" :show-footer="false" title="添加到歌单"
        width="25vw">
        <template slot="default">
            <div class="new-playlist-button" @click="newPlaylist"><svg-icon icon-class="plus" />新建歌单</div>
            <div v-for="playlist in ownPlaylists" :key="playlist.id" class="playlist"
                @click="addTrackToPlaylist(playlist.id)">
                <img :src="useResizeImage(playlist.coverImgUrl, 224)" loading="lazy" />
                <div class="info">
                    <div class="title">{{ playlist.name }}</div>
                    <div class="track-count">{{ playlist.trackCount }} 首</div>
                </div>
            </div>
        </template>
    </Modal>
</template>
<script lang="ts" setup>
import Modal from '@/components/Modal.vue';
import locale from '@/locale';
import { reactive, computed } from 'vue';
import { useIndexStore } from '@/store/index'
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
/* import { useResizeImage } from '@/utils/common' */
import { addOrRemoveTrackFromPlaylist } from '@/api/playlist';

const useResizeImage=(a:string,b:number)=>'';
const { t } = useI18n();
const indexStore = useIndexStore();
const { updateModal, showToast } = indexStore;
const { modals, data, liked, enableScrolling } = storeToRefs(indexStore);

const playlists = reactive<Array<any>>([]);
const show = computed({
    get() {
        return modals.value.addTrackToPlaylistModal.show;
    },
    set(value) {
        updateModal({
            modalName: 'addTrackToPlaylistModal',
            key: 'show',
            value,
        });
        if (value) {
            enableScrolling.value = false;
        } else {
            enableScrolling.value = true;
        }
    }
})
const ownPlaylists = computed(() => {
    return liked.value.playlists.filter(
        p =>
            p.creator.userId === data.value.user.userId &&
            p.id !== data.value.likedSongPlaylistID
    );
})
const close = () => {
    show.value = false;
}

const addTrackToPlaylist = async (playlistID: string) => {
    const { data } = await addOrRemoveTrackFromPlaylist({
        op: 'add',
        pid: playlistID,
        tracks: modals.value.addTrackToPlaylistModal.selectedTrackID,
    })
    if (data.body.code === 200) {
        show.value = false;
        showToast(t('toast.savedToPlaylist'));
    } else {
        showToast(data.body.message);
    }

}
const newPlaylist = () => {
    updateModal({
        modalName: 'newPlaylistModal',
        key: 'afterCreateAddTrackID',
        value: Boolean(modals.value.addTrackToPlaylistModal.selectedTrackID),
    });
    close();
    updateModal({
        modalName: 'newPlaylistModal',
        key: 'show',
        value: true,
    });
}


</script>
<style lang="scss" scoped>
.new-playlist-button {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text);
    background: var(--color-secondary-bg-for-transparent);
    border-radius: 8px;
    height: 48px;
    margin-bottom: 16px;
    margin-right: 6px;
    margin-left: 6px;
    cursor: pointer;
    transition: 0.2s;

    .svg-icon {
        width: 16px;
        height: 16px;
        margin-right: 8px;
    }

    &:hover {
        color: var(--color-primary);
        background: var(--color-primary-bg-for-transparent);
    }
}

.playlist {
    display: flex;
    padding: 6px;
    border-radius: 8px;
    cursor: pointer;

    &:hover {
        background: var(--color-secondary-bg-for-transparent);
    }

    img {
        border-radius: 8px;
        height: 42px;
        width: 42px;
        margin-right: 12px;
        border: 1px solid rgba(0, 0, 0, 0.04);
    }

    .info {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .title {
        font-size: 16px;
        font-weight: 500;
        color: var(--color-text);
        padding-right: 16px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
        word-break: break-all;
    }

    .track-count {
        margin-top: 2px;
        font-size: 13px;
        opacity: 0.68;
        color: var(--color-text);
    }
}
</style>
