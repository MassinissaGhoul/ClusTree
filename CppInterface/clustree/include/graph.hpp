#include <iostream>
#include <vector>
#include <unordered_map>

typedef long key;

struct Node;
struct score;
struct edge;

struct Node
{
    key id;                                   // Node id (uuid hash)
    std::unordered_map<key, edge> otherNodes; // map of all other node
    int nbNeighbor;                           // number of neighbor
    int currentColor;                         // legacy code
};

struct edge
{
    Node *otherNode; // neighbor
    bool duplicated; // know if we need it in save file
    score *score;    // weight of the edge
};

struct score
{
    int score = 1; // weight
};



class Graph
{
private:
    std::unordered_map<key, Node *> nodes;
    // std::unordered_map<key, Community> commus;
    // double m = 0.0;

public:
    Graph() {}
    ~Graph()
    {
        // Cleanup nodes; delete each shared score only once
        for (auto &p : nodes)
        {
            Node *n = p.second;
            delete n;
        }
    }

    const std::unordered_map<key, Node *>& getNodes() const { return this->nodes; }

    // Creates a node if it doesn't exist
    Node *addNode(key id)
    {
        auto it = nodes.find(id);
        if (it == nodes.end())
        {
            Node *n = new Node();
            n->id = id;
            n->otherNodes.clear();
            n->nbNeighbor = 0;
            n->currentColor = 0;
            nodes[id] = n;
            return n;
        }
        return it->second;
    }

    // Add edge between two nodes, sharing one score instance
    void addEdge(key from, key to, int w = 1, bool bidirectional = true)
    {
        Node *n1 = addNode(from);
        Node *n2 = addNode(to);

        // Allocate a single score
        score *s = new score();
        s->score = w;

        // Edge from -> to
        edge e1 = {n2, false, s};
        n1->otherNodes[to] = e1;
        n1->nbNeighbor = n1->otherNodes.size();

        if (bidirectional)
        {
            edge e2 = {n1, true, s};
            n2->otherNodes[from] = e2;
            n2->nbNeighbor = n2->otherNodes.size();
        }
    }

    // Print all nodes and their neighbors
    void print() const
    {
        for (const auto &p : nodes)
        {
            const Node *n = p.second;
            std::cout << "Node " << n->id << " neighbors:";
            for (const auto &kv : n->otherNodes)
            {
                std::cout << " " << kv.first
                          << "(w=" << kv.second.score->score << ")";
            }
            std::cout << std::endl;
        }
    }
};
