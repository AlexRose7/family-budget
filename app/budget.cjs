// Функция для расчета соотношения трат и доходов
function calculateBudgetBalance(income, expenses) {
  const ratio = expenses / income;

  if (income > expenses) {
      return {
          balance: "Профицит бюджета",
          ratio: ratio.toFixed(2),
      };
  } else {
      return {
          balance: "Дефицит бюджета",
          ratio: ratio.toFixed(2),
      };
  }
}

module.exports = calculateBudgetBalance;