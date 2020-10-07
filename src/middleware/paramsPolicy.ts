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

// hotel validation
export const getHotelsParams = async (ctx: Context, next: Next) => {
    const schema = Joi.object({
        page_size: Joi.string().required(),
        page_number: Joi.string().required(),
        keyword: Joi.string().allow("").optional(),
    });
    await validateParams(ctx, next, schema, ctx.request.query);
};

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

// room validation
export const getRoomsParams = async (ctx: Context, next: Next) => {
    const schema = Joi.object({
        page_size: Joi.string().required(),
        page_number: Joi.string().required(),
        hotel_id: Joi.string().required(),
    });
    await validateParams(ctx, next, schema, ctx.request.query);
};

export const updateRoomParams = async (ctx: Context, next: Next) => {
    const schema = Joi.object({
        name: Joi.string().min(1).max(10).required(),
        status: Joi.boolean().optional()
    });
    await validateParams(ctx, next, schema);
};

export const setRoomParams = async (ctx: Context, next: Next) => {
    const schema = Joi.object({
        name: Joi.string().min(1).max(10).required(),
        hotel_id: Joi.string().required(),
    });
    await validateParams(ctx, next, schema);
};

// cust validation
export const getCustParams = async (ctx: Context, next: Next) => {
    const schema = Joi.object({
        page_size: Joi.string().required(),
        page_number: Joi.string().required(),
        keyword: Joi.string().allow("").optional(),
    });
    await validateParams(ctx, next, schema, ctx.request.query);
};