import { Router } from "express";
import { ProductModel } from "../models/product.model.js";
import { CartModel } from "../models/cart.model.js";

const router = Router();

// HOME (lista simple)
router.get("/", async (req, res) => {
  try {
    const products = await ProductModel.find().lean();
    res.render("home", { products });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// REALTIME (la vista ya la tenías)
router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await ProductModel.find().lean();
    res.render("realTimeProducts", { products });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// /products (index con paginación)
router.get("/products", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const sort = req.query.sort;
    const query = req.query.query;
    const cid = req.query.cid || ""; // opcional para botón agregar

    const filter = {};
    if (query) {
      if (query === "true" || query === "false") filter.status = query === "true";
      else filter.category = query;
    }

    const sortOption =
      sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : undefined;

    const result = await ProductModel.paginate(filter, {
      limit,
      page,
      sort: sortOption,
      lean: true,
    });

    const makeViewLink = (targetPage) => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("page", String(targetPage));
      if (sort) params.set("sort", sort);
      if (query) params.set("query", query);
      if (cid) params.set("cid", cid);
      return `/products?${params.toString()}`;
    };

    res.render("index", {
      products: result.docs,
      page: result.page,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? makeViewLink(result.prevPage) : null,
      nextLink: result.hasNextPage ? makeViewLink(result.nextPage) : null,
      cid,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// /products/:pid (detalle)
router.get("/products/:pid", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.pid).lean();
    if (!product) return res.status(404).send("Product not found");

    const cid = req.query.cid || "";
    res.render("productDetail", { product, cid });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// /carts/:cid (vista carrito)
router.get("/carts/:cid", async (req, res) => {
  try {
    const cart = await CartModel.findById(req.params.cid)
      .populate("products.product")
      .lean();

    if (!cart) return res.status(404).send("Cart not found");

    res.render("cart", { cart });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;
