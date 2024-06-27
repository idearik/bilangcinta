document.getElementById('confessionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const to = document.getElementById('to').value;
    const confession = document.getElementById('confession').value;
    const date = new Date().toLocaleDateString();

    addConfession(to, confession, date);

    // Reset the form
    document.getElementById('confessionForm').reset();
});

function addConfession(to, confession, date) {
    const confessionContainer = document.createElement('div');
    confessionContainer.className = 'confession-card';

    const toElement = document.createElement('p');
    toElement.innerHTML = `<strong>To:</strong> ${to}`;
    confessionContainer.appendChild(toElement);

    const confessionElement = document.createElement('p');
    confessionElement.textContent = confession;
    confessionContainer.appendChild(confessionElement);

    const dateElement = document.createElement('p');
    dateElement.className = 'confession-date';
    dateElement.textContent = date;
    confessionContainer.appendChild(dateElement);

    document.getElementById('confessionsContainer').prepend(confessionContainer);
}
