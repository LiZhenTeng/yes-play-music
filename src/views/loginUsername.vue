<template>
    <div class="login">
        <div>
            <div class="title">{{ $t('login.usernameLogin') }}</div>
            <div class="section">
                <div class="search-box">
                    <div class="container">
                        <svg-icon icon-class="search" />
                        <div class="input">
                            <input v-model="keyword" :placeholder="$t('login.searchHolder')"
                                @keydown.enter="throttleSearch" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="sestion">
                <div v-show="activeUser?.nickname === undefined" class="name">
                    {{ $t('login.enterTip') }}
                </div>
                <div v-show="activeUser
                ?.nickname !== undefined" class="name">
                    {{ $t('login.choose') }}
                </div>
                <div class="user-list">
                    <div v-for="user in result" :key="user.id" class="user"
                        :class="{ active: user.nickname === activeUser?.nickname }" @click="activeUser = user">
                        <img class="head" :src="useResizeImage(user.avatarUrl)" loading="lazy" />
                        <div class="nickname">
                            {{ user.nickname }}
                        </div>
                    </div>
                </div>
            </div>
            <ButtonTwoTone v-show="activeUser?.nickname !== undefined" @click.native="confirm">
                {{ $t('login.confirm') }}
            </ButtonTwoTone>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { done } from 'nprogress';
import { getSearch } from '@/api/others';
import { userPlaylist } from '@/api/user';
import { useThrottle, useResizeImage } from '@/utils/common';
import ButtonTwoTone from '@/components/ButtonTwoTone.vue';
import { ref, reactive, onMounted } from 'vue';
import { useIndexStore } from '@/store';
import { useRouter } from 'vue-router';

const indexStore = useIndexStore();
const { updateData } = indexStore;
const router = useRouter();

const keyword = ref('');
const result = reactive(new Array())
const activeUser = ref();

const search = async () => {
    if (!keyword.value) return;
    const { data } = await getSearch({ keywords: keyword.value, limit: 9, type: 1002 })
    result.push(...data.result.userprofiles);
    activeUser.value = { ...result[0] };
}
const confirm = async () => {
    updateData({ key: 'user', value: activeUser.value });
    updateData({ key: 'loginMode', value: 'username' });
    const { data } = await userPlaylist({
        uid: activeUser.value.userId,
        limit: 1,
    })
    updateData({
        key: 'likedSongPlaylistID',
        value: data.playlist[0].id,
    });
    router.push({ path: '/library' });
}
const throttleSearch = useThrottle(() => {
    search();
}, 500)

onMounted(() => {
    done();
})
</script>

<style lang="scss" scoped>
.login {
    display: flex;
    color: var(--color-text);
}

.title {
    font-size: 42px;
    font-weight: 700;
    margin-bottom: 48px;
}

.sestion {
    margin-top: 18px;

    .name {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
        opacity: 0.78;
    }
}

.search-box {
    .container {
        display: flex;
        align-items: center;
        height: 48px;
        border-radius: 11px;
        width: 326px;
        background: var(--color-primary-bg);
    }

    .svg-icon {
        height: 22px;
        width: 22px;
        color: var(--color-primary);

        margin: {
            left: 12px;
            right: 8px;
        }
    }

    input {
        flex: 1;
        font-size: 22px;
        border: none;
        background: transparent;
        width: 115%;
        font-weight: 600;
        margin-top: -1px;
        color: var(--color-primary);

        &::placeholder {
            color: var(--color-primary);
            opacity: 0.78;
        }
    }
}

.user-list {
    display: flex;
    flex-wrap: wrap;
    margin-top: 24px;
    margin-bottom: 24px;
}

.user {
    margin-right: 16px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    padding: 12px 12px 12px 16px;
    border-radius: 8px;
    width: 256px;
    transition: 0.2s;
    user-select: none;

    .head {
        border-radius: 50%;
        height: 44px;
        width: 44px;
    }

    .nickname {
        font-size: 18px;
        margin-left: 12px;
    }

    &:hover {
        background: var(--color-secondary-bg);
    }
}

.user.active {
    transition: 0.2s;
    background: var(--color-primary-bg);

    .nickname {
        color: var(--color-primary);
    }
}
</style>
