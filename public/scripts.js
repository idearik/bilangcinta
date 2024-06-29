document.addEventListener("DOMContentLoaded", function () {
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
        `;
        confessionsContainer.appendChild(card);
    });
}
