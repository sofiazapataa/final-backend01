import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

import { productManager } from "./managers/product-manager.js"; 

import viewsRouter from "./routes/views.router.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();
const port = 8080;


server.use(express.json());
server.use(express.static(path.join(__dirname, "public")));


server.engine("handlebars", engine());
server.set("view engine", "handlebars");
server.set("views", path.join(__dirname, "views"));


const httpServer = createServer(server);
const io = new SocketIOServer(httpServer);


server.set("io", io);

/* ----------------------------- ROUTERS ----------------------------- */

server.use("/", viewsRouter);


server.use("/api/products", productsRouter);
server.use("/api/carts", cartsRouter);

/* ----------------------------- SOCKETS ----------------------------- */

io.on("connection", async (socket) => {
  socket.emit("array-productos", await productManager.getAll());

  socket.on("new-product", async (payload) => {
    try {
      await productManager.create(payload);
      io.emit("array-productos", await productManager.getAll());
    } catch (err) {
      socket.emit("errorMsg", err.message);
    }
  });

  socket.on("delete-product", async (id) => {
    try {
      await productManager.delete(id);
      io.emit("array-productos", await productManager.getAll());
    } catch (err) {
      socket.emit("errorMsg", err.message);
    }
  });
});

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
