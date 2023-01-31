import { useIsAccountLoggedIn } from './auth';
import { storeToRefs } from 'pinia';
import { useIndexStore } from '@/store';
import store from '@/store/store'

const indexStore = useIndexStore(store);

const { data } = storeToRefs(indexStore)

export const useResizeImage = (imgUrl: string, size = 512) => {
    if (!imgUrl) return '';
    let httpsImgUrl = imgUrl;
    if (imgUrl.slice(0, 5) !== 'https') {
        httpsImgUrl = 'https' + imgUrl.slice(4);
    }
    return `${httpsImgUrl}?param=${size}y${size}`;
}

export const isTrackPlayable = (track: any) => {
    let result = {
        playable: true,
        reason: '',
    };
    if (track?.privilege?.pl > 0) {
        return result;
    }
    // cloud storage judgement logic
    if (useIsAccountLoggedIn() && track?.privilege?.cs) {
        return result;
    }
    if (track.fee === 1 || track.privilege?.fee === 1) {
        if (useIsAccountLoggedIn() && data.value?.user.vipType === 11) {
            result.playable = true;
        } else {
            result.playable = false;
            result.reason = 'VIP Only';
        }
    } else if (track.fee === 4 || track.privilege?.fee === 4) {
        result.playable = false;
        result.reason = '付费专辑';
    } else if (
        track.noCopyrightRcmd !== null &&
        track.noCopyrightRcmd !== undefined
    ) {
        result.playable = false;
        result.reason = '无版权';
    } else if (track.privilege?.st < 0 && useIsAccountLoggedIn()) {
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

export const formatTrackTime = (value: number) => {
    if (!value) return '';
    let min = ~~((value / 60) % 60);
    let sec = (~~(value % 60)).toString().padStart(2, '0');
    return `${min}:${sec}`;
}