/* Shop structure: groups, category labels and short intros. Used by the catalog, collection and product pages. */
window.DJ_GROUPS = [
  { id: "figural", label: "Figural ornaments" },
  { id: "glass-balls", label: "Glass balls" },
  { id: "plastic", label: "Plastic balls and garlands" },
  { id: "tabletop", label: "Tabletop glass" },
  { id: "seasonal", label: "Easter and Halloween" },
  { id: "custom", label: "Custom" }
];
window.DJ_CATS = {
  "Christmas Characters": { id: "christmas-characters", group: "figural", label: "Santas and characters", intro: "Santas, snowmen, nutcrackers, gnomes, angels and gingerbread men in hand-finished glass." },
  "Animal Ornaments": { id: "animal-ornaments", group: "figural", label: "Animals", intro: "Pets, wildlife, birds, unicorns and dinosaurs, from a firefighter Dalmatian to a sloth hugging a cactus." },
  "Ocean & Marine Ornaments": { id: "ocean-marine", group: "figural", label: "Ocean", intro: "Fish, crabs, lobsters, octopus, sea turtles, narwhals and shells for coastal and resort shops." },
  "Food Ornaments": { id: "food-ornaments", group: "figural", label: "Food", intro: "Cupcakes, pizza, hot dogs, sushi, takeout boxes, condiments and candy." },
  "Beverage Ornaments": { id: "beverage-ornaments", group: "figural", label: "Drinks", intro: "Coffee cups, beer, wine, champagne, cocktails, tea and bubble tea." },
  "Vegetable & Botanical Ornaments": { id: "vegetable-botanical", group: "figural", label: "Fruit, veg and flowers", intro: "Pineapples, bananas, strawberries, mushrooms, poinsettias, roses and cactus." },
  "Traditional Christmas Ornaments": { id: "traditional-christmas", group: "figural", label: "Traditional", intro: "Bows, bells, stars, wreaths, gift boxes, glass cloches and little winter scenes." },
  "Buildings & Destinations": { id: "buildings-destinations", group: "figural", label: "Houses and places", intro: "Gingerbread houses, snowy cottages, Ferris wheels and landmarks." },
  "Vehicles & Transportation": { id: "vehicles-transportation", group: "figural", label: "Vehicles", intro: "Campers, trucks carrying trees, trains, taxis, planes, gondolas and hot air balloons." },
  "Sports Ornaments": { id: "sports-ornaments", group: "figural", label: "Sports", intro: "Balls, skates, golf, pickleball and Santas working out." },
  "Musical Instrument Ornaments": { id: "musical-instruments", group: "figural", label: "Music", intro: "Boomboxes, cassettes, guitars, horns, a grand piano and a Broadway marquee." },
  "Campus & Souvenir Ornaments": { id: "campus-souvenir", group: "figural", label: "Souvenirs", intro: "Landmarks, flags and city designs for campus stores and destination shops." },
  "Tools & Fashion Ornaments": { id: "tools-fashion", group: "figural", label: "Hobbies and fashion", intro: "Handbags, heels, cameras, suitcases, kitchen gear, baby gifts and work life." },
  "Novelty & Special Shapes": { id: "novelty-shapes", group: "figural", label: "Novelty", intro: "Sugar skulls, rainbows, flying saucers, robots, hamsa hands and ships in bottles." },
  "Glass Ball Ornaments — Singles": { id: "glass-balls-singles", group: "glass-balls", label: "Glass balls", intro: "Painted, glittered, etched and jeweled glass balls, mostly 80 to 100 mm." },
  "Glass Ball Ornaments — Boxed Sets": { id: "glass-balls-boxed", group: "glass-balls", label: "Boxed glass ball sets", intro: "Glass balls packed in sets of 4 to 12, ready for the shelf." },
  "Plastic Ball Ornaments — Boxed Sets": { id: "plastic-balls-boxed", group: "plastic", label: "Plastic ball sets", intro: "Plastic balls in boxes and tubes, from sets of 3 to mixed sets with finials." },
  "Plastic Ball Ornaments — Singles & Garlands": { id: "plastic-balls-singles", group: "plastic", label: "Garlands", intro: "Ball and bead garlands in red, gold, silver and mixed colors." },
  "Glass Figurines": { id: "glass-figurines", group: "tabletop", label: "Tabletop glass", intro: "Glass cone trees, mercury glass trees, votives, candlesticks and nutcracker figures." },
  "Easter & Spring": { id: "easter-spring", group: "seasonal", label: "Easter", intro: "Flocked bunnies, chicks, hens and eggs, singles, sets and display trays." },
  "Halloween Collection": { id: "halloween-collection", group: "seasonal", label: "Halloween", intro: "Glass skulls, pumpkins, ghosts and Halloween glass balls." },
  "Western / Regional": { id: "western-regional", group: "custom", label: "Regional designs", intro: "State, city and Western designs for local gift programs." },
  "Custom Logo Ornaments": { id: "custom-logo-ornaments", group: "custom", label: "Logo ornaments", intro: "Your logo, mascot or brand theme made in glass." },
  "Museum & Destination Souvenirs": { id: "museum-destination", group: "custom", label: "Museum souvenirs", intro: "Souvenir ornaments for museums, landmarks, resorts and attractions." },
  "Packaging & Private Label": { id: "packaging-private-label", group: "custom", label: "Packaging", intro: "Hangtags, insert cards, gift boxes and private-label packaging." }
};
window.DJ_IMG = function (p) { return p.cutout || p.image; };
