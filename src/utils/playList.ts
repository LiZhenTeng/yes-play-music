import { useIndexStore } from "@/store";
import { storeToRefs } from "pinia";
import store from '@/store/store';
import router from "@/router";

const indexStore = useIndexStore(store);
const { player, data } = storeToRefs(indexStore);

const specialPlaylist = [3136952023, 2829883282, 2829816518, 2829896389];

export const useGoToListSource = () => {
    router.push({ path: useGetListSourcePath() });
}

export const useHasListSource = () => {
    return !player.value?.isPersonalFM && player.value.playlistSource.id !== 0;
}

export function useGetListSourcePath() {
    if (player.value.playlistSource.id === data.value?.likedSongPlaylistID) {
        return '/library/liked-songs';
    } else if (player.value?.playlistSource.type === 'url') {
        return player.value?.playlistSource.id;
    } else if (player.value?.playlistSource.type === 'cloudDisk') {
        return '/library';
    } else {
        return `/${player.value?.playlistSource.type}/${player.value?.playlistSource.id}`;
    }
}
