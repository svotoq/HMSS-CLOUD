const cds = require("@sap/cds")
const {Rooms, Students} = cds.entities;

/** Service implementation for Hostel Service */
module.exports = cds.service.impl((srv) => {
    srv.on(["CREATE", "UPDATE"], "Rooms", _updateRoomLogic)
    srv.on("UPDATE", "Students", _updateStudentsLogic)
    // srv.before(["CREATE", "UPDATE"], "Students", _hasEmptyPlaces)
    // srv.after(["CREATE", "UPDATE"], "Students", _reduceTakenPlaces)
})

async function _updateStudentsLogic(req) {
    var oStudent = req.data,
        sRoomNumber = oStudent.Room_RoomNumber || "";

    const db = cds.transaction(req)

    switch (oStudent.ActionIndicator) {
        case "CREATE": {
            var resultStudent = await _createStudents(db, [oStudent], sRoomNumber)
            break;
        }
        case "UPDATE": {
            var resultStudent = await _updateStudents(db, [oStudent], sRoomNumber)
            break;
        }
        case "DELETE": {
            var resultStudent = await _deleteStudents(db, [oStudent], sRoomNumber)
            break;
        }
    }

    // if (sRoomNumber) {
    //     const oRoom = await db.read(Rooms).where({RoomNumber: sRoomNumber})[0]
    //     const aStudents = await db.read(Students).where({Room_RoomNumber: sRoomNumber})
    //     console.log(aStudents);
    //     console.log(oRoom)
    //     if (!aStudents.length && oRoom.Capacity) {
    //         oRoom.EmptyPlaces = oRoom.Capacity;
    //     } else {
    //         oRoom.EmptyPlaces = oRoom.Capacity - aStudents.length;
    //     }
    //     var resultUpdateRoom = await _updateRoom(db, oRoom)
    // }
}


/** Reduce the number of taken places */
async function _updateRoomLogic(req) {
    var oRoom = req.data,
        aStudents = oRoom.Students || [];

    var sErrorMessage = "";
    if (!oRoom.ActionIndicator) {
        sErrorMessage = "ActionIndicator is required"
    } else if (!oRoom.Capacity) {
        sErrorMessage = "Capacity is required"
    }

    if (sErrorMessage) {
        return req.error(409, sErrorMessage)
    }

    const db = cds.transaction(req)

    oRoom.Notes = oRoom.Notes || [];

    if (!aStudents.length && oRoom.Capacity) {
        oRoom.EmptyPlaces = oRoom.Capacity;
    } else {
        oRoom.EmptyPlaces = oRoom.Capacity - aStudents.length;
    }

    if (oRoom.EmptyPlaces < 0) {
        return req.error(409, `Reduce the number of students. Room Capacity is ${oRoom.Capacity}`)
    }

    var sRoomNumber = oRoom.RoomNumber;
    var affectedRows = 0;
    switch (oRoom.ActionIndicator) {
        case "CREATE": {
            affectedRows = await _createRoom(db, oRoom)
            break;
        }
        case "UPDATE": {
            affectedRows = await _updateRoom(db, oRoom)
            break;
        }
        case "DELETE": {
            affectedRows = await _deleteRoom(db, oRoom)
            sRoomNumber = "";
            break;
        }
    }

    if (sRoomNumber) {
        var resultStudentsC = await _createStudents(db, aStudents, sRoomNumber)
        var resultStudentsU = await _updateStudents(db, aStudents, sRoomNumber)
    }

    var resultStudentsD = await _updateStudents(db, aStudents, null)

    // return (db.read("Rooms").where({RoomNumber: oRoom.RoomNumber}))[0]
}

async function _deleteRoom(db, oRoom) {
    return await db.delete(Rooms).byKey(oRoom.RoomNumber)
}

async function _updateRoom(db, oRoom) {
    var oNewRoom = {
        RoomNumber: oRoom.RoomNumber,
        Capacity: oRoom.Capacity || 0,
        Rating: oRoom.Rating || 0,
        Tables: oRoom.Tables || 0,
        Beds: oRoom.Beds || 0,
        ActionIndicator: "",
        EmptyPlaces: oRoom.EmptyPlaces || 0,
        Notes: oRoom.Notes || []
    }
    return await db.run(UPDATE('Rooms').set(oNewRoom).where({RoomNumber: oNewRoom.RoomNumber}))
}

async function _createRoom(db, oRoom) {
    var oNewRoom = {
        RoomNumber: oRoom.RoomNumber,
        Capacity: oRoom.Capacity || 0,
        Rating: oRoom.Rating || 0,
        Tables: oRoom.Tables || 0,
        Beds: oRoom.Beds || 0,
        ActionIndicator: "",
        EmptyPlaces: oRoom.EmptyPlaces || 0,
        Notes: oRoom.Notes || []
    }
    return await db.run(INSERT.into('Rooms').rows(oNewRoom))
}

async function _createStudents(db, aStudents, sRoomNumber) {
    aStudents.forEach(function (oStudent) {
        if (oStudent.ActionIndicator === "CREATE") {
            oStudent.ActionIndicator = "";
            oStudent.Room_RoomNumber = sRoomNumber;
            db.run(INSERT.into('Students').rows(oStudent))
        }
    });
}

async function _updateStudents(db, aStudents, sRoomNumber) {
    aStudents.forEach(function (oStudent) {
        if (oStudent.ActionIndicator === "UPDATE") {
            oStudent.ActionIndicator = "";
            oStudent.Room_RoomNumber = sRoomNumber;
            db.run(UPDATE('Students').set(oStudent).byKey(oStudent.ID))
        }
    });
}

async function _deleteStudents(db, aStudents) {
    aStudents.forEach(function (oStudent) {
        if (oStudent.ActionIndicator === "DELETE") {
            oStudent.Room_RoomNumber = "";
            db.run(DELETE.from('Students').byKey(oStudent.ID))
        }
    });
}

// async function _deleteStudentsFromRoom(db, aStudents) {
//     aStudents.forEach(function (oStudent) {
//         if (oStudent.ActionIndicator === "DELETE") {
//             oStudent.ActionIndicator = "";
//             oStudent.Room_RoomNumber = null;
//             db.run(UPDATE('Students').set(oStudent).byKey(oStudent.ID))
//         }
//     });
// }