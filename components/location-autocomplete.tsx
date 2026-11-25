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
  source?: "built-in"|"geonames"|"manual";
  regionCode?: string;
  geonameId?: number;
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
  const {tr,locale}=useLanguage();
  const copy=locale==="hi"?{manual:"निर्देशांक स्वयं भरें",lat:"अक्षांश",lon:"देशांतर",offset:"जन्म के समय UTC अंतर (घंटे)",use:"स्थान की पुष्टि करें",cancel:"रद्द करें",error:"स्थान और सही निर्देशांक व समय अंतर भरें।",note:"सूची में जन्म स्थान न हो तो सही निर्देशांक भरें।"}:locale==="hinglish"?{manual:"Coordinates manually bharein",lat:"Latitude",lon:"Longitude",offset:"Janm ke samay UTC offset (hours)",use:"Location confirm karein",cancel:"Cancel",error:"Place, valid coordinates aur UTC offset bharein.",note:"Exact birth location ke liye confirmed coordinates use karein."}:{manual:"Enter coordinates manually",lat:"Latitude",lon:"Longitude",offset:"UTC offset at birth (hours)",use:"Confirm location",cancel:"Cancel",error:"Enter a place, valid coordinates and the correct UTC offset.",note:"If your birthplace is not listed, use confirmed coordinates and UTC offset."};
  const inputId = useId();
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);
  const selectedValue=useRef<string|null>(null);
  const [manual,setManual]=useState(false),[latitude,setLatitude]=useState(""),[longitude,setLongitude]=useState(""),[offset,setOffset]=useState(""),[manualError,setManualError]=useState(false);
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
    if (query.length < 2 || selectedValue.current===value || manual) {
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
  }, [value,manual]);

  function selectLocation(location: ResolvedLocation) {
    selectedValue.current=location.displayName;++requestId.current;setLoading(false);setManual(false);setManualError(false);
    onChange(location.displayName);
    onResolvedLocation(location);
    setSuggestions([]);
    setOpen(false);
  }

  function handleChange(next: string) {
    selectedValue.current=null;++requestId.current;
    onChange(next);
    onResolvedLocation(null);
    if (!manual&&next.trim().length>=2)setOpen(true);
  }

  function confirmManual(){
   const lat=Number(latitude),lon=Number(longitude),off=Number(offset);
   if(value.trim().length<2||value.trim().length>220||![latitude,longitude,offset].every(x=>x.trim()!=="")||!Number.isFinite(lat)||Math.abs(lat)>89||!Number.isFinite(lon)||Math.abs(lon)>180||!Number.isFinite(off)||off< -12||off>14||!Number.isInteger(off*60)){setManualError(true);return;}
   const mins=Math.abs(Math.round(off*60)),tz=(off<0?"-":"+")+String(Math.floor(mins/60)).padStart(2,"0")+":"+String(mins%60).padStart(2,"0");
   selectLocation({displayName:value.trim(),latitude:lat,longitude:lon,timezone:tz,timezoneOffset:off,source:"manual"});
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
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c98924]" />
        <input
          id={inputId}
          data-field={dataField}
          value={value}
          placeholder={placeholder ?? tr("searchLocationPlaceholder")}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => !manual&&selectedValue.current!==value&&value.trim().length>=2&&setOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-controls={open?listId:undefined}
          aria-activedescendant={open&&suggestions.length?listId+"-"+activeIndex:undefined}
          aria-required={required||undefined}
          aria-describedby={error?inputId+"-error":undefined}
          aria-autocomplete="list"
          aria-invalid={Boolean(error)}
          className={cn(
            "h-10 w-full rounded-lg border border-[rgba(255,255,255,0.50)] bg-[rgba(255,255,255,0.52)] px-9 text-sm text-[#17181d] outline-none transition placeholder:text-[#525866] focus-visible:border-[#c98924] focus-visible:ring-2 focus-visible:ring-[rgba(201,137,36,0.12)]",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {loading ? <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#c98924]" /> : null}
      </div>
      {error ? <p id={inputId+"-error"} role="alert" className="text-sm text-destructive">{error}</p> : null}
      {open ? (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-[9999] mt-1 max-h-72 overflow-y-auto rounded-lg p-1"
          style={{
            background: "rgba(255, 255, 255, 0.94)",
            backdropFilter: "blur(12px) saturate(135%)",
            border: "1px solid rgba(255, 255, 255, 0.65)",
            boxShadow: "0 18px 50px rgba(0, 0, 0, 0.15)"
          }}
        >
          {loading ? <p className="px-3 py-2 text-sm text-[#525866]">{tr("searchingLocations")}</p> : null}
          {!loading && suggestions.length === 0 ? <p className="px-3 py-2 text-sm text-[#525866]">{tr("noLocationsFound")}</p> : null}
          {!loading && suggestions.map((location, index) => (
            <button
              key={`${location.displayName}-${location.latitude}-${location.longitude}`}
              type="button"
              role="option"
              id={listId+"-"+index}
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectLocation(location)}
              className={cn(
                "flex w-full items-start gap-3 rounded-md px-3 py-2 text-left text-sm transition",
                index === activeIndex ? "bg-[rgba(201,137,36,0.08)] text-[#c98924] shadow-[inset_3px_0_0_#c98924]" : "text-[#525866] hover:bg-[rgba(201,137,36,0.04)] hover:text-[#17181d]"
              )}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#c98924]" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{location.displayName}</span>
                {location.source==="geonames"?<span className="mt-0.5 block text-xs text-[#525866]">{location.regionCode?location.regionCode+" · ":""}{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)} · {location.timezone}</span>:null}
                {[location.city, location.state, location.country].filter(Boolean).length ? (
                  <span className="mt-0.5 block text-xs text-[#525866]">{[location.city, location.state, location.country].filter(Boolean).join(", ")}</span>
                ) : null}
              </span>
              {index === activeIndex ? <Check className="mt-0.5 h-4 w-4 text-[#c98924]" /> : null}
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <button type="button" className="font-semibold underline" aria-expanded={manual} onClick={()=>{setManual(v=>!v);setOpen(false);setManualError(false);++requestId.current;setLoading(false);}}>{manual?copy.cancel:copy.manual}</button>
        <a href="https://www.geonames.org/" target="_blank" rel="noopener noreferrer" className="underline">GeoNames (CC BY 4.0)</a>
      </div>
      {manual?<div className="space-y-3 rounded-lg border border-[#ccbda6] bg-[#fff9ef] p-3 text-[#372630]">
        <p className="text-xs">{copy.note}</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <label className="text-xs font-medium">{copy.lat}<input type="number" step="any" min={-89} max={89} value={latitude} onChange={e=>setLatitude(e.target.value)} className="mt-1 w-full rounded border bg-white p-2 text-sm"/></label>
          <label className="text-xs font-medium">{copy.lon}<input type="number" step="any" min={-180} max={180} value={longitude} onChange={e=>setLongitude(e.target.value)} className="mt-1 w-full rounded border bg-white p-2 text-sm"/></label>
          <label className="text-xs font-medium">{copy.offset}<input type="number" step="any" min={-12} max={14} value={offset} onChange={e=>setOffset(e.target.value)} className="mt-1 w-full rounded border bg-white p-2 text-sm"/></label>
        </div>
        {manualError?<p role="alert" className="text-xs text-red-800">{copy.error}</p>:null}
        <button type="button" className="rounded border border-[#70283d] bg-white px-3 py-2 font-semibold" onClick={confirmManual}>{copy.use}</button>
      </div>:null}
    </div>
  );
}




