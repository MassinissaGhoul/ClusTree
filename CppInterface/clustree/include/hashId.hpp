#pragma once

#include <string>
#include <unordered_map>
#include <algorithm>  

typedef long key;

inline key hashStringToKey(const std::string& s) {
    static std::unordered_map<std::string, key>  name2id;
    static std::unordered_map<key, std::string>  id2name;

    auto it = name2id.find(s);
    if (it != name2id.end())
        return it->second;

    key h = static_cast<key>(std::hash<std::string>{}(s));

    while (id2name.count(h) && id2name[h] != s) {
        ++h;
    }

    name2id[s] = h;
    id2name[h] = s;
    return h;
}
