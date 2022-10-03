const sitesForm = $("#site-container");
const newSiteForm = $('#new-site-form');
const editSiteForm = $("#edit-site-form");

const weatherWarningEl = $("#weather-warning");
const weatherIconEl = $("#weather-icon");
const weatherDescriptionEl = $("#weather-description");

const toronto = {lat: 43.64287569139718, lng: -79.38692966368654};

let map;
let markers = [];
let script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
script.async = true;

let newSiteDialog, editSiteDialog, saveForm, editForm,
    siteName = $('#name'),
    latitude = $('#lat'),
    longitude = $('#lng'),
    allFields = $([]).add(siteName).add(latitude).add(longitude);

let campsites = JSON.parse(localStorage.getItem('campsites'));
if (!campsites) {
    campsites = [];
    localStorage.setItem('campsites', JSON.stringify(campsites));
}

$(function () {
    newSiteDialog = newSiteForm.dialog({
        autoOpen: false,
        modal: true,
        buttons: [
            {text: 'Add Campsite', click: addCampsite, class: "button is-primary"},
            {
                text: "Cancel", click: function () {
                    newSiteDialog.dialog('close');
                }, class: "button"
            }
        ],
        close: function () {
            $("#name-error").text("");
            saveForm[0].reset();
            allFields.removeClass('ui-state-error');
        },
        open: function(){
        $(".ui-dialog-titlebar").addClass("modal-header");
        $(".ui-dialog-titlebar-close").hide();
    }
    });
    saveForm = newSiteDialog.find('form').on('submit', function (event) {
        event.preventDefault();
        addCampsite();
    });

    $('#add-site').button().on('click', function () {
        newSiteDialog.dialog('open');
    });

    editSiteDialog = editSiteForm.dialog({
        autoOpen: false,
        modal: true,
        buttons: [
            {text: 'Save', click: saveSite, class: "button is-primary"}, // Replace with function that should be called on save
            {
                text: "Cancel", click: function () {
                    editSiteDialog.dialog('close');
                }, class: "button"
            }
        ],
        close: function () {
            markers.forEach(e =>{
                e.setAnimation(null);
            });
            $("#name-error").text("");
            editForm[0].reset();
            allFields.removeClass('ui-state-error');
        },
        open: function(){
            $(".ui-dialog-titlebar").addClass("modal-header");
            $(".ui-dialog-titlebar-close").hide();
        }
    });
    editForm = editSiteDialog.find('form').on('submit', function (event) {
        event.preventDefault();
        saveSite();
    });
});

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 43.650, lng: -79.386},
        zoom: 8,
        disableDefaultUI: true
    });

    campsites.forEach(e => {
        const marker = new google.maps.Marker({
            position: {lat: e.lat, lng: e.lng},
            map: map,
            icon: './assets/images/campsite.png',
            title: e.name
        });

        markers.push(marker);

        marker.addListener("click", () =>{
            map.setCenter(marker.getPosition());
            markers.forEach(mE =>{
                mE.setAnimation(null);
            });
            marker.setAnimation(google.maps.Animation.BOUNCE);
            openEditSite(e.id);
        });

        addSiteCard(e);
    });

    map.addListener('click', (e) => {
        markers.forEach(e =>{
            e.setAnimation(null);
        });
        console.log(e.latLng.lat(), e.latLng.lng());
        $('#lat').val(e.latLng.lat());
        $('#lng').val(e.latLng.lng());

        newSiteDialog.dialog('open');
    });
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
        lng: longitude.val() * 1,
        weather: {},
        rating: 5,
        season: "all"
    };
    campsites = JSON.parse(localStorage.getItem("campsites"));
    // Check if name is unique
    let unique = true;
    campsites.forEach(e =>{
        if (e.name.toLowerCase() === newSite.name.toLowerCase()){
            unique = false; // The name is not unique
        }
    });
    if (!unique){
        $(".name-error").text("This name is unavailable");
        return false;
    }  // Add in a warning / alert that the name is not unique
    campsites.push(newSite);
    const marker = new google.maps.Marker({
        position: {lat: newSite.lat, lng: newSite.lng},
        map: map,
        icon: './assets/images/campsite.png',
        title: newSite.name,
    });
    marker.addListener("click", () =>{
        map.setCenter(marker.getPosition());
        editSiteDialog.dialog("open");
        markers.forEach(e =>{
            e.setAnimation(null);
        });
        marker.setAnimation(google.maps.Animation.BOUNCE);
        openEditSite(newSite.id);
    });
    marker.setMap(map);
    markers.push(marker);
    localStorage.setItem('campsites', JSON.stringify(campsites));
    newSiteDialog.dialog('close');
    addSiteCard(newSite);
    return true;
}

function saveSite(){
    let editSiteId = editSiteForm.find("input#hidden-id").val();
    let editCard = $(`#${editSiteId}`);
    let editNameValue = editSiteForm.find("input#edit-name").val();
    let editSeasonValue = editSiteForm.find("select#season").val();
    let editRatingValue = editSiteForm.find("input#rating").val();
    let oldSite;
    let unique = true;
    campsites = JSON.parse(localStorage.getItem("campsites"));
    campsites.forEach(e =>{
        if (e.name.toLowerCase() === editNameValue.toLowerCase()){
            $(".name-error").text("This name is unavailable");
            unique = false;
        }
        if (e.id === editSiteId) oldSite = e;
    });
    if (!unique) return false;
    oldSite.name = editNameValue;
    oldSite.rating = editRatingValue;
    oldSite.season = editSeasonValue;
    editCard.find("h3").text(editNameValue);
    editCard.find("p").text(editRatingValue);
    localStorage.setItem("campsites", JSON.stringify(campsites));
    editSiteDialog.dialog("close");
}

// TODO: Add deletion functionality to the sites
function deleteSite(){
    return false;
}

async function filterSites(){
    let seasonFilter = $("#seasons-input").val();
    let weatherFilter = $("#weather-input").val();
    let locationFilter = $("#filter-location").val();
    let ratingFilter = $("#filter-rating").val();

    markers.forEach(marker =>{
        marker.visible = false;
    });

    for (const site of campsites) {
        let showMarker = false;
        await getWeather(site);
        if (weatherFilter === "clear"){
            if (Math.floor(site.weather.id / 100) >= 7){
                showMarker = true;
            }
        }else{
            showMarker = true;
        }

        showMarker = showMarker && (site.season === seasonFilter) && (site.rating >= ratingFilter);

        if (showMarker){
            markers.forEach(marker =>{
                if (marker.position.lat() === site.lat && marker.position.lng() === site.lng){
                    marker.visible = true;
                }
            });
        }
    }

    map.panTo(toronto);
}

async function getWeather(campsite) {
    let lat = campsite.lat;
    let lng = campsite.lng;
    let apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric`;
    await fetch(apiUrl).then(function (response) {
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
        let worstWeather;
        dailyWeather.forEach(day =>{
            day.forEach(hour =>{
                let currentHourWeather = hour.weather[0];
                let weatherId = Math.floor(currentHourWeather.id / 100);
                if (!worstWeather) worstWeather = hour.weather[0];
                let worstWeatherId = Math.floor(worstWeather.id / 100);

                if(worstWeatherId === 5 || worstWeatherId === 6){
                    if (weatherId === 2){
                        worstWeather = currentHourWeather;
                    }
                }else if(worstWeatherId === 3){
                    if (weatherId === 2 || weatherId === 5){
                        worstWeather = currentHourWeather;
                    }
                }else if(worstWeatherId === 8 || worstWeatherId === 7){
                    worstWeather = currentHourWeather;
                }
            });
            weatherWarningEl.text("Adverse weather detected.");
            weatherDescriptionEl.text(worstWeather.main);
            weatherIconEl.attr("src", `https://openweathermap.org/img/wn/${worstWeather.icon}@2x.png`);
            if (Math.floor(worstWeather.id / 100) === 8 || Math.floor(worstWeather.id / 100) === 7){
                weatherWarningEl.text("No bad weather detected.");
            }
        });

        campsite.weather = worstWeather;
    });
}

function addSiteCard(site) {
    const newSiteEl = $('<div>');
    newSiteEl.addClass("site");
    newSiteEl.attr("id", site.id);
    newSiteEl.html(`<img src='assets/images/camping.png' alt='image-icon'/>
                     <div class='site-body'> 
                     <h3>${site.name}</h3> 
                     <p>${site.rating}</p> 
                     <button id="view-site-${site.id}">View Site</button> </div>`);
    sitesForm.append(newSiteEl);
    let viewButtonEl = $(`#view-site-${site.id}`);
    viewButtonEl.button().on("click", function(){
        let position = {lat: site.lat, lng: site.lng};
        map.setCenter(position);
        openEditSite(site.id);
    });
    viewButtonEl.removeClass();
}

async function openEditSite(id){
    let campsite = getCampsiteById(id)
    editSiteForm.find("input#edit-name").val(campsite.name);
    editSiteForm.find("input#hidden-id").val(campsite.id);
    editSiteForm.find("input#rating").val(campsite.rating);
    editSiteForm.find(`option[value=all`).removeAttr("selected");
    editSiteForm.find(`option[value=three`).removeAttr("selected");
    editSiteForm.find(`option[value=summer`).removeAttr("selected");
    editSiteForm.find(`option[value=${campsite.season}]`).attr("selected", "selected");
    await getWeather(campsite);
    editSiteDialog.dialog('open');
}

function getCampsiteById(id){
    campsites = JSON.parse(localStorage.getItem("campsites"));
    let result = null;
    campsites.forEach(site =>{
        if (site.id === id){
            result = site;
        }
    });
    return result;
}

$("#search-button").on("click", function(e){
    e.preventDefault();
    filterSites();
})

window.initMap = initMap;
document.head.appendChild(script);

