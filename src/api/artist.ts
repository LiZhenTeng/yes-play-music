import request from '@/utils/request';

/**
 * 获取歌手单曲
 * 说明 : 调用此接口 , 传入歌手 id, 可获得歌手部分信息和热门歌曲
 * @param {number} id - 歌手 id, 可由搜索接口获得
 */
export const getArtist = (id: number) => {
    return request({
        url: '/artists',
        method: 'get',
        params: {
            id,
            timestamp: new Date().getTime(),
        },
    })
}

/**
 * 歌手榜
 * 说明 : 调用此接口 , 可获取排行榜中的歌手榜
 * - type : 地区
 * 1: 华语
 * 2: 欧美
 * 3: 韩国
 * 4: 日本
 * @param {number=} type
 */
export const getToplistOfArtists = (type: any = null) => {
    let params: { type?: any } = {};
    if (type) {
        params.type = type;
    }
    return request({
        url: '/toplist/artist',
        method: 'get',
        params,
    });
}