(function () {
  const data = window.STANDALONE_DATA;
  const countries = data.countries;
  const restaurants = data.restaurants;
  const worldAtlas = data.worldAtlas;
  const isoNumeric = data.isoNumeric;

  const REGIONS = [
    "欧洲",
    "非洲",
    "加勒比 / 拉美",
    "亚洲",
    "北美",
    "大洋洲",
  ];
  const BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];
  const CLASSIFICATION_LABEL = { specialist: "专门菜系", regional: "区域兼营" };
  const CLASSIFICATION_TIP = {
    specialist: "该餐厅专门提供该国家的菜系。",
    regional: "该餐厅提供该国家所在区域的菜系，其中部分菜品属于该国菜系。",
  };
  const CUISINE_TIER_LABEL = { niche: "小众菜系", mainstream: "大众菜系" };
  const STATUS_LABEL = {
    open: "营业中",
    unverified: "待核验",
    temporarily_closed: "暂时关闭",
    closed: "已关闭",
  };

  const ZOOM_STEP = 1.25;
  const DEFAULT_ZOOM = 1;

  const state = {
    page: "map",
    cuisineTier: "all",
    regions: [],
    countryCodes: [],
    boroughs: [],
    selectedCode: "",
    mapTransform: null,
    openMenu: null,
    menuQuery: "",
    panelExpanded: false,
  };

  let pendingFlyCode = null;
  let flyRaf = null;

  const countriesByCode = Object.fromEntries(
    countries.map((country) => [country.code, country]),
  );

  const latestVerified = restaurants.reduce((latest, restaurant) => {
    const value = restaurant.lastVerifiedAt || "";
    return value > latest ? value : latest;
  }, "");
  const verifiedEl = document.getElementById("site-verified");
  if (verifiedEl && latestVerified) {
    verifiedEl.textContent = `最后核验 ${latestVerified}`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isRecommendable(restaurant) {
    return restaurant.status === "open" || restaurant.status === "unverified";
  }

  function maxReviewCount(restaurant) {
    const counts = (restaurant.ratings || [])
      .map((rating) => rating.reviewCount)
      .filter((count) => typeof count === "number");
    return counts.length ? Math.max(...counts) : null;
  }

  function compareRestaurants(a, b) {
    const classRank = { specialist: 0, regional: 1 };
    const classDiff = classRank[a.classification] - classRank[b.classification];
    if (classDiff) return classDiff;
    if (isRecommendable(a) && isRecommendable(b)) {
      const statusRank = { open: 0, unverified: 1 };
      const statusDiff = statusRank[a.status] - statusRank[b.status];
      if (statusDiff) return statusDiff;
    }
    const aReviews = maxReviewCount(a);
    const bReviews = maxReviewCount(b);
    if (aReviews !== null && bReviews !== null && aReviews !== bReviews) {
      return bReviews - aReviews;
    }
    return a.name.localeCompare(b.name, "en");
  }

  function normalize(value) {
    return value.trim().toLowerCase();
  }

  function countryInScope(country) {
    if (state.cuisineTier !== "all" && country.cuisineTier !== state.cuisineTier) {
      return false;
    }
    if (state.regions.length && !state.regions.includes(country.region)) {
      return false;
    }
    if (state.countryCodes.length && !state.countryCodes.includes(country.code)) {
      return false;
    }
    return true;
  }

  function filteredCountries() {
    return countries.filter((country) => countryInScope(country));
  }

  function restaurantsForCountry(code, applyBoroughs = false) {
    return restaurants
      .filter((restaurant) => restaurant.countryCodes.includes(code))
      .filter(isRecommendable)
      .filter(
        (restaurant) =>
          !applyBoroughs ||
          !state.boroughs.length ||
          state.boroughs.includes(restaurant.borough),
      )
      .sort(compareRestaurants);
  }

  function mapsUrl(restaurant) {
    const query =
      typeof restaurant.latitude === "number" &&
      typeof restaurant.longitude === "number"
        ? `${restaurant.latitude},${restaurant.longitude}`
        : [restaurant.name, restaurant.address].filter(Boolean).join(" ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  function restaurantCard(restaurant) {
    const ratings = restaurant.ratings?.length
      ? `<p class="ratings">${restaurant.ratings
          .map(
            (rating) =>
              `${escapeHtml(rating.source)}：${escapeHtml(rating.score)}/${escapeHtml(rating.scale)}${
                typeof rating.reviewCount === "number"
                  ? `，${rating.reviewCount} 条评价`
                  : ""
              }`,
          )
          .join("<br>")}</p>`
      : `<p class="muted">暂无分平台评分。</p>`;
    const statusChip =
      restaurant.status && restaurant.status !== "unverified"
        ? `<span class="chip">${STATUS_LABEL[restaurant.status]}</span>`
        : "";
    return `
      <article class="card">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:.5rem">
          <h3>${escapeHtml(restaurant.name)}</h3>
          <div class="chips">
            <span class="chip chip-tip" tabindex="0" data-tip="${escapeHtml(CLASSIFICATION_TIP[restaurant.classification] || "")}">${CLASSIFICATION_LABEL[restaurant.classification]}</span>
            ${statusChip}
          </div>
        </div>
        <p class="muted">${[restaurant.borough, restaurant.neighborhood, restaurant.address]
          .filter((part) => part && part !== "待核验")
          .map(escapeHtml)
          .join(" · ")}</p>
        ${ratings}
        <a class="maps-btn" href="${mapsUrl(restaurant)}" target="_blank" rel="noopener noreferrer">在 Google 地图中查看</a>
      </article>
    `;
  }

  function emptyRestaurants() {
    return `<p class="muted">暂无可确认的专门餐厅<br>没有用相邻国家/地区菜系补足。</p>`;
  }

  function tierToggle() {
    const options = [
      { value: "niche", label: "小众" },
      { value: "all", label: "全部" },
      { value: "mainstream", label: "大众" },
    ];
    return `
      <div class="tier-toggle" role="group" aria-label="菜系筛选">
        ${options
          .map(
            (option) =>
              `<button type="button" data-tier="${option.value}" class="${
                state.cuisineTier === option.value ? "is-active" : ""
              }" aria-pressed="${state.cuisineTier === option.value}">${option.label}</button>`,
          )
          .join("")}
      </div>
    `;
  }

  function multiselect(key, label, options, selected, config = {}) {
    const open = state.openMenu === key;
    const chosen = options.filter((option) => selected.includes(option.value));
    const summary = !chosen.length
      ? config.emptyLabel || "全部"
      : chosen.length <= 2
        ? chosen.map((option) => option.short || option.label).join("、")
        : `已选 ${chosen.length} 项`;
    const needle = open ? normalize(state.menuQuery) : "";
    const list = needle
      ? options.filter((option) =>
          [option.label, option.value, option.keywords || ""]
            .map(normalize)
            .some((value) => value.includes(needle)),
        )
      : options;
    return `
      <div class="multiselect${open ? " is-open" : ""}" data-ms="${key}">
        <span class="ms-label">${escapeHtml(label)}</span>
        <button type="button" class="ms-toggle" data-ms-toggle="${key}" aria-expanded="${open}">
          <span class="ms-summary${chosen.length ? " is-active" : ""}">${escapeHtml(summary)}</span>
          <span class="ms-caret" aria-hidden="true">▾</span>
        </button>
        <div class="ms-menu"${open ? "" : " hidden"}>
          ${
            config.searchable
              ? `<input type="text" class="ms-search" data-ms-search value="${escapeHtml(state.menuQuery)}" placeholder="${escapeHtml(config.searchPlaceholder || "搜索")}">`
              : ""
          }
          <div class="ms-actions">
            <span class="ms-count">${chosen.length ? `已选 ${chosen.length} 项` : "未筛选"}</span>
            <button type="button" data-ms-clear="${key}"${chosen.length ? "" : " disabled"}>清空</button>
          </div>
          <ul class="ms-options">
            ${
              list.length
                ? list
                    .map(
                      (option) =>
                        `<li><label><input type="checkbox" data-ms-option="${key}" value="${escapeHtml(option.value)}"${
                          selected.includes(option.value) ? " checked" : ""
                        }><span>${escapeHtml(option.label)}</span>${
                          option.meta ? `<em>${escapeHtml(option.meta)}</em>` : ""
                        }</label></li>`,
                    )
                    .join("")
                : `<li class="ms-empty">无匹配结果</li>`
            }
          </ul>
        </div>
      </div>
    `;
  }

  function regionOptions() {
    return REGIONS.map((region) => ({
      value: region,
      label: region,
      meta: `${countries.filter((country) => country.region === region).length} 个`,
    }));
  }

  function countryOptionList() {
    const counts = restaurantCounts();
    return countries
      .filter((country) =>
        state.regions.length ? state.regions.includes(country.region) : true,
      )
      .filter((country) =>
        state.cuisineTier === "all" ? true : country.cuisineTier === state.cuisineTier,
      )
      .slice()
      .sort((a, b) => a.nameZh.localeCompare(b.nameZh, "zh"))
      .map((country) => ({
        value: country.code,
        label: `${country.flag} ${country.nameZh}`,
        short: country.nameZh,
        keywords: `${country.nameEn} ${country.code}`,
        meta: `${counts[country.code] || 0} 家`,
      }));
  }

  function boroughOptions() {
    const recommendable = restaurants.filter(isRecommendable);
    return BOROUGHS.map((borough) => ({
      value: borough,
      label: borough,
      meta: `${recommendable.filter((item) => item.borough === borough).length} 家`,
    }));
  }

  function mapFilterFields() {
    return `
      <div class="filter-field">
        <span class="ms-label">小众 / 全部 / 大众</span>
        ${tierToggle()}
      </div>
      <div class="filter-field">
        ${multiselect("regions", "大洲", regionOptions(), state.regions, {
          emptyLabel: "全部大洲",
        })}
      </div>
      <div class="filter-field">
        ${multiselect("countryCodes", "国家/地区", countryOptionList(), state.countryCodes, {
          emptyLabel: "全部国家/地区",
          searchable: true,
          searchPlaceholder: "搜索国家/地区",
        })}
      </div>
    `;
  }

  function boroughFilter() {
    return `
      <div class="filter-field">
        ${multiselect("boroughs", "街区", boroughOptions(), state.boroughs, {
          emptyLabel: "全部街区",
        })}
      </div>
    `;
  }

  function numericIdToAlpha2(id) {
    if (id === undefined || id === null) return undefined;
    const numeric = String(id).replace(/\D/g, "");
    if (!numeric) return undefined;
    return isoNumeric[numeric.padStart(3, "0")];
  }

  function visibleCountries() {
    return filteredCountries();
  }

  function restaurantCounts() {
    const counts = {};
    for (const country of countries) {
      counts[country.code] = restaurantsForCountry(country.code).length;
    }
    return counts;
  }

  function renderMapSvg(visible, selectedCode, counts, width, height) {
    const topology = worldAtlas;
    const object = topology.objects.countries || Object.values(topology.objects)[0];
    const collection = topojson.feature(topology, object);
    const { w, h } = viewSize(width, height);
    const projection = d3
      .geoEqualEarth()
      .fitExtent(
        [
          [12, 20],
          [w - 12, h - 20],
        ],
        collection,
      );
    const path = d3.geoPath(projection);
    const included = new Map(countries.map((country) => [country.code, country]));
    const visibleCodes = new Set(visible.map((country) => country.code));
    const filterActive =
      state.cuisineTier !== "all" ||
      state.regions.length > 0 ||
      state.countryCodes.length > 0;
    const t = state.mapTransform || baseTransform(w, h);
    const paths = collection.features
      .map((geo) => {
        const code = numericIdToAlpha2(geo.id);
        const country = code ? included.get(code) : undefined;
        const inFilter = Boolean(country && visibleCodes.has(country.code));
        const count = country ? counts[country.code] || 0 : 0;
        const selected = inFilter && country.code === selectedCode;
        const fill = inFilter
          ? count > 0
            ? "var(--map-has)"
            : "var(--map-empty)"
          : filterActive
            ? "var(--map-idle)"
            : "var(--map-empty)";
        const label = inFilter
          ? `${country.nameZh}，${count} 家推荐餐厅`
          : country
            ? country.nameZh
            : geo.properties?.name || "未收录国家/地区";
        const d = path(geo) || "";
        const klass = `map-country${inFilter ? " is-clickable" : ""}${selected ? " is-selected" : ""}`;
        const attrs = inFilter
          ? `role="button" tabindex="0" class="${klass}" data-code="${country.code}" aria-pressed="${selected ? "true" : "false"}" aria-label="${escapeHtml(label)}"`
          : `class="${klass}" tabindex="-1"`;
        return {
          selected,
          html: `<path d="${d}" fill="${fill}" stroke="var(--map-stroke)" stroke-width="0.4" vector-effect="non-scaling-stroke" ${attrs}><title>${escapeHtml(label)}</title></path>`,
        };
      })
      .sort((a, b) => Number(a.selected) - Number(b.selected))
      .map((item) => item.html)
      .join("");
    return `
        <svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="世界地图，可缩放、拖动，点击国家/地区查看餐厅">
          <rect width="${w}" height="${h}" fill="var(--map-bg)" pointer-events="none"></rect>
          <g id="map-zoom" transform="translate(${t.x} ${t.y}) scale(${t.k})">${paths}</g>
        </svg>
    `;
  }

  function viewSize(width, height) {
    return { w: Math.max(320, width || 800), h: Math.max(240, height || 420) };
  }

  function baseTransform(w, h) {
    return zoomAt({ k: 1, x: 0, y: 0 }, w / 2, h / 2, DEFAULT_ZOOM);
  }

  function paintMap() {
    const stage = document.querySelector(".map-stage");
    if (!stage) return;
    const visible = visibleCountries();
    const counts = restaurantCounts();
    if (!state.mapTransform) {
      const { w, h } = viewSize(stage.clientWidth, stage.clientHeight);
      state.mapTransform = baseTransform(w, h);
    }
    stage.innerHTML = renderMapSvg(
      visible,
      state.selectedCode,
      counts,
      stage.clientWidth,
      stage.clientHeight,
    );
    if (pendingFlyCode) {
      const pathEl = stage.querySelector(`path[data-code="${pendingFlyCode}"]`);
      pendingFlyCode = null;
      if (pathEl) flyToPath(pathEl);
    }
  }

  function applyMapTransform() {
    const group = document.getElementById("map-zoom");
    if (!group) return;
    const t = state.mapTransform;
    group.setAttribute("transform", `translate(${t.x} ${t.y}) scale(${t.k})`);
  }

  function cancelFly() {
    if (flyRaf) {
      cancelAnimationFrame(flyRaf);
      flyRaf = null;
    }
  }

  function animateMapTransform(next) {
    const from = { ...state.mapTransform };
    cancelFly();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      state.mapTransform = next;
      applyMapTransform();
      return;
    }
    const start = performance.now();
    const duration = 560;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - (1 - t) ** 3;
      state.mapTransform = {
        k: from.k + (next.k - from.k) * e,
        x: from.x + (next.x - from.x) * e,
        y: from.y + (next.y - from.y) * e,
      };
      applyMapTransform();
      if (t < 1) flyRaf = requestAnimationFrame(step);
      else flyRaf = null;
    };
    flyRaf = requestAnimationFrame(step);
  }

  function flyToPath(pathEl) {
    const svg = pathEl.ownerSVGElement;
    if (!svg) return;
    const bbox = pathEl.getBBox();
    const view = svg.viewBox.baseVal;
    const w = Math.max(bbox.width, 6);
    const h = Math.max(bbox.height, 6);
    const padX = Math.min(64, view.width * 0.12);
    const padY = Math.min(64, view.height * 0.12);
    const k = Math.min(
      7.5,
      Math.max(
        1,
        Math.min((view.width - padX * 2) / w, (view.height - padY * 2) / h) * 0.88,
      ),
    );
    animateMapTransform({
      k,
      x: view.width / 2 - (bbox.x + bbox.width / 2) * k,
      y: view.height / 2 - (bbox.y + bbox.height / 2) * k,
    });
  }

  function clientToSvg(svg, clientX, clientY) {
    const rect = svg.getBoundingClientRect();
    const view = svg.viewBox.baseVal;
    return {
      x: ((clientX - rect.left) / rect.width) * view.width,
      y: ((clientY - rect.top) / rect.height) * view.height,
    };
  }

  function zoomAt(transform, cursorX, cursorY, nextK) {
    const k = Math.min(16, Math.max(1, nextK));
    const scale = k / transform.k;
    return {
      k,
      x: cursorX - (cursorX - transform.x) * scale,
      y: cursorY - (cursorY - transform.y) * scale,
    };
  }

  function expandIcon() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.75" y="5" width="16.5" height="14" rx="2.25" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9.25 5v14" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`;
  }

  function collapseIcon() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.75" y="5" width="16.5" height="14" rx="2.25" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M14.75 5v14" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`;
  }

  function countryPanel(country, list, expanded) {
    if (expanded) {
      return `
        <section class="panel">
          <header class="list-country-head">
            <h2>${country.flag} ${escapeHtml(country.nameZh)} <span class="muted">${escapeHtml(country.nameEn)}</span></h2>
            <p class="muted">${CUISINE_TIER_LABEL[country.cuisineTier]} · ${escapeHtml(country.region)} · ${list.length} 家推荐</p>
          </header>
          <div class="stack">${list.length ? list.map(restaurantCard).join("") : emptyRestaurants()}</div>
        </section>
      `;
    }
    return `
      <section class="panel-country${country.code === state.selectedCode ? " is-selected" : ""}">
        <header class="panel-country-head">
          <h2>${country.flag} ${escapeHtml(country.nameZh)}</h2>
          <p class="muted">${escapeHtml(country.nameEn)} · ${CUISINE_TIER_LABEL[country.cuisineTier]} · ${escapeHtml(country.region)} · ${list.length} 家</p>
        </header>
        <div class="stack">${list.length ? list.map(restaurantCard).join("") : emptyRestaurants()}</div>
      </section>
    `;
  }

  function panelItems(visible) {
    const source =
      !state.panelExpanded && state.selectedCode
        ? [countriesByCode[state.selectedCode]].filter(Boolean)
        : visible;
    const lists = new Map(
      source.map((country) => [
        country.code,
        restaurantsForCountry(country.code, true),
      ]),
    );
    const ordered = source.slice().sort((a, b) => {
      if (a.code === state.selectedCode) return -1;
      if (b.code === state.selectedCode) return 1;
      const aCount = lists.get(a.code)?.length || 0;
      const bCount = lists.get(b.code)?.length || 0;
      if (aCount !== bCount) return bCount - aCount;
      return a.nameZh.localeCompare(b.nameZh, "zh");
    });
    return ordered.map((country) => ({
      country,
      list: lists.get(country.code) || [],
    }));
  }

  function renderMapPanel(visible) {
    const expanded = state.panelExpanded;
    const items = panelItems(visible);
    const nonempty = items.filter((item) => item.list.length > 0);
    const emptyCount = items.length - nonempty.length;
    const total = nonempty.reduce((sum, item) => sum + item.list.length, 0);
    const countryCount = items.length;
    const summary = countryCount
      ? `<p class="panel-summary">${state.selectedCode && !expanded ? "已选" : "当前"} ${countryCount} 个国家/地区 · ${total} 家餐厅${
          emptyCount ? ` · ${emptyCount} 个暂无餐厅` : ""
        }</p>`
      : "";
    const body = countryCount
      ? nonempty.length
        ? nonempty.map((item) => countryPanel(item.country, item.list, expanded)).join("")
        : emptyRestaurants()
      : `<div class="panel-empty"><h2>没有匹配的国家/地区</h2><p class="muted">试试放宽左上角的筛选条件。</p></div>`;
    const emptySection =
      expanded && emptyCount && countryCount <= 24
        ? `<section class="panel" style="margin-top:1.25rem">
            <h2>暂无已确认餐厅 <span class="muted">${emptyCount} 个国家/地区</span></h2>
            <p class="muted">当前街区筛选下没有可推荐餐厅。</p>
            <ul class="empty-grid">${items
              .filter((item) => item.list.length === 0)
              .map(
                (item) =>
                  `<li class="card"><p><strong>${item.country.flag} ${escapeHtml(item.country.nameZh)}</strong> <span class="muted">${escapeHtml(item.country.nameEn)}</span></p><p class="muted">暂无可确认的专门餐厅</p></li>`,
              )
              .join("")}</ul>
          </section>`
        : "";
    return `
      <div class="map-panel-inner${expanded ? " is-expanded-layout" : ""}">
        <div class="panel-toolbar">
          <button type="button" class="panel-icon-btn" data-toggle-panel aria-label="${expanded ? "收起" : "展开"}" title="${expanded ? "收起" : "展开"}">
            ${expanded ? collapseIcon() : expandIcon()}
          </button>
        </div>
        ${
          expanded
            ? `<form class="filters expanded-filters" onsubmit="return false">${mapFilterFields()}${boroughFilter()}</form>`
            : boroughFilter()
        }
        ${summary}
        <div class="panel-body">
          <div class="stack">${body}</div>
          ${emptySection}
        </div>
      </div>
    `;
  }

  function renderMap() {
    const visible = visibleCountries();
    return `
      <div class="map-page${state.panelExpanded ? " is-expanded" : ""}">
        <div class="map-main">
          <div class="map-stage" aria-hidden="false"></div>
          <div id="map-tooltip" class="map-tooltip" hidden></div>
          ${
            state.panelExpanded
              ? ""
              : `<div class="map-overlay-controls">
            <div class="filter-row">
              ${tierToggle()}
            </div>
            <div class="filter-row filter-row-split">
              ${multiselect("regions", "大洲", regionOptions(), state.regions, {
                emptyLabel: "全部大洲",
              })}
              ${multiselect("countryCodes", "国家/地区", countryOptionList(), state.countryCodes, {
                emptyLabel: "全部国家/地区",
                searchable: true,
                searchPlaceholder: "搜索国家/地区",
              })}
            </div>
          </div>`
          }
          <div class="map-overlay-zoom">
            <div class="zoom-btns">
              <button type="button" data-zoom="in" aria-label="放大地图">+</button>
              <button type="button" data-zoom="out" aria-label="缩小地图">−</button>
            </div>
            <p class="legend compact">
              <span><span class="swatch" style="background:var(--map-has)"></span>有推荐餐厅</span>
              <span><span class="swatch" style="background:var(--map-empty)"></span>暂无餐厅</span>
              <span><span class="swatch" style="background:var(--map-idle);box-shadow:inset 0 0 0 1px var(--line)"></span>未筛选</span>
            </p>
          </div>
        </div>
        <aside class="map-overlay-panel">
          ${renderMapPanel(visible)}
        </aside>
      </div>
    `;
  }

  function currentPage() {
    const hash = (location.hash || "#map").replace(/^#\/?/, "");
    if (hash.startsWith("list")) {
      state.panelExpanded = true;
      if (location.hash !== "#map") history.replaceState(null, "", "#map");
    }
    return "map";
  }

  function hideChipTooltip() {
    const tip = document.getElementById("chip-tooltip");
    if (tip) tip.hidden = true;
  }

  function showChipTooltip(chip) {
    const tip = document.getElementById("chip-tooltip");
    if (!tip) return;
    tip.textContent = chip.getAttribute("data-tip") || "";
    tip.hidden = false;
    const rect = chip.getBoundingClientRect();
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    let top = rect.bottom + 8;
    if (top + height > window.innerHeight - 8) top = rect.top - height - 8;
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  }

  function render() {
    hideChipTooltip();
    currentPage();
    state.page = "map";
    document.body.classList.add("map-mode");
    const root = document.getElementById("app");
    root.innerHTML = renderMap();
    requestAnimationFrame(paintMap);
  }

  function peekCountry(code) {
    const country = countriesByCode[code];
    if (!country || !countryInScope(country)) return;
    state.selectedCode = state.selectedCode === code ? "" : code;
    state.openMenu = null;
    state.menuQuery = "";
    render();
  }

  function clearPeek() {
    if (!state.selectedCode) return;
    state.selectedCode = "";
    render();
  }

  function focusCountry(code) {
    const country = countriesByCode[code];
    if (!country) return;
    if (state.cuisineTier !== "all" && country.cuisineTier !== state.cuisineTier) {
      state.cuisineTier = "all";
    }
    if (state.regions.length && !state.regions.includes(country.region)) {
      state.regions = [];
    }
    state.countryCodes = [code];
    state.selectedCode = "";
    state.openMenu = null;
    state.menuQuery = "";
    pendingFlyCode = code;
    render();
  }

  function updateMapTooltip(event) {
    const tooltip = document.getElementById("map-tooltip");
    if (!tooltip || state.page !== "map") return;
    const stage = document.querySelector(".map-stage");
    if (!stage) return;
    if (mapPointers.size > 0 || mapDragMoved) {
      tooltip.hidden = true;
      return;
    }
    const pathEl = event.target.closest?.(".map-stage path.map-country.is-clickable");
    if (!pathEl) {
      tooltip.hidden = true;
      return;
    }
    const rect = stage.getBoundingClientRect();
    tooltip.hidden = false;
    tooltip.style.left = `${event.clientX - rect.left}px`;
    tooltip.style.top = `${event.clientY - rect.top}px`;
    tooltip.textContent =
      pathEl.getAttribute("aria-label") ||
      pathEl.querySelector("title")?.textContent ||
      "";
  }

  function restoreCaret(selector, start, end) {
    const next = document.querySelector(selector);
    if (!next) return;
    next.focus();
    if (start !== null && end !== null && next.setSelectionRange) {
      next.setSelectionRange(start, end);
    }
  }

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const start = "selectionStart" in target ? target.selectionStart : null;
    const end = "selectionEnd" in target ? target.selectionEnd : null;

    if (target.hasAttribute("data-ms-search")) {
      state.menuQuery = target.value;
      render();
      restoreCaret("[data-ms-search]", start, end);
    }
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const msKey = target.getAttribute("data-ms-option");
    if (msKey) {
      const current = state[msKey] || [];
      state[msKey] = target.checked
        ? [...current, target.value]
        : current.filter((value) => value !== target.value);
      if (msKey === "regions" || msKey === "countryCodes") {
        state.selectedCode = "";
      }
      if (msKey === "regions") {
        state.countryCodes = state.countryCodes.filter((code) =>
          state.regions.length
            ? state.regions.includes(countriesByCode[code]?.region)
            : true,
        );
      }
      if (msKey === "countryCodes") {
        if (state.countryCodes.length === 1) {
          pendingFlyCode = state.countryCodes[0];
        }
      }
      render();
      return;
    }
    if (target.hasAttribute("data-select-country")) {
      focusCountry(target.value);
      return;
    }
    const key = target.getAttribute("data-filter");
    if (key && target.tagName === "SELECT") {
      state[key] = target.value;
      render();
    }
  });

  const mapPointers = new Map();
  let mapPinch = null;
  let mapDragMoved = false;
  let mapPointerStart = null;
  const DRAG_THRESHOLD = 10;

  document.addEventListener(
    "wheel",
    (event) => {
      if (state.page !== "map") return;
      const svg = event.target.closest?.(".map-stage svg");
      if (!svg) return;
      event.preventDefault();
      cancelFly();
      const point = clientToSvg(svg, event.clientX, event.clientY);
      const factor = event.deltaY < 0 ? 1.14 : 1 / 1.14;
      state.mapTransform = zoomAt(
        state.mapTransform,
        point.x,
        point.y,
        state.mapTransform.k * factor,
      );
      applyMapTransform();
    },
    { passive: false },
  );

  document.addEventListener("pointerdown", (event) => {
    if (state.page !== "map") return;
    if (!event.target.closest?.(".map-stage svg")) return;
    const pathEl = event.target.closest?.("path[data-code]");
    mapPointerStart = {
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      code: pathEl ? pathEl.getAttribute("data-code") : "",
    };
    mapPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    mapDragMoved = false;
    if (mapPointers.size === 2) {
      const [first, second] = [...mapPointers.values()];
      mapPinch = {
        distance: Math.hypot(first.x - second.x, first.y - second.y),
        transform: { ...state.mapTransform },
      };
    }
  });

  document.addEventListener("pointermove", updateMapTooltip);

  document.addEventListener("pointermove", (event) => {
    if (!mapPointers.has(event.pointerId)) return;
    mapPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const svg = document.querySelector(".map-stage svg");
    if (!svg) return;
    if (mapPointers.size >= 2 && mapPinch) {
      const [first, second] = [...mapPointers.values()];
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      if (mapPinch.distance < 8) return;
      const mid = clientToSvg(
        svg,
        (first.x + second.x) / 2,
        (first.y + second.y) / 2,
      );
      cancelFly();
      state.mapTransform = zoomAt(
        mapPinch.transform,
        mid.x,
        mid.y,
        mapPinch.transform.k * (distance / mapPinch.distance),
      );
      mapDragMoved = true;
      applyMapTransform();
      return;
    }
    if (!mapPointerStart || event.buttons === 0) return;
    const dist = Math.hypot(
      event.clientX - mapPointerStart.x,
      event.clientY - mapPointerStart.y,
    );
    if (!mapDragMoved) {
      if (dist <= DRAG_THRESHOLD) {
        mapPointerStart.lastX = event.clientX;
        mapPointerStart.lastY = event.clientY;
        return;
      }
      mapDragMoved = true;
      cancelFly();
      svg.setPointerCapture?.(event.pointerId);
    }
    const rect = svg.getBoundingClientRect();
    const view = svg.viewBox.baseVal;
    const dx =
      ((event.clientX - mapPointerStart.lastX) / rect.width) * view.width;
    const dy =
      ((event.clientY - mapPointerStart.lastY) / rect.height) * view.height;
    mapPointerStart.lastX = event.clientX;
    mapPointerStart.lastY = event.clientY;
    state.mapTransform = {
      k: state.mapTransform.k,
      x: state.mapTransform.x + dx,
      y: state.mapTransform.y + dy,
    };
    applyMapTransform();
  });

  document.addEventListener("pointerup", (event) => {
    const start = mapPointerStart;
    const dragging = mapDragMoved;
    mapPointers.delete(event.pointerId);
    if (mapPointers.size < 2) mapPinch = null;
    const svg =
      event.target.closest?.(".map-stage svg") ||
      document.querySelector(".map-stage svg");
    if (svg?.hasPointerCapture?.(event.pointerId)) {
      svg.releasePointerCapture(event.pointerId);
    }
    if (
      !dragging &&
      start &&
      mapPointers.size === 0 &&
      state.page === "map"
    ) {
      if (start.code) peekCountry(start.code);
      else clearPeek();
    }
    if (mapPointers.size === 0) {
      mapPointerStart = null;
      mapDragMoved = false;
    }
  });

  document.addEventListener("pointerover", (event) => {
    if (state.page !== "map") return;
    if (mapPointers.size > 0 || mapDragMoved) return;
    const pathEl = event.target.closest?.(".map-stage path.map-country.is-clickable");
    if (!pathEl) return;
    document.querySelectorAll(".map-stage path.is-hovered").forEach((el) => {
      if (el !== pathEl) el.classList.remove("is-hovered");
    });
    pathEl.classList.add("is-hovered");
    const group = pathEl.parentNode;
    if (group) group.appendChild(pathEl);
  });

  document.addEventListener("pointerout", (event) => {
    if (state.page !== "map") return;
    const pathEl = event.target.closest?.(".map-stage path.map-country");
    if (!pathEl) return;
    const next = event.relatedTarget && event.relatedTarget.closest
      ? event.relatedTarget.closest(".map-stage path.map-country")
      : null;
    if (next === pathEl) return;
    pathEl.classList.remove("is-hovered");
  });

  document.addEventListener("click", (event) => {
    const msToggle = event.target.closest?.("[data-ms-toggle]");
    if (msToggle) {
      const key = msToggle.getAttribute("data-ms-toggle");
      state.openMenu = state.openMenu === key ? null : key;
      state.menuQuery = "";
      render();
      return;
    }

    const msClear = event.target.closest?.("[data-ms-clear]");
    if (msClear) {
      const key = msClear.getAttribute("data-ms-clear");
      state[key] = [];
      if (key === "countryCodes") state.selectedCode = "";
      render();
      return;
    }

    const togglePanel = event.target.closest?.("[data-toggle-panel]");
    if (togglePanel) {
      state.panelExpanded = !state.panelExpanded;
      state.openMenu = null;
      state.menuQuery = "";
      render();
      return;
    }

    let needsRender = false;
    if (state.openMenu && !event.target.closest?.(".multiselect")) {
      state.openMenu = null;
      state.menuQuery = "";
      needsRender = true;
    }

    const tierBtn = event.target.closest?.("[data-tier]");
    if (tierBtn) {
      state.cuisineTier = tierBtn.getAttribute("data-tier");
      state.selectedCode = "";
      state.countryCodes = state.countryCodes.filter((code) => {
        const country = countriesByCode[code];
        return (
          country &&
          (state.cuisineTier === "all" || country.cuisineTier === state.cuisineTier)
        );
      });
      render();
      return;
    }

    const zoomBtn = event.target.closest?.("[data-zoom]");
    if (zoomBtn) {
      cancelFly();
      const action = zoomBtn.getAttribute("data-zoom");
      const svg = document.querySelector(".map-stage svg");
      if (svg) {
        const view = svg.viewBox.baseVal;
        const factor = action === "in" ? ZOOM_STEP : 1 / ZOOM_STEP;
        state.mapTransform = zoomAt(
          state.mapTransform,
          view.width / 2,
          view.height / 2,
          state.mapTransform.k * factor,
        );
      }
      if (needsRender) render();
      else applyMapTransform();
      return;
    }
    const pathEl = event.target.closest("path[data-code]");
    if (pathEl?.closest?.(".map-stage")) {
      if (needsRender) render();
      return;
    }
    if (
      state.selectedCode &&
      event.target.closest?.(".map-stage svg") &&
      !event.target.closest?.("path[data-code]")
    ) {
      clearPeek();
      return;
    }
    if (needsRender) render();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const dialog = document.getElementById("feedback-dialog");
      if (dialog && !dialog.hidden) {
        closeFeedbackDialog();
        return;
      }
    }
    if (event.key !== "Enter" && event.key !== " ") return;
    const pathEl = event.target.closest?.("path[data-code]");
    if (!pathEl) return;
    event.preventDefault();
    peekCountry(pathEl.getAttribute("data-code"));
  });

  let feedbackLastFocus = null;

  function openFeedbackDialog() {
    const dialog = document.getElementById("feedback-dialog");
    const panel = dialog?.querySelector(".feedback-panel");
    if (!dialog || !panel) return;
    feedbackLastFocus = document.activeElement;
    dialog.hidden = false;
    panel.focus();
  }

  function closeFeedbackDialog() {
    const dialog = document.getElementById("feedback-dialog");
    if (!dialog || dialog.hidden) return;
    dialog.hidden = true;
    if (feedbackLastFocus && typeof feedbackLastFocus.focus === "function") {
      feedbackLastFocus.focus();
    }
    feedbackLastFocus = null;
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest?.("[data-open-feedback]")) {
      openFeedbackDialog();
      return;
    }
    if (event.target.closest?.("[data-close-feedback]")) {
      closeFeedbackDialog();
    }
  });

  document.addEventListener("pointerover", (event) => {
    const chip = event.target.closest?.(".chip-tip");
    if (chip) showChipTooltip(chip);
  });

  document.addEventListener("pointerout", (event) => {
    const chip = event.target.closest?.(".chip-tip");
    if (!chip) return;
    const next = event.relatedTarget && event.relatedTarget.closest
      ? event.relatedTarget.closest(".chip-tip")
      : null;
    if (next === chip) return;
    hideChipTooltip();
  });

  document.addEventListener("focusin", (event) => {
    const chip = event.target.closest?.(".chip-tip");
    if (chip) showChipTooltip(chip);
  });

  document.addEventListener("focusout", (event) => {
    if (event.target.closest?.(".chip-tip")) hideChipTooltip();
  });

  document.addEventListener("scroll", hideChipTooltip, true);

  window.addEventListener("hashchange", render);
  window.addEventListener("resize", () => {
    if (state.page !== "map") return;
    state.mapTransform = null;
    paintMap();
  });
  render();
})();
