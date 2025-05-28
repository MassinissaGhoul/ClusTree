#define CATCH_CONFIG_MAIN

#include "../include/catch_amalgamated.hpp"

#include "../include/graph.hpp"


#include <sstream>
#include <iostream>

TEST_CASE("addNode creates a new node and does not duplicate it", "[addNode]") {
    Graph g;
    REQUIRE(g.getNodes().empty());

    Node* n1 = g.addNode(42);
    REQUIRE(n1 != nullptr);
    REQUIRE(n1->id == 42);
    REQUIRE(n1->nbNeighbor == 0);
    REQUIRE(g.getNodes().size() == 1);

    // Calling again with the same ID should not create a second node
    Node* n1b = g.addNode(42);
    REQUIRE(n1b == n1);
    REQUIRE(g.getNodes().size() == 1);
}

TEST_CASE("addEdge adds a bidirectional edge by default", "[addEdge]") {
    Graph g;
    g.addEdge(1, 2, 10);

    // Both nodes must exist
    REQUIRE(g.getNodes().count(1) == 1);
    REQUIRE(g.getNodes().count(2) == 1);

    Node* n1 = g.getNodes().at(1);
    Node* n2 = g.getNodes().at(2);

    // Each node has exactly one neighbor
    REQUIRE(n1->nbNeighbor == 1);
    REQUIRE(n2->nbNeighbor == 1);

    // Verify the weight
    auto& e12 = n1->otherNodes.at(2);
    auto& e21 = n2->otherNodes.at(1);
    REQUIRE(e12.score->scoreValue == 10);
    REQUIRE(e21.score->scoreValue == 10);

    // Both pointers to score should be the same instance (shared)
    REQUIRE(e12.score == e21.score);
}

TEST_CASE("addEdge is unidirectional when bidirectional=false", "[addEdge]") {
    Graph g;
    g.addEdge(3, 4, 5, /*bidirectional=*/false);

    REQUIRE(g.getNodes().count(3) == 1);
    REQUIRE(g.getNodes().count(4) == 1);

    Node* n3 = g.getNodes().at(3);
    Node* n4 = g.getNodes().at(4);

    REQUIRE(n3->nbNeighbor == 1);
    REQUIRE(n4->nbNeighbor == 0);

    REQUIRE(n3->otherNodes.count(4) == 1);
    REQUIRE(n4->otherNodes.count(3) == 0);
}

TEST_CASE("print outputs the correct graph structure", "[print]") {
    Graph g;
    g.addEdge(5, 6, 7);
    g.addEdge(5, 7, 3);

    // Capture std::cout output
    std::ostringstream oss;
    auto old_buf = std::cout.rdbuf(oss.rdbuf());

    g.print();

    // Restore original buffer
    std::cout.rdbuf(old_buf);

    std::string output = oss.str();
    // Check that each line lists the expected neighbors and weights
    REQUIRE(output.find("Node 5 neighbors: 6(w=7) 7(w=3)") != std::string::npos);
    REQUIRE(output.find("Node 6 neighbors: 5(w=7)")    != std::string::npos);
    REQUIRE(output.find("Node 7 neighbors: 5(w=3)")    != std::string::npos);
}
