function getNearbyPubs(lat, lon) {
  const radius = 1500;
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="pub"](around:${radius},${lat},${lon});
      way["amenity"="pub"](around:${radius},${lat},${lon});
      relation["amenity"="pub"](around:${radius},${lat},${lon});
    );
    out center;
  `;

  fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  })
    .then(res => res.json())
    .then(data => {
      const pubs = data.elements
        .filter(pub => {
          const hasName = pub.tags?.name;
          const hasCoords = pub.lat && pub.lon || pub.center?.lat && pub.center?.lon;
          return hasName && hasCoords;
        })
        .map(pub => {
          const pubLat = pub.lat || pub.center.lat;
          const pubLon = pub.lon || pub.center.lon;
          const distance = Math.sqrt(Math.pow(pubLat - lat, 2) + Math.pow(pubLon - lon, 2));
          return {
            ...pub,
            lat: pubLat,
            lon: pubLon,
            distance: distance,
          };
        })
        .sort((a, b) => a.distance - b.distance);

      if (pubs.length === 0) {
        document.getElementById("pubInfo").textContent = "No pubs found nearby.";
        return;
      }

      const pub = pubs[0];
      const tags = pub.tags || {};

      const name = tags.name || "Unnamed Pub";
      const address = `${tags['addr:housenumber'] || ''} ${tags['addr:street'] || ''}, ${tags['addr:postcode'] || ''}`.trim();
      const openingHours = tags.opening_hours || "Unknown";
      const phone = tags.phone || "Not listed";
      const website = tags.website ? `<a href="${tags.website}" target="_blank">${tags.website}</a>` : "Not listed";
      const wheelchair = tags.wheelchair === "yes" ? "✅ Yes" : (tags.wheelchair === "no" ? "❌ No" : "Unknown");
      const outdoor = tags.outdoor_seating === "yes" ? "✅ Yes" : (tags.outdoor_seating === "no" ? "❌ No" : "Unknown");
      const food = tags.food === "no" ? "❌ No" : (tags.food === "yes" ? "✅ Yes" : (tags.cuisine || "Unknown"));

      document.getElementById("pubInfo").innerHTML = `
        <h2>${name}</h2>
        <p><strong>Address:</strong> ${address || "Not listed"}</p>
        <p><strong>Opening Hours:</strong> ${openingHours}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Website:</strong> ${website}</p>
        <p><strong>Wheelchair Accessible:</strong> ${wheelchair}</p>
        <p><strong>Outdoor Seating:</strong> ${outdoor}</p>
        <p><strong>Food:</strong> ${food}</p>
        <a href="https://www.openstreetmap.org/?mlat=${pub.lat}&mlon=${pub.lon}" target="_blank">View on OpenStreetMap</a>
      `;

      const userMarker = L.marker([lat, lon]).bindPopup("You are here");
      const pubMarker = L.marker([pub.lat, pub.lon]).bindPopup(name);

      const group = L.featureGroup([userMarker, pubMarker]).addTo(window.map);
      window.map.fitBounds(group.getBounds(), { padding: [30, 30] });
    })
    .catch(error => {
      console.error(error);
      document.getElementById("pubInfo").textContent = "Error fetching pub data.";
    });
}

function init() {
  if (!navigator.geolocation) {
    document.getElementById("pubInfo").textContent = "Geolocation not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      //const lat = pos.coords.latitude;
     // const lon = pos.coords.longitude;
     const lat = 51.487499;
const lon = -0.115920;

      window.map = L.map("map").setView([lat, lon], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
      }).addTo(window.map);

      getNearbyPubs(lat, lon);
    },
    () => {
      document.getElementById("pubInfo").textContent = "Failed to get your location.";
    }
  );
}

window.onload = init;
