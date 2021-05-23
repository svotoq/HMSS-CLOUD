const cds = require("@sap/cds")
const { Rooms, Students } = cds.entities;


/** Service implementation for Hostel Service */
module.exports = cds.service.impl((srv) => {
    srv.before(["CREATE", "UPDATE"], "Students", _hasEmptyPlaces)
    // srv.after(["CREATE", "UPDATE"], "Students", _reduceTakenPlaces)
})

/** Checks if there are empty spaces in the room*/
async function _hasEmptyPlaces (req) {
    const sRoomNumber = req.data.Room_RoomNumber
    if(sRoomNumber) {
        const db = cds.transaction(req)
        const oRoom = await db.read(Rooms).byKey(sRoomNumber);
        if(!oRoom) {
            return req.error(404, `Room ${sRoomNumber} not found`)
        }

        if(oRoom.EmptyPlaces > 0) {
            return req.error(409, `Room ${sRoomNumber} is full`)
        }
        
    } else if(sRoomNumber === "") {
        req.data.Room_RoomNumber = null;
    }
}

/** Reduce the number of taken places */
async function _reduceTakenPlaces (req) {
    //найти студента
    //если существует, то проверить roomNumber
    //если roomNumber пустой и новый тоже, то просто update
    //если roomNumer есть и новый тоже, то просто update
    //если roomNumber нету, а новый есть, то увеличить занятое место и update
    //если roomNumber есть, а новый нету, то уменьшить
    //если roomNumber отличается от roomNumber нового, то в одном уменьшить, в другом увеличить
    // const sRoomNumber = req.data.Room_RoomNumber
    
    // if(sRoomNumber) {
    //     return cds.transaction(req).run(()=> {
    //         UPDATE(Rooms)
    //         .set('PlacesTaken = ')
    //         .byKey(sRoomNumber)
    //     })
    // }
} 