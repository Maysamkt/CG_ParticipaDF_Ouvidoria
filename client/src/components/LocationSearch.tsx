import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface LocationResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    municipality?: string;
    town?: string;
    village?: string;
    county?: string;
    road?: string;
    suburb?: string;
  };
}

interface LocationSearchProps {
  value?: string;
  onLocationSelect: (location: LocationResult) => void;
  placeholder?: string;
}

export function LocationSearch({
  value = "",
  onLocationSelect,
  placeholder = "Digite o endereço ou local...",
}: LocationSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Update search term when external value changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const searchLocations = async () => {
      const term = searchTerm.trim();
      if (term.length < 3) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        // search with addressdetails for hierarchical data
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(
            term + " Brasil DF"
          )}&limit=5`
        );

        const data = await response.json();
        const features = Array.isArray(data?.features) ? data.features : [];

        const mapped: LocationResult[] = features.map((f: any) => ({
          place_id: String(
            f?.properties?.osm_id ?? f?.properties?.id ?? crypto.randomUUID()
          ),
          display_name: [
            f?.properties?.name,
            f?.properties?.street,
            f?.properties?.city,
            f?.properties?.state,
            f?.properties?.country,
          ]
            .filter(Boolean)
            .join(", "),
          lat: String(f?.geometry?.coordinates?.[1] ?? ""),
          lon: String(f?.geometry?.coordinates?.[0] ?? ""),
          address: {
            city: f?.properties?.city,
            state: f?.properties?.state,
            country: f?.properties?.country,
            suburb: f?.properties?.district,
            road: f?.properties?.street,
            county: f?.properties?.county,
          },
        }));

        setResults(mapped);
        setShowResults(mapped.length > 0);
      } catch (error) {
        console.error("Location search error:", error);
        setResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchLocations, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelect = (result: LocationResult) => {
    onLocationSelect(result);
    setSearchTerm(result.display_name);
    setShowResults(false);
  };

  return (
    <div className="relative">
      <Input
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        onFocus={() => results.length > 0 && setShowResults(true)}
      />
      {isSearching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          Buscando...
        </div>
      )}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1">
          <Command className="border rounded-md shadow-lg bg-popover">
            <CommandList>
              <CommandEmpty>Nenhum resultado encontrado</CommandEmpty>
              <CommandGroup>
                {results.map(result => (
                  <CommandItem
                    key={result.place_id}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm">{result.display_name}</span>
                      {result.address && (
                        <span className="text-xs text-muted-foreground">
                          {[
                            result.address.city ||
                              result.address.municipality ||
                              result.address.town,
                            result.address.state,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}

export default LocationSearch;
