import Koa from "koa";
import { errMsg, errCode } from "./errorCode";

export interface Response {
  data?: any;
}

/**
 * @param ctx
 * @param status
 * @param result
 * @param message
 */
interface ParamsType {
  ctx: Koa.ExtendableContext;
  status?: number | string;
  data?: any;
  message?: any;
  code?: number,
  param?: any;
}

const responseJson = (params: ParamsType) => {
  const { ctx, data, param } = params;
  let { message, status = 200 } = params;
  
  if (errMsg[status] && !message) {
    message = errMsg[status];
  } else if (!message) {
    message = "ok";
  }
  if (param && param.code) {
    status = "";
  }
  return (ctx.body = {
    status,
    message,
    data: data,
    ...param
    // timestamp: Date.now()
  });
};
export default responseJson;
