import { replacer, reviver } from "./js/utils";
import words from "./assets/wordlist.json";

type WordCountMap = Map<string, number>;

let selectedWord: string;
let savedWords: WordCountMap;

// Create map from json of words
const createMapFromWords = () => {
  const wordsMap = new Map();

  words.forEach((word) => {
    wordsMap.set(word, 1);
  });

  return wordsMap;
};

const selectWeightedRandomWord = () => {
  // get an array from the map
  const words = Array.from(savedWords, ([name, value]) => ({ name, value }));
  // Calculate the sum of inverse weights
  const totalInverseWeight = words.reduce(
    (sum, item) => sum + 1 / item.value,
    0,
  );

  // Generate a random number between 0 and the total inverse weight
  const randomNum = Math.random() * totalInverseWeight;

  // Iterate through the items to find the selected item
  let cumulativeInverseWeight = 0;
  for (const word of words) {
    cumulativeInverseWeight += 1 / word.value;
    if (randomNum <= cumulativeInverseWeight) {
      return word.name;
    }
  }
  console.error("something went wrong");
  return "";
};

// Function to speak the word using Text-to-Speech
function speakWord() {
  console.log(selectedWord);
  const utterance = new SpeechSynthesisUtterance(selectedWord);
  utterance.lang = "en-GB";
  speechSynthesis.speak(utterance);
}

function revealWord() {
  const revealedWord = document.getElementById("revealedWord")!;
  document.getElementById("inputContainer")!.style.display = "none";
  document.getElementById("revealedWordContainer")!.style.display = "flex";
  revealedWord.textContent = selectedWord;
}

function displaySuccessIcon() {
  const matchIcon = document.createElement("span");
  matchIcon.className = "icon";
  matchIcon.textContent = "✓";
  matchIcon.style.color = "green";
  document.getElementById("revealedWord")!.appendChild(matchIcon);
}

function displayFailIcon() {
  const failIcon = document.createElement("span");
  failIcon.className = "icon";
  failIcon.textContent = "❌";
  failIcon.style.color = "red";
  document.getElementById("resultIcon")!.appendChild(failIcon);
}

function initPlayButton() {
  const playButton = document.getElementById("playButton");
  playButton!.addEventListener("click", () => speakWord());
}

function initSubmitButton() {
  document.getElementById("revealedWordContainer")!.style.display = "none";
  const wordInput = document.getElementById("wordInput") as HTMLInputElement;
  wordInput.type = "text";
  const checkButton = document.getElementById("checkButton");

  checkButton!.addEventListener("click", () => {
    const inputWord = wordInput.value.trim();
    const success = inputWord.toLowerCase() === selectedWord.toLowerCase();

    if (success) {
      savedWords.set(inputWord, 15);
      saveWordsToLocalStorage();
      revealWord();
      displaySuccessIcon();
    } else {
      displayFailIcon();
    }
  });
}

function initRevealButton() {
  const revealButton = document.getElementById("revealButton");
  revealButton!.addEventListener("click", () => {
    revealWord();
  });
}

// Function to refresh and select a new random word
function refreshWord() {
  // Select a new random word
  selectedWord = selectWeightedRandomWord();

  // Reset all fields
  (document.getElementById("wordInput") as HTMLInputElement).value = ""; // Clear input field
  document.getElementById("inputContainer")!.style.display = "flex"; // Show input container;
  document.getElementById("revealedWordContainer")!.style.display = "none"; // Hide revealed word container
  document.getElementById("revealedWord")!.textContent = ""; // Clear revealed word
  document.querySelector("#revealedWord .icon")?.remove(); // Remove success icon
  const failIcons = document.querySelectorAll("#resultIcon .icon");
  failIcons.forEach((icon) => {
    icon.remove();
  });
}

// Function to initialize the refresh button
function initRefreshButton(): void {
  const refreshButton = document.getElementById("refreshButton");

  refreshButton!.addEventListener("click", () => {
    refreshWord();
    speakWord();
  });
}

const getWordsFromLocalStorage = () => {
  const words = localStorage.getItem("savedWords");
  if (!words) {
    return null;
  }

  return JSON.parse(words, reviver) as WordCountMap;
};

const saveWordsToLocalStorage = () => {
  localStorage.setItem("savedWords", JSON.stringify(savedWords, replacer));
};

async function init(): Promise<void> {
  try {
    const words = getWordsFromLocalStorage();

    if (!words) {
      savedWords = createMapFromWords();
    } else {
      savedWords = words;
    }
    console.log("initial words", savedWords);

    saveWordsToLocalStorage();

    selectedWord = selectWeightedRandomWord();
    console.log(selectedWord);

    initPlayButton();
    initSubmitButton();
    initRevealButton();
    initRefreshButton();
  } catch (error) {
    console.error("Error creating and checking word:", error);
  }
}

init();
