
#include <gtest/gtest.h>

#include "../include/SimulatedAnnealingClustering.hpp"
#include <map>
/**
 * @file testSimulatedAnnealingClustering.cpp
 * @brief Unit tests for SimulatedAnnealingClustering, exposing private helpers via a test subclass.
 *
 * We verify:
 *  - initPartition() + computeScore() on an empty graph returns 0.0.
 *  - computeScore() on a two-node graph with K=1 returns the correct edge weight.
 *  - run() produces balanced clusters (one node per cluster) for K=2 on a two-node graph.
 */

// -----------------------------------------------------------------------------
// Expose private methods via a small subclass
// -----------------------------------------------------------------------------


class TestableSAC : public SimulatedAnnealingClustering {
public:
    TestableSAC(const Graph &g, int K, int maxIter, double T0, double Tmin, double alpha)
      : SimulatedAnnealingClustering(g, K, maxIter, T0, Tmin, alpha) {}

    using SimulatedAnnealingClustering::initPartition;
    using SimulatedAnnealingClustering::computeScore;
};

// computeScore() == 0 on empty graph
TEST(SimulatedAnnealingClusteringTest, ComputeScoreEmptyGraph) {
    Graph g;
    TestableSAC sac(g, 3, 10, 1.0, 1e-3, 0.99);
    sac.initPartition();
    EXPECT_DOUBLE_EQ(sac.computeScore(), 0.0);
}

// computeScore() returns the edge’s weight when K=1
TEST(SimulatedAnnealingClusteringTest, ComputeScoreSingleEdgeSameCluster) {
    Graph g;
    g.addEdge(1, 2, 8);  // bidirectional=true by default

    TestableSAC sac(g, 1, 10, 1.0, 1e-3, 0.99);
    sac.initPartition();
    EXPECT_DOUBLE_EQ(sac.computeScore(), 8.0);
}

// run() yields 1 node per cluster when K=2
TEST(SimulatedAnnealingClusteringTest, RunCreatesCorrectPartitionSizes) {
    Graph g;
    g.addEdge(1, 2, 5, false);
    SimulatedAnnealingClustering sac(g, 2, 1, 1.0, 1e-3, 0.99);
    auto result = sac.run();

    ASSERT_EQ(result.size(), 2u);
    std::map<key,int> counts;
    for (auto const& [node, cluster] : result) {
        EXPECT_TRUE(cluster == 0 || cluster == 1);
        counts[cluster]++;
    }
    EXPECT_EQ(counts[0], 1);
    EXPECT_EQ(counts[1], 1);
}

// main() entry-point for tests
int main(int argc, char** argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}