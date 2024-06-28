document.addEventListener('DOMContentLoaded', function() {
    loadConfessions();

    document.getElementById('confessionForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const to = document.getElementById('to').value;
        const confession = document.getElementById('confession').value;

        fetch('/confess', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `to=${encodeURIComponent(to)}&confession=${encodeURIComponent(confession)}`
        }).then(response => {
            if (response.ok) {
                loadConfessions();
                document.getElementById('confessionForm').reset();
            }
        });
    });

    document.getElementById('searchBar').addEventListener('input', function(event) {
        const searchTerm = event.target.value;
        searchConfessions(searchTerm);
    });
});

function loadConfessions() {
    fetch('/confessions')
        .then(response => response.json())
        .then(data => {
            displayConfessions(data);
        });
}

function searchConfessions(searchTerm) {
    fetch(`/search?q=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            displayConfessions(data);
        });
}

function displayConfessions(confessions) {
    const container = document.getElementById('confessionsContainer');
    container.innerHTML = '';
    confessions.forEach(confession => {
        const confessionContainer = document.createElement('div');
        confessionContainer.className = 'confession-card';

        const toElement = document.createElement('p');
        toElement.innerHTML = `<strong>To:</strong> ${confession.toWhom}`;
        confessionContainer.appendChild(toElement);

        const confessionElement = document.createElement('p');
        confessionElement.textContent = confession.confession;
        confessionContainer.appendChild(confessionElement);

        const dateElement = document.createElement('p');
        dateElement.className = 'confession-date';
        dateElement.textContent = confession.date;
        confessionContainer.appendChild(dateElement);

        container.appendChild(confessionContainer);
    });
}
