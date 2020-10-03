import { SwaggerRouter } from "koa-swagger-decorator";
import controller = require("./controllers");
import { setHotelParams, updateHotelParam } from "./middleware/paramsPolicy";

const protectedRouter = new SwaggerRouter();

// hotel endpoint
protectedRouter.get("/hotels", controller.hotel.getlist);
protectedRouter.get("/hotel/:id", controller.hotel.getHotel);
protectedRouter.post("/hotel/add", setHotelParams, controller.hotel.setHotel);
protectedRouter.put("/hotel/:id", updateHotelParam, controller.hotel.setUpdateHotel);

// swagger endpoint
protectedRouter.swagger({
    title: "API Docs",
    description: "API endpoint documentation",
    version: "1.0.0",
});

// mapDir will scan the input dir, and automatically call router.map to all Router Class
protectedRouter.mapDir(__dirname);

export { protectedRouter };