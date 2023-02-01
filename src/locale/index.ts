import { createI18n } from 'vue-i18n'
import { useIndexStore } from '@/store';
import store from '@/store/store'

import en from './lang/en.js';
import zhCN from './lang/zh-CN.js';
import zhTW from './lang/zh-TW.js';
import tr from './lang/tr.js';

const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    en,
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    tr,
  },
  silentTranslationWarn: true,
});

export default i18n;
