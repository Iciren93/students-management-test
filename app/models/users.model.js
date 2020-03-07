module.exports = (sequelize, Sequelize) => {
    const Users = sequelize.define("users", {
      teacher: {
        type: Sequelize.STRING
      },
      student: {
        type: Sequelize.STRING
      },
      isSuspended: {
        type: Sequelize.BOOLEAN,
        defaultValue: false //by default all students are not suspended
      }
    });
  
    return Users;
  };