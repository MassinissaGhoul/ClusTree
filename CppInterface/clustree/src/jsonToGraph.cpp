#include "../include/jsonToGraph.hpp"

void jsonToGraph(const std::string &filename, Graph &g, int &desiredGroupSize)
{
    std::ifstream in(filename);
    if (!in.is_open())
    {
        throw std::runtime_error("Impossible d'ouvrir le fichier JSON : " + filename);
    }

    json j;
    in >> j;

    if (j.contains("CLI") && j["CLI"].contains("groupSize"))
    {
        desiredGroupSize = j["CLI"]["groupSize"].get<int>();
    }

    const auto &graph_j = j.at("Graph");

    for (auto it = graph_j.begin(); it != graph_j.end(); ++it)
    {
        int u = std::stoi(it.key());
        g.addNode(u);
    }

    for (auto it = graph_j.begin(); it != graph_j.end(); ++it)
    {
        int u = std::stoi(it.key());
        for (auto jt = it->begin(); jt != it->end(); ++jt)
        {
            int v = std::stoi(jt.key());
            int w = jt.value().get<int>();
            if (u < v)
            {
                g.addEdge(u, v, w);
            }
        }
    }
}




/**
 * Exports a graph along with its grouping into a JSON file.
 *
 * Generated JSON structure:
 * {
 *   "Groups": {
 *     "0": [1, 5, 9],
 *     "1": [2, 3, 7],
 *     ...
 *   },
 *   "Graph": {
 *     "1": { "5": 8, "9": 2 },
 *     "2": { "3": 7, "7": 4 },
 *     ...
 *   }
 * }
 *
 * @param groups    Mapping from groupId to a vector of node IDs.
 * @param g         The graph containing all nodes and their edges.
 * @param outputPath  Absolute path for the output JSON file.
 */
void graphToJsonWithGroups(
    const std::unordered_map<key, std::vector<key>>& groups,
    const Graph& g,
    int desiredGroupSize,
    const std::string& outputPath)
{
    json j;
    // CLI section: echo group size
    j["CLI"]["groupSize"] = desiredGroupSize;
    // Graph section: serialize edges without duplicates (u < v)
    for (auto const& [u, node] : g.getNodes()) {
        for (auto const& [v, ed] : node->otherNodes) {
            if (u < v) {
                j["Graph"][std::to_string(u)][std::to_string(v)] = ed.score->scoreValue;
            }
        }
    }
    // Groups section: serialize clustering result
    for (const auto& [grp, members] : groups) {
        j["Groups"][std::to_string(grp)] = members;
    }
    // Write JSON to file with indentation
    std::ofstream out(outputPath);
    if (!out.is_open()) {
        throw std::runtime_error("Unable to open output JSON file: " + outputPath);
    }
    out << std::setw(2) << j << std::endl;
}