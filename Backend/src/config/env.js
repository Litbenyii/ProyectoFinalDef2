require("dotenv").config();

const config = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || "super-secret-key-change-me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "8h",
};

module.exports = config;
