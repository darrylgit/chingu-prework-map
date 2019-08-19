$(document).ready(function() {
  // Sidebar toggle variables
  const openerIcon = $("#toggleIcon").attr("class");
  const closerIcon = "fas fa-angle-double-left";
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
  $("#sidebar").css("left", leftWhenHidden);

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

  let map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v9",
    center: [-84.174, 34.037],
    zoom: 12.1
  });

  // Coordinates for bound box
  const minLon = "-84.248114";
  const minLat = "33.985034";
  const maxLon = "-84.096369";
  const maxLat = "34.110766";

  $("#search").on("change keyup blur", function() {
    if ($("#search").val()) {
      // Make API request
      let query = $("#search").val();
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
          results.forEach(result => places.push(result.place_name));
          console.log(places);
        });
    }
  });
});
