'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapPin, Navigation, ExternalLink, ZoomIn, ZoomOut, Maximize2, Layers, Compass, Check } from 'lucide-react';
import { Location } from '@/types';

interface LocationDistributionMapProps {
  locations: Location[];
  onSelectLocation?: (location: Location) => void;
  selectedLocationId?: string | null;
  heightClass?: string;
  isPickerMode?: boolean;
  onPickCoordinates?: (lat: number, lng: number) => void;
  pickedCoordinates?: { lat: number; lng: number } | null;
}

declare global {
  interface Window {
    L: any;
  }
}

export function LocationDistributionMap({
  locations,
  onSelectLocation,
  selectedLocationId,
  heightClass = 'h-[380px] sm:h-[480px]',
  isPickerMode = false,
  onPickCoordinates,
  pickedCoordinates,
}: LocationDistributionMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const pickerMarkerRef = useRef<any>(null);

  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null);
  const [activeFilterCity, setActiveFilterCity] = useState<string>('Semua');

  // Load Leaflet CSS & JS dynamically
  useEffect(() => {
    let isMounted = true;

    // Check if Leaflet CSS is already injected
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Check if Leaflet JS is available
    if (window.L) {
      if (isMounted) setIsLeafletReady(true);
      return;
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.crossOrigin = '';
      script.async = true;
      script.onload = () => {
        if (isMounted) setIsLeafletReady(true);
      };
      script.onerror = () => {
        console.warn('Failed to load Leaflet from CDN, using interactive vector fallback.');
      };
      document.body.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (window.L) {
          clearInterval(interval);
          if (isMounted) setIsLeafletReady(true);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter locations by city if active
  const filteredLocations = useMemo(() => {
    if (activeFilterCity === 'Semua') return locations;
    return locations.filter((loc) => (loc.city || '').toLowerCase().includes(activeFilterCity.toLowerCase()));
  }, [locations, activeFilterCity]);

  // Extract unique cities with coordinates
  const cities = useMemo(() => {
    const list: string[] = [];
    locations.forEach((loc) => {
      if (loc.city && !list.includes(loc.city)) {
        list.push(loc.city);
      }
    });
    return list;
  }, [locations]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!isLeafletReady || !mapContainerRef.current || !window.L) return;

    const L = window.L;

    // Initialize map if not yet created
    if (!mapInstanceRef.current) {
      const defaultCenter: [number, number] = [-6.175392, 106.827153]; // Jakarta Pusat
      const defaultZoom = 6;

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Attribution bottom-right
      L.control
        .attribution({
          position: 'bottomright',
          prefix: '<span class="text-[9px] text-slate-400">SIMA Maps &middot; OpenStreetMap</span>',
        })
        .addTo(map);

      // Click event for Picker Mode
      map.on('click', (e: any) => {
        if (onPickCoordinates) {
          onPickCoordinates(e.latlng.lat, e.latlng.lng);
        }
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m: any) => map.removeLayer(m));
    markersRef.current = {};

    const bounds = L.latLngBounds([]);
    let hasCoords = false;

    // Add markers for locations
    filteredLocations.forEach((loc) => {
      if (loc.latitude !== undefined && loc.longitude !== undefined) {
        hasCoords = true;
        const latLng = [loc.latitude, loc.longitude];
        bounds.extend(latLng);

        const isSelected = selectedLocationId === loc.id;
        const assetCount = loc.count || 0;

        // Custom HTML Marker Icon
        const markerHtml = `
          <div class="relative group cursor-pointer flex flex-col items-center -translate-x-1/2 -translate-y-full">
            <!-- Pulsing outer ring -->
            <div class="absolute -top-1 w-10 h-10 rounded-full ${
              isSelected ? 'bg-indigo-500/40 animate-ping' : 'bg-blue-500/20'
            }"></div>
            
            <!-- Pin Badge -->
            <div class="relative z-10 px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 border-2 ${
              isSelected
                ? 'bg-indigo-600 border-white text-white ring-4 ring-indigo-500/30'
                : 'bg-slate-900 border-white text-white hover:bg-blue-600'
            } transition-all duration-200">
              <span class="w-2 h-2 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-emerald-400'}"></span>
              <span class="text-[11px] font-black tracking-tight whitespace-nowrap">${loc.name}</span>
              <span class="text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-white/20 text-white' : 'bg-blue-500 text-white'
              }">
                ${assetCount}
              </span>
            </div>

            <!-- Pin pointer stem -->
            <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${
              isSelected ? 'border-t-indigo-600' : 'border-t-slate-900 group-hover:border-t-blue-600'
            } -mt-0.5 shadow-sm"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-map-pin',
          iconSize: [0, 0],
          iconAnchor: [0, 0],
          popupAnchor: [0, -38],
        });

        const marker = L.marker(latLng, { icon: customIcon }).addTo(map);

        // Rich Popup
        const popupContent = document.createElement('div');
        popupContent.className = 'p-3 text-slate-800 text-xs min-w-[220px] font-sans';
        popupContent.innerHTML = `
          <div class="border-b border-slate-100 pb-2 mb-2">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                ${loc.city || 'Titik Lokasi'}
              </span>
              <span class="text-[9px] font-mono text-slate-400 font-semibold">
                ${loc.id}
              </span>
            </div>
            <h4 class="font-black text-sm text-slate-900 mt-1">${loc.name}</h4>
          </div>

          <div class="space-y-1.5 mb-3 text-slate-600">
            <p class="text-[11px] leading-snug">
              📍 ${loc.address || loc.description || 'Lokasi operasional terdaftar'}
            </p>
            <div class="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
              <span class="bg-slate-100 px-1.5 py-0.5 rounded">${loc.latitude?.toFixed(5)}, ${loc.longitude?.toFixed(5)}</span>
            </div>
          </div>

          <div class="flex items-center justify-between bg-slate-50 p-2 rounded-lg mb-2.5 border border-slate-100">
            <span class="text-[10px] font-semibold text-slate-500">Jumlah Aset:</span>
            <span class="text-xs font-black text-blue-600">${assetCount} Unit</span>
          </div>

          <div class="flex items-center gap-1.5 pt-1">
            <a 
              href="https://www.google.com/maps?q=${loc.latitude},${loc.longitude}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1 transition-colors"
            >
              <span>Google Maps</span>
              <span>↗</span>
            </a>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: true,
          offset: L.point(0, -32),
        });

        marker.on('click', () => {
          setSelectedLoc(loc);
          if (onSelectLocation) onSelectLocation(loc);
        });

        markersRef.current[loc.id] = marker;
      }
    });

    // Picker Mode Marker
    if (isPickerMode && pickedCoordinates && pickedCoordinates.lat && pickedCoordinates.lng) {
      const pickerLatLng = [pickedCoordinates.lat, pickedCoordinates.lng];
      if (!pickerMarkerRef.current) {
        const pickerHtml = `
          <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-full animate-bounce">
            <div class="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-black shadow-xl border-2 border-white flex items-center gap-1">
              <span>📍 Titik Terpilih</span>
            </div>
            <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-rose-600 -mt-0.5"></div>
          </div>
        `;
        const pickerIcon = L.divIcon({
          html: pickerHtml,
          className: 'picker-pin',
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
        pickerMarkerRef.current = L.marker(pickerLatLng, {
          icon: pickerIcon,
          draggable: true,
        }).addTo(map);

        pickerMarkerRef.current.on('dragend', (e: any) => {
          const pos = e.target.getLatLng();
          if (onPickCoordinates) {
            onPickCoordinates(pos.lat, pos.lng);
          }
        });
      } else {
        pickerMarkerRef.current.setLatLng(pickerLatLng);
      }
    } else if (pickerMarkerRef.current) {
      map.removeLayer(pickerMarkerRef.current);
      pickerMarkerRef.current = null;
    }

    // Auto fit bounds
    if (hasCoords && bounds.isValid() && !isPickerMode) {
      map.fitBounds(bounds.pad(0.18));
    }
  }, [isLeafletReady, filteredLocations, selectedLocationId, isPickerMode, pickedCoordinates, onPickCoordinates, onSelectLocation]);

  // Focus map when selectedLocationId prop changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocationId || !window.L) return;
    const loc = locations.find((l) => l.id === selectedLocationId);
    if (loc && loc.latitude !== undefined && loc.longitude !== undefined) {
      mapInstanceRef.current.flyTo([loc.latitude, loc.longitude], 14, {
        duration: 1.2,
      });
      const marker = markersRef.current[loc.id];
      if (marker) {
        setTimeout(() => {
          marker.openPopup();
        }, 800);
      }
    }
  }, [selectedLocationId, locations]);

  // Map control buttons
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetBounds = () => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;
    const bounds = L.latLngBounds([]);
    let hasValid = false;
    filteredLocations.forEach((loc) => {
      if (loc.latitude !== undefined && loc.longitude !== undefined) {
        bounds.extend([loc.latitude, loc.longitude]);
        hasValid = true;
      }
    });
    if (hasValid && bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds.pad(0.18));
    }
  };

  const totalMapped = useMemo(() => {
    return locations.filter((l) => l.latitude !== undefined && l.longitude !== undefined).length;
  }, [locations]);

  const totalAssetsMapped = useMemo(() => {
    return locations
      .filter((l) => l.latitude !== undefined && l.longitude !== undefined)
      .reduce((acc, curr) => acc + (curr.count || 0), 0);
  }, [locations]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white">
      {/* Map Header Toolbar */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Peta Visual Sebaran Lokasi Aset</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live OpenStreetMap
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              {totalMapped} titik koordinat terdaftar &middot; {totalAssetsMapped} unit aset terpetakan di seluruh cabang
            </p>
          </div>
        </div>

        {/* Filter by City & Reset */}
        <div className="flex items-center gap-2">
          {cities.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto max-w-[280px] sm:max-w-none">
              <button
                type="button"
                onClick={() => setActiveFilterCity('Semua')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  activeFilterCity === 'Semua'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Semua ({locations.length})
              </button>
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setActiveFilterCity(city)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    activeFilterCity === city
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleResetBounds}
            className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            title="Reset tampilan peta ke seluruh titik lokasi"
          >
            <Navigation className="w-3 h-3 text-blue-600" />
            <span className="hidden sm:inline">Pusatkan</span>
          </button>
        </div>
      </div>

      {/* Map Container Viewport */}
      <div className={`relative w-full ${heightClass} bg-slate-100`}>
        {/* Real Leaflet Map */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Zoom Controls */}
        <div className="absolute right-4 bottom-4 z-10 flex flex-col gap-1.5 shadow-md rounded-xl overflow-hidden bg-white/95 backdrop-blur-xs border border-slate-200">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Perbesar"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200" />
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Perkecil"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Legend / Quick Summary */}
        <div className="absolute left-4 bottom-4 z-10 hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl border border-slate-200 shadow-md text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-700">Titik Aktif</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 text-[11px]">Klik pin lokasi untuk membuka rincian aset</span>
        </div>

        {/* Fallback Vector Graphic if Leaflet is loading */}
        {!isLeafletReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 z-20 gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-600">Memuat Peta Sebaran Interaktif...</span>
          </div>
        )}
      </div>
    </div>
  );
}
