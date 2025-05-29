#include <iostream>
#include "../include/SimulatedAnnealingClustering.hpp"
#include "../include/jsonToGraph.hpp"
#include <filesystem>


#include <string>
int main(int argc, char* argv[]) {
    if (argc != 2) {
        std::cerr << "Usage: " << argv[0] << " <input_graph.json>" << std::endl;
        return 1;
    }

    std::string inputPath = argv[1];
    Graph g;
    int desiredGroupSize = 0;
    std::string outputFolder;

    // Load graph, groupSize, and outputFolder from input JSON
    try {
        jsonToGraph(inputPath, g, desiredGroupSize, outputFolder);
    } catch (const std::exception& e) {
        std::cerr << "Error loading graph: " << e.what() << std::endl;
        return 1;
    }

    // Display basic info
    std::cout << "Input JSON: " << inputPath << "\n";
    std::cout << "Group size: " << desiredGroupSize << "\n";
    std::cout << "Output folder: " << outputFolder << "\n";
    std::cout << "Number of nodes: " << g.getNodes().size() << "\n";

    // Determine number of clusters
    int N = static_cast<int>(g.getNodes().size());
    int K = (N + desiredGroupSize - 1) / desiredGroupSize;

    // Perform clustering
    SimulatedAnnealingClustering sac(g, K, 200000, 1.0, 1e-4, 0.995);
    auto partition = sac.run();

    // Build groups map
    std::unordered_map<key, std::vector<key>> groups;
    for (auto const& [node, grp] : partition) {
        groups[grp].push_back(node);
    }

    // Print group assignments and internal scores
    std::cout << "\n=== Group assignments and scores ===\n";
    for (const auto& [grp, members] : groups) {
        double groupScore = 0.0;
        for (size_t i = 0; i < members.size(); ++i) {
            for (size_t j = i + 1; j < members.size(); ++j) {
                key u = members[i];
                key v = members[j];
                auto& nodeU = g.getNodes().at(u);
                auto it = nodeU->otherNodes.find(v);
                if (it != nodeU->otherNodes.end()) {
                    groupScore += it->second.score->scoreValue;
                }
            }
        }
        std::cout << "Group " << grp << ": ";
        for (auto id : members) std::cout << keyToString(id) << " ";
        std::cout << "| Score = " << groupScore << std::endl;
    }

    // Construct output path
    std::string outputPath = outputFolder;
    if (outputFolder.back() != '/' && outputFolder.back() != '\\') {
        outputPath += "/";
    }
    outputPath += "result.json";

    // Ensure output directory exists
    try {
        std::filesystem::path dir = std::filesystem::path(outputPath).parent_path();
        if (!dir.empty() && !std::filesystem::exists(dir)) {
            std::filesystem::create_directories(dir);
        }
    } catch (const std::exception& e) {
        std::cerr << "Error creating output directory: " << e.what() << std::endl;
        return 1;
    }

    // Export to JSON
    try {
        graphToJsonWithGroups(groups, g, desiredGroupSize, outputPath);
        std::cout << "\nResults exported to " << outputPath << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Error exporting results: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}