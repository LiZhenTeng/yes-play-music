import { storeToRefs } from 'pinia';
import { useIndexStore } from '@/store';
import store from '@/store/store';
import { logout } from '@/api/auth';
import { useGetCookie, useRemoveCookie } from '@/utils/common'

const indexStore = useIndexStore(store);
const { data } = storeToRefs(indexStore);


export const isTrackPlayable = (track: any) => {
    let result = {
        playable: true,
        reason: '',
    };
    if (track?.privilege?.pl > 0) {
        return result;
    }
    // cloud storage judgement logic
    if (useGetCookie('MUSIC_U') !== undefined &&
        data.value?.loginMode === 'account' && track?.privilege?.cs) {
        return result;
    }
    if (track.fee === 1 || track.privilege?.fee === 1) {
        if (useGetCookie('MUSIC_U') !== undefined &&
            data.value?.loginMode === 'account' && data.value?.user.vipType === 11) {
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
    } else if (track.privilege?.st < 0 && useGetCookie('MUSIC_U') !== undefined &&
        data.value?.loginMode === 'account') {
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
// 账号登录
export const useIsAccountLoggedIn = () => {
    return (
        useGetCookie('MUSIC_U') !== undefined &&
        data.value?.loginMode === 'account'
    );
}

// 用户名搜索（用户数据为只读）
export const useIsUsernameLoggedIn = () => {
    return data.value?.loginMode === 'username';
}

// 账户登录或者用户名搜索都判断为登录，宽松检查
export const useIsLooseLoggedIn = () => {
    return useIsAccountLoggedIn() || useIsUsernameLoggedIn();
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
