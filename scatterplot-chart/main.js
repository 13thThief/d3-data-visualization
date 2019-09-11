'use strict';

// Async'ly fetch the dataset
const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
const dataPromise = d3.json(url);

// Initialize
const w = 840;
const h = 600;
const padding = 40;
const color = '#006400';
const color1 = '#f48120';
const color2 = '#430098';

const svg = d3.select('.chart')
              .append('svg')
              .attr('width', w)
              .attr('height', h)

let tooltip = d3.select('#tooltip');
let dataX = d3.select('#data-xvalue');
let dataY = d3.select('#data-yvalue');

// Dataset receive
dataPromise
  .then(response => {
    // Dataset
    const dataset = response;

    // `Date` only takes string
    const years = dataset.map(data => new Date(`${data.Year}`));

    years.push(new Date('1993'))
    years.push(new Date('2016'));

    const minutes = dataset.map(data => {
      let time = data.Time.split(':');
      return new Date(0, 0, 0, 0, time[0], time[1])
    });


    const formatMinutes = d3.timeFormat('%M:%S');

    let minX = d3.min(years);
    let maxX = d3.max(years);

    let minY = d3.min(minutes);
    let maxY = d3.max(minutes);

    // Scales
    let xScale = d3.scaleTime()
                  .domain([ minX, maxX ])
                  .range([ padding, w - padding ]);

    let yScale = d3.scaleTime()
                  .domain([ maxY, minY ])
                  .range([ h - padding, padding ]);

    // Axes
    let xAxis = d3.axisBottom(xScale);
    let yAxis = d3.axisLeft(yScale).tickFormat(formatMinutes);

    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${h - padding})`)
      .call(xAxis);

    svg.append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${padding}, 0)`)
      .call(yAxis);

    // Circle
    const radius = 7;

    svg.selectAll('circle')
      .data(dataset)
      .enter()
      .append('circle')
      .attr('fill', d => d.Doping ? 'red' : color)
      .attr('r', radius)
      .attr('cx', (d, i) => xScale(years[i]))
      .attr('cy', (d, i) => yScale(minutes[i]) )
      .attr('class', 'dot')
      .attr('data-xvalue', (d, i) => d.Year)
      .attr('data-yvalue', (d, i) => minutes[i])
      
      .on('mouseover', (d, i) => {
        let x = d3.event.clientX;
        let y = d3.event.clientY;
        tooltip
          .attr('data-year', d.Year)
          .style('left', `${x + 20}px`)
          .style('top', `${y - 20}px`)
          .html(`<b>${d.Name}</b> (${d.Nationality})<br>
            <b>Year:</b> ${ d.Year } <b>Time:</b> ${d.Time}<br>
            <b>Doping:</b> ${ d.Doping ? d.Doping : 'None' }`)

        tooltip
          .classed('hidden', false);
      })
      .on('mouseout', () => {

        tooltip
          .classed('hidden', true);
      })

    // Legends
    let legend = svg.selectAll('#legend')
      .data([1, 0])
      .enter()
      .append('g')
      .attr('id', 'legend')
      .attr('transform', (d,i) => `translate(0, ${h / 2 + i * 30})`)

      // Add rectange
      legend.append('rect')
        .attr('x', w - 15)
        .attr('width', 15)
        .attr('height', 15)
        .style('fill', d => d ? color1 : color);

      // Add text
      legend.append('text')
        .attr('x', w - 30)
        .attr('y', 9)
        .attr('dy', 3)
        .style('text-anchor', 'end')
        .text(d => {console.log(d); return d ? 'Riders with doping allegations'
          : 'No doping allegations'});

  })
  .catch(e => {
    console.log(e);
    // alert('Error receiving dataset');
  })