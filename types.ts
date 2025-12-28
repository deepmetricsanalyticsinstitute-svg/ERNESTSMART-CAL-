import React from 'react';

export enum Operator {
  Add = '+',
  Subtract = '-',
  Multiply = '×',
  Divide = '÷',
  Power = '^',
  None = ''
}

export type CalculatorState = {
  currentValue: string;
  previousValue: string;
  operator: Operator;
  isOverwriting: boolean;
  history: string[];
};

export type Theme = 'dark' | 'light';

export interface ButtonProps {
  label: string;
  onClick: () => void;
  type?: 'number' | 'operator' | 'action' | 'secondary' | 'scientific';
  className?: string;
  icon?: React.ReactNode;
}