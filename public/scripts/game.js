const renderMap = async () => {
  const response = await fetch("/game/map");
  const map = await response.json();
  const mapContainer = document.querySelector("#mapContainer");
  mapContainer.innerHTML = map.svg;
};

const renderPage = () => {
  renderMap();
};

const main = () => {
  renderPage();
};

globalThis.onload = main;
