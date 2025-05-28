#pragma once

#include <string>
#include <fstream>
#include "json.hpp"
#include "SimulatedAnnealingClustering.hpp"
#include "hashId.hpp"

using json = nlohmann::json;

/**
 * @brief Load a weighted graph and CLI parameters from a JSON file.
 *
 * @param filename         Path to the JSON file.
 * @param g                The Graph to fill.
 * @param desiredGroupSize (out) The group size read from "CLI"."groupSize".
 */
void jsonToGraph(const std::string &filename, Graph &g, int &desiredGroupSize);




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
    const std::string& outputPath);