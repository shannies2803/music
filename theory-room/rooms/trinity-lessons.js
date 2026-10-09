/* The Theory Room: the explanations for the Trinity theory lessons (Grades 1–8).
   Each one: what it is, how to work it out, an example, and a mistake to watch for.
   Loaded after trinity-theory.js, which makes the questions. */
(function () {
  "use strict";
  if (!window.TRINITY_LESSONS) return;
  const tip = s => `<p class="muted" style="margin-top:8px"><b>Watch out:</b> ${s}</p>`;
  const ex = s => `<p><b>Example:</b> ${s}</p>`;
  const H = {
    /* ---------- Grade 1 ---------- */
    "tr1-treble": `<p>The treble clef curls round the second line up, which is <b>G</b> above middle C. That's why it's also called the G clef.</p>
      <p>Lines from the bottom: <b>E G B D F</b> (‘Every Good Boy Deserves Football’). Spaces: <b>F A C E</b>. <b>Middle C</b> sits on one leger line below the stave.</p>
      ${ex("The note in the top space is E; the note just above the top line is G.")}${tip("count from a note you're sure of, line–space–line, rather than guessing from how high it looks.")}`,
    "tr1-bass": `<p>The bass clef's two dots sit either side of the fourth line up, which is <b>F</b> below middle C. That's why it's also called the F clef.</p>
      <p>Lines from the bottom: <b>G B D F A</b> (‘Good Boys Deserve Fun Always’). Spaces: <b>A C E G</b> (‘All Cows Eat Grass’). <b>Middle C</b> is on one leger line above the stave.</p>
      ${tip("bass and treble lines are not the same notes: the bottom line is E in the treble clef but G in the bass clef.")}`,
    "tr1-values": `<p>Every note value is half the one before: a <b>semibreve</b> (4 crotchet beats) = 2 <b>minims</b> (2 beats each) = 4 <b>crotchets</b> (1 beat) = 8 <b>quavers</b> (½ beat).</p>
      <p>A <b>dot</b> after a note adds half its value again, so a <b>dotted minim</b> is 2 + 1 = 3 beats.</p>
      ${ex("a minim and two crotchets fill a bar of 4/4.")}`,
    "tr1-rests": `<p>Each note value has a rest of the same length. The <b>minim rest</b> sits on top of the middle line like a hat; the <b>semibreve rest</b> hangs below the fourth line like a hole. The <b>crotchet rest</b> is the zig-zag.</p>
      <p>A semibreve rest also means ‘a whole bar's rest’, in any time signature.</p>
      ${tip("‘a hat sits on top’ (minim rest, 2 beats); ‘a hole drops down’ (semibreve rest, 4 beats).")}`,
    "tr1-time": `<p>The <b>top number</b> says how many beats are in a bar; the <b>bottom number 4</b> says each beat is a crotchet.</p>
      <p><b>2/4</b>: two crotchet beats, like a march. <b>3/4</b>: three, like a waltz. <b>4/4</b>: four, the most common.</p>
      ${ex("a bar with a dotted minim and nothing else adds up to 3 beats, so it's 3/4.")}`,
    "tr1-tones": `<p>A <b>semitone</b> is the distance from one key on the piano to the very next, black or white. A <b>tone</b> is two semitones.</p>
      <p>A <b>sharp</b> ♯ raises a note a semitone, a <b>flat</b> ♭ lowers it a semitone, and a <b>natural</b> ♮ cancels either.</p>
      ${tip("E–F and B–C are semitones even though they're both white notes: there's no black key between them.")}`,
    "tr1-keys": `<p>A key signature, at the start of each line, lists the sharps or flats that last all the way through.</p>
      <p><b>C major</b>: none. <b>G major</b>: one sharp, F♯. <b>F major</b>: one flat, B♭.</p>
      ${tip("the F♯ in G major's key signature is written on the top line of the treble clef (the 4th line of the bass clef), but it means every F.")}`,
    "tr1-degrees": `<p>Number the notes of a scale from the keynote (the <b>tonic</b>): 1 2 3 4 5 6 7 8. Degree 8 is the tonic again, an octave higher.</p>
      ${ex("in G major, 1 = G, 3 = B, 5 = D, 7 = F♯.")}${tip("start counting on the tonic as 1, not 0.")}`,
    "tr1-intervals": `<p>An interval's number is how many letter names it spans, <b>counting both notes</b>.</p>
      ${ex("C up to G: C D E F G = 5 letters, so a 5th. C up to C is an octave (8th).")}
      ${tip("count letters, not steps: C to D is a 2nd, not a 1st.")}`,
    "tr1-triads": `<p>A triad is three notes, each a 3rd apart. The <b>tonic triad</b> uses degrees 1, 3 and 5 of the scale: in C major, C–E–G.</p>
      <p>On the stave, a root-position triad is either all on lines or all in spaces, like a snowman.</p>
      ${ex("the tonic triad of F major is F–A–C; of G major, G–B–D.")}`,
    "tr1-terms": `<p>Words at this level tell you how loud, how fast and how to play, for example: <i>p</i> (quiet), <i>f</i> (loud), <i>mp</i>, <i>mf</i>, <i>cresc.</i> (getting louder), <i>dim.</i> (getting quieter), <i>allegro</i> (fast), <i>andante</i> (at a walking pace), <i>legato</i> (smoothly), <i>staccato</i> (short and detached).</p>
      ${tip("<i>piano</i> means quiet: the instrument's full name, pianoforte, means ‘quiet-loud’.")}`,
    /* ---------- Grade 2 ---------- */
    "tr2-ledger": `<p>Leger lines are short lines that extend the stave. At Grade 2 notes can go up to <b>two</b> leger lines above or below.</p>
      <p>Treble clef: A below middle C is on the 2nd leger line below; C two octaves above middle C is on the 2nd leger line above. Bass clef: E above middle C is on the 2nd leger line above.</p>
      ${tip("keep counting line–space–line from the stave outward; don't jump.")}`,
    "tr2-values": `<p>A <b>semiquaver</b> is half a quaver (¼ beat). A <b>dot</b> adds half the value again: a dotted crotchet is 1 + ½ = 1½ beats, and is often followed by a quaver to complete 2 beats.</p>
      ${ex("dotted quaver + semiquaver = ¾ + ¼ = 1 beat.")}`,
    "tr2-time": `<p>When the bottom number is <b>2</b>, the beat is a <b>minim</b>. <b>2/2</b> has two minim beats (often written ¢, ‘cut common time’) and <b>3/2</b> has three.</p>
      ${ex("a bar of 3/2 holds six crotchets' worth of notes.")}${tip("2/2 and 4/4 contain the same amount of music per bar, but 2/2 feels two in a bar.")}`,
    "tr2-keys": `<p>Every major key has a <b>relative minor</b> with the same key signature. Its tonic is the 6th note of the major scale, or three semitones below the major tonic.</p>
      <p>C major / <b>A minor</b> (no sharps or flats); G major / <b>E minor</b> (F♯); F major / <b>D minor</b> (B♭).</p>
      ${tip("to tell major from minor with the same key signature, look at the last note and for a raised 7th, like G♯ in A minor.")}`,
    "tr2-scales": `<p>The <b>natural minor</b> uses only the notes of the key signature: A B C D E F G A. The <b>harmonic minor</b> raises the 7th note going up and coming down: A B C D E F <b>G♯</b> A.</p>
      <p>The raised 7th makes a leading note that pulls up to the tonic, and leaves a gap of three semitones between the 6th and 7th.</p>
      ${tip("the raised 7th is written as an accidental, never in the key signature.")}`,
    "tr2-intervals": `<p>Give the number by counting letters, up to the octave, in major and minor keys. It also helps to start hearing the types: <b>major and minor 2nds and 3rds</b> (minor is a semitone smaller), and <b>perfect 4ths, 5ths and octaves</b>.</p>
      ${ex("C–E is a major 3rd (4 semitones); C–E♭ is a minor 3rd (3 semitones); C–F is a perfect 4th.")}`,
    "tr2-triads": `<p>A <b>major</b> triad has a major 3rd at the bottom (C–E–G); a <b>minor</b> triad has a minor 3rd (A–C–E). Write it as a Roman numeral (I in major, i in minor) or a chord symbol (<b>C</b>, <b>Am</b>).</p>
      ${tip("a minor chord symbol always has a small m: Dm, not D.")}`,
    "tr2-terms": `<p>New words for speed and character: <i>adagio</i> (slow), <i>moderato</i> (at a moderate speed), <i>presto</i> (very fast), <i>rit.</i> and <i>rall.</i> (gradually slower), <i>a tempo</i> (back to the speed), <i>cantabile</i> (in a singing style), <i>dolce</i> (sweetly), plus the pause sign (fermata).</p>`,
    /* ---------- Grade 3 ---------- */
    "tr3-ledger": `<p>Now notes go up to <b>three</b> leger lines, with sharps and flats too. Learn a few ‘landmark’ notes: middle C (1 leger line below the treble stave), A (3 above the treble stave), and the Cs two octaves apart.</p>${tip("an accidental belongs to the note right after it and lasts to the end of the bar.")}`,
    "tr3-compound": `<p>In <b>simple</b> time the beat divides into <b>two</b> (a crotchet into two quavers). In <b>compound</b> time the beat is a <b>dotted</b> note that divides into <b>three</b>.</p>
      <p><b>6/8</b> = 2 dotted-crotchet beats (compound duple); <b>9/8</b> = 3 (compound triple); <b>12/8</b> = 4 (compound quadruple).</p>
      ${tip("in 6/8 the top number is not the number of beats: divide it by 3.")}`,
    "tr3-barlines": `<p>Add up the quavers: a bar of 6/8 holds 6, 9/8 holds 9 and 12/8 holds 12. Then check that the notes are grouped in threes, one group per dotted-crotchet beat.</p>${ex("in 6/8: dotted crotchet + three quavers = 3 + 3 = one full bar.")}`,
    "tr3-triplets": `<p>A <b>triplet</b> squeezes three notes into the time of two of the same kind. It's marked with a small 3.</p>${ex("a quaver triplet lasts one crotchet; a crotchet triplet lasts one minim.")}`,
    "tr3-keys": `<p>Grade 3 keys go up to two sharps and two flats. <b>D major / B minor</b>: F♯ C♯. <b>B♭ major / G minor</b>: B♭ E♭.</p>
      <p>For sharp keys, the major key is a semitone above the last sharp. For flat keys, it's the second-to-last flat.</p>${tip("sharps are always written in the order F C G D A E B; flats in B E A D G C F.")}`,
    "tr3-scales": `<p>The <b>melodic minor</b> raises the 6th <b>and</b> 7th going up, and goes back to the natural minor coming down: A B C D E F♯ G♯ A — A G F E D C B A.</p>
      <p>So there are three minors: natural (key signature only), harmonic (raised 7th both ways) and melodic (raised 6th and 7th going up).</p>`,
    "tr3-intervals": `<p>Grade 3 adds <b>6ths and 7ths</b>. In a major scale, every interval up from the tonic is <b>major</b> or <b>perfect</b>; one semitone smaller is <b>minor</b>.</p>
      ${ex("C–A is a major 6th (9 semitones), C–A♭ a minor 6th; C–B a major 7th (11), C–B♭ a minor 7th.")}`,
    "tr3-chords": `<p>Chords can be written two ways: as <b>Roman numerals</b> (I, V) built on scale degrees, or as <b>chord symbols</b> naming the root (C, G).</p>
      <p>If the bass isn't the root, the chord symbol adds a slash and the bass note: <b>G/B</b> is a G chord with B in the bass, the same as <b>Vb</b> in C major.</p>${ex("in D major, I = D, V = A, and A/C♯ is V in first inversion.")}`,
    "tr3-instruments": `<p>Know each instrument's family and the clef it reads: <b>violin</b> (strings, treble clef), <b>cello</b> (strings, bass clef and sometimes tenor), <b>flute</b> (woodwind, treble), <b>bassoon</b> (woodwind, bass and sometimes tenor).</p>${tip("the flute is a woodwind instrument even though it's made of metal: it's how the sound is made that counts.")}`,
    "tr3-octave": `<p>To move a tune <b>an octave</b>, keep every letter name the same and shift each note up or down eight notes. Moving from treble to bass clef an octave lower, a note on a <b>line</b> moves to a <b>space</b> and vice versa.</p>${tip("check the first note very carefully: once that's right, the rest follows the same shape.")}`,
    "tr3-terms": `<p>Words for mood and movement: <i>animato</i> (lively), <i>grazioso</i> (gracefully), <i>maestoso</i> (majestically), <i>sostenuto</i> (sustained), <i>tranquillo</i> (calmly), <i>con moto</i> (with movement), <i>poco a poco</i> (little by little), <i>sempre</i> (always).</p>`,
    /* ---------- Grade 4 ---------- */
    "tr4-alto": `<p>The <b>alto clef</b> (or C clef) points to <b>middle C on the middle line</b>. The viola reads it.</p>
      <p>Lines from the bottom: F A C E G. Spaces: G B D F.</p>${tip("work outwards from middle C on the middle line: the space above is D, the line above that E.")}`,
    "tr4-time": `<p><b>5/4</b> and <b>7/4</b> are irregular: the beats group unevenly, usually 3+2 or 2+3 (and 2+2+3 or 3+2+2 in 7/4).</p>
      <p>Classify time signatures as simple or compound, and duple, triple, quadruple, quintuple or septuple.</p>${ex("5/4 is irregular quintuple; 9/8 is compound triple.")}`,
    "tr4-keys": `<p>Keys up to three sharps and flats: <b>A major / F♯ minor</b> (F♯ C♯ G♯) and <b>E♭ major / C minor</b> (B♭ E♭ A♭).</p>${tip("in the alto clef, the sharps and flats sit in different places on the stave, but in the same order.")}`,
    "tr4-scales": `<p>A <b>chromatic scale</b> moves up or down by semitones, using all twelve notes. Each letter name is used at most twice, and the scale starts and ends on the same note.</p>
      ${ex("from C: C C♯ D D♯ E F F♯ G G♯ A A♯ B C going up.")}${tip("don't write three notes on the same letter, like E♭ E E♯.")}`,
    "tr4-enharmonic": `<p><b>Enharmonic</b> notes sound the same but are spelt differently: F♯ = G♭, B♯ = C, E = F♭.</p>${tip("the key decides the spelling: in D major it's F♯, never G♭.")}`,
    "tr4-intervals": `<p>Make a major or perfect interval one semitone bigger and it's <b>augmented</b>; make a minor or perfect interval one semitone smaller and it's <b>diminished</b>.</p>
      <p>The <b>tritone</b> is three whole tones: an augmented 4th (F–B) or a diminished 5th (B–F).</p>${tip("always count the letters first for the number, then the semitones for the type.")}`,
    "tr4-chords": `<p>Chords <b>I, IV and V</b> in any position. Root position has the root in the bass (<b>a</b>, or no letter); first inversion the 3rd (<b>b</b>, slash symbol like C/E); second inversion the 5th (<b>c</b>, like C/G).</p>${ex("in G major, IVb = C/E and Vc = D/A.")}`,
    "tr4-cadences": `<p>A cadence is the two chords at the end of a phrase. <b>Perfect</b>: V–I (a full stop). <b>Plagal</b>: IV–I (the ‘Amen’). <b>Imperfect</b>: ends on V (a comma).</p>${tip("find the key first, then label the last two chords.")}`,
    "tr4-transpose": `<p>A <b>transposing instrument</b> sounds at a different pitch from the written note. The <b>horn in F</b> sounds a perfect 5th lower. The <b>descant recorder</b> sounds an octave higher; the <b>double bass</b> and <b>guitar</b> sound an octave lower.</p>${tip("the instrument's key name tells you what a written C sounds as: horn in F → a written C sounds F.")}`,
    "tr4-instruments": `<p>Brass (trumpet, horn, trombone, tuba), woodwind (flute, oboe, clarinet, bassoon), strings (violin, viola, cello, double bass). Know the clefs: viola alto; trombone, tuba, cello and bassoon bass (and tenor, high up).</p>`,
    "tr4-terms": `<p>Accents and changes: <i>sfz</i> (a sudden strong accent), <i>fp</i> (loud then immediately quiet), <i>accel.</i> (getting faster), <i>meno mosso</i> (slower), <i>più mosso</i> (faster), <i>agitato</i> (agitated), <i>giocoso</i> (playful).</p>`,
    /* ---------- Grade 5 ---------- */
    "tr5-tenor": `<p>The <b>tenor clef</b> is the C clef on the <b>fourth line</b>: middle C is the second line from the top. Cellos, bassoons and trombones use it for high passages.</p>${tip("it looks like the alto clef, so check which line the clef points to.")}`,
    "tr5-keys": `<p>Keys up to five sharps and flats: <b>E</b> and <b>B major</b> (4 and 5 sharps), <b>A♭</b> and <b>D♭ major</b> (4 and 5 flats), and their relative minors <b>C♯, G♯, F</b> and <b>B♭ minor</b>.</p>${tip("the relative minor's tonic is the 6th note of the major scale.")}`,
    "tr5-pentatonic": `<p>A <b>pentatonic</b> scale has five notes. The major pentatonic is degrees 1 2 3 5 6 of the major scale (C D E G A): no semitones, which is why it sounds open and folk-like.</p>${ex("all the black keys on the piano make a pentatonic scale.")}`,
    "tr5-intervals": `<p>Name intervals fully (type and number). To <b>invert</b> an interval, put the lower note up an octave: the numbers add up to <b>9</b>, major ↔ minor, augmented ↔ diminished, and perfect stays perfect.</p>${ex("a major 3rd C–E inverts to a minor 6th E–C.")}`,
    "tr5-chords": `<p>In a major key, chords <b>I, IV and V</b> are major and <b>ii</b> is minor. Trinity often writes minor chords in lower case.</p>${ex("in F major, ii = Gm, IV = B♭, V = C; iib = Gm/B♭.")}`,
    "tr5-cadences": `<p>The <b>imperfect cadence</b> ends on V, after almost any chord (I–V, ii–V, IV–V). It sounds unfinished, like a question.</p>${tip("perfect and plagal both end on I; imperfect ends on V.")}`,
    "tr5-modulation": `<p>A modulation is a change of key. A new accidental is the clue: a <b>sharpened 4th</b> means the dominant key; in a major key, a <b>sharpened 5th</b> means the relative minor.</p>${ex("C major with F♯s → G major; C major with G♯s → A minor.")}`,
    "tr5-ornaments": `<p>An <b>acciaccatura</b> (crushed note, with a stroke) is played as quickly as possible; an <b>appoggiatura</b> (leaning note) usually takes half the main note's value. A <b>trill</b> alternates quickly with the note above; a <b>mordent</b> flicks to the note above (upper) or below (lower) and back.</p>`,
    "tr5-transpose": `<p><b>Clarinet in B♭</b> and <b>trumpet in B♭</b> sound a major 2nd lower than written. <b>Alto saxophone in E♭</b> sounds a major 6th lower.</p>${ex("written D for clarinet in B♭ sounds C.")}${tip("when writing for B♭ instruments, the written key has two more sharps (or two fewer flats) than the sounding key.")}`,
    "tr5-form": `<p><b>Binary</b> form has two sections, A and B, often both repeated. <b>Strophic</b> songs use the same music for every verse. <b>Verse and refrain</b> songs alternate verses with a chorus that comes back.</p>`,
    "tr5-terms": `<p>Pedal marks (<i>Ped.</i> and *), <i>una corda</i> (soft pedal), <i>tre corde</i> (release it), and moods: <i>affettuoso</i> (tenderly), <i>con fuoco</i> (with fire), <i>scherzando</i> (playfully), <i>lusingando</i> (coaxingly).</p>`,
    /* ---------- Grade 6 ---------- */
    "tr6-keys": `<p>All 15 major and 15 minor key signatures, up to seven sharps (C♯ major, A♯ minor) and seven flats (C♭ major, A♭ minor). Know them in all four clefs.</p>${tip("C♯ major and D♭ major sound the same; Trinity may ask for either spelling.")}`,
    "tr6-scales": `<p>The <b>minor pentatonic</b> uses degrees 1 ♭3 4 5 ♭7 (A C D E G). Add a flattened 5th and you get the <b>blues scale</b> (A C D E♭ E G). The <b>Aeolian</b> mode is the natural minor.</p>`,
    "tr6-dim7": `<p>The <b>diminished 7th</b> chord is built on the raised leading note of a minor key, with three minor 3rds stacked: in C minor, B–D–F–A♭. It's tense and resolves to the tonic.</p>${tip("spell it in 3rds (letters a 3rd apart): B D F A♭, not B D F G♯.")}`,
    "tr6-figures": `<p><b>Figured bass</b> shows chords by intervals above the bass: <b>5 3</b> (or nothing) = root position, <b>6 3</b> (or 6) = first inversion, <b>6 4</b> = second inversion.</p>${ex("in C major, bass E with 6 = C major chord in first inversion (Ib).")}`,
    "tr6-cadences": `<p>Grade 6 uses all four cadences. <b>Perfect</b> V–I and <b>plagal</b> IV–I end on the tonic and sound finished. <b>Imperfect</b> ends on V and sounds like a comma. The new one is the <b>interrupted</b> cadence, V–vi: you expect V–I, and the music swerves to the submediant instead.</p>
      ${ex("in G major, D → Em is interrupted; in A minor, E → F is interrupted (V–VI).")}${tip("decide which chord the phrase ends on first: I means perfect or plagal, V means imperfect, vi means interrupted.")}`,
    "tr6-transpose": `<p>The <b>tenor saxophone in B♭</b> sounds a major 9th (an octave and a major 2nd) lower than written.</p>${tip("the octave matters: a tenor sax sounds lower than a clarinet in B♭ reading the same note.")}`,
    "tr6-form": `<p>A Baroque <b>suite</b> is a set of dances in the same key: allemande, courante, sarabande, gigue, often with a minuet or gavotte. Textures: <b>monophonic</b> (one line), <b>homophonic</b> (tune and chords), <b>polyphonic/contrapuntal</b> (several independent lines).</p>`,
    "tr6-terms": `<p>String terms: <i>arco</i> (with the bow), <i>pizz.</i> (plucked), <i>con sordino</i> (with a mute), <i>sul ponticello</i> (bow near the bridge), <i>col legno</i> (with the wood of the bow). Italian instrument names: <i>tromba</i> (trumpet), <i>corno</i> (horn), <i>fagotto</i> (bassoon).</p>`,
    /* ---------- Grade 7 ---------- */
    "tr7-scales": `<p>The <b>Dorian mode</b> is the white notes from D to D: like the natural minor but with a <b>major 6th</b>. The <b>whole-tone scale</b> has six notes, all a tone apart, with no semitones; Debussy loved it.</p>`,
    "tr7-blues": `<p>The <b>12-bar blues</b>: I I I I | IV IV I I | V IV I V (or I in the last bar). The last bar of V is the ‘turnaround’, leading back to the start.</p>${ex("in C: C C C C | F F C C | G F C G.")}`,
    "tr7-sevenths": `<p>A <b>7th chord</b> adds a 7th above the root. Apart from V7, the most common is <b>ii7</b>, which often leads to V. Figures: 7, 6 5, 4 3, 4 2.</p>${tip("the 7th usually falls by step into the next chord.")}`,
    "tr7-cadences": `<p>The <b>Phrygian cadence</b> is ivb–V in a minor key: the bass falls a semitone to the dominant. A <b>tierce de Picardie</b> ends a minor piece on a major tonic chord.</p>`,
    "tr7-modulation": `<p>A <b>pivot chord</b> belongs to both the old key and the new one, making the change smooth. Then the new key's leading note appears, and a cadence confirms it.</p>${ex("C major to G major: Am is vi in C and ii in G, so it can pivot.")}`,
    "tr7-transpose": `<p><b>Clarinet in A</b> sounds a minor 3rd lower; <b>soprano saxophone</b> (B♭) a major 2nd lower; <b>baritone saxophone</b> (E♭) an octave and a major 6th lower; <b>tenor horn</b> (E♭) a major 6th lower.</p>`,
    "tr7-form": `<p><b>Sonata form</b>: exposition (two themes, two keys), development (themes broken up, many keys), recapitulation (both themes in the home key). <b>Rondo</b>: A B A C A. The Classical <b>string quartet</b> is two violins, viola and cello.</p>`,
    "tr7-terms": `<p>Grade 7 terms are the language of form. <i>Exposition</i>: the first section of sonata form, presenting the themes. <i>Development</i>: the middle, where themes are broken up and travel through keys. <i>Recapitulation</i>: the themes return in the home key. <i>Coda</i>: an ending section. <i>Bridge</i> or <i>transition</i>: a linking passage between themes. <i>Episode</i>: a contrasting section, as in a rondo.</p>
      ${tip("the first theme of a sonata-form movement is in the tonic; in a major key the second is usually in the dominant.")}`,
    /* ---------- Grade 8 ---------- */
    "tr8-scales": `<p>The <b>Mixolydian mode</b> is the white notes from G to G: a major scale with a <b>flattened 7th</b>. Compare Dorian (minor with a major 6th) and Aeolian (natural minor).</p>${tip("work out a mode by comparing it with the major or natural minor scale on the same note.")}`,
    "tr8-rows": `<p>A <b>tone row</b> puts all twelve notes in an order, each used once (Schoenberg's twelve-note method). Its forms: <b>prime</b> (the row), <b>retrograde</b> (backwards), <b>inversion</b> (intervals upside down) and <b>retrograde inversion</b>.</p>${ex("if the row starts C, A, A♭, its retrograde ends A♭, A, C.")}`,
    "tr8-chromatic": `<p>The <b>Neapolitan 6th</b> (♭II in first inversion), the <b>augmented 6ths</b> (Italian, French, German: ♭6 in the bass with ♯4 above), and <b>secondary dominants</b> (V of V). All three tend to lead to V.</p>`,
    "tr8-figures": `<p>Figure any triad or 7th chord in any position: 7 / 6 5 / 4 3 / 4 2 for 7ths. Accidentals in the figures show notes outside the key signature; an accidental alone refers to the 3rd above the bass.</p>`,
    "tr8-modulation": `<p>Related keys are the dominant, the subdominant, the relative minor or major, and the relatives of the dominant and subdominant. Spot the new accidentals, find a pivot chord, then the cadence in the new key.</p>`,
    "tr8-transpose": `<p>New at Grade 8: <b>piccolo</b> (sounds an octave higher), <b>cor anglais</b> (in F, a perfect 5th lower), <b>cornet</b> (B♭, a major 2nd lower), <b>xylophone</b> (an octave higher) and <b>glockenspiel</b> (two octaves higher).</p>`,
    "tr8-form": `<p>Romantic forms: the <b>concerto</b> (soloist and orchestra), the <b>symphonic poem</b> (an orchestral piece that tells a story), <b>character pieces</b> for piano (nocturnes, intermezzi, songs without words), and the <b>song cycle</b>. Twentieth-century <b>serialism</b> builds music from tone rows.</p>`,
    "tr8-terms": `<p>Romantic genres and directions: <i>nocturne</i>, <i>étude</i>, <i>lied</i>, <i>leitmotif</i> (a theme linked to a character), <i>rubato</i> (flexible timing), <i>morendo</i> (dying away), <i>tempo primo</i> (the first speed).</p>`
  };
  /* the terms lessons show the grade's whole list, from the same table the quiz uses */
  const TT = window.TRINITY_TERMS || {};
  const TERM_INTRO = {
    1: "how loud, how fast and how smoothly to play", 2: "speed, character and holding notes", 3: "mood, movement and the small words that join terms (con, ma, poco, più)",
    4: "accents, changes of speed and character", 5: "the pedals, freedom of time and stronger moods", 6: "string playing and the Italian names of instruments",
    7: "the sections of sonata form and other forms", 8: "Romantic genres and forms"
  };
  for (let g = 1; g <= 8; g++) {
    const list = TT[g] || []; if (!list.length) continue;
    H["tr" + g + "-terms"] = `<p>Grade ${g} adds ${list.length} words about ${TERM_INTRO[g]}. You also need every term from the grades before. Cover the right-hand column, say each meaning aloud, then try the quiz.</p>
      <div class="glossary" style="margin-top:8px">${list.map(t => `<div class="gl"><i>${esc(t[0])}</i> — ${esc(t[1])}</div>`).join("")}</div>`;
  }
  window.TRINITY_LESSONS.forEach(l => { if (H[l.id]) l.h = H[l.id]; });
  window.TRINITY_LESSON_TEXT = H;
})();
