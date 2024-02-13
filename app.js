const api_url = "https://api.quotable.io";
const maxOptions = 4; // Maximum number of author options
let score = 0; // Initial user score
let roundsPlayed = 0; // To keep of rounds. The game will end after 10 rounds
let lives = 3; // The user has 3 chances of incorrect guesses.

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
        const randomPage = Math.floor(Math.random() * 200) + 1; // Generate random page number between 1 and 800 
        const response = await fetch(`${api_url}/authors?limit=${maxOptions}&page=${randomPage}`);
        const data = await response.json();
        let authors = data.results.map(author => author.name);
        authors = authors.filter(author => author !== excludeAuthor);
        shuffleArray(authors);
        return authors.slice(0, maxOptions - 1); // Return only maxOptions - 1 random authors
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
