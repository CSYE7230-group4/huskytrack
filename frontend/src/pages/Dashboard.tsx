import { useState } from "react";
import SearchBar from "../components/ui/SearchBar";
import CategoryFilter from "../components/ui/CategoryFilter";
import EventCard from "../components/ui/EventCard";
import { events } from "../data/events";

import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";

import { useToast } from "../hooks/useToast";


export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showModal, setShowModal] = useState(false);

  // ✅ ADD THIS EXACTLY HERE
  const { showToast } = useToast();
  // ----------------------------------

  // FILTER LOGIC
  const filtered = events.filter((event) => {
    const matchesCategory =
      category === "All" || event.type.toLowerCase() === category.toLowerCase();

    const matchesSearch = event.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="px-6 py-8 space-y-8">

      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
        Welcome back 👋
      </h1>

      {/* Demo Toast Button */}
      <Button
        onClick={() =>
          showToast("success", "This is a toast notification!")
        }
        className="mt-2"
      >
        Show Demo Toast
      </Button>

      {/* Demo Modal Button */}
      <Button
        onClick={() => setShowModal(true)}
        className="mt-2"
      >
        Open Demo Modal
      </Button>

      {/* Search Input */}
      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Category Filter Tabs */}
      <CategoryFilter active={category} onSelect={setCategory} />

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* No Results UI */}
      {filtered.length === 0 && (
        <p className="text-sm text-gray-500 text-center pt-10">
          No events found matching your filters.
        </p>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Demo Modal"
      >
        <p className="text-gray-700">
          This is your reusable modal component.  
          You can now use it for event registration, confirmations, alerts, etc.
        </p>
      </Modal>

    </div>
  );
}
