import React, { useState } from 'react'
import type { LicenseDetailed } from '../../../../sdk/src/models/license.ts'
import { useLicense } from '../../view_models/useLicense.ts'
import { LicenseListPage } from './LicenseListPage.tsx'
import { LicenseFormPage } from './LicenseFormPage.tsx'

export const LicensesPage: React.FC = () => {
  const { createLicense, updateLicense } = useLicense()
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editing, setEditing] = useState<LicenseDetailed | null>(null)

  const goToList = () => {
    setView('list')
    setEditing(null)
  }

  const handleSave = async (data: { name: string }) => {
    if (editing) await updateLicense(editing.id, data)
    else await createLicense(data)
    goToList()
  }

  if (view === 'form') {
    return <LicenseFormPage initialLicense={editing} onSave={handleSave} onCancel={goToList} />
  }

  return (
    <LicenseListPage/>
  )
}