import Cookies from 'js-cookie'
import locale from '@/locale'
import dayjs from 'dayjs'

export const useRandomNum = (...arg: any[]) => {
    switch (arg.length) {
        case 1:
            return parseInt((Math.random() * arg[0] + 1).toString(), 10);
        case 2:
            return parseInt(Math.random() * (arg[1] - arg[0] + 1) + arg[0], 10);
        default:
            return 0;
    }
}

export const useFormatDate = (timestamp: any, format = 'MMM D, YYYY') => {
    if (!timestamp) return '';
    if (locale.global.locale === 'zh-CN') format = 'YYYY年MM月DD日';
    else if (locale.global.locale === 'zh-TW') format = 'YYYY年MM月DD日';
    return dayjs(timestamp).format(format);
}

export const changeAppearance = (appearance: any) => {
    if (appearance === 'auto' || appearance === undefined) {
        appearance = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }
    document.body.setAttribute('data-theme', appearance);
    document.querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', appearance === 'dark' ? '#222' : '#fff');
}
export const useThrottle = (fn: Function, time: number) => {
    let isRun = false;
    return (...arg: any) => {
        if (isRun) return;
        isRun = true;
        fn.apply(this, arg);
        setTimeout(() => {
            isRun = false;
        }, time);
    };
}


export const useGetCookie = (key: string) => {
    return Cookies.get(key) ?? localStorage.getItem(`cookie-${key}`);
}
export const useSetCookies = (string: string) => {
    const cookies = string.split(';;');
    cookies.map(cookie => {
        document.cookie = cookie;
        const cookieKeyValue = cookie.split(';')[0].split('=');
        localStorage.setItem(`cookie-${cookieKeyValue[0]}`, cookieKeyValue[1]);
    });
}
export const useRemoveCookie = (key: string) => {
    Cookies.remove(key);
    localStorage.removeItem(`cookie-${key}`);
}
export const useResizeImage = (imgUrl: string, size = 512) => {
    if (!imgUrl) return '';
    let httpsImgUrl = imgUrl;
    if (imgUrl.slice(0, 5) !== 'https') {
        httpsImgUrl = 'https' + imgUrl.slice(4);
    }
    return `${httpsImgUrl}?param=${size}y${size}`;
}


export const useFormatTrackTime = (value: number) => {
    if (!value) return '';
    let min = ~~((value / 60) % 60);
    let sec = (~~(value % 60)).toString().padStart(2, '0');
    return `${min}:${sec}`;
}

export const useFormatPlayCount = (count: number) => {
    if (!count) return '';
    if (locale.global.locale === 'zh-CN') {
        if (count > 100000000) {
            return `${Math.floor((count / 100000000) * 100) / 100}亿`; // 2.32 亿
        }
        if (count > 100000) {
            return `${Math.floor((count / 10000) * 10) / 10}万`; // 232.1 万
        }
        if (count > 10000) {
            return `${Math.floor((count / 10000) * 100) / 100}万`; // 2.3 万
        }
        return count;
    } else if (locale.global.locale === 'zh-TW') {
        if (count > 100000000) {
            return `${Math.floor((count / 100000000) * 100) / 100}億`; // 2.32 億
        }
        if (count > 100000) {
            return `${Math.floor((count / 10000) * 10) / 10}萬`; // 232.1 萬
        }
        if (count > 10000) {
            return `${Math.floor((count / 10000) * 100) / 100}萬`; // 2.3 萬
        }
        return count;
    } else {
        if (count > 10000000) {
            return `${Math.floor((count / 1000000) * 10) / 10}M`; // 233.2M
        }
        if (count > 1000000) {
            return `${Math.floor((count / 1000000) * 100) / 100}M`; // 2.3M
        }
        if (count > 1000) {
            return `${Math.floor((count / 1000) * 100) / 100}K`; // 233.23K
        }
        return count;
    }
}
