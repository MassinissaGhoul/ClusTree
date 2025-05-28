#include <iostream>
#include "../include/SimulatedAnnealingClustering.hpp"
#include "../include/json.hpp"




int main() {
    Graph g;
    int N = 100; //num node 
    std::mt19937_64 rng(std::random_device{}());
    std::uniform_real_distribution<double> prob(0.0, 1.0);
    std::uniform_int_distribution<int> weight(1, 10);
    double p = 0.05;

    // build random sparse weighted graph
    for (int i = 1; i <= N; ++i) {
        g.addNode(i);
    }
    for (int i = 1; i <= N; ++i) {
        for (int j = i + 1; j <= N; ++j) {
            if (prob(rng) < p) {
                int w = weight(rng);
                g.addEdge(i, j, w);
            }
        }
    }

    // print all edges
    std::cout << "=== Graph edges ===\n";
    for (auto const& [u, node] : g.getNodes()) {
        for (auto const& [v, ed] : node->otherNodes) {
            if (u < v)  // avoid double-printing
                std::cout << u << " -- " << v << " (w=" << ed.score->scoreValue << ")\n";
        }
    }

    // clustering parameters
    int desiredGroupSize = 2;
    int K = N / desiredGroupSize + (N % desiredGroupSize ? 1 : 0);

    SimulatedAnnealingClustering sac(
        g,
        K,
        200000,
        1.0,
        1e-4,
        0.995
    );

    // run clustering
    auto partition = sac.run();  // nodeId -> groupId

    // invert to groups
    std::unordered_map<key, std::vector<key>> groups;
    for (auto const& [node, grp] : partition)
        groups[grp].push_back(node);

    // compute and print group scores
    std::cout << "\n=== Resulting groups and intra-group scores ===\n";
    for (auto const& [grp, members] : groups) {
        double scoreSum = 0;
        // sum weights for each unordered pair in this group
        for (size_t i = 0; i < members.size(); ++i) {
            auto u = members[i];
            for (size_t j = i + 1; j < members.size(); ++j) {
                auto v = members[j];
                // lookup edge weight if exists
                auto& nbrs = g.getNodes().at(u)->otherNodes;
                auto it = nbrs.find(v);
                if (it != nbrs.end())
                    scoreSum += it->second.score->scoreValue;
            }
        }
        std::cout << "Group " << grp << " (size=" << members.size()
                  << ", score=" << scoreSum << "):";
        for (auto u : members)
            std::cout << " " << u;
        std::cout << "\n";
    }

    return 0;
}