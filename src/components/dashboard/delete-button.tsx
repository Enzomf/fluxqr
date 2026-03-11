'use client'

import { DeleteDialog } from '@/components/qr-management/delete-dialog'

interface DeleteButtonProps {
  id: string
  label: string
  onDelete: (id: string) => Promise<{ error?: string }>
}

export function DeleteButton({ id, label, onDelete }: DeleteButtonProps) {
  return <DeleteDialog id={id} label={label} onDelete={onDelete} />
}
