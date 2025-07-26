interface DeleteModalProps {
  isOpen: boolean;
  bookingType: string;
  time: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function DeleteModal({
  isOpen,
  bookingType,
  time,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="bg-white rounded-lg p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-dialog-title" className="text-lg font-bold mb-4 text-center">
          Delete Booking
        </h3>
        <p className="text-md font-semibold">Are you sure you want to delete?</p>
        <p className="mt-3 ml-3 text">
          Booking Type: {bookingType === "onboarding" ? "Onboarding" : "Follow-Up"}
        </p>
        <p className="mt-1 mb-6 ml-3">Time Slot: {time}</p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 flex-1 rounded bg-gray-300 hover:bg-gray-400 cursor-pointer"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 flex-1 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
