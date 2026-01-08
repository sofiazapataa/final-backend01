import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { productManager } from "./product-manager.js";

class CartManager {
  constructor(path) {
    this.path = path;
  }

  getAll = async () => {
    try {
      if (fs.existsSync(this.path)) {
        const carts = await fs.promises.readFile(this.path, "utf-8");
        return JSON.parse(carts);
      }
      return [];
    } catch (error) {
      throw new Error(error);
    }
  };

  // Crear un nuevo carrito
  create = async () => {
    try {
      const carts = await this.getAll();

      const cart = {
        id: uuidv4(), 
        products: [
          // { product: idProd, quantity: 1 }
        ],
      };

      carts.push(cart);
      await fs.promises.writeFile(this.path, JSON.stringify(carts));
      return cart;
    } catch (error) {
      throw new Error(error);
    }
  };

  // Obtener carrito por id
  getById = async (id) => {
    try {
      const carts = await this.getAll();
      const cart = carts.find((cart) => cart.id === id);
      if (!cart) throw new Error("Cart not found");
      return cart;
    } catch (error) {
      throw new Error(error);
    }
  };

  addProdToCart = async (idCart, idProd) => {
    try {
      await productManager.getById(idProd); 

      const carts = await this.getAll();
      const cartIndex = carts.findIndex((cart) => cart.id === idCart);
      if (cartIndex === -1) {
        throw new Error("Cart not found");
      }

      const cart = carts[cartIndex];

      const productInCart = cart.products.find(
        (prod) => prod.product === idProd
      );

      if (productInCart) {
        productInCart.quantity += 1;
      } else {
        cart.products.push({
          product: idProd,
          quantity: 1,
        });
      }

      // Actualiza archivo
      carts[cartIndex] = cart;
      await fs.promises.writeFile(this.path, JSON.stringify(carts));

      return cart;
    } catch (error) {
      throw new Error(error);
    }
  };
}

export const cartManager = new CartManager("./data/carts.json");

//  este sabe: crear carrito, traer un carrito, agregar producto a carrito.
