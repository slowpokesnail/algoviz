(function() {

    const svg = d3.select('#svg')
    const width = 1000, height = 600, marginLeft = 100, 
    marginRight = 100, marginTop = 50, marginBottom = 50

    const colors = ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]
    
    d3.json('points.json').then((data) => {

        // // append ids as text
        // svg.selectAll('.text')
        //     .data(data)
        //     .enter()
        //     .append('text')
        //         .attr('x', d => d.x + 10)
        //         .attr('y', d => d.y - 10)
        //         .text(d => d.id)

        d3.json('links.json').then((links) => {
            links = links.map((d) => {
                const source = data[d.source.id - 1]
                const target = data[d.target.id - 1]
                return {
                    source: source,
                    target: target
                }
            })

            // append lines
            const lines = svg.selectAll('.line')
                .data(links)
                .enter()
                .append('line')
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y)
                    .attr('id', (d,i) => "line" + (d.source.id + "d" + d.target.id))
                    .style('stroke', '#9c9c9c')
                    .style('stroke-width', '2')
                    .style('opacity', '0.2')

            svg.selectAll('.line')
                .data(links)
                .enter()
                .append('line')
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y)
                    .style('stroke', '#9c9c9c')
                    .style('stroke-width', '2')
                    .style('opacity', '0.2')

            // append points
            svg.selectAll('.circle')
                .data(data)
                .enter()
                .append('circle')
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y)
                    .attr('r', 5)
                    .attr('id', d => "dot" + d.id)
                    .attr('fill', '#9c9c9c')

            
            // append start and end text
            svg.append('text')
                .attr('x', 80)
                .attr('y', 80)
                .text("start")

            svg.append('text')
                .attr('x', 500)
                .attr('y', 505)
                .text("end")

            // d3.select('#line' + 1)
            //     .attr('fill', "#4e79a7")

            // d3.select('#line' + 3)
            //     .attr('fill', '#ff9da7')

            // start animation when button is clicked
            d3.select('#start').on('click', function() {
                const startId = 1
                const endId = 3
                // let orderVisited = []
                let nextToVisit = []
                let levels = [0]
                let visited = new Set()
                let count = 0
                nextToVisit.push(startId)
                d3.select('#dot' + 1)
                            .attr('fill', colors[0])
                while(nextToVisit.length > 0) {
                    // debugger;
                    const currId = nextToVisit.shift()
                    const depth = levels.shift()
                    let curr = data.find((d) => {
                        return d.id == currId
                    })

                    if (!visited.has(currId)) {
                        if (typeof curr.temp != "undefined") {
                            count = animate(curr.temp, curr.id, depth, count)
                        }
                    }
                    
                    if (currId == endId) {
                        backTrace([], curr, data, 1)
                        break
                    }

                    if (visited.has(currId)) {
                        continue
                    }
                    visited.add(currId)

                    for (let i = 0; i < curr.adj.length; i++) {
                        const adj = data.find(d => d.id == curr.adj[i])
                        if (typeof adj.parent == "undefined") {
                            adj.parent = currId // parent: the first seen currId, used to backTrace
                        }
                        if (typeof adj.temp == "undefined") {
                            adj.temp = [currId] // temp, used to animate the last edge
                        } else {
                            adj.temp.push(currId)
                        }
                        
                        nextToVisit.push(curr.adj[i])
                        levels.push(depth + 1)
                    }

                }

                // append legend

                // append depth labels
                svg.append('text')
                    .attr('x', 790)
                    .attr('y', 50)
                    .text("Depth")

                for (let i = 0; i < 6; i++) {
                    svg.append('circle')
                        .attr('cx', 800)
                        .attr('cy', 50 + 25*(i + 1))
                        .attr('r', 4)
                        .style('fill', colors[i])

                    svg.append('text')
                        .attr('x', 810)
                        .attr('y', 55 + 25*(i+1))
                        .text(i)
                }

                // append line key
                svg.append('text')
                    .attr('x', 790)
                    .attr('y', 250)
                    .text("Lines")

                svg.append('line')
                    .attr('x1', 792)
                    .attr('y1', 275)
                    .attr('x2', 808)
                    .attr('y2', 275)
                    .style('stroke', '#9c9c9c')
                    .style('stroke-width', '2')
                    .style('opacity', '0.2')

                svg.append('text')
                    .attr('x', 818)
                    .attr('y', 278)
                    .text("unexplored")

                svg.append('line')
                .attr('x1', 792)
                .attr('y1', 300)
                .attr('x2', 808)
                .attr('y2', 300)
                .style('stroke', '#9c9c9c')
                .style('stroke-width', '2')
                .style('opacity', '1')

                svg.append('text')
                    .attr('x', 818)
                    .attr('y', 303)
                    .text("explored")

                svg.append('line')
                    .attr('x1', 792)
                    .attr('y1', 325)
                    .attr('x2', 808)
                    .attr('y2', 325)
                    .style('stroke', '#03b6fc')
                    .style('stroke-width', '2')
                    .style('opacity', '1')

                svg.append('text')
                    .attr('x', 818)
                    .attr('y', 328)
                    .text("shortest")
                
            })
        })
        
    })

    // backtrace the shortest path
    function backTrace(arr, curr, data, startId) {
        arr.push(curr)
        if (typeof curr.parent == "undefined" || curr.parent == startId) {
            arr.push(data.find(d => d.id == startId))
            animateShortestPath(arr.reverse())
        } else {
            const parent = data.find(d => d.id == curr.parent)
            backTrace(arr, parent, data, startId)
        }
    }

    function animateShortestPath(path) {
        for (let i = 0; i < path.length - 1; i++) {
            const line = findLine(path[i].id, path[i+1].id)
            line.style('stroke', '#03b6fc')
            // line.transition()
            //     .duration(750)
            //     .ease(d3.easeLinear)
        }
    }

    function animate(parentArr, child, depth, count) {
        const parent = parentArr.pop()
        let line = findLine(parent, child)
        if (!line.empty()) {
            animateLine(line, depth, child)
        }
        return count + 1
    }

    function findLine(parent, child) {
        let line = d3.select('#line' + (parent + "d" + child))
        if (line.empty()) {
            line = d3.select('#line' + (child + 'd' + parent))
        }
        return line
    }

    function animateLine(line, depth, child) {
        line.style('opacity', '1').style('stroke-width', 2)
        const totalLength = line.node().getTotalLength()
        const animated = line.attr('class')
        if (animated != 'animated') {
            line
                // Set the line pattern to be an long line followed by an equally long gap
                .attr("stroke-dasharray", totalLength + " " + totalLength)
                // Set the intial starting position so that only the gap is shown by offesetting by the total length of the line
                .attr("stroke-dashoffset", totalLength)
                // Then the following lines transition the line so that the gap is hidden...
                .transition()
                .duration(500)
                .delay(depth*500)
                .on('end', () => {
                    if (child != "none") {
                        d3.select('#dot' + child)
                            .attr('fill', colors[depth])
                    }
                })
                .ease(d3.easeLinear) //Try linear, quad, bounce... see other examples here - http://bl.ocks.org/hunzy/9929724
                .attr("stroke-dashoffset", 0);
            line.attr('class', 'animated')
            return true
        } else {
            return false
        }        
    }




})();

