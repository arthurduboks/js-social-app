const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_DB);

const start = async () => {
  await client.connect();
  module.exports = client.db();
  const app = require("./app");
  // App listen
  app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}`);
  });
};

start();
