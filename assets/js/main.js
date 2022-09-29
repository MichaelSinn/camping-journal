const submitBtn = document.querySelector('#submit-btn')
const sitesForm = document.querySelector('.saved-sites')
const newSiteForm = $('#new-site-form');

let map;
let script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
script.async = true;

let dialog, form,
    siteName = $('#name'),
    latitude = $('#lat'),
    longitude = $('#lng'),
    allFields = $([]).add(siteName).add(latitude).add(longitude);

let campsites = JSON.parse(localStorage.getItem('campsites'));
if (!campsites) {
    campsites = [];
    localStorage.setItem('campsites', JSON.stringify(campsites));
}

function addCampsite() {
    let newSite = {
        name: siteName.val(),
        lat: latitude.val() * 1,
        lng: longitude.val() * 1
    };
    campsites = JSON.parse(localStorage.getItem('campsites'));
    campsites.push(newSite);
    const marker = new google.maps.Marker({
        position: {lat: newSite.lat, lng: newSite.lng},
        map: map,
        icon: './assets/images/campsite.png',
        title: newSite.name
    });
    marker.setMap(map);
    localStorage.setItem('campsites', JSON.stringify(campsites));
    dialog.dialog('close');
    addSite();
    return true;
}

// Adding a modal for adding a campsite
$(function () {

    dialog = newSiteForm.dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            'Add Campsite': addCampsite,
            Cancel: function () {
                dialog.dialog('close');
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass('ui-state-error');
        }
    });
    form = dialog.find('form').on('submit', function (event) {
        event.preventDefault();
        addCampsite();
    });

    $('#add-site').button().on('click', function () {
        dialog.dialog('open');
    });
});

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 43.650, lng: -79.386},
        zoom: 8
    });
    campsites.forEach(e => {
        const marker = new google.maps.Marker({
            position: {lat: e.lat, lng: e.lng},
            map: map,
            icon: './assets/images/campsite.png',
            title: e.name
        });
    });

    map.addListener('click', (e) => {
        console.log(e.latLng.lat(), e.latLng.lng());
        $('#lat').val(e.latLng.lat());
        $('#lng').val(e.latLng.lng());
        let dialog = newSiteForm.dialog({
            autoOpen: false,
            height: 400,
            width: 350,
            modal: true,
            buttons: {
                'Add Campsite': addCampsite,
                Cancel: function () {
                    dialog.dialog('close');
                }
            },
            close: function () {
                form[0].reset();
                allFields.removeClass('ui-state-error');
            }
        });
        dialog.dialog('open');
    });
}

function getWeather(lat, lng) {
    let apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=4525e4c4d6900be2e3932d311208c64e&units=metric`;

    fetch(apiUrl).then(function (response) {
        return response.json();
    }).then(function (data) {
        let currentDay = [];
        let dailyWeather = [];
        // Split the data into separate days
        data.list.forEach((e) => { // For every element in the forecast
            if (currentDay.length === 0) { // If this is the first element, automatically at it to the first day
                currentDay.push(e);
            } else {
                // Check whether the current segment is part of the same day as the previous segment
                if (currentDay[currentDay.length - 1].dt_txt.split(' ')[0] !== e.dt_txt.split(' ')[0]) {
                    dailyWeather.push(currentDay); // Finish the current day's weather
                    currentDay = [e]; // Start the next day's weather
                } else { // If it is part of the same day, add it
                    currentDay.push(e);
                }
            }
        });
        if (currentDay.length !== 0) dailyWeather.push(currentDay); // If this is the final day and has less than a full 24 hours of data, push it
        if (dailyWeather.length > 5) dailyWeather.shift(); // If there is more than 5 days, remove the first day
        console.log(dailyWeather);

        dailyWeather.forEach(day =>{
           day.forEach(hour =>{
               weatherCode = Math.floor(hour.weather.id / 100);
               if (weatherCode === 2 || weatherCode === 5){
                   // Thunderstorm or Rain - Alert
               }else if(weatherCode === 3 || weatherCode === 6){
                   // Drizzle or Snow - Warning
               }else if(weatherCode === 8){
                   // No hazardous weather - Clear
               }
           });
        });

    });
}

window.initMap = initMap;

document.head.appendChild(script);


function addSite() {
    // siteName = site.value;
    const img = document.createElement('img')
    img.src = '/assets/images/camping.png';
    const siteName = 'New Site'
    const newSite = document.createElement('div');
    newSite.prepend(img);
    newSite.textContent = siteName;
    newSite.classList.add('site');
    sitesForm.prepend(newSite);
    localStorage.setItem('saved-sites', newSite);
}

submitBtn.addEventListener('click', addSite)

document.addEventListener('DOMContentLoaded', () => {
    let savedSite = localStorage.getItem('saved-sites');
    
    if(savedSite) {
        document.querySelector('#saved-sites').prepend(savedSite);
    } 
})