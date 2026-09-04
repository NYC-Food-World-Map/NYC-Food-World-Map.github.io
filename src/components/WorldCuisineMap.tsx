"use client";

import { geoContains, geoEqualEarth, geoPath } from "d3-geo";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { Topology } from "topojson-specification";
import { numericIdToAlpha2 } from "@/lib/iso-numeric-map";
import type { Country } from "@/types/restaurant";
import worldAtlas from "@/data/world-countries-110m.json";

type WorldCuisineMapProps = {
  countries: Country[];
  highlightedCodes: ReadonlySet<string>;
  restaurantCounts: Record<string, number>;
  selectedCode?: string;
  focusNonce?: number;
  onSelect: (code: string) => void;
};

type MapTooltip = {
  label: string;
  x: number;
  y: number;
};

type CountryFeature = Feature<Geometry, { name?: string }> & {
  id?: string | number;
};

type Transform = { k: number; x: number; y: number };

const MIN_ZOOM = 1;
const MAX_ZOOM = 16;
const MAX_FOCUS_ZOOM = 7.5;
const DRAG_THRESHOLD = 10;
const IDENTITY: Transform = { k: 1, x: 0, y: 0 };

function countryCodeFromTarget(target: EventTarget | null): string | undefined {
  if (!(target instanceof Element)) return undefined;
  return target.closest("[data-code]")?.getAttribute("data-code") ?? undefined;
}

function featureAlpha2(geo: CountryFeature): string | undefined {
  return numericIdToAlpha2(geo.id);
}

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

function zoomAt(
  transform: Transform,
  cursorX: number,
  cursorY: number,
  nextK: number,
): Transform {
  const k = clampZoom(nextK);
  const scale = k / transform.k;
  return {
    k,
    x: cursorX - (cursorX - transform.x) * scale,
    y: cursorY - (cursorY - transform.y) * scale,
  };
}

function pointerDistance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function transformToFit(
  bounds: [[number, number], [number, number]],
  size: { width: number; height: number },
): Transform | null {
  const [[x0, y0], [x1, y1]] = bounds;
  if (![x0, y0, x1, y1].every(Number.isFinite)) return null;
  const width = Math.max(x1 - x0, 6);
  const height = Math.max(y1 - y0, 6);
  const padX = Math.min(64, size.width * 0.12);
  const padY = Math.min(64, size.height * 0.12);
  const k = clampZoom(
    Math.min(
      (size.width - padX * 2) / width,
      (size.height - padY * 2) / height,
    ) * 0.88,
  );
  const focusK = Math.min(k, MAX_FOCUS_ZOOM);
  return {
    k: focusK,
    x: size.width / 2 - ((x0 + x1) / 2) * focusK,
    y: size.height / 2 - ((y0 + y1) / 2) * focusK,
  };
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function WorldCuisineMap({
  countries,
  highlightedCodes,
  restaurantCounts,
  selectedCode,
  focusNonce = 0,
  onSelect,
}: WorldCuisineMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const transformRef = useRef<Transform>(IDENTITY);
  const sizeRef = useRef({ width: 0, height: 0 });
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{
    distance: number;
    midpoint: { x: number; y: number };
    transform: Transform;
  } | null>(null);
  const dragMovedRef = useRef(false);
  const pointerStartRef = useRef<{
    x: number;
    y: number;
    lastX: number;
    lastY: number;
    code?: string;
  } | null>(null);
  const selectedByPointerRef = useRef(false);
  const flyRafRef = useRef<number | null>(null);
  const flyToSelectedRef = useRef<() => void>(() => {});
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [userTransform, setUserTransform] = useState<Transform | null>(null);
  const [tooltip, setTooltip] = useState<MapTooltip | null>(null);
  const ready = size.width >= 32 && size.height >= 32;
  const transform = userTransform ?? IDENTITY;

  const cancelFly = useCallback(() => {
    if (flyRafRef.current !== null) {
      cancelAnimationFrame(flyRafRef.current);
      flyRafRef.current = null;
    }
  }, []);

  const setMapTransform = useCallback((next: Transform) => {
    transformRef.current = next;
    setUserTransform(next);
  }, []);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const applySize = (width: number, height: number) => {
      if (width < 32 || height < 32) return;
      const previous = sizeRef.current;
      if (
        Math.abs(previous.width - width) < 2 &&
        Math.abs(previous.height - height) < 2
      ) {
        return;
      }
      sizeRef.current = { width, height };
      setSize({ width, height });
      transformRef.current = IDENTITY;
      setUserTransform(null);
    };
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      applySize(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(node);
    const rect = node.getBoundingClientRect();
    applySize(rect.width, rect.height);
    return () => observer.disconnect();
  }, []);

  const included = useMemo(
    () => new Map(countries.map((country) => [country.code, country])),
    [countries],
  );

  const collection = useMemo(() => {
    const topology = worldAtlas as unknown as Topology;
    const object =
      topology.objects.countries ?? Object.values(topology.objects)[0];
    return feature(topology, object) as unknown as FeatureCollection<
      Geometry,
      { name?: string }
    >;
  }, []);

  const projection = useMemo(() => {
    if (!ready) return geoEqualEarth();
    return geoEqualEarth().fitExtent(
      [
        [12, 20],
        [size.width - 12, size.height - 20],
      ],
      collection,
    );
  }, [collection, ready, size.height, size.width]);

  const path = useMemo(() => geoPath(projection), [projection]);

  const clientToSvg = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const viewWidth = Number(svg.viewBox.baseVal.width) || rect.width;
    const viewHeight = Number(svg.viewBox.baseVal.height) || rect.height;
    return {
      x: ((clientX - rect.left) / rect.width) * viewWidth,
      y: ((clientY - rect.top) / rect.height) * viewHeight,
    };
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      cancelFly();
      const point = clientToSvg(event.clientX, event.clientY);
      const factor = event.deltaY < 0 ? 1.14 : 1 / 1.14;
      setMapTransform(
        zoomAt(
          transformRef.current,
          point.x,
          point.y,
          transformRef.current.k * factor,
        ),
      );
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [cancelFly, clientToSvg, setMapTransform]);

  const hitTestRef = useRef<(clientX: number, clientY: number) => string | undefined>(
    () => undefined,
  );
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      code: countryCodeFromTarget(event.target),
    };
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    dragMovedRef.current = false;
    selectedByPointerRef.current = false;
    if (pointersRef.current.size === 2) {
      const [first, second] = [...pointersRef.current.values()];
      if (first && second) {
        pinchRef.current = {
          distance: pointerDistance(first, second),
          midpoint: {
            x: (first.x + second.x) / 2,
            y: (first.y + second.y) / 2,
          },
          transform: transformRef.current,
        };
      }
    }
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    const previous = pointersRef.current.get(event.pointerId);
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const [first, second] = [...pointersRef.current.values()];
      if (!first || !second) return;
      const distance = pointerDistance(first, second);
      if (pinchRef.current.distance < 8) return;
      const mid = clientToSvg(
        (first.x + second.x) / 2,
        (first.y + second.y) / 2,
      );
      const nextK =
        pinchRef.current.transform.k * (distance / pinchRef.current.distance);
      cancelFly();
      setMapTransform(zoomAt(pinchRef.current.transform, mid.x, mid.y, nextK));
      dragMovedRef.current = true;
      setTooltip(null);
      return;
    }

    const start = pointerStartRef.current;
    if (!previous || !start || event.buttons === 0) return;
    const dist = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    if (!dragMovedRef.current) {
      if (dist <= DRAG_THRESHOLD) {
        start.lastX = event.clientX;
        start.lastY = event.clientY;
        return;
      }
      dragMovedRef.current = true;
      cancelFly();
      setTooltip(null);
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const dx =
      ((event.clientX - start.lastX) / rect.width) *
      (Number(svg.viewBox.baseVal.width) || rect.width);
    const dy =
      ((event.clientY - start.lastY) / rect.height) *
      (Number(svg.viewBox.baseVal.height) || rect.height);
    start.lastX = event.clientX;
    start.lastY = event.clientY;
    const current = transformRef.current;
    setMapTransform({ k: current.k, x: current.x + dx, y: current.y + dy });
  };

  const endPointer = (event: React.PointerEvent<SVGSVGElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (pointersRef.current.size === 0) {
      pointerStartRef.current = null;
      window.setTimeout(() => {
        dragMovedRef.current = false;
      }, 0);
    }
  };

  const onPointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    endPointer(event);
  };

  const onPointerCancel = (event: React.PointerEvent<SVGSVGElement>) => {
    endPointer(event);
  };

  const zoomTowardCenter = (factor: number) => {
    setMapTransform(
      zoomAt(
        transformRef.current,
        size.width / 2,
        size.height / 2,
        transformRef.current.k * factor,
      ),
    );
  };

  const orderedFeatures = useMemo(() => {
    return collection.features.map((geo, index) => {
      const code = featureAlpha2(geo as CountryFeature);
      return { geo, index, code, key: code ?? `idle-${index}` };
    });
  }, [collection.features]);

  hitTestRef.current = (clientX, clientY) => {
    const point = clientToSvg(clientX, clientY);
    const t = transformRef.current;
    const x = (point.x - t.x) / t.k;
    const y = (point.y - t.y) / t.k;
    const lonlat = projection.invert?.([x, y]);
    if (!lonlat || !Number.isFinite(lonlat[0]) || !Number.isFinite(lonlat[1])) {
      return undefined;
    }
    for (const item of orderedFeatures) {
      if (!item.code || !included.has(item.code)) continue;
      if (geoContains(item.geo, lonlat)) return item.code;
    }
    return undefined;
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !ready) return;
    const onNativePointerUp = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (dragMovedRef.current) return;
      const code = hitTestRef.current(event.clientX, event.clientY);
      if (!code) return;
      selectedByPointerRef.current = true;
      onSelectRef.current(code);
    };
    svg.addEventListener("pointerup", onNativePointerUp, true);
    return () => svg.removeEventListener("pointerup", onNativePointerUp, true);
  }, [ready]);

  const paintedFeatures = useMemo(() => {
    return [...orderedFeatures].sort((a, b) => {
      const rank = (item: (typeof orderedFeatures)[number]) =>
        item.code && item.code === selectedCode ? 1 : 0;
      return rank(a) - rank(b);
    });
  }, [orderedFeatures, selectedCode]);

  flyToSelectedRef.current = () => {
    if (!selectedCode || !ready) return;
    const item = orderedFeatures.find((feature) => feature.code === selectedCode);
    if (!item) return;
    const next = transformToFit(path.bounds(item.geo), size);
    if (!next) return;
    const from = transformRef.current;
    cancelFly();
    if (prefersReducedMotion()) {
      setMapTransform(next);
      return;
    }
    const start = performance.now();
    const duration = 560;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - (1 - t) ** 3;
      setMapTransform({
        k: from.k + (next.k - from.k) * e,
        x: from.x + (next.x - from.x) * e,
        y: from.y + (next.y - from.y) * e,
      });
      if (t < 1) {
        flyRafRef.current = requestAnimationFrame(step);
      } else {
        flyRafRef.current = null;
      }
    };
    flyRafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    if (!focusNonce) return;
    flyToSelectedRef.current();
  }, [focusNonce]);

  useEffect(() => () => cancelFly(), [cancelFly]);

  const updateTooltip = (
    event: React.PointerEvent<SVGPathElement>,
    tooltipLabel: string,
  ) => {
    if (pointersRef.current.size > 0 || dragMovedRef.current) {
      setTooltip(null);
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      label: tooltipLabel,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  return (
    <div ref={containerRef} className="relative h-full min-h-0 w-full">
      {ready ? (
        <svg
          ref={svgRef}
          role="img"
          aria-label="世界地图，可缩放、拖动，点击国家查看餐厅"
          viewBox={`0 0 ${size.width} ${size.height}`}
          className="h-full w-full touch-none select-none overflow-visible"
          style={{
            cursor: pointersRef.current.size ? "grabbing" : "grab",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onPointerLeave={() => setTooltip(null)}
          onClick={(event) => {
            if (dragMovedRef.current) return;
            if (selectedByPointerRef.current) {
              selectedByPointerRef.current = false;
              return;
            }
            const code = hitTestRef.current(event.clientX, event.clientY);
            if (code) onSelectRef.current(code);
          }}
        >
          <rect
            width={size.width}
            height={size.height}
            fill="var(--map-bg)"
            pointerEvents="none"
          />
          <g
            transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}
          >
            {paintedFeatures.map(({ geo, index, code, key }) => {
              const country = code ? included.get(code) : undefined;
              const includedCountry = Boolean(country);
              const highlighted = country
                ? highlightedCodes.has(country.code)
                : false;
              const hasRestaurants = country
                ? (restaurantCounts[country.code] ?? 0) > 0
                : false;
              const selected = country?.code === selectedCode;
              const pathD = path(geo) ?? undefined;
              const count = country ? (restaurantCounts[country.code] ?? 0) : 0;
              const label = country
                ? `${country.nameZh}，${count} 家推荐餐厅`
                : geo.properties?.name ?? "未收录国家";

              const fill = selected
                ? "var(--map-selected)"
                : includedCountry && highlighted
                  ? hasRestaurants
                    ? "var(--map-has)"
                    : "var(--map-empty)"
                  : "var(--map-idle)";

              const className = [
                "map-country",
                includedCountry ? "cursor-pointer" : "",
                selected ? "is-selected" : "",
                includedCountry
                  ? "outline-none focus-visible:stroke-[color:var(--accent)] focus-visible:stroke-2"
                  : "",
              ]
                .filter(Boolean)
                .join(" ");

              const tooltipLabel = country
                ? `${country.flag} ${label}`
                : label;

              const raiseCountry = (
                event: React.PointerEvent<SVGPathElement>,
              ) => {
                if (pointersRef.current.size > 0 || dragMovedRef.current) return;
                updateTooltip(event, tooltipLabel);
              };

              const common = {
                d: pathD,
                fill,
                stroke: selected ? "var(--accent)" : "var(--map-stroke)",
                strokeWidth: selected ? 1.6 : 0.4,
                vectorEffect: "non-scaling-stroke" as const,
                className,
                onPointerEnter: raiseCountry,
                onPointerMove: (event: React.PointerEvent<SVGPathElement>) =>
                  updateTooltip(event, tooltipLabel),
              };

              if (!includedCountry) {
                return (
                  <path key={key} {...common} tabIndex={-1}>
                    <title>{label}</title>
                  </path>
                );
              }

              return (
                <path
                  key={country?.code ?? index}
                  {...common}
                  data-code={country?.code}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selected}
                  aria-label={label}
                  onClick={(event) => {
                    if (dragMovedRef.current) return;
                    if (selectedByPointerRef.current) {
                      selectedByPointerRef.current = false;
                      return;
                    }
                    const code =
                      hitTestRef.current(event.clientX, event.clientY) ??
                      country?.code;
                    if (code) onSelectRef.current(code);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      if (country) onSelect(country.code);
                    }
                  }}
                />
              );
            })}
          </g>
        </svg>
      ) : null}
      {tooltip ? (
        <div
          role="tooltip"
          className="map-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.label}
        </div>
      ) : null}
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex flex-col gap-2">
        <div className="pointer-events-auto flex overflow-hidden rounded-xl bg-[color:var(--card)]/90 shadow-sm ring-1 ring-[color:var(--line)] backdrop-blur">
          <button
            type="button"
            aria-label="放大地图"
            className="min-h-11 min-w-11 text-xl font-semibold"
            onClick={() => {
              cancelFly();
              zoomTowardCenter(1.25);
            }}
          >
            +
          </button>
          <button
            type="button"
            aria-label="缩小地图"
            className="min-h-11 min-w-11 border-x border-[color:var(--line)] text-xl font-semibold"
            onClick={() => {
              cancelFly();
              zoomTowardCenter(1 / 1.25);
            }}
          >
            −
          </button>
          <button
            type="button"
            aria-label="重置地图缩放"
            className="min-h-11 px-3 text-sm font-medium"
            onClick={() => {
              cancelFly();
              transformRef.current = IDENTITY;
              setUserTransform(null);
            }}
          >
            复位
          </button>
        </div>
        <p className="pointer-events-none flex flex-wrap gap-x-3 gap-y-1 rounded-xl bg-[color:var(--card)]/80 px-3 py-2 text-xs text-[color:var(--muted)] shadow-sm ring-1 ring-[color:var(--line)] backdrop-blur">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[color:var(--map-has)]" />
            有推荐餐厅
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[color:var(--map-empty)]" />
            暂无餐厅
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[color:var(--map-idle)] ring-1 ring-[color:var(--line)]" />
            未筛选
          </span>
        </p>
      </div>
    </div>
  );
}
