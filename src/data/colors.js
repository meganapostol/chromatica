// Pre-seeded color archive. No runtime AI calls.
const COLORS = [
  {
    "id": "vantablack",
    "name": "Vantablack",
    "hex": "#000000",
    "hueFamily": "black",
    "hueOrder": 0,
    "image": "/images/vantablack.jpg",
    "etymology": {
      "narrative": "Vertically Aligned NanoTube Array Black. Developed in 2014 by Surrey NanoSystems, she absorbs 99.965% of visible light, swallowing depth itself so that any object coated in her appears as a flat silhouette."
    },
    "nature": [
      "Bird-of-paradise feathers (structural absorption)",
      "Deep-sea anglerfish skin",
      "The accretion disk of a black hole"
    ],
    "history": [
      "Anish Kapoor purchased exclusive artistic rights, 2016",
      "Stuart Semple released Pinkest Pink in protest the same year",
      "Used by NASA for stray-light suppression in space telescopes"
    ],
    "voice": "I am where the light goes to disappear.",
    "lost": "Real darkness is dying. Eighty percent of humans now live under light-polluted skies.",
    "companions": ["#0A0A0F", "#1A1A1A", "#2D2D2D", "#050508", "#000000"]
  },
  {
    "id": "cinnabar",
    "name": "Cinnabar",
    "hex": "#E34234",
    "hueFamily": "red",
    "hueOrder": 5,
    "image": "/images/cinnabar.jpg",
    "etymology": {
      "narrative": "From the Greek kinnabari, possibly via Persian. The pigment is mercury sulphide, mined for millennia in Almadén, Spain, and ground into the brilliant orange-red the Romans called minium. Almadén workers rarely lived past forty; the mine was worked partly by convicts and the enslaved from the Roman Republic onward."
    },
    "nature": [
      "Mercury sulphide veins of Almadén, Spain",
      "Macaw breast feathers in flight",
      "Pomegranate seeds split open"
    ],
    "history": [
      "Painted onto Roman frescoes at Pompeii, including the Villa of the Mysteries",
      "Mined at Almadén by enslaved labourers and convicts from the Roman period until the twentieth century",
      "Ingested by Chinese alchemists pursuing immortality, killing several emperors who hoped to live forever"
    ],
    "voice": "I have killed kings who swallowed me hoping to live.",
    "lost": "Almadén closed in 2003 after roughly two thousand years of continuous operation; she is now scarce on the contemporary market, replaced for safety reasons by synthetic vermilion.",
    "companions": ["#A02C3C", "#DC143C", "#FF7F50", "#8B1A0E", "#B71C1C"]
  },
  {
    "id": "mummy-brown",
    "name": "Mummy Brown",
    "hex": "#884C3A",
    "hueFamily": "brown",
    "hueOrder": 14,
    "image": "/images/mummy-brown.jpg",
    "etymology": {
      "narrative": "A pigment manufactured from the actual pulverised remains of Egyptian mummies, animal and human, ground with white pitch and myrrh. Sold by London colour merchants from at least the sixteenth century until the early twentieth, when supplies finally ran out and the practice came to public attention."
    },
    "nature": [
      "Sun-cured leather",
      "Tobacco-leaf ferment",
      "Nile silt at receding flood"
    ],
    "history": [
      "Used by Pre-Raphaelites including Edward Burne-Jones, who buried his tube in his garden after learning her source",
      "Sold by C. Roberson & Co. of London until they exhausted their supply, c. 1964",
      "Praised by some Victorian painters for her unmatched transparency in glazing"
    ],
    "voice": "I am made of people who were promised they would live forever.",
    "lost": "Authentic mummy brown is gone; modern colourmen now sell a synthetic blend under the name, with no ground human remains in the tube.",
    "companions": ["#704214", "#C68E17", "#5C2E0B", "#3E1A0A", "#8B5A2B"]
  },
  {
    "id": "coral",
    "name": "Coral",
    "hex": "#FF7F50",
    "hueFamily": "red",
    "hueOrder": 16,
    "image": "/images/coral.jpg",
    "etymology": {
      "narrative": "From the Greek korallion, 'small stone,' the name applied for millennia to the calcareous skeletons of Mediterranean Corallium rubrum colonies, harvested for jewellery and pigment since the Bronze Age. The colour name was transferred to the bleached pink-orange of polished coral branches."
    },
    "nature": [
      "Corallium rubrum colonies of the Mediterranean",
      "Rose-spotted goatfish flanks",
      "The first sky after a tropical sunrise"
    ],
    "history": [
      "Strung as protective amulets on Roman children, who were thought safer in coral",
      "Carved into rosaries by Italian artisans through the Renaissance",
      "Listed by the IUCN as endangered across much of her historical Mediterranean range, due to overharvesting and warming seas"
    ],
    "voice": "I am a skeleton you wore around your child's neck for luck.",
    "lost": "Mediterranean red coral has been overharvested for two thousand years and entire reef-building coral species are projected to functionally disappear within decades under current ocean-warming trajectories.",
    "companions": ["#E34234", "#E97451", "#FFB07C", "#D45D4A", "#FF9472"]
  },
  {
    "id": "burnt-sienna",
    "name": "Burnt Sienna",
    "hex": "#E97451",
    "hueFamily": "brown",
    "hueOrder": 17,
    "image": "/images/burnt-sienna.jpg",
    "etymology": {
      "narrative": "From the Italian terra di Siena, 'earth of Siena,' after the Tuscan city whose hills yielded the rich iron-oxide clay. The raw earth was orange-brown; 'burnt' sienna is the same pigment after roasting, which deepens her toward red. Standardised in Italian Renaissance workshops from the early 1500s onward."
    },
    "nature": [
      "Tuscan hillsides at harvest",
      "Red fox flank in winter",
      "Iron-stained sandstone canyons"
    ],
    "history": [
      "Standardised in the workshops of the Italian Renaissance",
      "Carried into the Dutch Golden Age via Caravaggio's chiaroscuro",
      "A fixture of every twentieth-century child's first watercolour set"
    ],
    "voice": "I am the colour the soil turns when it has been kept too long in the sun.",
    "lost": "The original Tuscan deposits near Siena are nearly exhausted; most modern burnt sienna is now produced from synthetic iron oxide or from earths imported from Sardinia and Sicily.",
    "companions": ["#C68E17", "#704214", "#FF7F50", "#A0522D", "#D2691E"]
  },
  {
    "id": "sepia",
    "name": "Sepia",
    "hex": "#704214",
    "hueFamily": "brown",
    "hueOrder": 30,
    "image": "/images/sepia.jpg",
    "etymology": {
      "narrative": "From the Greek sēpia, 'cuttlefish.' Made from the dried ink of Sepia officinalis, pressed and refined into a rich brown wash. Standardised as artist's pigment in late eighteenth-century Dresden by Jacob Seydelmann. By the nineteenth century she had become the default tone of photographic prints, and so the colour the modern world remembers its grandparents in."
    },
    "nature": [
      "Cuttlefish ink sacs",
      "Late-autumn beech leaves",
      "Driftwood after a long tide"
    ],
    "history": [
      "Used by Roman scribes for ink at sea, c. 100 BCE",
      "Refined for artists by Jacob Seydelmann, Dresden, late 1700s",
      "Became the default tone of nineteenth-century albumen prints, and so the colour the modern world remembers its grandparents in"
    ],
    "voice": "I am the ink of a creature that hides inside her own shadow.",
    "lost": "Mediterranean cuttlefish stocks are declining sharply from overfishing and warming waters, with several historical fishing basins now near collapse.",
    "companions": ["#884C3A", "#C68E17", "#3E1A0A", "#5C2E0B", "#E97451"]
  },
  {
    "id": "indian-yellow",
    "name": "Indian Yellow",
    "hex": "#E3A857",
    "hueFamily": "yellow",
    "hueOrder": 35,
    "image": "/images/indian-yellow.jpg",
    "etymology": {
      "narrative": "A pigment made from the urine of cows force-fed only mango leaves, drained and reduced into bright yellow lumps. Manufactured in the Indian state of Bihar from at least the fifteenth century until the practice was banned in the early twentieth, after British colonial inspectors documented the cattle's slow starvation."
    },
    "nature": [
      "Late mango flesh",
      "Goldenrod fields in autumn",
      "Saffron-stained temple stone"
    ],
    "history": [
      "Imported to Europe from Bihar, India, from the seventeenth century onward",
      "Used by J.M.W. Turner, Vermeer, and the Dutch masters for warm flesh tones",
      "Banned around 1908 by colonial authorities after public outcry over the cattle's treatment"
    ],
    "voice": "I came from creatures who were starved on a single leaf so that I could glow.",
    "lost": "True Indian yellow has not been manufactured for over a century; tubes sold under her name today are synthetic blends formulated to match her warmth.",
    "companions": ["#F0B400", "#F2A900", "#FADA5E", "#FFA000", "#C68E17"]
  },
  {
    "id": "orpiment",
    "name": "Orpiment",
    "hex": "#FFA000",
    "hueFamily": "yellow",
    "hueOrder": 38,
    "image": "/images/orpiment.jpg",
    "etymology": {
      "narrative": "From the Latin auripigmentum, 'gold pigment.' A natural form of arsenic sulphide, mined as bright yellow crystals. Used in Egypt, China, and across the medieval Islamic world for illumination, despite being violently toxic to grind, breathe, and apply."
    },
    "nature": [
      "Volcanic fumarole crystals",
      "Yellow arsenic sulphide veins",
      "Tiger swallowtail wing scales"
    ],
    "history": [
      "Used by Egyptian scribes on the Book of the Dead",
      "Ground for Persian and Mughal manuscript illumination",
      "Slowly poisoned generations of monastery scriptorium workers, who eventually learned to recognise her smell"
    ],
    "voice": "I look like sunlight. I am the colour of slow murder.",
    "lost": "Banned from artist's palettes in most of the developed world from the early twentieth century onward; modern reconstructions use safer cadmium-based substitutes.",
    "companions": ["#F0B400", "#E3A857", "#FADA5E", "#F2A900", "#C68E17"]
  },
  {
    "id": "ochre",
    "name": "Ochre",
    "hex": "#C68E17",
    "hueFamily": "earth",
    "hueOrder": 41,
    "image": "/images/ochre.jpg",
    "etymology": {
      "narrative": "From the Ancient Greek ōkhros, 'pale yellow.' A clay coloured by limonite, a hydrated iron oxide. The oldest pigment in human history, used in Blombos Cave, South Africa, c. 100,000 years ago, and present at almost every site of human habitation on every inhabited continent."
    },
    "nature": [
      "Australian outback stone at midday",
      "Limonite clay deposits worldwide",
      "Lion fur in dry-season grasslands"
    ],
    "history": [
      "Worked into pigment crayons in Blombos Cave, South Africa, c. 100,000 BCE",
      "Found on the bodies of buried Neanderthals at Qafzeh and Skhul",
      "Mined commercially in Roussillon, France, since Roman times"
    ],
    "voice": "I was the first colour you ever held in your hand.",
    "lost": "Synthetic iron oxide has nearly replaced traditional Roussillon ochre in commercial paint; the old quarries now operate mostly as a heritage site for tourists.",
    "companions": ["#704214", "#E97451", "#884C3A", "#FADA5E", "#A0522D"]
  },
  {
    "id": "saffron",
    "name": "Saffron",
    "hex": "#F2A900",
    "hueFamily": "yellow",
    "hueOrder": 42,
    "image": "/images/saffron.jpg",
    "etymology": {
      "narrative": "From the Arabic za'farān, traced through the Old French safran. The dye is the dried red stigma of Crocus sativus, a sterile flower that must be hand-propagated bulb by bulb. One pound of saffron requires roughly seventy-five thousand flowers, hand-harvested at dawn."
    },
    "nature": [
      "Crocus sativus stigma at dawn",
      "Tiger's-eye gemstone polished thin",
      "Buddhist monk's robes drying on a line"
    ],
    "history": [
      "Cultivated by the Minoans of Crete, c. 1700 BCE, who painted its harvest on the walls of Akrotiri",
      "Smuggled into Saffron Walden, England, in the fourteenth century in a hollowed-out pilgrim's staff",
      "Still the most expensive spice on earth by weight"
    ],
    "voice": "I am worth my weight in blood and pulled from a flower by hand at dawn.",
    "lost": "Climate-driven heatwaves in Iran and Kashmir, which together produce most of the world's saffron, have pushed crocus harvests into sharp decline since 2010.",
    "companions": ["#F0B400", "#E3A857", "#FFA000", "#FADA5E", "#E49B0F"]
  },
  {
    "id": "gamboge",
    "name": "Gamboge",
    "hex": "#F0B400",
    "hueFamily": "yellow",
    "hueOrder": 45,
    "image": "/images/gamboge.jpg",
    "etymology": {
      "narrative": "From the Latin Cambodia, the country in which the resin-bearing Garcinia tree grows. The pigment is the dried sap of the tree, tapped, hardened in hollow bamboo tubes, and exported by sea to Europe from the seventeenth century onward. Mildly cathartic, occasionally fatal, always luminous."
    },
    "nature": [
      "Garcinia hanburyi resin",
      "Marigold petals in late afternoon",
      "Honey held against window light"
    ],
    "history": [
      "Carried by Dutch and English East India Company ships from Cambodia to Europe, 1600s onward",
      "Used by J.M.W. Turner in his late watercolours of light over water",
      "Contaminated with bullet fragments during the Cambodian civil war, when traders harvested resin from forest-shelled trees"
    ],
    "voice": "I am the sap of a tree that took twenty years to grow before I would bleed.",
    "lost": "Civil war and intensive harvesting have decimated the wild Garcinia hanburyi groves of Cambodia and Vietnam, and the pigment is now near-impossible to source authentically.",
    "companions": ["#F2A900", "#E3A857", "#FFA000", "#FADA5E", "#E49B0F"]
  },
  {
    "id": "naples-yellow",
    "name": "Naples Yellow",
    "hex": "#FADA5E",
    "hueFamily": "yellow",
    "hueOrder": 48,
    "image": "/images/naples-yellow.jpg",
    "etymology": {
      "narrative": "From Naples, Italy, near whose Vesuvian foothills the lead-antimonate pigment was thought to originate. Used in Egyptian glassmaking by the third millennium BCE, lost to the West, rediscovered in the eighteenth century. Toxic for as long as she was beautiful."
    },
    "nature": [
      "Goldfinch breast feathers",
      "Sulphur deposits at Vesuvius",
      "Ripe quince skin"
    ],
    "history": [
      "Painted on Babylonian glazed bricks of the Ishtar Gate, c. 575 BCE",
      "Standardised in Italian workshops from the seventeenth century onward",
      "Largely replaced by safer cadmium and titanium yellows in the twentieth century"
    ],
    "voice": "I am the warmth your eye reads as honey, made of lead.",
    "lost": "True lead-antimonate Naples yellow is no longer produced commercially; modern tubes labelled with her name contain a mixture of cadmium yellow and other safer pigments.",
    "companions": ["#F0B400", "#F2A900", "#F8F0E3", "#E3A857", "#FFE680"]
  },
  {
    "id": "lead-white",
    "name": "Lead White",
    "hex": "#F8F0E3",
    "hueFamily": "white",
    "hueOrder": 50,
    "image": "/images/lead-white.jpg",
    "etymology": {
      "narrative": "From the Old English léad and the Proto-Germanic root for the metal. Manufactured by stacking lead strips in pots of vinegar and burying them in horse manure for months, in a process described by Theophrastus c. 300 BCE that remained nearly unchanged until the twentieth century. For four millennia she was the only true white available to painters, and she poisoned almost everyone who handled her."
    },
    "nature": [
      "Cygnet down",
      "Bone china out of the kiln",
      "The first frost on dark earth"
    ],
    "history": [
      "Used in cosmetic ceruse by Elizabeth I, who likely died slowly of its application",
      "Painted Vermeer's pearls and Whistler's mother's dress",
      "Banned for interior use by France in 1909, the United States not until 1978"
    ],
    "voice": "I made every painter who ever loved me sick. They loved me anyway.",
    "lost": "Banned from house paint in most of the world, but still legal for restoration of historical artworks where no substitute reads quite the same on aged canvas.",
    "companions": ["#FADA5E", "#ACE1AF", "#F0E68C", "#FFFAF0", "#E8DCC4"]
  },
  {
    "id": "chartreuse",
    "name": "Chartreuse",
    "hex": "#C0D725",
    "hueFamily": "green",
    "hueOrder": 68,
    "image": "/images/chartreuse.jpg",
    "etymology": {
      "narrative": "After the green herbal liqueur first produced by Carthusian monks at the Grande Chartreuse monastery in the French Alps, c. 1737. The recipe involves 130 botanicals, the full list known to only two living monks at any given time, and the colour took her name from the drink rather than the other way around."
    },
    "nature": [
      "New oak leaf in spring",
      "Lichen on north-facing granite",
      "Glow-worm bioluminescence"
    ],
    "history": [
      "Liqueur first distilled at the Grande Chartreuse, c. 1737",
      "Recipe carried out of France by the monks in their heads when they were expelled in 1903",
      "Fewer than three monks have known the full recipe at any given time since"
    ],
    "voice": "I am the colour of an order who refused to write me down.",
    "lost": "She herself is not endangered, but the monastery has begun limiting global production of the liqueur, citing the burden of commerce on monastic life.",
    "companions": ["#ACE1AF", "#50A747", "#2E8B57", "#A8B92E", "#D4E157"]
  },
  {
    "id": "scheeles-green",
    "name": "Scheele's Green",
    "hex": "#50A747",
    "hueFamily": "green",
    "hueOrder": 114,
    "image": "/images/scheeles-green.jpg",
    "etymology": {
      "narrative": "After the Swedish chemist Carl Wilhelm Scheele, who synthesised the bright copper-arsenite green in 1775. She quickly became the most fashionable colour in nineteenth-century Europe, despite being a slow-acting poison that off-gassed arsenic vapour from damp wallpaper and dyed fabric."
    },
    "nature": [
      "Copper-arsenic mineral veins",
      "Certain parrot wings",
      "Glow-stick liquid in low light"
    ],
    "history": [
      "Wallpapered the bedroom of the exiled Napoleon on Saint Helena, where damp walls released arsine gas thought by some historians to have hastened his death",
      "Stained the children's toys, dress fabrics, and confectionery wrappers of Victorian England",
      "Quietly withdrawn from sale by the 1880s as arsenic deaths accumulated"
    ],
    "voice": "I dressed your great-grandmother and I killed her slowly.",
    "lost": "Banned from manufacture by the late nineteenth century; she now exists only on preserved Victorian wallpapers and dress fragments behind museum glass.",
    "companions": ["#2E8B57", "#43B3AE", "#C0D725", "#ACE1AF", "#3D8B37"]
  },
  {
    "id": "celadon",
    "name": "Celadon",
    "hex": "#ACE1AF",
    "hueFamily": "green",
    "hueOrder": 123,
    "image": "/images/celadon.jpg",
    "etymology": {
      "narrative": "After Céladon, a shepherd in Honoré d'Urfé's 1610 pastoral romance L'Astrée, who wore a pale green ribbon. The name was applied retroactively by the French to the soft jade-green Chinese stoneware glazes that had been admired in Europe since the Middle Ages, originally produced in the kilns of Longquan in Zhejiang."
    },
    "nature": [
      "Jadeite veins",
      "Frosted bamboo at dawn",
      "Underside of a magnolia leaf"
    ],
    "history": [
      "Produced at Longquan, Zhejiang, from at least the third century CE",
      "Believed by Ottoman sultans to crack on contact with poisoned food, and so favoured for state banquets",
      "Refined into a national art form by the Korean Goryeo dynasty in the twelfth century"
    ],
    "voice": "I am the green a king ordered when he did not want to be murdered at dinner.",
    "lost": "Authentic Longquan celadon kilns are now operated mostly as cultural-heritage sites; the recipe and firing technique are sustained by a handful of master potters across China and South Korea.",
    "companions": ["#2E8B57", "#43B3AE", "#C0D725", "#F8F0E3", "#A8D8B9"]
  },
  {
    "id": "malachite",
    "name": "Malachite",
    "hex": "#2E8B57",
    "hueFamily": "green",
    "hueOrder": 146,
    "image": "/images/malachite.jpg",
    "etymology": {
      "narrative": "From the Greek malakhē, 'mallow,' whose leaves the mineral was thought to resemble. A copper-carbonate ore, ground for pigment since the Egyptian Old Kingdom. The same mineral worn as eye paint by Egyptian noblewomen, panelled into Russian palace rooms, and ground into Renaissance Madonna robes."
    },
    "nature": [
      "Copper-rich ore veins of the Urals and the Congo",
      "Beetle elytra in damp forests",
      "Wet moss on stone after rain"
    ],
    "history": [
      "Ground into eye paint by Egyptian noblewomen, c. 3000 BCE",
      "Panelled the Malachite Room of the Winter Palace, Saint Petersburg",
      "Replaced almost everywhere by synthetic verdigris and viridian by the late nineteenth century, as the great Russian deposits were exhausted"
    ],
    "voice": "I was on her eyelids before her name was carved into stone.",
    "lost": "The great Ural malachite mines are exhausted; nearly all gem-grade malachite on the contemporary market now comes from politically unstable copper belts in the Democratic Republic of the Congo.",
    "companions": ["#43B3AE", "#ACE1AF", "#50A747", "#1F6F4A", "#3DA66B"]
  },
  {
    "id": "verdigris",
    "name": "Verdigris",
    "hex": "#43B3AE",
    "hueFamily": "green",
    "hueOrder": 177,
    "image": "/images/verdigris.jpg",
    "etymology": {
      "narrative": "From the Old French vert-de-Grèce, 'green of Greece.' The pigment is the corrosion product of copper exposed to acetic acid, traditionally produced by burying copper plates in vats of fermenting wine. Used since classical antiquity, prized for her vibrancy and feared for her instability."
    },
    "nature": [
      "Aged copper rooftops",
      "Oxidised bronze coins from the seabed",
      "Algae on a fountain rim"
    ],
    "history": [
      "Used by Pliny the Elder, who described her preparation in the Natural History, c. 77 CE",
      "Painted onto medieval church frescoes, where she sometimes turned black within decades",
      "Replaced by emerald and viridian in the nineteenth century after her instability became infamous"
    ],
    "voice": "I am a metal in mourning. I am what your monuments become.",
    "lost": "She is rarely manufactured today; nearly all of her surviving instances on the planet are spontaneous patinas slowly forming on the copper architecture of older cities.",
    "companions": ["#2E8B57", "#50A747", "#ACE1AF", "#5BB7E5", "#3A9C97"]
  },
  {
    "id": "maya-blue",
    "name": "Maya Blue",
    "hex": "#5BB7E5",
    "hueFamily": "blue",
    "hueOrder": 200,
    "image": "/images/maya-blue.jpg",
    "etymology": {
      "narrative": "A composite pigment combining indigo dye with the rare clay mineral palygorskite, fused together by gentle heating over copal incense. Created by Mesoamerican peoples by at least 800 CE, possibly centuries earlier, and used until the Spanish disrupted Maya pigment workshops in the sixteenth century."
    },
    "nature": [
      "Yucatán cenote depths in late afternoon",
      "Hyacinth macaw flight feathers",
      "The dry-season sky over Chichén Itzá"
    ],
    "history": [
      "Painted onto the bodies of sacrificial victims thrown into the Sacred Cenote at Chichén Itzá",
      "Survives on Mayan murals after twelve hundred years of jungle humidity that should have destroyed her",
      "Her chemistry baffled researchers until 2008, when the indigo-clay bonding mechanism was finally explained"
    ],
    "voice": "They painted me on the doomed before they sent them down.",
    "lost": "The exact ratio and firing process for making her was lost in the colonial disruption of Maya workshops; modern reconstructions match her appearance but not her unbroken provenance.",
    "companions": ["#003153", "#1034A6", "#26619C", "#73C2FB", "#4A9BD9"]
  },
  {
    "id": "prussian-blue",
    "name": "Prussian Blue",
    "hex": "#003153",
    "hueFamily": "blue",
    "hueOrder": 205,
    "image": "/images/prussian-blue.jpg",
    "etymology": {
      "narrative": "From the Kingdom of Prussia, in whose capital Berlin she was synthesised accidentally c. 1704 by the dye-maker Johann Diesbach, who was attempting to make a red lake pigment and contaminated his potash with animal blood. The first stable, affordable synthetic blue, she ended ultramarine's monopoly within a generation."
    },
    "nature": [
      "Indigo bunting feathers",
      "The hour before dawn at sea",
      "Cornflower petals at midday"
    ],
    "history": [
      "Painted the wave in Hokusai's Great Wave off Kanagawa, c. 1831",
      "First photographic blue: Anna Atkins's cyanotypes of British algae, 1843",
      "Used today in clinical medicine as an antidote for thallium and cesium poisoning"
    ],
    "voice": "I was an accident, and I drowned a wave at Kanagawa.",
    "lost": "Cyanotype as a working photographic process is now nearly extinct; she survives mostly in laboratories, binding heavy metals in human tissue.",
    "companions": ["#1F4788", "#26619C", "#001E33", "#1B3A6F", "#5BB7E5"]
  },
  {
    "id": "lapis",
    "name": "Lapis Lazuli",
    "hex": "#26619C",
    "hueFamily": "blue",
    "hueOrder": 210,
    "image": "/images/lapis.jpg",
    "etymology": {
      "narrative": "From the Latin lapis, 'stone,' and the Persian lāzhuward, the stone's name in its country of origin. A semi-precious mineral mined for over six thousand years from the Sar-i-Sang valley in northeastern Afghanistan, the only major source the ancient world knew. Ground into ultramarine for European altarpieces by the kilo, at a cost equal to or exceeding gold."
    },
    "nature": [
      "Sar-i-Sang mineral veins, Afghanistan",
      "Twilight Mediterranean off Cape Sounion",
      "Certain blue-tongued skink mouths"
    ],
    "history": [
      "Painted on Tutankhamun's funeral mask, c. 1323 BCE",
      "Reserved by Renaissance contracts for the robes of the Virgin Mary alone",
      "Mined under Taliban administration today, with much of the contemporary trade reportedly tied to regional conflict financing"
    ],
    "voice": "I have been mined out of one mountain for six thousand years.",
    "lost": "The Sar-i-Sang mines remain active but are now controlled by armed factions in northern Afghanistan; the United Nations has linked her contemporary trade to ongoing conflict financing.",
    "companions": ["#1034A6", "#2E5894", "#1F4788", "#003153", "#5BB7E5"]
  },
  {
    "id": "yinmn",
    "name": "YInMn Blue",
    "hex": "#2E5894",
    "hueFamily": "blue",
    "hueOrder": 215,
    "image": "/images/yinmn.jpg",
    "etymology": {
      "narrative": "Yttrium, Indium, Manganese. Discovered by accident in 2009 by chemistry student Andrew Smith at Oregon State University, while heating manganese oxide to over 2000°F. The first new blue pigment in over two centuries."
    },
    "nature": [
      "Lapis lazuli mineral veins",
      "Morpho butterfly wings (structural)",
      "Twilight skies at altitude"
    ],
    "history": [
      "First new blue pigment since cobalt blue, 1802",
      "Released to professional artists, 2017",
      "Crayola named a crayon after her, 2017"
    ],
    "voice": "I was born by accident in a furnace and they couldn't stop staring.",
    "lost": "She is one of the only colors whose story is gain, not loss. She survives.",
    "companions": ["#1B3A6F", "#4A7BB8", "#0F2547", "#5E8FC9", "#26619C"]
  },
  {
    "id": "indigo",
    "name": "Indigo",
    "hex": "#1F4788",
    "hueFamily": "blue",
    "hueOrder": 217,
    "image": "/images/indigo.jpg",
    "etymology": {
      "narrative": "From the Greek indikón, 'from India,' via the Latin indicum. The dye itself, fermented from the leaves of Indigofera tinctoria, was traded out of the Indus Valley for at least four thousand years before it had a Western name."
    },
    "nature": [
      "Indigofera tinctoria leaves at harvest",
      "Pre-dawn ocean off a deep coast",
      "The crease between night and storm"
    ],
    "history": [
      "Worn by the Indus Valley civilisation, c. 2500 BCE",
      "Engineered into a Carolina cash crop by Eliza Lucas Pinckney, age sixteen, c. 1740",
      "Powered the British East India Company's plantation economy until BASF synthesised her chemically in 1897"
    ],
    "voice": "I built empires and I starved villages, leaf by stinking leaf.",
    "lost": "Synthetic indigo collapsed the natural-dye trade within seven years of its invention; under one in a thousand pairs of denim today is dyed with the plant.",
    "companions": ["#003153", "#26619C", "#0F2547", "#3D5BAA", "#1A2B4E"]
  },
  {
    "id": "han-blue",
    "name": "Han Blue",
    "hex": "#436CCF",
    "hueFamily": "blue",
    "hueOrder": 220,
    "image": "/images/han-blue.jpg",
    "etymology": {
      "narrative": "Synthesised by Han dynasty Chinese chemists by at least 200 BCE, by heating barium copper silicate in a kiln to roughly 1000°C. The recipe was lost when the Han dynasty fell, and was not reconstructed in the West until twentieth-century researchers identified the pigment on surviving artefacts."
    },
    "nature": [
      "Structural blue in jay feathers",
      "Twilight on dry snowfields",
      "Certain hydrangeas grown in acidic soil"
    ],
    "history": [
      "Painted onto figures of the Terracotta Army and Han dynasty tomb murals",
      "Recipe lost for roughly fifteen hundred years after the Han collapse",
      "Discovered in the 2010s to emit near-infrared light when excited, with applications in biomedical imaging and counterfeit detection"
    ],
    "voice": "I waited fifteen hundred years for someone to remember my name.",
    "lost": "Original Han Blue exists only on a few hundred surviving artefacts worldwide; everything else now sold under her name is a modern laboratory reconstruction.",
    "companions": ["#1034A6", "#5BB7E5", "#26619C", "#5A85DD", "#002FA7"]
  },
  {
    "id": "klein-blue",
    "name": "International Klein Blue",
    "hex": "#002FA7",
    "hueFamily": "blue",
    "hueOrder": 223,
    "image": "/images/klein-blue.jpg",
    "etymology": {
      "narrative": "Patented in May 1960 by the French artist Yves Klein with the chemist Édouard Adam, registered in the Soleau envelope no. 63471. A specific ultramarine pigment suspended in a synthetic resin (Rhodopas M60A) that preserved the dry powder's velvet matte intensity, so that the paint did not flatten or shine when it dried."
    },
    "nature": [
      "Mediterranean trench depths",
      "The underside of a thunderhead",
      "Certain blue morpho species in shadow"
    ],
    "history": [
      "Klein's Anthropométries performances, 1960, in which nude models pressed her onto canvas in front of a string quartet",
      "Klein declared blue had 'no dimensions,' that she was the only colour that did not impose form",
      "Klein died of a heart attack at thirty-four, two years after patenting her"
    ],
    "voice": "He died two years after patenting me. I never let him go.",
    "lost": "The original Rhodopas M60A binder has been reformulated under modern environmental regulations; today's IKB is faithful but is no longer the exact compound Klein registered.",
    "companions": ["#1F4788", "#26619C", "#001A66", "#436CCF", "#1034A6"]
  },
  {
    "id": "egyptian-blue",
    "name": "Egyptian Blue",
    "hex": "#1034A6",
    "hueFamily": "blue",
    "hueOrder": 226,
    "image": "/images/egyptian-blue.jpg",
    "etymology": {
      "narrative": "Calcium copper silicate, manufactured by heating limestone, sand, copper, and natron together in a kiln to roughly 900°C. The first synthetic pigment in human history, produced from the Fourth Dynasty onward, c. 2500 BCE. The recipe was lost when the Roman Empire fell, and was not reconstructed in the West until the early twentieth century."
    },
    "nature": [
      "Cornflower fields in early summer",
      "The eye of certain peacock plumes",
      "Deep desert lapis veins"
    ],
    "history": [
      "Painted onto the funerary masks of the Fourth Dynasty pharaohs, c. 2500 BCE",
      "Used by Vitruvius, who recorded her recipe in De Architectura, c. 30 BCE",
      "Recipe lost for over a millennium after the fall of Rome, until reverse-engineered in the early nineteenth century"
    ],
    "voice": "I am older than every god still worshipped in your living rooms.",
    "lost": "Original Egyptian Blue exists only on surviving artefacts from the Old Kingdom onward; she is now also studied by physicists for her near-infrared luminescence, which is being adapted for biomedical imaging and counterfeit detection.",
    "companions": ["#26619C", "#436CCF", "#5BB7E5", "#002FA7", "#1F4788"]
  },
  {
    "id": "mauveine",
    "name": "Mauveine",
    "hex": "#8E4585",
    "hueFamily": "purple",
    "hueOrder": 307,
    "image": "/images/mauveine.jpg",
    "etymology": {
      "narrative": "Synthesised by accident in 1856 by William Henry Perkin, an eighteen-year-old chemistry student attempting to make synthetic quinine. He noticed a strange purple residue in his test tube, refined it, and patented the world's first aniline dye. By twenty-one he was a millionaire, and the synthetic-dye industry had been born."
    },
    "nature": [
      "Wild thistle in late summer",
      "Hellebore petals in shadow",
      "Storm light over heather"
    ],
    "history": [
      "Discovered by William Perkin, age 18, in his attic laboratory in Sudbury, London, 1856",
      "Worn by Queen Victoria to her daughter's wedding, 1858, triggering a continent-wide mauve craze",
      "Became the first commercial product of the modern chemical industry, the seed of every dye and pharmaceutical company that followed"
    ],
    "voice": "I was a teenager's accident, and I built every laboratory you have ever feared.",
    "lost": "She is one of the survivors. The dye that birthed an industry is still produced today for textile-history demonstrations, while the chemical economy she founded has long since outgrown her.",
    "companions": ["#66023C", "#DC143C", "#A02C3C", "#9F4576", "#B284BE"]
  },
  {
    "id": "tyrian-purple",
    "name": "Tyrian Purple",
    "hex": "#66023C",
    "hueFamily": "purple",
    "hueOrder": 327,
    "image": "/images/tyrian-purple.jpg",
    "etymology": {
      "narrative": "From the Ancient Greek Tyrios, 'of Tyre,' the Phoenician city where the dye was first cultivated from murex sea snails, c. 1600 BCE. The dye was so labor-intensive (twelve thousand snails for a single garment) that it became the most expensive substance in the ancient world."
    },
    "nature": [
      "Murex sea snail mucus glands",
      "Bougainvillea bracts",
      "Certain orchid petals"
    ],
    "history": [
      "Phoenician royal dye, c. 1600 BCE onward",
      "Roman senatorial robe stripe (clavus latus)",
      "Byzantine emperor's exclusive shade, punishable by death to wear without authorization"
    ],
    "voice": "I was killed for, once, by the thousand.",
    "lost": "Mediterranean murex populations have declined 64% since 1990 due to ocean acidification.",
    "companions": ["#8B0E4D", "#3D0224", "#A11D5C", "#220112", "#8E4585"]
  },
  {
    "id": "cochineal",
    "name": "Cochineal",
    "hex": "#DC143C",
    "hueFamily": "red",
    "hueOrder": 348,
    "image": "/images/cochineal.jpg",
    "etymology": {
      "narrative": "From the Spanish cochinilla, the small parasitic insect Dactylopius coccus, which lives on prickly-pear cacti in Mexico and Central America. The bodies of the females are dried and crushed to release carminic acid, the most intense natural red on earth. Roughly seventy thousand insects yield a single pound of dye."
    },
    "nature": [
      "Dactylopius coccus on Opuntia cactus pads",
      "Beetroot juice spilled",
      "Strawberry skin in low sun"
    ],
    "history": [
      "Dyed Aztec royal cloaks before the Spanish conquest",
      "Became the second most valuable export from New Spain after silver, dyeing British redcoats and Catholic cardinal robes alike",
      "Still used today in Campari, certain lipsticks, yoghurts, and pharmaceutical coatings, listed on labels as carmine or E120"
    ],
    "voice": "I am the blood of seventy thousand insects, in your morning yoghurt.",
    "lost": "Synthetic red dyes have replaced her in most industrial applications, but cochineal cultivation survives in Peru and the Canary Islands, where she is now marketed as a natural alternative to petrochemical reds.",
    "companions": ["#A02C3C", "#E34234", "#66023C", "#8E4585", "#B71C1C"]
  },
  {
    "id": "madder",
    "name": "Madder",
    "hex": "#A02C3C",
    "hueFamily": "red",
    "hueOrder": 352,
    "image": "/images/madder.jpg",
    "etymology": {
      "narrative": "From the Old English mædere, the name of the plant Rubia tinctorum, whose roots yield a brilliant red dye. Cultivated in the Middle East for at least four thousand years and traded to Egypt, Greece, and Rome. The British army's red coats were dyed with her until synthetic alizarin replaced her in 1869."
    },
    "nature": [
      "Rubia tinctorum root, ground",
      "Pomegranate flesh",
      "Sunburn at six o'clock on pale skin"
    ],
    "history": [
      "Dyed cloth wrapped around Tutankhamun's mummy, c. 1323 BCE",
      "The official red of the British army's eighteenth- and nineteenth-century uniforms",
      "Replaced commercially by synthetic alizarin in 1869, the first natural dye displaced by laboratory chemistry"
    ],
    "voice": "I was on every redcoat at Waterloo. I am still in the soil where they fell.",
    "lost": "Commercial cultivation of Rubia tinctorum collapsed within a generation of synthetic alizarin's invention; the dye now persists mostly in heritage textile communities and natural-dye revivalists.",
    "companions": ["#DC143C", "#E34234", "#66023C", "#8E4585", "#B71C1C"]
  }
];

export default COLORS;