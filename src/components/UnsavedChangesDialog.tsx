'use client'

interface UnsavedChangesDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  message?: string
}

export default function UnsavedChangesDialog({
  isOpen,
  onConfirm,
  onCancel,
  message = 'You have unsaved changes. Are you sure you want to close?',
}: UnsavedChangesDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unsaved Changes</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Keep Editing
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  )
}
