const db = require("../models");
const Teachers = db.teachers;
const Students = db.students;
const Registered = db.registered;
const Op = db.Sequelize.Op;

// Create and Save a new student and teachers
exports.create = async (req, res) => {
    // Validate request
    if ((req.body.teacher || req.body.teachers) && (req.body.student || req.body.students)) {
        const users = [];
        const tasks = [];

        // check for key 'teacher' or 'teachers'/'student' or 'students' is being used
        // Create a user
        if (req.body.teacher) {
            if (req.body.student) {
                users.push(retUserObj(req.body.teacher, req.body.student));
            }
            else {
                req.body.students.forEach(function(student) {
                    users.push(retUserObj(req.body.teacher, student));
                });
            }
        }
        else {
            if (req.body.teachers) {
                req.body.teachers.forEach(function(teacher) {
                    if (req.body.students) {
                        req.body.students.forEach(function(student) {
                            users.push(retUserObj(teacher, student));
                        });
                    }
                    else {
                        users.push(retUserObj(teacher, req.body.student));
                    }
                });
    
            }
        }
    
        // process each user individually
        for (const user of users) {
            await addUser(user);
        }

        res.status(204).send(Promise.resolve());
    }
    else {
        res.status(400).send({"message": "Invalid data provided"});
    }

    function retUserObj(teacher, student){
        return {
            teacher: teacher,
            student: student
        }
    }

    async function addUser (user) {
        try {
            const teacher = await Teachers.findOrCreate({ where: { email: user.teacher }});
            const student = await Students.findOrCreate({ where: { email: user.student }});
            
            if (teacher[1] === true || student[1] === true) { return await Registered.create({ teacherId: teacher[0].id, studentId: student[0].id }); }
            else { return Promise.resolve(); }
        } 
        catch (err) {
            res.status(400).send({"message": err || "Some error occurred while registering teachers and students."});
        }
    }
};

exports.commonStudents = async (req, res) => {
    if (req.query.teacher) {
        try {
            let list = await Teachers.findAll({ where: {email: req.query.teacher}, include: Registered });
           
            if (list.length === 0) {
                res.status(400).send({"message": "No such teacher registered!"});
                return;
            }

            // get all studentIDs and flatten the array
            // get only duplicates if more than 1
            list = list.map((teacher) => teacher.registereds.map((obj) => obj.studentId));
            list = list.length > 1 ? [].concat.apply([], list).reduce((acc, v, i, arr) => arr.indexOf(v) !== i && acc.indexOf(v) === -1 ? acc.concat(v) : acc, []) : [].concat.apply([], list);

            let students = await Students.findAll({ attributes: ['email'], where: { id: list }});

            if (students.length === 0) {
                res.status(400).send({"message": "No student registered to these teachers!"});
                return;
            }
            else {
                students = students.map((obj) => obj.email);
                const mssg = students.length > 1 ? { "students": students } : { "student": students[0] };
                res.status(200).send(JSON.stringify(mssg));
            }
        }
        catch(err) {
            res.status(400).send({"message": err || "Some error occurred while registering teachers and students."});
        }
    }
    else {
        res.status(400).send({"message": "No teacher provided"});
    }
};

exports.suspend = async (req, res) => {
    const studs = req.body.student;

    if (studs) {
        try {
            await Students.update({ isSuspended: true }, {where: {email: studs}});

            res.status(204).send({"message": "Student is suspended"});
        }
        catch (err) {
            res.status(400).send({"message": err || "Some error occurred while suspending students"});
        }
    }
    else {
        res.status(400).send({"message": "No students provided!"});
    }
}

exports.notification = async (req, res) => {
    const teacher = req.body.teacher;
    let matches = req.body.notification.split(' ').filter((match) => match.charAt(0) === '@').map((email) => email.substr(1)); //get those string that starts with @
    matches = matches ? matches : [];

    if (teacher) {
        try {
            let list = await Teachers.findAll({ where: {email: teacher}, include: Registered });
            list = list[0].registereds.map((obj) => obj.studentId);

            let students = await Students.findAll({ attributes: ['email'], where: { id: list, isSuspended: false }, group: ['email'] });
        
            if (students.length > 0) {
                students.forEach(function(obj) {
                    if (matches.indexOf(obj.email) === -1) { matches.push(obj.email); }
                });
            }
            
            if (matches.length > 0) { res.status(200).send(JSON.stringify({recipients: matches})); }
            else { res.status(400).send({"message": "No student found to send notification!"}); }
        }
        catch {
            res.status(400).send({"message": err || "Some error occurred while fetching list of students"});
        }
        
    }
    else {
        res.status(400).send({"message": "No teacher provided!"});
    }
};
