<template>
    <div class="track-list">
        <ContextMenu ref="menu">
            <div v-show="type !== 'cloudDisk'" class="item-info">
                <img :src="useResizeImage(rightClickedTrackComputed.al.picUrl, 224)" loading="lazy" />
                <div class="info">
                    <div class="title">{{ rightClickedTrackComputed.name }}</div>
                    <div class="subtitle">{{ rightClickedTrackComputed.ar[0].name }}</div>
                </div>
            </div>
            <hr v-show="type !== 'cloudDisk'" />
            <div class="item" @click="play">{{ $t('contextMenu.play') }}</div>
            <div class="item" @click="addToQueue">{{
                $t('contextMenu.addToQueue')
            }}</div>
            <div v-if="extraContextMenuItem.includes('removeTrackFromQueue')" class="item"
                @click="removeTrackFromQueue">从队列删除</div>
            <hr v-show="type !== 'cloudDisk'" />
            <div v-show="!isRightClickedTrackLiked && type !== 'cloudDisk'" class="item" @click="like">
                {{ $t('contextMenu.saveToMyLikedSongs') }}
            </div>
            <div v-show="isRightClickedTrackLiked && type !== 'cloudDisk'" class="item" @click="like">
                {{ $t('contextMenu.removeFromMyLikedSongs') }}
            </div>
            <div v-if="extraContextMenuItem.includes('removeTrackFromPlaylist')" class="item"
                @click="removeTrackFromPlaylist">从歌单中删除</div>
            <div v-show="type !== 'cloudDisk'" class="item" @click="addTrackToPlaylist">{{
                $t('contextMenu.addToPlaylist')
            }}</div>
            <div v-show="type !== 'cloudDisk'" class="item" @click="copyLink">{{
                $t('contextMenu.copyUrl')
            }}</div>
            <div v-if="extraContextMenuItem.includes('removeTrackFromCloudDisk')" class="item"
                @click="removeTrackFromCloudDisk">从云盘中删除</div>
        </ContextMenu>

        <div :style="listStyles">
            <TrackListItem v-for="(track, index) in tracks" :key="itemKey === 'id' ? track.id : `${track.id}${index}`"
                :track-prop="track" @play-this-list="playThisList" @like-a-track="likeATrack"
                :highlight-playing-track="highlightPlayingTrack"
                @dblclick.native="playThisList(track.id || track.songId)"
                @click.right.native="openMenu($event, track, index)" />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { addOrRemoveTrackFromPlaylist } from '@/api/playlist';
import { cloudDiskTrackDelete } from '@/api/user';
import TrackListItem from '@/components/TrackListItem.vue';
import ContextMenu from '@/components/ContextMenu.vue';
import locale from '@/locale';
import { ref, computed } from 'vue';
import { useIndexStore } from '@/store';
import { storeToRefs } from 'pinia';
import { useResizeImage } from '@/utils/common';
import useClipboard from 'vue-clipboard3'

const { tracks, type, id, dbclickTrackFunc, albumObject, extraContextMenuItem, columnNumber, highlightPlayingTrack, itemKey } = defineProps({
    tracks: {
        type: Array<any>,
        default: () => {
            return [];
        },
    },
    type: {
        type: String,
        default: 'tracklist',
    }, // tracklist | album | playlist | cloudDisk
    id: {
        type: Number,
        default: 0,
    },
    dbclickTrackFunc: {
        type: String,
        default: 'default',
    },
    albumObject: {
        type: Object,
        default: () => {
            return {
                artist: {
                    name: '',
                },
            };
        },
    },
    extraContextMenuItem: {
        type: Array,
        default: () => {
            return [
                // 'removeTrackFromPlaylist'
                // 'removeTrackFromQueue'
                // 'removeTrackFromCloudDisk'
            ];
        },
    },
    columnNumber: {
        type: Number,
        default: 4,
    },
    highlightPlayingTrack: {
        type: Boolean,
        default: true,
    },
    itemKey: {
        type: String,
        default: 'id',
    },
})

const emit = defineEmits(['removeTrack'])
const indexStore = useIndexStore();
const { showToast, likeATrack, updateModal } = indexStore;
const menu = ref();
const { liked, player, useIsAccountLoggedIn } = storeToRefs(indexStore);
const { toClipboard } = useClipboard();

const rightClickedTrack = ref<{ [k: string]: any }>({
    id: 0,
    name: '',
    ar: [{ name: '' }],
    al: { picUrl: '' },
})
const rightClickedTrackIndex = ref(-1);
const listStyles = ref({});

const isRightClickedTrackLiked = computed(() => {
    return liked.value.songs.includes(rightClickedTrack.value?.id);
})
const rightClickedTrackComputed = computed(() => {
    return type === 'cloudDisk'
        ? {
            id: 0,
            name: '',
            ar: [{ name: '' }],
            al: { picUrl: '' },
        }
        : rightClickedTrack.value;
})

const openMenu = (e: any, track: any, index = -1) => {
    rightClickedTrack.value = track;
    rightClickedTrackIndex.value = index;
    menu.value.openMenu(e);
}
const closeMenu = () => {
    rightClickedTrack.value = {
        id: 0,
        name: '',
        ar: [{ name: '' }],
        al: { picUrl: '' },
    };
    rightClickedTrackIndex.value = -1;
}

const playThisList = (trackID: any) => {
    console.log(dbclickTrackFunc)
    if (dbclickTrackFunc === 'default') {
        playThisListDefault(trackID);
    } else if (dbclickTrackFunc === 'none') {
        // do nothing
    } else if (dbclickTrackFunc === 'playTrackOnListByID') {
        player.value.playTrackOnListByID(trackID);
    } else if (dbclickTrackFunc === 'playPlaylistByID') {
        player.value.playPlaylistByID(id, trackID);
    } else if (dbclickTrackFunc === 'playAList') {
        let trackIDs = tracks.map((t) => t.id || t.songId);
        player.value.replacePlaylist(trackIDs, id, 'artist', trackID);
    } else if (dbclickTrackFunc === 'dailyTracks') {
        let trackIDs = tracks.map((t) => t.id);
        player.value.replacePlaylist(trackIDs, '/daily/songs', 'url', trackID);
    } else if (dbclickTrackFunc === 'playCloudDisk') {
        let trackIDs = tracks.map((t: { id: any; songId: any; }) => t.id || t.songId);
        player.value.replacePlaylist(trackIDs, id, 'cloudDisk', trackID);
    }
}
const playThisListDefault = (trackID: any) => {
    console.log(type)
    if (type === 'playlist') {
        player.value.playPlaylistByID(id, trackID);
    } else if (type === 'album') {
        player.value.playAlbumByID(id, trackID);
    } else if (type === 'tracklist') {
        let trackIDs = tracks.map((t) => t.id);
        player.value.replacePlaylist(trackIDs, id, 'artist', trackID);
    }
}
const play = () => {
    player.value.addTrackToPlayNext(rightClickedTrack.value.id, true);
}
const addToQueue = () => {
    player.value.addTrackToPlayNext(rightClickedTrack.value.id);
}
const like = () => {
    likeATrack(rightClickedTrack.value.id);
}
const addTrackToPlaylist = () => {
    if (!useIsAccountLoggedIn.value) {
        showToast(locale.global.t('toast.needToLogin'));
        return;
    }
    updateModal({
        modalName: 'addTrackToPlaylistModal',
        key: 'show',
        value: true,
    });
    updateModal({
        modalName: 'addTrackToPlaylistModal',
        key: 'selectedTrackID',
        value: rightClickedTrack.value.id,
    });
}
const removeTrackFromPlaylist = () => {
    if (!useIsAccountLoggedIn.value) {
        showToast(locale.global.t('toast.needToLogin'));
        return;
    }
    if (confirm(`确定要从歌单删除 ${rightClickedTrack.value.name}？`)) {
        let trackID = rightClickedTrack.value.id;
        addOrRemoveTrackFromPlaylist({
            op: 'del',
            pid: id.toString(),
            tracks: trackID,
        }).then(({ data }) => {
            showToast(
                data.body.code === 200
                    ? locale.global.t('toast.removedFromPlaylist')
                    : data.body.message
            );
            emit('removeTrack', trackID)
        });
    }
}
const copyLink = async () => {
    try {
        await toClipboard(`https://music.163.com/song?id=${rightClickedTrack.value.id}`)
        showToast(locale.global.t('toast.copied'));
    } catch (error) {
        showToast(`${locale.global.t('toast.copyFailed')}${error}`);
    }
}
const removeTrackFromQueue = () => {
    player.value.removeTrackFromQueue(rightClickedTrackIndex.value);
}
const removeTrackFromCloudDisk = () => {
    if (confirm(`确定要从云盘删除 ${rightClickedTrack.value.songName}？`)) {
        let trackID = rightClickedTrack.value.songId;
        cloudDiskTrackDelete(trackID).then(({ data }) => {
            showToast(
                data.code === 200 ? '已将此歌曲从云盘删除' : data.message
            );
            let newCloudDisk = liked.value.cloudDisk.filter(
                t => t.songId !== trackID
            );
            liked.value.cloudDisk = newCloudDisk;
        });
    }
}


if (type === 'tracklist') {
    listStyles.value = {
        display: 'grid',
        gap: '4px',
        gridTemplateColumns: `repeat(${columnNumber}, 1fr)`,
    };
}
</script>