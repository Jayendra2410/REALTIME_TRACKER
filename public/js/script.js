const socket = io();

if(navigator.geolocation){
    navigator.geolocation.watchPosition(
        (position) => {
            const {latitude, longitude} = position.coords;
            socket.emit('send-location', {latitude, longitude});
        }, 
        (error) => {
        console.log(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

const map = L.map("map").setView([0, 0], 15);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        "&copy; <a href='https://www.openstreetmap.org/copyright'>BuddyWay</a> contributors",
}).addTo(map);

const markers = {};


socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude]);
    if (!markers[id]) {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    } else {
        markers[id].setLatLng([latitude, longitude]);
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});