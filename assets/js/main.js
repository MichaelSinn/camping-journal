const form = document.querySelector('#submit-btn');
const weather = document.querySelector('#filter-weather');
const locationEl = document.querySelector('#filter-location');
const googleApiScript = $("#maps-api");
let scriptSrc = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap&v=weekly`;
googleApiScript.attr("src", scriptSrc);

form.addEventListener('click', function(e) {
    e.preventDefault();
    const weatherData = weather.value;
    const locationData = locationEl.value;
    console.log(weatherData);
    console.log(locationData);
});

let map;
let script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
script.async = true;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
    });
}

window.initMap = initMap;

document.head.appendChild(script);

localStorage.getItem('selected-sites');
