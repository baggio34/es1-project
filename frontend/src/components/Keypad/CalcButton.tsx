import React from 'react'

export type ButtonVariant = 'number' | 'operator' | 'action' | 'equals'

interface CalcButtonProps {
  label: React.ReactNode
  onClick: () => void
  variant?: ButtonVariant
  isActive?: boolean
  disabled?: boolean
  span?: number
  ariaLabel?: string
  shortcut?: string
}

export const CalcButton: React.FC<CalcButtonProps> = ({
  label,
  onClick,
  variant = 'number',
  isActive = false,
  disabled = false,
  span = 1,
  ariaLabel,
  shortcut,
}) => {
  const spanClass = span > 1 ? `btn-span-${span}` : ''
  const activeClass = isActive ? 'btn-active' : ''

  return (
    <button
      type="button"
      className={`calc-btn calc-btn-${variant} ${spanClass} ${activeClass}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={shortcut ? `Atalho: ${shortcut}` : undefined}
    >
      <span className="btn-content">{label}</span>
      {shortcut && <span className="btn-shortcut">{shortcut}</span>}
    </button>
  )
}
