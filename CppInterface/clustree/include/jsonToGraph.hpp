#pragma once

#include <string>
#include <fstream>
#include "json.hpp"
#include "SimulatedAnnealingClustering.hpp"
#include "hashId.hpp"

using json = nlohmann::json;


/**
 * Load a graph from a JSON file, mapping string IDs to numeric keys.
 * Reads CLI.groupSize into desiredGroupSize and CLI.outputFolder into outputFolder.
 *
 * JSON format:
 * {
 *   "CLI": { "groupSize": int, "outputFolder": string },
 *   "Graph": {
 *     "<nodeName>": [
 *       { "secondNode": "<otherNodeName>", "weight": int },
 *       ...
 *     ],
 *     ...
 *   }
 * }
 */
void jsonToGraph(
    const std::string &filename,
    Graph &g,
    int &desiredGroupSize,
    std::string &outputFolder);



/**
 * Export graph and groups back to JSON, using original string IDs.
 * Writes CLI.groupSize, Graph edges, and Groups mapping.
 */
void graphToJsonWithGroups(
    const std::unordered_map<key, std::vector<key>>& groups,
    const Graph& g,
    int desiredGroupSize,
    const std::string& outputPath);
