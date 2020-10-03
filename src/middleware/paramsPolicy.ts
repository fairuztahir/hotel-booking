import { Context, Next } from "koa";
import Joi from "joi";
import { resJson } from "../utils";

const validateParams = async (ctx: Context, next: Next, schema: any, params?: any, errorCode?: number) => {
    try {
        const body = params || ctx.request.body;
        await schema.validateAsync(body, {allowUnknown: true});
        await next();
    } catch (error) {
        if (error.details) {
            const message = error.details[0].message;
            return resJson({ ctx, status: errorCode ? errorCode : 400, message});
        }
    }
};

// hotel module
export const setHotelParams = async (ctx: Context, next: Next) => {
    const schema = Joi.object({
        name: Joi.string().min(10).max(80).required(),
        email: Joi.string().email({ tlds: { allow: false } }).required(),
        address: Joi.string().allow("").max(100).optional()
    });
    await validateParams(ctx, next, schema);
};

export const updateHotelParam = async (ctx: Context, next: Next) => {
    const schema = Joi.object({
        address: Joi.string().allow("").max(100).optional(),
        email: Joi.string().min(1).email().optional(),
        name: Joi.string().min(10).max(80).optional()
    }).or("email", "name", "address");
    await validateParams(ctx, next, schema);
};