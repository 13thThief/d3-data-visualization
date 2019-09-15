'use strict';

// Async'ly fetch the dataset
const url =
  'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json';
const dataPromise = d3.json(url);

// Initialize
const margin = {
  top: 10,
  right: 10,
  left: 10,
  bottom: 50
};

const w = 800 - margin.left - margin.right;
const h = 600 - margin.top - margin.bottom;

const svg = d3
  .select('.chart')
  .append('svg')
  .attr('width', w + margin.left + margin.right)
  .attr('height', h + margin.top + margin.bottom)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

const treemap = d3
  .treemap()
  .size([w, h])
  .paddingInner(1);

let tooltip = d3.select('#tooltip');

// Dataset received
dataPromise
  .then(data => {
    let dataset = data;

    const root = d3
      .hierarchy(dataset)
      .sum(d => d.value)
      .sort((a, b) => b.height - a.height || b.value - a.valueS);

    treemap(root);

    let colorGroup = dataset.children.map(d => d.children[0].category);

    let color = d3
      .scaleOrdinal()
      .domain(colorGroup)
      .range([...d3.schemeSet2, ...d3.schemeSet3].splice(0, colorGroup.length));

    let tileGroup = svg
      .selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('class', 'tile');

    let tile = tileGroup
      .append('rect')
      .attr('class', 'tile')
      .attr('data-name', d => d.data.name)
      .attr('data-category', d => d.data.category)
      .attr('data-value', d => d.data.value)
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => color(d.data.category))
      .on('mouseover', (d, i) => {
        let x = d3.event.clientX;
        let y = d3.event.clientY;

        tooltip
          .attr('data-value', d.data.value)
          .style('left', `${x + 20}px`)
          .style('top', `${y - 10}px`).html(`
            <b>Name: ${d.data.name}</b>
            <br>
            <b>Category: ${d.data.category}</b>
            <br>
            <b>Value: ${d.data.value}</b>
          `);

        tooltip.classed('hidden', false);
      })
      .on('mouseout', () => {
        tooltip.classed('hidden', true);
      });

    tileGroup
      .append('text')
      .attr('class', 'texty')
      .attr('x', d => d.x0 + 5)
      .attr('y', d => d.y0 + 10)
      .text(d => d.data.name);

    const legendWidth = 20;
    const legendHeight = 20;
    const rectWidth = 20;
    const rectHeight = 20;

    const legend = d3
      .select('#legend')
      .append('svg')
      .attr('width', 500)
      .attr('height', 300);

    // Legend
    let legendG = legend
      .selectAll('g')
      .data(colorGroup)
      .enter()
      .append('g')
      .attr(
        'transform',
        (d, i) => `translate(${150 * (i % 3)}, ${50 * Math.floor(i / 3)})`
      );

    legendG
      .append('rect')
      .attr('class', 'legend-item')
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('fill', d => color(d));

    legendG
      .append('text')
      .attr('x', (d, i) => rectWidth + 4)
      .attr('y', (d, i) => rectWidth - 4)
      .text(d => d);
  })
  .catch(e => {
    console.log('Error', e);
  });
