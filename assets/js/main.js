const sitesForm = $("#site-container");
const newSiteForm = $('#new-site-form');
const editSiteForm = $("#edit-site-form");

let map;
let script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
script.async = true;

let newSiteDialog, editSiteDialog, form, form1,
    siteName = $('#name'),
    latitude = $('#lat'),
    longitude = $('#lng'),
    allFields = $([]).add(siteName).add(latitude).add(longitude);

let campsites = JSON.parse(localStorage.getItem('campsites'));
if (!campsites) {
    campsites = [];
    localStorage.setItem('campsites', JSON.stringify(campsites));
}

// UUID function from https://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php
function create_UUID(){
    let dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function addCampsite() {
    let uuid = create_UUID();
    let newSite = {
        name: siteName.val(),
        id: uuid,
        lat: latitude.val() * 1,
        lng: longitude.val() * 1
    };
    campsites = JSON.parse(localStorage.getItem("campsites"));
    // Check if name is unique
    let unique = true;
    campsites.forEach(e =>{
        console.log(e.name.toLowerCase(), newSite.name.toLowerCase(), e.name.toLowerCase() === newSite.name.toLowerCase());
        if (e.name.toLowerCase() === newSite.name.toLowerCase()){
            unique = false; // The name is not unique
        }
    });
    if (!unique){
        $("#name").addClass("ui-state-error");
        return false;
    }  // Add in a warning / alert that the name is not unique
    campsites.push(newSite);
    const marker = new google.maps.Marker({
        position: {lat: newSite.lat, lng: newSite.lng},
        map: map,
        icon: './assets/images/campsite.png',
        title: newSite.name
    });
    marker.setMap(map);
    localStorage.setItem('campsites', JSON.stringify(campsites));
    newSiteDialog.dialog('close');
    addSite(newSite.name, newSite.id);
    return true;
}

// Adding a modal for adding a campsite
$(function () {
    newSiteDialog = newSiteForm.dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            'Add Campsite': addCampsite,
            Cancel: function () {
                newSiteDialog.dialog('close');
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass('ui-state-error');
        }
    });
    form = newSiteDialog.find('form').on('submit', function (event) {
        event.preventDefault();
        addCampsite();
    });

    $('#add-site').button().on('click', function () {
        newSiteDialog.dialog('open');
    });
});

// Adding a modal for editing a campsite
$(function(){
    editSiteDialog = editSiteForm.dialog({
        autoOpen: false,
        height: 700,
        width: 550,
        modal: true,
        buttons: {
            'Save': saveSite, // Replace with function that should be called on save
            Cancel: function () {
                editSiteDialog.dialog('close');
            }
        },
        close: function () {
            form1[0].reset();
            allFields.removeClass('ui-state-error');
        }
    });
    form1 = editSiteDialog.find('form').on('submit', function (event) {
        event.preventDefault();
        saveSite();
    });
});

function saveSite(){
    let editSiteId = editSiteForm.find("input#hidden-id").val();
    let editCard = $(`#${editSiteId}`);
    let editNameValue = editSiteForm.find("input#edit-name").val();
    campsites = JSON.parse(localStorage.getItem("campsites"));
    campsites.forEach(e =>{
        if (e.id === editSiteId){
            e.name = editNameValue;
        }
    });
    editCard.find("h3").text(editNameValue);
    localStorage.setItem("campsites", JSON.stringify(campsites));
    editSiteDialog.dialog("close");
}

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

        addSite(e.name, e.id);
    });

    map.addListener('click', (e) => {
        console.log(e.latLng.lat(), e.latLng.lng());
        $('#lat').val(e.latLng.lat());
        $('#lng').val(e.latLng.lng());

        newSiteDialog.dialog('open');
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

function addSite(siteName, siteID) {
    const newSiteEl = $('<div>');
    newSiteEl.addClass("site");
    newSiteEl.attr("id", siteID);
    newSiteEl.html(`<img src='assets/images/camping.png' alt='image-icon'/>
                     <div class='site-body'> 
                     <h3>${siteName}</h3> 
                     <p>Description of site goes here</p> 
                     <button id="view-site-${siteID}">View Site</button> </div>`);
    sitesForm.append(newSiteEl);
    $(`#view-site-${siteID}`).button().on("click", function(){
        let formSiteName = getCampsiteById(siteID).name;
        editSiteForm.find("input#edit-name").val(formSiteName);
        editSiteForm.find("input#hidden-id").val(siteID);
        editSiteDialog.dialog('open');
    });
}

function getCampsiteById(id){
    campsites = JSON.parse(localStorage.getItem("campsites"));
    let result = null;
    campsites.forEach(e =>{
        if (e.id === id){
            result = e;
        }
    });
    return result;
}

document.addEventListener('DOMContentLoaded', () => {
    let savedSite = localStorage.getItem('saved-sites');

    if(savedSite) {
        document.querySelector('#saved-sites').prepend(savedSite);
    }
})



