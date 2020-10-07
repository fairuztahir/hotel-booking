enum ErrorType {
    getHotelFailed = 10000,
    setHotelInvalid = 10001,
    setHotelEmailExist = 10002,
    setUpdateHotelNotExists = 10003,
    invalidUUIDString = 10004,
    delHotelNotExist = 10005,
    getRoomFailed = 10100,
    setRoomDuplicate = 10101,
    setUpdateRoomNotExists = 10102,
    delRoomNotExist = 10005,
}

const errMsg = {
    200: "Success",
    201: "Record successfully updated",
    204: "Record successfully deleted",
    [ErrorType.getHotelFailed]: "The hotel you are trying to retrieve doesn't exist. Please try again.",
    [ErrorType.setHotelInvalid]: "The following parameters are not correct. Please try again.",
    [ErrorType.setHotelEmailExist]: "The specified e-mail address already exists. Please try again.",
    [ErrorType.setUpdateHotelNotExists]: "The hotel you are trying to update doesn't exist. Please try again.",
    [ErrorType.invalidUUIDString]: "Invalid id type. Please try again.",
    [ErrorType.delHotelNotExist]: "The hotel you are trying to delete doesn't exist. Please try again.",
    [ErrorType.getRoomFailed]: "The room you are trying to retrieve doesn't exist. Please try again",
    [ErrorType.setRoomDuplicate]: "Room name already exists. Please try again.",
    [ErrorType.setUpdateRoomNotExists]: "The room you are trying to update doesn't exist. Please try again.",
    [ErrorType.delRoomNotExist]: "The room number you are trying to delete doesn't exist. Please try again.",
};

const errCode = {
    success: 200,
};
  
export { errCode, errMsg, ErrorType };