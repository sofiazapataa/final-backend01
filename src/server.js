import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

import { initMongoDB } from "./config/mongodb.js";

import viewsRouter from "./routes/views.router.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";

import { ProductModel } from "./models/product.model.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);

app.set("io", io);

// Routers
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Sockets realtime
io.on("connection", async (socket) => {
  const products = await ProductModel.find().lean();
  socket.emit("array-productos", products);

  socket.on("new-product", async (payload) => {
    try {
      await ProductModel.create(payload);
      io.emit("array-productos", await ProductModel.find().lean());
    } catch (err) {
      socket.emit("errorMsg", err.message);
    }
  });

  socket.on("delete-product", async (id) => {
    try {
      await ProductModel.findByIdAndDelete(id);
      io.emit("array-productos", await ProductModel.find().lean());
    } catch (err) {
      socket.emit("errorMsg", err.message);
    }
  });
});

// Arranque seguro (sin top-level await raro)
const start = async () => {
  await initMongoDB();
  httpServer.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
};

start();
