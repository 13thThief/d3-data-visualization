"use strict";

// Async'ly fetch the dataset
const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const dataPromise = d3.json(url);

// Initialize
const w = 1200;
const h = 500;
const padding = 60;

const colors = [
  "#313695",
  "#4575b4",
  "#74add1",
  "#abd9e9",
  "#e0f3f8",
  "#ffffbf",
  "#fee090",
  "#fdae61",
  "#f46d43",
  "#d73027",
  "#a50026"
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", w)
  .attr("height", h + padding);

let tooltip = d3.select("#tooltip");
tooltip.attr("id", "tooltip");

// Dataset received
dataPromise
  .then(response => {
    const baseTemp = response.baseTemperature;
    const dataset = response.monthlyVariance;

    dataset.forEach(d => {
      d.month -= 1;
    });

    const minTemp = d3.min(dataset, d => d.variance) + baseTemp;
    const maxTemp = d3.max(dataset, d => d.variance) + baseTemp;

    const years = dataset.map(data => data.year);
    const yearsExtent = d3.extent(years);

    const cellWidth = (w - 2 * padding) / (yearsExtent[1] - yearsExtent[0] + 1);
    const cellHeight = (h - 2 * padding) / 11;

    // Scales
    let xScale = d3
      .scaleLinear()
      .domain(yearsExtent)
      .range([padding, w - padding]);

    let yScale = d3
      .scaleLinear()
      .domain([11, 0])
      .range([h - padding, padding]);

    // Axes
    let xAxis = d3
      .axisBottom(xScale)
      .tickFormat(d3.format("d"))
      .tickSize(10, 1);
    let yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d, i) => months[months.length - 1 - i])
      .tickSize(10, 1);

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${h - padding})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${padding}, 0)`)
      .call(yAxis);

    // Continuous input to discrete output
    let fillColor = d3
      .scaleQuantize()
      .domain([minTemp, maxTemp])
      .range(colors);

    svg
      .append("g")
      .attr("id", "heatmap")
      .selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("width", cellWidth)
      .attr("height", cellHeight)
      .attr("x", (d, i) => 1 + xScale(d.year))
      .attr("y", (d, i) => yScale(d.month) - cellHeight)
      .attr("fill", d => fillColor(baseTemp + d.variance))
      .attr("class", "cell")
      .attr("data-month", d => d.month)
      .attr("data-year", d => d.year)
      .attr("data-temp", d => baseTemp + d.variance)

      .on("mouseover", (d, i) => {
        let x = d3.event.clientX;
        let y = d3.event.clientY;
        tooltip
          .attr("data-year", d.year)
          .style("left", `${x + 20}px`)
          .style("top", `${y - 20}px`).html(`
            <b>${d.year}</b> - <b>${months[d.month]}</b>
            <br>
            <b>${(d.variance + baseTemp).toFixed(2)}°C</b>
            <br>
            <b>${d.variance > 0 ? "+" : ""}${d.variance}°C</b>
            `);

        tooltip.classed("hidden", false);
      })
      .on("mouseout", () => {
        tooltip.classed("hidden", true);
      });

    // Legends
    const legendWidth = 330;
    const legendHeight = 25;
    const rectWidth = legendWidth / colors.length;
    const rectHeight = legendHeight;

    let legendArray = colors.map((d, i) => {
      return (i * (maxTemp - minTemp)) / colors.length + minTemp;
    });

    let legendScale = d3
      .scaleLinear()
      .domain([minTemp, maxTemp])
      .range([0, legendWidth]);

    let legendAxis = d3
      .axisBottom(legendScale)
      .tickFormat(d3.format(".1f"))
      .tickValues(legendArray);

    let legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${padding}, ${h - legendHeight - 5})`);

    legend
      .append("g")
      .selectAll("rect")
      .data(colors)
      .enter()
      .append("rect")
      .style("fill", d => d)
      .attr("x", (d, i) => i * rectWidth)
      .attr("y", 0)
      .attr("width", rectWidth)
      .attr("height", rectHeight);

    // legend
    //   .append('g')
    //   .selectAll('text')
    //   .data(legendArray)
    //   .enter()
    //   .append('text')
    //   .attr('x', (d, i) => i*rectWidth + (rectWidth/2))
    //   .attr('y', 2 * rectHeight)
    //   .text(d => d.toFixed(1))

    legend
      .append("g")
      .attr("transform", `translate(0, ${rectHeight})`)
      .call(legendAxis);
  })
  .catch(e => {
    console.log("Error", e);
    // alert('Error receiving dataset');
  });
