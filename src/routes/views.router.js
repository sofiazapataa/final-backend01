import { Router } from "express";
import { productManager } from "../managers/product-manager.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const products = await productManager.getAll();
    res.render("home", { products });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await productManager.getAll();
    res.render("realTimeProducts", { products });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;

// Define qué página se muestra cuando entrás a: /realtimeproducts



