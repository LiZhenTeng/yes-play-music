<template>
    <div class="lastfm-callback">
        <div class="section-1">
            <img src="/img/logos/yesplaymusic.png" />
            <svg-icon icon-class="x"></svg-icon>
            <img src="/img/logos/lastfm.png" />
        </div>
        <div class="message">{{ message }}</div>
        <button v-show="done" @click="close"> 完成 </button>
    </div>
</template>

<script lang="ts" setup>
import { authGetSession } from '@/api/lastfm';
import { useIndexStore } from '@/store';
import { storeToRefs } from 'pinia';
import { ref, onMounted } from 'vue';

const indexStore = useIndexStore();
const { lastfm } = storeToRefs(indexStore);

const message = ref('请稍等...');
const done = ref(false);

const close = () => {
    window.close();
}

onMounted(async () => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
        message.value = '连接失败，请重试或联系开发者（无Token）';
        done.value = true;
        return;
    }
    const { data } = await authGetSession(token)
    if (!data.data.session) {
        message.value = '连接失败，请重试或联系开发者（无Session）';
        done.value = true;
        return;
    }
    localStorage.setItem('lastfm', JSON.stringify(data.data.session));
    lastfm.value = data.data.session;
    message.value = '已成功连接到 Last.fm';
    done.value = true;

})
</script>

<style lang="scss" scoped>
.lastfm-callback {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 192px);
}

.section-1 {
    margin-bottom: 16px;
    display: flex;
    align-items: center;

    img {
        height: 64px;
        margin: 20px;
    }

    .svg-icon {
        height: 24px;
        width: 24px;
        color: rgba(82, 82, 82, 0.28);
    }
}

.message {
    font-size: 1.4rem;
    font-weight: 500;
    color: var(--color-text);
}

button {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 600;
    background-color: var(--color-primary-bg);
    color: var(--color-primary);
    border-radius: 8px;
    margin-top: 24px;
    transition: 0.2s;
    padding: 8px 16px;

    &:hover {
        transform: scale(1.06);
    }

    &:active {
        transform: scale(0.94);
    }
}
</style>
