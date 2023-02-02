<template>
    <Modal class="add-playlist-modal" :show="show" :close="close" title="新建歌单" width="25vw">
        <template slot="default">
            <input v-model="title" type="text" placeholder="歌单标题" maxlength="40" />
            <div class="checkbox">
                <input id="checkbox-private" v-model="privatePlaylist" type="checkbox" />
                <label for="checkbox-private">设置为隐私歌单</label>
            </div>
        </template>
        <template slot="footer">
            <button class="primary block" @click="">创建</button>
        </template>
    </Modal>
</template>
<script lang="ts" setup>
import Modal from '@/components/Modal.vue';
import { createPlaylist, addOrRemoveTrackFromPlaylist } from '@/api/playlist';
import { ref, computed } from 'vue';
import { useIndexStore } from '@/store';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const indexStore = useIndexStore();
const { updateModal, updateData, showToast, fetchLikedPlaylist } = indexStore;
const { modals, enableScrolling } = storeToRefs(indexStore);

const title = ref('');
const privatePlaylist = ref(false);
const privateValue = ref(undefined);

const show = computed({
    get() {
        return modals.value.newPlaylistModal.show;
    },
    set(value) {
        updateModal({
            modalName: 'newPlaylistModal',
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

const close = () => {
    show.value = false;
    title.value = '';
    privatePlaylist.value = false;
    resetAfterCreateAddTrackID();
}
const createPlaylistClk = async () => {
    let params: { name: string, type: number } = { name: title.value, type: 0 };
    if (privateValue.value) params.type = 10;
    const { data } = await createPlaylist({ name: params.name, type: params.type });
    if (data.code === 200) {
        if (modals.value.newPlaylistModal.afterCreateAddTrackID !== 0) {
            const AorRData = await addOrRemoveTrackFromPlaylist({
                op: 'add',
                pid: data.id,
                tracks: modals.value.newPlaylistModal.afterCreateAddTrackID,
            })
            if (AorRData.data.body.code === 200) {
                showToast(t('toast.savedToPlaylist'));
            } else {
                showToast(AorRData.data.body.message);
            }
            resetAfterCreateAddTrackID();

        }
        close();
        showToast('成功创建歌单');
        updateData({ key: 'libraryPlaylistFilter', value: 'mine' });
        fetchLikedPlaylist();
    }

}
const resetAfterCreateAddTrackID = () => {
    updateModal({
        modalName: 'newPlaylistModal',
        key: 'AfterCreateAddTrackID',
        value: Boolean(0),
    });
}


</script>
<style lang="scss" scoped>
.add-playlist-modal {
    .content {
        display: flex;
        flex-direction: column;

        input {
            margin-bottom: 12px;
        }

        input[type='text'] {
            width: calc(100% - 24px);
            flex: 1;
            background: var(--color-secondary-bg-for-transparent);
            font-size: 16px;
            border: none;
            font-weight: 600;
            padding: 8px 12px;
            border-radius: 8px;
            margin-top: -1px;
            color: var(--color-text);

            &:focus {
                background: var(--color-primary-bg-for-transparent);
                opacity: 1;
            }

            [data-theme='light'] &:focus {
                color: var(--color-primary);
            }
        }

        .checkbox {
            input[type='checkbox' i] {
                margin: 3px 3px 3px 4px;
            }

            display: flex;
            align-items: center;

            label {
                font-size: 12px;
            }

            user-select: none;
        }
    }
}
</style>
