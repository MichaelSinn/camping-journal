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

localStorage.getItem('selected-sites')