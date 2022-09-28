console.log(API_KEY);
const form = document.querySelector('#submit-btn')
const weather = document.querySelector('#filter-weather')
const location = document.querySelector('#filter-location')
form.addEventListener('click', function(e) {
    e.preventDefault();
    const weatherData = weather.value;
    const locationData = location.value;
    console.log(weatherData);
    console.log(locationData);
})

let googleApiSrc = $("#maps-api");
let script_src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap&v=weekly`;
localStorage.getItem('selected-sites')