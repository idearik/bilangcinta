let confessions = []; // Global variable to store confessions data

document.addEventListener("DOMContentLoaded", function () {
    const badWords = [
        "anjing", "babi", "bangsat", "bajingan", "brengsek", "kampret", 
        "kontol", "memek", "ngentot", "perek", "setan", "tolol", "asu", 
        "jancuk", "pepek"
    ];

    const form = document.querySelector('form');
    const toInput = document.getElementById('to');
    const confessionInput = document.getElementById('confession');
    const errorMessage = document.createElement('div');
    errorMessage.style.color = 'red';
    form.insertBefore(errorMessage, form.firstChild);

    form.addEventListener('submit', function (e) {
        const to = toInput.value.toLowerCase();
        const confession = confessionInput.value.toLowerCase();
        let containsBadWord = false;

        badWords.forEach(word => {
            if (to.includes(word) || confession.includes(word)) {
                containsBadWord = true;
            }
        });

        if (containsBadWord) {
            e.preventDefault();
            errorMessage.textContent = "Your confession contains inappropriate language. Please remove the bad words.";
        } else {
            errorMessage.textContent = '';
        }
    });

    fetchConfessions();

    document.getElementById("search-bar").addEventListener("input", function (e) {
        searchConfessions(e.target.value);
    });
});

function fetchConfessions() {
    fetch('/confessions')
        .then(response => response.json())
        .then(data => {
            confessions = data; // Store fetched data in the global variable
            displayConfessions(data);
        });
}

function searchConfessions(query) {
    fetch(`/search?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            confessions = data; // Store fetched data in the global variable
            displayConfessions(data);
        });
}

function displayConfessions(confessions) {
    const confessionsContainer = document.getElementById('confessions');
    confessionsContainer.innerHTML = '';
    const wordLimit = 50; // Set word limit here

    confessions.forEach(confession => {
        const card = document.createElement('div');
        card.className = 'card';

        const words = confession.confession.split(' ');
        let displayText = confession.confession;
        let showReadMore = false;

        if (words.length > wordLimit) {
            displayText = words.slice(0, wordLimit).join(' ') + '... ';
            showReadMore = true;
        }

        card.innerHTML = `
            <h3>To: ${confession.toWhom}</h3>
            <p id="confession-${confession.id}">${convertNewlines(displayText)}</p>
            ${showReadMore ? `<button class="read-more" onclick="toggleReadMore(${confession.id})">Read more</button>` : ''}
            <small>${confession.date}</small>
            <button class="love-button" onclick="toggleUpvote(${confession.id})">
                &#10084; <span>${confession.upvotes}</span>
            </button>
        `;

        confessionsContainer.appendChild(card);

        // Highlight button if already upvoted
        if (isUpvoted(confession.id)) {
            card.querySelector('.love-button').classList.add('upvoted');
        }
    });
}

function convertNewlines(text) {
    return text.replace(/\n/g, '<br>');
}

function toggleReadMore(id) {
    const confessionText = document.getElementById(`confession-${id}`);
    const button = confessionText.nextElementSibling;
    const confession = confessions.find(c => c.id === id);

    if (confessionText.innerHTML.endsWith('... ')) {
        confessionText.innerHTML = convertNewlines(confession.confession);
        button.textContent = 'Read less';
    } else {
        const words = confession.confession.split(' ').slice(0, 50).join(' ') + '... ';
        confessionText.innerHTML = convertNewlines(words);
        button.textContent = 'Read more';
    }
}

function toggleUpvote(id) {
    if (isUpvoted(id)) {
        unvote(id);
    } else {
        upvote(id);
    }
}

function upvote(id) {
    fetch('/upvote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    })
    .then(response => response.text())
    .then(result => {
        console.log(result);
        markAsUpvoted(id);
        fetchConfessions(); // Refresh confessions list
    });
}

function unvote(id) {
    fetch('/unvote', { // This endpoint needs to be implemented on the server
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    })
    .then(response => response.text())
    .then(result => {
        console.log(result);
        markAsUnvoted(id);
        fetchConfessions(); // Refresh confessions list
    });
}

function isUpvoted(id) {
    const upvotedConfessions = JSON.parse(localStorage.getItem('upvotedConfessions')) || [];
    return upvotedConfessions.includes(id);
}

function markAsUpvoted(id) {
    let upvotedConfessions = JSON.parse(localStorage.getItem('upvotedConfessions')) || [];
    upvotedConfessions.push(id);
    localStorage.setItem('upvotedConfessions', JSON.stringify(upvotedConfessions));
}

function markAsUnvoted(id) {
    let upvotedConfessions = JSON.parse(localStorage.getItem('upvotedConfessions')) || [];
    upvotedConfessions = upvotedConfessions.filter(confessionId => confessionId !== id);
    localStorage.setItem('upvotedConfessions', JSON.stringify(upvotedConfessions));
}
