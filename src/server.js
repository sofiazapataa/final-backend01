import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

import { productManager } from "./managers/product-manager.js";
import { cartManager } from "./managers/cart-manager.js";
import viewsRouter from "./routes/views.router.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();
const port = 8080;

server.use(express.json());

server.use(express.static(path.join(__dirname, "public")));

server.engine("handlebars", engine());
server.set("view engine", "handlebars");
server.set("views", path.join(__dirname, "views"));

server.use("/", viewsRouter);

const httpServer = createServer(server);
const io = new SocketIOServer(httpServer);

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

/* ----------------------------- PRODUCTS ----------------------------- */

server.get("/api/products", async (req, res) => {
  try {
    const products = await productManager.getAll();
    res.json(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

server.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productManager.getById(id);
    res.json(product);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

server.post("/api/products", async (req, res) => {
  try {
    const newProduct = await productManager.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

server.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productManager.update(req.body, id);
    res.json(product);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

server.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await productManager.delete(id);
    res.json(response);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/* ------------------------------ CARTS ------------------------------- */

server.post("/api/carts", async (req, res) => {
  try {
    const newCart = await cartManager.create();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

server.get("/api/carts/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.getById(cid);
    res.json(cart.products);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

server.post("/api/carts/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.addProdToCart(cid, pid);
    res.json(updatedCart);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
