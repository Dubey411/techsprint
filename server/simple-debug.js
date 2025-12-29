const { admin, db } = require("./src/config/db");
async function run() {
  try {
    await db.collection("users").limit(1).get();
    console.log("SUCCESS");
  } catch (e) {
    console.log("ERROR_MESSAGE:" + e.message);
  }
}
run();
