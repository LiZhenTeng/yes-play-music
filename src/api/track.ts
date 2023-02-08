import request from '@/utils/request';



/**
 * 听歌打卡
 * 说明 : 调用此接口 , 传入音乐 id, 来源 id，歌曲时间 time，更新听歌排行数据
 * - id - 歌曲 id
 * - sourceid - 歌单或专辑 id
 * - time - 歌曲播放时间,单位为秒
 * @param {Object} params
 * @param {number} params.id
 * @param {number} params.sourceid
 * @param {number=} params.time
 */
export const scrobble = (params: any) => {
  params.timestamp = new Date().getTime();
  return request({
    url: '/scrobble',
    method: 'get',
    params,
  });
}


/**
 * 获取音乐 url
 * 说明 : 使用歌单详情接口后 , 能得到的音乐的 id, 但不能得到的音乐 url, 调用此接口, 传入的音乐 id( 可多个 , 用逗号隔开 ), 可以获取对应的音乐的 url,
 * !!!未登录状态返回试听片段(返回字段包含被截取的正常歌曲的开始时间和结束时间)
 * @param {string} id - 音乐的 id，例如 id=405998841,33894312
 */
export const getMP3 = (id: string) => {
  return request({
    url: '/song/url',
    method: 'get',
    params: {
      id,
      br: '320000',
    },
  });
}


/**
 * 获取歌词
 * 说明 : 调用此接口 , 传入音乐 id 可获得对应音乐的歌词 ( 不需要登录 )
 * @param {number} id - 音乐 id
 */
export const getLyric = (id: number) => {
  return request({
    url: '/lyric',
    method: 'get',
    params: {
      id,
    },
  })
}

/**
 * 获取歌曲详情
 * 说明 : 调用此接口 , 传入音乐 id(支持多个 id, 用 , 隔开), 可获得歌曲详情(注意:歌曲封面现在需要通过专辑内容接口获取)
 * @param {string} ids - 音乐 id, 例如 ids=405998841,33894312
 */
export const getTrackDetail = (ids: string) => {
  return request({
    url: '/song/detail',
    method: 'get',
    params: {
      ids,
    },
  })
}
/**
 * 喜欢音乐
 * 说明 : 调用此接口 , 传入音乐 id, 可喜欢该音乐
 * - id - 歌曲 id
 * - like - 默认为 true 即喜欢 , 若传 false, 则取消喜欢
 * @param {Object} params
 * @param {number} params.id
 * @param {boolean=} [params.like]
 */
export const likeATrack = (params: { id: number, like: boolean, timestamp?: number }) => {
  params.timestamp = new Date().getTime();
  return request({
    url: '/like',
    method: 'get',
    params,
  });
}