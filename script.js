// =========================
// Scoutly - script.js
// =========================

let businesses = [];
let NEXT_ID = 1;
const favorites = new Set(JSON.parse(localStorage.getItem("scoutly_favs") || "[]"));

let map, markers;

// =========================
// Initialize Map
// =========================
function initMap() {
  map = L.map("map").setView([14.5995, 120.9842], 12); // Default Manila

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  markers = L.markerClusterGroup();
  map.addLayer(markers);
}

// =========================
// Render Map + List
// =========================
function renderAll() {
  markers.clearLayers();
  const listPanel = document.getElementById("listPanel");
  listPanel.innerHTML = "";

  businesses.forEach((b) => {
    const marker = L.marker([b.lat, b.lng]);
    marker.bindPopup(
      `<b>${b.name}</b><br>${b.address}<br><i>${b.notes || ""}</i>`
    );
    markers.addLayer(marker);

    const item = document.createElement("div");
    item.className = "item"; // ✅ fixed class
    item.innerHTML = `
      <strong>${b.name}</strong><br>
      <small>${b.category} — ${b.address}</small><br>
      <button onclick="toggleFavorite(${b.id})">
        ${favorites.has(b.id) ? "★ Remove Favorite" : "☆ Add Favorite"}
      </button>
    `;
    listPanel.appendChild(item);
  });
}

function renderFiltered(list) {
  markers.clearLayers();
  const listPanel = document.getElementById("listPanel");
  listPanel.innerHTML = "";

  list.forEach((b) => {
    const marker = L.marker([b.lat, b.lng]);
    marker.bindPopup(
      `<b>${b.name}</b><br>${b.address}<br><i>${b.notes || ""}</i>`
    );
    markers.addLayer(marker);

    const item = document.createElement("div");
    item.className = "item"; // ✅ fixed class
    item.innerHTML = `
      <strong>${b.name}</strong><br>
      <small>${b.category} — ${b.address}</small><br>
      <button onclick="toggleFavorite(${b.id})">
        ${favorites.has(b.id) ? "★ Remove Favorite" : "☆ Add Favorite"}
      </button>
    `;
    listPanel.appendChild(item);
  });
}

// =========================
// Search
// =========================
document.getElementById("searchInput").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      (b.address && b.address.toLowerCase().includes(q)) ||
      (b.province && b.province.toLowerCase().includes(q)) ||
      (b.barangay && b.barangay.toLowerCase().includes(q))
  );
  renderFiltered(filtered);
});

document.getElementById("clearSearch").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  renderAll();
});

// =========================
// Favorites
// =========================
function toggleFavorite(id) {
  if (favorites.has(id)) {
    favorites.delete(id);
  } else {
    favorites.add(id);
  }
  localStorage.setItem("scoutly_favs", JSON.stringify([...favorites]));
  renderAll();
}

// =========================
// Add Business
// =========================
document.getElementById("addBtn").addEventListener("click", () => {
  document.getElementById("modalBackdrop").style.display = "flex";
});

document.getElementById("cancelAdd").addEventListener("click", () => {
  document.getElementById("modalBackdrop").style.display = "none";
});

document.getElementById("saveAdd").addEventListener("click", () => {
  const newBiz = {
    id: NEXT_ID++,
    name: document.getElementById("b_name").value,
    category: document.getElementById("b_category").value,
    address: document.getElementById("b_address").value,
    province: document.getElementById("b_province").value,
    barangay: document.getElementById("b_barangay").value,
    lat: parseFloat(document.getElementById("b_lat").value),
    lng: parseFloat(document.getElementById("b_lng").value),
    notes: document.getElementById("b_notes").value,
  };
  businesses.push(newBiz);
  renderAll();
  document.getElementById("modalBackdrop").style.display = "none";
});

// =========================
// Export / Import
// =========================
document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(businesses, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "businesses.json";
  a.click();
});

document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result);
      businesses = imported;
      NEXT_ID = Math.max(...businesses.map((b) => b.id)) + 1;
      renderAll();
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
});

// =========================
// Init
// =========================
window.onload = () => {
  initMap();

  // ✅ load JSON only once, after map is ready
  fetch("places.json")
    .then((res) => res.json())
    .then((data) => {
      businesses = data;
      NEXT_ID = Math.max(...businesses.map((b) => b.id)) + 1;
      renderAll();
    })
    .catch((err) => console.error("Error loading places.json", err));
};
