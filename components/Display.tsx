import React from 'react';
import { Operator } from '../types';

interface DisplayProps {
  value: string;
  previousValue: string;
  operator: Operator;
  isAiMode: boolean;
  aiPrompt: string;
  angleMode: 'DEG' | 'RAD';
}

export const Display: React.FC<DisplayProps> = ({ value, previousValue, operator, isAiMode, aiPrompt, angleMode }) => {
  // Format numbers to have commas if they are large, but keep decimals intact
  const formatNumber = (num: string) => {
    if (num === 'Error' || num === 'NaN' || num === 'Infinity') return num;
    if (num.endsWith('.')) return num;
    if (!num) return '0';
    
    // Check if it's a negative number
    const isNegative = num.startsWith('-');
    const cleanNum = isNegative ? num.substring(1) : num;

    const parts = cleanNum.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    let result = formattedInt;
    if (decimalPart !== undefined) {
      result += '.' + decimalPart;
    }
    
    return isNegative ? '-' + result : result;
  };

  return (
    <div className="w-full h-48 bg-slate-950 rounded-3xl mb-4 p-6 flex flex-col items-end justify-end shadow-inner relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {isAiMode ? (
        <div className="w-full h-full flex flex-col justify-end text-right">
             <span className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-bold opacity-70">AI Assistant</span>
             <div className="text-slate-300 text-lg leading-tight break-words whitespace-pre-wrap max-h-[80%] overflow-y-auto no-scrollbar">
                {aiPrompt || "Ask a question..."}
             </div>
        </div>
      ) : (
        <>
          <div className="absolute top-4 left-6">
             <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">{angleMode}</span>
          </div>
          <div className="text-slate-400 text-lg font-medium h-8 transition-all">
            {previousValue} {operator !== Operator.None ? operator : ''}
          </div>
          <div className={`text-white font-light tracking-tight transition-all truncate w-full text-right ${value.length > 12 ? 'text-3xl' : value.length > 9 ? 'text-4xl' : 'text-6xl'}`}>
            {formatNumber(value)}
          </div>
        </>
      )}
    </div>
  );
};