# algoviz

This is a project to visualize common algorithms like Breadth First Search.

## BFS (Breadth First Search)
This website shows how breadth first search works. Something interesting about the visualization is every node (dot) only has one explored edge (line) leading to it. This is because in BFS we use a set to prevent the same node from being visited twice, thus eliminating some extra work. 

I used the d3.js library to create this visualization. Some important functions are:

__backTrace__
This function traces the path the search took to get to the target node and highlights the found path by calling __animateShortestPath__

__animateLine__
This function animates a given egde or line object


