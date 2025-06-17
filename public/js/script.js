const socket = io();
const map = L.map("map").setView([0, 0], 15);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
}).addTo(map);

const markers = {};
let ownId = null;

// Get the socket ID as soon as connected
socket.on("connect", () => {
    ownId = socket.id;
});

function addSmallRandomOffset(value) {
    return value + (Math.random() - 0.5) * 0.0005;
}

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            let { latitude, longitude } = position.coords;
            latitude = addSmallRandomOffset(latitude);
            longitude = addSmallRandomOffset(longitude);
            if (ownId) {
                socket.emit("send-location", { latitude, longitude });
            }
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    if (!markers[id]) {
        markers[id] = L.marker([latitude, longitude])
            .addTo(map)
            .bindTooltip(id === ownId ? "You" : `User: ${id.slice(0, 5)}`, { permanent: true });
    } else {
        markers[id].setLatLng([latitude, longitude]);
    }
    if (id === ownId) {
        map.setView([latitude, longitude], 15);
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
