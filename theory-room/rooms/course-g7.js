/* The Theory Room: guided course for ABRSM Grade 7 theory. Sent only to families whose plan includes it. */
(window.C78_DATA = window.C78_DATA || {}).g7 = {
  title: "Grade 7 in 30 days",
  intro: "Thirty short days, about 20–30 minutes each, that take you through everything on the ABRSM Grade 7 theory paper. Most days have a quick explanation, a drill that gives endless fresh questions, and sometimes a written task for pencil and manuscript paper. Do five or six days a week, and finish a day when you've done its drills and ticked its checklist.",
  exam: `<p>Grade 7 builds on Grade 6. It's a written paper, so allow around three hours when you practise a whole one. You'll usually meet four kinds of question:</p>
    <ul>
      <li><b>Figured bass.</b> A passage in Baroque style with the melody and bass given: you add figures under the bass to show the chords, including 7ths, suspensions and chromatic chords.</li>
      <li><b>Completing a passage.</b> A keyboard or four-part passage with parts missing: you finish it in the same style, with good voice-leading.</li>
      <li><b>Composition.</b> You continue a given opening into a complete melody for a named instrument, with a modulation, a clear shape and performance directions.</li>
      <li><b>Score questions.</b> Questions on a printed piece: chords, keys, intervals, ornaments, terms, instruments, transposition and style.</li>
    </ul>
    <p class="muted">Check ABRSM's current Grade 7 theory syllabus and a recent practice paper for the exact layout and marks, because these can change.</p>`,
  grownup: `<p><b>What this course is.</b> A day-by-day plan for the ABRSM Grade 7 theory exam. The drills mark themselves. The written tasks are done on paper and come with a checklist your child ticks when they've checked their own work.</p>
    <p><b>How to help (no music reading needed).</b> Ask to see the manuscript paper on written-task days and ask them to play or sing what they wrote. Look at the stars on drill days: one star means it's done, three means it's secure. If a day takes much longer than 30 minutes, split it over two days.</p>
    <p><b>Worth buying.</b> ABRSM's Grade 7 theory practice papers (for days 27–28 and extra practice), manuscript paper and a soft pencil.</p>
    <p><b>Where a teacher helps.</b> Composition and completing a passage have more than one good answer. If you can, ask a teacher to look over one composition and one completed passage before the exam.</p>
    <p><b>Booking the exam.</b> Check ABRSM's website for the current dates and closing dates for entries in your area. Book once days 1–20 feel comfortable.</p>`,
  weeks: [
    { t: "Week 1 · Chords and their figures", days: [
      { t: "Start here: chords and positions", mins: 20, items: [
        { k: "read", h: "<p>Welcome to Grade 7. This course follows the ABRSM paper in order: chords and figures first, then chromatic harmony, then completing a passage, composition, score questions and practice papers.</p><p>Today is a refresh of Grade 6: naming chords on every degree and spotting their position. <b>a</b> is root position, <b>b</b> first inversion (3rd in the bass), <b>c</b> second inversion (5th in the bass).</p>" },
        { k: "drill", id: "g6-chords" }] },
      { t: "Figures for triads", mins: 20, items: [
        { k: "read", h: "<p>Figures are intervals counted up from the bass. Root position is <b>5 3</b> but usually left blank. First inversion is <b>6 3</b>, usually written just <b>6</b>. Second inversion is <b>6 4</b>, and you always write both numbers.</p><p>An accidental beside a figure changes that note; an accidental on its own changes the 3rd above the bass. A line through a figure (6 with a stroke) or a + means ‘raise it’.</p>" },
        { k: "drill", id: "g6-figures" },
        { k: "drill", id: "g7-figbass", note: "The other way round: from a bass note and its figures to the chord." }] },
      { t: "Sevenths and their figures", mins: 25, items: [
        { k: "read", h: "<p>The two 7th chords you'll use most are <b>V7</b> and <b>II7</b>. Their figures: root position <b>7</b>, first inversion <b>6 5</b>, second inversion <b>4 3</b>, third inversion <b>4 2</b> (sometimes just 2).</p><p>The 7th is a dissonance: it is usually <b>prepared</b> (heard in the chord before, in the same part) and it <b>resolves down a step</b>.</p>" },
        { k: "drill", id: "g7-sevenths" }, { k: "drill", id: "g6-v7" }] },
      { t: "Suspensions", mins: 25, items: [
        { k: "drill", id: "g7-sus" },
        { k: "task", id: "sus" }] },
      { t: "Figuring a Baroque passage, step by step", mins: 35, items: [
        { k: "task", id: "figure1" },
        { k: "drill", id: "g7-passage", note: "Real four-part passages in a new key each time: figure the chord marked *." }] },
      { t: "Notes that aren't part of the chord", mins: 25, items: [
        { k: "read", h: "<p>In a figured-bass question the melody moves faster than the chords. Before you choose a chord, decide which melody notes are <b>passing notes</b> (moving by step between two chord notes), <b>auxiliary notes</b> (stepping away and back), <b>appoggiaturas</b> (a leaning note on the beat that falls a step) or <b>suspensions</b> (held over, then falling). Leave those out when you work out the chord.</p><p>In the bass, a quaver moving by step between two chord notes is usually a passing note too: it doesn't need its own figure.</p>" },
        { k: "task", id: "nonchord" }] },
      { t: "Review quiz 1", mins: 20, items: [
        { k: "quiz", id: "c7-quiz1" }] }] },
    { t: "Week 2 · Chromatic chords and keys", days: [
      { t: "The diminished 7th", mins: 20, items: [
        { k: "read", h: "<p>The diminished 7th is built on the <b>raised leading note</b> of a minor key: it's made of three minor 3rds stacked up. In A minor that's G♯–B–D–F. It resolves to the tonic chord. In figures, over the leading note in the bass it's usually <b>7</b> with the needed accidentals.</p>" },
        { k: "drill", id: "g7-dim7" }] },
      { t: "The Neapolitan 6th", mins: 20, items: [
        { k: "read", h: "<p>The Neapolitan 6th is a major chord on the <b>flattened supertonic</b>, nearly always in first inversion, so the bass is the 4th degree. In C minor it's D♭–F–A♭ with F in the bass. It usually leads to V, often through Ic, and the ♭2 falls to the leading note.</p>" },
        { k: "drill", id: "g7-neap" },
        { k: "task", id: "neap" }] },
      { t: "Secondary dominants", mins: 20, items: [
        { k: "read", h: "<p>A secondary dominant is the dominant (or dominant 7th) of a chord that isn't the tonic. The most common is <b>V of V</b>: in C major that's D–F♯–A–C, which pushes strongly to G. You'll spot it by a sharpened note (here F♯) that isn't in the key.</p>" },
        { k: "drill", id: "g7-secdom" }] },
      { t: "Spotting modulations", mins: 25, items: [
        { k: "read", h: "<p>Baroque passages often move to a related key: the dominant, the subdominant, the relative minor or major. Look for the new accidental: a <b>sharpened 4th</b> usually means the dominant; a <b>flattened 7th</b> the subdominant; a sharpened 5th in a major key the relative minor.</p><p>A <b>pivot chord</b> belongs to both keys and makes the move smooth. In the figures, the new accidental shows up as soon as you reach the new key's leading note.</p>" },
        { k: "drill", id: "g7-modkey" }] },
      { t: "Figuring with chromatic chords and a modulation", mins: 35, items: [
        { k: "task", id: "figure2" },
        { k: "drill", id: "g7-passage", note: "Aim for three stars now: look out for the Neapolitan, the diminished 7th and V of V." }] },
      { t: "Cadences and voice-leading", mins: 25, items: [
        { k: "drill", id: "g6-cadmel" }, { k: "drill", id: "g6-consec" }] },
      { t: "Review quiz 2", mins: 20, items: [
        { k: "quiz", id: "c7-quiz2" }] }] },
    { t: "Week 3 · Completing a passage", days: [
      { t: "How a completion question works", mins: 20, items: [
        { k: "read", h: "<p>In a completion question you're given part of a passage, for example the melody and bass of a hymn-like texture, or a keyboard piece with the right hand in some bars only. Your job is to finish it so it sounds like the same composer wrote it.</p><p>The order that works: <b>1.</b> find the key and any modulations; <b>2.</b> choose the chords, starting with the cadences; <b>3.</b> write the missing parts, keeping each part smooth; <b>4.</b> copy the texture and rhythms you're given; <b>5.</b> check for consecutive 5ths and octaves.</p>" },
        { k: "drill", id: "g6-consec" }] },
      { t: "Completing a four-part passage", mins: 30, items: [
        { k: "task", id: "complete1" }] },
      { t: "Completing a keyboard passage", mins: 30, items: [
        { k: "task", id: "complete2" }] },
      { t: "Transposing instruments", mins: 20, items: [
        { k: "drill", id: "g6-transpose" }, { k: "drill", id: "g7-transpose" }] },
      { t: "Ornaments and instruments", mins: 20, items: [
        { k: "drill", id: "g4-ornaments" }, { k: "drill", id: "g5-instruments" }] },
      { t: "Terms", mins: 20, items: [
        { k: "drill", id: "g6-terms" }, { k: "drill", id: "g7-terms" }] },
      { t: "Review quiz 3", mins: 20, items: [
        { k: "quiz", id: "c7-quiz3" }] }] },
    { t: "Week 4 · Composition and score questions", days: [
      { t: "Planning a melody", mins: 25, items: [
        { k: "task", id: "comp1" }] },
      { t: "Writing the melody", mins: 30, items: [
        { k: "task", id: "comp2" }] },
      { t: "Polishing: the instrument and the directions", mins: 25, items: [
        { k: "task", id: "comp3" }] },
      { t: "Score questions: periods and styles", mins: 20, items: [
        { k: "drill", id: "g7-period" }, { k: "drill", id: "g5-intervals" }] },
      { t: "Score questions on a real piece", mins: 30, items: [
        { k: "task", id: "score" }] }] },
    { t: "Week 5 · Exam practice", days: [
      { t: "Practice paper: harmony", mins: 90, items: [
        { k: "task", id: "paperA" }] },
      { t: "Practice paper: composition and score", mins: 90, items: [
        { k: "task", id: "paperB" }] },
      { t: "Fix your weak spots", mins: 25, items: [
        { k: "read", h: "<p>Today, go back to the three drills you've found hardest. Aim for three stars on each.</p>" },
        { k: "weak" }] },
      { t: "Exam day ready", mins: 20, items: [
        { k: "read", h: "<p><b>The day before:</b> one last mixed quiz, then stop. Pack two sharp pencils, a rubber and a watch.</p><p><b>In the exam:</b> read the whole paper first. Do the question you feel surest about first. Leave ten minutes at the end to play everything through in your head and check for consecutive 5ths and octaves, missing accidentals and wrong numbers of beats in a bar.</p>" },
        { k: "quiz", id: "c7-mock" }] }] }
  ],
  quizzes: {
    quiz1: { t: "Review quiz 1: chords, figures and suspensions", ids: ["g6-chords", "g6-figures", "g7-figbass", "g7-sevenths", "g6-v7", "g7-sus", "g7-passage"], h: "Questions from this week's drills." },
    quiz2: { t: "Review quiz 2: chromatic chords and keys", ids: ["g7-dim7", "g7-neap", "g7-secdom", "g7-modkey", "g6-cadmel", "g6-consec", "g7-passage"], h: "Questions from this week's drills." },
    quiz3: { t: "Review quiz 3: everything so far", ids: ["g7-figbass", "g7-sus", "g7-dim7", "g7-neap", "g7-secdom", "g7-transpose", "g4-ornaments", "g7-terms"], h: "A mix of everything so far." },
    mock: { t: "Grade 7 mock quiz", ids: ["g6-chords", "g7-figbass", "g7-passage", "g7-sevenths", "g7-sus", "g7-dim7", "g7-neap", "g7-secdom", "g7-modkey", "g6-consec", "g7-transpose", "g7-period", "g7-terms", "g4-ornaments", "g5-intervals"], h: "Questions from every part of the course, like the shorter questions on the paper." }
  },
  weakFrom: ["g6-chords", "g6-figures", "g7-figbass", "g7-passage", "g7-sevenths", "g6-v7", "g7-sus", "g7-dim7", "g7-neap", "g7-secdom", "g7-modkey", "g6-cadmel", "g6-consec", "g7-transpose", "g7-period", "g7-terms", "g4-ornaments", "g5-intervals"],
  tasks: {
    sus: { t: "Write three suspensions",
      why: "A suspension needs all three stages, in the same part, in the right rhythm. Writing a few by hand is the quickest way to make it automatic.",
      steps: ["Listen to the example and follow the soprano: C is <b>prepared</b> in chord I, <b>held</b> over the new bass note G (a 4th above it: the clash), then <b>falls</b> to B (the 3rd).",
        "In G major, write a 4–3 suspension over chord V in the top part: I (with G on top) → V with G held → G falls to F♯.",
        "In D minor, write a 4–3 over chord V. Remember the leading note C♯ when the suspension resolves.",
        "In F major, write a 7–6 suspension: over the bass A (chord Ib), hold G from the chord before, then let it fall to F.",
        "Under each one, write the figures: 4 3 or 7 6."],
      example: { t: "A 4–3 suspension in C major", k: 0, chords: [["C3", "G3", "E4", "C5"], ["G2", "G3", "D4", "C5"], ["G2", "G3", "D4", "B4"], ["C3", "G3", "E4", "C5"]], labels: ["I", "V", "", "I"], figs: [null, ["4", ""], ["3", ""], null], note: "The clash (C over G) lands on a strong beat; the resolution to B comes after it." },
      check: ["Each suspended note is in the chord before it, in the same part (prepared).", "The clash falls on a strong beat.", "Each one falls by step to a note of the new chord.", "The note the suspension falls to isn't doubled in another part at the moment of the clash (except the bass in 9–8).", "The figures under the bass match what you wrote."] },
    figure1: { t: "Figuring a Baroque passage",
      why: "This is the first question on the paper and the one where a clear method earns the most marks.",
      steps: ["Find the key from the key signature and the last bar. Mark any accidentals: they often mean a modulation or a chromatic chord.",
        "Start at the cadences. Most phrases end with V–I (or a Phrygian ivb–V in a minor key). Figure those first.",
        "For each place marked *, look at the bass note and the melody note above it. Ask: which chord has <i>both</i> notes? Ignore passing and auxiliary notes in the melody.",
        "Prefer strong progressions: I, IV, V, II and VI in root position or first inversion, II7b and V7 before cadences, Ic only before V on a strong beat.",
        "Write the figures: blank for 5 3, 6 for first inversion, 6 4, 7, 6 5, 4 3, 4 2. Add accidentals for any note not in the key, especially the leading note in minor keys.",
        "Play or sing the bass with your chords in your head. If a chord sounds surprising, check it against the melody again.",
        "Practise on the passage in a practice paper, or on the first eight bars of any Baroque sonata (Handel and Corelli are perfect)."],
      example: { t: "Worked example: I – IIb – Ic – V7 – I in C major", k: 0, chords: [["C3", "G3", "E4", "C5"], ["F2", "A3", "F4", "D5"], ["G2", "G3", "E4", "C5"], ["G2", "F3", "D4", "B4"], ["C3", "E3", "C4", "C5"]], labels: ["I", "IIb", "Ic", "V7", "I"], figs: [null, ["6", ""], ["6", "4"], ["7", ""], null], note: "Notice that the 7th of V7 (F, in the tenor) was prepared as part of chord IIb and falls to E." },
      check: ["Every cadence has the right chords and figures.", "Each chord contains both the bass note and the main melody note above it.", "Second inversions (6 4) appear only in the right places, such as Ic before V.", "Every 7th is prepared and falls by step.", "Leading notes in minor keys have their accidental in the figures.", "You've played or sung it through in your head."] },
    nonchord: { t: "Spot the notes that aren't part of the chord",
      steps: ["Take any Baroque minuet or gavotte you play (or one from a practice paper). Copy out the melody of the first eight bars.",
        "Circle each <b>passing note</b> (moves by step between two chord notes), mark each <b>auxiliary</b> with ‘aux’, and each <b>appoggiatura</b> with ‘app’.",
        "Now write a chord under each beat, using only the notes you didn't circle.",
        "Check by playing the melody with a single bass note per beat."],
      check: ["Every circled note moves by step on both sides.", "Appoggiaturas are on the beat and fall by step.", "Each chord you chose contains all the uncircled notes above it."] },
    neap: { t: "Write a Neapolitan cadence",
      steps: ["Listen to the example: in C minor, N6 (D♭–F–A♭ over F) → Ic → V → i.",
        "Write the same progression in A minor (N6 is B♭–D–F over D) and in E minor (N6 is F–A–C over A).",
        "Under each bass note write the figures: 6 under the Neapolitan (with a flat if the ♭2 needs one), 6 4 then 5 3 over the dominant, then the tonic.",
        "Check that the ♭2 falls (through the tonic) to the leading note, never straight up to the natural 2."],
      example: { t: "The Neapolitan 6th in C minor", k: -3, chords: [["F2", "Ab3", "F4", "Db5"], ["G2", "G3", "Eb4", "C5"], ["G2", "G3", "D4", "B4"], ["C3", "G3", "Eb4", "C5"]], labels: ["N6", "Ic", "V", "i"], figs: [["♭6", ""], ["6", "4"], ["5", "♮3"], null], note: "D♭ in the soprano falls to C and then to the leading note B♮." },
      check: ["The Neapolitan has the 4th degree in the bass.", "The ♭2 is spelt as a flat (or natural) of the 2nd degree, not as a sharpened tonic.", "It moves to V, or to Ic then V.", "The leading note has its accidental in the figures."] },
    figure2: { t: "Figuring with chromatic chords and a modulation",
      steps: ["Choose a passage from a practice paper, or bars 1–12 of a Baroque slow movement that modulates.",
        "Mark where the music leaves the home key and where it arrives. Name the new key.",
        "Find the pivot chord that belongs to both keys, and write the Roman numeral in both: for example ‘VI in C = II in G’.",
        "Look for the chromatic chords you know: a diminished 7th on a raised leading note, a Neapolitan before a cadence in a minor key, V of V before a cadence on V.",
        "Figure the whole passage, with every accidental the figures need."],
      check: ["You've named every key the passage passes through.", "There's a sensible pivot chord at each modulation.", "Chromatic chords are spelt correctly (diminished 7th all minor 3rds; Neapolitan on ♭2).", "Accidentals in the figures match the notes in the music."] },
    complete1: { t: "Completing a four-part passage",
      steps: ["Work from a passage in a practice paper, or take a chorale melody and its bass from a hymn book and cover the alto and tenor.",
        "Name the key and the cadences. Write the Roman numerals under every chord before writing a single note.",
        "Write the tenor, then the alto. Keep each part close to where it was (step or common note), alto within an octave of the soprano and tenor within an octave of the alto.",
        "Double the root in root-position chords; in first-inversion chords double the soprano or a primary note, never the leading note.",
        "Resolve the leading note up and every 7th down.",
        "Check every pair of parts, chord to chord, for consecutive 5ths and octaves."],
      check: ["Every chord is complete or has a sensible missing 5th.", "No part leaps an augmented interval or more than an octave.", "The leading note rises and 7ths fall.", "No consecutive 5ths or octaves between any two parts.", "No parts cross or overlap.", "The cadences are clear."] },
    complete2: { t: "Completing a keyboard passage",
      steps: ["Look at the bars you're given. Copy down exactly what the left hand does: a broken chord? Alberti bass? Octaves? That's the pattern to continue.",
        "Find the chords in the bars you have to complete, from the parts that are given and the cadences.",
        "Keep the same number of notes in each hand and the same register: don't jump the right hand up an octave unless the music already does.",
        "If the right hand has a motif, use it again (exactly, or in sequence) in the bars you complete.",
        "End the phrase with a cadence that matches the style: a perfect cadence with V7 for a Classical piece, perhaps with a 4–3 suspension."],
      check: ["The left-hand pattern continues exactly as given.", "The harmony fits every melody note.", "Each hand stays in a comfortable range and keeps the given texture.", "Motifs from the opening come back.", "The final cadence is clear and in the right key."] },
    comp1: { t: "Plan a melody before you write it",
      why: "A planned melody almost always beats one written note by note.",
      steps: ["Take the opening from a practice paper, or invent a two-bar opening for violin in D major.",
        "Decide on the length (the paper says how long; aim for that) and draw boxes for the phrases: for example 4 + 4 + 4 bars.",
        "Mark the plan: phrase 1 in the home key ending on V; phrase 2 modulating to the dominant (or the relative minor) with a cadence there; phrase 3 returning home with the high point (climax) about two-thirds of the way through.",
        "Choose two ideas from the opening (a rhythm and an interval) to reuse in every phrase.",
        "Write the planned cadence notes into the last bar of each phrase."],
      check: ["The plan has a modulation and a return home.", "Each phrase ends with a cadence you've chosen.", "You know where the high point is.", "You've chosen ideas from the opening to reuse."] },
    comp2: { t: "Write the melody",
      steps: ["Fill in your plan phrase by phrase, using the rhythm and interval you chose from the opening.",
        "Use sequence (the same idea a step higher or lower) and inversion to develop the ideas, but change something every time.",
        "Move mostly by step with a few leaps; after a big leap, move back by step in the other direction.",
        "In the modulating phrase, bring in the new key's accidental (the leading note of the new key) before the cadence.",
        "Sing or play it through. Change any bar that sounds like a different piece."],
      check: ["It uses ideas from the opening all the way through.", "The modulation is clear, with the new key's leading note.", "There's one high point, not several equal ones.", "Every bar has the right number of beats.", "It sounds like one piece from start to finish."] },
    comp3: { t: "Polish: the instrument and the directions",
      steps: ["Check every note is in the instrument's range, and avoid long stretches at the very top or bottom.",
        "Add a tempo marking at the start, and dynamics at the start and at every phrase, with a crescendo to the high point.",
        "Add phrasing slurs and articulation that suit the instrument: bowings for strings, breath marks for wind and voice.",
        "Copy it out neatly. Stems, beams and accidentals must be clear."],
      check: ["Every note is playable on the named instrument.", "There's a tempo marking and dynamics throughout.", "Phrasing and articulation suit the instrument.", "It's neat enough for someone else to play at sight."] },
    score: { t: "Score questions on a real piece",
      steps: ["Choose a short keyboard piece or a movement for a small group by Haydn, Mozart, Schubert or Schumann (free scores are on IMSLP).",
        "Answer these about it on paper: the key at the start and at each cadence; the name of three chords (with Roman numerals and position); three intervals between notes in the melody; the meaning of every term and sign; one ornament written out in full.",
        "If there's a transposing instrument, write out a few bars at concert pitch.",
        "Say which period it comes from and give two reasons from the music."],
      check: ["Every answer names a bar number and a beat.", "Keys and chords are spelt correctly.", "Your period answer gives reasons from the music, not just the composer's name."] },
    paperA: { t: "Practice paper: the harmony questions",
      steps: ["Use a Grade 7 practice paper. Set a timer for about 90 minutes.",
        "Do the figured-bass question and the completion question, under exam conditions: no keyboard, no help.",
        "When the timer ends, use the checklists from days 5, 12, 16 and 17 to check your own work. Mark anything you'd change in a different colour."],
      check: ["Finished inside the time.", "Checked every cadence and every accidental.", "Checked for consecutive 5ths and octaves.", "Noted one thing to improve next time."] },
    paperB: { t: "Practice paper: composition and score questions",
      steps: ["Use the same practice paper. Set a timer for about 90 minutes.",
        "Do the composition and the score questions under exam conditions.",
        "Check the composition with the checklists from days 22–24. Check the score answers with the paper's answer booklet if you have it."],
      check: ["Finished inside the time.", "The composition has a modulation, a high point and full directions.", "Every score answer gives the bar and beat.", "Noted one thing to improve next time."] }
  }
};
if (window.C78 && C78.loaded) C78.loaded("g7");
