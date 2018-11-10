// Global Variables
var map, clientID, clientSecret;
var foursquareClientID = "IAFURWBZJEPQLDOECAG5FOGSTQ3AXFPGATFWYTLBRZZK4E50";
var foursquareClientSecret = "YYMAKZZBW500DDGGCRJKSJNKXD31OO2S5XVFGQUVZI0HAQUX";
var FOURSQUARE_BASE_URL = "https://api.foursquare.com/v2/";

var markerLocations = [
    {
        title: 'Taksim Square',
        lat: 41.0370176,
        lng:  28.9763369,
        type: 'Square'
    },
    {
        title: 'Thales Room',
        lat: 41.0345604,
        lng: 28.9791202,
        type: 'Restaurant'
    },
    {
        title: 'Kanyon AVM',
        lat: 41.0785208,
        lng: 29.0086911,
        type:  'Shopping Mall'
    },
    {
        title: 'Yapi Kredi Plaza',
        lat: 41.0809467,
        lng: 29.0105505,
        type:  'Business'
    },
    {
        title: 'Cemil Topuzlu Theatre',
        lat: 41.0460652,
        lng: 28.9878414,
        type: 'Theatre'
    }
]

onMapsError = function onMapsError() {
    alert(
        'Could not load Google Maps. Please try again.'
    );
};

function getFoursquareApiUrl(marker) {
    return FOURSQUARE_BASE_URL + 'venues/search?ll=' + marker.lat + ',' + marker.lng + '&client_id=' 
        + foursquareClientID + '&client_secret=' + foursquareClientSecret + '&query=' + marker.title 
        + '&v=20170708' + '&m=foursquare';
}

function createHTMLForFoursquareData(markerData) {
    //Returns info popup content
    return (
        '<div class="popup-container">' + '<h4 class="popup-title">' + marker.title + '</h4>' +
        '<span><h4 class="popup-subtitle">' + "Category: " + markerData.category + '</h4></span>' + '<div>' +
        '<img src=' + markerData.photo + '></img>' +
        '<h5 class="popup-address-title"> Address: </h5>' +
        '<p class="popup-address">' + markerData.street + '</p>' +
        '<p class="popup-address">' + markerData.city + '</p>' +
        '<p class="popup-address">' + markerData.zip + '</p>' +
        '<p class="popup-address">' + markerData.country + '</p>' + 
        '</div>' + '</div>'
    );
}

function onFoursquareApiSuccess(marker, popup, response) {
    var markerData = {};

    //Process data received from Foursquare API
    var venue = response.response.venues[0];
    markerData.street = venue.location.formattedAddress[0];
    markerData.city = venue.location.city;
    markerData.zip = venue.location.postalCode;
    markerData.country = venue.location.country;
    markerData.category = venue.categories[0].shortName;
    markerData.photo = venue.categories[0].icon.prefix + "64" + venue.categories[0].icon.suffix;

    //Set info popup content
    popup.setContent(createHTMLForFoursquareData(markerData));
}

function onFourSquareApiError() {
     alert( "Could not fetch data from Foursquare API. Please try again.");
}

function populateInfoPopup(marker, popup) {

    //No need to fetch data if same marker is clicked again.
    if(popup.marker == marker) {
        return;
    }

    //Reset popup
    popup.setContent('<div class="loader"></div>');
    popup.marker = marker;
        
    //Fetch data from Foursquare API
    $.getJSON(getFoursquareApiUrl(marker)).done(onFoursquareApiSuccess.bind(this, marker, popup)).fail(onFourSquareApiError);

    //Show info popup for marker
    popup.open(map, marker);

    //Add close listener for popup
    popup.addListener('closeclick', function() {
        popup.marker = null;
    });
};

function animateMarker(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout((function() {
        marker.setAnimation(null);
    }).bind(marker), 1000);
}

function createMarker(location, map, pos) {
    return new google.maps.Marker({
        map: map,
        position: {
            lat: location.lat,
            lng: location.lng
        },
        title: location.title,
        lat: location.lat,
        lng: location.lng,
        id: pos,
        animation: google.maps.Animation.DROP
    });
}

function getSearchResult() {
    var searchResults = [];
    for (var i = 0; i < this.markers.length; i++) {
        var marker = this.markers[i];
        var markerTitle = marker.title.toUpperCase();
        var input = this.userInput().toUpperCase();

        if (markerTitle.includes(input)) {
            searchResults.push(marker);
            this.markers[i].setVisible(true);
        } else {
            this.markers[i].setVisible(false);
        }
    }
    return searchResults;
}

function initMap(map, popup, markers, markerClickListener) {
    for (var i = 0; i < markerLocations.length; i++) {
        // Create Markers
        this.marker = createMarker(markerLocations[i], map, i);
        this.marker.setMap(map);
        this.marker.addListener('click', markerClickListener);
        markers.push(this.marker);
    }
}

function createViewModel() {
    let self = this;

    //User input, used for searching
    this.userInput = ko.observable("");
    this.markers = [];
    
    //Init map
    var map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(41.0551589,28.9924304),
        zoom: 13,
        styles: styles
    });

    //Create info popup
    this.popup = new google.maps.InfoWindow();

    //Create marker click listener
    this.markerClickListener = function() {
        populateInfoPopup(this, self.popup);
        animateMarker(this);
    };

    initMap(map, this.popup, this.markers, this.markerClickListener);

    //Used for searching when user input is received
    this.searchFilter = ko.computed(getSearchResult, this);
}

function app() {
    ko.applyBindings(new createViewModel());
}