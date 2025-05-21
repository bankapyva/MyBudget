function calculateBalance() {
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  const month = currentStatsMonth.getMonth();
  const year = currentStatsMonth.getFullYear();

  let balance = 0;
  transactions.forEach(t => {
    const date = new Date(t.date);
    if (date.getMonth() === month && date.getFullYear() === year) {
      balance -= parseFloat(t.amount);
    }
  });

  return balance;
}


function updateMainBalance() {
  const balance = calculateBalance();
  document.getElementById('balance').textContent = balance + ' грн';
}

function updatePieChart(animate = true) {
  const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  const month = currentStatsMonth.getMonth();
  const year = currentStatsMonth.getFullYear();

  const transactions = allTransactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === month && date.getFullYear() === year && t.category !== 'Дохід';
  });

  const chart = document.getElementById('pie-chart');
  const legend = document.getElementById('legend');

  const expenseTransactions = transactions.filter(t => t.category !== 'Дохід');

  if (expenseTransactions.length === 0) {
    chart.style.background = 'conic-gradient(#ccc 0deg 360deg)';
    legend.innerHTML = '<p>Немає даних про витрати</p>';
    const overlay = document.getElementById('pie-overlay');
    if (overlay) overlay.innerHTML = '';
    return;
  }

  const categorySums = {};
  expenseTransactions.forEach(t => {
    const category = t.category || 'Інше';
    if (!categorySums[category]) categorySums[category] = 0;
    categorySums[category] += parseFloat(t.amount);
  });

  const total = Object.values(categorySums).reduce((a, b) => a + b, 0);
  const colors = {
    'Продукти': '#f39c12',
    'Транспорт': '#2980b9',
    'Кафе': '#e74c3c',
    'Здоров\'я': '#27ae60',
    'Відпочинок': '#8e44ad',
    'Благодійність': '#2ecc71',
    'Дім': '#3498db',
    'Інше': '#7f8c8d'
  };

  let gradient = 'conic-gradient(';
  let startDeg = 0;
  const legendItems = [];

  for (const [cat, sum] of Object.entries(categorySums)) {
    const angle = (sum / total) * 360;
    const endDeg = startDeg + angle;
    const color = colors[cat] || '#bdc3c7';
    gradient += `${color} ${startDeg}deg ${endDeg}deg, `;
    legendItems.push({ category: cat, color, percent: (sum / total) * 100, amount: sum });
    startDeg = endDeg;
  }

  chart.style.background = gradient.slice(0, -2) + ')';

  // Оновлення легенди з підказкою
  legend.innerHTML = '';
  legendItems.forEach(item => {
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';
    legendItem.innerHTML = `
      <span class="legend-color" style="background:${item.color};"></span>
      ${item.category}: ${item.percent.toFixed(1)}%
    `;
    legendItem.addEventListener('mousemove', (e) => {
      tooltip.textContent = `${item.category}: ${item.amount.toFixed(2)} грн`;
      tooltip.style.top = `${e.pageY - 10}px`;
      tooltip.style.left = `${e.pageX}px`;
      tooltip.style.opacity = 1;
    });
    legendItem.addEventListener('mouseleave', () => {
      tooltip.style.opacity = 0;
    });
    legend.appendChild(legendItem);
  });

  // Оверлей для секторів з hover
  let overlay = document.getElementById('pie-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'pie-overlay';
    chart.appendChild(overlay);
  }
  overlay.innerHTML = '';

  startDeg = 0;
  for (const item of legendItems) {
    const angle = (item.percent / 100) * 360;

    const segment = document.createElement('div');
    segment.className = 'pie-segment';
    segment.style.background = `conic-gradient(${item.color} ${startDeg}deg ${startDeg + angle}deg, transparent ${startDeg + angle}deg 360deg)`;
    segment.addEventListener('mousemove', (e) => {
      tooltip.textContent = `${item.category}: ${item.amount.toFixed(2)} грн`;
      tooltip.style.top = `${e.pageY - 10}px`;
      tooltip.style.left = `${e.pageX}px`;
      tooltip.style.opacity = 1;
    });
    segment.addEventListener('mouseleave', () => {
      tooltip.style.opacity = 0;
    });

    overlay.appendChild(segment);
    startDeg += angle;
  }

  if (animate) {
    chart.classList.remove('pie-animate');
    void chart.offsetWidth;
    chart.classList.add('pie-animate');

    legend.classList.remove('legend-animate');
    void legend.offsetWidth;
    legend.classList.add('legend-animate');
  }
  const balanceInfoIcon = document.getElementById('balance-info-icon');
const balanceTooltip = document.getElementById('balance-tooltip');

balanceInfoIcon.addEventListener('mouseenter', (e) => {
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  const month = currentStatsMonth.getMonth();
  const year = currentStatsMonth.getFullYear();

  let income = 0, expenses = 0;

  transactions.forEach(t => {
    const date = new Date(t.date);
    if (date.getMonth() === month && date.getFullYear() === year) {
      if (t.amount < 0) {
        income += Math.abs(t.amount);
      } else {
        expenses += t.amount;
      }
    }
  });

  balanceTooltip.textContent = `Дохід: ${income.toFixed(2)} грн | Витрати: ${expenses.toFixed(2)} грн`;

  const rect = balanceInfoIcon.getBoundingClientRect();
  balanceTooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
  balanceTooltip.style.left = `${rect.left + window.scrollX}px`;
  balanceTooltip.style.opacity = 1;
});

balanceInfoIcon.addEventListener('mouseleave', () => {
  balanceTooltip.style.opacity = 0;
});

}


function updateStatsBlocks() {
  const now = new Date();
  const all = JSON.parse(localStorage.getItem('transactions') || '[]');

  const getSum = (arr, condition) =>
    arr.filter(condition).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const getCount = (arr, condition) =>
    arr.filter(condition).length;

  const isSameDay = (t) => {
    if (!t.date) return false;
    const d = new Date(t.date);
    return d.toDateString() === now.toDateString();
  };

  const isSameWeek = (t) => {
    if (!t.date) return false;
    const d = new Date(t.date);
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return d >= weekAgo && d <= now;
  };

  const isSameMonth = (t) => {
    if (!t.date) return false;
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const stats = {
    transactions: {
      day: getCount(all, isSameDay),
      week: getCount(all, isSameWeek),
      month: getCount(all, isSameMonth)
    },
    expenses: {
      day: getSum(all, t => isSameDay(t) && t.amount > 0),
      week: getSum(all, t => isSameWeek(t) && t.amount > 0),
      month: getSum(all, t => isSameMonth(t) && t.amount > 0)
    },
    incomes: {
      day: getSum(all, t => isSameDay(t) && t.amount < 0),
      week: getSum(all, t => isSameWeek(t) && t.amount < 0),
      month: getSum(all, t => isSameMonth(t) && t.amount < 0)
    }
  };

  const grid = document.getElementById('stats-grid');
  grid.innerHTML = '';

  const labels = [
    { key: 'day', label: 'День' },
    { key: 'week', label: 'Тиждень' },
    { key: 'month', label: 'Місяць' }
  ];

  ['transactions', 'expenses', 'incomes'].forEach(type => {
    labels.forEach(({ key, label }) => {
      const box = document.createElement('div');
      box.className = 'stat-box';

      const title = document.createElement('div');
      title.className = 'stat-title';
      title.textContent = `${label} — ${
        type === 'transactions' ? 'Транзакцій' :
        type === 'expenses' ? 'Витрат' :
        'Доходів'
      }`;

      const value = document.createElement('div');
      value.className = 'stat-value';
      value.textContent =
        type === 'transactions'
          ? stats[type][key]
          : `${Math.abs(stats[type][key])} грн`;

      box.appendChild(title);
      box.appendChild(value);
      grid.appendChild(box);
    });
  });
}


document.getElementById('stats-btn').addEventListener('click', () => {
  updateStatsBlocks();
  document.getElementById('modal-stats').classList.add('active');
});


document.getElementById('transaction-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value || 'Інше';

  if (!name || isNaN(amount)) return;

  const transaction = { name, amount, category, date: new Date().toISOString() };
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  transactions.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));

  updateMainBalance();
  updatePieChart();

  this.reset();
  categoryButtons.forEach(btn => btn.classList.remove('active'));
  selectedCategory = null;
  document.getElementById('category').value = '';
});

const categoryButtons = document.querySelectorAll('.category-btn');
let selectedCategory = null;
let currentHistoryMonth = new Date(); // за замовчуванням поточний місяць
let currentStatsMonth = new Date();


categoryButtons.forEach(button => {
  button.addEventListener('click', () => {
    categoryButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    selectedCategory = button.getAttribute('data-category');
    document.getElementById('category').value = selectedCategory;
  });
});

document.querySelector('.switch-btn').addEventListener('click', () => {
  const expenseForm = document.getElementById('transaction-form');
  const incomeForm = document.getElementById('income-form');
  const title = document.querySelector('.new-expense-label');

  const isExpenseFormVisible = expenseForm.style.display !== 'none';

  expenseForm.style.display = isExpenseFormVisible ? 'none' : 'block';
  incomeForm.style.display = isExpenseFormVisible ? 'block' : 'none';
  title.innerText = isExpenseFormVisible ? 'Новий дохід' : 'Нова витрата';

  // 🔥 Анімація перемикача
  const switchBtn = document.querySelector('.switch-btn');
  switchBtn.classList.remove('animate-switch');
  void switchBtn.offsetWidth;
  switchBtn.classList.add('animate-switch');

  // 🔥 Анімація для заголовка і форм
const expenseBlock = document.querySelector('.new-expense-block');
const visibleForm = isExpenseFormVisible ? document.getElementById('income-form') : document.getElementById('transaction-form');

[expenseBlock, visibleForm].forEach(el => {
  el.classList.remove('animate-form-block');
  void el.offsetWidth;
  el.classList.add('animate-form-block');
});

});


document.getElementById('income-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('income-name').value.trim();
  const amount = parseFloat(document.getElementById('income-amount').value);

  if (!name || isNaN(amount)) return;

  const transaction = { name, amount: -amount, category: 'Дохід', date: new Date().toISOString() };
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  transactions.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));

  updateMainBalance();
  updatePieChart();

  this.reset();
});


// ⬇️ Плавне відкриття/закриття модалок
function closeModalSmoothly(modal) {
  const modalWindow = modal.querySelector('.modal-window');
  modal.classList.add('closing');
  modalWindow.classList.add('closing');

  setTimeout(() => {
    modal.classList.remove('active', 'closing');
    modalWindow.classList.remove('closing');
  }, 250);
}

document.querySelectorAll('.modal-trigger').forEach(button => {
  button.addEventListener('click', () => {
    const btnId = button.id;
    const modalId = btnId.replace('-btn', '');
    const modal = document.getElementById(`modal-${modalId}`);
    if (modal) modal.classList.add('active');
  });
});

document.querySelectorAll('.close-modal').forEach(closeBtn => {
  closeBtn.addEventListener('click', () => {
    const modal = closeBtn.closest('.modal-overlay');
    closeModalSmoothly(modal);
  });
});

document.querySelectorAll('.modal-overlay').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModalSmoothly(modal);
    }
  });
});

function renderTransactionHistory() {
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  const historyList = document.getElementById('transaction-history-list');
  historyList.innerHTML = '';

  if (transactions.length === 0) {
    historyList.innerHTML = '<p>Транзакцій поки немає.</p>';
    return;
  }

  transactions.slice().reverse().forEach(t => {
    const item = document.createElement('div');
    item.classList.add('transaction-item');
    item.classList.add(t.category === 'Дохід' ? 'income' : 'expense');

    item.innerHTML = `
      <span class="transaction-name">${t.name} (${t.category})</span>
      <span class="transaction-amount">${t.category === 'Дохід' ? '+' : '-'}${Math.abs(t.amount)} грн</span>
    `;

    historyList.appendChild(item);
  });
}


function loadTransactionHistory() {
  let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

  // Оновлюємо заголовок
  document.getElementById('current-month-label').textContent = formatMonthYear(currentHistoryMonth);

  const targetMonth = currentHistoryMonth.getMonth();
  const targetYear = currentHistoryMonth.getFullYear();

  transactions = transactions.filter(t => {
    if (!t.date) return false;
    const txDate = new Date(t.date);
    return txDate.getMonth() === targetMonth && txDate.getFullYear() === targetYear;
  });

  const transactionHistoryList = document.getElementById('transaction-history-list');
  transactionHistoryList.innerHTML = '';

  if (transactions.length === 0) {
    transactionHistoryList.innerHTML = '<p>Транзакцій немає за цей місяць.</p>';
    return;
  }

  transactions.forEach((transaction, index) => {
    const transactionItem = document.createElement('div');
    transactionItem.classList.add('transaction-item');
    transactionItem.classList.add(transaction.amount < 0 ? 'expense' : 'income');

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = transaction.name;
    nameInput.disabled = true;
    nameInput.classList.add('name-input');

    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.value = Math.abs(transaction.amount);
    amountInput.disabled = true;
    amountInput.classList.add('amount-input');

    const categorySelect = document.createElement('select');
    const categories = ['Продукти', 'Транспорт', 'Кафе', 'Здоров\'я', 'Відпочинок', 'Благодійність', 'Дім', 'Інше', 'Дохід'];
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      if (transaction.category === cat) option.selected = true;
      categorySelect.appendChild(option);
    });
    categorySelect.disabled = true;
    categorySelect.classList.add('category-select');

    // Дата
    let formattedDate = '—';
    if (transaction.date) {
      const d = new Date(transaction.date);
      formattedDate = d.toLocaleDateString('uk-UA', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }

    const dateSpan = document.createElement('div');
    dateSpan.textContent = formattedDate;
    dateSpan.style.fontSize = '0.85rem';
    dateSpan.style.color = '#ccc';
    dateSpan.style.minWidth = '120px';

    const saveButton = document.createElement('button');
    saveButton.innerHTML = '<i class="fa-solid fa-check"></i>';
    saveButton.classList.add('edit-btn');
    saveButton.style.display = 'none';

    const editButton = document.createElement('button');
    editButton.innerHTML = '<i class="fa-solid fa-pen"></i>';
    editButton.classList.add('edit-btn');

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    deleteButton.classList.add('delete-btn');

    editButton.addEventListener('click', () => {
      nameInput.disabled = false;
      amountInput.disabled = false;
      categorySelect.disabled = false;
      saveButton.style.display = 'inline-block';
      editButton.style.display = 'none';
    });

    saveButton.addEventListener('click', () => {
      const newName = nameInput.value.trim();
      const newAmount = parseFloat(amountInput.value);
      const newCategory = categorySelect.value;

      if (!newName || isNaN(newAmount)) {
        alert('Введіть коректні дані');
        return;
      }

      const updatedTransaction = {
        name: newName,
        amount: newCategory === 'Дохід' ? -Math.abs(newAmount) : Math.abs(newAmount),
        category: newCategory,
        date: transaction.date || new Date().toISOString()
      };

      let allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      allTransactions[index] = updatedTransaction;
      localStorage.setItem('transactions', JSON.stringify(allTransactions));
      updateMainBalance();
      updatePieChart();
      loadTransactionHistory();
    });

    deleteButton.addEventListener('click', () => {
      removeTransaction(index);
    });

    const searchableText = [
      transaction.name,
      transaction.category,
      Math.abs(transaction.amount)
    ].join(' ').toLowerCase();
    
    transactionItem.setAttribute('data-search', searchableText);

    transactionItem.appendChild(nameInput);
    transactionItem.appendChild(amountInput);
    transactionItem.appendChild(categorySelect);
    transactionItem.appendChild(dateSpan);
    transactionItem.appendChild(editButton);
    transactionItem.appendChild(saveButton);
    transactionItem.appendChild(deleteButton);

    transactionHistoryList.appendChild(transactionItem);
  });

  // 🆕 Додаємо ПРАЦЮЮЧИЙ пошук після генерації списку
  const searchInput = document.getElementById('history-search');

// Видаляємо попередній обробник, якщо був
if (searchInput._historyListener) {
  searchInput.removeEventListener('input', searchInput._historyListener);
}

// Створюємо новий обробник
const handleSearch = () => {
  const searchTerm = searchInput.value.toLowerCase();
  const items = document.querySelectorAll('#transaction-history-list .transaction-item');

  items.forEach(item => {
const text = item.getAttribute('data-search');
item.style.display = text.includes(searchTerm) ? '' : 'none';

  });
};

// Прив’язуємо і зберігаємо посилання
searchInput._historyListener = handleSearch;
searchInput.addEventListener('input', handleSearch);

}

// Очистити всі транзакції
document.getElementById('clear-all').addEventListener('click', () => {
  if (confirm('❗ Ви впевнені, що хочете видалити всі транзакції?')) {
    localStorage.removeItem('transactions');
    updateMainBalance();
    updatePieChart(false);
    loadTransactionHistory();
    alert('✅ Усі транзакції видалено.');
  }
});

// Видалити транзакції за сьогодні
document.getElementById('clear-today').addEventListener('click', () => {
  if (confirm('❗ Видалити всі транзакції за сьогодні?')) {
    const all = JSON.parse(localStorage.getItem('transactions') || '[]');
    const today = new Date().toDateString();

    const filtered = all.filter(t => {
      const txDate = new Date(t.date).toDateString();
      return txDate !== today;
    });

    localStorage.setItem('transactions', JSON.stringify(filtered));
    updateMainBalance();
    updatePieChart(false);
    loadTransactionHistory();
    alert('✅ Транзакції за сьогодні видалено.');
  }
});

// Видалити транзакції за тиждень
document.getElementById('clear-week').addEventListener('click', () => {
  if (confirm('❗ Видалити всі транзакції за останні 7 днів?')) {
    const all = JSON.parse(localStorage.getItem('transactions') || '[]');
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    const filtered = all.filter(t => {
      const d = new Date(t.date);
      return d < weekAgo || d > now;
    });

    localStorage.setItem('transactions', JSON.stringify(filtered));
    updateMainBalance();
    updatePieChart(false);
    loadTransactionHistory();
    alert('✅ Транзакції за останній тиждень видалено.');
  }
});




// Функція для видалення транзакції
function removeTransaction(index) {
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  transactions.splice(index, 1); // Видаляємо транзакцію за індексом
  localStorage.setItem('transactions', JSON.stringify(transactions)); // Зберігаємо оновлений список

  // Оновлюємо баланс і діаграму одразу після видалення транзакції
  updateMainBalance();
  updatePieChart();
  loadTransactionHistory(); // Перезавантажуємо історію транзакцій
}

// Викликаємо функцію для завантаження історії при відкритті модалки
document.getElementById('history-btn').addEventListener('click', () => {
  loadTransactionHistory();
  updateMainBalance();
  updatePieChart(false); // ⬅️ без анімації
  document.getElementById('modal-history').classList.add('active');


  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');

  if (prevMonthBtn && nextMonthBtn) {
    prevMonthBtn.addEventListener('click', handlePrevClick);
    nextMonthBtn.addEventListener('click', handleNextClick);
  }
});

// окремі функції, щоб не дублювати код
function handlePrevClick() {
  console.log('⬅️ Клік по попередньому місяцю');
  currentHistoryMonth.setMonth(currentHistoryMonth.getMonth() - 1);
  loadTransactionHistory();
}

function handleNextClick() {
  console.log('➡️ Клік по наступному місяцю');
  currentHistoryMonth.setMonth(currentHistoryMonth.getMonth() + 1);
  loadTransactionHistory();
}

window.onload = () => {
  updateMainBalance();
  updatePieChart();
  loadTransactionHistory(); // додамо сюди
};

function updateStatsUI() {
  document.getElementById('stats-month-label').textContent = formatMonthYear(currentStatsMonth);
  updateMainBalance();
  updatePieChart();

  // Анімація для лівого контейнера
  const leftSection = document.querySelector('.left-section');
  leftSection.classList.remove('animate-left-section'); // скидаємо, якщо вже є
  void leftSection.offsetWidth; // force reflow — трюк щоб працювало кожен раз
  leftSection.classList.add('animate-left-section');
}


document.getElementById('stats-prev-month').addEventListener('click', () => {
  currentStatsMonth.setMonth(currentStatsMonth.getMonth() - 1);
  updateStatsUI();
});

document.getElementById('stats-next-month').addEventListener('click', () => {
  currentStatsMonth.setMonth(currentStatsMonth.getMonth() + 1);
  updateStatsUI();
});


document.getElementById('clear-btn').addEventListener('click', () => {
  if (confirm("Ви точно хочете видалити всі транзакції?")) {
    localStorage.removeItem('transactions');
    updateMainBalance();
    updatePieChart();
    loadTransactionHistory();
  }
});

function formatMonthYear(date) {
  const formatter = new Intl.DateTimeFormat('uk-UA', {
    month: 'long',
    year: 'numeric'
  });

  const formatted = formatter.format(date);
  return formatted.replace(' р.', ''); // прибираємо "р."
}



function editTransaction(index) {
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  const transaction = transactions[index];

  // Визначаємо, яка форма відкрита — дохід чи витрата
  if (transaction.category === 'Дохід') {
    document.getElementById('income-form').style.display = 'block';
    document.getElementById('transaction-form').style.display = 'none';
    document.querySelector('.new-expense-label').innerText = 'Редагування доходу';
    document.getElementById('income-name').value = transaction.name;
    document.getElementById('income-amount').value = Math.abs(transaction.amount);

    // Видаляємо стару і чекаємо нову
    removeTransaction(index);
  } else {
    document.getElementById('income-form').style.display = 'none';
    document.getElementById('transaction-form').style.display = 'block';
    document.querySelector('.new-expense-label').innerText = 'Редагування витрати';
    document.getElementById('name').value = transaction.name;
    document.getElementById('amount').value = transaction.amount;

    selectedCategory = transaction.category;
    document.getElementById('category').value = selectedCategory;

    categoryButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-category') === selectedCategory) {
        btn.classList.add('active');
      }
    });

    removeTransaction(index);
  }

  // Закриваємо модалку
  document.getElementById('modal-history').classList.remove('active');
}

document.getElementById('history-filter').addEventListener('change', (e) => {
  const selectedPeriod = e.target.value;
  loadTransactionHistory(selectedPeriod);
});


const searchInput = document.getElementById('history-search');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const transactions = document.querySelectorAll('.transaction-item');

    transactions.forEach((item) => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(searchTerm) ? '' : 'none';
    });
  });
}


