const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/productModel");
const app = express();
const numCPUs = require("os").cpus().length;
const cluster = require("cluster");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Hello NODE API");
   console.log('Received request:', req.method, req.url)
  // res.send('Hello, World!')
});

app.get("/blog", (req, res) => {
  res.send("Hello Blog, My name is Devtamin");
});

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/products", async (req, res) => {
  try {
    console.log("okok", req.body);
    const product = await Product.create(req.body);
    res.status(200).json(product);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});
// app.post("/products", async (req, res) => {
//   try {
//     const product = new Product(req.body); // create a new Product instance using the model
//     await product.save(); // save the product to the database
//     res.status(200).json(product);
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ message: error.message });
//   }
// });

// update a product
app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body);
    // we cannot find any product in database
    if (!product) {
      return res
        .status(404)
        .json({ message: `cannot find any product with ID ${id}` });
    }
    const updatedProduct = await Product.findById(id);
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete a product

app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res
        .status(404)
        .json({ message: `cannot find any product with ID ${id}` });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

if (cluster.isMaster) {
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case, it is an Express app
  const uri =
    "mongodb+srv://sameer:abc1234@cluster0.eemph1l.mongodb.net/Node-test?retryWrites=true&w=majority";
  mongoose.set("strictQuery", false);
  mongoose
    .connect(uri)
    .then(() => {
      console.log("connected to MongoDB");
      app.listen(3000, () => {
        console.log(`Node API app is running on port 3000`);
      });
    })
    .catch((error) => {
      console.log(error);
    });
}
// This example creates an Express app that defines routes for creating, reading, updating, and deleting resources. It also includes logic for creating a cluster of worker processes that share a single TCP connection to listen for incoming requests. Note that this code assumes you have defined your MongoDB connection string and any relevant models/controllers.
