// scripts.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('NodCord Scripts Loaded');

    // Beispiel für ein einfaches Skript, das den Status des Bots auf der Dashboard-Seite aktualisiert
    if (document.querySelector('#bot-status')) {
        updateBotStatus();
    }

    function updateBotStatus() {
        fetch('/api/status')
            .then(response => response.json())
            .then(data => {
                const statusElement = document.querySelector('#bot-status');
                if (data.online) {
                    statusElement.textContent = 'online';
                    statusElement.style.color = 'green';
                } else {
                    statusElement.textContent = 'offline';
                    statusElement.style.color = 'red';
                }
            })
            .catch(error => console.error('Error fetching bot status:', error));
    }

    // Beispiel für ein einfaches Skript, das Formulare bestätigt, bevor sie gesendet werden
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            const confirmed = confirm('Sind Sie sicher, dass Sie diese Aktion ausführen möchten?');
            if (!confirmed) {
                event.preventDefault();
            }
        });
    });
});