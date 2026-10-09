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
  },
  {
    id: "pachelbel", name: "Johann Pachelbel", short: "Pachelbel", born: 1653, died: 1706, country: "Germany", era: "Baroque",
    colours: { bg: "#2b2140", ink: "#f1ecfa", accent: "#c7a6ff" },
    where: "Born in Nuremberg, Germany, in 1653. He worked as an organist in Vienna, Eisenach, Erfurt, Stuttgart and Gotha, then went home to Nuremberg.",
    theme: { title: "Canon in D", bpm: 56, notes: [
      [50, 0, 2, .5], [45, 2, 2, .5], [47, 4, 2, .5], [42, 6, 2, .5], [43, 8, 2, .5], [38, 10, 2, .5], [43, 12, 2, .5], [45, 14, 2, .5],
      [78, 0, 2], [76, 2, 2], [74, 4, 2], [73, 6, 2], [71, 8, 2], [69, 10, 2], [71, 12, 2], [73, 14, 2]
    ] },
    sound: "Under the whole Canon, the cellos play the same eight bass notes again and again, while the violins weave tunes over the top.",
    facts: [
      "He taught Johann Christoph Bach, the older brother of Johann Sebastian Bach.",
      "In his Canon, a bass line of just eight notes repeats 28 times.",
      "Most of his music is for the organ: hundreds of chorale preludes and fugues."
    ],
    famous: ["Canon in D", "Chaconne in F minor", "Hexachordum Apollinis"],
    quiz: { q: "What repeats again and again in Pachelbel's Canon?", options: ["An eight-note bass line", "A drum rhythm", "One loud chord"], answer: 0 },
    checked: false
  },
  {
    id: "chopin", name: "Frédéric Chopin", short: "Chopin", born: 1810, died: 1849, country: "Poland", era: "Romantic",
    colours: { bg: "#1d2433", ink: "#eef1f8", accent: "#e6a8b8" },
    where: "Born in Żelazowa Wola, near Warsaw, Poland, in 1810. At 20 he left for Paris, where he lived for the rest of his life.",
    theme: { title: "Funeral March, from Piano Sonata No. 2", bpm: 50, pedal: true, notes: [
      [46, 0, 1, .45], [53, 0, 1, .4], [46, 1, 1, .45], [54, 1, 1, .4], [46, 2, 1, .45], [53, 2, 1, .4], [46, 3, 1, .45], [54, 3, 1, .4],
      [70, 0, 1], [70, 1, .75], [70, 1.75, .25], [70, 2, 2],
      [46, 4, 1, .45], [53, 4, 1, .4], [46, 5, 1, .45], [54, 5, 1, .4], [46, 6, 1, .45], [53, 6, 1, .4], [46, 7, 1, .45], [54, 7, 1, .4],
      [73, 4, .75], [72, 4.75, .25], [72, 5, .75], [70, 5.75, .25], [70, 6, .75], [69, 6.75, .25], [70, 7, 1]
    ] },
    sound: "A slow march in B♭ minor. The left hand rocks between two chords like heavy footsteps, and the tune barely moves.",
    facts: [
      "Almost all of his music is for the piano.",
      "He was a child star: his first piece, a polonaise, was printed when he was 7.",
      "He disliked big concert halls and played mostly in small salons for friends.",
      "Polish dances, the mazurka and the polonaise, run through his music."
    ],
    famous: ["Nocturnes", "'Minute' Waltz", "Polonaises and Mazurkas"],
    quiz: { q: "Which instrument did Chopin write almost all his music for?", options: ["Violin", "Piano", "Organ"], answer: 1 },
    checked: false
  },
  {
    id: "mussorgsky", name: "Modest Mussorgsky", short: "Mussorgsky", born: 1839, died: 1881, country: "Russia", era: "Romantic",
    colours: { bg: "#2e1a12", ink: "#fbefe6", accent: "#e8a23a" },
    where: "Born in Karevo, Russia, in 1839. He worked for most of his life as a government clerk in St Petersburg, composing in his spare time.",
    theme: { title: "Promenade, from Pictures at an Exhibition", bpm: 96, notes: [
      [67, 0, 1], [65, 1, 1], [70, 2, 1], [72, 3, 1], [77, 4, .5], [74, 4.5, .5],
      [72, 5, 1], [77, 6, .5], [74, 6.5, .5], [70, 7, 1], [72, 8, 1], [67, 9, 1], [65, 10, 2]
    ] },
    sound: "The Promenade is you, walking round the gallery. It has five beats in the first bar and six in the next, like an unsteady stroll.",
    facts: [
      "He was one of 'The Five', Russian composers who wanted music to sound Russian, not German or Italian.",
      "Pictures at an Exhibition, for piano, was written in 1874 after an exhibition of paintings by his late friend Viktor Hartmann.",
      "Maurice Ravel turned Pictures at an Exhibition into a famous orchestral piece in 1922."
    ],
    famous: ["Pictures at an Exhibition", "Night on Bald Mountain", "Boris Godunov"],
    quiz: { q: "What gave Mussorgsky the idea for Pictures at an Exhibition?", options: ["A train journey", "Paintings by a friend", "A fairy tale"], answer: 1 },
    checked: false
  },
  {
    id: "tchaikovsky", name: "Pyotr Ilyich Tchaikovsky", short: "Tchaikovsky", born: 1840, died: 1893, country: "Russia", era: "Romantic",
    colours: { bg: "#13283a", ink: "#ecf4fb", accent: "#9fc9f2" },
    where: "Born in Votkinsk, Russia, in 1840. He studied at the new St Petersburg Conservatory, then taught in Moscow for 12 years.",
    theme: { title: "Swan theme, from Swan Lake", bpm: 72, notes: [
      [78, 0, 4], [71, 4, .5], [73, 4.5, .5], [74, 5, .5], [76, 5.5, .5],
      [78, 6, 1.5], [74, 7.5, .5], [78, 8, 1.5], [74, 9.5, .5], [78, 10, 1.5], [71, 11.5, .5], [74, 12, .5], [71, 12.5, .5], [67, 13, .5], [74, 13.5, .5], [71, 14, 2]
    ] },
    sound: "A sad, floating oboe tune over shimmering strings: the swan-princess Odette, under a spell.",
    facts: [
      "He trained as a lawyer and worked for the government before he gave his life to music.",
      "For 13 years a rich widow, Nadezhda von Meck, paid him to compose, on condition that they never met.",
      "In 1891 he conducted at the opening of Carnegie Hall in New York.",
      "He wrote Album for the Young, 24 short piano pieces that are still exam favourites."
    ],
    famous: ["The Nutcracker", "Swan Lake", "Album for the Young"],
    quiz: { q: "Which of these ballets did Tchaikovsky write?", options: ["The Nutcracker", "The Firebird", "Giselle"], answer: 0 },
    checked: false
  },
  {
    id: "dvorak", name: "Antonín Dvořák", short: "Dvořák", born: 1841, died: 1904, country: "Bohemia (now the Czech Republic)", era: "Romantic",
    colours: { bg: "#1f2d1c", ink: "#eef6ea", accent: "#d9c26a" },
    where: "Born in Nelahozeves, near Prague, in 1841. From 1892 to 1895 he ran a music school in New York.",
    theme: { title: "Largo, from Symphony No. 9 'From the New World'", bpm: 46, notes: [
      [49, 0, 4, .35], [53, 0, 4, .3], [56, 0, 4, .3],
      [65, 0, 1.5], [68, 1.5, .5], [68, 2, 2], [65, 4, 1.5], [63, 5.5, .5], [61, 6, 2],
      [63, 8, 1], [65, 9, 1], [68, 10, 1], [65, 11, 1], [63, 12, 3]
    ] },
    sound: "A cor anglais sings a tune so like a folk song that it later became a song of its own, 'Goin' Home'.",
    facts: [
      "His father was a butcher and innkeeper, and Antonín was expected to join the family business.",
      "He played the viola in a Prague theatre orchestra for about nine years.",
      "Brahms admired his music and helped him find a publisher.",
      "He loved steam trains and could tell engines apart by their numbers."
    ],
    famous: ["Symphony No. 9 'From the New World'", "Slavonic Dances", "Humoresque No. 7"],
    quiz: { q: "In which city did Dvořák run a music school from 1892?", options: ["London", "New York", "Paris"], answer: 1 },
    checked: false
  },
  {
    id: "satie", name: "Erik Satie", short: "Satie", born: 1866, died: 1925, country: "France", era: "20th century",
    colours: { bg: "#242424", ink: "#f4f1ea", accent: "#b9d7c4" },
    where: "Born in Honfleur, France, in 1866. He lived in Paris, where he played piano in the cafés of Montmartre.",
    theme: { title: "Gymnopédie No. 1", bpm: 66, pedal: true, notes: [
      [43, 0, 1, .4], [66, 1, 2, .3], [71, 1, 2, .3], [74, 1, 2, .3], [38, 3, 1, .4], [66, 4, 2, .3], [69, 4, 2, .3], [73, 4, 2, .3],
      [43, 6, 1, .4], [66, 7, 2, .3], [71, 7, 2, .3], [74, 7, 2, .3], [38, 9, 1, .4], [66, 10, 2, .3], [69, 10, 2, .3], [73, 10, 2, .3],
      [78, 1, 1], [81, 2, 1], [79, 3, 1], [78, 4, 1], [73, 5, 1], [71, 6, 1], [73, 7, 1], [74, 8, 1], [69, 9, 3]
    ] },
    sound: "Slow, calm and simple: a gentle tune floats over a left hand that rocks between two chords.",
    facts: [
      "He gave his pieces funny titles, like 'Three Pieces in the Shape of a Pear'.",
      "He owned seven identical grey velvet suits and wore them for years.",
      "One short piece, Vexations, comes with a note asking for it to be played 840 times."
    ],
    famous: ["Gymnopédie No. 1", "Gnossienne No. 1", "Je te veux"],
    quiz: { q: "How many times does Satie's Vexations ask to be played?", options: ["840", "12", "100"], answer: 0 },
    checked: false
  },
  {
    id: "handel", name: "George Frideric Handel", short: "Handel", born: 1685, died: 1759, country: "Germany (later Britain)", era: "Baroque",
    colours: { bg: "#2a1f12", ink: "#fbf1e2", accent: "#e8b85a" },
    where: "Born in Halle, Germany, in 1685, the same year as Bach. He moved to London in 1712 and became a British citizen.",
    theme: { title: "'Hallelujah' chorus, from Messiah", bpm: 84, notes: [
      [50, 0, 1, .4], [57, 0, 1, .35], [74, 0, 1], [69, 1, .75], [71, 1.75, .25], [69, 2, 1],
      [50, 4, 1, .4], [57, 4, 1, .35], [74, 4, 1], [69, 5, .75], [71, 5.75, .25], [69, 6, 1],
      [50, 8, 2, .4], [57, 8, 2, .35], [62, 8, 2, .35], [74, 8, 2]
    ] },
    sound: "Four words, sung again and again by the whole choir: ‘Hal-le-lu-jah!’ Audiences have stood up for this chorus for more than 250 years.",
    facts: [
      "He wrote Water Music for King George I, who heard it played from a barge on the River Thames in 1717.",
      "Messiah was first performed in Dublin, in 1742.",
      "He wrote more than 40 operas, mostly in Italian, for London audiences.",
      "He is buried in Westminster Abbey in London."
    ],
    famous: ["Messiah", "Water Music", "Music for the Royal Fireworks"],
    quiz: { q: "In which city was Messiah first performed?", options: ["London", "Dublin", "Halle"], answer: 1 },
    checked: false
  },
  {
    id: "strauss", name: "Johann Strauss II", short: "Strauss", born: 1825, died: 1899, country: "Austria", era: "Romantic",
    colours: { bg: "#10283a", ink: "#eaf4fb", accent: "#7cc4e8" },
    where: "Born in Vienna, Austria, in 1825, and lived there all his life. In his time Vienna danced to his music.",
    theme: { title: "The Blue Danube", bpm: 150, notes: [
      [62, 0, 1], [62, 1, 1], [66, 2, 1], [69, 3, 1], [69, 4, 3],
      [81, 8, .8, .6], [81, 9, .8, .6], [78, 11, .8, .6], [78, 12, .8, .6],
      [50, 4, 1, .35], [57, 5, 1, .3], [62, 6, 1, .3], [50, 7, 1, .35], [57, 8, 1, .3], [62, 9, 1, .3], [50, 10, 1, .35], [57, 11, 1, .3], [62, 12, 1, .3]
    ] },
    sound: "A waltz: three beats in a bar, ONE-two-three, with a strong bass note on beat one and light chords on two and three.",
    facts: [
      "He was called ‘the Waltz King’.",
      "His father, Johann Strauss I, also wrote waltzes, and did not want his son to become a musician.",
      "He wrote around 500 dances: waltzes, polkas, marches and more.",
      "The Blue Danube, from 1867, is named after the river that flows through Vienna."
    ],
    famous: ["The Blue Danube", "Die Fledermaus", "Tritsch-Tratsch-Polka"],
    quiz: { q: "Which dance made Johann Strauss II famous?", options: ["The waltz", "The tango", "The minuet"], answer: 0 },
    checked: false
  },
  {
    id: "rimsky", name: "Nikolai Rimsky-Korsakov", short: "Rimsky-Korsakov", born: 1844, died: 1908, country: "Russia", era: "Romantic",
    colours: { bg: "#2a2410", ink: "#fbf6e4", accent: "#f2cc4a" },
    where: "Born in Tikhvin, Russia, in 1844. He taught at the St Petersburg Conservatory for almost 40 years.",
    theme: { title: "Flight of the Bumblebee, from The Tale of Tsar Saltan", bpm: 150, notes: [
      [88, 0, .25], [87, .25, .25], [86, .5, .25], [85, .75, .25], [86, 1, .25], [85, 1.25, .25], [84, 1.5, .25], [83, 1.75, .25],
      [84, 2, .25], [83, 2.25, .25], [82, 2.5, .25], [81, 2.75, .25], [80, 3, .25], [79, 3.25, .25], [78, 3.5, .25], [77, 3.75, .25],
      [76, 4, .25], [75, 4.25, .25], [74, 4.5, .25], [73, 4.75, .25], [74, 5, .25], [73, 5.25, .25], [72, 5.5, .25], [71, 5.75, .25],
      [72, 6, .25], [71, 6.25, .25], [70, 6.5, .25], [69, 6.75, .25], [68, 7, .25], [67, 7.25, .25], [66, 7.5, .25], [65, 7.75, .25], [64, 8, 1]
    ] },
    sound: "Non-stop fast notes, sliding down by semitones and buzzing back up: a bumblebee zooming round a prince.",
    facts: [
      "As a young naval officer he sailed across the Atlantic and back on a warship.",
      "He was one of ‘The Five’, Russian composers who wanted music to sound Russian.",
      "He taught composition to Igor Stravinsky.",
      "He was a master of the orchestra and wrote a famous book about orchestration."
    ],
    famous: ["Scheherazade", "Flight of the Bumblebee", "Capriccio espagnol"],
    quiz: { q: "What was Rimsky-Korsakov's first job?", options: ["Naval officer", "Doctor", "Baker"], answer: 0 },
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
