import React from 'react'
import { useCalculator } from '../../hooks/useCalculator'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { Display } from '../Display/Display'
import { Keypad } from '../Keypad/Keypad'

export const Calculator: React.FC = () => {
  const {
    displayValue,
    expression,
    currentOperation,
    isLoading,
    error,
    inputDigit,
    inputDecimal,
    setOperation,
    calculateResult,
    clearAll,
    backspace,
    toggleSign,
  } = useCalculator()

  // Vincula atalhos do teclado físico
  useKeyboardShortcuts({
    inputDigit,
    inputDecimal,
    setOperation,
    calculateResult,
    clearAll,
    backspace,
  })

  return (
    <div className="calculator-card">
      <Display
        expression={expression}
        value={displayValue}
        error={error}
        isLoading={isLoading}
      />

      <Keypad
        onDigit={inputDigit}
        onDecimal={inputDecimal}
        onOperation={setOperation}
        onCalculate={calculateResult}
        onClear={clearAll}
        onBackspace={backspace}
        onToggleSign={toggleSign}
        currentOperation={currentOperation}
        isLoading={isLoading}
      />
    </div>
  )
}
