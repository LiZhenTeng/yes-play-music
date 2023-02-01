import { defineStore } from 'pinia'
import { likeATrack } from '@/api/track';
import { useGetCookie } from '@/utils/common'
import { useIsLooseLoggedIn } from '@/utils/auth';
import { getPlaylistDetail } from '@/api/playlist';
import { getTrackDetail } from '@/api/track';
import {
    userPlaylist,
    userPlayHistory,
    userLikedSongsIDs,
    likedAlbums,
    likedArtists,
    likedMVs,
    cloudDisk,
    userAccount,
} from '@/api/user';

interface State {
    showLyrics: boolean
    enableScrolling: boolean
    player: any
    settings: any
    data: any
    toast: {
        show: boolean,
        text: string,
        timer: NodeJS.Timeout | null,
    },
    liked: {
        songs: Array<any>,
        songsWithDetails: [], // 只有前12首
        playlists: Array<any>,
        albums: [],
        artists: [],
        mvs: [],
        cloudDisk: [],
        playHistory: {
            weekData: [],
            allData: [],
        },
        [key: string]: any
    }
    modals: {
        addTrackToPlaylistModal: {
            show: boolean,
            selectedTrackID: number,
        },
        newPlaylistModal: {
            show: boolean,
            afterCreateAddTrackID: number,
        },
        [key: string]: any
    },
    dailyTracks: Array<any>
}

export const useIndexStore = defineStore('index', {
    state: (): State => ({
        showLyrics: false,
        enableScrolling: true,
        player: JSON.parse(localStorage.getItem('player') || '{}'),
        settings: JSON.parse(localStorage.getItem('settings') || '{}'),
        data: JSON.parse(localStorage.getItem('data') || '{}'),
        toast: {
            show: false,
            text: '',
            timer: null,
        },
        liked: {
            songs: Array<any>(),
            songsWithDetails: [], // 只有前12首
            playlists: [],
            albums: [],
            artists: [],
            mvs: [],
            cloudDisk: [],
            playHistory: {
                weekData: [],
                allData: [],
            },
        },
        modals: {
            addTrackToPlaylistModal: {
                show: false,
                selectedTrackID: 0,
            },
            newPlaylistModal: {
                show: false,
                afterCreateAddTrackID: 0,
            },
        },
        dailyTracks: []
    }),
    getters: {
        useIsAccountLoggedIn: (state) => {
            return useGetCookie('MUSIC_U') !== undefined &&
                state.data?.value?.loginMode === 'account'
        }
    },
    actions: {
        async fetchLikedSongs() {
            if (!useIsLooseLoggedIn()) return;
            if (this.useIsAccountLoggedIn) {
                const { data } = await userLikedSongsIDs(this.data.user.userId)
                if (data.ids) {
                    this.updateLikedXXX({
                        name: 'songs',
                        data: data.ids,
                    });
                }
            } else {
                // TODO:搜索ID登录的用户
            }
        },
        async fetchLikedSongsWithDetails() {
            if (this.data.likedSongPlaylistID) {
                const { data } = await getPlaylistDetail(this.data.likedSongPlaylistID, true)
                if (data?.playlist?.trackIds?.length === 0) {
                    return new Promise(resolve => {
                        resolve(false);
                    });
                }
                const trackDetail = await getTrackDetail(
                    data?.playlist?.trackIds
                        .slice(0, 12)
                        .map((t: { id: any; }) => t.id)
                        .join(',')
                )
                this.updateLikedXXX({
                    name: 'songsWithDetails',
                    data: trackDetail.data.songs,
                });

            }
        },
        fetchLikedPlaylist() {

        },
        fetchLikedAlbums() {

        },
        fetchLikedArtists() {

        },
        fetchLikedMVs() {

        },
        fetchCloudDisk() {

        },

        toggleLyrics() {

        },
        updateDailyTracks(dailyTracks: Array<any>) {
            this.dailyTracks = dailyTracks;
        },
        updateToast(toast: { show: boolean; text: string; timer: NodeJS.Timeout | null; }) {
            this.toast = toast;
        },
        showToast(text: string) {
            if (this.toast.timer !== null) {
                clearTimeout(this.toast.timer);
                this.updateToast({ show: false, text: '', timer: null });
            }
            this.updateToast({
                show: true,
                text,
                timer: setTimeout(() => {
                    this.updateToast({
                        show: false,
                        text: this.toast.text,
                        timer: null,
                    });
                }, 3200),
            });
        },
        updateLikedXXX({ name, data }: { name: string, data: any }) {
            this.liked[name] = data;
            if (name === 'songs') {
                this.player.sendSelfToIpcMain();
            }
        },
        likeATrack(id: any) {
            if (!this.useIsAccountLoggedIn) {
                this.showToast('此操作需要登录网易云账号');
                return;
            }
            let like = true;
            if (this.liked.songs.includes(id)) like = false;
            likeATrack({ id, like })
                .then(() => {
                    if (like === false) {
                        this.updateLikedXXX({
                            name: 'songs',
                            data: this.liked.songs.filter(d => d !== id),
                        });
                    } else {
                        let newLikeSongs = this.liked.songs;
                        newLikeSongs.push(id);
                        this.updateLikedXXX({
                            name: 'songs',
                            data: newLikeSongs,
                        });
                    }
                    this.fetchLikedSongsWithDetails();
                })
                .catch(() => {
                    this.showToast('操作失败，专辑下架或版权锁定');
                });

        },
        updateModal({ modalName, key, value }: { modalName: string, key: string, value: boolean }) {
            this.modals[modalName][key] = value;
            if (key === 'show') {
                // 100ms的延迟是为等待右键菜单blur之后再disableScrolling
                value === true
                    ? setTimeout(() => (this.enableScrolling = false), 100)
                    : (this.enableScrolling = true);
            }
        },
        updateData({ key, value }: { key: string, value: string }) {
            this.data[key] = value;
        },
    }
})