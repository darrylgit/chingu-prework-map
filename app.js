$(document).ready(function() {
  /*
  ========================================
    SETUP
  ========================================
  */
  // Sidebar toggle variables
  const openerIcon = "fas fa-angle-double-right";
  const closerIcon = $("#toggleIcon").attr("class");
  let toggleSpeed = 300;
  let visibleEdge = 10;

  // Coordinates
  const centerLon = -84.212;
  const centerLat = 34.037;
  const longitudeOffset = 0.076;
  const latitudeOffset = 0.053;
  const minimumLon = centerLon - longitudeOffset;
  const minimumLat = centerLat - latitudeOffset;
  const maximumLon = centerLon + longitudeOffset;
  const maximumLat = centerLat + latitudeOffset;

  // API token
  mapboxgl.accessToken =
    "pk.eyJ1Ijoic2lnbmlvcmdyYXRpYW5vIiwiYSI6ImNqemcxdHZrNTBkeWUzbXBoZDBicnMxNXEifQ.yBDCU__0UQAqqZDlbzpHgQ";

  // Set number of results to return
  const resultsLimit = 10;

  // Buffers to store places and popups generated by search function
  let popups = [];
  let places = [];

  // Set map zoom
  let zoomParameter = 12.1;

  // For mobile
  if ($(window).width() < 576) {
    zoomParameter = 10.9;
    visibleEdge = 0;
  }

  /*
  ========================================
    SIDEBAR TOGGLE
  ========================================
  */
  // Set hidden position of sidebar using above visibleEdge constant
  let leftWhenHidden = function(edge) {
    let units = $("#sidebar")
      .css("width")
      .match(/\D/g)
      .join("");
    let widthValue = $("#sidebar")
      .css("width")
      .match(/\d+(?:\.\d+)?/g)
      .map(Number);
    widthValue[0] -= edge;
    if ($(window).width() < 576) {
      return "-100vw";
    } else {
      return "-" + widthValue[0].toString() + units;
    }
  };

  // Toggle sidebar
  $("#toggle").click(function() {
    if ($("#toggleIcon").attr("class") == openerIcon) {
      $("#toggleIcon")
        .removeClass(openerIcon)
        .addClass(closerIcon);
      $("#sidebar").animate({ left: 0 }, toggleSpeed);
    } else if ($("#toggleIcon").attr("class") == closerIcon) {
      $("#toggleIcon")
        .removeClass(closerIcon)
        .addClass(openerIcon);
      $("#sidebar").animate({ left: leftWhenHidden(visibleEdge) }, toggleSpeed);
    }
  });

  /*
  ========================================
    MAIN FUNCTIONALITY
  ========================================
  */

  // Display map
  let map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v9",
    center: [centerLon, centerLat],
    zoom: zoomParameter
  });

  // Searchbar keyup event
  $("#search").on("keyup", function() {
    clearPromise()
      .then(newSearch)
      .catch(err => console.log(err));
  });

  // Search function declaration (hoisted into keyup event)
  function newSearch() {
    if ($("#search").val()) {
      // Make API request
      let query = $("#search")
        .val()
        .replace(" ", "%20");

      let url = geocodingURL(
        query,
        resultsLimit,
        minimumLon,
        minimumLat,
        maximumLon,
        maximumLat,
        mapboxgl.accessToken
      );

      fetch(url)
        .then(response => response.json())
        .then(jsonResponse => {
          let results = jsonResponse.features;

          // Make array of place names from search results
          populatePlacesBuffer(results);

          // Create index that will be used to forge a connection between popup and sidebar search result
          let resultIndex = 0;

          // Append search results to sidebar, create markers and popups
          places.forEach(place => {
            // Prevent against corner case of search results exceeding resultsLimit
            if ($("#results").find(".search-result").length >= resultsLimit) {
              clearPreviousSearch();
            }

            appendToSidebar(place, resultIndex);
            let newPopup = createPopup(place);
            createMarker(place, newPopup);
            resultIndex++;
          });

          // Once popups and sidebar results have been created, display popups on sidebar hover
          createSidebarHandlers();
        });
    }
  }

  /*
  ========================================
    HELPER FUNCTIONS
  ========================================
  */
  // URL setter
  function geocodingURL(query, limit, minLon, minLat, maxLon, maxLat, token) {
    let domainApiEndpoint =
      "https://api.mapbox.com/geocoding/v5/mapbox.places/";
    let queryParameter = `${query}.json?`;
    let limitParameter = `limit=${limit}`;
    let boundBoxParamater = `bbox=${minLon},${minLat},${maxLon},${maxLat}`;
    let accessToken = `access_token=${token}`;
    return `${domainApiEndpoint}${queryParameter}${limitParameter}&${boundBoxParamater}&types=poi&${accessToken}`;
  }

  // Functions for clearing
  function clearPreviousSearch() {
    $(".mapboxgl-marker").remove();
    $(".search-result").remove();
    $(".mapboxgl-popup").remove();
    popups = [];
    places = [];
  }

  function clearPromise() {
    return new Promise((resolve, reject) => {
      clearPreviousSearch();

      if ($("#results").find(".search-result").length == 0) {
        resolve();
      } else {
        reject("Error: search not clear");
      }
    });
  }

  // Function to push data from feature results into places buffer
  function populatePlacesBuffer(results) {
    results.forEach(result => {
      let name = result.place_name.split(",").slice(0, 1);
      let address = result.place_name
        .split(",")
        .slice(1, 3)
        .join(",");
      let addressLong = result.place_name
        .split(",")
        .slice(1)
        .join(",")
        .replace(", United States", "");
      let lat = result.geometry.coordinates[1];
      let lon = result.geometry.coordinates[0];

      if (places.length < resultsLimit) {
        places.push(new Place(name, address, addressLong, lat, lon));
      }
    });
  }

  function Place(name, address, addressLong, lat, lon) {
    this.name = name;
    this.address = address;
    this.addressLong = addressLong;
    this.lat = lat;
    this.lon = lon;
  }

  // Marker and popup constructors
  let markerRadius = 10;
  let popupOffsets = {
    top: [0, 0],
    bottom: [0, -25],
    left: [markerRadius, 0],
    right: [-markerRadius, 0]
  };

  function createPopup(place) {
    var popup = new mapboxgl.Popup({
      offset: popupOffsets,
      closeButton: false
    }).setHTML(`<h4>${place.name}</h4><p>${place.addressLong}</p>`);

    popups.push(popup);

    return popup;
  }

  function createMarker(place, popup) {
    new mapboxgl.Marker()
      .setLngLat([place.lon, place.lat])
      .setPopup(popup)
      .addTo(map);
  }

  // Function to append result of id="id" to sidebar
  function appendToSidebar(place, id) {
    $("#results").append(`<div class="search-result" id="${id}">
      <h3>${place.name}</h3>
      <p>${place.address}</p>
      </div>`);
  }

  // Function to create sidebar handlers that toggle popup display on hover
  function createSidebarHandlers() {
    function popupThatCorrespondsTo(element) {
      let index = element.id;
      return popups[index];
    }
    if ($(window).width() >= 576) {
      // Desktop
      $(".search-result").mouseenter(function() {
        let resultPopup = popupThatCorrespondsTo(this);
        if (!resultPopup.isOpen()) {
          resultPopup.addTo(map);
        }
      });
      $(".search-result").mouseleave(function() {
        let resultPopup = popupThatCorrespondsTo(this);
        if (resultPopup.isOpen()) {
          resultPopup.remove();
        }
      });
    } else {
      // Mobile
      $(".search-result").click(function() {
        let resultPopup = popupThatCorrespondsTo(this);
        if (!resultPopup.isOpen()) {
          resultPopup.addTo(map);
        }

        $("#toggleIcon")
          .removeClass(closerIcon)
          .addClass(openerIcon);
        $("#sidebar").animate(
          { left: leftWhenHidden(visibleEdge) },
          toggleSpeed
        );
      });
    }
  }

  /*
  ========================================
    RESPONSIVENESS
  ========================================
  */
  if ($(window).width() < 576) {
    visibleEdge = 0;

    $(window).resize(function() {
      if ($("#toggleIcon").attr("class") == openerIcon) {
        $("#sidebar").css("left", leftWhenHidden(visibleEdge));
      }
    });
  }

  if ($(window).width() < 576) {
    $("#results").css(
      "max-height",
      ($("#sidebar").height() - $("#searchHeader").height()).toString() + "px"
    );
  }

  $(window).resize(function() {
    if ($(window).width() < 576) {
      $("#results").css(
        "max-height",
        ($("#sidebar").height() - $("#searchHeader").height()).toString() + "px"
      );
    } else {
      $("#results").css("max-height", "500px");
    }
  });
});
