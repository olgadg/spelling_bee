"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var selectedWord = "";
var savedWords;
// Function to fetch words from a file
function fetchWordsFromFile() {
    return __awaiter(this, void 0, void 0, function () {
        var response, text, wordlist, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/assets/wordlist')];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to fetch words from file');
                    }
                    return [4 /*yield*/, response.text()];
                case 2:
                    text = _a.sent();
                    wordlist = text.split('\n').map(function (word) { return word.trim(); });
                    console.log(wordlist);
                    return [2 /*return*/, wordlist];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error fetching words:', error_1);
                    return [2 /*return*/, []]; // Return an empty array in case of error
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Function to read the cookie and parse the word count map
function readWordCountFromCookie() {
    var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)wordCount\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    return cookieValue ? JSON.parse(decodeURIComponent(cookieValue)) : {};
}
// Function to save the word count map to the cookie
function saveWordCountToCookie(wordCount) {
    var cookieValue = encodeURIComponent(JSON.stringify(wordCount));
    document.cookie = "wordCount=".concat(cookieValue, "; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/");
}
// Function to randomly select a word from the list
function selectRandomWord(words) {
    var randomIndex = Math.floor(Math.random() * words.length); // Generate a random index
    return words[randomIndex]; // Return the word at the randomly selected index
}
function selectWeightedRandomWord() {
    // Convert word count map to an array of [word, count] pairs
    var wordCountArray = Object.entries(savedWords);
    // Calculate the maximum count
    var maxCount = Math.max.apply(Math, wordCountArray.map(function (_a) {
        var count = _a[1];
        return count;
    }));
    // Calculate the total "inverse" count, where each word's inverse count is (maxCount - count + 1)
    var totalInverseCount = wordCountArray.reduce(function (acc, _a) {
        var count = _a[1];
        return acc + (maxCount - count + 1);
    }, 0);
    // Generate a random number between 0 and total inverse count
    var randomNumber = Math.random() * totalInverseCount;
    // Iterate over word count array and accumulate inverse counts until the random number is reached
    var cumulativeInverseCount = 0;
    for (var _i = 0, wordCountArray_1 = wordCountArray; _i < wordCountArray_1.length; _i++) {
        var _a = wordCountArray_1[_i], word = _a[0], count = _a[1];
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
    var utterance = new SpeechSynthesisUtterance(selectedWord);
    utterance.lang = 'en-GB';
    speechSynthesis.speak(utterance);
}
function revealWord() {
    var revealedWord = document.getElementById('revealedWord');
    document.getElementById('inputContainer').style.display = 'none';
    document.getElementById('revealedWordContainer').style.display = 'flex';
    revealedWord.textContent = selectedWord;
}
function displaySuccessIcon() {
    var matchIcon = document.createElement("span");
    matchIcon.className = "icon";
    matchIcon.textContent = "✓";
    matchIcon.style.color = "green";
    document.getElementById('revealedWord').appendChild(matchIcon);
}
function displayFailIcon() {
    var failIcon = document.createElement("span");
    failIcon.className = "icon";
    failIcon.textContent = "❌";
    failIcon.style.color = "red";
    document.getElementById('resultIcon').appendChild(failIcon);
}
function initPlayButton() {
    var playButton = document.getElementById('playButton');
    playButton.addEventListener('click', function () { return speakWord(); });
}
function initSubmitButton() {
    document.getElementById('revealedWordContainer').style.display = 'none';
    var wordInput = document.getElementById('wordInput');
    wordInput.type = 'text';
    var checkButton = document.getElementById('checkButton');
    checkButton.addEventListener('click', function () {
        var inputWord = wordInput.value.trim();
        var success = inputWord.toLowerCase() === selectedWord.toLowerCase();
        if (success) {
            savedWords[inputWord] = (savedWords[inputWord] || 0) + 1;
            saveWordCountToCookie(savedWords);
            revealWord();
            displaySuccessIcon();
        }
        else {
            displayFailIcon();
        }
    });
}
function initRevealButton() {
    var revealButton = document.getElementById('revealButton');
    revealButton.addEventListener('click', function () {
        revealWord();
    });
}
// Function to refresh and select a new random word
function refreshWord() {
    var _a;
    // Select a new random word
    selectedWord = selectWeightedRandomWord();
    // Reset all fields
    document.getElementById('wordInput').value = ''; // Clear input field
    document.getElementById('inputContainer').style.display = 'flex'; // Show input container;
    document.getElementById('revealedWordContainer').style.display = 'none'; // Hide revealed word container
    document.getElementById('revealedWord').textContent = ''; // Clear revealed word
    (_a = document.querySelector('#revealedWord .icon')) === null || _a === void 0 ? void 0 : _a.remove(); // Remove success icon
    var failIcons = document.querySelectorAll('#resultIcon .icon');
    failIcons.forEach(function (icon) {
        icon.remove();
    });
}
// Function to initialize the refresh button
function initRefreshButton() {
    var refreshButton = document.getElementById('refreshButton');
    refreshButton.addEventListener('click', function () {
        refreshWord();
    });
}
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var words, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetchWordsFromFile()];
                case 1:
                    words = _a.sent();
                    savedWords = readWordCountFromCookie();
                    console.log(savedWords);
                    console.log(Object.keys(savedWords).length);
                    if (Object.keys(savedWords).length == 0) {
                        words.forEach(function (word) { return savedWords[word] = 0; });
                        saveWordCountToCookie(savedWords);
                    }
                    console.log(savedWords);
                    words.forEach(function (word) { return savedWords[word] = 100; });
                    savedWords[words[0]] = 0;
                    console.log(savedWords);
                    selectedWord = selectWeightedRandomWord();
                    initPlayButton();
                    initSubmitButton();
                    initRevealButton();
                    initRefreshButton();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error creating and checking word:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
init();
