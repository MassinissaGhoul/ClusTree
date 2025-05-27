// main.cpp
#include "../include/GMO.hpp"
#include <iostream>

int main() {
    Graph g;
    g.addEdge(1, 2);    
    g.addEdge(1, 3, 5); 
    g.addNode(4);       

    std::cout << "=== Graphe ===\n";
    g.print();          


    GreedyModularityOptimization gmo(g);
    auto communities = gmo.run();

    std::cout << "\n=== Communautés ===\n";
    std::cout << "m = " << gmo.getM() << "\n"; 
    
    for (auto const& [nodeId, com] : gmo.getCommus()) {
        std::cout << "Comm " << com.id
                  << "  | totalDeg = " << com.totalDeg
                  << "  | voisins = " << com.edgeWeight.size()
                  << "\n";
    }

    std::cout << "\n=== Assignment final (node -> community) ===\n";
    for (auto const& [node, cid] : communities) {
        std::cout << "Node " << node
                  << " -> Community " << cid << "\n";
    }

    return 0;
}
