const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "twitterClone.db");

const bcrypt = require("bcrypt");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.post("/register/", async (request, response) => {
  const { username, password, name, gender } = request.body;
  const l = password.length;
  const hashedPassword = bcrypt.hash(password, 10);
  const query = `select * from user where username='${username}'`;
  const r = await db.get(query);
  if (r === undefined) {
    const addQuery = `
        insert into
        user (name,username,password,gender)
        values(
            '${name}',
            '${username}',
            '${hashedPassword}',
            '${gender}'
        )`;
    await db.run(addQuery);
    response.send("User created successfully");
  } else if (l < 6) {
    response.status(400);
    response.send("Password is too short");
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

module.exports = app;
