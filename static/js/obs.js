const obss = [
  {
    name: "Anthony Bourdain Parts Unknown",
    url: "https://www.youtube.com/@AnthonyBourdainPartsUnknown",
  },
  {
    name: "DIRT",
    url: "https://www.youtube.com/watch?v=iXbHTtsCd_E&list=PLjHRKTS-Q5-CeCo66kFGivBMF8qB8orPh",
  },
  {
    name: "The fear of being average",
    url: "https://www.youtube.com/watch?v=BLl3xREFEsY",
  },
  {
    name: "Predictive History",
    url: "https://www.youtube.com/@PredictiveHistory",
  },
  { name: "Game Theory", url: "https://www.youtube.com/watch?v=ivfw_TcsHbw" },
  {
    name: "The thinking game",
    url: "https://www.youtube.com/watch?v=d95J8yzvjbQ",
  },
  {
    name: "Principles by Ray Dalio",
    url: "https://www.youtube.com/@principlesbyraydalio",
  },
  { name: "Asianometry", url: "https://www.youtube.com/@Asianometry" },
  {
    name: "UV lithography",
    url: "https://www.youtube.com/watch?v=MiUHjLxm3V0",
  },
  {
    name: "Aryan Invasion/ Aryan Migration theory",
    url: "https://www.youtube.com/watch?v=PiOvI_lueQQ",
  },
  { name: "ColdFusion", url: "https://www.youtube.com/@ColdFusion" },
  { name: "Yellow Dude", url: "https://www.youtube.com/@yellowdude_co" },
  {
    name: "The Ultimate Goal",
    url: "https://www.youtube.com/watch?v=N5nXUht7BhQ",
  },
  {
    name: "Ergo Keyboards",
    url: "http://xahlee.info/kbd/ergonomic_keyboards_index.html",
  },
  /*{ name: "", url: "" },
  { name: "", url: "" },
  { name: "", url: "" },*/
];

function pickRandomObs() {
  const pick = obss[Math.floor(Math.random() * obss.length)];
  const link = document.getElementById("rh");

  if (link) {
    link.href = pick.url;
  }
}

document.addEventListener("DOMContentLoaded", pickRandomObs);
