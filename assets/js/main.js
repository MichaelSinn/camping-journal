let map;
let script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
script.async = true;

let markers = JSON.parse(localStorage.getItem("markers"));
if (!markers) {
    markers = [];
    localStorage.setItem("markers", JSON.stringify(markers));
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 43.650, lng: -79.386},
        zoom: 8
    });
    markers.forEach(e => {
        const marker = new google.maps.Marker({
            position: {lat: e.lat, lng: e.lng},
            map: map
        });
    })
}

// Adding a modal for adding a campsite
$(function () {
    let dialog, form,
        siteName = $("#name"),
        latitude = $("#lat"),
        longitude = $("#lng"),
        allFields = $([]).add(siteName).add(latitude).add(longitude);

    function addCampsite() {
        let newMarker = {
            name: siteName.val(),
            lat: latitude.val() * 1,
            lng: longitude.val() * 1
        };
        markers = JSON.parse(localStorage.getItem("markers"));
        markers.push(newMarker);
        localStorage.setItem("markers", JSON.stringify(markers));
        dialog.dialog("close");
        return true;
    }

    dialog = $("#new-site-form").dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            "Add Campsite": addCampsite,
            Cancel: function () {
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });
    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        addCampsite();
    });

    $("#add-site").button().on("click", function () {
        dialog.dialog("open");
    });
});

function getWeather(lat, lon) {
    let apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=4525e4c4d6900be2e3932d311208c64e`;
    fetch(apiUrl).then(function (response) {
        return response.json();
    }).then(function (data) {
        let dailyWeather = [];
        let currentDay = [];
        // Split the data into separate days
        data.list.forEach((e) => { // For every element in the forecast
            if (currentDay.length === 0) { // If this is the first element, automatically at it to the first day
                currentDay.push(e);
            } else {
                // Check whether the current segment is part of the same day as the previous segment
                if (currentDay[currentDay.length - 1].dt_txt.split(" ")[0] !== e.dt_txt.split(" ")[0]) {
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
    });
}

window.initMap = initMap;

document.head.appendChild(script);
