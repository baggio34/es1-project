import React from 'react'

interface DisplayProps {
  expression: string
  value: string
  error: string | null
  isLoading: boolean
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  value,
  error,
  isLoading,
}) => {
  // Ajuste visual do tamanho da fonte para valores longos
  const getFontSizeClass = (text: string): string => {
    const len = text.length
    if (len > 13) return 'font-size-sm'
    if (len > 9) return 'font-size-md'
    return 'font-size-lg'
  }

  const displayContent = error ?? value

  return (
    <div className="calculator-display" role="region" aria-label="Visor da Calculadora">
      <div className="display-expression" aria-hidden="true">
        {expression || '\u00A0'}
      </div>
      <div className="display-main-row">
        {isLoading && (
          <span className="display-spinner" title="Processando cálculo no backend...">
            <span className="spinner-dot"></span>
          </span>
        )}
        <div
          className={`display-value ${error ? 'display-error' : ''} ${getFontSizeClass(displayContent)}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {displayContent}
        </div>
      </div>
    </div>
  )
}
