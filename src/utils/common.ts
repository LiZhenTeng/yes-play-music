import Cookies from 'js-cookie'
import locale from '@/locale'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

export const useFormatAlbumType = (type: string, album: any) => {
    if (!type) return '';
    if (type === 'EP/Single') {
        return album.size === 1 ? 'Single' : 'EP';
    } else if (type === 'Single') {
        return 'Single';
    } else if (type === '专辑') {
        return 'Album';
    } else {
        return type;
    }
}

export const useSplitSoundtrackAlbumTitle = (title: string) => {
    let keywords = [
        'Music from the Original Motion Picture Score',
        'The Original Motion Picture Soundtrack',
        'Original MGM Motion Picture Soundtrack',
        'Complete Original Motion Picture Score',
        'Original Music From The Motion Picture',
        'Music From The Disney+ Original Movie',
        'Original Music From The Netflix Film',
        'Original Score to the Motion Picture',
        'Original Motion Picture Soundtrack',
        'Soundtrack from the Motion Picture',
        'Original Television Soundtrack',
        'Original Motion Picture Score',
        'Music From the Motion Picture',
        'Music From The Motion Picture',
        'Complete Motion Picture Score',
        'Music from the Motion Picture',
        'Original Videogame Soundtrack',
        'La Bande Originale du Film',
        'Music from the Miniseries',
        'Bande Originale du Film',
        'Die Original Filmmusik',
        'Original Soundtrack',
        'Complete Score',
        'Original Score',
    ];
    for (let keyword of keywords) {
        if (title.includes(keyword) === false) continue;
        return {
            title: title
                .replace(`(${keyword})`, '')
                .replace(`: ${keyword}`, '')
                .replace(`[${keyword}]`, '')
                .replace(`- ${keyword}`, '')
                .replace(`${keyword}`, ''),
            subtitle: keyword,
        };
    }
    return {
        title: title,
        subtitle: '',
    };
}

export const useSplitAlbumTitle = (title: string) => {
    let keywords = [
        'Bonus Tracks Edition',
        'Complete Edition',
        'Deluxe Edition',
        'Deluxe Version',
        'Tour Edition',
    ];
    for (let keyword of keywords) {
        if (title.includes(keyword) === false) continue;
        return {
            title: title
                .replace(`(${keyword})`, '')
                .replace(`: ${keyword}`, '')
                .replace(`[${keyword}]`, '')
                .replace(`- ${keyword}`, '')
                .replace(`${keyword}`, ''),
            subtitle: keyword,
        };
    }
    return {
        title: title,
        subtitle: '',
    };
}

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

export const useFormatTime = (Milliseconds: any, format = 'HH:MM:SS') => {
    if (!Milliseconds) return '';
    dayjs.extend(duration);
    dayjs.extend(relativeTime);

    let time = dayjs.duration(Milliseconds);
    let hours = time.hours().toString();
    let mins = time.minutes().toString();
    let seconds = time.seconds().toString().padStart(2, '0');

    if (format === 'HH:MM:SS') {
        return hours !== '0'
            ? `${hours}:${mins.padStart(2, '0')}:${seconds}`
            : `${mins}:${seconds}`;
    } else if (format === 'Human') {
        let hoursUnit, minitesUnit;
        switch (locale.global.locale) {
            case 'zh-CN':
                hoursUnit = '小时';
                minitesUnit = '分钟';
                break;
            case 'zh-TW':
                hoursUnit = '小時';
                minitesUnit = '分鐘';
                break;
            default:
                hoursUnit = 'hr';
                minitesUnit = 'min';
                break;
        }
        return hours !== '0'
            ? `${hours} ${hoursUnit} ${mins} ${minitesUnit}`
            : `${mins} ${minitesUnit}`;
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
