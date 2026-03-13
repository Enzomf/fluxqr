'use client'

import { createQrCode, updateQrCode } from '@/app/dashboard/qr-actions'
import type { QrCodeWithImage } from '@/components/dashboard/qr-list-row'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { QrForm } from './qr-form'
import { QrTypeSelect } from './qr-type-select'

interface QrFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qr?: QrCodeWithImage | null
  verifiedPhone: string | null
  onEditSuccess?: (id: string) => void
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      form="qr-form"
      disabled={pending}
      className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium"
    >
      {pending ? (label === 'Save Changes' ? 'Saving...' : 'Creating...') : label}
    </Button>
  )
}

export function QrFormDialog({
  open,
  onOpenChange,
  qr,
  verifiedPhone,
  onEditSuccess,
}: QrFormDialogProps) {
  const isEdit = !!qr

  const getInitialStep = () => (isEdit ? 'form' : 'grid') as 'grid' | 'form'
  const getInitialQrType = () =>
    isEdit ? (qr!.default_message ? 'custom' : 'default') : ('default' as 'default' | 'custom')

  const [step, setStep] = useState<'grid' | 'form'>(getInitialStep())
  const [qrType, setQrType] = useState<'default' | 'custom'>(getInitialQrType())

  function handleOpenChange(next: boolean) {
    if (!next) {
      // Reset state on close
      setStep(isEdit ? 'form' : 'grid')
      setQrType(isEdit ? (qr!.default_message ? 'custom' : 'default') : 'default')
    }
    onOpenChange(next)
  }

  const handleSuccess = useCallback((id?: string) => {
    onOpenChange(false)
    if (isEdit && onEditSuccess && id) {
      onEditSuccess(id)
    }
  }, [onOpenChange, isEdit, onEditSuccess])

  const action = isEdit ? updateQrCode.bind(null, qr!.id) : createQrCode

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg flex flex-col max-h-[85dvh] overflow-hidden p-0 gap-0"
      >
        {/* Fixed header */}
        <div className="flex-shrink-0 bg-background border-b border-border px-6 py-4 rounded-t-xl flex items-center gap-3">
          {/* Back arrow: only on Step 2 of create flow (not edit) */}
          {step === 'form' && !isEdit && (
            <button
              type="button"
              onClick={() => setStep('grid')}
              className="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Back to QR type selection"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <DialogTitle className="flex-1">
            {isEdit ? `Edit: ${qr!.label}` : 'New QR Code'}
          </DialogTitle>
          {/* Close button on the right */}
          <DialogClose
            className="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Close dialog"
          >
            <X size={16} />
          </DialogClose>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          {step === 'grid' && (
            <QrTypeSelect
              onSelect={(type) => {
                setQrType(type)
                setStep('form')
              }}
            />
          )}
          {step === 'form' && (
            <>
              <QrForm
                key={open ? (qr?.id ?? 'create') : 'closed'}
                action={action}
                mode={isEdit ? 'edit' : 'create'}
                defaultValues={qr ?? undefined}
                qrType={qrType}
                verifiedPhone={verifiedPhone}
                onSuccess={handleSuccess}
              />
              <div className="pt-6 pb-2">
                <SubmitButton label={isEdit ? 'Save Changes' : 'Create QR Code'} />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
