#include "../include/SimulatedAnnealingClustering.hpp"
#include <algorithm>
#include <cmath>
#include <numeric>

SimulatedAnnealingClustering::SimulatedAnnealingClustering(
    const Graph &g_,
    int K_,
    int maxIter_,
    double T0_,
    double Tmin_,
    double alpha_)
    : g(g_),
      K(K_),
      rng(std::random_device{}()),
      maxIter(maxIter_),
      T0(T0_),
      Tmin(Tmin_),
      alpha(alpha_)
{
    // Extract the list of nodes and determine N
    for (auto const &[id, ptr] : g.getNodes())
        nodes.push_back(id);
    N = nodes.size();
}

void SimulatedAnnealingClustering::initPartition()
{
    // Shuffle nodes randomly
    std::shuffle(nodes.begin(), nodes.end(), rng);

    int s = N / K;
    int r = N % K;

    assign.clear();
    int idx = 0;

    // r groups of size s+1
    for (int c = 0; c < r; ++c)
    {
        for (int i = 0; i < s + 1; ++i)
        {
            assign[nodes[idx++]] = c;
        }
    }
    // K-r groups of size s
    for (int c = r; c < K; ++c)
    {
        for (int i = 0; i < s; ++i)
        {
            assign[nodes[idx++]] = c;
        }
    }
}

double SimulatedAnnealingClustering::computeScore()
{
    double total = 0.0;
    for (auto const &[i, ptr] : g.getNodes())
    {
        int ci = assign.at(i);
        for (auto const &[j, ed] : ptr->otherNodes)
        {
            if (assign.at(j) == ci)
            {
                total += ed.score->score;
            }
        }
    }
    return total * 0.5;
}

std::unordered_map<key, key> SimulatedAnnealingClustering::run()
{
    initPartition();
    double currScore = computeScore();
    auto bestAssign = assign;
    double bestScore = currScore;

    // 2) Annealing parameters
    double T = T0;
    std::uniform_real_distribution<double> uni(0.0, 1.0);

    // 3) Main loop
    for (int iter = 0; iter < maxIter && T > Tmin; ++iter)
    {
        // Choose two different groups g1, g2
        std::uniform_int_distribution<int> distG(0, K - 1);
        int g1 = distG(rng), g2 = distG(rng);
        while (g2 == g1)
            g2 = distG(rng);

        // Get members of these groups
        std::vector<key> memb1, memb2;
        for (auto u : nodes)
        {
            if (assign[u] == g1)
                memb1.push_back(u);
            else if (assign[u] == g2)
                memb2.push_back(u);
        }
        if (memb1.empty() || memb2.empty())
            continue;

        // Randomly select i memb1, j memb2
        std::uniform_int_distribution<int> d1(0, memb1.size() - 1);
        std::uniform_int_distribution<int> d2(0, memb2.size() - 1);
        key i = memb1[d1(rng)], j = memb2[d2(rng)];

        // Propose swap i j and compute new score
        std::swap(assign[i], assign[j]);
        double newScore = computeScore();
        double delta = newScore - currScore;

        // Acceptance criterion
        if (delta >= 0 || uni(rng) < std::exp(delta / T))
        {
            currScore = newScore;
            if (currScore > bestScore)
            {
                bestScore = currScore;
                bestAssign = assign;
            }
        }
        else
        {
            std::swap(assign[i], assign[j]);
        }
        T *= alpha; 
    }

    return bestAssign;
}
 