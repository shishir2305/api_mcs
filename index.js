import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import express from "express";
import "dotenv/config";
import cors from "cors";

// Define the task management app schema
const taskManagementAppSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  status: {
    type: Boolean,
    default: false,
  },
});

// Define the CRUD model
const crudModel = mongoose.model("ManagementApp", taskManagementAppSchema);

async function connectToMongoDB() {
  try {
    const connectionString = process.env.MONGODBURL;

    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }
}

async function CrudApi() {
  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(express.json());
  app.use(cors());

  app.post("/create_task", async (req, res) => {
    try {
      const newTask = new crudModel(req.body);
      await newTask.save();
    } catch (error) {
      console.log("Error while creating task", error);
      res.send("Error while creating task");
    }
    res.send("Task Created Successfully");
  });

  app.get("/read_task", async (req, res) => {
    try {
      const tasks = await crudModel.find({});
      res.send(tasks);
    } catch (error) {
      console.log("Error while reading tasks", error);
      res.send("Error while reading tasks");
    }
  });

  app.patch("/update_task", async (req, res) => {
    try {
      const updatedTask = await crudModel.findOneAndUpdate(
        { _id: req.body._id },
        {
          title: req.body.title,
          description: req.body.description,
          status: req.body.status,
        },
        { new: true }
      );
    } catch (error) {
      console.log("Error while updating task", error);
      res.send("Error while updating task");
    }
    res.send("Task Updated Successfully");
  });

  app.post("/update_status", async (req, res) => {
    try {
      const { _id } = req.body;

      const task = await crudModel.findById(_id);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Toggle the status between "completed" and "pending"
      const newStatus = task.status === false ? true : false;

      // Update the task with the new status
      const updatedTask = await crudModel.findByIdAndUpdate(
        _id,
        { status: newStatus },
        { new: true }
      );

      res.json({ message: "Task Updated Successfully", updatedTask });
    } catch (error) {
      console.error("Error while updating task", error);
      res.status(500).json({ error: "Error while updating task" });
    }
  });

  app.delete("/delete_task", async (req, res) => {
    try {
      await crudModel.deleteOne({ _id: req.body._id });
      console.log("Task Deleted Successfully");
    } catch (error) {
      console.log("Error while deleting task", error);
      res.send("Error while deleting task");
    }
    res.send("Task Deleted Successfully");
  });

  app.get("/ping", (req, res) => {
    res.send("pong");
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

async function main() {
  await connectToMongoDB();
  CrudApi();
}
main();
