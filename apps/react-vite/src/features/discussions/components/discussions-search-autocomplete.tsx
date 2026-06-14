import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/utils/cn';

import { useDiscussions } from '../api/get-discussions';

export const DiscussionsSearchAutocomplete = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get('q') || '',
  );
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [debouncedValue, setDebouncedValue] = useState(searchValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const shouldFetchSuggestions = debouncedValue && debouncedValue.length >= 2;

  const suggestionsQuery = useDiscussions({
    q: shouldFetchSuggestions ? debouncedValue : undefined,
    page: 1,
  });

  const suggestions =
    shouldFetchSuggestions && suggestionsQuery.data?.data
      ? suggestionsQuery.data.data
      : [];
  const isLoading = shouldFetchSuggestions && suggestionsQuery.isLoading;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    if (
      shouldFetchSuggestions &&
      suggestions.length > 0 &&
      !suggestionsQuery.isLoading
    ) {
      setIsOpen(true);
    } else if (!shouldFetchSuggestions || suggestionsQuery.isLoading) {
      setIsOpen(false);
    }
  }, [
    shouldFetchSuggestions,
    suggestions.length,
    suggestionsQuery.isLoading,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    const trimmedQuery = query.trim();
    const newParams = new URLSearchParams(searchParams);
    if (trimmedQuery) {
      newParams.set('q', trimmedQuery);
    } else {
      newParams.delete('q');
    }
    newParams.delete('page');
    setSearchParams(newParams);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchValue);
  };

  const handleClear = () => {
    setSearchValue('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    newParams.delete('page');
    setSearchParams(newParams);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          const selectedTitle = suggestions[highlightedIndex].title;
          setSearchValue(selectedTitle);
          handleSearch(selectedTitle);
        } else {
          handleSearch(searchValue);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (title: string) => {
    setSearchValue(title);
    handleSearch(title);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (debouncedValue && suggestions.length > 0) {
                  setIsOpen(true);
                }
              }}
              placeholder="Search discussions..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent py-1 pl-9 pr-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Search discussions"
              aria-expanded={isOpen}
              aria-controls="search-suggestions"
              aria-autocomplete="list"
              role="combobox"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {isOpen && (
            <div
              ref={dropdownRef}
              id="search-suggestions"
              className="absolute top-full z-50 mt-1 w-full rounded-md border border-input bg-popover shadow-md"
              role="listbox"
            >
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Spinner size="sm" />
                </div>
              ) : suggestions.length > 0 ? (
                <ul className="max-h-[300px] overflow-y-auto py-1">
                  {suggestions.slice(0, 5).map((discussion, index) => (
                    <li
                      key={discussion.id}
                      role="option"
                      aria-selected={index === highlightedIndex}
                      className={cn(
                        'cursor-pointer px-3 py-2 text-sm transition-colors',
                        index === highlightedIndex
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-accent/50',
                      )}
                      onClick={() => handleSuggestionClick(discussion.title)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div className="font-medium">{discussion.title}</div>
                      {discussion.body && (
                        <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {discussion.body}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No suggestions found
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Submit search"
        >
          Search
        </button>

        {searchParams.get('q') && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </form>
    </div>
  );
};
