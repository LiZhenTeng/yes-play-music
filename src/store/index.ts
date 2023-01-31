import { defineStore } from 'pinia'
import { likeATrack } from '@/api/track';
import { useIsAccountLoggedIn, useIsLooseLoggedIn } from '@/utils/auth';

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
        playlists: [],
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

    }),
    actions: {
        fetchLikedSongs() {

        },
        fetchLikedSongsWithDetails() {

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
            if (!useIsAccountLoggedIn()) {
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

        }
    }
})