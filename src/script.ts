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

// Function to fetch words from a file
// async function fetchWordsFromFile(): Promise<string[]> {
//   try {
//     const response = await fetch("/assets/wordlist"); // Fetch the file from the server
//     if (!response.ok) {
//       throw new Error("Failed to fetch words from file");
//     }
//     const text = await response.text(); // Get the file content as text
//     const wordlist = text.split("\n").map((word) => word.trim()); // Split content by new lines and trim whitespace
//     console.log("wordlist", wordlist);
//     return wordlist;
//   } catch (error) {
//     console.error("Error fetching words:", error);
//     return []; // Return an empty array in case of error
//   }
// }

// Function to read the cookie and parse the word count map
// function readWordCountFromCookie(): WordCountMap {
//   const cookieValue = document.cookie.replace(
//     /(?:(?:^|.*;\s*)wordCount\s*\=\s*([^;]*).*$)|^.*$/,
//     "$1",
//   );
//   return cookieValue ? JSON.parse(decodeURIComponent(cookieValue)) : {};
// }

// Function to save the word count map to the cookie
// function saveWordCountToCookie(wordCount: WordCountMap) {
//   const cookieValue = encodeURIComponent(JSON.stringify(wordCount));
//   document.cookie = `wordCount=${cookieValue}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
// }

// const weightedRandom = () => {
//   const words1 = Array.from(savedWords, ([name, value]) => name);
//   const weights = Array.from(savedWords, ([name, value]) => value);
//   console.log(words1);
//   console.log(weights);
//   // const words = Array.from(savedWords, ([name, value]) => ({ name, value }));
//   const totalWeight = weights.reduce((a, b) => a + b, 0);
//   let random = Math.random() * totalWeight;
//   return words1.find((_, i) => (random -= weights[i]) <= 0) || "";
// };

const invertedWeightedRandom = () => {
  // Calculate the sum of inverse weights
  const words = Array.from(savedWords, ([name, value]) => ({ name, value }));
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

function selectWeightedRandomWord(): string {
  // Convert word count map to an array of [word, count] pairs
  const wordCountArray = Object.entries(savedWords);

  // Calculate the maximum count
  const maxCount = Math.max(...wordCountArray.map(([, count]) => count));

  // Calculate the total "inverse" count, where each word's inverse count is (maxCount - count + 1)
  const totalInverseCount = wordCountArray.reduce(
    (acc, [, count]) => acc + (maxCount - count + 1),
    0,
  );

  // Generate a random number between 0 and total inverse count
  const randomNumber = Math.random() * totalInverseCount;

  // Iterate over word count array and accumulate inverse counts until the random number is reached
  let cumulativeInverseCount = 0;
  for (const [word, count] of wordCountArray) {
    cumulativeInverseCount += maxCount - count + 1;
    if (randomNumber < cumulativeInverseCount) {
      return word; // Return the word when the cumulative inverse count exceeds the random number
    }
  }
  return "";
}

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
      // savedWords[inputWord] = (savedWords[inputWord] || 0) + 5;
      // saveWordCountToCookie(savedWords);
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
  selectedWord = invertedWeightedRandom();

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
  if (!refreshButton) return;

  refreshButton.addEventListener("click", () => {
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
    // const words = await fetchWordsFromFile();
    const words = getWordsFromLocalStorage();

    if (!words) {
      savedWords = createMapFromWords();
    } else {
      savedWords = words;
    }
    // savedWords = readWordCountFromCookie();
    console.log("savedWords", savedWords);

    saveWordsToLocalStorage();
    // if (Object.keys(savedWords).length == 0) {
    //   words.forEach((word) => (savedWords[word] = 0));
    //   saveWordCountToCookie(savedWords);
    // }

    // selectedWord = selectWeightedRandomWord();
    selectedWord = invertedWeightedRandom();
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
