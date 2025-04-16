const loginUser = (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);

  fetch("/login", { method: "POST", body: formData });
};

const main = () => {
  const form = document.querySelector("form");
  form.onsubmit = loginUser;
};

globalThis.onload = main;
