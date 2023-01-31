import { useIndexStore } from '@/store';
import { storeToRefs } from 'pinia';
import store from '@/store/store'

const indexStore = useIndexStore(store);
const { player,showLyrics } = storeToRefs(indexStore);

export function ipcRenderer(vueInstance:any) {

}