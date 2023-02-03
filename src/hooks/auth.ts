import { storeToRefs } from 'pinia';
import { useIndexStore } from '@/store';
import store from '@/store/store';
import dayjs from 'dayjs';
import { logout, refreshCookie } from '@/api/auth';
import { useRemoveCookie } from '@/utils/common';
import { dailySignin } from '@/api/user';

const indexStore = useIndexStore(store);
const {updateData}=indexStore;
const { data, useIsAccountLoggedIn } = storeToRefs(indexStore);


export const isTrackPlayable = (track: any) => {
    let result = {
        playable: true,
        reason: '',
    };
    if (track?.privilege?.pl > 0) {
        return result;
    }
    // cloud storage judgement logic
    if (useIsAccountLoggedIn.value && track?.privilege?.cs) {
        return result;
    }
    if (track.fee === 1 || track.privilege?.fee === 1) {
        if (useIsAccountLoggedIn.value && data.value?.user.vipType === 11) {
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
    } else if (track.privilege?.st < 0 && useIsAccountLoggedIn.value) {
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
export const useDailyTask = () => {
    let lastDate = data.value.lastRefreshCookieDate;
    if (
        useIsAccountLoggedIn.value &&
        (lastDate === undefined || lastDate !== dayjs().date())
    ) {
        console.debug('[debug][common.js] execute dailyTask');
        refreshCookie().then(() => {
            console.debug('[debug][common.js] 刷新cookie');
            updateData({
                key: 'lastRefreshCookieDate',
                value: dayjs().date(),
            });
        });
        dailySignin(0).catch(() => {
            console.debug('[debug][common.js] 手机端重复签到');
        });
        dailySignin(1).catch(() => {
            console.debug('[debug][common.js] PC端重复签到');
        });
    }
}


export const useDoLogout = () => {
    logout();
    useRemoveCookie('MUSIC_U');
    useRemoveCookie('__csrf');
    // 更新状态仓库中的用户信息
    data.value['user'] = {};
    // 更新状态仓库中的登录状态
    data.value['loginMode'] = null;
    // 更新状态仓库中的喜欢列表
    data.value['likedSongPlaylistID'] = undefined;
}
