import { Operator } from '../types';

export const calculateResult = (a: string, b: string, op: Operator): string => {
  const num1 = parseFloat(a);
  const num2 = parseFloat(b);

  if (isNaN(num1) || isNaN(num2)) return 'Error';

  let result = 0;
  switch (op) {
    case Operator.Add:
      result = num1 + num2;
      break;
    case Operator.Subtract:
      result = num1 - num2;
      break;
    case Operator.Multiply:
      result = num1 * num2;
      break;
    case Operator.Divide:
      if (num2 === 0) return 'Error';
      result = num1 / num2;
      break;
    case Operator.Power:
      result = Math.pow(num1, num2);
      break;
    default:
      return b;
  }

  // Handle floating point precision issues (e.g. 0.1 + 0.2)
  const precision = 10000000000;
  result = Math.round(result * precision) / precision;

  return result.toString();
};

export const isValidNumber = (val: string): boolean => {
  return !isNaN(parseFloat(val)) && isFinite(parseFloat(val));
};

export const calculateScientific = (value: string, func: string, angleMode: 'DEG' | 'RAD'): string => {
  const num = parseFloat(value);
  if (isNaN(num)) return 'Error';

  let result = 0;
  switch (func) {
    case 'sin':
      result = angleMode === 'DEG' ? Math.sin((num * Math.PI) / 180) : Math.sin(num);
      break;
    case 'cos':
      result = angleMode === 'DEG' ? Math.cos((num * Math.PI) / 180) : Math.cos(num);
      break;
    case 'tan':
      result = angleMode === 'DEG' ? Math.tan((num * Math.PI) / 180) : Math.tan(num);
      break;
    case 'sqrt':
      if (num < 0) return 'Error';
      result = Math.sqrt(num);
      break;
    case 'sqr':
      result = Math.pow(num, 2);
      break;
    case 'log':
      if (num <= 0) return 'Error';
      result = Math.log10(num);
      break;
    case 'ln':
      if (num <= 0) return 'Error';
      result = Math.log(num);
      break;
    case 'fact':
      if (num < 0 || !Number.isInteger(num)) return 'Error';
      if (num > 170) return 'Infinity'; // JS max safe factorial
      result = 1;
      for (let i = 2; i <= num; i++) result *= i;
      break;
    default:
      return value;
  }

  // Precision handling
  const precision = 10000000000;
  result = Math.round(result * precision) / precision;
  return result.toString();
};