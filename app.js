const api_url = "https://api.quotable.io";
const maxOptions = 4; // Maximum number of author options
let score = 0; // Initial user score
let roundsPlayed = 0; // To keep of rounds. The game will end after 10 rounds
let lives = 3; // The user has 3 chances of incorrect guesses.
let gameActive = true; // Track the game state

// Function to fetch a new quote and author options
async function getQuoteAndAuthors(url) {
    try {
        const quote_url = url + "/random";
        const response = await fetch(quote_url);
        const data = await response.json();
        const quoteText = data.content;
        const correctAuthor = data.author;
        const authors = await fetchRandomAuthors(correctAuthor);

        displayQuoteAndOptions(quoteText, correctAuthor, authors);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Function to fetch random authors except the correct one
async function fetchRandomAuthors(excludeAuthor) {
    try {
        // Generate an array of random page numbers without duplicates
        const randomPages = Array.from({ length: maxOptions - 1 }, () => Math.floor(Math.random() * 200) + 1);
        const uniqueRandomPages = Array.from(new Set(randomPages)); // Remove duplicates

        // Fetch author data from each random page asynchronously
        const promises = uniqueRandomPages.map(async (page) => {
            const response = await fetch(`${api_url}/authors?limit=${maxOptions}&page=${page}`);
            const data = await response.json();
            return data.results.map(author => author.name);
        });

        // Wait for all promises to resolve and collect the author arrays
        const authorsArrays = await Promise.all(promises);

        // Flatten the arrays and filter out the excluded author
        let authors = authorsArrays.flat().filter(author => author !== excludeAuthor);

        // Filter out authors with duplicate initial letters
        let uniqueAuthors = [];
        let initialLetters = new Set();

        for (let author of authors) {
            const initialLetter = author.charAt(0).toLowerCase();
            if (!initialLetters.has(initialLetter)) {
                uniqueAuthors.push(author);
                initialLetters.add(initialLetter);
            }
        }

        // Shuffle the authors array
        shuffleArray(uniqueAuthors);

        // Return only maxOptions - 1 random authors
        return uniqueAuthors.slice(0, maxOptions - 1);
    } catch (error) {
        console.error("Error fetching random authors:", error);
    }
}

// Function to display the quote and author options
function displayQuoteAndOptions(quoteText, correctAuthor, authors) {
    const quoteElement = document.getElementById("quote");
    quoteElement.textContent = quoteText;

    const authorOptionsElement = document.getElementById("authorOptions");
    authorOptionsElement.innerHTML = ""; // Clear previous options

    // Shuffle the authors array including the correct author
    authors.push(correctAuthor);
    shuffleArray(authors);

    authors.forEach(author => {
        const button = document.createElement("button");
        button.textContent = author;
        button.addEventListener("click", () => checkAnswer(author, correctAuthor));
        authorOptionsElement.appendChild(button);
    });
}

// Function to check the user's answer
function checkAnswer(selectedAuthor, correctAuthor) {
    if (roundsPlayed === 10 || lives === 0) {
        return; // Exit the function if the game has ended
    }

    const buttons = document.querySelectorAll(".author-options button");
    buttons.forEach(button => {
        if (button.textContent === selectedAuthor) {
            if (selectedAuthor === correctAuthor) {
                button.style.backgroundColor = "#28a745"; // Correct choice turns green
            } else {
                button.style.backgroundColor = "#dc3545"; // Incorrect choice turns red
            }
            button.disabled = true; // Disable button after selection
        }
    });

    if (selectedAuthor === correctAuthor) {
        score++;
        document.getElementById("score").textContent = score;
        roundsPlayed++;
        if (roundsPlayed < 10) {
            getQuoteAndAuthors(api_url);
        } else {
            endGame(); // Call endGame when roundsPlayed reaches 10
        }
    } else {
        lives--;
        updateLivesDisplay();
        if (lives === 0) {
            endGame(); // Call endGame when lives reach 0
        }
    }
}

// Function to update lives display
function updateLivesDisplay() {
    document.getElementById("lives").textContent = lives;
}

// Function to end the game
function endGame() {
    gameActive = false; // Set gameActive to false when the game ends

    const finalScore = score + "/" + 10;
    const gameOverSection = document.getElementById("game-over");
    const finalScoreElement = document.getElementById("final-score");

    // Display final score
    finalScoreElement.textContent = finalScore;

    // Display game over section
    gameOverSection.style.display = "block";

    // Add event listener for restart button
    document.getElementById("restart-button").addEventListener("click", restartGame);
}

// Function to restart the game
function restartGame() {
    gameActive = true; // Set gameActive to true when the game restarts

    // Reset scores and lives
    score = 0;
    roundsPlayed = 0;
    lives = 3;
    document.getElementById("score").textContent = score;
    document.getElementById("lives").textContent = lives;

    // Hide game over section
    const gameOverSection = document.getElementById("game-over");
    gameOverSection.style.display = "none";

    // Restart the game by fetching a new quote and authors
    getQuoteAndAuthors(api_url);
}

// Shuffle array elements
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Initial call to fetch a quote and authors when the page loads
document.addEventListener("DOMContentLoaded", () => {
    getQuoteAndAuthors(api_url);
});

/** This Funtion is for a cheat to increase lives. 
 * I realize the game is hard so you can increase you lives by double clicking on 'Lives'.  */
let clicks = 0;
let lastClickTime = 0;
const doubleClickThreshold = 300; // Time threshold for double click in milliseconds
// Function to track double clicks on the lives element
document.querySelector('.lives').addEventListener('click', function() {
    if (gameActive) {
        const now = new Date().getTime();
        if (now - lastClickTime < doubleClickThreshold) {
            // Double click detected
            clicks++;
            if (clicks === 2) {
                // Increment lives count
                if (lives < 3) {
                    lives++;
                    updateLivesDisplay();
                }
                clicks = 0; // Reset click count
            }
        } else {
            // Single click
            clicks = 1;
        }
        lastClickTime = now;
    }
});