const dbConfig = require("../../config/db.config");

// Based on the user stories, I believe there is no need for Normalised database design for this case 
// as there is no clear indication whether a student can be added without teacher or vice versa.
// Thus, a single table which maps student and teacher relationship is enough to satisfy the rest API requests.
// Instead of creating table for teachers, students, and relation (normalised database design)
const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./users.model.js")(sequelize, Sequelize);

module.exports = db;