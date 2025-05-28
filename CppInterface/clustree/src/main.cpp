#include <iostream>
#include "../include/SimulatedAnnealingClustering.hpp"
#include "../include/jsonToGraph.hpp"


#include <string>
int main(int argc, char* argv[]) {
    if (argc != 3) {
        std::cerr << "Usage: " << argv[0] << " <input_graph.json> <output_result.json>" << std::endl;
        return 1;
    }
    std::string inputPath = argv[1];
    std::string outputPath = argv[2];

    Graph g;
    int desiredGroupSize = 2;

    // Load graph and desiredGroupSize from input JSON
    try {
        jsonToGraph(inputPath, g, desiredGroupSize);
    } catch (const std::exception& e) {
        std::cerr << "Error loading graph: " << e.what() << std::endl;
        return 1;
    }

    // Display edges (optional)
    std::cout << "=== Graph edges ===\n";
    for (auto const& [u, node] : g.getNodes()) {
        for (auto const& [v, ed] : node->otherNodes) {
            if (u < v) std::cout << u << " -- " << v << " (w=" << ed.score->scoreValue << ")\n";
        }
    }

    // Perform clustering
    int N = static_cast<int>(g.getNodes().size());
    int K = (N + desiredGroupSize - 1) / desiredGroupSize;
    SimulatedAnnealingClustering sac(g, K, 200000, 1.0, 1e-4, 0.995);
    auto partition = sac.run();

    // Build groups map
    std::unordered_map<key, std::vector<key>> groups;
    for (auto const& [node, grp] : partition) {
        groups[grp].push_back(node);
    }

    // Print each group's members and score
    std::cout << "\n=== Group assignments and scores ===\n";
    for (const auto& [grp, members] : groups) {
        double groupScore = 0.0;
        // Sum of weights of internal edges
        for (size_t i = 0; i < members.size(); ++i) {
            for (size_t j = i + 1; j < members.size(); ++j) {
                int u = members[i];
                int v = members[j];
                // Check if edge exists
                auto& nodeU = g.getNodes().at(u);
                auto it = nodeU->otherNodes.find(v);
                if (it != nodeU->otherNodes.end()) {
                    groupScore += it->second.score->scoreValue;
                }
            }
        }
        // Print group id, members, and total internal score
        std::cout << "Group " << grp << ": ";
        for (auto id : members) std::cout << id << " ";
        std::cout << "| Score = " << groupScore << std::endl;
    }

    // Export full result to JSON (passing desiredGroupSize)
    try {
        graphToJsonWithGroups(groups, g, desiredGroupSize, outputPath);
        std::cout << "\nResults exported to " << outputPath << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Error exporting results: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}