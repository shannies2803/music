/* The Instruments room, in depth: history, parts, playing techniques (with the words written in the music),
   place in the orchestra, relatives and practice tips, for each instrument in instruments.js.
   tech entries are [term written in the music, what it means]. Like the rest of the room, waiting for a final check. */
window.INSTRUMENTS_MORE = {
  violin: {
    history: "The violin appeared in northern Italy in the early 1500s. The Amati family of Cremona set its shape, and around 1700 Antonio Stradivari and the Guarneri family made the instruments players still prize most. Its shape has hardly changed since, though necks were lengthened and strings made stronger in the 1800s to fill bigger concert halls.",
    parts: ["Scroll and pegbox, where the pegs tune the strings", "Fingerboard, with no frets", "Bridge, which carries the strings' vibrations to the body", "f-holes, which let the sound out", "Sound post, a small stick inside that links the front and back", "Chin rest, and a shoulder rest underneath", "The bow: a stick of pernambuco or carbon fibre with horsehair"],
    tech: [["arco", "with the bow (after pizzicato)"], ["pizz. (pizzicato)", "pluck the string"], ["con sord. (con sordino)", "with a mute on the bridge"], ["sul ponticello", "bow near the bridge, for a glassy sound"], ["sul tasto", "bow over the fingerboard, for a soft, flute-like sound"], ["col legno", "tap the string with the wood of the bow"], ["⊓ / V", "down-bow / up-bow"], ["double stopping", "playing two strings at once"], ["tremolo", "very fast repeated bow strokes"], ["o (harmonic)", "touch the string lightly for a high, whistling note"]],
    orchestra: "Violins are the largest group in the orchestra: the first and second violins usually sit to the conductor's left. The leader (concertmaster) sits at the front desk of the first violins.",
    relatives: ["Viola", "Cello", "Double bass (related, but partly from the viol family)", "Viol family (older, fretted cousins)"],
    tips: ["Tune with the A string first, then tune the others in 5ths against it.", "Practise slow open-string bows in front of a mirror to keep the bow straight, halfway between bridge and fingerboard.", "Use a drone (a held note) to check tuning in scales.", "Rosin the bow a little, often, rather than a lot at once."]
  },
  viola: {
    history: "The viola was born alongside the violin in 16th-century Italy. For a long time it filled in the middle of the harmony, but from the 1700s composers such as Telemann, Mozart and later Berlioz, Hindemith and Walton gave it solo music of its own.",
    parts: ["The same parts as the violin, a little larger", "Strings C G D A, with a thicker C string", "A heavier bow with a broader tip"],
    tech: [["alto clef", "the clef the viola reads, with middle C on the middle line"], ["arco", "with the bow"], ["pizz.", "pluck the string"], ["con sord.", "with a mute"], ["sul G / sul C", "play the passage on the G (or C) string"], ["divisi (div.)", "the section divides to play two parts"], ["unis.", "the section plays one part again"]],
    orchestra: "Violas usually sit in the middle of the strings, between the second violins and the cellos (or on the outside right, depending on the conductor). They often play the inner harmony.",
    relatives: ["Violin", "Cello", "Viola d'amore (a Baroque cousin with extra strings)"],
    tips: ["Learn the alto clef from middle C (the middle line) outwards.", "Its sound is darker than the violin's: use a heavier bow arm, not more speed.", "Read treble clef for high passages: practise switching clefs in scales."]
  },
  cello: {
    history: "The cello appeared in Italy in the early 1500s. Until about 1700 it mostly played bass lines. Then Vivaldi, Bach (six solo suites) and Boccherini gave it solo music. The spike (endpin) became standard only in the late 1800s; before that, players gripped it with their legs.",
    parts: ["Scroll, pegbox and fingerboard", "Bridge, f-holes and sound post, as on the violin", "Endpin, the adjustable spike that rests on the floor", "A shorter, heavier bow than the violin's"],
    tech: [["tenor clef", "used for higher passages, before switching to treble"], ["thumb position", "the thumb rests across the strings for very high notes"], ["arco / pizz.", "with the bow / plucked"], ["sul ponticello / sul tasto", "near the bridge / over the fingerboard"], ["con sord.", "with a mute"], ["vibrato", "a gentle wobble of the finger to warm the sound"]],
    orchestra: "Cellos usually sit to the conductor's right (or in the middle). With the double basses they play the bass line, but they often get the big tunes too.",
    relatives: ["Violin", "Viola", "Double bass", "Viola da gamba (an older, fretted cousin)"],
    tips: ["Sit near the front of the chair with both feet flat, and set the endpin so the top of the cello rests against your chest.", "Keep the bow parallel to the bridge as you cross strings.", "Learn the tenor clef by Grade 5 or 6: it saves leger lines."]
  },
  doublebass: {
    history: "The double bass took its sloping shoulders and tuning in 4ths from the old viol family. Domenico Dragonetti, around 1800, and Giovanni Bottesini in the 1800s showed it could be a solo instrument. In the 20th century it became the heartbeat of jazz.",
    parts: ["Sloping shoulders, like a viol", "Machine heads (metal gears) instead of wooden pegs", "Endpin", "Two kinds of bow: the French bow (held like a cello bow) and the German bow (held underhand)"],
    tech: [["pizz.", "pluck: the usual sound in jazz"], ["arco", "with the bow"], ["8vb", "it already sounds an octave lower than written"], ["walking bass", "a jazz bass line moving on every beat"], ["harmonics", "high notes made by touching the string lightly"]],
    orchestra: "Usually at the back right of the orchestra, behind the cellos. In jazz bands the bass and drums keep the time.",
    relatives: ["Cello", "Violone (its Baroque ancestor)", "Bass guitar"],
    tips: ["Choose a bass size that fits you: many young players start on a 1/4 or 1/2 size.", "Keep the left-hand fingers curved and use the arm's weight, not just the fingers.", "Practise with a metronome: in a band the bass keeps everyone together."]
  },
  harp: {
    history: "Harps are among the oldest instruments, shown in ancient Egyptian and Mesopotamian art. The modern concert harp comes from Sébastien Érard's double-action pedal harp of 1810, which lets every string play flat, natural or sharp.",
    parts: ["Neck and pillar (column)", "Soundboard and soundbox", "47 strings (red Cs, dark Fs)", "Seven pedals, one for each letter name, each with three positions"],
    tech: [["gliss.", "sweep the fingers across the strings"], ["près de la table", "pluck near the soundboard, for a dry, guitar-like sound"], ["o (harmonic)", "touch the middle of the string for a bell-like note an octave higher"], ["étouffez", "damp the strings (stop them ringing)"], ["arpeggiando", "spread the chord from bottom to top"], ["pedal diagram", "a chart showing where each pedal sits"]],
    orchestra: "Usually one or two harps, to the left near the back. Tchaikovsky and Debussy used the harp for colour and sparkle.",
    relatives: ["Lever (Celtic) harp, with levers instead of pedals", "Lyre", "Kora, a West African harp-lute"],
    tips: ["Set the pedals for the key before you start, and mark pedal changes in pencil.", "Place the fingers on the strings before you play (placing) for clean, even notes.", "Close the hand into the palm after each note."]
  },
  guitar: {
    history: "Guitars came from Spain, where the vihuela and Baroque guitar were played. The modern classical guitar's shape was set by Antonio de Torres in the mid-1800s, and Andrés Segovia brought it into concert halls in the 20th century.",
    parts: ["Head and tuning machines", "Neck with frets", "Soundhole and soundboard", "Bridge and saddle", "Six strings (nylon on a classical guitar)"],
    tech: [["p i m a", "the right-hand fingers: thumb, index, middle, ring"], ["rest stroke (apoyando)", "the finger comes to rest on the next string"], ["free stroke (tirando)", "the finger clears the next string"], ["barré (B, C)", "one finger presses several strings at once"], ["rasgueado", "a flamenco strum, flicking the fingers out"], ["harm.", "natural harmonics, usually at the 5th, 7th and 12th frets"], ["sul pont. / sul tasto", "pluck near the bridge / over the fingerboard"]],
    orchestra: "Rare in the orchestra, but the star of Spanish music and of concertos such as Rodrigo's Concierto de Aranjuez.",
    relatives: ["Lute", "Vihuela", "Ukulele", "Electric and bass guitars"],
    tips: ["Keep the left thumb behind the neck, opposite the 2nd finger.", "Shape your nails for a clear tone, or practise with the flesh of the fingertip.", "Practise changing between chord shapes slowly before playing them in time."]
  },
  flute: {
    history: "Flutes are among the oldest instruments: bone flutes over 35,000 years old have been found. The Baroque flute (traverso) was wooden with one key. Theobald Boehm's metal flute of 1847, with its ring-key system, is the flute played today.",
    parts: ["Head joint, with the lip plate and embouchure hole", "Body, with most of the keys", "Foot joint, for the lowest notes", "Crown and cork at the very top"],
    tech: [["flutter-tongue (flz.)", "roll an R while blowing, for a buzzing sound"], ["double tonguing", "‘tu-ku’ tonguing for very fast notes"], ["harmonics", "overblowing a low fingering"], ["breath mark (,)", "where to breathe"], ["key clicks", "a percussive sound made by the keys alone"]],
    orchestra: "In the woodwind section, in front of the brass, usually two flutes plus a piccolo.",
    relatives: ["Piccolo", "Alto flute", "Bass flute", "Recorder", "Pan pipes"],
    tips: ["Practise long notes every day for a steady, even tone.", "Aim the air across the hole, not into it; roll the head joint in or out to adjust.", "Use your diaphragm and plan breaths at the ends of phrases."]
  },
  oboe: {
    history: "The oboe grew out of the loud outdoor shawm in 17th-century France, where its name was ‘hautbois’, ‘high (loud) wood’. It became a regular member of the orchestra from the Baroque period on.",
    parts: ["Double reed of cane, tied to a small tube (staple)", "Top joint, bottom joint and bell", "Keys and octave keys"],
    tech: [["A = 440", "the oboe sounds the A the orchestra tunes to"], ["half-hole", "partly covering the first hole for certain notes"], ["staccato / legato", "short / smooth"], ["breath mark (,)", "where to breathe: oboists often breathe out before breathing in"]],
    orchestra: "In the woodwind section, usually two oboes, often with the cor anglais. The principal oboe plays many famous solos.",
    relatives: ["Cor anglais", "Oboe d'amore", "Bassoon (also a double reed)", "Shawm"],
    tips: ["Soak the reed for a minute before playing.", "Use very little air but plenty of support; release spare air at the ends of phrases.", "Keep two or three good reeds going in turn."]
  },
  clarinet: {
    history: "Johann Christoph Denner of Nuremberg developed the clarinet from the chalumeau around 1700. Mozart fell in love with its sound and wrote his Clarinet Concerto and Clarinet Quintet for Anton Stadler. The modern Boehm-system clarinet dates from the 1840s.",
    parts: ["Mouthpiece, single reed and ligature", "Barrel", "Upper and lower joints", "Bell"],
    tech: [["chalumeau register", "the rich low notes"], ["clarion register", "the bright middle notes, reached with the register key"], ["altissimo", "the very top notes"], ["gliss.", "a slide, like the opening of Rhapsody in Blue"], ["subtone", "a soft, breathy jazz tone"]],
    orchestra: "In the woodwind section, usually two clarinets (in B♭ or A). Bands and wind orchestras have many more.",
    relatives: ["E♭ clarinet", "Bass clarinet", "Basset horn", "Chalumeau", "Saxophone (also a single reed)"],
    tips: ["Moisten the reed, and keep the ligature screws just firm.", "Cover the holes fully with the pads of your fingers: small leaks squeak.", "Practise crossing the ‘break’ (B♭ to B) slowly with the right hand down."]
  },
  bassoon: {
    history: "The bassoon developed from the dulcian, a one-piece Renaissance double reed, in late 17th-century France. Vivaldi wrote around 39 bassoon concertos. Two main systems are played today: the German (Heckel) and the French (Buffet).",
    parts: ["Double reed on a curved metal crook (bocal)", "Wing joint, boot joint, long joint and bell", "Whisper key, for the upper notes"],
    tech: [["tenor clef", "for higher passages"], ["staccato", "the bassoon's ‘bouncy’ comic side, as in The Sorcerer's Apprentice"], ["flick keys", "touched briefly to help some notes speak"], ["harmonics", "used in the high register"]],
    orchestra: "In the woodwind section, usually two bassoons plus a contrabassoon. They play the woodwind bass line.",
    relatives: ["Contrabassoon", "Dulcian", "Oboe (also a double reed)"],
    tips: ["Use a seat strap or spike to take the weight.", "Soak the reed and check it ‘crows’ before you play.", "Practise long notes in the low register for a full, round tone."]
  },
  saxophone: {
    history: "Adolphe Sax, a Belgian instrument maker working in Paris, invented the saxophone in the 1840s and patented it in 1846. It was soon used in French military bands, and in the 20th century it became the voice of jazz.",
    parts: ["Mouthpiece, reed and ligature", "Neck (crook)", "Body, with large pads", "Bow and bell"],
    tech: [["subtone", "a soft, breathy sound"], ["growl", "humming while playing, for a rough jazz sound"], ["bend", "sliding the pitch with the lips"], ["altissimo", "notes above the normal range"], ["swing quavers", "pairs of quavers played long–short"]],
    orchestra: "Not a regular orchestral instrument, but used in pieces such as Ravel's Boléro and Mussorgsky/Ravel's ‘The Old Castle’. Central to wind bands and jazz big bands.",
    relatives: ["Soprano, alto, tenor and baritone saxophones", "Clarinet (also a single reed)"],
    tips: ["Keep the neck strap set so the mouthpiece comes to your mouth, not the other way round.", "Practise long notes and overtones for a strong tone.", "Learn jazz swing by listening: the written rhythm isn't the whole story."]
  },
  recorder: {
    history: "Recorders were played across Europe in the Middle Ages and Renaissance. In the Baroque period the treble (alto) recorder was a solo instrument for Handel, Bach and Telemann. After a long gap, Arnold Dolmetsch revived it in the early 1900s.",
    parts: ["Head joint with the windway and labium (the sharp edge)", "Middle joint with seven finger holes and a thumb hole", "Foot joint"],
    tech: [["thumbing", "half-closing the thumb hole for upper notes"], ["tonguing (‘doo’, ‘too’, ‘d-g’)", "starting each note with the tongue"], ["ornaments", "trills and mordents, especially in Baroque music"], ["8va", "descant and sopranino sound an octave higher than written"]],
    orchestra: "Not part of the modern orchestra, but used in Baroque ensembles and in recorder consorts of different sizes.",
    relatives: ["Sopranino, descant, treble, tenor and bass recorders", "Tin whistle", "Flute"],
    tips: ["Blow gently: too much air makes the note jump up.", "Cover holes with the soft pads of the fingers.", "Learn the treble recorder's F fingerings as a new instrument, not a copy of the descant."]
  },
  trumpet: {
    history: "Trumpets were signal instruments for thousands of years. The Baroque ‘natural’ trumpet had no valves, so players used very high notes for melodies. Valves arrived around 1815–20, and by the late 1800s the valved trumpet was everywhere.",
    parts: ["Mouthpiece and leadpipe", "Three piston valves", "Main tuning slide and valve slides", "Water key", "Bell"],
    tech: [["con sord.", "with a mute: straight, cup or harmon"], ["double / triple tonguing", "fast tonguing (‘tu-ku’, ‘tu-tu-ku’)"], ["shake / lip trill", "a fast alternation made with the lips"], ["fall", "a jazz slide down at the end of a note"], ["valves 1, 2, 3", "lower the pitch by a tone, a semitone and a minor 3rd"]],
    orchestra: "In the brass section, at the back, usually two or three trumpets. In brass bands the cornets take the trumpet's role.",
    relatives: ["Cornet", "Flugelhorn", "Piccolo trumpet", "Bugle"],
    tips: ["Buzz on the mouthpiece alone for a minute before playing.", "Practise lip slurs between harmonics to build flexibility.", "Rest as much as you play when building up stamina."]
  },
  horn: {
    history: "The horn grew from the hunting horn. The 18th-century natural horn used extra pieces of tube (crooks) to change key and the hand in the bell to fill in notes. Valves were added in the 1800s; today most players use the double horn in F and B♭.",
    parts: ["Mouthpiece (funnel-shaped)", "About 3.7 m of coiled tubing", "Rotary valves, often with a thumb valve to switch to B♭", "Bell, with the player's hand inside"],
    tech: [["+ (stopped)", "close the bell with the hand for a brassy, buzzing sound"], ["con sord.", "with a mute"], ["cuivré", "brassy, forced sound"], ["gestopft", "stopped (German)"], ["Horn in F", "sounds a perfect 5th lower than written"]],
    orchestra: "In the brass section, usually four horns. They often blend with the woodwind as well as the brass.",
    relatives: ["Natural horn", "Wagner tuba", "Mellophone", "Tenor horn (in brass bands)"],
    tips: ["Keep the right hand cupped in the bell: it shapes the tone and the tuning.", "Practise lip slurs: the harmonics are close together high up.", "Sing a passage before playing it so you hear the note you're aiming for."]
  },
  trombone: {
    history: "The trombone grew out of the Renaissance sackbut, and has changed very little since the 1400s. For centuries it was used mainly in church music; Beethoven, Berlioz and later composers made it a regular orchestral voice.",
    parts: ["Mouthpiece", "Slide, with seven positions", "Bell section and tuning slide", "Some have an F attachment (trigger) for extra low notes"],
    tech: [["gliss.", "slide smoothly from one note to another"], ["positions 1–7", "each position lowers the pitch by a semitone"], ["legato tonguing", "soft ‘da’ tonguing so the slide doesn't smear"], ["con sord.", "with a mute"], ["tenor clef", "used for higher passages"]],
    orchestra: "In the brass section, usually two tenor trombones and a bass trombone, sitting with the tuba.",
    relatives: ["Sackbut", "Bass trombone", "Alto trombone", "Valve trombone"],
    tips: ["Move the slide quickly and the tongue lightly to avoid a smeared sound.", "Check positions by ear: there are no fixed places like piano keys.", "Practise long notes with a tuner in every position."]
  },
  euphonium: {
    history: "The euphonium was developed in Germany in the mid-1800s, during the great age of valved brass. It found its home in military bands and in the brass bands of Britain, where it is one of the main solo voices.",
    parts: ["Deep cup mouthpiece", "Conical tubing", "Three or four valves (the fourth for low notes and tuning)", "Upward-pointing bell"],
    tech: [["vibrato", "a gentle wobble made with the lips or jaw"], ["4th valve", "extends the low range and improves tuning"], ["treble clef in B♭", "brass band parts, sounding a major 9th lower"], ["bass clef", "concert pitch parts, in orchestras and wind bands"]],
    orchestra: "A regular part of brass and military bands; sometimes heard in the orchestra as the ‘tenor tuba’.",
    relatives: ["Baritone horn", "Tuba", "Tenor horn", "Ophicleide (its keyed ancestor)"],
    tips: ["Learn to read both bass clef and treble clef in B♭.", "Breathe deep and low: the euphonium needs lots of air.", "Sing through phrases: it's a singing instrument."]
  },
  tuba: {
    history: "The bass tuba was patented in Berlin in 1835 by Wilhelm Wieprecht and Johann Moritz. It replaced older bass instruments such as the serpent and the ophicleide, and by the late 1800s was the bass of the brass section.",
    parts: ["Very large mouthpiece", "Up to about 5.5 metres of tubing (for a B♭ tuba)", "Three to six valves", "Large upward-pointing bell"],
    tech: [["legato", "smooth, connected playing on long breaths"], ["staccato", "short, light notes: the tuba can be nimble"], ["con sord.", "with a (very large) mute"], ["breath marks", "plan breaths: the tuba uses a lot of air"]],
    orchestra: "One tuba sits with the trombones in the orchestra. Brass bands have four: two E♭ and two B♭ basses.",
    relatives: ["Euphonium", "Sousaphone", "Serpent", "Ophicleide", "Wagner tuba"],
    tips: ["Sit up straight and bring the tuba to you.", "Practise long notes and slow scales for a full, round sound.", "Buzz on the mouthpiece to warm up the lips."]
  },
  piano: {
    history: "Bartolomeo Cristofori built the first pianos in Florence around 1700. Mozart played the light Viennese fortepiano; Beethoven pushed for bigger, louder instruments. Iron frames in the 1800s made the modern concert grand possible.",
    parts: ["88 keys", "Hammers covered in felt", "Strings: one to three for each note", "Dampers, which stop the strings", "Soundboard", "Pedals: una corda (left), sostenuto (middle, on most grands), sustaining (right)"],
    tech: [["Ped. *", "press and lift the sustaining (right) pedal"], ["una corda", "use the soft (left) pedal"], ["tre corde", "release the soft pedal"], ["m.d. / m.s.", "right hand / left hand (Italian)"], ["l.h. / r.h.", "left hand / right hand"], ["legato pedalling", "change the pedal just after the new note"], ["8va", "play an octave higher"]],
    orchestra: "Usually a soloist in front of the orchestra in a concerto; sometimes inside the orchestra as an extra colour.",
    relatives: ["Fortepiano", "Harpsichord", "Clavichord", "Organ", "Digital piano"],
    tips: ["Practise hands separately, slowly, then together.", "Use the same fingering every time: write it in.", "Listen for balance: the tune louder than the accompaniment."]
  },
  organ: {
    history: "The first organ, the water-powered hydraulis, was invented by Ctesibius of Alexandria in the 3rd century BC. Organs grew into the great church instruments of the Baroque period, for which Bach wrote some of his finest music.",
    parts: ["Pipes, from tiny to over 9 metres long", "Two or more keyboards (manuals) played by the hands", "A pedalboard played by the feet", "Stops, which switch sets of pipes (ranks) on and off", "A blower that supplies the wind"],
    tech: [["registration", "the choice of stops"], ["Sw. / Gt. / Ped.", "Swell, Great and Pedal divisions"], ["8′, 4′, 16′", "stop pitches: 8′ sounds as written, 4′ an octave higher, 16′ an octave lower"], ["manuals", "the keyboards for the hands"], ["toe / heel", "pedal markings (often ∧ and o)"]],
    orchestra: "Mostly a solo and church instrument, but it joins the orchestra in works such as Saint-Saëns's ‘Organ’ Symphony.",
    relatives: ["Harmonium", "Pipe and electronic organs", "Accordion (also free reeds)"],
    tips: ["Wear smooth-soled organ shoes for the pedals.", "Practise the pedal part alone, looking at the music, not your feet.", "Release notes cleanly: the organ has no sustain once you let go."]
  },
  harpsichord: {
    history: "The harpsichord was played from the 1400s and ruled Baroque keyboard music. By about 1800 the piano had replaced it, but Wanda Landowska and others revived it in the 20th century.",
    parts: ["One or two keyboards (manuals)", "Jacks with plectra (once quills, now often plastic)", "Registers, sets of strings that can be added", "A buff stop on some instruments, for a muted sound"],
    tech: [["ornaments", "trills, mordents and turns that add expression"], ["agréments", "the French name for ornaments"], ["arpeggiando", "spreading chords to add weight"], ["registration", "choosing which sets of strings sound"]],
    orchestra: "In Baroque music it plays the continuo, filling in harmonies from the figured bass.",
    relatives: ["Virginals", "Spinet", "Clavichord", "Piano"],
    tips: ["You can't play louder by pressing harder: use timing, ornaments and spread chords for expression.", "Keep the fingers close to the keys.", "Learn to read figured bass: it's the harpsichordist's shorthand."]
  },
  timpani: {
    history: "Kettledrums came to Europe from the Middle East and were played on horseback with trumpets. They joined the orchestra in the 1600s. Pedal timpani, which can be retuned quickly, arrived in the late 1800s.",
    parts: ["Copper bowl (kettle)", "Calfskin or plastic head", "Tuning pedal and tension rods", "Sticks with heads of felt, wood or flannel"],
    tech: [["tr. (roll)", "a fast alternation of the sticks for a held sound"], ["étouffez / damp", "stop the sound with the hand"], ["muta in…", "retune to…"], ["gliss.", "slide the pitch with the pedal while it rings"], ["hard / soft sticks", "for a sharper or rounder sound"]],
    orchestra: "At the back of the orchestra, usually behind the brass. The timpanist plays two to five drums.",
    relatives: ["Bass drum", "Snare drum", "Tuned percussion such as xylophone and marimba"],
    tips: ["Strike about a hand's width from the edge, not in the middle.", "Let the stick bounce off the head.", "Check tuning quietly with a finger flick before you play."]
  },
  voice: {
    history: "Singing is the oldest music of all. Choirs and solo song shaped Western music from plainchant to opera, which began in Italy around 1600. Today's singing exams include classical songs, folk songs and music from shows.",
    parts: ["Lungs and diaphragm, which power the breath", "Vocal folds in the larynx (voice box)", "Throat, mouth and nose, which shape the sound", "Tongue, lips and teeth, which make the words"],
    tech: [["legato", "smoothly, joining the notes"], ["messa di voce", "swelling and fading on one long note"], ["bocca chiusa", "humming, with the mouth closed"], ["falsetto", "a light upper voice, especially for men"], ["coloratura", "fast, decorated singing"], ["vibrato", "a natural, gentle wobble in the voice"]],
    orchestra: "Choirs stand behind the orchestra, usually in four parts: soprano, alto, tenor and bass. Soloists stand near the conductor.",
    relatives: ["Soprano, mezzo-soprano, alto (contralto)", "Countertenor, tenor, baritone, bass", "Treble (a young singer)"],
    tips: ["Warm up gently every time: hums, lip trills and slides.", "Breathe low into the belly, not the shoulders.", "Speak the words in rhythm before singing them, and learn what they mean."]
  }
};
