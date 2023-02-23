declare module 'node-vibrant/dist/vibrant.worker.min.js';
declare module 'dayjs';
declare module 'plyr';
declare module 'change-case';
declare module "virtual:pwa-register/vue" {
    import { Ref } from "vue";
    type RegisterSWOptions = {
        immediate?: boolean;
        onNeedRefresh?: () => void;
        onOfflineReady?: () => void;
    };

    function useRegisterSW(
        options?: RegisterSWOptions
    ): {
        needRefresh: Ref<boolean>;
        offlineReady: Ref<boolean>;
        updateServiceWorker(reloadPage?: boolean): void;
    };
}
declare module "virtual:pwa-register" {
    type RegisterSWOptions = {
        immediate?: boolean;
        onNeedRefresh?: () => void;
        onOfflineReady?: () => void;
    };

    function registerSW(
        options?: RegisterSWOptions
    ): (reloadPage?: boolean) => void;
}