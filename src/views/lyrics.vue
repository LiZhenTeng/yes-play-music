<template>
    <transition name="slide-up">
        <div class="lyrics-page" :class="{ 'no-lyric': noLyric }" :data-theme="theme">
            <div v-if="
                (settings.lyricsBackground === 'blur') |
                (settings.lyricsBackground === 'dynamic')
            " class="lyrics-background" :class="{
    'dynamic-background': settings.lyricsBackground === 'dynamic',
}">
                <div class="top-right" :style="{ backgroundImage: `url(${bgImageUrl})` }" />
                <div class="bottom-left" :style="{ backgroundImage: `url(${bgImageUrl})` }" />
            </div>
            <div v-if="settings.lyricsBackground === true" class="gradient-background" :style="{ background }"></div>

            <div class="left-side">
                <div>
                    <div v-if="settings.showLyricsTime" class="date">
                        {{ date }}
                    </div>
                    <div class="cover">
                        <div class="cover-container">
                            <img :src="imageUrl" loading="lazy" />
                            <div class="shadow" :style="{ backgroundImage: `url(${imageUrl})` }"></div>
                        </div>
                    </div>
                    <div class="controls">
                        <div class="top-part">
                            <div class="track-info">
                                <div class="title" :title="currentTrack.name">
                                    <router-link v-if="hasList()" :to="`${getListPath()}`"
                                        @click.native="toggleLyrics">{{ currentTrack.name }}
                                    </router-link>
                                    <span v-else>
                                        {{ currentTrack.name }}
                                    </span>
                                </div>
                                <div class="subtitle">
                                    <router-link v-if="artist.id !== 0" :to="`/artist/${artist.id}`"
                                        @click.native="toggleLyrics">{{ artist.name }}
                                    </router-link>
                                    <span v-else>
                                        {{ artist.name }}
                                    </span>
                                    <span v-if="album.id !== 0">
                                        -
                                        <router-link :to="`/album/${album.id}`" :title="album.name"
                                            @click.native="toggleLyrics">{{ album.name }}
                                        </router-link>
                                    </span>
                                </div>
                            </div>
                            <div class="top-right">
                                <div class="volume-control">
                                    <button-icon :title="$t('player.mute')" @click.native="mute">
                                        <svg-icon v-show="volume > 0.5" icon-class="volume" />
                                        <svg-icon v-show="volume === 0" icon-class="volume-mute" />
                                        <svg-icon v-show="volume <= 0.5 && volume !== 0" icon-class="volume-half" />
                                    </button-icon>
                                    <div class="volume-bar">
                                        <vue-slider v-model="volume" :min="0" :max="1" :interval="0.01"
                                            :drag-on-click="true" :duration="0" tooltip="none"
                                            :dot-size="12"></vue-slider>
                                    </div>
                                </div>
                                <div class="buttons">
                                    <button-icon :title="$t('player.like')"
                                        @click.native="likeATrack(player.currentTrack.id)">
                                        <svg-icon :icon-class="
                                            player.isCurrentTrackLiked ? 'heart-solid' : 'heart'
                                        " />
                                    </button-icon>
                                    <button-icon :title="$t('contextMenu.addToPlaylist')" @click.native="addToPlaylist">
                                        <svg-icon icon-class="plus" />
                                    </button-icon>
                                    <!-- <button-icon @click.native="openMenu" title="Menu"
                    ><svg-icon icon-class="more"
                  /></button-icon> -->
                                </div>
                            </div>
                        </div>
                        <div class="progress-bar">
                            <span>{{ formatTrackTime(player.progress) || '0:00' }}</span>
                            <div class="slider">
                                <vue-slider v-model="player.progress" :min="0" :max="player.currentTrackDuration"
                                    :interval="1" :drag-on-click="true" :duration="0" :dot-size="12" :height="2"
                                    :tooltip-formatter="formatTrackTime" :lazy="true" :silent="true"></vue-slider>
                            </div>
                            <span>{{ formatTrackTime(player.currentTrackDuration) }}</span>
                        </div>
                        <div class="media-controls">
                            <button-icon v-show="!player.isPersonalFM" :title="
                                player.repeatMode === 'one'
                                    ? $t('player.repeatTrack')
                                    : $t('player.repeat')
                            " :class="{ active: player.repeatMode !== 'off' }" @click.native="switchRepeatMode">
                                <svg-icon v-show="player.repeatMode !== 'one'" icon-class="repeat" />
                                <svg-icon v-show="player.repeatMode === 'one'" icon-class="repeat-1" />
                            </button-icon>
                            <div class="middle">
                                <button-icon v-show="!player.isPersonalFM" :title="$t('player.previous')"
                                    @click.native="playPrevTrack">
                                    <svg-icon icon-class="previous" />
                                </button-icon>
                                <button-icon v-show="player.isPersonalFM" title="不喜欢" @click.native="moveToFMTrash">
                                    <svg-icon icon-class="thumbs-down" />
                                </button-icon>
                                <button-icon id="play" :title="$t(player.playing ? 'player.pause' : 'player.play')"
                                    @click.native="playOrPause">
                                    <svg-icon :icon-class="player.playing ? 'pause' : 'play'" />
                                </button-icon>
                                <button-icon :title="$t('player.next')" @click.native="playNextTrack">
                                    <svg-icon icon-class="next" />
                                </button-icon>
                            </div>
                            <button-icon v-show="!player.isPersonalFM" :title="$t('player.shuffle')"
                                :class="{ active: player.shuffle }" @click.native="switchShuffle">
                                <svg-icon icon-class="shuffle" />
                            </button-icon>
                        </div>
                    </div>
                </div>
            </div>
            <div class="right-side">
                <transition name="slide-fade">
                    <div v-show="!noLyric" ref="lyricsContainer" class="lyrics-container" :style="lyricFontSize">
                        <div id="line-1" class="line"></div>
                        <div v-for="(line, index) in lyricWithTranslation" :id="`line${index}`" :key="index"
                            class="line" :class="{
                                highlight: highlightLyricIndex === index,
                            }" @click="clickLyricLine(line.time)" @dblclick="clickLyricLine(line.time, true)">
                            <div class="content">
                                <span v-if="line.contents[0]">{{ line.contents[0] }}</span>
                                <br />
                                <span v-if="
                                    line.contents[1] &&
                                    $store.state.settings.showLyricsTranslation
                                " class="translation">{{ line.contents[1] }}</span>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>
            <div class="close-button" @click="toggleLyrics">
                <button>
                    <svg-icon icon-class="arrow-down" />
                </button>
            </div>
        </div>
    </transition>

</template>
<script lang="ts" setup>
import { formatTrackTime } from '@/utils/common';
import { getLyric } from '@/api/track';
import { lyricParser } from '@/utils/lyrics';
import ButtonIcon from '@/components/ButtonIcon.vue';
import * as Vibrant from 'node-vibrant/dist/vibrant.worker.min.js';
import Color from 'color';
import { useIsAccountLoggedIn } from '@/utils/auth';
import { useHasListSource, useGetListSourcePath } from '@/utils/playList';
import locale from '@/locale';

</script>

<style lang="scss" scoped>
.lyrics-page {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: 200;
    background: var(--color-body-bg);
    display: flex;
    clip: rect(auto, auto, auto, auto);
}

.lyrics-background {
    --contrast-lyrics-background: 75%;
    --brightness-lyrics-background: 150%;
}

[data-theme='dark'] .lyrics-background {
    --contrast-lyrics-background: 125%;
    --brightness-lyrics-background: 50%;
}

.lyrics-background {
    filter: blur(50px) contrast(var(--contrast-lyrics-background)) brightness(var(--brightness-lyrics-background));
    position: absolute;
    height: 100vh;
    width: 100vw;

    .top-right,
    .bottom-left {
        z-index: 0;
        width: 140vw;
        height: 140vw;
        opacity: 0.6;
        position: absolute;
        background-size: cover;
    }

    .top-right {
        right: 0;
        top: 0;
        mix-blend-mode: luminosity;
    }

    .bottom-left {
        left: 0;
        bottom: 0;
        animation-direction: reverse;
        animation-delay: 10s;
    }
}

.dynamic-background>div {
    animation: rotate 150s linear infinite;
}

@keyframes rotate {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.gradient-background {
    position: absolute;
    height: 100vh;
    width: 100vw;
}

.left-side {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    margin-right: 32px;
    margin-top: 24px;
    align-items: center;
    transition: all 0.5s;

    z-index: 1;

    .date {
        max-width: 54vh;
        margin: 24px 0;
        color: var(--color-text);
        text-align: center;
        font-size: 4rem;
        font-weight: 600;
        opacity: 0.88;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
    }

    .controls {
        max-width: 54vh;
        margin-top: 24px;
        color: var(--color-text);

        .title {
            margin-top: 8px;
            font-size: 1.4rem;
            font-weight: 600;
            opacity: 0.88;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            overflow: hidden;
        }

        .subtitle {
            margin-top: 4px;
            font-size: 1rem;
            opacity: 0.58;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            overflow: hidden;
        }

        .top-part {
            display: flex;
            justify-content: space-between;

            .top-right {
                display: flex;
                justify-content: space-between;

                .volume-control {
                    margin: 0 10px;
                    display: flex;
                    align-items: center;

                    .volume-bar {
                        width: 84px;
                    }
                }

                .buttons {
                    display: flex;
                    align-items: center;

                    button {
                        margin: 0 0 0 4px;
                    }

                    .svg-icon {
                        height: 18px;
                        width: 18px;
                    }
                }
            }
        }

        .progress-bar {
            margin-top: 22px;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .slider {
                width: 100%;
                flex-grow: grow;
                padding: 0 10px;
            }

            span {
                font-size: 15px;
                opacity: 0.58;
                min-width: 28px;
            }
        }

        .media-controls {
            display: flex;
            justify-content: center;
            margin-top: 18px;
            align-items: center;

            button {
                margin: 0;
            }

            .svg-icon {
                opacity: 0.38;
                height: 14px;
                width: 14px;
            }

            .active .svg-icon {
                opacity: 0.88;
            }

            .middle {
                padding: 0 16px;
                display: flex;
                align-items: center;

                button {
                    margin: 0 8px;
                }

                button#play .svg-icon {
                    height: 28px;
                    width: 28px;
                    padding: 2px;
                }

                .svg-icon {
                    opacity: 0.88;
                    height: 22px;
                    width: 22px;
                }
            }
        }
    }
}

.cover {
    position: relative;

    .cover-container {
        position: relative;
    }

    img {
        border-radius: 0.75em;
        width: 54vh;
        height: 54vh;
        user-select: none;
        object-fit: cover;
    }

    .shadow {
        position: absolute;
        top: 12px;
        height: 54vh;
        width: 54vh;
        filter: blur(16px) opacity(0.6);
        transform: scale(0.92, 0.96);
        z-index: -1;
        background-size: cover;
        border-radius: 0.75em;
    }
}

.right-side {
    flex: 1;
    font-weight: 600;
    color: var(--color-text);
    margin-right: 24px;
    z-index: 0;

    .lyrics-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        padding-left: 78px;
        max-width: 460px;
        overflow-y: auto;
        transition: 0.5s;
        scrollbar-width: none; // firefox

        .line {
            margin: 2px 0;
            padding: 12px 18px;
            transition: 0.5s;
            border-radius: 12px;

            &:hover {
                background: var(--color-secondary-bg-for-transparent);
            }

            .content {
                transform-origin: center left;
                transform: scale(0.95);
                transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);

                span {
                    opacity: 0.28;
                    cursor: default;
                    font-size: 1em;
                    transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                span.translation {
                    opacity: 0.2;
                    font-size: 0.925em;
                }
            }
        }

        .line#line-1:hover {
            background: unset;
        }

        .translation {
            margin-top: 0.1em;
        }

        .highlight div.content {
            transform: scale(1);

            span {
                opacity: 0.98;
                display: inline-block;
            }

            span.translation {
                opacity: 0.65;
            }
        }
    }

    ::-webkit-scrollbar {
        display: none;
    }

    .lyrics-container .line:first-child {
        margin-top: 50vh;
    }

    .lyrics-container .line:last-child {
        margin-bottom: calc(50vh - 128px);
    }
}

.close-button {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 300;
    border-radius: 0.75rem;
    height: 44px;
    width: 44px;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.28;
    transition: 0.2s;
    -webkit-app-region: no-drag;

    .svg-icon {
        color: var(--color-text);
        padding-top: 5px;
        height: 22px;
        width: 22px;
    }

    &:hover {
        background: var(--color-secondary-bg-for-transparent);
        opacity: 0.88;
    }
}

.lyrics-page.no-lyric {
    .left-side {
        transition: all 0.5s;
        transform: translateX(27vh);
        margin-right: 0;
    }
}

@media (max-aspect-ratio: 10/9) {
    .left-side {
        display: none;
    }

    .right-side .lyrics-container {
        max-width: 100%;
    }
}

@media screen and (min-width: 1200px) {
    .right-side .lyrics-container {
        max-width: 600px;
    }
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.4s;
}

.slide-up-enter,
.slide-up-leave-to

/* .fade-leave-active below version 2.1.8 */
    {
    transform: translateY(100%);
}

.slide-fade-enter-active {
    transition: all 0.5s ease;
}

.slide-fade-leave-active {
    transition: all 0.5s cubic-bezier(0.2, 0.2, 0, 1);
}

.slide-fade-enter,
.slide-fade-leave-to {
    transform: translateX(27vh);
    opacity: 0;
}
</style>
