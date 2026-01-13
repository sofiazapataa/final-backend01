import { Router } from "express";
import { CartModel } from "../models/cart.model.js";
import { ProductModel } from "../models/product.model.js";

const router = Router();

// POST /api/carts (crea carrito)
router.post("/", async (req, res) => {
  try {
    const cart = await CartModel.create({ products: [] });
    res.status(201).json(cart.toObject());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/carts/:cid (populate)
router.get("/:cid", async (req, res) => {
  try {
    const cart = await CartModel.findById(req.params.cid)
      .populate("products.product")
      .lean();

    if (!cart) return res.status(404).json({ error: "Cart not found" });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/carts/:cid/product/:pid (agrega/incrementa)
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const prodExists = await ProductModel.findById(pid).lean();
    if (!prodExists) return res.status(404).json({ error: "Product not found" });

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const idx = cart.products.findIndex((p) => p.product.toString() === pid);
    if (idx === -1) cart.products.push({ product: pid, quantity: 1 });
    else cart.products[idx].quantity += 1;

    await cart.save();
    res.json(cart.toObject());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/carts/:cid/products/:pid (eliminar producto del carrito)
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.products = cart.products.filter((p) => p.product.toString() !== pid);
    await cart.save();

    res.json(cart.toObject());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/carts/:cid (reemplazar TODO el arreglo products)
// body: { products: [ { product: "<pid>", quantity: 2 }, ... ] }
router.put("/:cid", async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "products must be an array" });
    }

    const cart = await CartModel.findByIdAndUpdate(
      req.params.cid,
      { products },
      { new: true, lean: true }
    );

    if (!cart) return res.status(404).json({ error: "Cart not found" });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/carts/:cid/products/:pid (actualiza SOLO quantity)
// body: { quantity: 5 }
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const qty = Number(req.body.quantity);

    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ error: "quantity must be a number >= 1" });
    }

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.products.find((p) => p.product.toString() === pid);
    if (!item) return res.status(404).json({ error: "Product not in cart" });

    item.quantity = qty;
    await cart.save();

    res.json(cart.toObject());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/carts/:cid (vaciar carrito)
router.delete("/:cid", async (req, res) => {
  try {
    const cart = await CartModel.findById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.products = [];
    await cart.save();

    res.json(cart.toObject());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
