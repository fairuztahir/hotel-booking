import { BaseContext, Context } from "koa";
import { request, summary, responsesAll, tagsAll, path, body, query } from "koa-swagger-decorator";
import { Hotels, hotelSchema } from "../entities/hotels";
import { getManager, IsNull, Repository, Not, Equal, Like } from "typeorm";
import { resJson, ErrorType } from "../utils";
import { validate, ValidationError } from "class-validator";

@responsesAll({ 200: { description: "success" }, 400: { description: "bad request" }, 401: { description: "unauthorized, missing/wrong token" }})
@tagsAll(["Hotel"])
export default class HotelController {
    
    @request("GET", "/hotels")
    @summary("Find all hotels")
    @query({ page_size: { type: "number", required: true, description: "The size of data to display" },
        page_number: { type: "number", required: true, description: "Page number to display on table"},
        keyword: { type: "string", required: false, description: "Search key word for specific data"}
    })
    public static async getlist(ctx: Context): Promise<void> {
        try {
            const { page_size, page_number, keyword=""} = ctx.request.query;
            const psize = Number(page_size) ? Number(page_size) : 10;
            const pnumber = Number(page_number) < 1 ? 1 : Number(page_number);
            const pkeyword = String(keyword);
            const offset = psize * (pnumber - 1);
            // get a hotel repository to perform operations with user
            const hotelRepository: Repository<Hotels> = getManager().getRepository(Hotels);
            //load all hotels and count total
            let [hotels, total] = await hotelRepository.findAndCount({
                where: {
                    name: Like('%' + pkeyword + '%'),
                    deleted_at: IsNull()
                },
                order: {
                    created_at: "DESC"
                },
                take: psize,
                skip: offset,
                relations: ['rooms']
            });

            return resJson({ ctx, status: 200, data: hotels, param: { total: total } });

        } catch (error) {
            console.log(`ERR: Failed to fetch hotels: ${error}`);
            return resJson({ ctx, status: 500, message: JSON.stringify(error) });
        }
    }

    @request("GET", "/hotel/{id}")
    @summary("Find hotel by id")
    @path({ id: { type: "string", required: true, description: "hotel id" }})
    public static async getHotel(ctx: Context): Promise<void> {
        try {
            const { id } = ctx.params;
            // return error if invalid UUID type
            if (!regexChecking(id) || id == "")
                return resJson({ ctx, status: ErrorType.invalidUUIDString });
            const hotelRepository: Repository<Hotels> = getManager().getRepository(Hotels);
            // find hotel by id and exclude deleted
            const hotel: Hotels | undefined = await hotelRepository.findOne({
                where: {
                    id: id,
                    deleted_at: IsNull()
                }
            });
            
            if (!hotel) {
                return resJson({ ctx, status: ErrorType.getHotelFailed });
            }

            return resJson({ ctx, status: 200, data: hotel });

        } catch (error) {
            console.log(`ERR: Failed to fetch hotel info: ${error}`);
            return resJson({ ctx, status: 500, message: JSON.stringify(error) });
        }
    }

    @request("POST", "/hotel/add")
    @summary("Create hotel record")
    @body(hotelSchema)
    public static async setHotel (ctx: Context): Promise<void> {
        try {
            const { name, address="", email } = ctx.request.body;
            const hotelRepository: Repository<Hotels> = getManager().getRepository(Hotels);

            const hotelRecord: Hotels = new Hotels();

            hotelRecord.name = name;
            hotelRecord.address = address;
            hotelRecord.email = email;
            // validate params
            const errors: ValidationError[] = await validate(hotelRecord);

            if (errors.length > 0) {
                return resJson({ ctx, status: ErrorType.setHotelInvalid, data: errors });

            } else if (await hotelRepository.findOne({ email: hotelRecord.email })) {
                return resJson({ ctx, status: ErrorType.setHotelEmailExist });

            } else {
                // add hotel info
                const hotel = await hotelRepository.save(hotelRecord);
                return resJson({ ctx, status: 200, data: hotel });
            }

        } catch (error) {
            console.log(`ERR: Failed to insert hotel record: ${error}`);
            return resJson({ ctx, status: 500, message: JSON.stringify(error) });
        }
    }

    @request("PUT", "/hotel/{id}")
    @summary("Update hotel info by id")
    @path({ id: { type:"string", required: true, description: "Hotel id" }})
    @body(hotelSchema)
    public static async setUpdateHotel (ctx: Context): Promise<void> {
        try {
            const { address, email, name } = ctx.request.body;
            const { id } = ctx.params;
            // return error if invalid UUID type
            if (!regexChecking(id) || id == "")
                return resJson({ ctx, status: ErrorType.invalidUUIDString });
            const hotelRepository: Repository<Hotels> = getManager().getRepository(Hotels);

            const hotelRecord: Hotels | undefined = await hotelRepository.findOne({
                where: {
                    id: id,
                    deleted_at: IsNull()
                }
            });

            if (!hotelRecord) {
                // if not exists or deleted
                return resJson({ ctx, status: ErrorType.setUpdateHotelNotExists });
            }

            hotelRecord.address = address !== undefined ? address : hotelRecord.address;
            hotelRecord.name = name ? name : hotelRecord.name;
            hotelRecord.email = email ? email : hotelRecord.email;
            // // validate params
            const errors: ValidationError[] = await validate(hotelRecord);

            if (errors.length > 0) {
                return resJson({ ctx, status: ErrorType.setHotelInvalid, data: errors });

            } else if (await hotelRepository.findOne({ id: Not(Equal(hotelRecord.id)), email: hotelRecord.email })) {
                return resJson({ ctx, status: ErrorType.setHotelEmailExist });
            } else {
                // save hotel info
                const hotel = await hotelRepository.save(hotelRecord);
                return resJson({ ctx, status: 201, data: hotel });
            }

        } catch (error) {
            console.log(`ERR: Failed to update hotel record: ${error}`);
            return resJson({ ctx, status: 500, message: JSON.stringify(error) });
        }

    }

    @request("DELETE", "/hotel/{id}")
    @summary("Delete hotel by Id")
    @path({ id: { type:"string", required: true, description: "Hotel Id" }})
    public static async deleteHotel (ctx: Context): Promise<void> {
        try {
            const { id } = ctx.params;
            // return error if invalid UUID type
            if (!regexChecking(id) || id == "")
                return resJson({ ctx, status: ErrorType.invalidUUIDString });

            const hotelRepository = getManager().getRepository(Hotels);

            const hotelRecord: Hotels | undefined = await hotelRepository.findOne({
                where: {
                    id: id,
                    deleted_at: IsNull()
                }
            });

            if (!hotelRecord) {
                return resJson({ ctx, status: ErrorType.delHotelNotExist });
            } else {
                await hotelRepository.softRemove(hotelRecord);
                return resJson({ ctx, status: 204 });
            }

        } catch (error) {
            console.log(`ERR: Failed to delete hotel record: ${error}`);
            return resJson({ ctx, status: 500, message: JSON.stringify(error) });
        }
    }
}

function regexChecking (id: string = "") {
    const regexCheck = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    // const isValidUUID = id => regexCheck.test(id);
    // return isValidUUID(id);
    return regexCheck.test(id);
}