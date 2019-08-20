$(document).ready(function() {
  // Sidebar toggle variables
  const openerIcon = "fas fa-angle-double-right";
  const closerIcon = $("#toggleIcon").attr("class");
  const toggleSpeed = 300;
  const visibleEdge = 15;

  // Set inital position of sidebar using above visibleEdge constant
  let leftWhenHidden = (function(edge) {
    let units = $("#sidebar")
      .css("width")
      .match(/\D/g)
      .join("");
    let widthValue = $("#sidebar")
      .css("width")
      .match(/\d+(?:\.\d+)?/g)
      .map(Number);
    widthValue[0] -= edge;
    return "-" + widthValue[0].toString() + units;
  })(visibleEdge);

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
      $("#sidebar").animate({ left: leftWhenHidden }, toggleSpeed);
    }
  });

  // Display map
  mapboxgl.accessToken =
    "pk.eyJ1Ijoic2lnbmlvcmdyYXRpYW5vIiwiYSI6ImNqemcxdHZrNTBkeWUzbXBoZDBicnMxNXEifQ.yBDCU__0UQAqqZDlbzpHgQ";

  const centerLon = -84.212;
  const centerLat = 34.037;

  let map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v9",
    center: [centerLon, centerLat],
    zoom: 12.1
  });

  // Coordinates for bound box
  const lonOffset = 0.076;
  const latOffset = 0.053;
  const minLon = centerLon - lonOffset;
  const minLat = centerLat - latOffset;
  const maxLon = centerLon + lonOffset;
  const maxLat = centerLat + latOffset;

  let popups = [];

  // Search function
  $("#search").on("keyup", function() {
    // Declare promise to clear previous search results
    function clearPreviousSearch() {
      return new Promise((resolve, reject) => {
        $(".mapboxgl-marker").remove();
        $(".search-result").remove();
        $(".mapboxgl-popup").remove();
        popups = [];

        if ($("#results").find(".search-result").length == 0) {
          resolve();
        } else {
          reject("Error: search not clear");
        }
      });
    }

    function newSearch() {
      if ($("#search").val()) {
        // Make API request
        let query = $("#search")
          .val()
          .replace(" ", "%20");
        fetch(
          "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
            query +
            `.json?bbox=${minLon},${minLat},${maxLon},${maxLat}&access_token=` +
            mapboxgl.accessToken
        )
          .then(response => response.json())
          .then(function(jsonResponse) {
            // Make array of place names from search results
            let results = jsonResponse.features;
            let places = [];

            function Place(name, address, addressLong, lat, lon) {
              this.name = name;
              this.address = address;
              this.addressLong = addressLong;
              this.lat = lat;
              this.lon = lon;
            }

            results.forEach(function(result) {
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

              if (places.length < 5) {
                places.push(new Place(name, address, addressLong, lat, lon));
              }
            });

            // Create index that will be used to forge a connection between popup and sidebar search result
            let resultIndex = 0;

            places.forEach(function(place) {
              // Prevent against corner case of more than 5 search results
              if ($("#results").find(".search-result").length >= 5) {
                $(".mapboxgl-marker").remove();
                $(".search-result").remove();
                $(".mapboxgl-popup").remove();
                popups = [];
              }

              // Append result of id resultIndex to sidebar
              $(
                "#results"
              ).append(`<div class="search-result" id="${resultIndex}">
              <h3>${place.name}</h3>
              <p>${place.address}</p>
              </div>`);

              // Create popup with class resultIndex
              var popup = new mapboxgl.Popup({
                offset: 25,
                className: `${resultIndex}`
              }).setHTML(`<h4>${place.name}</h4><p>${place.addressLong}</p>`);

              popups.push(popup);

              // Create marker, attach popup
              new mapboxgl.Marker()
                .setLngLat([place.lon, place.lat])
                .setPopup(popup)
                .addTo(map);

              resultIndex++;
            });

            // Display corresponding popup upon sidebar search result hover
            $(".search-result").mouseenter(function() {
              console.log("triggered");
              let index = this.id;
              console.log(index);
              let resultPopup = popups[index];
              if (!resultPopup.isOpen()) {
                resultPopup.addTo(map);
              }
            });
            $(".search-result").mouseleave(function() {
              let index = this.id;
              let resultPopup = popups[index];
              if (resultPopup.isOpen()) {
                resultPopup.remove();
              }
            });

            console.log(popups);
            /*popups.forEach(function(item) {
              item.addTo(map);
            });*/
          });
      }
    }

    clearPreviousSearch()
      .then(newSearch)
      .catch(err => console.log(err));
  });

  // Display corresponding popup upon sidebar search result hover
  /*
  $(".search-result").mouseenter(function() {
    console.log(popups);
    let index = $(".search-result").attr("id");
    let resultPopup = popups[index];
    if (!resultPopup.isOpen()) {
      resultPopup.addTo(map);
    }
  });
  $(".search-result").mouseleave(function() {
    let index = $(".search-result").attr("id");
    let resultPopup = popups[index];
    if (resultPopup.isOpen()) {
      resultPopup.remove();
    }
  });
  */
});
