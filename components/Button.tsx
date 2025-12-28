import React from 'react';
import { ButtonProps } from '../types';

export const Button: React.FC<ButtonProps> = ({ label, onClick, type = 'number', className = '', icon }) => {
  const getBaseStyles = () => {
    switch (type) {
      case 'operator':
        return 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold';
      case 'action':
        return 'bg-rose-500 hover:bg-rose-400 text-white font-semibold';
      case 'secondary':
        return 'bg-slate-600 hover:bg-slate-500 text-slate-100';
      case 'scientific':
        return 'bg-slate-700/60 hover:bg-slate-600 text-indigo-200 font-medium text-lg';
      case 'number':
      default:
        return 'bg-slate-800 hover:bg-slate-700 text-slate-200';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-3 sm:p-4 text-xl sm:text-2xl transition-all duration-200 active:scale-95 shadow-lg select-none flex items-center justify-center
        ${getBaseStyles()}
        ${className}
      `}
    >
      {icon ? icon : label}
    </button>
  );
};