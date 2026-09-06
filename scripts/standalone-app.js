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
  const UNVERIFIED_NEIGHBORHOOD = "待核验";

  const MESSAGES = {
    zh: {
      brandTitle: "纽约 · 美食世界地图",
      skipLink: "跳到主要内容",
      feedbackAria: "留言反馈",
      feedbackClose: "关闭",
      feedbackTitle: "欢迎给我们留言！",
      feedbackLede:
        "如果你有强烈推荐的某国餐厅、愿意补充「暂无餐厅」国家的好店，或对地图有任何建议，都非常欢迎写信告诉我们，我们一定认真听取，十分感谢！",
      verified: "最后核验 {date}",
      visits: "已有{n}名吃货到此一游",
      langGroup: "语言",
      classSpecialist: "专门菜系",
      classRegional: "区域兼营",
      tipSpecialist: "该餐厅专门提供该国家的菜系。",
      tipRegional: "该餐厅提供该国家所在区域的菜系，其中部分菜品属于该国菜系。",
      tierNiche: "小众菜系",
      tierMainstream: "大众菜系",
      tierShortNiche: "小众",
      tierShortAll: "全部",
      tierShortMainstream: "大众",
      tierAria: "菜系筛选",
      tierField: "小众 / 全部 / 大众",
      statusOpen: "营业中",
      statusUnverified: "待核验",
      statusTempClosed: "暂时关闭",
      statusClosed: "已关闭",
      reviews: "，{n} 条评价",
      noRatings: "暂无分平台评分。",
      viewMaps: "在 Google 地图中查看",
      emptyRestaurants: "暂无可确认的专门餐厅<br>没有用相邻国家/地区菜系补足。",
      emptyRestaurantShort: "暂无可确认的专门餐厅",
      all: "全部",
      selectedN: "已选 {n} 项",
      unfiltered: "未筛选",
      clear: "清空",
      search: "搜索",
      noMatch: "无匹配结果",
      countItems: "{n} 个",
      countPlaces: "{n} 家",
      region: "大洲",
      allRegions: "全部大洲",
      country: "国家/地区",
      allCountries: "全部国家/地区",
      searchCountries: "搜索国家/地区",
      borough: "街区",
      allBoroughs: "全部街区",
      mapRecommend: "{name}，{n} 家推荐餐厅",
      mapUnlisted: "未收录国家/地区",
      mapAria: "世界地图，可缩放、拖动，点击国家/地区查看餐厅",
      recommendCount: "{n} 家餐厅",
      placeCount: "{n} 家餐厅",
      countryMeta: "{region} · {n} 家餐厅",
      countryMetaWithEn: "{en} · {region} · {n} 家餐厅",
      summarySelected: "已选",
      summaryCurrent: "当前",
      summaryLine: "{scope} {countries} 个国家/地区 · {places} 家餐厅",
      summaryEmpty: " · {n} 个暂无餐厅",
      summaryOneRegion: "{name} · 共{n}家餐厅",
      summaryOneCountry: "{name} · 共{n}家餐厅",
      summaryMulti: "当前选中{countries}个国家{places}家餐厅",
      summaryAll: "共{countries}个国家 · {places}家餐厅",
      restaurantListTitle: "餐厅列表",
      noMatchCountries: "没有匹配的国家/地区",
      relaxFilters: "试试放宽左上角的筛选条件。",
      noConfirmed: "暂无已确认餐厅",
      emptyCountriesMeta: "{n} 个国家/地区",
      noBoroughMatches: "当前街区筛选下没有可推荐餐厅。",
      collapse: "收起",
      expand: "展开",
      zoomIn: "放大地图",
      zoomOut: "缩小地图",
      legendHas: "有推荐餐厅",
      legendEmpty: "暂无餐厅",
      legendIdle: "未筛选",
      filterButton: "筛选",
      clearAllFilters: "清除全部筛选",
      googleMapRating: "Google Map：{score}/{scale}（{n}）",
      googleMapRatingNoCount: "Google Map：{score}/{scale}",
      regionEurope: "欧洲",
      regionAfrica: "非洲",
      regionLatam: "加勒比 / 拉美",
      regionAsia: "亚洲",
      regionNorthAmerica: "北美",
      regionOceania: "大洋洲",
      listJoin: "、",
      ratingSep: "：",
    },
    en: {
      brandTitle: "NYC · World Food Map",
      skipLink: "Skip to main content",
      feedbackAria: "Send feedback",
      feedbackClose: "Close",
      feedbackTitle: "We'd love to hear from you!",
      feedbackLede:
        "If you have a strongly recommended restaurant for a country, a great tip for a place still marked “no restaurants,” or any suggestions for the map, please write to us — we read every note carefully. Thank you!",
      verified: "Last verified {date}",
      visits: "{n} food lovers have stopped by",
      langGroup: "Language",
      classSpecialist: "Specialist",
      classRegional: "Regional",
      tipSpecialist: "This restaurant specializes in this country's cuisine.",
      tipRegional:
        "This restaurant serves cuisine from the country's region, including dishes from this country.",
      tierNiche: "Niche cuisines",
      tierMainstream: "Mainstream cuisines",
      tierShortNiche: "Niche",
      tierShortAll: "All",
      tierShortMainstream: "Popular",
      tierAria: "Cuisine filter",
      tierField: "Niche / All / Popular",
      statusOpen: "Open",
      statusUnverified: "Unverified",
      statusTempClosed: "Temporarily closed",
      statusClosed: "Closed",
      reviews: ", {n} reviews",
      noRatings: "No platform ratings yet.",
      viewMaps: "View on Google Maps",
      emptyRestaurants:
        "No confirmed specialist restaurants yet.<br>No neighboring-country cuisine fill-ins either.",
      emptyRestaurantShort: "No confirmed specialist restaurants yet.",
      all: "All",
      selectedN: "{n} selected",
      unfiltered: "No filter",
      clear: "Clear",
      search: "Search",
      noMatch: "No matches",
      countItems: "{n}",
      countPlaces: "{n}",
      region: "Continent",
      allRegions: "All continents",
      country: "Country / region",
      allCountries: "All countries / regions",
      searchCountries: "Search countries / regions",
      borough: "Borough",
      allBoroughs: "All boroughs",
      mapRecommend: "{name}, {n} recommended restaurants",
      mapUnlisted: "Unlisted country / region",
      mapAria: "World map — zoom, pan, and click a country or region for restaurants",
      recommendCount: "{n} Restaurants",
      placeCount: "{n} Restaurants",
      countryMeta: "{region} · {n} Restaurants",
      countryMetaWithEn: "{en} · {region} · {n} Restaurants",
      summarySelected: "Selected",
      summaryCurrent: "Showing",
      summaryLine: "{scope} {countries} countries / regions · {places} restaurants",
      summaryEmpty: " · {n} with none yet",
      summaryOneRegion: "{name} · {n} restaurants",
      summaryOneCountry: "{name} · {n} restaurants",
      summaryMulti: "{countries} countries · {places} restaurants",
      summaryAll: "{countries} countries · {places} restaurants",
      restaurantListTitle: "Restaurant List",
      noMatchCountries: "No matching countries / regions",
      relaxFilters: "Try loosening the filters in the top-left.",
      noConfirmed: "No confirmed restaurants",
      emptyCountriesMeta: "{n} countries / regions",
      noBoroughMatches: "No recommendable restaurants under the current borough filter.",
      collapse: "Collapse",
      expand: "Expand",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      legendHas: "Has recommendations",
      legendEmpty: "None yet",
      legendIdle: "Out of filter",
      filterButton: "Filter",
      clearAllFilters: "Clear all filters",
      googleMapRating: "Google Map: {score}/{scale} ({n})",
      googleMapRatingNoCount: "Google Map: {score}/{scale}",
      regionEurope: "Europe",
      regionAfrica: "Africa",
      regionLatam: "Caribbean / Latin America",
      regionAsia: "Asia",
      regionNorthAmerica: "North America",
      regionOceania: "Oceania",
      listJoin: ", ",
      ratingSep: ": ",
    },
  };

  const REGION_MSG = {
    欧洲: "regionEurope",
    非洲: "regionAfrica",
    "加勒比 / 拉美": "regionLatam",
    亚洲: "regionAsia",
    北美: "regionNorthAmerica",
    大洋洲: "regionOceania",
  };

  const LANG_KEY = "nyc-food-map-lang-v2";

  function persistLang(lang) {
    if (lang !== "en" && lang !== "zh") return;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (_) {}
  }

  function readLang() {
    try {
      localStorage.removeItem("nyc-food-map-lang");
      const stored = localStorage.getItem(LANG_KEY);
      if (stored === "en" || stored === "zh") return stored;
    } catch (_) {}
    const params = new URLSearchParams(location.search);
    const query = params.get("lang");
    if (query === "en" || query === "zh") return query;
    return "en";
  }

  const ZOOM_STEP = 1.25;
  // Captured from preferred view: k=1.25, focus ≈ (475.4, 272.6) on 937×652
  const DEFAULT_ZOOM = 1.25;
  const DEFAULT_FOCUS = { fx: 475.399375 / 937, fy: 272.6475 / 652 };

  const state = {
    lang: readLang(),
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
    filtersOpen: false,
    mapPickCode: "",
  };
  if (state.lang === "en") {
    state.cuisineTier = "all";
  }
  persistLang(state.lang);

  let pendingFlyCode = null;
  let pendingZoomMinimum = false;
  let flyRaf = null;
  let visitCount = "";
  let mapClickTimer = null;
  const SELECT_ZOOM = 5;
  const MAP_CLICK_DELAY_MS = 280;

  function isMobileUi() {
    return window.matchMedia("(max-width: 767px)").matches;
  }

  function activeFilterCount() {
    let count = 0;
    if (state.lang !== "en" && state.cuisineTier !== "all") count += 1;
    count += state.regions.length;
    count += state.countryCodes.length;
    return count;
  }

  const countriesByCode = Object.fromEntries(
    countries.map((country) => [country.code, country]),
  );

  const latestVerified = restaurants.reduce((latest, restaurant) => {
    const value = restaurant.lastVerifiedAt || "";
    return value > latest ? value : latest;
  }, "");

  function i18n(key, vars) {
    const table = MESSAGES[state.lang] || MESSAGES.zh;
    let text = table[key] ?? MESSAGES.zh[key] ?? key;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
    }
    return text;
  }

  function regionLabel(region) {
    const key = REGION_MSG[region];
    return key ? i18n(key) : region;
  }

  function countryPrimary(country) {
    if (state.lang === "en") {
      if (country.code === "CN") return "China Mainland";
      return country.nameEn;
    }
    return country.nameZh;
  }

  function countrySecondaryDisplay(country) {
    return state.lang === "zh" ? country.nameEn : "";
  }

  function countryMetaLine(country, n) {
    const region = regionLabel(country.region);
    if (state.lang === "zh") {
      return i18n("countryMetaWithEn", {
        en: country.nameEn,
        region,
        n,
      });
    }
    return i18n("countryMeta", { region, n });
  }

  function countrySortName(country) {
    return countryPrimary(country);
  }

  function localeTag() {
    return state.lang === "en" ? "en" : "zh";
  }

  function classificationLabel(key) {
    return key === "regional" ? i18n("classRegional") : i18n("classSpecialist");
  }

  function classificationTip(key) {
    return key === "regional" ? i18n("tipRegional") : i18n("tipSpecialist");
  }

  function cuisineTierLabel(key) {
    return key === "mainstream" ? i18n("tierMainstream") : i18n("tierNiche");
  }

  function statusLabel(key) {
    if (key === "open") return i18n("statusOpen");
    if (key === "temporarily_closed") return i18n("statusTempClosed");
    if (key === "closed") return i18n("statusClosed");
    return i18n("statusUnverified");
  }

  function updateLangToggle() {
    document.querySelectorAll("[data-set-lang]").forEach((button) => {
      const active = button.getAttribute("data-set-lang") === state.lang;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    const group = document.querySelector(".lang-toggle");
    if (group) {
      group.setAttribute("aria-label", i18n("langGroup"));
      group.setAttribute("data-lang", state.lang);
    }
  }

  function applyChrome() {
    document.documentElement.lang = state.lang === "en" ? "en" : "zh-CN";
    document.body.classList.toggle("lang-en", state.lang === "en");
    document.body.classList.toggle("lang-zh", state.lang !== "en");
    document.title = i18n("brandTitle");
    const titleEl = document.getElementById("site-title");
    if (titleEl) titleEl.textContent = i18n("brandTitle");
    const skip = document.getElementById("skip-link");
    if (skip) skip.textContent = i18n("skipLink");
    const verifiedEl = document.getElementById("site-verified");
    if (verifiedEl && latestVerified) {
      verifiedEl.textContent = i18n("verified", { date: latestVerified });
    }
    const visitsEl = document.getElementById("site-visits");
    if (visitsEl && visitCount) {
      visitsEl.hidden = false;
      visitsEl.textContent = i18n("visits", { n: visitCount });
    }
    const mailBtn = document.getElementById("feedback-open-btn");
    if (mailBtn) {
      mailBtn.setAttribute("aria-label", i18n("feedbackAria"));
      mailBtn.setAttribute("title", i18n("feedbackAria"));
    }
    const closeBtn = document.getElementById("feedback-close-btn");
    if (closeBtn) closeBtn.setAttribute("aria-label", i18n("feedbackClose"));
    const feedbackTitle = document.getElementById("feedback-title");
    if (feedbackTitle) feedbackTitle.textContent = i18n("feedbackTitle");
    const feedbackLede = document.getElementById("feedback-lede");
    if (feedbackLede) feedbackLede.textContent = i18n("feedbackLede");
    updateLangToggle();
  }

  function setLang(lang) {
    if (lang !== "en" && lang !== "zh") return;
    if (state.lang === lang) return;
    state.lang = lang;
    if (lang === "en") {
      state.cuisineTier = "all";
    }
    persistLang(lang);
    applyChrome();
    render();
  }

  function loadVisitCount() {
    const code = data.goatcounterCode;
    const visitsEl = document.getElementById("site-visits");
    if (!code || !visitsEl) return;
    fetch(`https://${code}.goatcounter.com/counter/TOTAL.json`)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then((payload) => {
        const count = String(payload.count || "")
          .replace(/\s/g, "")
          .trim();
        if (!count) return;
        visitCount = count;
        visitsEl.hidden = false;
        visitsEl.textContent = i18n("visits", { n: visitCount });
      })
      .catch(() => {});
  }

  applyChrome();
  loadVisitCount();

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

  function restaurantCardSlim(restaurant) {
    const rating =
      (restaurant.ratings || []).find((item) => /google/i.test(item.source || "")) ||
      (restaurant.ratings || [])[0];
    const ratingLine = rating
      ? typeof rating.reviewCount === "number"
        ? i18n("googleMapRating", {
            score: rating.score,
            scale: rating.scale,
            n: rating.reviewCount,
          })
        : i18n("googleMapRatingNoCount", {
            score: rating.score,
            scale: rating.scale,
          })
      : i18n("noRatings");
    const place = [restaurant.name, restaurant.borough].filter(Boolean).join(" · ");
    return `
      <article class="card card-slim">
        <a class="card-slim-link" href="${mapsUrl(restaurant)}" target="_blank" rel="noopener noreferrer">
          <p class="card-slim-title">${escapeHtml(place)}</p>
          <p class="card-slim-rating">${escapeHtml(ratingLine)}</p>
        </a>
      </article>
    `;
  }

  function restaurantCardFull(restaurant) {
    const ratings = restaurant.ratings?.length
      ? `<p class="ratings">${restaurant.ratings
          .map(
            (rating) =>
              `${escapeHtml(rating.source)}${i18n("ratingSep")}${escapeHtml(rating.score)}/${escapeHtml(rating.scale)}${
                typeof rating.reviewCount === "number"
                  ? i18n("reviews", { n: rating.reviewCount })
                  : ""
              }`,
          )
          .join("<br>")}</p>`
      : `<p class="muted">${i18n("noRatings")}</p>`;
    const statusChip =
      restaurant.status && restaurant.status !== "unverified"
        ? `<span class="chip">${statusLabel(restaurant.status)}</span>`
        : "";
    return `
      <article class="card">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:.5rem">
          <h3>${escapeHtml(restaurant.name)}</h3>
          <div class="chips">
            <span class="chip chip-tip" tabindex="0" data-tip="${escapeHtml(classificationTip(restaurant.classification) || "")}">${classificationLabel(restaurant.classification)}</span>
            ${statusChip}
          </div>
        </div>
        <p class="muted">${[restaurant.borough, restaurant.neighborhood, restaurant.address]
          .filter((part) => part && part !== UNVERIFIED_NEIGHBORHOOD)
          .map(escapeHtml)
          .join(" · ")}</p>
        ${ratings}
        <a class="maps-btn" href="${mapsUrl(restaurant)}" target="_blank" rel="noopener noreferrer">${i18n("viewMaps")}</a>
      </article>
    `;
  }

  function restaurantCard(restaurant) {
    return isMobileUi() ? restaurantCardSlim(restaurant) : restaurantCardFull(restaurant);
  }

  function emptyRestaurants() {
    return `<p class="muted">${i18n("emptyRestaurants")}</p>`;
  }

  function tierToggle() {
    const options = [
      { value: "niche", label: i18n("tierShortNiche") },
      { value: "all", label: i18n("tierShortAll") },
      { value: "mainstream", label: i18n("tierShortMainstream") },
    ];
    return `
      <div class="tier-toggle" role="group" aria-label="${i18n("tierAria")}">
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
      ? config.emptyLabel || i18n("all")
      : chosen.length <= 2
        ? chosen.map((option) => option.short || option.label).join(i18n("listJoin"))
        : i18n("selectedN", { n: chosen.length });
    const needle = open ? normalize(state.menuQuery) : "";
    const list = needle
      ? options.filter((option) =>
          [option.label, option.value, option.keywords || ""]
            .map(normalize)
            .some((value) => value.includes(needle)),
        )
      : options;
    return `
      <div class="multiselect${open ? " is-open" : ""}${config.compact ? " is-compact" : ""}" data-ms="${key}">
        ${config.hideLabel ? "" : `<span class="ms-label">${escapeHtml(label)}</span>`}
        <button type="button" class="ms-toggle" data-ms-toggle="${key}" aria-expanded="${open}"${config.hideLabel ? ` aria-label="${escapeHtml(label)}"` : ""}>
          <span class="ms-summary${chosen.length ? " is-active" : ""}">${escapeHtml(summary)}</span>
          <span class="ms-caret" aria-hidden="true">▾</span>
        </button>
        <div class="ms-menu"${open ? "" : " hidden"}>
          ${
            config.searchable
              ? `<input type="text" class="ms-search" data-ms-search value="${escapeHtml(state.menuQuery)}" placeholder="${escapeHtml(config.searchPlaceholder || i18n("search"))}">`
              : ""
          }
          <div class="ms-actions">
            <span class="ms-count">${chosen.length ? i18n("selectedN", { n: chosen.length }) : i18n("unfiltered")}</span>
            <button type="button" data-ms-clear="${key}"${chosen.length ? "" : " disabled"}>${i18n("clear")}</button>
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
                : `<li class="ms-empty">${i18n("noMatch")}</li>`
            }
          </ul>
        </div>
      </div>
    `;
  }

  function regionOptions() {
    return REGIONS.map((region) => ({
      value: region,
      label: regionLabel(region),
      meta: i18n("countItems", {
        n: countries.filter((country) => country.region === region).length,
      }),
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
      .sort((a, b) => countrySortName(a).localeCompare(countrySortName(b), localeTag()))
      .map((country) => ({
        value: country.code,
        label: `${country.flag} ${countryPrimary(country)}`,
        short: countryPrimary(country),
        keywords: `${country.nameZh} ${country.nameEn} ${country.code}${
          country.code === "CN" ? " China Mainland" : ""
        }`,
        meta: i18n("countPlaces", { n: counts[country.code] || 0 }),
      }));
  }

  function boroughOptions() {
    const recommendable = restaurants.filter(isRecommendable);
    return BOROUGHS.map((borough) => ({
      value: borough,
      label: borough,
      meta: i18n("countPlaces", {
        n: recommendable.filter((item) => item.borough === borough).length,
      }),
    }));
  }

  function mapFilterFields(options = {}) {
    const hideLabels = options.hideLabels !== false;
    const includeBorough = Boolean(options.includeBorough);
    const boroughOnly = Boolean(options.boroughOnly);
    if (boroughOnly) {
      return `
      <div class="filter-row">
        <div class="filter-field">
          ${multiselect("boroughs", i18n("borough"), boroughOptions(), state.boroughs, {
            emptyLabel: i18n("allBoroughs"),
            hideLabel: hideLabels,
          })}
        </div>
      </div>`;
    }
    return `
      ${
        state.lang === "en"
          ? ""
          : `<div class="filter-field filter-field-tier">
        ${tierToggle()}
      </div>`
      }
      <div class="filter-row filter-row-split">
        <div class="filter-field">
          ${multiselect("regions", i18n("region"), regionOptions(), state.regions, {
            emptyLabel: i18n("allRegions"),
            hideLabel: hideLabels,
          })}
        </div>
        <div class="filter-field">
          ${multiselect("countryCodes", i18n("country"), countryOptionList(), state.countryCodes, {
            emptyLabel: i18n("allCountries"),
            searchable: true,
            searchPlaceholder: i18n("searchCountries"),
            hideLabel: hideLabels,
          })}
        </div>
      </div>
      ${
        includeBorough
          ? `<div class="filter-row">
        <div class="filter-field">
          ${multiselect("boroughs", i18n("borough"), boroughOptions(), state.boroughs, {
            emptyLabel: i18n("allBoroughs"),
            hideLabel: hideLabels,
          })}
        </div>
      </div>`
          : ""
      }
    `;
  }

  function boroughFilter(options = {}) {
    return `
      <div class="filter-field${options.compact ? " is-compact" : ""}">
        ${multiselect("boroughs", i18n("borough"), boroughOptions(), state.boroughs, {
          emptyLabel: i18n("allBoroughs"),
          hideLabel: Boolean(options.hideLabel),
          compact: Boolean(options.compact),
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

  function panelCountries() {
    if (state.mapPickCode && countriesByCode[state.mapPickCode]) {
      return [countriesByCode[state.mapPickCode]];
    }
    return visibleCountries();
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
          ? i18n("mapRecommend", { name: countryPrimary(country), n: count })
          : country
            ? countryPrimary(country)
            : geo.properties?.name || i18n("mapUnlisted");
        const d = path(geo) || "";
        const clickable = Boolean(country && inFilter);
        const klass = `map-country${clickable ? " is-clickable" : ""}${selected ? " is-selected" : ""}`;
        const attrs = clickable
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
        <svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${escapeHtml(i18n("mapAria"))}">
          <rect width="${w}" height="${h}" fill="var(--map-bg)" pointer-events="none"></rect>
          <g id="map-zoom" transform="translate(${t.x} ${t.y}) scale(${t.k})">${paths}</g>
        </svg>
    `;
  }

  function viewSize(width, height) {
    return { w: Math.max(320, width || 800), h: Math.max(240, height || 420) };
  }

  function baseTransform(w, h) {
    const k = DEFAULT_ZOOM;
    const cx = DEFAULT_FOCUS.fx * w;
    const cy = DEFAULT_FOCUS.fy * h;
    return {
      k,
      x: w / 2 - cx * k,
      y: h / 2 - cy * k,
    };
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
    if (pendingZoomMinimum && isMobileUi()) {
      pendingZoomMinimum = false;
      pendingFlyCode = null;
      const { w, h } = viewSize(stage.clientWidth, stage.clientHeight);
      animateMapTransform(baseTransform(w, h));
      return;
    }
    pendingZoomMinimum = false;
    if (pendingFlyCode) {
      const pathEl = stage.querySelector(`path[data-code="${pendingFlyCode}"]`);
      pendingFlyCode = null;
      if (pathEl) {
        if (isMobileUi()) flyToCountryAtZoom(pathEl, SELECT_ZOOM);
        else flyToPath(pathEl);
      }
    }
  }

  function queueZoomToMinimum() {
    if (!isMobileUi()) return;
    pendingFlyCode = null;
    pendingZoomMinimum = true;
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

  function flyToCountryAtZoom(pathEl, k = SELECT_ZOOM) {
    const svg = pathEl.ownerSVGElement;
    if (!svg) return;
    const bbox = pathEl.getBBox();
    const view = svg.viewBox.baseVal;
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    animateMapTransform({
      k,
      x: view.width / 2 - cx * k,
      y: view.height / 2 - cy * k,
    });
  }

  function zoomToMinimum() {
    const stage = document.querySelector(".map-stage");
    if (!stage) return;
    const { w, h } = viewSize(stage.clientWidth, stage.clientHeight);
    animateMapTransform(baseTransform(w, h));
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
    if (isMobileUi()) {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 14.5 12 8.5l6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.75" y="5" width="16.5" height="14" rx="2.25" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9.25 5v14" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`;
  }

  function collapseIcon() {
    if (isMobileUi()) {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9.5 12 15.5l6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.75" y="5" width="16.5" height="14" rx="2.25" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M14.75 5v14" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`;
  }

  function countryPanel(country, list, expanded) {
    if (expanded) {
      const secondary =
        state.lang === "zh"
          ? ` <span class="muted">${escapeHtml(country.nameEn)}</span>`
          : "";
      return `
        <section class="panel">
          <header class="list-country-head">
            <h2>${country.flag} ${escapeHtml(countryPrimary(country))}${secondary}</h2>
            ${
              isMobileUi()
                ? ""
                : `<p class="muted">${escapeHtml(countryMetaLine(country, list.length))}</p>`
            }
          </header>
          <div class="stack">${list.length ? list.map(restaurantCard).join("") : emptyRestaurants()}</div>
        </section>
      `;
    }
    return `
      <section class="panel-country${country.code === state.selectedCode ? " is-selected" : ""}">
        <header class="panel-country-head">
          <h2>${country.flag} ${escapeHtml(countryPrimary(country))}</h2>
          ${
            isMobileUi()
              ? ""
              : `<p class="muted">${escapeHtml(countryMetaLine(country, list.length))}</p>`
          }
        </header>
        <div class="stack">${list.length ? list.map(restaurantCard).join("") : emptyRestaurants()}</div>
      </section>
    `;
  }

  function panelItems(visible) {
    const source =
      !isMobileUi() && !state.panelExpanded && state.selectedCode
        ? [countriesByCode[state.selectedCode]].filter(Boolean)
        : visible;
    const lists = new Map(
      source.map((country) => [
        country.code,
        restaurantsForCountry(country.code, !isMobileUi()),
      ]),
    );
    const ordered = source.slice().sort((a, b) => {
      if (a.code === state.selectedCode) return -1;
      if (b.code === state.selectedCode) return 1;
      const aCount = lists.get(a.code)?.length || 0;
      const bCount = lists.get(b.code)?.length || 0;
      if (aCount !== bCount) return bCount - aCount;
      return countrySortName(a).localeCompare(countrySortName(b), localeTag());
    });
    return ordered.map((country) => ({
      country,
      list: lists.get(country.code) || [],
    }));
  }

  function collapsedSummaryText(visible) {
    const oneCountryCode =
      state.selectedCode ||
      (state.countryCodes.length === 1 ? state.countryCodes[0] : "");
    if (oneCountryCode && countriesByCode[oneCountryCode]) {
      const country = countriesByCode[oneCountryCode];
      const n = restaurantsForCountry(oneCountryCode, false).length;
      return `${country.flag} ${i18n("summaryOneCountry", {
        name: countryPrimary(country),
        n,
      })}`;
    }
    if (state.regions.length === 1 && state.countryCodes.length === 0) {
      const region = state.regions[0];
      const regionCountries = visible.filter((country) => country.region === region);
      const n = regionCountries.reduce(
        (sum, country) => sum + restaurantsForCountry(country.code, false).length,
        0,
      );
      return i18n("summaryOneRegion", { name: regionLabel(region), n });
    }
    const countryCount = visible.length;
    const places = visible.reduce(
      (sum, country) => sum + restaurantsForCountry(country.code, false).length,
      0,
    );
    const filtered =
      state.regions.length > 0 || state.countryCodes.length > 0;
    return i18n(filtered ? "summaryMulti" : "summaryAll", {
      countries: countryCount,
      places,
    });
  }

  function renderExpandedPanelBody(visible) {
    const items = panelItems(visible);
    const nonempty = items.filter((item) => item.list.length > 0);
    const emptyCount = items.length - nonempty.length;
    const countryCount = items.length;
    if (!countryCount) {
      return `<div class="panel-empty"><h2>${i18n("noMatchCountries")}</h2><p class="muted">${i18n("relaxFilters")}</p></div>`;
    }
    if (!nonempty.length) return emptyRestaurants();
    const listHtml = nonempty
      .map((item) => countryPanel(item.country, item.list, true))
      .join("");
    const emptySection =
      emptyCount && countryCount <= 24
        ? `<section class="panel" style="margin-top:1.25rem">
            <h2>${i18n("noConfirmed")} <span class="muted">${i18n("emptyCountriesMeta", { n: emptyCount })}</span></h2>
            <ul class="empty-grid">${items
              .filter((item) => item.list.length === 0)
              .map(
                (item) =>
                  `<li class="card"><p><strong>${item.country.flag} ${escapeHtml(countryPrimary(item.country))}</strong>${
                    countrySecondaryDisplay(item.country)
                      ? ` <span class="muted">${escapeHtml(countrySecondaryDisplay(item.country))}</span>`
                      : ""
                  }</p><p class="muted">${i18n("emptyRestaurantShort")}</p></li>`,
              )
              .join("")}</ul>
          </section>`
        : "";
    return `${listHtml}${emptySection}`;
  }

  function clearAllFilters() {
    state.cuisineTier = "all";
    state.regions = [];
    state.countryCodes = [];
    state.boroughs = [];
    state.selectedCode = "";
    state.mapPickCode = "";
    state.openMenu = null;
    state.menuQuery = "";
    queueZoomToMinimum();
  }

  function trashIcon() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4.5h6M5.5 7h13m-1.2 0-.7 11.2a1.8 1.8 0 0 1-1.8 1.7H9.2a1.8 1.8 0 0 1-1.8-1.7L6.7 7m3.1 3.2.4 7.2m3.6-7.2-.4 7.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function desktopMapFilterFields() {
    return `
      ${
        state.lang === "en"
          ? ""
          : `<div class="filter-field">
        <span class="ms-label">${i18n("tierField")}</span>
        ${tierToggle()}
      </div>`
      }
      <div class="filter-field">
        ${multiselect("regions", i18n("region"), regionOptions(), state.regions, {
          emptyLabel: i18n("allRegions"),
        })}
      </div>
      <div class="filter-field">
        ${multiselect("countryCodes", i18n("country"), countryOptionList(), state.countryCodes, {
          emptyLabel: i18n("allCountries"),
          searchable: true,
          searchPlaceholder: i18n("searchCountries"),
        })}
      </div>
    `;
  }

  function desktopBoroughFilter() {
    return `
      <div class="filter-field">
        ${multiselect("boroughs", i18n("borough"), boroughOptions(), state.boroughs, {
          emptyLabel: i18n("allBoroughs"),
        })}
      </div>
    `;
  }

  function renderDesktopMapPanel(visible) {
    const expanded = state.panelExpanded;
    const items = panelItems(visible);
    const nonempty = items.filter((item) => item.list.length > 0);
    const emptyCount = items.length - nonempty.length;
    const total = nonempty.reduce((sum, item) => sum + item.list.length, 0);
    const countryCount = items.length;
    const summary = countryCount
      ? `<p class="panel-summary">${i18n("summaryLine", {
          scope:
            state.selectedCode && !expanded
              ? i18n("summarySelected")
              : i18n("summaryCurrent"),
          countries: countryCount,
          places: total,
        })}</p>`
      : "";
    const body = countryCount
      ? nonempty.length
        ? nonempty.map((item) => countryPanel(item.country, item.list, expanded)).join("")
        : emptyRestaurants()
      : `<div class="panel-empty"><h2>${i18n("noMatchCountries")}</h2><p class="muted">${i18n("relaxFilters")}</p></div>`;
    const emptySection =
      expanded && emptyCount && countryCount <= 24
        ? `<section class="panel" style="margin-top:1.25rem">
            <h2>${i18n("noConfirmed")} <span class="muted">${i18n("emptyCountriesMeta", { n: emptyCount })}</span></h2>
            <p class="muted">${i18n("noBoroughMatches")}</p>
            <ul class="empty-grid">${items
              .filter((item) => item.list.length === 0)
              .map(
                (item) =>
                  `<li class="card"><p><strong>${item.country.flag} ${escapeHtml(countryPrimary(item.country))}</strong>${
                    countrySecondaryDisplay(item.country)
                      ? ` <span class="muted">${escapeHtml(countrySecondaryDisplay(item.country))}</span>`
                      : ""
                  }</p><p class="muted">${i18n("emptyRestaurantShort")}</p></li>`,
              )
              .join("")}</ul>
          </section>`
        : "";
    return `
      <div class="map-panel-inner${expanded ? " is-expanded-layout" : ""}">
        <div class="panel-toolbar">
          <button type="button" class="panel-icon-btn" data-toggle-panel aria-label="${expanded ? i18n("collapse") : i18n("expand")}" title="${expanded ? i18n("collapse") : i18n("expand")}">
            ${expanded ? collapseIcon() : expandIcon()}
          </button>
        </div>
        ${
          expanded
            ? `<form class="filters expanded-filters" onsubmit="return false">${desktopMapFilterFields()}${desktopBoroughFilter()}</form>`
            : desktopBoroughFilter()
        }
        ${summary}
        <div class="panel-body">
          <div class="stack">${body}</div>
          ${emptySection}
        </div>
      </div>
    `;
  }

  function renderMobileMapPanel(visible) {
    const expanded = state.panelExpanded;
    const listCountries = panelCountries();
    const summaryText = collapsedSummaryText(listCountries);
    const titleText = expanded
      ? i18n("restaurantListTitle")
      : collapsedSummaryText(listCountries);
    const mapPick = Boolean(state.mapPickCode);
    return `
      <div class="map-panel-inner${expanded ? " is-expanded-layout" : " is-collapsed-layout"}"${expanded ? "" : ` data-expand-panel role="button" tabindex="0" aria-label="${i18n("expand")}"`}>
        <div class="panel-summary-row">
          <p class="panel-summary-title">${escapeHtml(titleText)}</p>
          <button type="button" class="panel-icon-btn" data-toggle-panel aria-label="${expanded ? i18n("collapse") : i18n("expand")}" title="${expanded ? i18n("collapse") : i18n("expand")}">
            ${expanded ? collapseIcon() : expandIcon()}
          </button>
        </div>
        ${
          expanded
            ? `<form class="filters expanded-filters" onsubmit="return false">${mapFilterFields({
                hideLabels: true,
                includeBorough: true,
                boroughOnly: mapPick,
              })}</form>
        <p class="panel-summary">${escapeHtml(summaryText)}</p>
        <div class="panel-body">
          <div class="stack">${renderExpandedPanelBody(listCountries)}</div>
        </div>`
            : ""
        }
      </div>
    `;
  }

  function renderMapPanel(visible) {
    return isMobileUi() ? renderMobileMapPanel(visible) : renderDesktopMapPanel(visible);
  }

  function renderMapFilters() {
    const count = activeFilterCount();
    const open = state.filtersOpen;
    return `
      <div class="map-overlay-controls${open ? " is-open" : ""}">
        <div class="filter-header">
          <button type="button" class="filter-toggle-btn" data-toggle-filters aria-expanded="${open ? "true" : "false"}">
            <span>${i18n("filterButton")}</span>
            ${!open && count ? `<span class="filter-badge" aria-hidden="true">${count}</span>` : ""}
          </button>
          ${
            open
              ? `<button type="button" class="filter-clear-all" data-clear-all-filters aria-label="${i18n("clearAllFilters")}" title="${i18n("clearAllFilters")}">${trashIcon()}</button>`
              : ""
          }
        </div>
        <div class="filter-body">
          ${mapFilterFields({ hideLabels: true, includeBorough: false })}
        </div>
      </div>
    `;
  }

  function renderDesktopMap() {
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
            ${
              state.lang === "en"
                ? ""
                : `<div class="filter-row">
              ${tierToggle()}
            </div>`
            }
            <div class="filter-row filter-row-split">
              ${multiselect("regions", i18n("region"), regionOptions(), state.regions, {
                emptyLabel: i18n("allRegions"),
              })}
              ${multiselect("countryCodes", i18n("country"), countryOptionList(), state.countryCodes, {
                emptyLabel: i18n("allCountries"),
                searchable: true,
                searchPlaceholder: i18n("searchCountries"),
              })}
            </div>
          </div>`
          }
          <div class="map-overlay-zoom">
            <div class="zoom-btns">
              <button type="button" data-zoom="in" aria-label="${i18n("zoomIn")}">+</button>
              <button type="button" data-zoom="out" aria-label="${i18n("zoomOut")}">−</button>
            </div>
            <p class="legend compact">
              <span><span class="swatch" style="background:var(--map-has)"></span>${i18n("legendHas")}</span>
              <span><span class="swatch" style="background:var(--map-empty)"></span>${i18n("legendEmpty")}</span>
              <span><span class="swatch" style="background:var(--map-idle);box-shadow:inset 0 0 0 1px var(--line)"></span>${i18n("legendIdle")}</span>
            </p>
          </div>
        </div>
        <aside class="map-overlay-panel">
          ${renderMapPanel(visible)}
        </aside>
      </div>
    `;
  }

  function renderMobileMap() {
    const visible = visibleCountries();
    return `
      <div class="map-page${state.panelExpanded ? " is-expanded" : ""}">
        <div class="map-main">
          <div class="map-stage" aria-hidden="false"></div>
          <div id="map-tooltip" class="map-tooltip" hidden></div>
          ${state.panelExpanded ? "" : renderMapFilters()}
          <div class="map-overlay-bl">
            <p class="legend compact legend-stack">
              <span><span class="swatch" style="background:var(--map-has)"></span>${i18n("legendHas")}</span>
              <span><span class="swatch" style="background:var(--map-empty)"></span>${i18n("legendEmpty")}</span>
              <span><span class="swatch" style="background:var(--map-idle);box-shadow:inset 0 0 0 1px var(--line)"></span>${i18n("legendIdle")}</span>
            </p>
          </div>
          <div class="map-overlay-br">
            <div class="zoom-btns">
              <button type="button" data-zoom="in" aria-label="${i18n("zoomIn")}">+</button>
              <button type="button" data-zoom="out" aria-label="${i18n("zoomOut")}">−</button>
            </div>
          </div>
        </div>
        <aside class="map-overlay-panel">
          ${renderMapPanel(visible)}
        </aside>
      </div>
    `;
  }

  function renderMap() {
    if (!isMobileUi()) {
      state.mapPickCode = "";
      state.filtersOpen = false;
      return renderDesktopMap();
    }
    return renderMobileMap();
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
    if (!isMobileUi()) {
      state.selectedCode = state.selectedCode === code ? "" : code;
      state.openMenu = null;
      state.menuQuery = "";
      state.mapPickCode = "";
      render();
      return;
    }
    const nextSelected = state.selectedCode === code ? "" : code;
    state.selectedCode = nextSelected;
    state.openMenu = null;
    state.menuQuery = "";
    state.filtersOpen = false;
    if (nextSelected) {
      state.mapPickCode = nextSelected;
      const currentK = state.mapTransform?.k ?? DEFAULT_ZOOM;
      if (currentK < SELECT_ZOOM) {
        pendingFlyCode = nextSelected;
      }
    } else {
      state.mapPickCode = "";
    }
    render();
  }

  function clearPeek() {
    if (!state.selectedCode && !state.mapPickCode) return;
    state.selectedCode = "";
    state.mapPickCode = "";
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
    state.openMenu = null;
    state.menuQuery = "";
    if (!isMobileUi()) {
      state.selectedCode = "";
      state.mapPickCode = "";
      pendingFlyCode = code;
      render();
      return;
    }
    state.selectedCode = code;
    const currentK = state.mapTransform?.k ?? DEFAULT_ZOOM;
    if (currentK < SELECT_ZOOM) {
      pendingFlyCode = code;
    }
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

  let imeComposing = false;

  document.addEventListener("compositionstart", (event) => {
    if (!event.target?.hasAttribute?.("data-ms-search")) return;
    imeComposing = true;
  });

  document.addEventListener("compositionend", (event) => {
    if (!event.target?.hasAttribute?.("data-ms-search")) return;
    imeComposing = false;
    state.menuQuery = event.target.value;
    const start = event.target.selectionStart;
    const end = event.target.selectionEnd;
    render();
    restoreCaret("[data-ms-search]", start, end);
  });

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const start = "selectionStart" in target ? target.selectionStart : null;
    const end = "selectionEnd" in target ? target.selectionEnd : null;

    if (target.hasAttribute("data-ms-search")) {
      const composing =
        imeComposing || event.isComposing || event.inputType === "insertCompositionText";
      state.menuQuery = target.value;
      if (composing) return;
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
        state.mapPickCode = "";
      }
      if (msKey === "regions") {
        state.countryCodes = state.countryCodes.filter((code) =>
          state.regions.length
            ? state.regions.includes(countriesByCode[code]?.region)
            : true,
        );
      }
      if (
        isMobileUi() &&
        (msKey === "regions" || msKey === "countryCodes" || msKey === "boroughs")
      ) {
        queueZoomToMinimum();
      } else if (!isMobileUi() && msKey === "countryCodes" && state.countryCodes.length === 1) {
        pendingFlyCode = state.countryCodes[0];
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
      const code = start.code;
      if (isMobileUi()) {
        if (mapClickTimer) {
          clearTimeout(mapClickTimer);
          mapClickTimer = null;
        }
        mapClickTimer = setTimeout(() => {
          mapClickTimer = null;
          if (code) peekCountry(code);
          else clearPeek();
        }, MAP_CLICK_DELAY_MS);
      } else if (code) {
        peekCountry(code);
      } else {
        clearPeek();
      }
    }
    if (mapPointers.size === 0) {
      mapPointerStart = null;
      mapDragMoved = false;
    }
  });

  document.addEventListener("dblclick", (event) => {
    if (!isMobileUi()) return;
    if (state.page !== "map") return;
    if (!event.target.closest?.(".map-stage svg")) return;
    event.preventDefault();
    if (mapClickTimer) {
      clearTimeout(mapClickTimer);
      mapClickTimer = null;
    }
    zoomToMinimum();
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
    const langBtn = event.target.closest?.("[data-set-lang]");
    if (langBtn) {
      setLang(langBtn.getAttribute("data-set-lang"));
      return;
    }

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
      if (key === "countryCodes") {
        state.selectedCode = "";
        state.mapPickCode = "";
      }
      if (key === "regions" || key === "countryCodes" || key === "boroughs") {
        queueZoomToMinimum();
      }
      render();
      return;
    }

    const toggleFilters = event.target.closest?.("[data-toggle-filters]");
    if (toggleFilters) {
      state.filtersOpen = !state.filtersOpen;
      state.openMenu = null;
      state.menuQuery = "";
      render();
      return;
    }

    const clearAll = event.target.closest?.("[data-clear-all-filters]");
    if (clearAll) {
      clearAllFilters();
      render();
      return;
    }

    const togglePanel = event.target.closest?.("[data-toggle-panel]");
    if (togglePanel) {
      state.panelExpanded = !state.panelExpanded;
      state.openMenu = null;
      state.menuQuery = "";
      state.filtersOpen = false;
      render();
      return;
    }

    const expandPanel = event.target.closest?.("[data-expand-panel]");
    if (expandPanel && isMobileUi() && !state.panelExpanded) {
      state.panelExpanded = true;
      state.openMenu = null;
      state.menuQuery = "";
      state.filtersOpen = false;
      render();
      return;
    }

    let needsRender = false;
    if (state.openMenu && !event.target.closest?.(".multiselect")) {
      state.openMenu = null;
      state.menuQuery = "";
      render();
      return;
    }
    if (
      state.filtersOpen &&
      isMobileUi() &&
      !event.target.closest?.(".map-overlay-controls")
    ) {
      state.filtersOpen = false;
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
      queueZoomToMinimum();
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
    if (!isMobileUi()) {
      state.filtersOpen = false;
    }
    render();
  });
  render();
})();
