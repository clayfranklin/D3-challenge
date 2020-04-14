var svgWidth = 960;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  var chosenXAxis = "income";

// function used for updating x-scale var upon click on axis label
function xScale(demo_data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(demo_data, d => d[chosenXAxis]) * 0.8,
      d3.max(demo_data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "smokes") {
    var label = "Smokers:";
  }
  else {
    var label = "Income:";
  }

   // Make tooltip
   // ==============================
   var toolTip = d3.tip()
   .attr("class", "d3-tip")
   .html(function(d) {
     return (`${d.abbr}<br>${label} level ${d[chosenXAxis]} obesity level ${d.obesity}`);
   });

 //  Create tooltip in the chart
 // ==============================
 chartGroup.call(toolTip);

 // Create event listeners to display and hide the tooltip
 // ==============================
 circlesGroup.on("mouseover", function(data) {
   toolTip.show(data, this);
 })
   // onmouseout event
 circlesGroup.on("mouseout", function(data) {
   toolTip.hide(data);
   });

  return circlesGroup;
}

  // Import Data
d3.csv("assets/data/data.csv").then(function(demo_data) {
    // Step 1: Parse Data/Cast as numbers
    // ==============================
    
    demo_data.forEach(function(data) {
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;

        // console.log(data.income)
      });
     
  
      // Step 2: Create scale functions
      // ==============================
      var xLinearScale = xScale(demo_data, chosenXAxis);
  
      var yLinearScale = d3.scaleLinear()
        .domain([20, d3.max(demo_data, d => d.obesity + 1)])
        .range([height, 0]);
  
      // Step 3: Create axis functions
      // ==============================
      var bottomAxis = d3.axisBottom(xLinearScale);
      var leftAxis = d3.axisLeft(yLinearScale);
  
      // Step 4: Append Axes to the chart
      // ==============================
      var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

      chartGroup.append("g")
        .call(leftAxis);

      // Make circles
          // ==============================
      var circlesGroup = chartGroup.selectAll()
        .data(demo_data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.obesity))
        .attr("x", function(d) {
              return xLinearScale(d[chosenXAxis])-10;
               })
        .attr("y", function(d) {
              return yLinearScale(d.obesity)+5;
               }) 
        .text(function(d) {
              return d.abbr;})
        .attr("r", "15")
        .attr("opacity", ".7")
        .classed("stateCircle", true)
        ;
      // Make Abbreviations on each circle
          // ==============================
      var stateLabels = chartGroup.selectAll("c")
        .data(demo_data)
        .enter()
        .append("text")
        .attr("x", function(d) {
          return xLinearScale(d[chosenXAxis])-10;
           })
        .attr("y", function(d) {
          return yLinearScale(d.obesity)+5;
           }) 
        .text(function(d) {
          return d.abbr;
            })
        .classed("stateText", true)
        ;
       
         // Create axes labels
         // ==============================
      var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
      var smokerLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "smokes") // value to grab for event listener
        .classed("active", true)
        .text("Smokers");
    
      var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Income");

      chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .text("Obesity")
        .classed("aText", true);

        
     // x axis labels event listener    
        var circlesGroup = updateToolTip(chosenXAxis, circlesGroup, stateLabels);

 
       labelsGroup.selectAll("text")
       .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(demo_data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // update statlabels with x values
        stateLabels = updateToolTip(circlesGroup, xLinearScale, chosenXAxis);

        // changes classes to change bold text
        if (chosenXAxis === "income") {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          smokerLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          smokerLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

    }).catch(function(error) {
        console.log(error);

    });