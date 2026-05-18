"use client";

import { useEffect, useId, useRef, useState } from "react";
import type React from "react";
import { Check, Loader2, MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

export type ResolvedLocation = {
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  timezoneOffset?: number;
};

type LocationAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onResolvedLocation: (location: ResolvedLocation | null) => void;
  error?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  dataField?: string;
};

export function LocationAutocomplete({
  value,
  onChange,
  onResolvedLocation,
  error,
  placeholder,
  label,
  required,
  dataField
}: LocationAutocompleteProps) {
  const { tr } = useLanguage();
  const inputId = useId();
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);
  const [suggestions, setSuggestions] = useState<ResolvedLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    const query = value.trim();
    const currentRequest = ++requestId.current;
    if (query.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`, { headers: { Accept: "application/json" } });
        const json = await response.json();
        if (currentRequest !== requestId.current) return;
        const next = Array.isArray(json.data?.suggestions) ? json.data.suggestions as ResolvedLocation[] : [];
        setSuggestions(next);
        setActiveIndex(0);
        setOpen(true);
      } catch {
        if (currentRequest === requestId.current) {
          setSuggestions([]);
          setOpen(true);
        }
      } finally {
        if (currentRequest === requestId.current) setLoading(false);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [value]);

  function selectLocation(location: ResolvedLocation) {
    onChange(location.displayName);
    onResolvedLocation(location);
    setSuggestions([]);
    setOpen(false);
  }

  function handleChange(next: string) {
    onChange(next);
    onResolvedLocation(null);
    if (next.trim().length >= 2) setOpen(true);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || !suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
    }
    if (event.key === "Enter") {
      event.preventDefault();
      selectLocation(suggestions[activeIndex]);
    }
  }

  return (
    <div ref={wrapperRef} className={cn("relative space-y-2 overflow-visible", open && "z-[9999]")}>
      {label ? (
        <Label htmlFor={inputId}>
          {label}
          {required ? <span className="ml-1 text-[#FF4D4F]">*</span> : null}
        </Label>
      ) : null}
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FFD36A]/80" />
        <input
          id={inputId}
          data-field={dataField}
          value={value}
          placeholder={placeholder ?? tr("searchLocationPlaceholder")}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => value.trim().length >= 2 && setOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={Boolean(error)}
          className={cn(
            "h-10 w-full rounded-md border border-[#F5C542]/25 bg-[#12051f]/80 px-9 text-sm text-[#FFF7E8] outline-none ring-offset-background transition placeholder:text-[#BFAFD9]/75 focus-visible:border-[#FFD36A]/70 focus-visible:ring-2 focus-visible:ring-[#A855F7]/35 focus-visible:ring-offset-2",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {loading ? <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#FFD36A]" /> : null}
      </div>
      {error ? <p className="text-sm text-[#FF4D4F]">{error}</p> : null}
      {open ? (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-[9999] mt-1 max-h-72 overflow-y-auto rounded-lg border border-[#F5C542]/30 bg-[#12051f]/98 p-1 shadow-[0_22px_70px_rgba(5,2,14,0.78),0_0_34px_rgba(126,72,255,0.22)] backdrop-blur-xl"
        >
          {loading ? <p className="px-3 py-2 text-sm naksh-muted-text">{tr("searchingLocations")}</p> : null}
          {!loading && suggestions.length === 0 ? <p className="px-3 py-2 text-sm naksh-muted-text">{tr("noLocationsFound")}</p> : null}
          {!loading && suggestions.map((location, index) => (
            <button
              key={`${location.displayName}-${location.latitude}-${location.longitude}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectLocation(location)}
              className={cn(
                "flex w-full items-start gap-3 rounded-md px-3 py-2 text-left text-sm transition",
                index === activeIndex ? "bg-[#F5C542]/10 text-[#FFD36A] shadow-[inset_3px_0_0_rgba(245,190,88,0.82)]" : "naksh-muted-text hover:bg-[#F5C542]/10 hover:text-[#FFF7E8]"
              )}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FFD36A]" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{location.displayName}</span>
                {[location.city, location.state, location.country].filter(Boolean).length ? (
                  <span className="mt-0.5 block text-xs naksh-muted-text">{[location.city, location.state, location.country].filter(Boolean).join(", ")}</span>
                ) : null}
              </span>
              {index === activeIndex ? <Check className="mt-0.5 h-4 w-4 text-[#FFD36A]" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}




