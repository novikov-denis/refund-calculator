document.getElementById('refundForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Скрываем предыдущие результаты и ошибки
    document.getElementById('results').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
    
    // Получаем значения из формы
    const courseStart = new Date(document.getElementById('courseStart').value);
    const courseEnd = new Date(document.getElementById('courseEnd').value);
    const refundDate = new Date(document.getElementById('refundDate').value);
    const totalCost = parseFloat(document.getElementById('totalCost').value);
    const amountPaid = parseFloat(document.getElementById('amountPaid').value);
    
    // Валидация данных
    if (courseEnd <= courseStart) {
        showError('Дата окончания курса должна быть позже даты старта');
        return;
    }
    
    if (refundDate < courseStart) {
        showError('Дата запроса возврата не может быть раньше даты старта курса');
        return;
    }
    
    if (totalCost <= 0) {
        showError('Стоимость курса должна быть больше нуля');
        return;
    }
    
    if (amountPaid < 0) {
        showError('Оплаченная сумма не может быть отрицательной');
        return;
    }
    
    // Шаг 1: Рассчитываем общее количество дней курса
    const totalDays = calculateDaysDifference(courseStart, courseEnd);
    
    if (totalDays <= 0) {
        showError('Некорректные даты курса');
        return;
    }
    
    // Шаг 2: Рассчитываем стоимость одного дня
    const dailyCost = totalCost / totalDays;
    
    // Шаг 3: Рассчитываем количество дней, которые проучился студент
    const daysStudied = calculateDaysDifference(courseStart, refundDate);
    
    // Если студент запросил возврат после окончания курса
    const actualDaysStudied = Math.min(daysStudied, totalDays);
    
    // Шаг 4: Рассчитываем открученные деньги
    const amountSpent = dailyCost * actualDaysStudied;
    
    // Шаг 5 и 6: Рассчитываем сумму к возврату
    const refundAmount = amountPaid - amountSpent;
    
    // Отображаем результаты
    displayResults({
        totalDays,
        dailyCost,
        daysStudied: actualDaysStudied,
        amountSpent,
        amountPaid,
        refundAmount
    });
});

function calculateDaysDifference(startDate, endDate) {
    const oneDay = 24 * 60 * 60 * 1000; // миллисекунды в одном дне
    const diffTime = endDate - startDate;
    const diffDays = Math.round(diffTime / oneDay);
    return diffDays;
}

function displayResults(results) {
    document.getElementById('totalDays').textContent = `${results.totalDays} дней`;
    document.getElementById('dailyCost').textContent = formatCurrency(results.dailyCost);
    document.getElementById('daysStudied').textContent = `${results.daysStudied} дней`;
    document.getElementById('amountSpent').textContent = formatCurrency(results.amountSpent);
    document.getElementById('paidAmount').textContent = formatCurrency(results.amountPaid);
    document.getElementById('refundAmount').textContent = formatCurrency(results.refundAmount);
    
    // Показываем блок с результатами
    document.getElementById('results').classList.remove('hidden');
    
    // Плавная прокрутка к результатам
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Устанавливаем текущую дату как значение по умолчанию для даты запроса возврата
document.getElementById('refundDate').valueAsDate = new Date();
