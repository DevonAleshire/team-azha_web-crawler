import Component from '@ember/component';
import { select } from 'd3-selection';
import { forceSimulation, forceCenter, forceManyBody, forceLink, forceCollide } from 'd3-force';
import { transition } from 'd3-transition'

export default Component.extend({
    didInsertElement() {
        const data = this.model;
        //console.log('Data:', this.model)

        //Select SVG
        let svg = select('svg'),
        width = +svg.attr('width'),
        height = +svg.attr('height');

        console.log('SVG: ', svg, ' Height/Width - ', height, ' / ', width)

        //Create tooltip
        var tooltip = select("body")
            .append("div")
            .attr("class", "tooltip")
            .attr('style', 'word-break: break-all; word-wrap: break-word;')
            .style("opacity", 0);

        //Create nodes
        let node = svg.selectAll('.node')
            .data(data.nodes)
            .enter()//For each item add <g class="nodes">
            .append('g')
            .attr('class', 'nodes')

        //Draw Circle for each Node
        let circles = node.append('circle')
            .attr('r', 12)//Create circle with radius size
            .attr('fill', function(d){
                //console.log('D: ', d)
                //console.log("Data Search Node: ", data.searchNode, ' === ', d.id, ' : Node Url -> ', data.searchNode === d.id)

                if(data.keywordFound && (data.keywordNode === d.id)){
                    console.log('Keyword Node: ', d.id)
                    return '#F1FA72' //Yellow
                }
                else if(d.depth === 0){
                    console.log('Search Node: ', d.id)
                    return '#72FA77'//Green
                    
                }else{
                    return '#618BEC' //Blue
                }
            })
            //Mouse events for each node
            //This is copy pasted code from https://bl.ocks.org/almsuarez/4333a12d2531d6c1f6f22b74f2c57102
            .on('mouseover.tooltip', function (d) {
                tooltip.transition()
                    .duration(300)
                    .style("opacity", .8);
                
                var depth = d.depth === 0 ? 'Source': d.depth;
                tooltip.html("<span class='tooltipLabel'>URL</span><br>" + d.id + "<p/><span class='tooltipLabel'>Depth</span>: " + depth)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on('mouseover.fade', fade(0.1))
            .on("mouseout.tooltip", function () {

                tooltip.transition()
                    .duration(100)
                    .style("opacity", 0);
            })
            .on('mouseout.fade', fade(1))
            .on("mousemove", function () {
                tooltip.style("left", (event.pageX) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            //Add Click Event
            .on('click', function (d) { window.open(d.id) });

        //Create Force Simulation
        let simulation = forceSimulation(data.nodes);

        //Create Forces 
        //Add Forces - Resource: https://www.d3indepth.com/force-layout/
        simulation
            //Charge force, repel when nodes get too close
            //Greater negative strength greater the repel force
            .force('charge_force', forceManyBody().strength(80).distanceMax(400).distanceMin(80))
            .force('center_force', forceCenter(1500 / 2, 1000 / 2))//Drives nodes to center of svg
            //.force("collisionForce", forceCollide().strength(.2))
            .force("collisionForce", forceCollide(20).strength(1).iterations(100))

        //Add link-force
        let link_force = forceLink(data.links).id(function (d) { return d.id; });
        //Add forceLink to simulation
        simulation.force('links', link_force);

        /*ADD LINKS*/
        //Draw links
        let link = svg.append('g')//Add links group
            .attr('class', 'links')
            .selectAll('line')
            .data(data.links)//Add links data
            .enter()//For each link in links group
            .append('line')//Create line
            .attr('stroke-width', 2);//Draw line
        
        
            link.attr('class', 'links')
            .on('mouseover.tooltip', function(d) {
                tooltip.transition()
                    .duration(300)
                    .style("opacity", .8);
                tooltip.html("<span class='tooltipLabel'>Source</span>: "+ d.source.id + 
                            "<p/><span class='tooltipLabel'>Target</span>: " + d.target.id)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY + 10) + "px");
                })
                .on("mouseout.tooltip", function() {
                tooltip.transition()
                    .duration(100)
                    .style("opacity", 0);
                })
                .on('mouseout.fade', fade(1))
                .on("mousemove", function() {
                tooltip.style("left", (event.pageX) + "px")
                    .style("top", (event.pageY + 10) + "px");
                });

        //On every tick take tickAction
        simulation.on('tick', tickAction);

        function tickAction() {
            node //Used to position
                .attr("transform", function (d) {
                    return "translate(" + (d.x = Math.max(13, Math.min(1500 - 13, d.x))) + "," 
                    + (d.y = Math.max(13, Math.min(1000 - 13, d.y))) + ")"
                });

            //For Links
            //update link positions 
            //simply tells one end of the line to follow one node around
            //and the other end of the line to follow the other node around
            link
                .attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });
        }

        //Helpers
        function fade(opacity) {
            return d => {
                node.style('stroke-opacity', function (o) {
                    const thisOpacity = isConnected(d, o) ? 1 : opacity;
                    this.setAttribute('fill-opacity', thisOpacity);
                    return thisOpacity;
                });

                link.style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : opacity));
            }
        }

        
        const linkedByIndex = {};
        data.links.forEach(d => {
            linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
        });

        function isConnected(a, b) {
            return linkedByIndex[`${a.index},${b.index}`] || linkedByIndex[`${b.index},${a.index}`] || a.index === b.index;
        }
    }
});
