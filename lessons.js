// Lesson content. Add new lessons here later (Lesson 2: D, E, F ...).
// "nameSay" and "soundSay" are spelled-out hints for the phone's built-in voice.
// For real recorded phonics, add files named audio-name-a.webm and audio-sound-a.webm
// (same for b and c) next to index.html and the app will play those instead.
const LESSON1 = {
  id: "english-1",
  title: "Letters A, B, C",
  letters: [
    { U: "A", l: "a", color: "#ff5c8a", nameSay: "ay",  soundSay: "ah",  hint: "a as in apple",
      words: [{ w: "apple", e: "🍎" }, { w: "ant", e: "🐜" }] },
    { U: "B", l: "b", color: "#2f8fe0", nameSay: "bee", soundSay: "buh", hint: "b as in ball",
      words: [{ w: "ball", e: "⚽" }, { w: "bus", e: "🚌" }] },
    { U: "C", l: "c", color: "#2fbf71", nameSay: "see", soundSay: "kuh", hint: "c as in cat",
      words: [{ w: "cat", e: "🐱" }, { w: "cup", e: "🥤" }] }
  ]
};
