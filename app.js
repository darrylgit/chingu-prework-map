$(document).ready(function() {
  // Change toggle button appearance when clicked
  $("#toggle").click(function() {
    if ($("#toggleIcon").attr("class") == "fas fa-angle-double-right") {
      $("#toggleIcon")
        .removeClass("fa-angle-double-right")
        .addClass("fa-angle-double-left");
      $("#sidebar").animate({ left: 0 }, 500);
    } else if ($("#toggleIcon").attr("class") == "fas fa-angle-double-left") {
      $("#toggleIcon")
        .removeClass("fa-angle-double-left")
        .addClass("fa-angle-double-right");
      $("#sidebar").animate({ left: "-320px" }, 500);
    }
  });
});
