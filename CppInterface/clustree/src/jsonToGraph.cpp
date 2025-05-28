#include "../include/jsonToGraph.hpp"

void jsonToGraph(const std::string &filename, Graph &g, int &desiredGroupSize)
{
    std::ifstream in(filename);
    if (!in.is_open())
    {
        throw std::runtime_error("Impossible d'ouvrir le fichier JSON : " + filename);
    }

    json j;
    in >> j;

    if (j.contains("CLI") && j["CLI"].contains("groupSize"))
    {
        desiredGroupSize = j["CLI"]["groupSize"].get<int>();
    }

    const auto &graph_j = j.at("Graph");

    for (auto it = graph_j.begin(); it != graph_j.end(); ++it)
    {
        int u = std::stoi(it.key());
        g.addNode(u);
    }

    for (auto it = graph_j.begin(); it != graph_j.end(); ++it)
    {
        int u = std::stoi(it.key());
        for (auto jt = it->begin(); jt != it->end(); ++jt)
        {
            int v = std::stoi(jt.key());
            int w = jt.value().get<int>();
            if (u < v)
            {
                g.addEdge(u, v, w);
            }
        }
    }
}
