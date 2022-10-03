// Define element variables
const sitesForm = $("#site-container");
const newSiteForm = $('#new-site-form');
const editSiteForm = $("#edit-site-form");

const weatherWarningEl = $("#weather-warning");
const weatherIconEl = $("#weather-icon");
const weatherDescriptionEl = $("#weather-description");

const toronto = {lat: 43.64287569139718, lng: -79.38692966368654}; // Lat lng of toronto

// Globally define variables
let map;
let markers = [];
// Used for adding the google api to the html
let script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB3y5pgb9odKMQqs1TpnIAZZvmt1AvjgOs&callback=initMap`;
script.async = true;

// Add the different forms and their fields as global variables
let newSiteDialog, editSiteDialog, saveForm, editForm,
    siteName = $('#name'),
    latitude = $('#lat'),
    longitude = $('#lng'),
    allFields = $([]).add(siteName).add(latitude).add(longitude);

// Get the campsites from local storage
let campsites = JSON.parse(localStorage.getItem('campsites'));
if (!campsites) {
    campsites = [];
    localStorage.setItem('campsites', JSON.stringify(campsites));
}

// Function for setting up jquery modals
$(function () {
    // Modal for adding a brand-new site
    newSiteDialog = newSiteForm.dialog({
        autoOpen: false,
        modal: true,
        buttons: [ // Buttons in the modal
            {text: 'Add Campsite', click: addCampsite, class: "button is-primary"},
            {
                text: "Cancel", click: function () {
                    newSiteDialog.dialog('close');
                }, class: "button"
            }
        ],
        close: function () { // Close function
            // Reset the form
            $("#name-error").text("");
            saveForm[0].reset();
            allFields.removeClass('ui-state-error');
        },
        open: function () { // Open function
            // Hide the titlebar
            $(".ui-dialog-titlebar").addClass("modal-header");
            $(".ui-dialog-titlebar-close").hide();
        }
    });
    // Used to add the campsite
    saveForm = newSiteDialog.find('form').on('submit', function (event) {
        event.preventDefault();
        addCampsite();
    });
     // On click of the button that adds a new site, open the site new modal
    $('#add-site').button().on('click', function () {
        newSiteDialog.dialog('open');
    });

    // Campsite edit modal
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
            markers.forEach(e => {
                e.setAnimation(null);
            });
            $("#name-error").text("");
            editForm[0].reset();
            allFields.removeClass('ui-state-error');
        },
        open: function () {
            $(".ui-dialog-titlebar").addClass("modal-header");
            $(".ui-dialog-titlebar-close").hide();
        }
    });
    editForm = editSiteDialog.find('form').on('submit', function (event) {
        event.preventDefault();
        saveSite();
    });
});

// Initializes the map
function initMap() {
    // Create the map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 43.650, lng: -79.386},
        zoom: 8,
        disableDefaultUI: true
    });
    // Add a marker for each campsite
    campsites.forEach(e => {
        const marker = new google.maps.Marker({
            position: {lat: e.lat, lng: e.lng},
            map: map,
            icon: './assets/images/campsite.png',
            title: e.name
        });

        markers.push(marker); // Add it to the list of markers

        // Add a listener so that you can edit sites by clicking on the marker
        marker.addListener("click", () => {
            map.setCenter(marker.getPosition());
            markers.forEach(mE => {
                mE.setAnimation(null);
            });
            marker.setAnimation(google.maps.Animation.BOUNCE);
            openEditSite(e.id);
        });

        addSiteCard(e); // Add the site to the bottom row display
    });

    // When you click on the map, open the new site modal
    map.addListener('click', (e) => {
        markers.forEach(e => {
            e.setAnimation(null);
        });
        console.log(e.latLng.lat(), e.latLng.lng());
        $('#lat').val(e.latLng.lat());
        $('#lng').val(e.latLng.lng());

        newSiteDialog.dialog('open');
    });
}

// UUID function from https://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php
function create_UUID() {
    let dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

// Creates a new campsite
function addCampsite() {
    let uuid = create_UUID(); // Create a unique id
    let newSite = { // Create the basic site object
        name: siteName.val(),
        id: uuid,
        lat: latitude.val() * 1,
        lng: longitude.val() * 1,
        weather: {},
        rating: 5,
        season: "all"
    };
    // Get the updated list of sites
    campsites = JSON.parse(localStorage.getItem("campsites"));
    // Check if name is unique
    let unique = true; // Assume the name is unique
    campsites.forEach(e => { // Check if the name is unique
        if (e.name.toLowerCase() === newSite.name.toLowerCase()) {
            unique = false; // The name is not unique
        }
    });
    if (!unique) { // If it is not unique, don't add it and display an error text
        $(".name-error").text("This name is unavailable");
        return false;
    }
    campsites.push(newSite); // Add the campsite to the list of sites
    // Add a marker for the site
    const marker = new google.maps.Marker({
        position: {lat: newSite.lat, lng: newSite.lng},
        map: map,
        icon: './assets/images/campsite.png',
        title: newSite.name,
    });

    // Allow editing of the site via marker click
    marker.addListener("click", () => {
        map.setCenter(marker.getPosition());
        editSiteDialog.dialog("open");
        markers.forEach(e => {
            e.setAnimation(null);
        });
        marker.setAnimation(google.maps.Animation.BOUNCE);
        openEditSite(newSite.id);
    });
    // Add the marker to the map
    marker.setMap(map);
    markers.push(marker);
    // Update the local storage and close the new site modal
    localStorage.setItem('campsites', JSON.stringify(campsites));
    newSiteDialog.dialog('close');
    // Create the site card to be displayed
    addSiteCard(newSite);
}

// Function for saving changes to a site
function saveSite() {
    // Get the values from the modal form
    let editSiteId = editSiteForm.find("input#hidden-id").val();
    let editCard = $(`#${editSiteId}`);
    let editNameValue = editSiteForm.find("input#edit-name").val();
    let editSeasonValue = editSiteForm.find("select#season").val();
    let editRatingValue = editSiteForm.find("input#rating").val();
    let oldSite; // Site to be edited
    let unique = true;
    if (editNameValue === ""){ // If you remove the name, delete the site
        deleteSite(editSiteId);
        editSiteDialog.dialog("close");
        return false;
    }
    // Get the most recent sites
    campsites = JSON.parse(localStorage.getItem("campsites"));
    // Check if the name is unique
    campsites.forEach(e => {
        if (e.name.toLowerCase() === editNameValue.toLowerCase() && e.id !== editSiteId && editNameValue !== "") {
            $(".name-error").text("This name is unavailable");
            unique = false;
        }
        if (e.id === editSiteId) oldSite = e;
    });
    if (!unique) return false;
    // Update the values of the campsite
    oldSite.name = editNameValue;
    oldSite.rating = editRatingValue;
    oldSite.season = editSeasonValue;
    // Edit the values of the site card in the display
    editCard.find("h3").text(editNameValue);
    editCard.find("p").html("");

    // Add stars to the site card for the rating
    for (let i = 0; i < oldSite.rating; i++) {
        editCard.find("p").append("★");
    }
    // Update the local storage
    localStorage.setItem("campsites", JSON.stringify(campsites));
    editSiteDialog.dialog("close");
}

// Used for deleting sites
function deleteSite(id) {
    let deleteSite = getCampsiteById(id);
    // Remove the marker for the site
    markers.forEach((marker, index) =>{
        if (marker.position.lat() === deleteSite.lat && marker.position.lng() === deleteSite.lng) {
            marker.visible = false;
            markers.splice(index, 1);
        }
    });
    // Remove the site card
    sitesForm.find(`div#${id}`).remove();
    // Remove the site
    campsites.forEach((campsite, index) =>{
        if (campsite.id === id){
            campsites.splice(index, 1);
        }
    });
    // Update the storage
    localStorage.setItem("campsites", JSON.stringify(campsites));
}

// Filter sites by criteria
async function filterSites(){
    // Get the filter criteria
    let seasonFilter = $("#seasons-input").val();
    let weatherFilter = $("#weather-input").val();
    let ratingFilter = $("#filter-rating").val();

    // Assume none of the campsites should be shown
    markers.forEach(marker => {
        marker.visible = false;
    });

    for (const site of campsites) {
        let showMarker = false;
        await getWeather(site);
        if (weatherFilter === "clear") {
            if (Math.floor(site.weather.id / 100) >= 7) { // If the weather is clear, show the marker
                showMarker = true;
            }
        } else { // If the weather is not filtered, make the marker true
            showMarker = true;
        }
        // If the weather, season and rating match the filter, show the marker
        showMarker = showMarker && (site.season === seasonFilter) && (site.rating >= ratingFilter);

        // If you should show the marker, find the marker for that site and show it
        if (showMarker) {
            markers.forEach(marker => {
                if (marker.position.lat() === site.lat && marker.position.lng() === site.lng) {
                    marker.visible = true;
                }
            });
        }
    }

    map.panTo(toronto); // Pan to toronto to update the map
}

// Gets the weather for a campsite
async function getWeather(campsite) {
    let lat = campsite.lat;
    let lng = campsite.lng;
    let apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=4525e4c4d6900be2e3932d311208c64e&units=metric`;
    await fetch(apiUrl).then(function (response) { // Call the API
        return response.json();
    }).then(function (data) { // Process the data
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
        // Find the worst weather for the week
        dailyWeather.forEach(day => {
            day.forEach(hour => {
                let currentHourWeather = hour.weather[0];
                let weatherId = Math.floor(currentHourWeather.id / 100);
                if (!worstWeather) worstWeather = hour.weather[0];
                let worstWeatherId = Math.floor(worstWeather.id / 100);

                // See if there is worse weather than the current worst weather
                if (worstWeatherId === 5 || worstWeatherId === 6) {
                    if (weatherId === 2) {
                        worstWeather = currentHourWeather;
                    }
                } else if (worstWeatherId === 3) {
                    if (weatherId === 2 || weatherId === 5) {
                        worstWeather = currentHourWeather;
                    }
                } else if (worstWeatherId === 8 || worstWeatherId === 7) {
                    worstWeather = currentHourWeather;
                }
            });
            // Update the weather forecast
            weatherWarningEl.text("Adverse weather detected.");
            weatherDescriptionEl.text(worstWeather.main);
            weatherIconEl.attr("src", `https://openweathermap.org/img/wn/${worstWeather.icon}@2x.png`);
            if (Math.floor(worstWeather.id / 100) === 8 || Math.floor(worstWeather.id / 100) === 7) {
                weatherWarningEl.text("No bad weather detected.");
            }
        });

        campsite.weather = worstWeather;
    });
}

// Adds a campsite card
function addSiteCard(site) {
    const newSiteEl = $('<div>');
    newSiteEl.addClass("site");
    newSiteEl.attr("id", site.id); // Give it a unique id
    // Create the campsite card
    newSiteEl.html(`<img src='assets/images/camping.png' alt='image-icon'/>
                     <div class='site-body'> 
                     <h3>${site.name}</h3> 
                     <p id="rating-${site.id}"></p> 
                     <button id="view-site-${site.id}">View Site</button> </div>`);
    sitesForm.append(newSiteEl); // Add the site to the page
    let ratingEl = $(`#rating-${site.id}`);
    ratingEl.html(""); // Clear the rating
    for (let i = 0; i < site.rating; i++) { // Add the rating
        ratingEl.append("★");
    }
    // Create the view button functionality
    let viewButtonEl = $(`#view-site-${site.id}`);
    viewButtonEl.button().on("click", function () {
        let position = {lat: site.lat, lng: site.lng};
        map.setCenter(position); // Pan to this campsite on the map
        openEditSite(site.id); // Open the edit site modal
    });
    viewButtonEl.removeClass(); // Remove the default class of the viewButton
}

// Opens the edit site modal and updates all the values
async function openEditSite(id) {
    let campsite = getCampsiteById(id)
    editSiteForm.find("input#edit-name").val(campsite.name);
    editSiteForm.find("input#hidden-id").val(campsite.id);
    editSiteForm.find("input#rating").val(campsite.rating);
    editSiteForm.find("p#editRatingValue").text(campsite.rating);
    editSiteForm.find(`option[value=all`).removeAttr("selected");
    editSiteForm.find(`option[value=three`).removeAttr("selected");
    editSiteForm.find(`option[value=summer`).removeAttr("selected");
    editSiteForm.find(`option[value=${campsite.season}]`).attr("selected", "selected");
    await getWeather(campsite);
    editSiteDialog.dialog('open');
}

// Finds a campsite based off of ID
function getCampsiteById(id) {
    campsites = JSON.parse(localStorage.getItem("campsites"));
    let result = null;
    campsites.forEach(site => {
        if (site.id === id) {
            result = site;
        }
    });
    return result;
}

// Attaches functionality to the search button
$("#search-button").on("click", function (e) {
    e.preventDefault();
    filterSites();
})

window.initMap = initMap;
document.head.appendChild(script);

