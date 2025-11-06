"use client";
import { createContext, useState } from "react";

type TSearchContext = {
  searchQuery: string;
  onChangeSearchQuery: (newSearchValue: string) => void;
};

export const SearchContext = createContext<TSearchContext | null>(null);

export default function SearchContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const handleChangeSearchQuery = (newSearchValue: string) => {
    setSearchQuery(newSearchValue);
  };
  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        onChangeSearchQuery: handleChangeSearchQuery,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}
