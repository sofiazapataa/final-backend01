import { Router } from "express";
import { ProductModel } from "../models/product.model.js";

const router = Router();

// GET /api/products?limit=&page=&sort=&query=
// query: category ("mates") o status ("true"/"false")
// sort: asc | desc (por price)
router.get("/", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const sort = req.query.sort;   // asc | desc
    const query = req.query.query; // category o status

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

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;

    const buildLink = (targetPage) => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("page", String(targetPage));
      if (sort) params.set("sort", sort);
      if (query) params.set("query", query);
      return `${baseUrl}?${params.toString()}`;
    };

    res.json({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
      nextLink: result.hasNextPage ? buildLink(result.nextPage) : null,
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ status: "error", error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// POST /api/products
router.post("/", async (req, res) => {
  try {
    const created = await ProductModel.create(req.body);

    // (si tenés realtime abierto)
    const io = req.app.get("io");
    if (io) {
      const all = await ProductModel.find().lean();
      io.emit("array-productos", all);
    }

    res.status(201).json(created.toObject());
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// PUT /api/products/:id
router.put("/:id", async (req, res) => {
  try {
    const updated = await ProductModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      lean: true,
    });
    if (!updated) return res.status(404).json({ status: "error", error: "Product not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await ProductModel.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ status: "error", error: "Product not found" });

    const io = req.app.get("io");
    if (io) {
      const all = await ProductModel.find().lean();
      io.emit("array-productos", all);
    }

    res.json({ status: "success", message: `Producto con id: ${req.params.id} eliminado` });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

export default router;
