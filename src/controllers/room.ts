import { BaseContext, Context } from "koa";
import { request, summary, responsesAll, tagsAll, path, body, query } from "koa-swagger-decorator";
import { Rooms, roomSchema, updateRoomSchema } from "../entities/rooms";
import { Hotels } from "../entities/hotels";
import { getManager, IsNull, Repository, Not, Equal, Like } from "typeorm";
import { resJson, ErrorType } from "../utils";
import { validate, ValidationError } from "class-validator";

@responsesAll({ 200: { description: "success" }, 400: { description: "bad request" }, 401: { description: "unauthorized, missing/wrong token" }})
@tagsAll(["Room"])
export default class RoomController {
    
    @request("GET", "/rooms")
    @summary("Find all rooms from hotel id")
    @query({ page_size: { type: "number", required: true, description: "The size of data to display" },
        page_number: { type: "number", required: true, description: "Page number to display on table"},
        hotel_id: { type: "string", required: true, description: "Hotel Id to find registered rooms"}
    })
    public static async getlist(ctx: Context): Promise<void> {
        try {
            const { page_size, page_number, hotel_id } = ctx.request.query;
            const psize = Number(page_size) ? Number(page_size) : 10;
            const pnumber = Number(page_number) < 1 ? 1 : Number(page_number);
            const pkeyword = String(hotel_id);
            const offset = psize * (pnumber - 1);

            // return error if invalid UUID type
            if (!regexChecking(hotel_id))
                return resJson({ ctx, status: ErrorType.invalidUUIDString });

            const hotelRepository: Repository<Hotels> = getManager().getRepository(Hotels);
            const findHotelRecord = await hotelRepository.findOne({ where: { id: hotel_id, deleted_at: IsNull() }});

            // find hotel before insert record
            if (!findHotelRecord)
                return resJson({ ctx, status: ErrorType.getHotelFailed });

            // get room repository to perform operations with specific hotel
            const roomRepository: Repository<Rooms> = getManager().getRepository(Rooms);
            
            //load rooms from hotel_id and count total
            let [rooms, total] = await roomRepository.findAndCount({
                // relations: ['hotel'],
                where: {
                    hotel: { id: pkeyword },
                    // deleted_at: IsNull()
                },
                order: {
                    created_at: "DESC"
                },
                take: psize,
                skip: offset
            });

            const output = Object.assign({
                rooms: rooms,
                hotel: findHotelRecord
            });

            return resJson({ ctx, status: 200, data: output, param: { total: total } });

        } catch (error) {
            console.log(`ERR: Failed to fetch rooms: ${error}`);
            return resJson({ ctx, status: 500, message: JSON.stringify(error) });
        }
    }

    @request("GET", "/room/{id}")
    @summary("Find a room by id")
    @path({ id: { type: "string", required: true, description: "room id" }})
    public static async getRoom(ctx: Context): Promise<void> {
        try {
            const { id } = ctx.params;
            // return error if invalid UUID type
            if (!regexChecking(id) || id == "")
                return resJson({ ctx, status: ErrorType.invalidUUIDString });
            const roomRepository: Repository<Rooms> = getManager().getRepository(Rooms);
            // find hotel by id and exclude deleted
            const room: Rooms | undefined = await roomRepository.findOne({
                where: {
                    id: id,
                    deleted_at: IsNull()
                },
                relations: ['hotel']
            });
            
            if (!room) {
                return resJson({ ctx, status: ErrorType.getRoomFailed });
            }

            return resJson({ ctx, status: 200, data: room });

        } catch (error) {
            console.log(`ERR: Failed to fetch room info: ${error}`);
            return resJson({ ctx, status: 500, message: JSON.stringify(error) });
        }
    }

    @request("POST", "/room/add")
    @summary("Create room record")
    @body(roomSchema)
    public static async setRoom (ctx: Context): Promise<void> {
        try {
            const { name, hotel_id } = ctx.request.body;
            const roomRepository: Repository<Rooms> = getManager().getRepository(Rooms);
            const hotelRepository: Repository<Hotels> = getManager().getRepository(Hotels);

            // return error if invalid UUID type
            if (!regexChecking(hotel_id) || hotel_id == "")
                return resJson({ ctx, status: ErrorType.invalidUUIDString });

            // find hotel before insert record
            if (!await hotelRepository.findOne({ where: { id: hotel_id, deleted_at: IsNull() }})) {
                return resJson({ ctx, status: ErrorType.setUpdateHotelNotExists });
            
            } else if (await roomRepository.findOne({ where: { name: name, deleted_at: IsNull() }})) {
                // filter duplicate name
                return resJson({ ctx, status: ErrorType.setRoomDuplicate });

            } else {
                // add room info
                const roomRecord: Rooms = new Rooms();
                roomRecord.name = name;
                roomRecord.hotel = hotel_id;

                const room = await roomRepository.save(roomRecord);
                return resJson({ ctx, status: 200, data: room });
            }

        } catch (error) {
            console.log(`ERR: Failed to insert room record: ${error}`);
            return resJson({ ctx, status: 500, message: JSON.stringify(error) });
        }
    }

    @request("PUT", "/room/{id}")
    @summary("Update room info by id")
    @path({ id: { type:"string", required: true, description: "Room id" }})
    @body(updateRoomSchema)
    public static async setUpdateRoom (ctx: Context): Promise<void> {
        try {
            const { name, status=null } = ctx.request.body;
            const { id } = ctx.params;
            // return error if invalid UUID type
            if (!regexChecking(id) || id == "")
                return resJson({ ctx, status: ErrorType.invalidUUIDString });
            const roomRepository: Repository<Rooms> = getManager().getRepository(Rooms);

            const roomRecord: Rooms | undefined = await roomRepository.findOne({
                where: {
                    id: id,
                    deleted_at: IsNull()
                }
            });

            if (!roomRecord) {
                // if not exists or deleted
                return resJson({ ctx, status: ErrorType.setUpdateRoomNotExists });
            }

            roomRecord.name = name;
            roomRecord.status = status !== null ? status : roomRecord.status;

            // // validate params
            const errors: ValidationError[] = await validate(roomRecord);

            if (errors.length > 0) {
                return resJson({ ctx, status: ErrorType.setHotelInvalid, data: errors });

            } else if (await roomRepository.findOne({ where: { name: name, deleted_at: IsNull(), id: Not(Equal(id))}})) {
                // filter duplicate name
                return resJson({ ctx, status: ErrorType.setRoomDuplicate });
            } else {
                // save hotel info
                const room = await roomRepository.save(roomRecord);
                return resJson({ ctx, status: 201, data: room });
            }

        } catch (error) {
            console.log(`ERR: Failed to update room record: ${error}`);
            return resJson({ ctx, status: 500, message: JSON.stringify(error) });
        }

    }

    @request("DELETE", "/room/{id}")
    @summary("Delete room by Id")
    @path({ id: { type:"string", required: true, description: "Room Id" }})
    public static async deleteRoom (ctx: Context): Promise<void> {
        try {
            const { id } = ctx.params;
            // return error if invalid UUID type
            if (!regexChecking(id) || id == "")
                return resJson({ ctx, status: ErrorType.invalidUUIDString });

            const roomRepository = getManager().getRepository(Rooms);

            const roomRecord: Rooms | undefined = await roomRepository.findOne({
                where: {
                    id: id,
                    deleted_at: IsNull()
                }
            });

            if (!roomRecord) {
                return resJson({ ctx, status: ErrorType.delRoomNotExist });
            } else {
                await roomRepository.softRemove(roomRecord);
                return resJson({ ctx, status: 204 });
            }

        } catch (error) {
            console.log(`ERR: Failed to delete room record: ${error}`);
            return resJson({ ctx, status: 500, message: JSON.stringify(error) });
        }
    }
}

function regexChecking (id: string = "") {
    const regexCheck = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regexCheck.test(id);
}