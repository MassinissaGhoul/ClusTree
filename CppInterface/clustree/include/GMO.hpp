// gmo.hpp
#pragma once
#include "graph.hpp"
#include <unordered_map>


struct Community {
    key id;
    double totalDeg;
    std::unordered_map<key, double> edgeWeight;
    bool active = true;
};

class GreedyModularityOptimization {
public:
    GreedyModularityOptimization(const Graph& g);
    std::unordered_map<key, key> run ();
    double getM() const { return m; }
    const std::unordered_map<key, Community>& getCommus() const { return commus; }

private:
    const Graph& g;                           
    std::unordered_map<key, Community> commus; 
    double m;                                  

    
    void initCommus();   
    void optimize();     
};
