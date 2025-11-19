interface ToastProps {
  message: string;
}

export default function Toast({ message }: ToastProps) {
  return (
    <div className="fixed top-6 right-6 bg-blue-500 text-white px-4 py-2 rounded shadow-lg">
      {message}
    </div>
  );
}
