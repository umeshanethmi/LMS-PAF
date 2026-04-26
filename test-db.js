const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://uniflex_db_user:uniflex@cluster0.tbo9lco.mongodb.net/lms_assessment_db?appName=Cluster0&retryWrites=true&w=majority";

async function run() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    await client.db("lms_assessment_db").command({ ping: 1 });
    console.log("SUCCESS: Connected to the database.");
  } catch (err) {
    console.error("ERROR: Connection failed.");
    console.error(err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();
