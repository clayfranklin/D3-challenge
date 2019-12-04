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
// Import Data
d3.csv("assets/data/data.csv").then(function(demo_data) {
    // Step 1: Parse Data/Cast as numbers
    // ==============================
    
    demo_data.forEach(function(data) {
        data.income = +data.income;
        data.obesity = +data.obesity;

        // console.log(data.income)
      });
     
  
      // Step 2: Create scale functions
      // ==============================
      var xLinearScale = d3.scaleLinear()
        .domain([d3.min(demo_data, d => d.income)-3000, d3.max(demo_data, d => d.income)+ 3000])
        .range([0, width]);
  
      var yLinearScale = d3.scaleLinear()
        .domain([20, d3.max(demo_data, d => d.obesity + 1)])
        .range([height, 0]);
  
      // Step 3: Create axis functions
      // ==============================
      var bottomAxis = d3.axisBottom(xLinearScale);
      var leftAxis = d3.axisLeft(yLinearScale);
  
      // Step 4: Append Axes to the chart
      // ==============================
      chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
  
      chartGroup.append("g")
        .call(leftAxis);

      // Make circles
          // ==============================
      var circlesGroup = chartGroup.selectAll("circle")
        .data(demo_data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.income))
        .attr("cy", d => yLinearScale(d.obesity))
        .attr("text", "dammit")
        .attr("r", "15")
        .attr("opacity", ".7")
        .classed("stateCircle", true)
        // .text(function(d) {
        //     return d.abbr;
              // })
        // .on("click", function(d, i) {
        //     alert(`${d.abbr} average income: ${d.income} obesity %: ${d.obesity}`);
        // })
        // .on("mouseover", function() {
        //     d3.select(this)
        //         .attr("fill", "blue");
        // })
        
        ;
      // Make Abbreviations on each circle
          // ==============================
      var stateLabels = chartGroup.selectAll("circles")
        .data(demo_data)
        .enter()
        .append("text")
        .attr("x", function(d) {
          return xLinearScale(d.income)-10;
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
      chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .text("Obesity")
        .classed("aText", true);

      chartGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
        .text("Income")
        .classed("aText", true);
        
    // Make tooltip
   // ==============================
      var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .html(function(d) {
          return (`${d.abbr}<br>income level: ${d.income}<br>obesity level: ${d.obesity}`);
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

    }).catch(function(error) {
        console.log(error);

    });