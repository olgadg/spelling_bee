var selectedWord = ""

// Function to fetch words from a file
async function fetchWordsFromFile(): Promise<string[]> {
  try {
    const response = await fetch('/assets/wordlist'); // Fetch the file from the server
    if (!response.ok) {
      throw new Error('Failed to fetch words from file');
    }
    const text = await response.text(); // Get the file content as text
    const wordlist = text.split('\n').map(word => word.trim()); // Split content by new lines and trim whitespace
    console.log(wordlist)
    return wordlist
  } catch (error) {
    console.error('Error fetching words:', error);
    return []; // Return an empty array in case of error
  }
}

// Function to randomly select a word from the list
function selectRandomWord(words: string[]): string {
  const randomIndex = Math.floor(Math.random() * words.length); // Generate a random index
  return words[randomIndex]; // Return the word at the randomly selected index
}

// Function to speak the word using Text-to-Speech
function speakWord() {
  const utterance = new SpeechSynthesisUtterance(selectedWord);
  utterance.lang = 'en-GB';
  speechSynthesis.speak(utterance);
}

function revealWord() {
  const revealedWord = document.getElementById('revealedWord')!;
  document.getElementById('inputContainer')!.style.display = 'none';
  document.getElementById('revealedWordContainer')!.style.display = 'flex';
  revealedWord.textContent = selectedWord;
}

function displaySuccessIcon() {
  const matchIcon = document.createElement("span");
  matchIcon.className = "icon"
  matchIcon.textContent = "✓";
  matchIcon.style.color = "green";
  document.getElementById('revealedWord')!.appendChild(matchIcon);
}

function displayFailIcon() {
  const failIcon = document.createElement("span");
  failIcon.className = "icon"
  failIcon.textContent = "❌";
  failIcon.style.color = "red";
  document.getElementById('resultIcon')!.appendChild(failIcon);
}

function initPlayButton() {
  const playButton = document.getElementById('playButton');
  playButton!.addEventListener('click', () => speakWord());
}

function initSubmitButton() {
  
  document.getElementById('revealedWordContainer')!.style.display = 'none';
  const wordInput = (document.getElementById('wordInput') as HTMLInputElement);
  wordInput.type = 'text';
  const checkButton = document.getElementById('checkButton')!;
  checkButton.addEventListener('click', () => {
    const inputWord = wordInput.value.trim();
    const success = inputWord.toLowerCase() === selectedWord.toLowerCase();
    if (success) {
      revealWord()
      displaySuccessIcon()
    } else {
      displayFailIcon()
    }
  });
}

function initRevealButton() {
  const revealButton = document.getElementById('revealButton');
  revealButton!.addEventListener('click', () => {
    revealWord();
  });

}

// Function to refresh and select a new random word
function refreshWord(words: string[]) {
  // Select a new random word
  selectedWord = selectRandomWord(words);

  // Reset all fields
  (document.getElementById('wordInput') as HTMLInputElement).value = ''; // Clear input field
  document.getElementById('inputContainer')!.style.display = 'flex'; // Show input container;
  document.getElementById('revealedWordContainer')!.style.display = 'none'; // Hide revealed word container
  document.getElementById('revealedWord')!.textContent = ''; // Clear revealed word
  document.querySelector('#revealedWord .icon')?.remove(); // Remove success icon
  const failIcons = document.querySelectorAll('#resultIcon .icon');
  failIcons.forEach(icon => {
    icon.remove();
  });
}

// Function to initialize the refresh button
function initRefreshButton(words: string[]): void {
  const refreshButton = document.getElementById('refreshButton');
  refreshButton!.addEventListener('click', () => {
    refreshWord(words);
  });
}


async function init(): Promise<void> {
  try {
    const words = await fetchWordsFromFile();
    selectedWord = selectRandomWord(words);

    initPlayButton();
    initSubmitButton();
    initRevealButton();
    initRefreshButton(words);

  } catch (error) {
    console.error('Error creating and checking word:', error);
  }
}

init();
