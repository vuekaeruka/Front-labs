const a = parseFloat(prompt("Введите действительное число a:"));
const n = parseInt(prompt("Введите натуральное число n:"));

if (isNaN(a) || isNaN(n) || n <= 0 || !Number.isInteger(n)) {
    alert("Ошибка: введите корректные данные a должно быть действительным числом, n - натуральным числом");
} else {
    let result = 1;
    let expression = ""; 
    
    for (let i = 0; i < n; i++) {
        const currentMultiplier = a + i;
        result *= currentMultiplier;
        
        if (i === 0) {
            expression += `${a}`;
        } else {
            expression += ` × (${a} + ${i})`;
        }
    }
    alert(`Результат вычисления:\n${expression} = ${result}`);
}