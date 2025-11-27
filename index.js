const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// middleware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("VistaPulse server is running");
});

// create mongodb client
const client = new MongoClient(process.env.URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("VistaPulseDB");
    const blogsCollection = db.collection("blogs");

    // store blog
    app.post("/blogs", async (req, res) => {
      const blog = req.body;
      try {
        const result = await blogsCollection.insertOne(blog);
        res.send(result);
      } catch (error) {
        res.status(500).send({
          message: "Failed to create blog",
          error: error.message,
        });
      }
    });

    // get blog data
    app.get("/blogs", async (req, res) => {
      try {
        result = await blogsCollection
          .find()
          .sort({ created_at: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({
          message: "Internal server error",
          error: error.message,
        });
      }
    });

    // get latest blog data
    app.get("/latestBlogs", async (req, res) => {
      const { limit } = req.query;
      console.log(limit);

      try {
        result = await blogsCollection
          .find()
          .limit(Number(limit))
          .sort({ create_at: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({
          message: "Internal server error",
          error: error.message,
        });
      }
    });

    // get latest blog data
    app.get("/blogs/:id", async (req, res) => {
      const { id } = req.params;

      try {
        result = await blogsCollection
          .find({ _id: new ObjectId(id) })
          .toArray();
        res.send(result[0]);
      } catch (error) {
        res.status(500).send({
          message: "Internal server error",
          error: error.message,
        });
      }
    });

    // get blog by user
    app.get("/userBlogs", async (req, res) => {
      const { email } = req.query;
      console.log(email);
      const result = await blogsCollection
        .find({ authorEmail: email })
        .sort({ create_at: -1 })
        .toArray();
      res.send(result);
    });

    app.delete("/blogs/:id", async (req, res) => {
      const { id } = req.params;
      const result = await blogsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`VistaPulse listening on port ${port}`);
});
