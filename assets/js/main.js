let map;
let script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
script.async = true;

let markers = JSON.parse(localStorage.getItem("markers"));
if (!markers){
    markers = [];
    localStorage.setItem("markers", JSON.stringify(markers));
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 43.650, lng: -79.386 },
        zoom: 8
    });
    markers.forEach(e =>{
        const marker = new google.maps.Marker({
            position: { lat: e.lat, lng: e.lng },
            map: map
        });
    })
}

$(function(){
    let dialog, form,
        siteName = $( "#name" ),
        latitude = $( "#lat" ),
        longitude = $( "#lng" ),
        allFields = $( [] ).add( siteName ).add( latitude ).add( longitude );

    function addCampsite(){
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

    dialog = $( "#new-site-form" ).dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            "Add Campsite": addCampsite,
            Cancel: function() {
                dialog.dialog( "close" );
            }
        },
        close: function() {
            form[ 0 ].reset();
            allFields.removeClass( "ui-state-error" );
        }
    });
    form = dialog.find( "form" ).on( "submit", function( event ) {
        event.preventDefault();
        addCampsite();
    });

    $( "#add-site" ).button().on( "click", function() {
        dialog.dialog( "open" );
    });
});

window.initMap = initMap;

document.head.appendChild(script);
