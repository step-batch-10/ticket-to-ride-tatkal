const renderMap = async () => {
  const response = await fetch("/game/map");
  const map = await response.json();
  const mapContainer = document.querySelector("#mapContainer");
  mapContainer.innerHTML = map.svg;
};

const createFaceUpCard =(card) => {
  const div = document.createElement("div");
  div.classList.add("face-up-card");
  div.style.backgroundColor = card.color;
    div.innerText = card.color
  return div;
}

const renderFaceupCards = async () => {
  const res = await fetch("/game/face-up-cards");
  const cards = await res.json();

  const faceUpDivs = cards.map(createFaceUpCard);
  const faceupContainer = document.querySelector("#face-up-container");
faceupContainer.append(...faceUpDivs)
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
