const cds = require("@sap/cds")
const {Rooms, Students} = cds.entities;


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
        aStudents = oRoom.Students;

    var aRoomStudents = aStudents.filter(function (oStudent) {
        return oStudent.ActionIndicator !== "DELETE";
    });

    if (aRoomStudents.length > oRoom.Capacity) {
        return req.error(409, `Reduce the number of students. Room Capacity is ${oRoom.Capacity}`);
    }

    const db = cds.transaction(req)

    var aStudentsToDelete = aStudents.filter(function (oStudent) {
        return oStudent.ActionIndicator === "DELETE";
    });
    await _deleteStudents(db, aStudentsToDelete);

    var aStudentsToUpdate = aStudents.filter(function (oStudent) {
        return oStudent.ActionIndicator === "UPDATE";
    });

    await _updateStudents(db, aStudentsToUpdate, oRoom.RoomNumber);

    var aStudentsToCreate = aStudents.filter(function (oStudent) {
        return oStudent.ActionIndicator === "CREATE";
    });

    await _createStudents(db, aStudentsToCreate, oRoom.RoomNumber);
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
        db.run(DELETE.from('Students').byKey(oStudent.ID))
    });
}
