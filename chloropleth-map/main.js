'use strict';

// Async'ly fetch the dataset
const educationDataUrl =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const countyDataUrl =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';
const educationPromise = d3.json(educationDataUrl);
const countyPromise = d3.json(countyDataUrl);

// Initialize
const w = 900;
const h = 600;
const margin = {
  top: 10,
  right: 10,
  left: 10,
  bottom: 10
};

const colors = [
  '#fcfbfd',
  '#efedf5',
  '#dadaeb',
  '#bcbddc',
  '#9e9ac8',
  '#807dba',
  '#6a51a3',
  '#54278f',
  '#3f007d'
];

const legendWidth = 330;
const legendHeight = 20;
const rectWidth = legendWidth / colors.length;
const rectHeight = legendHeight;

const svg = d3
  .select('.chart')
  .append('svg')
  .attr('width', w + margin.left + margin.right)
  .attr('height', h + margin.top + margin.bottom);

let path = d3.geoPath();

let tooltip = d3.select('#tooltip');

// Dataset received
Promise.all([countyPromise, educationPromise])
  .then(data => {
    let county = data[0];
    let education = data[1];

    // Convert topoJSON to geoJSON Feature
    let geoJSON = topojson.feature(county, county.objects.counties).features;

    const maxEducation = d3.max(education, d => d.bachelorsOrHigher);
    const minEducation = d3.min(education, d => d.bachelorsOrHigher);

    console.log(maxEducation);

    const fillColor = d3
      .scaleQuantize()
      .domain([minEducation, maxEducation])
      .range(colors);

    const findBachelor = (d, arg) =>
      education.find(elem => d.id === elem.fips).bachelorsOrHigher || arg;

    svg
      .append('g')
      .attr('class', 'counties')
      .selectAll('path')
      .data(geoJSON)
      .enter()
      .append('path')
      .attr('class', 'county')
      .attr('d', d => path(d.geometry))
      .attr('data-fips', d => d.id)
      .attr('data-education', d => findBachelor(d, null))
      .attr('fill', d => {
        return fillColor(findBachelor(d, 'red'));
      })
      .on('mouseover', (d, i) => {
        let x = d3.event.clientX;
        let y = d3.event.clientY;

        tooltip
          .attr('data-education', findBachelor(d, null))
          .style('left', `${x + 20}px`)
          .style('top', `${y - 20}px`)
          .html(() => {
            let match = education.find(elem => d.id === elem.fips);
            if (match) {
              return `
                <b>${match.area_name}</b> - <b>${match.state}</b>
                <br>
                <b>${match.bachelorsOrHigher}%</b>
              `;
            }
            return 'no data';
          });

        tooltip.classed('hidden', false);
      })
      .on('mouseout', () => {
        tooltip.classed('hidden', true);
      });

    // Legend
    let legendArray = colors.map((d, i) => {
      return (i * (maxEducation - minEducation)) / colors.length + minEducation;
    });

    let legendScale = d3
      .scaleLinear()
      .domain([minEducation, maxEducation])
      .range([0, legendWidth]);

    let legendAxis = d3
      .axisBottom(legendScale)
      .tickFormat(x => `${Math.round(x)}%`)
      .tickSize(8)
      .tickValues(legendArray);

    let legend = svg
      .append('g')
      .attr('id', 'legend')
      .attr('transform', `translate(${w - legendWidth}, 0)`);

    // Legend Boxes
    legend
      .append('g')
      .selectAll('rect')
      .data(colors)
      .enter()
      .append('rect')
      .attr('fill', d => d)
      .attr('x', (d, i) => i * rectWidth)
      .attr('y', 0)
      .attr('width', rectWidth)
      .attr('height', rectHeight);

    // Legend Axis
    legend
      .append('g')
      .attr('transform', `translate(0, ${rectHeight})`)
      .call(legendAxis);

    // State boundaries
    svg
      .append('path')
      .datum(topojson.mesh(county, county.objects.states, (a, b) => a !== b))
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('d', path);
  })
  .catch(e => {
    console.log('Error', e);
  });
