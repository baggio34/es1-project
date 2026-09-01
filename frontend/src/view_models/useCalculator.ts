import { useCallback, useState } from 'react'
import { calculatorApi } from '../api/calculatorApi'
import {
  OPERATIONS,
  type OperationType,
} from '../models/calculator'

const MAX_DIGITS = 14

const formatNumber = (num: number): string => {
  if (!Number.isFinite(num)) return String(num)
  const rounded = parseFloat(num.toPrecision(12))
  return String(rounded)
}

export function useCalculator() {
  const [displayValue, setDisplayValue] = useState<string>('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [currentOperation, setCurrentOperation] = useState<OperationType | null>(null)
  const [isNewEntry, setIsNewEntry] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [expression, setExpression] = useState<string>('')

  const inputDigit = useCallback(
    (digit: string) => {
      setError(null)

      if (isNewEntry || displayValue === '0' || displayValue === 'Erro') {
        setDisplayValue(digit)
        setIsNewEntry(false)
        return
      }

      if (displayValue.replace(/[-.]/g, '').length >= MAX_DIGITS) {
        return
      }

      setDisplayValue((prev) => prev + digit)
    },
    [displayValue, isNewEntry],
  )

  const inputDecimal = useCallback(() => {
    setError(null)

    if (isNewEntry || displayValue === 'Erro') {
      setDisplayValue('0.')
      setIsNewEntry(false)
      return
    }

    if (!displayValue.includes('.')) {
      setDisplayValue((prev) => prev + '.')
    }
  }, [displayValue, isNewEntry])

  const clearAll = useCallback(() => {
    setDisplayValue('0')
    setPreviousValue(null)
    setCurrentOperation(null)
    setIsNewEntry(false)
    setError(null)
    setExpression('')
  }, [])

  const backspace = useCallback(() => {
    if (error || isNewEntry) {
      return
    }

    if (displayValue.length <= 1 || (displayValue.length === 2 && displayValue.startsWith('-'))) {
      setDisplayValue('0')
      return
    }

    setDisplayValue((prev) => prev.slice(0, -1))
  }, [displayValue, error, isNewEntry])

  const toggleSign = useCallback(() => {
    if (error || displayValue === '0') return

    setDisplayValue((prev) => {
      if (prev.startsWith('-')) {
        return prev.slice(1)
      }
      return '-' + prev
    })
  }, [displayValue, error])

  const performCalculation = useCallback(
    async (op: OperationType, a: number, b: number): Promise<number | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await calculatorApi.calculate(op, a, b)
        return result
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao calcular'
        setError(message)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const setOperation = useCallback(
    async (op: OperationType) => {
      setError(null)
      const currentNumber = parseFloat(displayValue)

      if (Number.isNaN(currentNumber)) return

      // Encadeamento sequencial
      if (previousValue !== null && currentOperation !== null && !isNewEntry) {
        const intermediateResult = await performCalculation(
          currentOperation,
          previousValue,
          currentNumber,
        )

        if (intermediateResult !== null) {
          const formatted = formatNumber(intermediateResult)
          setDisplayValue(formatted)
          setPreviousValue(intermediateResult)
          setCurrentOperation(op)
          setExpression(`${formatted} ${OPERATIONS[op].symbol}`)
          setIsNewEntry(true)
        }
        return
      }

      setPreviousValue(currentNumber)
      setCurrentOperation(op)
      setExpression(`${displayValue} ${OPERATIONS[op].symbol}`)
      setIsNewEntry(true)
    },
    [displayValue, previousValue, currentOperation, isNewEntry, performCalculation],
  )

  const calculateResult = useCallback(async () => {
    if (currentOperation === null || previousValue === null) {
      return
    }

    const currentNumber = parseFloat(displayValue)
    if (Number.isNaN(currentNumber)) return

    const op = currentOperation
    const a = previousValue
    const b = currentNumber

    setExpression(`${formatNumber(a)} ${OPERATIONS[op].symbol} ${formatNumber(b)} =`)

    const result = await performCalculation(op, a, b)

    if (result !== null) {
      const formatted = formatNumber(result)
      setDisplayValue(formatted)
      setPreviousValue(null)
      setCurrentOperation(null)
      setIsNewEntry(true)
    }
  }, [currentOperation, previousValue, displayValue, performCalculation])

  return {
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
  }
}
