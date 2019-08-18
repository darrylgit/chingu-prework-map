$(document).ready(function() {
  // Sidebar toggle variables
  const openerIcon = "fa-angle-double-right";
  const closerIcon = "fa-angle-double-left";
  const toggleSpeed = 300;
  const visibleEdge = 15;
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
    if ($("#toggleIcon").attr("class") == "fas " + openerIcon) {
      //setHiddenValue();
      $("#toggleIcon")
        .removeClass(openerIcon)
        .addClass(closerIcon);
      $("#sidebar").animate({ left: 0 }, toggleSpeed);
    } else if ($("#toggleIcon").attr("class") == "fas " + closerIcon) {
      $("#toggleIcon")
        .removeClass(closerIcon)
        .addClass(openerIcon);
      //$("#sidebar").animate({ left: sidebarHidden(visibleEdge) }, toggleSpeed);
      $("#sidebar").animate({ left: leftWhenHidden }, toggleSpeed);
    }
  });
});
