// test/graphTest.cpp

#include <gtest/gtest.h>
#include "../include/graph.hpp"
#include <sstream>

class GraphTest : public ::testing::Test {
protected:
    Graph g;

    // to get print
    std::string capturePrint() {
        std::ostringstream oss;
        std::streambuf* oldCout = std::cout.rdbuf(oss.rdbuf());
        g.print();
        std::cout.rdbuf(oldCout);
        return oss.str();
    }
};

TEST_F(GraphTest, AddNodeCreatesNode) {
    EXPECT_TRUE(g.getNodes().empty());

    Node* n1 = g.addNode(42);
    ASSERT_NE(n1, nullptr);
    EXPECT_EQ(n1->id, 42);
    EXPECT_EQ(n1->nbNeighbor, 0);
    EXPECT_EQ(n1->otherNodes.size(), 0u);
    EXPECT_EQ(g.getNodes().size(), 1u);

    Node* n1b = g.addNode(42);
    EXPECT_EQ(n1, n1b);
    EXPECT_EQ(g.getNodes().size(), 1u);
}

TEST_F(GraphTest, AddEdgeUnidirectional) {
    g.addEdge(1, 2, 5, /*bidirectional=*/false);

    ASSERT_EQ(g.getNodes().size(), 2u);

    Node* n1 = g.getNodes().at(1);
    Node* n2 = g.getNodes().at(2);

    EXPECT_EQ(n1->nbNeighbor, 1);
    EXPECT_EQ(n1->otherNodes.size(), 1u);
    EXPECT_EQ(n2->nbNeighbor, 0);
    EXPECT_EQ(n2->otherNodes.size(), 0u);

    const edge& e12 = n1->otherNodes.at(2);
    EXPECT_EQ(e12.otherNode, n2);
    EXPECT_FALSE(e12.duplicated);
    ASSERT_NE(e12.score, nullptr);
    EXPECT_EQ(e12.score->scoreValue, 5);
}

TEST_F(GraphTest, AddEdgeBidirectionalSharesScore) {
    g.addEdge(10, 20, 7, /*bidirectional=*/true);

    ASSERT_EQ(g.getNodes().size(), 2u);
    Node* n10 = g.getNodes().at(10);
    Node* n20 = g.getNodes().at(20);

    EXPECT_EQ(n10->nbNeighbor, 1);
    EXPECT_EQ(n10->otherNodes.size(), 1u);
    EXPECT_EQ(n20->nbNeighbor, 1);
    EXPECT_EQ(n20->otherNodes.size(), 1u);

    const edge& e10_20 = n10->otherNodes.at(20);
    const edge& e20_10 = n20->otherNodes.at(10);

    EXPECT_EQ(e10_20.otherNode, n20);
    EXPECT_EQ(e20_10.otherNode, n10);

    EXPECT_FALSE(e10_20.duplicated);
    EXPECT_TRUE(e20_10.duplicated);

    ASSERT_NE(e10_20.score, nullptr);
    EXPECT_EQ(e10_20.score, e20_10.score);
    EXPECT_EQ(e10_20.score->scoreValue, 7);
}

TEST_F(GraphTest, PrintOutputsCorrectly) {
    g.addEdge(3, 4, 2, true);
    std::string out = capturePrint();

    EXPECT_NE(out.find("Node 3 neighbors: 4(w=2)"), std::string::npos);
    EXPECT_NE(out.find("Node 4 neighbors: 3(w=2)"), std::string::npos);
}

int main(int argc, char** argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
