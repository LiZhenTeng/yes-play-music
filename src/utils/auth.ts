import Cookies from 'js-cookie'
import { storeToRefs } from 'pinia';
import { useIndexStore } from '@/store';
import store from '@/store/store';
import { logout } from '@/api/auth';


const indexStore = useIndexStore(store);
const { data } = storeToRefs(indexStore);

export function useGetCookie(key: string) {
    return Cookies.get(key) ?? localStorage.getItem(`cookie-${key}`);
}
export function useRemoveCookie(key:string) {
    Cookies.remove(key);
    localStorage.removeItem(`cookie-${key}`);
  }
// 账号登录
export const useIsAccountLoggedIn=()=> {
    return (
        useGetCookie('MUSIC_U') !== undefined &&
        data.value?.loginMode === 'account'
    );
}

// 用户名搜索（用户数据为只读）
export const useIsUsernameLoggedIn=()=> {
    return data.value?.loginMode === 'username';
}

// 账户登录或者用户名搜索都判断为登录，宽松检查
export const useIsLooseLoggedIn=()=> {
    return useIsAccountLoggedIn() || useIsUsernameLoggedIn();
}
export const useDoLogout=()=> {
    logout();
    useRemoveCookie('MUSIC_U');
    useRemoveCookie('__csrf');
    // 更新状态仓库中的用户信息
    data.value['user']={};
    // 更新状态仓库中的登录状态
    data.value['loginMode']=null;
    // 更新状态仓库中的喜欢列表
    data.value['likedSongPlaylistID']=undefined;
  }
  