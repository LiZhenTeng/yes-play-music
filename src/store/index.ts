import { defineStore } from 'pinia'
import { likeATrack } from '@/api/track';
import { useGetCookie } from '@/utils/common'
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
        },
        useIsUsernameLoggedIn(state) {
            // 用户名搜索（用户数据为只读）
            return state.data.value?.loginMode === 'username';
        },
        useIsLooseLoggedIn() {
            // 账户登录或者用户名搜索都判断为登录，宽松检查
            return this.useIsAccountLoggedIn || this.useIsUsernameLoggedIn;
        }
    },
    actions: {
        fetchUserProfile() {
            if (!this.useIsAccountLoggedIn) return;
            return userAccount().then(({ data }) => {
                if (data.code === 200) {
                    this.updateData({ key: 'user', value: data.profile });
                }
            });
        },
        async fetchLikedSongs() {
            if (!this.useIsLooseLoggedIn) return;
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
            if (!this.useIsLooseLoggedIn) return;
            if (this.useIsAccountLoggedIn) {
                return userPlaylist({
                    uid: this.data.user?.userId,
                    limit: 2000, // 最多只加载2000个歌单（等有用户反馈问题再修）
                    timestamp: new Date().getTime(),
                }).then(({ data }) => {
                    if (data.playlist) {
                        this.updateLikedXXX({
                            name: 'playlists',
                            data: data.playlist,
                        });
                        // 更新用户”喜欢的歌曲“歌单ID
                        this.updateData({
                            key: 'likedSongPlaylistID',
                            value: data.playlist[0].id,
                        });
                    }
                });
            } else {
                // TODO:搜索ID登录的用户
                return;
            }
        },
        fetchLikedAlbums() {
            if (!this.useIsAccountLoggedIn) return;
            return likedAlbums({ limit: 2000 }).then(result => {
                if (result.data) {
                    this.updateLikedXXX({
                        name: 'albums',
                        data: result.data,
                    });
                }
            });
        },
        fetchLikedArtists() {
            if (!this.useIsAccountLoggedIn) return;
            return likedArtists({ limit: 2000 }).then(result => {
                if (result.data) {
                    this.updateLikedXXX({
                        name: 'artists',
                        data: result.data,
                    });
                }
            });

        },
        fetchLikedMVs() {
            if (!this.useIsAccountLoggedIn) return;
            return likedMVs({ limit: 1000 }).then(result => {
                if (result.data) {
                    this.updateLikedXXX({
                        name: 'mvs',
                        data: result.data,
                    });
                }
            });

        },
        fetchCloudDisk() {
            if (!this.useIsAccountLoggedIn) return;
            // FIXME: #1242
            return cloudDisk({ limit: 1000 }).then(result => {
                if (result.data) {
                    this.updateLikedXXX({
                        name: 'cloudDisk',
                        data: result.data,
                    });
                }
            });
        },
        fetchPlayHistory() {
            if (!this.useIsAccountLoggedIn) return;
            return Promise.all([
                userPlayHistory({ uid: this.data.user?.userId, type: 0 }),
                userPlayHistory({ uid: this.data.user?.userId, type: 1 }),
            ]).then(response => {
                const result = [response[0].data, response[1].data]
                const data = {};
                const dataType: { [key: number | string]: any } = { 0: 'allData', 1: 'weekData' };
                if (result[0] && result[1]) {
                    result.forEach((v, i) => {
                        const songData = v[i][dataType[i]].map((item: any) => {
                            const song = item.song;
                            song.playCount = item.playCount;
                            return song;
                        })
                        Object.defineProperty(data, dataType[i], {
                            value: songData,
                            configurable: true,
                            writable: true
                        })
                    })
                }
            });
        },
        toggleLyrics() {
            this.showLyrics = !this.showLyrics;
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