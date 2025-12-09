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
    
    // Шаг 2: Рассчитываем стоимость одного дня (округляем до десятых)
    const dailyCost = Math.round((totalCost / totalDays) * 10) / 10;
    
    // Шаг 3: Рассчитываем количество дней, которые проучился студент
    // День запроса возврата не считается как день обучения, поэтому inclusive = false
    const daysStudied = calculateDaysDifference(courseStart, refundDate, false);
    
    // Если студент запросил возврат после окончания курса
    const actualDaysStudied = Math.min(daysStudied, totalDays);
    
    // Шаг 4: Рассчитываем открученные деньги (округляем до десятых)
    const amountSpent = Math.round(dailyCost * actualDaysStudied * 10) / 10;
    
    // Шаг 5 и 6: Рассчитываем сумму к возврату (округляем до десятых)
    const refundAmount = Math.round((amountPaid - amountSpent) * 10) / 10;
    
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

function calculateDaysDifference(startDate, endDate, inclusive = true) {
    const oneDay = 24 * 60 * 60 * 1000; // миллисекунды в одном дне
    const diffTime = endDate - startDate;
    const diffDays = Math.round(diffTime / oneDay);
    // Если inclusive = true, включаем оба дня (первый и последний)
    return inclusive ? diffDays + 1 : diffDays;
}

function displayResults(results) {
    // Сохраняем результаты для копирования
    lastResults = results;
    
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
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(amount);
}

function showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Сохраняем последние результаты для копирования
let lastResults = null;

// Обработчик кнопки копирования
document.getElementById('copyBtn').addEventListener('click', function() {
    if (!lastResults) return;
    
    const text = `Расчет возврата:
• Длительность курса: ${lastResults.totalDays} дней
• Стоимость дня: ${formatCurrency(lastResults.dailyCost)}
• Дней обучения: ${lastResults.daysStudied} дней
• Оплачено: ${formatCurrency(lastResults.amountPaid)}
• Открученные деньги: ${formatCurrency(lastResults.amountSpent)}
• Сумма к возврату: ${formatCurrency(lastResults.refundAmount)}`;
    
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '✓ Скопировано!';
        btn.classList.add('copied');
        
        setTimeout(() => {
            btn.textContent = '📋 Скопировать результат';
            btn.classList.remove('copied');
        }, 2000);
    });
});

// Устанавливаем текущую дату как значение по умолчанию для даты запроса возврата
document.getElementById('refundDate').valueAsDate = new Date();
