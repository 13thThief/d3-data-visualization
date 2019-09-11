'use strict';

// Async'ly fetch the dataset
let dataPromise = d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json');

// Initialize
const w = 850;
const h = 580;
const padding = 40;
const color = '#006400';

const svg = d3.select('.chart')
              .append('svg')
              .attr('width', w)
              .attr('height', h)

let tooltip = d3.select('#tooltip');
let dataDate = d3.select('#data-date');
let dataGDP = d3.select('#data-gdp');

// Dataset received
dataPromise
  .then(response => {

    // Dataset
    const dataset = response.data;

    let years = dataset.map(data => new Date(data[0]));
    let gdp = dataset.map(data => data[1]);

    let minX = d3.min(years);
    let maxX = d3.max(years);

    // let minY = d3.min(gdp);
    let maxY = d3.max(gdp);

    // Scales
    let xScale = d3.scaleTime()
                  .domain([ minX, maxX ])
                  .range([ padding, w - padding ]);

    let yScale = d3.scaleLinear()
                  .domain([ 0, maxY ])
                  .range([ h - padding, padding ]);

    // Axes
    let xAxis = d3.axisBottom(xScale);
    let yAxis = d3.axisLeft(yScale);

    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${h - padding})`)
      .call(xAxis);

    svg.append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${padding}, 0)`)
      .call(yAxis);

    // Bars
    const barWidth = (w - 2 * padding) / dataset.length;

    svg.selectAll('rect')
      .data(gdp)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('data-date', (d, i) => dataset[i][0])
      .attr('data-gdp', (d, i) => d)
      .attr('width', barWidth)
      .attr('height', d => h - (padding + yScale(d)))
      .attr('x', (d, i) => padding + i * barWidth)
      .attr('y', (d, i) =>  yScale(d))
      .on('mouseover', (d, i) => {

        tooltip
          .attr('data-gdp', d)
          .attr('data-date', dataset[i][0])
          
        dataDate
          .text(dataset[i][0])

        dataGDP
          .text(d)

        tooltip
          .classed('hidden', false)
      })
      .on('mouseout', () => {

        tooltip
          .classed('hidden', true);
      })
  })
  .catch(e => {
    alert('Error receiving dataset');
  })

