let map;
const mapScript = $("#map-script");
mapScript.attr("src", `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap&v=weekly`);

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
    });
}

window.initMap = initMap;