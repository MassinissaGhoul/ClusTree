#include "../include/jsonToGraph.hpp"


void jsonToGraph(
    const std::string &filename,
    Graph &g,
    int &desiredGroupSize,
    std::string &outputFolder)
{
    std::ifstream in(filename);
    if (!in.is_open()) {
        throw std::runtime_error("Cannot open JSON file: " + filename);
    }

    json j;
    in >> j;

    if (j.contains("CLI")) {
        if (j["CLI"].contains("groupSize")) {
            desiredGroupSize = j["CLI"]["groupSize"].get<int>();
        }
        if (j["CLI"].contains("outputFolder")) {
            outputFolder = j["CLI"]["outputFolder"].get<std::string>();
        }
    }

    const auto &graph_j = j.at("Graph");

    // Add nodes (string -> key)
    for (auto it = graph_j.begin(); it != graph_j.end(); ++it) {
        key u = hashString(it.key());
        g.addNode(u);
    }

    // Add edges (without duplicates)
    for (auto it = graph_j.begin(); it != graph_j.end(); ++it) {
        key u = hashString(it.key());
        for (const auto &entry : it.value()) {
            std::string sec = entry.at("secondNode").get<std::string>();
            key v = hashString(sec);
            int w = entry.at("weight").get<int>();
            if (u < v) {
                g.addEdge(u, v, w);
            }
        }
    }
}

void graphToJsonWithGroups(
    const std::unordered_map<key, std::vector<key>>& groups,
    const Graph& g,
    int desiredGroupSize,
    const std::string& outputPath)
{
    json j;
    j["CLI"]["groupSize"] = desiredGroupSize;

    // Serialize graph edges with original string IDs
    for (auto const& [u, node] : g.getNodes()) {
        for (auto const& [v, ed] : node->otherNodes) {
            if (u < v) {
                const std::string& su = keyToString(u);
                const std::string& sv = keyToString(v);
                j["Graph"][su][sv] = ed.score->scoreValue;
            }
        }
    }

    // Serialize groups with original string IDs
    for (const auto& [grp, members] : groups) {
        json arr = json::array();
        for (auto m : members) {
            arr.push_back(keyToString(m));
        }
        j["Groups"][std::to_string(grp)] = arr;
    }

    std::ofstream out(outputPath);
    if (!out.is_open()) {
        throw std::runtime_error("Cannot open output JSON file: " + outputPath);
    }
    out << std::setw(2) << j << std::endl;
}