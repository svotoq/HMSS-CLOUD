const cds = require("@sap/cds")
const { Rooms, Students } = cds.entities;


/** Service implementation for Hostel Service */
module.exports = cds.service.impl((srv) => {
    srv.on("UPDATE", "Rooms", _updateRoomLogic)
    // srv.before(["CREATE", "UPDATE"], "Students", _hasEmptyPlaces)
    // srv.after(["CREATE", "UPDATE"], "Students", _reduceTakenPlaces)
})

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
        aStudents = oRoom.Students,
        sRoomNumber = oRoom.RoomNumber;

    if (aStudents) {
        var aRoomStudents = aStudents.filter(function (oStudent) {
            return oStudent.ActionIndicator !== "DELETE";
        });

        oRoom.EmptyPlaces = oRoom.Capacity - aRoomStudents.length;

        if (oRoom.EmptyPlaces < 0) {
            return req.error(409, `Reduce the number of students. Room Capacity is ${oRoom.Capacity}`);
        }
    }
    const db = cds.transaction(req)

    if (oRoom.ActionIndicator === "DELETE") {
        sRoomNumber = "";
        _deleteRoom(db, oRoom)
    }

    if (aStudents) {
        var aStudentsToDelete = aStudents.filter(function (oStudent) {
            return oStudent.ActionIndicator === "DELETE";
        });
        await _deleteStudents(db, aStudentsToDelete);

        var aStudentsToUpdate = aStudents.filter(function (oStudent) {
            return oStudent.ActionIndicator === "UPDATE";
        });

        await _updateStudents(db, aStudentsToUpdate, sRoomNumber);

        var aStudentsToCreate = aStudents.filter(function (oStudent) {
            return oStudent.ActionIndicator === "CREATE";
        });

        await _createStudents(db, aStudentsToCreate, sRoomNumber);

    } else {
        var aRoomStudents = await db.read("Students").where({ Room_RoomNumber: sRoomNumber });
        oRoom.EmptyPlaces = oRoom.Capacity - aRoomStudents.length;
    }

    if (oRoom.ActionIndicator === "UPDATE") {
        _updateRoom(db, oRoom)
    } else if (oRoom.ActionIndicator === "CREATE") {
        _createRoom(db, oRoom)
    }

    return (db.read("Rooms").where({ RoomNumber: sRoomNumber }))[0]
}

async function _createStudents(db, aStudents, sRoomNumber) {
    aStudents.forEach(function (oStudent) {
        oStudent.ActionIndicator = "";
        oStudent.Room_RoomNumber = sRoomNumber;
        db.run(INSERT.into('Students').rows(oStudent))
    });
}

async function _updateStudents(db, aStudents, sRoomNumber) {
    aStudents.forEach(function (oStudent) {
        oStudent.ActionIndicator = "";
        oStudent.Room_RoomNumber = sRoomNumber;
        db.run(UPDATE('Students').set(oStudent).byKey(oStudent.ID))
    });
}

async function _deleteStudents(db, aStudents) {
    aStudents.forEach(function (oStudent) {
        oStudent.Room_RoomNumber = "";
        db.run(UPDATE('Students').set(oStudent).byKey(oStudent.ID))
    });
}

async function _deleteRoom(db, oRoom) {
    db.run(DELETE.from('Rooms').byKey(oRoom.RoomNumber))
}

async function _updateRoom(db, oRoom) {
    delete oRoom.Students;
    oRoom.ActionIndicator = "";
    db.run(UPDATE('Rooms').set(oRoom).where({ RoomNumber: oRoom.RoomNumber }))
}

async function _createRoom(db, oRoom) {
    delete oRoom.Students;
    oRoom.ActionIndicator = "";
    db.run(INSERT.into('Rooms').rows(oRoom))
}