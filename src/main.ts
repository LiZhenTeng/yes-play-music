import { createApp } from 'vue'
import store from '@/store/store'
import router from './router'
import i18n from '@/locale';
import App from './App.vue'
import SvgIcon from './components/SvgIcon.vue';
import 'virtual:svg-icons-register'
import '@/assets/css/global.scss';
import '@/assets/css/nprogress.css';
import { useIndexStore } from './store';
import { Player } from './hooks/Player';
import VueSlider from 'vue-slider-component'

const indexStore = useIndexStore(store);


const p = new Player();

indexStore.player = new Proxy(p, {
    set(target: any, prop, val) {
        // console.log({ prop, val });
        target[prop] = val;
        if (prop === '_howler') return true;
        target.saveSelfToLocalStorage();
        target.sendSelfToIpcMain();
        return true;
    },
});


const app = createApp(App);
app.component('SvgIcon', SvgIcon).component('VueSlider', VueSlider);
app.use(i18n).use(store).use(router).mount('#app')

