#pragma once

#include <string>
#include <fstream>
#include "json.hpp"
#include "SimulatedAnnealingClustering.hpp"

using json = nlohmann::json;

/**
 * @brief Load a weighted graph and CLI parameters from a JSON file.
 *
 * @param filename         Path to the JSON file.
 * @param g                The Graph to fill.
 * @param desiredGroupSize (out) The group size read from "CLI"."groupSize".
 */
void jsonToGraph(const std::string &filename, Graph &g, int &desiredGroupSize);

void graphToJsonWithGroups(
    const std::unordered_map<key, std::vector<key>>& groups,
    const Graph& g,
    int desiredGroupSize,
    const std::string& outputPath);