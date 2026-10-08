/* The Composers room: one short film per composer.
   Every film starts as a draft (checked: false) and shows a "Draft" label until the owner has checked
   the facts and the music, then sets checked: true.
   theme.notes are [midi, start beat, length in beats, loudness 0–1 (optional)]. */
window.COMPOSERS = [
  {
    id: "bach", name: "Johann Sebastian Bach", short: "Bach", born: 1685, died: 1750, country: "Germany", era: "Baroque",
    colours: { bg: "#34161f", ink: "#f6ead8", accent: "#e3b45c" },
    where: "Born in Eisenach, Germany, in 1685. For his last 27 years he ran the music at St Thomas Church in Leipzig.",
    theme: { title: "Prelude in C major, from The Well-Tempered Clavier, Book 1", bpm: 66, pedal: true, notes: bachPrelude() },
    sound: "Baroque music is built from patterns. Here one broken chord fills each bar, and the chords walk through the key.",
    facts: [
      "He came from a huge musical family. There were dozens of working musicians called Bach.",
      "As a young man he walked about 400 km to Lübeck, just to hear the great organist Buxtehude play.",
      "In Leipzig he wrote a new cantata for church almost every week, for years on end."
    ],
    famous: ["The Brandenburg Concertos", "The Well-Tempered Clavier", "St Matthew Passion"],
    quiz: { q: "Which instrument was Bach most famous for playing?", options: ["Organ", "Flute", "Trumpet"], answer: 0 },
    checked: false
  },
  {
    id: "vivaldi", name: "Antonio Vivaldi", short: "Vivaldi", born: 1678, died: 1741, country: "Italy", era: "Baroque",
    colours: { bg: "#3a1a14", ink: "#fbeee2", accent: "#f08a5d" },
    where: "Born in Venice, Italy, in 1678. He spent most of his working life in Venice, and died in Vienna in 1741.",
    theme: { title: "Spring, from The Four Seasons", bpm: 112, notes: [
      [64, 0, 1], [68, 1, 1], [68, 2, 1], [68, 3, 1], [66, 4, .5], [64, 4.5, .5], [71, 5, 2], [71, 7, .5], [69, 7.5, .5],
      [68, 8, 1], [68, 9, 1], [68, 10, 1], [66, 11, .5], [64, 11.5, .5], [71, 12, 3]
    ] },
    sound: "The Four Seasons are four violin concertos. In Spring, the violins sing out like birds.",
    facts: [
      "He trained as a priest and had red hair, so people in Venice called him 'the Red Priest'.",
      "He taught at the Pietà, a home for orphaned girls whose orchestra became famous across Europe.",
      "He wrote about 500 concertos, many of them for the violin, his own instrument."
    ],
    famous: ["The Four Seasons", "Gloria in D", "Concerto for Two Violins in A minor"],
    quiz: { q: "How many violin concertos make up The Four Seasons?", options: ["Three", "Four", "Twelve"], answer: 1 },
    checked: false
  },
  {
    id: "haydn", name: "Joseph Haydn", short: "Haydn", born: 1732, died: 1809, country: "Austria", era: "Classical",
    colours: { bg: "#18283f", ink: "#eef3fa", accent: "#8fc3ea" },
    where: "Born in Rohrau, Austria, in 1732. For almost 30 years he was music director for the princely Esterházy family.",
    theme: { title: "Symphony No. 94, 'The Surprise'", bpm: 92, notes: [
      [60, 0, .5, .55], [60, .5, .5, .55], [64, 1, .5, .55], [64, 1.5, .5, .55], [67, 2, .5, .55], [67, 2.5, .5, .55], [64, 3, 1, .55],
      [65, 4, .5, .55], [65, 4.5, .5, .55], [62, 5, .5, .55], [62, 5.5, .5, .55], [59, 6, .5, .55], [59, 6.5, .5, .55], [55, 7, 1, .55],
      [60, 8, .5, .22], [60, 8.5, .5, .22], [64, 9, .5, .22], [64, 9.5, .5, .22], [67, 10, .5, .22], [67, 10.5, .5, .22], [64, 11, 1, .22],
      [65, 12, .5, .22], [65, 12.5, .5, .22], [62, 13, .5, .22], [62, 13.5, .5, .22], [59, 14, .5, .22], [59, 14.5, .5, .22],
      [43, 15, 1.5, 1], [55, 15, 1.5, 1], [59, 15, 1.5, 1], [62, 15, 1.5, 1], [67, 15, 1.5, 1], [71, 15, 1.5, 1]
    ] },
    sound: "The slow movement starts quietly, then gets even quieter… until a sudden loud chord. Did it make you jump?",
    facts: [
      "He is often called the father of the symphony, and of the string quartet too.",
      "He wrote 104 numbered symphonies.",
      "The young Beethoven came to Vienna and had lessons with him."
    ],
    famous: ["The 'Surprise' Symphony", "The Creation", "Trumpet Concerto in E flat"],
    quiz: { q: "What happens in the slow movement of the 'Surprise' Symphony?", options: ["The music stops for a minute", "A sudden loud chord", "The orchestra sings"], answer: 1 },
    checked: false
  },
  {
    id: "mozart", name: "Wolfgang Amadeus Mozart", short: "Mozart", born: 1756, died: 1791, country: "Austria", era: "Classical",
    colours: { bg: "#1b2443", ink: "#f1f2fb", accent: "#c9b6ff" },
    where: "Born in Salzburg, Austria, in 1756. He spent his last ten years in Vienna.",
    theme: { title: "Eine kleine Nachtmusik (A Little Night Music)", bpm: 132, notes: [
      [67, 0, 1], [62, 1.5, .5], [67, 2, 1], [62, 3.5, .5], [67, 4, .5], [62, 4.5, .5], [67, 5, .5], [71, 5.5, .5], [74, 6, 2],
      [72, 8, 1], [69, 9.5, .5], [72, 10, 1], [69, 11.5, .5], [72, 12, .5], [69, 12.5, .5], [66, 13, .5], [69, 13.5, .5], [62, 14, 2]
    ] },
    sound: "Classical music loves balance. Listen for a bold first phrase, then a second phrase that answers it.",
    facts: [
      "He was writing music by the age of five.",
      "As a child he toured Europe with his father and his sister Nannerl, playing for kings and queens.",
      "He wrote more than 600 works, including operas, symphonies and concertos, before he died at 35."
    ],
    famous: ["The Magic Flute", "Eine kleine Nachtmusik", "Requiem"],
    quiz: { q: "Which Mozart opera has the Queen of the Night in it?", options: ["The Marriage of Figaro", "Don Giovanni", "The Magic Flute"], answer: 2 },
    checked: false
  },
  {
    id: "beethoven", name: "Ludwig van Beethoven", short: "Beethoven", born: 1770, died: 1827, country: "Germany", era: "Classical to Romantic",
    colours: { bg: "#26201d", ink: "#f7efe6", accent: "#f08c4a" },
    where: "Born in Bonn, Germany, in 1770. At 21 he moved to Vienna, and lived there for the rest of his life.",
    theme: { title: "'Ode to Joy', from Symphony No. 9", bpm: 120, notes: [
      [66, 0, 1], [66, 1, 1], [67, 2, 1], [69, 3, 1], [69, 4, 1], [67, 5, 1], [66, 6, 1], [64, 7, 1],
      [62, 8, 1], [62, 9, 1], [64, 10, 1], [66, 11, 1], [66, 12, 1.5], [64, 13.5, .5], [64, 14, 2]
    ] },
    sound: "A tune almost everyone knows. It moves mostly by step, one note to the next, which makes it easy to sing.",
    facts: [
      "He began to lose his hearing in his late twenties.",
      "He kept composing after he became deaf, including his Ninth Symphony.",
      "This 'Ode to Joy' melody is now the anthem of the European Union."
    ],
    famous: ["Symphony No. 5", "'Moonlight' Sonata", "Für Elise"],
    quiz: { q: "How many symphonies did Beethoven complete?", options: ["Five", "Nine", "104"], answer: 1 },
    checked: false
  },
  {
    id: "brahms", name: "Johannes Brahms", short: "Brahms", born: 1833, died: 1897, country: "Germany", era: "Romantic",
    colours: { bg: "#1c3329", ink: "#eef6f0", accent: "#f2c27b" },
    where: "Born in Hamburg, Germany, in 1833. He settled in Vienna at about 30.",
    theme: { title: "Lullaby (Wiegenlied), Op. 49 No. 4", bpm: 104, notes: [
      [64, 0, .5], [64, .5, .5], [67, 1, 2], [64, 3, .5], [64, 3.5, .5], [67, 4, 2],
      [64, 6, .5], [67, 6.5, .5], [72, 7, 1], [71, 8, 1.5], [69, 9.5, .5], [69, 10, 1], [67, 11, 1],
      [62, 12, .5], [64, 12.5, .5], [65, 13, 1], [62, 14, 1], [62, 15, .5], [64, 15.5, .5], [65, 16, 2],
      [62, 18, .5], [65, 18.5, .5], [71, 19, .5], [69, 19.5, .5], [67, 20, 1], [71, 21, 1], [72, 22, 2.5]
    ] },
    sound: "Romantic music is full of feeling. This gentle cradle song rocks in three beats to a bar.",
    facts: [
      "He was a close friend of the composers Robert and Clara Schumann.",
      "He worked on his First Symphony for about 20 years before he let it be played.",
      "His Hungarian Dances, first written for piano duet, were hugely popular."
    ],
    famous: ["Hungarian Dance No. 5", "Lullaby", "A German Requiem"],
    quiz: { q: "Which famous musicians were Brahms's close friends?", options: ["Robert and Clara Schumann", "Mozart and his sister", "Bach and Handel"], answer: 0 },
    checked: false
  },
  {
    id: "grieg", name: "Edvard Grieg", short: "Grieg", born: 1843, died: 1907, country: "Norway", era: "Romantic",
    colours: { bg: "#142c3a", ink: "#eaf4f8", accent: "#7fd6c4" },
    where: "Born in Bergen, Norway, in 1843. His home near Bergen, Troldhaugen, is now a museum.",
    theme: { title: "In the Hall of the Mountain King, from Peer Gynt", bpm: 138, staccato: true, notes: [
      [59, 0, .5], [61, .5, .5], [62, 1, .5], [64, 1.5, .5], [66, 2, .5], [62, 2.5, .5], [66, 3, 1],
      [65, 4, .5], [61, 4.5, .5], [65, 5, 1], [64, 6, .5], [60, 6.5, .5], [64, 7, 1],
      [59, 8, .5], [61, 8.5, .5], [62, 9, .5], [64, 9.5, .5], [66, 10, .5], [62, 10.5, .5], [66, 11, .5], [71, 11.5, .5],
      [69, 12, .5], [66, 12.5, .5], [62, 13, .5], [66, 13.5, .5], [69, 14, 2]
    ] },
    sound: "The same tune again and again, louder and faster each time, as the trolls close in on Peer Gynt.",
    facts: [
      "He loved Norwegian folk music and put its dances and tunes into his own pieces.",
      "He wrote 66 short Lyric Pieces for piano, in ten books.",
      "He wrote the music for Henrik Ibsen's play Peer Gynt."
    ],
    famous: ["Peer Gynt: Morning Mood", "Piano Concerto in A minor", "Lyric Pieces"],
    quiz: { q: "Which country was Grieg from?", options: ["Sweden", "Denmark", "Norway"], answer: 2 },
    checked: false
  }
];

/* Bach's Prelude in C: each half-bar is a broken chord, the bottom two notes held. Bars 1–4. */
function bachPrelude() {
  var bars = [[60, 64, 67, 72, 76], [60, 62, 69, 74, 77], [59, 62, 67, 74, 77], [60, 64, 67, 72, 76]];
  var out = [];
  bars.forEach(function (c, b) {
    [0, 2].forEach(function (half) {
      var t = b * 4 + half;
      out.push([c[0], t, 2, .6]); out.push([c[1], t + .25, 1.75, .55]);
      [c[2], c[3], c[4], c[2], c[3], c[4]].forEach(function (m, i) { out.push([m, t + .5 + i * .25, .5, .5]); });
    });
  });
  return out;
}
