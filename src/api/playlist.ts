import { useMapTrackPlayableStatus } from '@/utils/auth';
import request from '@/utils/request';

/**
 * 推荐歌单
 * 说明 : 调用此接口 , 可获取推荐歌单
 * - limit: 取出数量 , 默认为 30 (不支持 offset)
 * - 调用例子 : /personalized?limit=1
 * @param {Object} params
 * @param {number} params.limit
 */
export const recommendPlaylist = (params: { limit?: number }) => {
    return request({
        url: '/personalized',
        method: 'get',
        params,
    });
}

/**
 * 每日推荐歌曲
 * 说明 : 调用此接口 , 可获得每日推荐歌曲 ( 需要登录 )
 */
export const dailyRecommendTracks = () => {
    return request({
        url: '/recommend/songs',
        method: 'get',
        params: { timestamp: new Date().getTime() },
    }).then(result => {
        result.data.dailySongs = useMapTrackPlayableStatus(
            result.data.dailySongs,
            result.data.privileges
        );
        return result;
    });
}

/**
 * 获取每日推荐歌单
 * 说明 : 调用此接口 , 可获得每日推荐歌单 ( 需要登录 )
 * @param {Object} params
 * @param {number} params.limit
 */
export const dailyRecommendPlaylist = (params: { limit?: number }) => {
    return request({
        url: '/recommend/resource',
        method: 'get',
        params: {
            params,
            timestamp: Date.now(),
        },
    });
}

/**
 * 所有榜单
 * 说明 : 调用此接口,可获取所有榜单 接口地址 : /toplist
 */
export const toplists = () => {
    return request({
        url: '/toplist',
        method: 'get',
    });
}

/**
 * 获取歌单详情
 * 说明 : 歌单能看到歌单名字, 但看不到具体歌单内容 , 调用此接口 , 传入歌单 id, 可以获取对应歌单内的所有的音乐(未登录状态只能获取不完整的歌单,登录后是完整的)，
 * 但是返回的trackIds是完整的，tracks 则是不完整的，可拿全部 trackIds 请求一次 song/detail 接口
 * 获取所有歌曲的详情 (https://github.com/Binaryify/NeteaseCloudMusicApi/issues/452)
 * - id : 歌单 id
 * - s : 歌单最近的 s 个收藏者, 默认为8
 * @param {number} id
 * @param {boolean} noCache
 */
export const getPlaylistDetail = async (id: number, noCache = false) => {
    let params: { id: number, timestamp?: number } = { id };
    if (noCache) params.timestamp = new Date().getTime();
    return request({
        url: '/playlist/detail',
        method: 'get',
        params,
    }).then(response => {
        if (response.data.playlist) {
            response.data.playlist.tracks = useMapTrackPlayableStatus(
                response.data.playlist.tracks,
                response.data.privileges || []
            );
        }
        return response;
    });
}

/**
 * 新建歌单
 * 说明 : 调用此接口 , 传入歌单名字可新建歌单
 * - name : 歌单名
 * - privacy : 是否设置为隐私歌单，默认否，传'10'则设置成隐私歌单
 * - type : 歌单类型,默认'NORMAL',传 'VIDEO'则为视频歌单
 * @param {Object} params
 * @param {string} params.name
 * @param {number} params.privacy
 * @param {string} params.type
 */
export const createPlaylist = (params: { name: string, privacy?: number, type: number, timestamp?: number }) => {
    params.timestamp = new Date().getTime();
    return request({
        url: '/playlist/create',
        method: 'post',
        params,
    });
}
/**
 * 对歌单添加或删除歌曲
 * 说明 : 调用此接口 , 可以添加歌曲到歌单或者从歌单删除某首歌曲 ( 需要登录 )
 * - op: 从歌单增加单曲为 add, 删除为 del
 * - pid: 歌单 id tracks: 歌曲 id,可多个,用逗号隔开
 * @param {Object} params
 * @param {string} params.op
 * @param {string} params.pid
 * @returns {AxiosPromise<any>}
 */
export const addOrRemoveTrackFromPlaylist = (params: { op: string, pid: string, timestamp?: number, tracks: number }) => {
    params.timestamp = new Date().getTime();
    return request({
        url: '/playlist/tracks',
        method: 'post',
        params,
    });
}