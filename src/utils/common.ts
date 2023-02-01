import Cookies from 'js-cookie'

export const useGetCookie = (key: string) => {
    return Cookies.get(key) ?? localStorage.getItem(`cookie-${key}`);
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


export const formatTrackTime = (value: number) => {
    if (!value) return '';
    let min = ~~((value / 60) % 60);
    let sec = (~~(value % 60)).toString().padStart(2, '0');
    return `${min}:${sec}`;
}
