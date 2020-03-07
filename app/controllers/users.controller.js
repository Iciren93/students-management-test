const db = require("../models");
const Users = db.users;
const Op = db.Sequelize.Op;

// Create and Save a new student and teachers
exports.create = (req, res) => {
    // Validate request
    if ((req.body.teacher || req.body.teachers) && (req.body.student || req.body.students)) {
        const users = [];
        const tasks = [];

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
    
        users.forEach(function(user) {
            tasks.push(addUser(user));
        });
    
        Promise.all(tasks).then(function() {
            res.status(204).send({"message": "Registration successful"});
        });
    }
    else {
        res.status(400).send({"message": "Invalid data provided"});
    }

    function retUserObj(teacher, student){
        return {
            teacher: teacher,
            student: student,
            isSuspended: false // default
        }
    }

    async function addUser (user) {
        try {
            const count = await Users.count({ where: { teacher: user.teacher, student: user.student }});
            
            if (count === 0) { await Users.create(user); }
            else { return Promise.resolve(); }
        } 
        catch (err) {
            console.error(err || "Some error occurred while registering teachers and students.");
        }
    }
};

exports.commonStudents = async (req, res) => {
    const unique_students = [];
    let mssg = '';

    if (req.query.teacher) {
        try {
            const students = await Users.findAll({ attributes: ['student'], where: { teacher:  req.query.teacher } });

            if (students.length === 0) {
                res.status(400).send({"message": "No such teacher registered!"});
            }
            else {
                students.forEach(function(stud) {
                    if (unique_students.indexOf(stud.student) === -1) { unique_students.push(stud.student); }
                });

                mssg = unique_students.length > 1 ? { students: unique_students } : { student: unique_students[0] };

                res.status(200).send(JSON.stringify(mssg));
            }
        }
        catch(err) {
            console.error(err || "Some error occurred while fetching common students.");
        }
    }
    else {
        res.status(400).send({"message": "No teacher provided"});
    }
};

exports.suspend = (req, res) => {
    const studs = req.body.student || req.body.students;
    const tasks = [];

    if (studs) {
        try {
            if (typeof studs === 'string') {
                tasks.push(suspendStudent(studs));
            }
            else { 
                studs.forEach(function(student) { 
                    tasks.push(suspendStudent(student)); 
                });
            }
            
            Promise.all(tasks).then(function() {
                res.status(204).send({"message": "Student is suspended"});
            });
        }
        catch (err) {
            console.error(err || "Some error occurred while suspending students");
        }
    }
    else {
        res.status(400).send({"message": "No students provided!"});
    }

    async function suspendStudent(student) {
        try {
            await Users.update({ isSuspended: true }, {where: {student: student}});
        }
        catch (err) {
            console.error(err || "Some error occurred while suspending students");
        }

    }
}

exports.notification = async (req, res) => {
    const teacher = req.body.teacher;
    let matches = req.body.notification.match(/@.+@.+\..+. |@.+@.+\..+./g);
    matches = matches ? matches.map(match => match.trim().substr(1)) : [];

    if (teacher) {
        let students = await Users.findAll({ attributes: ['student'], where: { teacher: teacher, isSuspended: false } });

        students.forEach(function(stud) {
            if (matches.indexOf(stud.student) === -1) { matches.push(stud.student); }
        });

        res.status(200).send(JSON.stringify({recipients: matches}));
    }
    else {
        res.status(400).send({"message": "No teacher provided!"});
    }
};
