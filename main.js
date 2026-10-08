
(function () {
  "use strict";

  const DATA = window.RandomKoreaData;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const GEOJSON_URLS = {
    wide: "https://raw.githubusercontent.com/KnellBalm/kr-admin-geojson/main/ctprvn.geojson",
    detail: "https://raw.githubusercontent.com/KnellBalm/kr-admin-geojson/main/sig.geojson"
  };

  const SIDO_CODES = {
    "11": "seoul",
    "26": "busan",
    "27": "daegu",
    "28": "incheon",
    "29": "gwangju",
    "30": "daejeon",
    "31": "ulsan",
    "36": "sejong",
    "41": "gyeonggi",
    "42": "gangwon",
    "43": "chungbuk",
    "44": "chungnam",
    "45": "jeonbuk",
    "46": "jeonnam",
    "47": "gyeongbuk",
    "48": "gyeongnam",
    "50": "jeju"
  };

  const state = {
    scope: "wide",
    theme: "all",
    party: "1",
    language: "ko",
    map: null,
    tileLayer: null,
    markerLayer: null,
    highlightLayer: null,
    wideGeoJSON: null,
    detailGeoJSON: null,
    detailDestinations: [],
    drawnDestination: null,
    tileErrors: 0,
    usingFallback: false,
    mapAvailable: false,
    tileFallbackStarted: false,
    boundariesLoading: true,
    boundariesFailed: false
  };

  const tileSources = [
    {
      name: "OpenStreetMap",
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
      maxZoom: 19
    },
    {
      name: "Esri World Street Map",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      attribution:
        'Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a>',
      maxZoom: 19
    }
  ];

  function t(key) {
    const dictionary = DATA.i18n[state.language] || DATA.i18n.ko;
    return dictionary[key] || DATA.i18n.ko[key] || key;
  }

  function setMapStatus(text, type) {
    const status = $("#mapStatus");
    if (!status) return;
    status.textContent = text;
    status.className = "status-pill" + (type ? " " + type : "");
  }

  function setMapNotice(text) {
    const notice = $("#mapNotice");
    if (notice) notice.textContent = text;
  }

  function setDrawStatus(text) {
    const status = $("#drawStatus");
    if (status) status.textContent = text;
  }

  function getRegion(code) {
    return DATA.regions.find((region) => region.code === code);
  }

  function getRegionName(region) {
    if (!region) return "";
    if (state.language === "en") return region.en || region.name;
    if (state.language === "zh") return region.zh || region.name;
    if (state.language === "ja") return region.ja || region.name;
    return region.name;
  }

  function getDestinationName(destination) {
    if (!destination) return "";

    if (destination.parentCode) {
      const parent = getRegion(destination.parentCode);
      const parentName = parent ? getRegionName(parent) : "";

      return parentName
        ? destination.name + " · " + parentName
        : destination.name;
    }

    return getRegionName(destination);
  }

  function getPartyName() {
    const labels = {
      "1": { ko: "1인", en: "Solo", zh: "1人", ja: "1人" },
      "2": { ko: "2인", en: "2 people", zh: "2人", ja: "2人" },
      "3-4": { ko: "3~4인", en: "3–4 people", zh: "3–4人", ja: "3〜4人" },
      "5+": { ko: "5인 이상", en: "5+ people", zh: "5人以上", ja: "5人以上" }
    };

    return (labels[state.party] || labels["1"])[state.language] ||
      labels[state.party].ko;
  }

  function randomItem(items) {
    if (!items || !items.length) return null;
    return items[Math.floor(Math.random() * items.length)];
  }

  function getCandidates() {
    if (state.scope === "detail") {
      const destinations = state.detailDestinations.length
        ? state.detailDestinations
        : DATA.detailedDistricts;

      return destinations.filter((district) => {
        if (state.theme === "all") return true;

        const parent = getRegion(district.parentCode);
        const districtThemes = district.themes || [];
        const parentThemes = parent ? parent.themes || [] : [];

        return districtThemes.includes(state.theme) ||
          parentThemes.includes(state.theme);
      });
    }

    return DATA.regions.filter((region) =>
      state.theme === "all" ||
      (region.themes || []).includes(state.theme)
    );
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(
      /[&<>"']/g,
      (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character]
    );
  }

  function addBaseTiles(sourceIndex) {
    if (!state.map || !window.L) return;

    const source = tileSources[sourceIndex];
    if (!source) return;

    if (state.tileLayer) {
      state.map.removeLayer(state.tileLayer);
    }

    state.tileErrors = 0;

    const layer = L.tileLayer(source.url, {
      attribution: source.attribution,
      maxZoom: source.maxZoom,
      minZoom: 2,
      updateWhenIdle: true,
      keepBuffer: 2,
      crossOrigin: true
    });

    state.tileLayer = layer;

    layer.on("tileload", function () {
      setMapStatus(
        state.usingFallback ? t("mapPartial") : t("mapReady"),
        state.usingFallback ? "warning" : "ready"
      );
    });

    layer.on("tileerror", function () {
      state.tileErrors += 1;

      if (
        sourceIndex === 0 &&
        state.tileErrors >= 3 &&
        !state.tileFallbackStarted
      ) {
        state.tileFallbackStarted = true;
        state.usingFallback = true;
        addBaseTiles(1);
      } else if (state.tileErrors >= 3) {
        setMapStatus("지도 연결 오류", "warning");
        setMapNotice(
          "지도 타일 연결에 실패했습니다. 인터넷 연결을 확인하세요. " +
          "행정구역 데이터가 로드되면 추첨 기능은 별도로 이용할 수 있습니다."
        );
      }
    });

    layer.addTo(state.map);
  }

  function initMap() {
    if (!window.L || !$("#map")) {
      setMapStatus("지도 라이브러리 오류", "warning");
      setMapNotice(
        "Leaflet을 불러오지 못했습니다. 인터넷 연결을 확인하세요."
      );
      return;
    }

    try {
      state.map = L.map("map", {
        center: [36.3, 127.8],
        zoom: 7,
        minZoom: 5,
        maxZoom: 18,
        zoomControl: true,
        scrollWheelZoom: true
      });

      state.mapAvailable = true;
      state.markerLayer = L.layerGroup().addTo(state.map);
      state.highlightLayer = L.layerGroup().addTo(state.map);

      addBaseTiles(0);

      window.setTimeout(() => {
        if (state.map) state.map.invalidateSize();
      }, 200);

      loadBoundaries();
    } catch (error) {
      state.mapAvailable = false;
      console.error("지도 초기화 오류:", error);
      setMapStatus("지도 초기화 실패", "warning");
      setMapNotice("지도 표시 중 문제가 발생했습니다.");
    }
  }

  async function fetchGeoJSON(url) {
    const response = await fetch(url, { cache: "force-cache" });

    if (!response.ok) {
      throw new Error("행정구역 데이터 요청 실패: " + response.status);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.features)) {
      throw new Error("올바르지 않은 GeoJSON 데이터입니다.");
    }

    return data;
  }

  function getFeatureProperties(feature) {
    return feature && feature.properties ? feature.properties : {};
  }

  function getFeatureCenter(feature) {
    try {
      const layer = L.geoJSON(feature);
      const bounds = layer.getBounds();

      if (bounds.isValid()) {
        const center = bounds.getCenter();
        return { lat: center.lat, lng: center.lng };
      }
    } catch (error) {
      console.warn("지역 중심 계산 실패:", error);
    }

    return null;
  }

  function normalizeName(value) {
    return String(value || "")
      .replace(/\s+/g, "")
      .replace(/[·ㆍ]/g, "");
  }

  function findExistingDistrict(name, parentCode) {
    const normalized = normalizeName(name);

    return DATA.detailedDistricts.find((district) => {
      return district.parentCode === parentCode &&
        normalizeName(district.name) === normalized;
    });
  }

  function getParentCode(properties) {
    const code = String(properties.CTPRVN_CD || "");
    return SIDO_CODES[code] || null;
  }

  function makeDetailDestination(feature) {
    const properties = getFeatureProperties(feature);
    const parentCode = getParentCode(properties);

    const name =
      properties.SIG_KOR_NM ||
      properties.FULL_NM ||
      "이름 없는 지역";

    const existing = findExistingDistrict(name, parentCode);
    const center = getFeatureCenter(feature);

    if (!center) return null;

    const fullName = properties.FULL_NM || name;

    return {
      code: String(properties.SIG_CD || fullName),
      name: name,
      fullName: fullName,
      parentCode: parentCode,
      lat: center.lat,
      lng: center.lng,
      spots: existing
        ? existing.spots
        : [name + " 주요 명소", "지역 관광지", "지역 시장 및 거리"],
      food: existing ? existing.food : "지역 대표 먹거리",
      themes: existing
        ? existing.themes
        : (getRegion(parentCode)?.themes || ["nature"]),
      desc: existing
        ? existing.desc
        : name + "의 명소와 지역 먹거리를 둘러보는 여행입니다.",
      feature: feature
    };
  }

  function styleWideFeature(feature) {
    const properties = getFeatureProperties(feature);
    const code = String(properties.CTPRVN_CD || "");

    return {
      color: "#ffffff",
      weight: 1.5,
      opacity: 1,
      fillColor: "#f07832",
      fillOpacity: 0.12,
      className: "wide-boundary",
      interactive: true
    };
  }

  function styleDetailFeature() {
    return {
      color: "#aab5bf",
      weight: 0.8,
      opacity: 0.85,
      fillColor: "#f7a36f",
      fillOpacity: 0.12
    };
  }

  async function loadBoundaries() {
    if (!state.mapAvailable) return;

    state.boundariesLoading = true;
    setMapStatus("행정구역 불러오는 중", "warning");
    setMapNotice("전국 시·도와 시·군·구 경계 데이터를 불러오고 있습니다.");

    try {
      const results = await Promise.all([
        fetchGeoJSON(GEOJSON_URLS.wide),
        fetchGeoJSON(GEOJSON_URLS.detail)
      ]);

      state.wideGeoJSON = results[0];
      state.detailGeoJSON = results[1];

      state.detailDestinations = state.detailGeoJSON.features
        .map(makeDetailDestination)
        .filter(Boolean);

      state.boundariesLoading = false;
      state.boundariesFailed = false;

      renderRegionMarkers();

      setMapStatus("행정구역 연결됨", "ready");
      setMapNotice(
        "전국 시·도와 " + state.detailDestinations.length +
        "개 세부 행정구역의 경계 데이터를 불러왔습니다."
      );
    } catch (error) {
      state.boundariesLoading = false;
      state.boundariesFailed = true;

      console.error("행정구역 GeoJSON 로드 실패:", error);

      setMapStatus("경계 데이터 연결 실패", "warning");
      setMapNotice(
        "행정구역 경계 데이터를 불러오지 못했습니다. " +
        "인터넷 연결을 확인하세요. 기존 지역 데이터로 추첨할 수 있습니다."
      );

      renderRegionMarkers();
    }
  }

  function makeDestinationIcon() {
    return L.divIcon({
      className: "",
      html: '<div class="destination-marker"><span>📍</span></div>',
      iconSize: [38, 38],
      iconAnchor: [19, 36],
      popupAnchor: [0, -35]
    });
  }

  function renderRegionMarkers() {
    if (!state.mapAvailable || !state.markerLayer) return;

    state.markerLayer.clearLayers();

    DATA.regions.forEach((region) => {
      const marker = L.circleMarker([region.lat, region.lng], {
        radius: 4,
        color: "#ffffff",
        weight: 1.5,
        fillColor: "#f07832",
        fillOpacity: 0.85
      });

      marker.bindTooltip(getRegionName(region), {
        direction: "top",
        offset: [0, -5]
      });

      marker.addTo(state.markerLayer);
    });
  }

  function clearHighlights() {
    if (state.highlightLayer) {
      state.highlightLayer.clearLayers();
    }
  }

  function findWideFeature(destination) {
    if (!state.wideGeoJSON) return null;

    const region = destination.parentCode
      ? getRegion(destination.parentCode)
      : destination;

    if (!region) return null;

    const regionCode = Object.keys(SIDO_CODES).find(
      (code) => SIDO_CODES[code] === region.code
    );

    if (!regionCode) return null;

    return state.wideGeoJSON.features.find((feature) => {
      const properties = getFeatureProperties(feature);
      return String(properties.CTPRVN_CD || "") === regionCode;
    }) || null;
  }

  function findDetailFeature(destination) {
    if (destination.feature) return destination.feature;
    if (!state.detailGeoJSON) return null;

    const destinationCode = String(destination.code || "");

    return state.detailGeoJSON.features.find((feature) => {
      const properties = getFeatureProperties(feature);

      if (
        destinationCode &&
        String(properties.SIG_CD || "") === destinationCode
      ) {
        return true;
      }

      const parentCode = getParentCode(properties);

      return parentCode === destination.parentCode &&
        normalizeName(properties.SIG_KOR_NM) ===
        normalizeName(destination.name);
    }) || null;
  }

  function addBoundaryHighlight(destination) {
    const feature = state.scope === "detail"
      ? findDetailFeature(destination)
      : findWideFeature(destination);

    if (!feature) return null;

    const layer = L.geoJSON(feature, {
      style: {
        color: "#dc4545",
        weight: 3,
        opacity: 1,
        fillColor: "#ff8b3d",
        fillOpacity: 0.42
      },
      interactive: false
    });

    layer.addTo(state.highlightLayer);

    return layer;
  }

  function highlightDestination(destination) {
    if (!state.mapAvailable || !state.map || !window.L) return;

    clearHighlights();

    let boundaryLayer = addBoundaryHighlight(destination);

    const marker = L.marker(
      [destination.lat, destination.lng],
      { icon: makeDestinationIcon(), zIndexOffset: 1000 }
    );

    const popupName = getDestinationName(destination);
    const spots = (destination.spots || []).slice(0, 2).join(" · ");

    marker.bindPopup(
      "<strong>" + escapeHtml(popupName) + "</strong><br>" +
      escapeHtml(spots)
    );

    marker.addTo(state.highlightLayer);

    try {
      if (boundaryLayer) {
        const bounds = boundaryLayer.getBounds();

        if (bounds.isValid()) {
          state.map.fitBounds(bounds, {
            padding: [35, 35],
            maxZoom: state.scope === "detail" ? 12 : 9,
            animate: true
          });
        } else {
          state.map.setView([destination.lat, destination.lng], 10);
        }
      } else {
        // 경계 데이터가 없을 때 원형을 대신 그리지 않습니다.
        state.map.setView(
          [destination.lat, destination.lng],
          state.scope === "detail" ? 10 : 7
        );

        setMapNotice(
          "해당 지역의 경계 데이터를 찾지 못해 위치만 표시했습니다."
        );
      }

      marker.openPopup();
    } catch (error) {
      console.warn("지도 확대 오류:", error);
      state.map.setView(
        [destination.lat, destination.lng],
        state.scope === "detail" ? 10 : 7
      );
    }
  }

  function updateCourseCards(destination) {
    const grid = $("#courseGrid");
    if (!grid) return;

    const spots = destination.spots || [];

    const templates = [
      {
        icon: "📸",
        title: "첫 번째 코스 · 명소",
        description: spots[0] || destination.name
      },
      {
        icon: "🍜",
        title: "두 번째 코스 · 먹거리",
        description: destination.food || "지역 맛집 탐방"
      },
      {
        icon: "🌿",
        title: "세 번째 코스 · 여유",
        description: spots[1] || "주변 산책 및 자유 일정"
      }
    ];

    grid.replaceChildren();

    templates.forEach((item) => {
      const card = document.createElement("article");
      card.className = "course-card";

      const icon = document.createElement("span");
      icon.className = "course-icon";
      icon.textContent = item.icon;

      const title = document.createElement("h3");
      title.textContent = item.title;

      const description = document.createElement("p");
      description.textContent = item.description;

      card.append(icon, title, description);
      grid.appendChild(card);
    });
  }

  function renderResult(destination) {
    const card = $("#resultCard");
    if (!card) return;

    $("#resultType").textContent =
      state.scope === "detail" ? "세부 여행지" : t("result");

    $("#resultName").textContent = getDestinationName(destination);
    $("#resultDescription").textContent = destination.desc || "";
    $("#resultFood").textContent = destination.food || "지역 먹거리";
    $("#resultSpots").textContent = (destination.spots || []).join(" · ");
    $("#resultParty").textContent = getPartyName();

    const query = encodeURIComponent(
      getDestinationName(destination) + " " +
      ((destination.spots || [])[0] || "")
    );

    $("#naverMapLink").href =
      "https://map.naver.com/p/search/" + query;

    card.hidden = false;
    updateCourseCards(destination);
  }

  function drawDestination() {
    if (state.boundariesLoading && state.scope === "detail") {
      setDrawStatus(
        "전국 세부 지역 데이터를 불러오는 중입니다. 잠시 후 다시 뽑아주세요."
      );
      return;
    }

    const candidates = getCandidates();

    if (!candidates.length) {
      setDrawStatus(t("empty"));
      return;
    }

    const destination = randomItem(candidates);
    if (!destination) {
      setDrawStatus(t("empty"));
      return;
    }

    state.drawnDestination = destination;

    renderResult(destination);
    highlightDestination(destination);

    setDrawStatus(
      "🎉 " + getDestinationName(destination) + " 여행지를 추천합니다!"
    );

    const card = $("#resultCard");

    if (card && window.matchMedia("(max-width: 1000px)").matches) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function setActiveButton(selector, attribute, value) {
    $$(selector).forEach((button) => {
      const active = button.getAttribute(attribute) === value;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function updateLanguage() {
    const heroTitle = $(".hero h1");
    const drawButton = $("#drawBtn");

    const heroText = {
      ko: "오늘 어디로 떠나볼까요?",
      en: "Where will you travel today?",
      zh: "今天想去哪里旅行？",
      ja: "今日はどこへ旅行しますか？"
    };

    const drawText = {
      ko: "🎲 랜덤 여행지 뽑기",
      en: "🎲 Pick a random destination",
      zh: "🎲 随机抽取旅行目的地",
      ja: "🎲 ランダム旅行先を選ぶ"
    };

    if (heroTitle) {
      heroTitle.textContent = heroText[state.language];
    }

    if (drawButton) {
      drawButton.textContent = drawText[state.language];
    }

    const scopeSelect = $("#scopeSelect");

    if (scopeSelect) {
      scopeSelect.options[0].textContent = t("wide");
      scopeSelect.options[1].textContent = t("detail");
    }

    const copyButton = $("#copyResultBtn");
    if (copyButton) copyButton.textContent = t("copy");

    if (state.mapAvailable) {
      renderRegionMarkers();

      if (!state.boundariesLoading) {
        setMapStatus(
          state.boundariesFailed
            ? "경계 데이터 연결 실패"
            : "행정구역 연결됨",
          state.boundariesFailed ? "warning" : "ready"
        );
      }
    }

    if (state.drawnDestination) {
      renderResult(state.drawnDestination);
    }
  }

  function resetMap() {
    clearHighlights();

    if (state.mapAvailable && state.map) {
      state.map.setView([36.3, 127.8], 7);
      renderRegionMarkers();
    }

    setMapNotice(
      state.mapAvailable
        ? "전국 지도로 돌아왔습니다."
        : "지도 연결을 확인하세요. 추첨 기능은 이용 가능합니다."
    );
  }

  async function copyResult() {
    const destination = state.drawnDestination;

    if (!destination) {
      setDrawStatus("먼저 여행지를 추첨해 주세요.");
      return;
    }

    const text = [
      "랜덤코리아 여행 추천",
      "여행지: " + getDestinationName(destination),
      "추천 명소: " + (destination.spots || []).join(", "),
      "대표 먹거리: " + (destination.food || ""),
      "여행 인원: " + getPartyName(),
      "네이버 지도: " + $("#naverMapLink").href
    ].join("\n");

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();

        const success = document.execCommand("copy");
        textarea.remove();

        if (!success) throw new Error("복사에 실패했습니다.");
      }

      setDrawStatus(t("copied"));
    } catch (error) {
      console.warn("클립보드 복사 실패:", error);
      setDrawStatus(t("copyFail"));
    }
  }

  function bindEvents() {
    const scopeSelect = $("#scopeSelect");

    if (scopeSelect) {
      scopeSelect.addEventListener("change", function (event) {
        state.scope = event.target.value;

        setDrawStatus(
          state.scope === "detail"
            ? "전국 시·군·구 중에서 여행지를 추첨합니다."
            : "전국 광역시·도 중에서 여행지를 추첨합니다."
        );

        if (state.drawnDestination) {
          clearHighlights();
          state.drawnDestination = null;
          $("#resultCard").hidden = true;
        }
      });
    }

    $$(".theme-button").forEach((button) => {
      button.addEventListener("click", function () {
        state.theme = button.dataset.theme;
        setActiveButton(".theme-button", "data-theme", state.theme);
        setDrawStatus("테마를 선택했습니다. 여행지를 뽑아보세요!");
      });
    });

    $$(".party-chip").forEach((button) => {
      button.addEventListener("click", function () {
        state.party = button.dataset.party;
        setActiveButton(".party-chip", "data-party", state.party);

        if (state.drawnDestination) {
          $("#resultParty").textContent = getPartyName();
        }
      });
    });

    $("#drawBtn").addEventListener("click", drawDestination);
    $("#copyResultBtn").addEventListener("click", copyResult);
    $("#resetMapBtn").addEventListener("click", resetMap);

    $("#languageSelect").addEventListener("change", function (event) {
      state.language = DATA.i18n[event.target.value]
        ? event.target.value
        : "ko";

      document.documentElement.lang = state.language;
      updateLanguage();
    });

    window.addEventListener("resize", function () {
      if (state.mapAvailable && state.map) {
        state.map.invalidateSize({ pan: false });
      }
    });
  }

  function start() {
    if (
      !DATA ||
      !Array.isArray(DATA.regions) ||
      !Array.isArray(DATA.detailedDistricts)
    ) {
      setDrawStatus(
        "지역 데이터를 불러오지 못했습니다. data.js 파일을 확인해 주세요."
      );
      setMapStatus("데이터 오류", "warning");
      return;
    }

    bindEvents();
    initMap();

    setDrawStatus(
      "전국 " + DATA.regions.length +
      "개 광역 지역과 세부 시·군·구에서 추첨할 수 있습니다."
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();/* 양옆 광고 배너 스크롤 따라오기 */
(() => {
  function initSideAds() {
    const ads = document.querySelectorAll(".side-ad");
    if (!ads.length) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    let previousScroll = window.scrollY;
    let offset = 0;
    let animationId = null;
    let previousTime = 0;

    function render() {
      ads.forEach(ad => {
        ad.style.setProperty("--ad-offset", `${offset}px`);
      });
    }

    function animate(time) {
      const elapsed = previousTime
        ? Math.min(time - previousTime, 64)
        : 16;

      previousTime = time;
      offset *= Math.exp(-elapsed / 350);

      if (Math.abs(offset) < 0.1) {
        offset = 0;
        render();
        animationId = null;
        previousTime = 0;
        return;
      }

      render();
      animationId = requestAnimationFrame(animate);
    }

    window.addEventListener("scroll", () => {
      const currentScroll = window.scrollY;
      const difference = currentScroll - previousScroll;
      previousScroll = currentScroll;

      if (reducedMotion.matches) {
        offset = 0;
        render();
        return;
      }

      /* 아래로 내릴 때 위쪽에 뒤처졌다가 원위치로 복귀 */
      offset = Math.max(-60, Math.min(60, offset - difference));
      render();

      if (animationId === null) {
        animationId = requestAnimationFrame(animate);
      }
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSideAds, {
      once: true
    });
  } else {
    initSideAds();
  }
})();
