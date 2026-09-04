import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog.tsx'
import { Button } from './button.tsx'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  confirmText?: string
  confirmVariant?: 'default' | 'destructive'
  onConfirm?: () => void
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmText = 'Confirmar',
  confirmVariant = 'default',
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription className="mt-1 text-slate-500 leading-relaxed">{description}</DialogDescription>}
        </DialogHeader>
        <div className="mt-4 mb-2 text-sm leading-relaxed text-slate-700">
          {children}
        </div>
        <DialogFooter className="flex items-center justify-end gap-3 mt-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {onConfirm && (
            <Button variant={confirmVariant} onClick={onConfirm}>
              {confirmText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
