import { useEffect, useMemo, useState } from "react";
import SearchBar from "../components/ui/SearchBar";
import EventCard, { EventDto } from "../components/ui/EventCard";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import CategoryFilter from "../components/ui/CategoryFilter";

import ViewToggle from "../components/events/ViewToggle";
import SortDropdown, { SortOption } from "../components/events/SortDropdown";
import EventFiltersSidebar, {
  FiltersState,
} from "../components/events/EventFiltersSidebar";
import useDebouncedValue from "../hooks/useDebouncedValue";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

type ViewMode = "grid" | "list";

interface EventsApiResponse {
  events: EventDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const PAGE_SIZE = 9;

export default function Events() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 400);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [filters, setFilters] = useState<FiltersState>({
    categories: [],
    dateFrom: undefined,
    dateTo: undefined,
    tags: [],
  });

  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [page, setPage] = useState(1);

  const [events, setEvents] = useState<EventDto[]>([]);
  const [pagination, setPagination] =
    useState<EventsApiResponse["pagination"] | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** FETCH EVENTS FROM BACKEND */
  useEffect(() => {
    const controller = new AbortController();

    async function fetchEvents() {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", PAGE_SIZE.toString());

        if (search.trim()) params.set("search", search.trim());

        if (selectedCategory !== "All") {
          params.set("category", selectedCategory.toLowerCase());
        }

        if (filters.dateFrom) params.set("startDate", filters.dateFrom);
        if (filters.dateTo) params.set("endDate", filters.dateTo);

        if (sortBy === "date") {
          params.set("sort", "startDate");
        }

        const res = await fetch(`/api/v1/events?${params.toString()}`, {
          signal: controller.signal,
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Failed to load events (${res.status})`);
        }

        const json = await res.json();

        const payload = json.data as EventsApiResponse;

        if (page === 1) {
          setEvents(payload.events || []);   // fresh load
        } else {
          setEvents((prev) => [...prev, ...(payload.events || [])]); // append
        }

        setPagination(payload.pagination || null);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Events fetch error", err);
        setError(err.message || "Something went wrong while loading events.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();

    return () => controller.abort();
  }, [
    page,
    search,
    selectedCategory,
    filters.dateFrom,
    filters.dateTo,
    sortBy,
  ]);
    // Infinite scroll trigger
  useInfiniteScroll(() => {
    if (!isLoading && pagination?.hasNextPage) {
      setPage((p) => p + 1);
    }
  });

  /** ALL TAGS EXTRACTED FROM EVENT LIST */
  const allTags = useMemo(() => {
    return Array.from(
      new Set(
        events
          .flatMap((e) => e.tags || [])
          .map((t) => t.trim())
          .filter(Boolean)
      )
    );
  }, [events]);

  /** CLIENT-SIDE FILTER + SORT */
  const filteredEvents = useMemo(() => {
    let result = [...events];

    if (filters.categories.length > 0) {
      result = result.filter((e) =>
        filters.categories.some(
          (cat) => e.category?.toLowerCase() === cat.toLowerCase()
        )
      );
    }

    if (filters.tags.length > 0) {
      result = result.filter((e) =>
        filters.tags.every((tag) => e.tags?.includes(tag))
      );
    }

    if (sortBy === "popularity") {
      result.sort(
        (a, b) =>
          (b.currentRegistrations ?? 0) - (a.currentRegistrations ?? 0)
      );
    } else if (sortBy === "capacity") {
      const remaining = (e: EventDto) =>
        (e.maxRegistrations ?? 0) - (e.currentRegistrations ?? 0);
      result.sort((a, b) => remaining(b) - remaining(a));
    } else if (sortBy === "date") {
      result.sort((a, b) => {
        const da = a.startDate ? +new Date(a.startDate) : 0;
        const db = b.startDate ? +new Date(b.startDate) : 0;
        return da - db;
      });
    }

    return result;
  }, [events, filters.categories, filters.tags, sortBy]);

  const currentPage = pagination?.currentPage ?? page;
  const totalPages = pagination?.totalPages ?? 1;
  const totalCount = pagination?.totalCount ?? filteredEvents.length;

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      dateFrom: undefined,
      dateTo: undefined,
      tags: [],
    });
    setSelectedCategory("All");
    setPage(1);
  };

  const handleCategoryPillSelect = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Explore Events</h1>
        <p className="text-gray-500 text-sm mt-1">
          Find workshops, cultural events, seminars and more.
        </p>
      </div>

      {/* Search + Sort + View Toggle */}
      <div className="flex flex-col gap-3 rounded-xl bg-white border border-gray-200 shadow-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md">
          <SearchBar
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <SortDropdown value={sortBy} onChange={setSortBy} />
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Category Pills */}
      <CategoryFilter
        active={selectedCategory}
        onSelect={handleCategoryPillSelect}
      />

      {/* Main Layout */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-64 lg:flex-none">
          <EventFiltersSidebar
            value={filters}
            availableTags={allTags}
            onChange={setFilters}
            onClear={handleClearFilters}
          />
        </div>

        {/* Right: Results */}
        <div className="flex-1">

          {/* Summary */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
            <span>
              Showing <span className="font-medium">{filteredEvents.length}</span>{" "}
              events
            </span>
            <span className="hidden sm:inline">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  : "space-y-3"
              }
            >
              {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
                <Skeleton key={idx} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
              <p className="text-sm font-semibold text-gray-800">
                No events match your search or filters
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Try changing your filters or keywords.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleClearFilters}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              {/* Cards */}
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    : "space-y-3"
                }
              >
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    variant={viewMode}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
