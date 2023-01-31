import request from '@/utils/request';

/**
 * 喜欢音乐
 * 说明 : 调用此接口 , 传入音乐 id, 可喜欢该音乐
 * - id - 歌曲 id
 * - like - 默认为 true 即喜欢 , 若传 false, 则取消喜欢
 * @param {Object} params
 * @param {number} params.id
 * @param {boolean=} [params.like]
 */
export function likeATrack(params:{id:number,like:boolean, timestamp?:number}) {
    params.timestamp = new Date().getTime();
    return request({
      url: '/like',
      method: 'get',
      params,
    });
  }