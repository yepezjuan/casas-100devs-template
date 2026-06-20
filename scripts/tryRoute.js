// THROWAWAY prototype — validates Google **Routes API** waypoint optimization in
// total isolation. Self-contained: everything (depot, test clients, route
// logic, output) lives here. No app imports (no controllers/routers/utils).
//
//   node scripts/tryRoute.js
//
// Uses the actively-supported Routes API (computeRoutes) via a raw axios call,
// since the legacy @googlemaps SDK doesn't speak it. Once this proves out, the
// logic gets ported into utils/routing.js.

//TODO: need to test the routing feature some more before adding to project
require("dotenv").config({ path: "./config/.env" }); // same path as server.js

const axios = require("axios");

// --- Test fixture (Pasadena / Altadena, CA) ----------------------------------
const DEPOT = { lat: 34.1161821, lng: -118.0145946 }; // home (Arcadia/Temple City)

const SERVICE_MINUTES = 40; // assumed time worked at each client

const CLIENTS = [
  { name: "Old Town Pasadena", lat: 34.1478, lng: -118.1445 },
  { name: "Altadena", lat: 34.1897, lng: -118.1312 },
  { name: "San Marino", lat: 34.1212, lng: -118.1065 },
  { name: "Sierra Madre", lat: 34.1617, lng: -118.0531 },
];

// Routes API TRAFFIC_AWARE needs a future departure time.
// need to get current date to make route
const DEPARTURE_TIME = "2026-06-19T15:00:00Z"; // 8:00 AM PDT
// -----------------------------------------------------------------------------

const ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

const waypoint = (p) => ({
  location: { latLng: { latitude: p.lat, longitude: p.lng } },
});

// Routes API durations come back as strings like "1234s".
const secs = (d) => parseInt(d, 10);

async function makeRoute(clients, depot) {
  const body = {
    origin: waypoint(depot),
    destination: waypoint(depot), // round trip: back home at the end
    intermediates: clients.map(waypoint),
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE", // traffic-aware durations
    optimizeWaypointOrder: true, // reorder intermediates for efficiency
    departureTime: DEPARTURE_TIME,
  };

  let data;
  try {
    ({ data } = await axios.post(ROUTES_URL, body, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.MAPS_API_KEY,
        // Routes API requires an explicit field mask of what to return.
        "X-Goog-FieldMask": [
          "routes.optimizedIntermediateWaypointIndex",
          "routes.distanceMeters",
          "routes.duration",
          "routes.legs.distanceMeters",
          "routes.legs.duration",
        ].join(","),
      },
    }));
  } catch (err) {
    const g = err.response && err.response.data && err.response.data.error;
    throw new Error(g ? `${g.status}: ${g.message}` : err.message);
  }

  const route = data.routes && data.routes[0];
  if (!route) throw new Error("Routes API returned no routes.");

  // optimizedIntermediateWaypointIndex[k] = original index of the k-th visited stop.
  const order =
    route.optimizedIntermediateWaypointIndex || clients.map((_, i) => i);
  const orderedClients = order.map((i) => clients[i]);

  const totalDistanceMeters = route.distanceMeters;
  const totalDurationSeconds = secs(route.duration);

  // legs are returned in optimized order; legs[k] arrives at orderedClients[k]
  // (the final leg returns home).
  const schedule = [];
  let cursor = Date.now();
  for (let k = 0; k < orderedClients.length; k++) {
    cursor += secs(route.legs[k].duration) * 1000; // drive to this stop
    const arrive = new Date(cursor);
    cursor += SERVICE_MINUTES * 60 * 1000; // work at this stop
    const depart = new Date(cursor);
    schedule.push({ name: orderedClients[k].name, arrive, depart });
  }

  return {
    orderedClients,
    totalDistanceMeters,
    totalDurationSeconds,
    schedule,
  };
}

function buildDeepLink(depot, orderedClients) {
  const coord = (p) => `${p.lat},${p.lng}`;
  const params = new URLSearchParams({
    api: "1",
    travelmode: "driving",
    origin: coord(depot),
    destination: coord(depot),
    waypoints: orderedClients.map(coord).join("|"),
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

// --- Run ---------------------------------------------------------------------
const miles = (m) => (m / 1609.344).toFixed(1);
const mins = (s) => Math.round(s / 60);
const clock = (d) =>
  d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

(async () => {
  try {
    const r = await makeRoute(CLIENTS, DEPOT);

    console.log(
      "\n=== Optimized round trip (Pasadena/Altadena) — Routes API ===",
    );
    console.log(
      `Total: ${miles(r.totalDistanceMeters)} mi, ${mins(
        r.totalDurationSeconds,
      )} min driving  (+${SERVICE_MINUTES} min/stop service)\n`,
    );

    console.log("Leave home ->");
    r.schedule.forEach((s, i) => {
      console.log(
        `  ${i + 1}. ${s.name.padEnd(20)} arrive ${clock(
          s.arrive,
        )}  depart ${clock(s.depart)}`,
      );
    });
    console.log("  -> return home\n");

    console.log("Google Maps deep link (turn-by-turn in optimized order):");
    console.log(buildDeepLink(DEPOT, r.orderedClients) + "\n");
  } catch (err) {
    console.error("\nmakeRoute failed:", err.message);
    if (
      /PERMISSION_DENIED|not authorized|API key|SERVICE_DISABLED/i.test(
        err.message,
      )
    ) {
      console.error(
        "Hint: enable the *Routes API* on the project AND allow it under the " +
          "key's API restrictions (separate from the legacy Directions API).",
      );
    }
    process.exit(1);
  }
})();
