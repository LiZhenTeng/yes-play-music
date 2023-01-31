export const useResizeImage = (imgUrl: string, size = 512) => {
    if (!imgUrl) return '';
    let httpsImgUrl = imgUrl;
    if (imgUrl.slice(0, 5) !== 'https') {
        httpsImgUrl = 'https' + imgUrl.slice(4);
    }
    return `${httpsImgUrl}?param=${size}y${size}`;
}