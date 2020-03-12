module.exports = (sequelize, Sequelize) => {
    const Students = sequelize.define("students", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        email: {
            type: Sequelize.STRING
        },
        isSuspended: {
            type: Sequelize.BOOLEAN,
            defaultValue: false //by default all students are not suspended
        }
    });
  
    return Students;
  };