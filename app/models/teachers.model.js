module.exports = (sequelize, Sequelize) => {
    const Teachers = sequelize.define("teachers", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        email: {
            type: Sequelize.STRING
        }
    });
  
    return Teachers;
  };