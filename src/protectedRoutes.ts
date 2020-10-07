import { SwaggerRouter } from "koa-swagger-decorator";
import controller = require("./controllers");
import { setHotelParams, updateHotelParam, updateRoomParams, setRoomParams , getRoomsParams, getHotelsParams, getCustParams } from "./middleware/paramsPolicy";

const protectedRouter = new SwaggerRouter();

// hotel endpoint
protectedRouter.get("/hotels", getHotelsParams, controller.hotel.getlist);
protectedRouter.get("/hotel/:id", controller.hotel.getHotel);
protectedRouter.post("/hotel/add", setHotelParams, controller.hotel.setHotel);
protectedRouter.put("/hotel/:id", updateHotelParam, controller.hotel.setUpdateHotel);
protectedRouter.delete("/hotel/:id", controller.hotel.deleteHotel)

// rooms endpoint
protectedRouter.get("/rooms", getRoomsParams, controller.room.getlist);
protectedRouter.get("/room/:id", controller.room.getRoom);
protectedRouter.post("/room/add", setRoomParams, controller.room.setRoom);
protectedRouter.put("/room/:id", updateRoomParams, controller.room.setUpdateRoom);
protectedRouter.delete("/room/:id", controller.room.deleteRoom);

// customers endpoint
protectedRouter.get("/customers", getCustParams, controller.customer.getlist);
protectedRouter.post("/customer/add", controller.customer.setCustomer);

// swagger endpoint
protectedRouter.swagger({
    title: "API Docs",
    description: "API endpoint documentation",
    version: "1.0.0",
});

// mapDir will scan the input dir, and automatically call router.map to all Router Class
protectedRouter.mapDir(__dirname);

export { protectedRouter };