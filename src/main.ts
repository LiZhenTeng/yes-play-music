import { createApp } from 'vue'
import store from '@/store/store'
import router from './router'
import i18n from '@/locale';
import './style.css'
import App from './App.vue'

createApp(App).use(i18n).use(store).use(router).mount('#app')

