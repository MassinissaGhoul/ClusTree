#pragma once
#include "graph.hpp"
#include <unordered_map>
#include <vector>
#include <random>

/**
 * Simulated annealing for partitioning a graph into K blocks of size ~N/K,
 * maximizing the sum of edge weights within the blocks.
 */
class SimulatedAnnealingClustering
{
public:
    /**
     * @param g       Reference to the affinity graph
     * @param K       Desired number of groups
     * @param maxIter Maximum number of iterations
     * @param T0      Initial temperature
     * @param Tmin    Minimum temperature to stop
     * @param alpha   Cooling factor (0 < alpha < 1)
     */
    SimulatedAnnealingClustering(const Graph &g,
                                 int K,
                                 int maxIter = 100000,
                                 double T0 = 1.0,
                                 double Tmin = 1e-3,
                                 double alpha = 0.99);

    /**
     * Runs simulated annealing and returns the best partition found
     * as a map nodeId -> groupId.
     */
    std::unordered_map<key, key> run();

private:
    const Graph &g;
    int K;                               // number of groups
    int N;                               // total number of nodes
    std::vector<key> nodes;              // list of nodes
    std::unordered_map<key, key> assign; // nodeId -> groupId
    std::mt19937_64 rng;

    int maxIter;
    double T0, Tmin, alpha;

protected:
    // Build an initial balanced partition (K blocks of size ~N/K)
    void initPartition();

    // Compute the current score (sum of intra-group weights)
    double computeScore();
};
