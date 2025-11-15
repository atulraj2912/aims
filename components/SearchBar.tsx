'use client';

import { useState } from 'react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className={`flex items-center bg-white/10 backdrop-blur-sm rounded-lg border transition-all ${
        isFocused ? 'border-white/40 shadow-lg' : 'border-white/20'
      }`}>
        <span className="pl-4 text-xl">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search SKUs, items, orders..."
          className="bg-transparent text-white placeholder-gray-300 px-4 py-3 outline-none w-80"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="pr-4 text-gray-300 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>
    </form>
  );
}
