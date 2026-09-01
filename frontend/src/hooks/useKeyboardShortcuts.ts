import { useEffect } from 'react'
import type { OperationType } from '../types/calculator'

interface CalculatorActions {
  inputDigit: (digit: string) => void
  inputDecimal: () => void
  setOperation: (op: OperationType) => void
  calculateResult: () => void
  clearAll: () => void
  backspace: () => void
}

export function useKeyboardShortcuts(actions: CalculatorActions, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorar se o foco estiver em um input de texto ou textarea
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return
      }

      const key = event.key

      // Números 0 a 9
      if (/^[0-9]$/.test(key)) {
        event.preventDefault()
        actions.inputDigit(key)
        return
      }

      // Ponto ou vírgula decimal
      if (key === '.' || key === ',') {
        event.preventDefault()
        actions.inputDecimal()
        return
      }

      // Operações
      if (key === '+') {
        event.preventDefault()
        actions.setOperation('add')
        return
      }

      if (key === '-') {
        event.preventDefault()
        actions.setOperation('subtract')
        return
      }

      if (key === '*' || key === 'x' || key === 'X') {
        event.preventDefault()
        actions.setOperation('multiply')
        return
      }

      if (key === '/') {
        event.preventDefault()
        actions.setOperation('divide')
        return
      }

      // Igualdade / Execução
      if (key === 'Enter' || key === '=') {
        event.preventDefault()
        actions.calculateResult()
        return
      }

      // Apagar dígito
      if (key === 'Backspace') {
        event.preventDefault()
        actions.backspace()
        return
      }

      // Limpar tudo
      if (key === 'Escape' || key.toLowerCase() === 'c') {
        event.preventDefault()
        actions.clearAll()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [actions, enabled])
}
