import React from 'react'
import type { OperationType } from '../../models/calculator'
import { CalcButton } from './CalcButton'

interface KeypadProps {
  onDigit: (digit: string) => void
  onDecimal: () => void
  onOperation: (op: OperationType) => void
  onCalculate: () => void
  onClear: () => void
  onBackspace: () => void
  onToggleSign: () => void
  currentOperation: OperationType | null
  isLoading: boolean
}

export const Keypad: React.FC<KeypadProps> = ({
  onDigit,
  onDecimal,
  onOperation,
  onCalculate,
  onClear,
  onBackspace,
  onToggleSign,
  currentOperation,
  isLoading,
}) => {
  return (
    <div className="calculator-keypad" role="group" aria-label="Teclado numérico e operações">
      {/* Linha 1 */}
      <CalcButton
        label="AC"
        onClick={onClear}
        variant="action"
        ariaLabel="Limpar tudo"
        shortcut="Esc"
      />
      <CalcButton
        label="⌫"
        onClick={onBackspace}
        variant="action"
        ariaLabel="Apagar último dígito"
        shortcut="Backspace"
      />
      <CalcButton
        label="±"
        onClick={onToggleSign}
        variant="action"
        ariaLabel="Inverter sinal positivo/negativo"
      />
      <CalcButton
        label="÷"
        onClick={() => onOperation('divide')}
        variant="operator"
        isActive={currentOperation === 'divide'}
        disabled={isLoading}
        ariaLabel="Dividir"
        shortcut="/"
      />

      {/* Linha 2 */}
      <CalcButton
        label="7"
        onClick={() => onDigit('7')}
        variant="number"
        ariaLabel="Número 7"
      />
      <CalcButton
        label="8"
        onClick={() => onDigit('8')}
        variant="number"
        ariaLabel="Número 8"
      />
      <CalcButton
        label="9"
        onClick={() => onDigit('9')}
        variant="number"
        ariaLabel="Número 9"
      />
      <CalcButton
        label="×"
        onClick={() => onOperation('multiply')}
        variant="operator"
        isActive={currentOperation === 'multiply'}
        disabled={isLoading}
        ariaLabel="Multiplicar"
        shortcut="*"
      />

      {/* Linha 3 */}
      <CalcButton
        label="4"
        onClick={() => onDigit('4')}
        variant="number"
        ariaLabel="Número 4"
      />
      <CalcButton
        label="5"
        onClick={() => onDigit('5')}
        variant="number"
        ariaLabel="Número 5"
      />
      <CalcButton
        label="6"
        onClick={() => onDigit('6')}
        variant="number"
        ariaLabel="Número 6"
      />
      <CalcButton
        label="−"
        onClick={() => onOperation('subtract')}
        variant="operator"
        isActive={currentOperation === 'subtract'}
        disabled={isLoading}
        ariaLabel="Subtrair"
        shortcut="-"
      />

      {/* Linha 4 */}
      <CalcButton
        label="1"
        onClick={() => onDigit('1')}
        variant="number"
        ariaLabel="Número 1"
      />
      <CalcButton
        label="2"
        onClick={() => onDigit('2')}
        variant="number"
        ariaLabel="Número 2"
      />
      <CalcButton
        label="3"
        onClick={() => onDigit('3')}
        variant="number"
        ariaLabel="Número 3"
      />
      <CalcButton
        label="+"
        onClick={() => onOperation('add')}
        variant="operator"
        isActive={currentOperation === 'add'}
        disabled={isLoading}
        ariaLabel="Somar"
        shortcut="+"
      />

      {/* Linha 5 */}
      <CalcButton
        label="0"
        onClick={() => onDigit('0')}
        variant="number"
        span={2}
        ariaLabel="Número 0"
      />
      <CalcButton
        label="."
        onClick={onDecimal}
        variant="number"
        ariaLabel="Ponto decimal"
        shortcut="."
      />
      <CalcButton
        label="="
        onClick={onCalculate}
        variant="equals"
        disabled={isLoading}
        ariaLabel="Calcular resultado"
        shortcut="Enter"
      />
    </div>
  )
}
