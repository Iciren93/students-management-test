module.exports = (sequelize, Sequelize) => {
    const Registered = sequelize.define("registered", {});
  
    return Registered;
  };