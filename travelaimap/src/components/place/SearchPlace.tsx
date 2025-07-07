'use client';
import { useState, useEffect } from 'react';

interface SearchAndFilterProps {
  onSearch: (term: string) => void;
  onFilterChange: (filter: string) => void;
  filterOptions: { value: string; label: string }[];
  initialFilter?: string;
}

export default function SearchAndFilter({
  onSearch,
}: SearchAndFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  return (
    <div className="sticky top-0 bg-white z-10 p-4 border-b">
      <div className="mb-3">
        <input
          type="text"
          placeholder="Поиск мест..."
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
}