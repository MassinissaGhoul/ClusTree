#include "include/graph.hpp"


int main()
{
    Graph g;
    g.addEdge(1, 2);          // Default weight = 1
    g.addEdge(1, 3, 5);       // Custom weight = 5
    g.addNode(4);             // Isolated node

    g.print();                // Display graph
    return 0;
}
