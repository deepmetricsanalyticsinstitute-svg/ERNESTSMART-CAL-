import React, { useState, useEffect, useCallback } from 'react';
import { Display } from './components/Display';
import { Button } from './components/Button';
import { CalculatorState, Operator } from './types';
import { calculateResult, calculateScientific } from './utils/calculatorLogic';
import { solveMathProblem } from './services/geminiService';

// Icons
const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
);

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const App: React.FC = () => {
  const [state, setState] = useState<CalculatorState>({
    currentValue: '0',
    previousValue: '',
    operator: Operator.None,
    isOverwriting: false,
    history: []
  });

  const [aiMode, setAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');

  // --- Core Calculator Logic ---

  const handleNumber = useCallback((num: string) => {
    setState(prev => {
      if (prev.isOverwriting) {
        return {
          ...prev,
          currentValue: num,
          isOverwriting: false
        };
      }
      if (prev.currentValue === '0' && num !== '.') {
        return { ...prev, currentValue: num };
      }
      if (num === '.' && prev.currentValue.includes('.')) {
        return prev;
      }
      return { ...prev, currentValue: prev.currentValue + num };
    });
  }, []);

  const handleOperator = useCallback((op: Operator) => {
    setState(prev => {
      // If we already have an operation pending and we just typed a number, calculate first
      if (prev.operator !== Operator.None && !prev.isOverwriting) {
        const result = calculateResult(prev.previousValue, prev.currentValue, prev.operator);
        return {
          ...prev,
          previousValue: result,
          currentValue: result,
          operator: op,
          isOverwriting: true,
          history: [...prev.history, `${prev.previousValue} ${prev.operator} ${prev.currentValue} = ${result}`]
        };
      }
      
      // Otherwise just set the operator and move current to previous
      return {
        ...prev,
        operator: op,
        previousValue: prev.currentValue,
        isOverwriting: true
      };
    });
  }, []);

  const handleEqual = useCallback(() => {
    setState(prev => {
      if (prev.operator === Operator.None) return prev;
      
      const result = calculateResult(prev.previousValue, prev.currentValue, prev.operator);
      return {
        ...prev,
        currentValue: result,
        previousValue: '',
        operator: Operator.None,
        isOverwriting: true,
        history: [...prev.history, `${prev.previousValue} ${prev.operator} ${prev.currentValue} = ${result}`]
      };
    });
  }, []);

  const handleClear = useCallback(() => {
    setState({
      currentValue: '0',
      previousValue: '',
      operator: Operator.None,
      isOverwriting: false,
      history: []
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setState(prev => {
      if (prev.isOverwriting) return prev;
      if (prev.currentValue.length === 1 || prev.currentValue === 'Error' || prev.currentValue === 'Infinity') {
        return { ...prev, currentValue: '0' };
      }
      return { ...prev, currentValue: prev.currentValue.slice(0, -1) };
    });
  }, []);

  const handlePercent = useCallback(() => {
    setState(prev => {
      const num = parseFloat(prev.currentValue);
      const res = (num / 100).toString();
      return {
        ...prev,
        currentValue: res,
        isOverwriting: true
      };
    });
  }, []);

  // Scientific functions
  const handleScientific = useCallback((func: string) => {
    setState(prev => {
      const result = calculateScientific(prev.currentValue, func, angleMode);
      // Construct a nice history label
      let historyLabel = `${func}(${prev.currentValue})`;
      if (func === 'sqr') historyLabel = `(${prev.currentValue})²`;
      if (func === 'fact') historyLabel = `(${prev.currentValue})!`;
      
      return {
        ...prev,
        currentValue: result,
        isOverwriting: true,
        history: [...prev.history, `${historyLabel} = ${result}`]
      };
    });
  }, [angleMode]);

  const handleConstant = useCallback((val: number) => {
    setState(prev => ({
       ...prev,
       currentValue: val.toString(),
       isOverwriting: true
    }));
  }, []);

  // --- AI Logic ---

  const handleAiSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    // Display the question temporarily
    const prompt = aiPrompt;
    setAiPrompt("Thinking...");
    
    const result = await solveMathProblem(prompt);
    
    setAiPrompt(result);
    setIsAiLoading(false);
  };

  // --- Keyboard Support ---

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (aiMode) return; // Disable keyboard shortcuts in AI mode to allow typing

      const { key } = e;
      
      if (/[0-9]/.test(key)) handleNumber(key);
      if (key === '.') handleNumber('.');
      if (key === '+' || key === 'Add') handleOperator(Operator.Add);
      if (key === '-' || key === 'Subtract') handleOperator(Operator.Subtract);
      if (key === '*' || key === 'x' || key === 'X' || key === 'Multiply') handleOperator(Operator.Multiply);
      if (key === '/' || key === 'Divide') handleOperator(Operator.Divide);
      if (key === '^') handleOperator(Operator.Power);
      if (key === 'Enter' || key === '=') {
        e.preventDefault(); 
        handleEqual();
      }
      if (key === 'Backspace') handleBackspace();
      if (key === 'Escape') handleClear();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumber, handleOperator, handleEqual, handleBackspace, handleClear, aiMode]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[500px]">
        {/* Toggle Mode Buttons */}
        <div className="flex justify-between mb-4">
            <div className="flex gap-2 p-1 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50">
                <button 
                    onClick={() => setAiMode(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!aiMode ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                    Scientific
                </button>
                <button 
                    onClick={() => setAiMode(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${aiMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                    <SparklesIcon />
                    AI Solve
                </button>
            </div>
            <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-xl border border-slate-700/50 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all ${showHistory ? 'bg-slate-700 text-white' : ''}`}
            >
                <HistoryIcon />
            </button>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] shadow-2xl p-6 relative overflow-hidden">
            
            {/* History Overlay */}
            <div className={`absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-md p-6 transition-all duration-300 transform ${showHistory ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">History</h2>
                    <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white"><CloseIcon/></button>
                </div>
                <div className="flex flex-col gap-3 h-[400px] overflow-y-auto no-scrollbar">
                    {state.history.length === 0 ? (
                        <p className="text-slate-500 text-center mt-10">No calculations yet.</p>
                    ) : (
                        [...state.history].reverse().map((item, i) => (
                            <div key={i} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <p className="text-slate-300 text-right font-mono text-sm sm:text-base">{item}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Display 
                value={state.currentValue} 
                previousValue={state.previousValue} 
                operator={state.operator}
                isAiMode={aiMode}
                aiPrompt={aiPrompt}
                angleMode={angleMode}
            />
          
            {aiMode ? (
                <div className="h-[432px] flex flex-col gap-4">
                    <form onSubmit={handleAiSubmit} className="flex flex-col h-full gap-4">
                        <textarea
                            value={aiPrompt === "Thinking..." ? "" : aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Ask me anything... e.g. 'What is the square root of 1024 plus 15?' or 'Solve 3x^2 + 2x - 5 = 0'"
                            className="flex-1 bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-lg"
                        />
                        <div className="grid grid-cols-2 gap-3">
                             <button
                                type="button"
                                onClick={() => setAiPrompt('')}
                                className="p-4 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                type="submit"
                                disabled={isAiLoading || !aiPrompt.trim()}
                                className="p-4 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                            >
                                {isAiLoading ? 'Solving...' : (
                                    <>
                                        Calculate <SparklesIcon />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {/* Row 1 */}
                    <Button label="sin" type="scientific" onClick={() => handleScientific('sin')} />
                    <Button label="cos" type="scientific" onClick={() => handleScientific('cos')} />
                    <Button label="tan" type="scientific" onClick={() => handleScientific('tan')} />
                    <Button label={angleMode} type="scientific" onClick={() => setAngleMode(prev => prev === 'DEG' ? 'RAD' : 'DEG')} className="text-xs sm:text-sm font-bold tracking-wider" />
                    <Button label="AC" type="action" onClick={handleClear} />

                    {/* Row 2 */}
                    <Button label="π" type="scientific" onClick={() => handleConstant(Math.PI)} />
                    <Button label="e" type="scientific" onClick={() => handleConstant(Math.E)} />
                    <Button label="√" type="scientific" onClick={() => handleScientific('sqrt')} />
                    <Button label="^" type="scientific" onClick={() => handleOperator(Operator.Power)} />
                    <Button label="÷" type="operator" onClick={() => handleOperator(Operator.Divide)} />

                    {/* Row 3 */}
                    <Button label="x²" type="scientific" onClick={() => handleScientific('sqr')} />
                    <Button label="7" onClick={() => handleNumber('7')} />
                    <Button label="8" onClick={() => handleNumber('8')} />
                    <Button label="9" onClick={() => handleNumber('9')} />
                    <Button label="×" type="operator" onClick={() => handleOperator(Operator.Multiply)} />

                    {/* Row 4 */}
                    <Button label="x!" type="scientific" onClick={() => handleScientific('fact')} />
                    <Button label="4" onClick={() => handleNumber('4')} />
                    <Button label="5" onClick={() => handleNumber('5')} />
                    <Button label="6" onClick={() => handleNumber('6')} />
                    <Button label="-" type="operator" onClick={() => handleOperator(Operator.Subtract)} />

                    {/* Row 5 */}
                    <Button label="log" type="scientific" onClick={() => handleScientific('log')} />
                    <Button label="1" onClick={() => handleNumber('1')} />
                    <Button label="2" onClick={() => handleNumber('2')} />
                    <Button label="3" onClick={() => handleNumber('3')} />
                    <Button label="+" type="operator" onClick={() => handleOperator(Operator.Add)} />

                    {/* Row 6 */}
                    <Button label="ln" type="scientific" onClick={() => handleScientific('ln')} />
                    <Button label="." onClick={() => handleNumber('.')} />
                    <Button label="0" onClick={() => handleNumber('0')} />
                    <Button label="⌫" onClick={handleBackspace} icon={<DeleteIcon/>} />
                    <Button label="=" type="operator" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400" onClick={handleEqual} />
                </div>
            )}
        </div>
        
        <p className="text-center text-slate-500 mt-6 text-sm">
             Press <kbd className="bg-slate-800 px-2 py-1 rounded text-slate-400 mx-1">Esc</kbd> to clear
        </p>
      </div>
    </div>
  );
};

export default App;