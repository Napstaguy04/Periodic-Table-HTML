var protonNumber = 0, neutronNumber = 0, electronNumber = 0;

var $canvas = $("<canvas>");
var ctx = $canvas[0].getContext("2d");
var $emptyTableRow = $("#emptySpace");

// Set the canvas size
$canvas.attr("width", 300);
$canvas.attr("height", 300);

// canvas parent
var container = $canvas.parentNode;

// Global variables
var radius = 50, lineWidth = 1;
var x = 0;
var y = radius - 10 - lineWidth / 2;
var angle = 0;

var currentElementName = "";
var isFinishedLoading = false;

$(window).on("load", function() {
  

  var generateEmptySpace = function(){
    let emptyTableRow = "";
    for (let x = 0; x < 19; x++){
      emptyTableRow += "<td colspan='0'>ㅤ</td>";
    }
    $("#emptySpace").append(emptyTableRow);
    
    // CSS stuff
    $("#emptySpace td").css("font-size", "1.2em");
    $("#emptySpace td").css("color", "black");

    // Compatability Stuff
    $("#emptySpace td").css("user-select", "none");
    $("#emptySpace td").css("pointer-events", "none");
  }

  generateEmptySpace();

  //override default
  $('.lanthanides').css('background-color', '#f82882');
  $('.actinides').css('background-color', '#35b14c');

  let $bohrModel = $("#bohr-model");
  $bohrModel.append($canvas);

  drawCanvas();

  // Click Functions

  $('#actinides-hover').click(function() {
    changeColor('.actinides', '#c6fdbb');
  });
  
  $('#lanthanides-hover').click(function() {
    changeColor('.lanthanides', '#ff82b8');
  });

  $("#exit-button").click(function(){
    $("#element-info-modal").hide();
  });

  $('td:not([colspan])').click(function() {
    // Get Proton, Neutron and Electron Number
    var text = $(this).text().split(' ')[0];
    var number = parseInt(text);
    protonNumber = number, neutronNumber = number, electronNumber = number;

    // Get element name
    var elementName = $(this).find(".element-name").text();
    if (elementName) {
      currentElementName = elementName;
      $("#current-element-name").text(currentElementName);
    }

    $("#loading-holder").text("Loading...");
    $("#electroneg-holder").text("");
    $("#atomicnum-holder").text("");
    $("#element-info-wiki").text("");

    openElementInfoModal();
    
    // Scrape data off the internet because I'm lazy
    getData("https://www.periodictable.co.za/", function(data) { 
      let container = $(data).find("#element-list-section");
      let element = container.find('td:contains("' + currentElementName.trim() + '")').not(".react");
      let electronegativity = element.nextAll().eq(2).text();
      let atomicWeight = element.nextAll().eq(1).text();
      var elementData = element.text();

      $("#element-info-wiki").text("Stealing from wikipedia... ");

      if(electronegativity && atomicWeight && elementData){
        $("#loading-holder").text("");
        $("#electroneg-holder").text("Electronegativity: " + electronegativity);
        $("#atomicnum-holder").text("Atomic Weight: " + atomicWeight);

        isFinishedLoading = true;
      } else isFinishedLoading = false;
    });

    getData("https://en.wikipedia.org/wiki/" + currentElementName, function(data) {
      // Check if previous data was not loaded
      if(!isFinishedLoading){
        $("#loading-holder").text("Can't load previous data ://");
      }

      var elementInfo = $(data).find('p:contains("' + currentElementName.trim() + '")').first().text();
      if(elementInfo){
        // Clear out any citations
        elementInfo = elementInfo.replace(/\[\d+\]|\[\w+\]/g, "");
        $("#element-info-wiki").text(elementInfo);
      }
    });

  });

  $("#element-info-modal").resize(function() {
    $canvas.width = container.clientWidth;
    $canvas.height = container.clientHeight;
    
  });

  // loop
  setInterval(function(){
    updateCanvas();
  }, 30);

});

function changeColor(selector, color) {
  var originalColor = $(selector).css('background-color');
  originalColor = rgbToHex(originalColor);
  $(selector).css('background-color', color);
  var interval = setInterval(function() {
    if (originalColor) {
      $(selector).css('transition', 'background-color 0.25s');
      $(selector).css('background-color', originalColor);
      clearInterval(interval);
    }
  }, 100);
}

function getData(url, successHandler) {
  $.ajax({
      type: "GET",
      url: "https://cors-bypasser.glitch.me/bypass/" + url, // this removes every annoying CORS block so I can steal from them
      success: successHandler
  });
}


function rgbToHex(rgb) {
  var hexValues = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
  }
  return "#" + hex(hexValues[1]) + hex(hexValues[2]) + hex(hexValues[3]);
}

function openElementInfoModal() {
  //$("#periodic-table-container").animate({ "margin-right": 300 }, "slow");
  $("#element-info-modal").css("display", "block");
}


function getNumberOfRings(atomicNumber) {
  // start with the lowest energy level and fill it with the maximum number of electrons it can hold
  // (2 for the first energy level, 8 for the second, and so on)
  let energyLevel = 1;
  let electronsPlaced = 0;
  while (atomicNumber > 0) {
    // get the maximum number of electrons that the current energy level can hold
    let maxElectrons = 0;
    if (energyLevel === 1) {
      maxElectrons = 2;
    } else if (energyLevel === 2) {
      maxElectrons = 8;
    } else {
      maxElectrons = 18;
    }
    
    // subtract the number of electrons in the current energy level from the atomic number
    electronsPlaced += Math.min(atomicNumber, maxElectrons);
    atomicNumber -= Math.min(atomicNumber, maxElectrons);
    // move to the next energy level if all of the electrons in the current one have been placed
    if (electronsPlaced === maxElectrons) {
      energyLevel++;
      electronsPlaced = 0;
    }
  }
  // return the number of rings
  return energyLevel;
}

// Deprecated but keeping it cause it looks cool
function getNumberOfElectronsInRing(energyLevel) {
  return energyLevel === 1 ? 2 : 2 * energyLevel;
}

function drawCanvas(){

  var circleX = 150, circleY = 150;

  // Draw the circle
  ctx.beginPath();
  ctx.arc(circleX, circleY, 40, 0, 2 * Math.PI);
  ctx.fillStyle = "lightgray";
  ctx.fill();
  ctx.stroke();

  var ringRadius = 50;
  var circleRadius = 2;
  var lineWidth = 1;

  numRings = getNumberOfRings(protonNumber);

  ctx.translate(circleX, circleY);

  // Set the font and text alignment
  ctx.font = "14px Arial";
  ctx.textAlign = "center";

  ctx.fillStyle = "black";
  ctx.fillText(protonNumber + " P", 0, -20);

  ctx.fillText(neutronNumber + " N", 0, 30);

  //draw the rings
  drawRings();

  var angles = [];
  var numCircles = 1;

  for (var i = 0; i < numRings; i++) {

      for (var j = 0; j < numCircles; j++) {
          if(!angles[i]){
              angles[i] = [];
          }
          if(!angles[i][j]){
              angles[i][j] = Math.random()*2*Math.PI;
          }
          var x = ringRadius * Math.cos(angles[i][j]);
          var y = ringRadius * Math.sin(angles[i][j]);
          ctx.beginPath();
          ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
          ctx.fillStyle = "black";
          ctx.fill();
          angles[i][j] += 0.1;
          //console.log(angles[i][j]);
      }
      ringRadius += lineWidth * 10;
}
  // Restore the context state
  ctx.restore();
};

function updateCanvas(){
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, 1000, 1000);
  drawCanvas();
}

function drawRings(){
  ringRadius = 50;
  for (var i = 0; i < numRings; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, 2 * Math.PI);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ringRadius += lineWidth * 10;
  }
};
