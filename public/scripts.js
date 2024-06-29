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
            displayConfessions(data);
        });
}

function searchConfessions(query) {
    fetch(`/search?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            displayConfessions(data);
        });
}

function displayConfessions(confessions) {
    const confessionsContainer = document.getElementById('confessions');
    confessionsContainer.innerHTML = '';
    confessions.forEach(confession => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>To: ${confession.toWhom}</h3>
            <p>${confession.confession}</p>
            <small>${confession.date}</small>
            <button onclick="upvote(${confession.id})">❤️ ${confession.upvotes}</button>
        `;
        confessionsContainer.appendChild(card);
    });
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
        fetchConfessions(); // Refresh confessions list
    });
}
