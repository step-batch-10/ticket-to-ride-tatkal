const renderMap = async () => {
  const response = await fetch("/game/map");
  const map = await response.json();
  const mapContainer = document.querySelector("#mapContainer");
  mapContainer.innerHTML = map.svg;
};

const drawDestinationCards = async () => {
  const res = await fetch("/game/destination-cards");
  const cards = await res.json();
  console.log(cards);
};

const renderPage = () => {
  renderMap();
};

const main = () => {
  const destinationBtn = document.querySelector("#destination-tickets");
  destinationBtn.addEventListener("click", drawDestinationCards);

  renderPage();
};

globalThis.onload = main;
