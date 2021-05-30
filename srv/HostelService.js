const cds = require("@sap/cds")
const {Rooms, Students} = cds.entities;

/** Service implementation for Hostel Service */
module.exports = cds.service.impl((srv) => {
    srv.on(["CREATE", "UPDATE", "DELETE"], "Rooms", _updateRoomLogic)
    srv.on(["CREATE", "UPDATE", "DELETE"], "Students", _updateStudentsLogic)
    // srv.before(["CREATE", "UPDATE"], "Students", _hasEmptyPlaces)
    // srv.after(["CREATE", "UPDATE"], "Students", _reduceTakenPlaces)
})

async function _updateStudentsLogic(req) {
    var oStudent = req.data,
        sRoomNumber = oStudent.Room_RoomNumber || "";

    console.log(oStudent);
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

    if (sRoomNumber) {
        const oRoom = await db.read(Rooms).byKey(sRoomNumber)
        console.log(oRoom)
        const aStudents = await db.read(Students).where({Room_RoomNumber: sRoomNumber})

        if (!aStudents.length && oRoom.Capacity) {
            oRoom.EmptyPlaces = oRoom.Capacity;
        } else {
            oRoom.EmptyPlaces = oRoom.Capacity - aStudents.length;
        }
        var resultUpdateRoom = await _updateRoom(db, oRoom)
    }
}

/** Checks if there are empty spaces in the room*/
async function _hasEmptyPlaces(req) {
    const sRoomNumber = req.data.Room_RoomNumber
    if (sRoomNumber) {
        const db = cds.transaction(req)
        const oRoom = await db.read(Rooms).byKey(sRoomNumber);
        if (!oRoom) {
            return req.error(404, `Room ${sRoomNumber} not found`)
        }

        if (oRoom.EmptyPlaces > 0) {
            return req.error(409, `Room ${sRoomNumber} is full`)
        }

    } else if (sRoomNumber === "") {
        req.data.Room_RoomNumber = null;
    }
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
        return req.error(404, sErrorMessage)
    }

    oRoom.Notes = oRoom.Notes || [];

    if (!aStudents.length && oRoom.Capacity) {
        oRoom.EmptyPlaces = oRoom.Capacity;
    } else {
        oRoom.EmptyPlaces = oRoom.Capacity - aStudents.length;
    }

    if (oRoom.EmptyPlaces < 0) {
        return req.error(409, `Reduce the number of students. Room Capacity is ${oRoom.Capacity}`)
    }

    const db = cds.transaction(req)

    var sRoomNumber = oRoom.RoomNumber;
    switch (oRoom.ActionIndicator) {
        case "CREATE": {
            var resultRoom = await _createRoom(db, oRoom)
            break;
        }
        case "UPDATE": {
            var resultRoom = await _updateRoom(db, oRoom)
            break;
        }
        case "DELETE": {
            var resultRoom = await _deleteRoom(db, oRoom)
            sRoomNumber = "";
            break;
        }
    }

    if (sRoomNumber) {
        var resultStudentsC = await _createStudents(db, aStudents, sRoomNumber)
    }

    var resultStudentsD = await _updateStudents(db, aStudents, sRoomNumber)
    var resultStudentsU = await _deleteStudents(db, aStudents, sRoomNumber)

    return req;
    // return (db.read("Rooms").where({RoomNumber: oRoom.RoomNumber}))[0]
}

async function createNewRoom(db, oRoom) {
    var aStudents = oRoom.Students;
    var resultRoom = await _createRoom(db, oRoom)

    var resultStudentsC = await _createStudents(db, aStudents, oRoom.RoomNumber)
    var resultStudentsU = await _deleteStudents(db, aStudents, oRoom.RoomNumber)
    var resultStudentsD = await _updateStudents(db, aStudents, oRoom.RoomNumber)
}

async function updateExistingRoom(db, oRoom) {
    var aStudents = oRoom.Students;
    var resultRoom = await _updateRoom(db, oRoom)

    var resultStudentsC = await _createStudents(db, aStudents, oRoom.RoomNumber)
    var resultStudentsU = await _deleteStudents(db, aStudents, oRoom.RoomNumber)
    var resultStudentsD = await _updateStudents(db, aStudents, oRoom.RoomNumber)
}

async function _deleteRoom(db, oRoom) {
    return await db.run(DELETE.from('Rooms').where({RoomNumber: oRoom.RoomNumber}))
}

async function _updateRoom(db, oRoom) {
    delete oRoom.Students;
    oRoom.ActionIndicator = "";
    return await db.run(UPDATE('Rooms').set(oRoom).where({RoomNumber: oRoom.RoomNumber}))
}

async function _createRoom(db, oRoom) {
    delete oRoom.Students;
    oRoom.ActionIndicator = "";
    return await db.run(INSERT.into('Rooms').rows(oRoom))
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

