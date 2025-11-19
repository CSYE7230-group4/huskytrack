import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import Spinner from "../components/ui/Spinner";
import Skeleton from "../components/ui/Skeleton";
import { useState } from "react";

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      <Card>
        <p className="text-gray-700 mb-3">Component Testing Section</p>

        <Button onClick={() => setOpen(true)}>Open Modal</Button>

        <Button
          variant="secondary"
          className="ml-3"
          onClick={() => setToast("This is a toast message!")}
        >
          Show Toast
        </Button>

        <div className="mt-4 flex gap-4 items-center">
          <Spinner />
          <Skeleton className="w-32 h-6" />
        </div>
      </Card>

      {open && (
        <Modal open={open} onClose={() => setOpen(false)} title="Modal Title">
          <p>This is a modal content test.</p>
        </Modal>
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
