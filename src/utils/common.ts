import Cookies from 'js-cookie'
import locale from '@/locale'

export const isTrackPlayable = (track: any) => {
    let result = {
        playable: true,
        reason: '',
    };
    if (track?.privilege?.pl > 0) {
        return result;
    }
    // cloud storage judgement logic
    /* if (useIsAccountLoggedIn && track?.privilege?.cs) {
        return result;
    } */
    if (track.fee === 1 || track.privilege?.fee === 1) {
        /* if (useIsAccountLoggedIn && data.value?.user.vipType === 11) {
            result.playable = true;
        } else {
            result.playable = false;
            result.reason = 'VIP Only';
        } */
    } else if (track.fee === 4 || track.privilege?.fee === 4) {
        result.playable = false;
        result.reason = '付费专辑';
    } else if (
        track.noCopyrightRcmd !== null &&
        track.noCopyrightRcmd !== undefined
    ) {
        result.playable = false;
        result.reason = '无版权';
    } else if (track.privilege?.st < 0 /* && useIsAccountLoggedIn */) {
        result.playable = false;
        result.reason = '已下架';
    }
    return result;
}
export const useMapTrackPlayableStatus = (tracks: Array<any>, privileges = new Array<any>()) => {
    if (tracks?.length === undefined) return tracks;
    return tracks.map(t => {
        const privilege = privileges.find(item => item.id === t.id) || {};
        if (t.privilege) {
            Object.assign(t.privilege, privilege);
        } else {
            t.privilege = privilege;
        }
        let result = isTrackPlayable(t);
        t.playable = result.playable;
        t.reason = result.reason;
        return t;
    });
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
