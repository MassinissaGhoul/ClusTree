#include "../include/GMO.hpp"

GreedyModularityOptimization::GreedyModularityOptimization(const Graph &g)
    : g(g), m(0.0)
{
}
std::unordered_map<key, key> GreedyModularityOptimization::run() {
    initCommus();
    std::unordered_map<key, key> result;
    return result;
}

void GreedyModularityOptimization::initCommus()
{
    commus.clear();
    m = 0.0;

    for (auto const &[id, nodePtr] : g.getNodes())
    {
        Community c;
        c.id = id;
        c.totalDeg = 0.0;

        for (auto const &[toId, ed] : nodePtr->otherNodes)
        {
            double w = ed.score->score;
            c.totalDeg += w;
            c.edgeWeight[toId] = w;
        }

        commus[id] = std::move(c);
        m += commus[id].totalDeg;
    }
    m *= 0.5;
}