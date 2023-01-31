import request from '@/utils/request';


/**
 * 退出登录
 * 说明 : 调用此接口 , 可退出登录
 */
export const logout=()=> {
    return request({
      url: '/logout',
      method: 'post',
    });
  }
  