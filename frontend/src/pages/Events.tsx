import { useState } from "react";
import SearchBar from "../components/ui/SearchBar";
import CategoryFilter from "../components/ui/CategoryFilter";
import EventCard from "../components/ui/EventCard";
import { events } from "../data/events";

export default function Events() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = events.filter((event) => {
    const matchesCategory =
      category === "All" ||
      event.type.toLowerCase() === category.toLowerCase();

    const matchesSearch = event.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="px-6 py-8 space-y-8">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Explore Events
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Find workshops, cultural events, seminars and more.
        </p>
      </div>

      {/* SEARCH */}
      <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />

      {/* CATEGORY FILTER */}
      <CategoryFilter active={category} onSelect={setCategory} />

      {/* EVENTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* NO RESULTS */}
      {filtered.length === 0 && (
        <p className="text-center text-sm text-gray-500 pt-10">
          No events found. Try adjusting your search or filters.
        </p>
      )}
    </div>
  );
}
