const socket = io();

const productsList = document.getElementById("productsList");
const createForm = document.getElementById("createForm");
const deleteForm = document.getElementById("deleteForm");
const errorP = document.getElementById("error");

socket.on("array-productos", (products) => {
  productsList.innerHTML = "";
  for (const p of products) {
    const li = document.createElement("li");
    li.innerHTML = `<b>${p.title}</b> - $${p.price} (id: ${p._id})`;
    productsList.appendChild(li);
  }
});

socket.on("errorMsg", (msg) => {
  errorP.textContent = msg;
});

createForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const fd = new FormData(createForm);
  const payload = {
    title: fd.get("title"),
    price: Number(fd.get("price")),
    code: fd.get("code"),
    stock: Number(fd.get("stock")),
    category: fd.get("category"),
    status: true,
    thumbnails: [],
  };

  socket.emit("new-product", payload);
  createForm.reset();
});

deleteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(deleteForm);
  socket.emit("delete-product", fd.get("id")); // ahora es _id de mongo
  deleteForm.reset();
});
