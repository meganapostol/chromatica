// Pre-seeded color archive. No runtime AI calls.
const COLORS = [
  {
    id: "tyrian-purple",
    name: "Tyrian Purple",
    hex: "#66023C",
    hueFamily: "purple",
    hueOrder: 287,
    image: "/images/tyrian-purple.jpg",
    etymology: { narrative: "From the Ancient Greek Tyrios, of Tyre, the Phoenician city where the dye was first cultivated from murex sea snails, c. 1600 BCE." },
    nature: ["Murex sea snail mucus glands", "Bougainvillea bracts", "Certain orchid petals"],
    history: ["Phoenician royal dye, c. 1600 BCE", "Roman senatorial robe stripe", "Byzantine emperor's exclusive shade"],
    voice: "I was killed for, once, by the thousand.",
    lost: "Mediterranean murex populations have declined 64% since 1990 due to ocean acidification.",
    companions: ["#8B0E4D", "#3D0224", "#A11D5C", "#220112", "#4A0227"]
  },
  {
    id: "vantablack",
    name: "Vantablack",
    hex: "#000000",
    hueFamily: "black",
    hueOrder: 0,
    image: "/images/vantablack.jpg",
    etymology: { narrative: "Vertically Aligned NanoTube Array Black. Developed 2014 by Surrey NanoSystems. Absorbs 99.965% of visible light." },
    nature: ["Bird-of-paradise feathers (structural)", "Deep-sea anglerfish skin", "Black hole event horizons"],
    history: ["Anish Kapoor purchased exclusive artistic rights, 2016", "Stuart Semple released Pinkest Pink in protest", "Used in NASA stray-light suppression"],
    voice: "I am where the light goes to disappear.",
    lost: "Real darkness is dying. 80% of humans now live under light-polluted skies.",
    companions: ["#0A0A0F", "#1A1A1A", "#2D2D2D", "#050508", "#000000"]
  },
  {
    id: "yinmn-blue",
    name: "YInMn Blue",
    hex: "#2E5894",
    hueFamily: "blue",
    hueOrder: 220,
    image: "/images/yinmn.jpg",
    etymology: { narrative: "Yttrium, Indium, Manganese. Discovered by accident in 2009 by chemistry student Andrew Smith at Oregon State University. The first new blue pigment in over 200 years." },
    nature: ["Lapis lazuli mineral veins", "Certain morpho butterfly wings", "Twilight skies at altitude"],
    history: ["First new blue since cobalt blue, 1802", "Released to artists, 2017", "Crayola named a crayon after it, 2017"],
    voice: "I was born by accident in a furnace and they couldn't stop staring.",
    lost: "She is one of the only colors whose story is gain, not loss. She survives.",
    companions: ["#1B3A6F", "#4A7BB8", "#0F2547", "#5E8FC9", "#2E5894"]
  }
];

export default COLORS;