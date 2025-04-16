const loginUser = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);

  const res = await fetch("/login", { method: "POST", body: formData });
  globalThis.location = res.url;
};

const main = () => {
  const form = document.querySelector("form");
  form.onsubmit = loginUser;
};

globalThis.onload = main;
