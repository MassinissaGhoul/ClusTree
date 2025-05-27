// gmo.hpp
#pragma once
#include "graph.hpp"
#include <unordered_map>
#include <queue>

struct Community
{
    key id;
    double totalDeg;
    std::unordered_map<key, double> edgeWeight;
    bool active = true;
};

/**/
struct MergeEntry
{
    double deltaQ;
    key commA;
    key commB;
    bool operator<(MergeEntry const &o) const
    {
        return deltaQ < o.deltaQ;
    }

};

class GreedyModularityOptimization
{
public:
    GreedyModularityOptimization(const Graph &g);
    std::unordered_map<key, key> run();
    double getM() const { return m; }
    const std::unordered_map<key, Community> &getCommus() const { return commus; }
    std::priority_queue<MergeEntry> mergeQueue;

private:
    const Graph &g;
    std::unordered_map<key, Community> commus;
    double m;

    void initCommus();
    void optimize();
    void initMergeQueue();
    key GreedyModularityOptimization::mergeCommunities(key aid, key bid);
};
