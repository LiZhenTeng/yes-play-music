import { useIndexStore } from "@/store";
import { storeToRefs } from "pinia";
import store from '@/store/store';
import router from "@/router";
import {
    getRecommendPlaylist,
    getDailyRecommendPlaylist,
    getPlaylistDetail,
} from '@/api/playlist';

const indexStore = useIndexStore(store);
const { player, data,useIsAccountLoggedIn } = storeToRefs(indexStore);

const specialPlaylist = [3136952023, 2829883282, 2829816518, 2829896389];

export const useGoToListSource = () => {
    router.push({ path: useGetListSourcePath() });
}

export const useHasListSource = () => {
    return !player.value?.isPersonalFM && player.value.playlistSource.id !== 0;
}


export const useGetListSourcePath = () => {
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

export const useGetRecommendPlayList = async (limit: number, removePrivateRecommand: any) => {
    if (useIsAccountLoggedIn.value) {
        const playlists = await Promise.all([
            getDailyRecommendPlaylist({limit:10}),
            getRecommendPlaylist({ limit }),
        ]);
        let recommend = playlists[0].data?.recommend ?? [];
        if (recommend.length) {
            if (removePrivateRecommand) recommend = recommend.slice(1);
            await replaceRecommendResult(recommend);
        }
        return recommend.concat(playlists[1].data?.result).slice(0, limit);
    } else {
        const response = await getRecommendPlaylist({ limit });
        return response.data?.result;
    }
}
const replaceRecommendResult = async (recommend: any) => {
    for (let r of recommend) {
        if (specialPlaylist.indexOf(r.id) > -1) {
            const data = await getPlaylistDetail(r.id, true);
            const playlist = data.data?.playlist;
            if (playlist) {
                r.name = playlist.name;
                r.picUrl = playlist.coverImgUrl;
            }
        }
    }
}
