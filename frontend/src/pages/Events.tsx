import { useEffect, useMemo, useState } from "react";
import { Filter, X } from "lucide-react";

import SearchBar from "../components/ui/SearchBar";
import EventCard, { EventDto } from "../components/ui/EventCard";
import CategoryFilter from "../components/ui/CategoryFilter";
import Skeleton from "../components/ui/Skeleton";

import ViewToggle from "../components/events/ViewToggle";
import SortDropdown, { SortOption } from "../components/events/SortDropdown";
import EventFiltersSidebar, {
  FiltersState,
} from "../components/events/EventFiltersSidebar";

import useDebouncedValue from "../hooks/useDebouncedValue";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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

  const [isFiltersOpen, setIsFiltersOpen] = useState(false); // Mobile drawer

  /** FETCH EVENTS */
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

        if (sortBy === "date") params.set("sort", "startDate");

        const res = await fetch(`/api/v1/events?${params.toString()}`, {
          signal: controller.signal,
          credentials: "include",
        });

        if (!res.ok) throw new Error(`Failed to load events (${res.status})`);

        const json = await res.json();
        const payload = json.data as EventsApiResponse;

        if (page === 1) setEvents(payload.events || []);
        else setEvents((prev) => [...prev, ...(payload.events || [])]);

        setPagination(payload.pagination || null);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load events.");
        }
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

  /** INFINITE SCROLL */
  useInfiniteScroll(() => {
    if (!isLoading && pagination?.hasNextPage) {
      setPage((p) => p + 1);
    }
  });

  /** TAGS EXTRACTED */
  const allTags = useMemo(
    () =>
      Array.from(
        new Set(
          events
            .flatMap((e) => e.tags || [])
            .map((t) => t.trim())
            .filter(Boolean)
        )
      ),
    [events]
  );

  /** CLIENT-SIDE FILTERS */
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // categories
    if (filters.categories.length > 0) {
      result = result.filter((e) =>
        filters.categories.some(
          (cat) => e.category?.toLowerCase() === cat.toLowerCase()
        )
      );
    }

    // tags
    if (filters.tags.length > 0) {
      result = result.filter((e) =>
        filters.tags.every((tag) => e.tags?.includes(tag))
      );
    }

    // sort
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
      result.sort(
        (a, b) =>
          (a.startDate ? +new Date(a.startDate) : 0) -
          (b.startDate ? +new Date(b.startDate) : 0)
      );
    }

    return result;
  }, [events, filters.categories, filters.tags, sortBy]);

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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER */}
      <div className="transition-all duration-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Explore Events</h1>
            <p className="text-sm text-gray-500 mt-1">
              Find workshops, cultural events, seminars and more.
            </p>
          </div>

          {/* CREATE EVENT BUTTON */}
          <Button
            variant="primary"
            onClick={() => navigate("/app/events/new")}
          >
            + Create Event
          </Button>
        </div>
      </div>

      {/* SEARCH + SORT + VIEW + MOBILE FILTER BUTTON */}
      <div className="flex flex-col gap-3 bg-white border border-gray-200 rounded-xl shadow-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md">
          <SearchBar
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          {/* MOBILE FILTER BUTTON */}
          <button
            onClick={() => setIsFiltersOpen(true)}
            className="sm:hidden inline-flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 rounded-lg text-xs"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>

          <SortDropdown value={sortBy} onChange={setSortBy} />
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      <CategoryFilter
        active={selectedCategory}
        onSelect={(c) => {
          setSelectedCategory(c);
          setPage(1);
        }}
      />

      {/* LAYOUT: SIDEBAR + RESULTS */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* SIDEBAR (DESKTOP) */}
        <div className="hidden lg:block lg:w-64">
          <EventFiltersSidebar
            value={filters}
            availableTags={allTags}
            onChange={setFilters}
            onClear={handleClearFilters}
          />
        </div>

        {/* RESULTS */}
        <div className="flex-1">
          {/* SUMMARY */}
          <div className="text-xs text-gray-600 mb-3 flex justify-between">
            <span>
              Showing <span className="font-medium">{filteredEvents.length}</span> events
            </span>
            {pagination && (
              <span className="hidden sm:inline">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 rounded-lg text-red-700 text-xs mb-3">
              {error}
            </div>
          )}

          {/* RESULTS / EMPTY / LOADING */}
          {isLoading && page === 1 ? (
            <div
              className={`${
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-3"
              }`}
            >
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center bg-gray-50 border border-dashed border-gray-300 rounded-xl px-6 py-10">
              <p className="font-semibold text-sm text-gray-800">
                No events match your filters
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Try changing keywords or categories.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div
                key={viewMode}
                className={`${
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-3"
                }`}
              >
                {filteredEvents.map((event) => (
                  <EventCard key={event._id} event={event} variant={viewMode} />
                ))}
              </div>

              {/* Infinite scroll skeleton */}
              {isLoading && page > 1 && (
                <div className="mt-4">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-28 w-full rounded-xl mb-3" />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {isFiltersOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsFiltersOpen(false)}
          />

          {/* PANEL */}
          <div className="relative ml-auto bg-white w-80 h-full shadow-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-sm text-gray-900">Filters</h2>
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="p-1 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto h-full">
              <EventFiltersSidebar
                value={filters}
                availableTags={allTags}
                onChange={setFilters}
                onClear={handleClearFilters}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
