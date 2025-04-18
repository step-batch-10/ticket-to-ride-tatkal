const renderMap = async () => {
  const response = await fetch("/game/map");
  const map = await response.json();
  const mapContainer = document.querySelector("#mapContainer");
  mapContainer.innerHTML = map.svg;
};

const renderFaceupCards = async () => {
  const res = await fetch("/game/face-up-cards");
  const cards = await res.json();
  console.log(cards);

  const faceupContainer = document.querySelector("#face-up-container");
  cards.forEach((card) => {
    const div = document.createElement("div");
    div.classList.add("face-up-card");
    div.style.backgroundColor = card.color;
    faceupContainer.appendChild(div);
  });
};

const drawDestinationCards = async () => {
  const res = await fetch("/game/destination-cards");
  const cards = await res.json();
  console.log(cards);
};

const renderPage = () => {
  renderMap();
  renderFaceupCards();
};

const main = () => {
  const destinationBtn = document.querySelector("#destination-tickets");
  destinationBtn.addEventListener("click", drawDestinationCards);

  renderPage();
};

globalThis.onload = main;
