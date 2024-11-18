// Elementy HTML
const form = document.getElementById('finance-form');
const transactionHistory = document.getElementById('transaction-history');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const balanceEl = document.getElementById('balance');
const totalSavingsEl = document.createElement('p'); // Element do wyświetlenia oszczędności
const notificationsContainer = document.getElementById('notifications-container');

// Dodajemy element do podsumowania
const summaryDiv = document.querySelector('.summary');
summaryDiv.appendChild(totalSavingsEl);

// Tablice do przechowywania danych
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let totalIncome = 0;
let totalExpenses = 0;
let totalSavings = 0; // Nowa zmienna na oszczędności

// Inicjalizacja po załadowaniu strony
window.addEventListener('load', () => {
    transactions.forEach(addTransactionToTable);
    updateSummary();
});

// Funkcja wyświetlająca powiadomienia
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notificationsContainer.appendChild(notification);

    // Usuwanie powiadomienia po 4 sekundach
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Obsługa formularza
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Zatrzymanie domyślnego działania formularza

    const amountInput = document.getElementById('amount').value.trim();
    const amount = parseFloat(amountInput);

    if (!amountInput || isNaN(amount) || amount <= 0) {
        showNotification('Podaj prawidłową kwotę!', 'error');
        return;
    }

    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value.trim();

    const transaction = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        amount,
        type,
        category,
        description,
    };

    transactions.push(transaction);
    saveTransactions();
    addTransactionToTable(transaction);
    updateSummary();

    // Ręczne czyszczenie każdego pola
    document.getElementById('amount').value = '';
    document.getElementById('type').value = 'income'; // Domyślny wybór
    document.getElementById('category').value = 'general'; // Domyślna kategoria
    document.getElementById('description').value = '';

    showNotification('Dodano nową transakcję.');
});



// Funkcja dodająca transakcję do tabelki
function addTransactionToTable(transaction) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', transaction.id);

    row.innerHTML = `
        <td>${transaction.date}</td>
        <td>${transaction.amount.toFixed(2)} zł</td>
        <td>${transaction.type === 'income' ? 'Przychód' : transaction.type === 'expense' ? 'Wydatek' : 'Oszczędności'}</td>
        <td>${capitalize(transaction.category)}</td>
        <td>
            <button class="view-description" title="${transaction.description || 'Brak opisu'}">📄</button>
            <button class="delete-transaction">🗑️</button>
        </td>
    `;

    const deleteButton = row.querySelector('.delete-transaction');
    deleteButton.addEventListener('click', () => {
        removeTransaction(transaction.id);
    });

    transactionHistory.appendChild(row);
}

// Funkcja usuwająca transakcję
function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    document.querySelector(`[data-id="${id}"]`).remove();
    updateSummary();
    showNotification('Usunięto transakcję.', 'warning');
}

// Funkcja aktualizująca podsumowanie
function updateSummary() {
    totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    totalSavings = transactions
        .filter(t => t.type === 'savings')
        .reduce((sum, t) => sum + t.amount, 0);

    // Odejmujemy oszczędności od przychodów
    const effectiveIncome = totalIncome - totalSavings;
    const balance = effectiveIncome - totalExpenses;

    // Aktualizacja wartości w podsumowaniu
    totalIncomeEl.textContent = `${effectiveIncome.toFixed(2)} zł`;
    totalExpensesEl.textContent = `${totalExpenses.toFixed(2)} zł`;
    balanceEl.textContent = `${balance.toFixed(2)} zł`;
    totalSavingsEl.textContent = `Łączne oszczędności: ${totalSavings.toFixed(2)} zł`;

    generateChart(); // Aktualizacja wykresu
}

// Funkcja generująca wykres
let chartInstance = null; // Zmienna globalna na instancję wykresu

function generateChart() {
    const ctx = document.getElementById('summary-chart').getContext('2d');

    // Usunięcie istniejącego wykresu, jeśli istnieje
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Generowanie nowego wykresu
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Przychody', 'Wydatki', 'Oszczędności'],
            datasets: [{
                label: 'Podsumowanie finansowe',
                data: [totalIncome - totalSavings, totalExpenses, totalSavings],
                backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}


// Funkcja zapisywania danych do localStorage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Funkcja pomocnicza do kapitalizacji tekstu
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
// Przełącznik trybu ciemnego
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Sprawdzamy, czy użytkownik miał włączony tryb ciemny
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
}

// Obsługa przełącznika trybu
darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
    }
});
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(() => {
        console.log('Service Worker zarejestrowany!');
    });
}
