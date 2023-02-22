<template>
  <Scrollbar @user-select-none="(e: boolean) => { userSelectNone = e }" v-show="!showLyrics" ref="scrollbar" />
  <Navbar v-show="showNavbar" ref="navbar" />
  <main ref="main" :style="{ overflow: enableScrolling ? 'auto' : 'hidden' }" @scroll="handleScroll">
    <router-view v-slot="{ Component }" v-if="$route.meta.keepAlive">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
  </main>
  <transition name="slide-up">
    <Player v-if="enablePlayer" v-show="showPlayer" ref="player" />
  </transition>
  <Toast />
  <ModalAddTrackToPlaylist v-if="useIsAccountLoggedIn" />
  <ModalNewPlaylist v-if="useIsAccountLoggedIn" />
  <transition v-if="enablePlayer" name="slide-up">
    <Lyrics v-show="showLyrics" />
  </transition>
</template>
<script lang="ts" setup>
import { ref, computed, getCurrentInstance, onMounted,provide } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useIndexStore } from '@/store'
import ModalAddTrackToPlaylist from './components/ModalAddTrackToPlaylist.vue';
import ModalNewPlaylist from './components/ModalNewPlaylist.vue';
import Scrollbar from './components/Scrollbar.vue';
import Navbar from './components/Navbar.vue';
import Player from './components/Player.vue';
import Toast from './components/Toast.vue';
import { ipcRenderer } from './electron/ipcRenderer';
import Lyrics from './views/lyrics.vue';

const instance = getCurrentInstance();
const route = useRoute();
const indexStore = useIndexStore();
const { fetchLikedPlaylist, fetchLikedSongs, fetchLikedSongsWithDetails, fetchCloudDisk, fetchLikedAlbums, fetchLikedArtists, fetchLikedMVs, player } = indexStore;
const { showLyrics, enableScrolling, useIsAccountLoggedIn, useIsLooseLoggedIn } = storeToRefs(indexStore);

const isElectron = ref(process.env.IS_ELECTRON);
const userSelectNone = ref(false);
const scrollbar = ref();
const main =ref();

const showPlayer = computed(() => {
  return (
    [
      'mv',
      'loginUsername',
      'login',
      'loginAccount',
      'lastfmCallback',
    ].includes(route.name?.toString() || '') === false
  );
})
const enablePlayer = computed(() => {
  return player?.enabled && route.name !== 'lastfmCallback';
})

const showNavbar = computed(() => {
  return route.name !== 'lastfmCallback';
})
const handleKeydown = (e: any) => {
  if (e.code === 'Space') {
    if (e.target.tagName === 'INPUT') return false;
    if (route.name === 'mv') return false;
    e.preventDefault();
    player?.playOrPause();
  }
}
const fetchData = () => {
  if (!useIsLooseLoggedIn) return;
  fetchLikedSongs();
  fetchLikedSongsWithDetails();
  fetchLikedPlaylist();
  if (useIsAccountLoggedIn) {
    fetchLikedAlbums();
    fetchLikedArtists();
    fetchLikedMVs();
    fetchCloudDisk();
  }
}
const handleScroll = () => {
  if (scrollbar.value?.handleScroll)
    scrollbar.value?.handleScroll();
}

onMounted(() => {
  provide('main',main)
  if (isElectron) ipcRenderer(instance);
  window.addEventListener('keydown', handleKeydown);
  fetchData();
})

</script>
<style lang="scss">
#app {
  width: 100%;
  transition: all 0.4s;
}

main {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  overflow: auto;
  padding: 64px 10vw 96px 10vw;
  box-sizing: border-box;
  scrollbar-width: none; // firefox
}

@media (max-width: 1336px) {
  main {
    padding: 64px 5vw 96px 5vw;
  }
}

main::-webkit-scrollbar {
  width: 0px;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s;
}

.slide-up-enter,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>