interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-3">{title}</h2>
        {children}

        <button
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
