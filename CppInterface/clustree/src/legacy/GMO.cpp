#include "../include/GMO.hpp"

GreedyModularityOptimization::GreedyModularityOptimization(const Graph &g, int K)
    : g(g) 
      ,
      commus() 
      ,
      m(0.0) 
      ,
      targetK(K) 
      ,
      activeCount(0) 
{
}
std::unordered_map<key, key> GreedyModularityOptimization::run()
{
    initCommus();
    initMergeQueue();
    optimize();
    return this->result;
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
    activeCount = static_cast<int>(commus.size());

    m *= 0.5;
}

void GreedyModularityOptimization::initMergeQueue()
{
    mergeQueue = std::priority_queue<MergeEntry>();

    // for every commu  A,B neigbor (B.id > A.id)
    for (auto const &[aid, A] : commus)
    {
        for (auto const &[bid, eAB] : A.edgeWeight)
        {
            if (bid <= aid)
                continue; // no duplicate A↔B  B↔A

            double aA = A.totalDeg;
            double aB = commus[bid].totalDeg;
            // ΔQ = e_{A,B}/m - (aA * aB)/(2*m*m)
            double delta = eAB / m - (aA * aB) / (2.0 * m * m);

            mergeQueue.push({delta, aid, bid});
        }
    }
}

key GreedyModularityOptimization::mergeCommunities(key aid, key bid)
{
    Community &A = commus[aid];
    Community &B = commus[bid];

    A.totalDeg += B.totalDeg;

    for (auto const &[did, w] : B.edgeWeight)
    {
        if (did == aid)
            continue;
        A.edgeWeight[did] += w;
        commus[did].edgeWeight[aid] += w;
        commus[did].edgeWeight.erase(bid);
    }

    B.active = false;
    --activeCount;

    return aid;
}

void GreedyModularityOptimization::optimize()
{
    double Q_current = 0.0;
    double Q_best = 0.0;

    std::unordered_map<key, key> currentPartition;
    for (auto const &[nid, comm] : commus)
    {
        currentPartition[nid] = comm.id;
    }
    this->result = currentPartition;

    while (!mergeQueue.empty() && mergeQueue.top().deltaQ > 0 && activeCount > targetK)
    {
        MergeEntry best = mergeQueue.top();
        if (best.deltaQ <= 0)
            break; 
        mergeQueue.pop();

        if (!commus[best.commA].active || !commus[best.commB].active)
            continue;

        key C = mergeCommunities(best.commA, best.commB);

        Q_current += best.deltaQ;

        for (auto &[nid, cid] : currentPartition)
        {
            if (cid == best.commB)
                cid = C;
        }

        if (Q_current > Q_best)
        {
            Q_best = Q_current;
            this->result = currentPartition;
        }

        for (auto const &[did, w] : commus[C].edgeWeight)
        {
            if (!commus[did].active)
                continue;
            double aC = commus[C].totalDeg;
            double aD = commus[did].totalDeg;
            double delta = w / m - (aC * aD) / (2.0 * m * m);
            mergeQueue.push({delta, C, did});
        }
    }
}
