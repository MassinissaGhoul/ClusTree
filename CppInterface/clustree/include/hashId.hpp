#include <string>
#include <unordered_map>
#include <functional>
#include <stdexcept>

typedef long key;

static std::unordered_map<std::string, key> name2id;
static std::unordered_map<key, std::string> id2name;

/**
 * Convert a string to a unique numeric key.
 * Uses std::hash<std::string> and resolves collisions by incrementing.
 * Stores mappings for reverse lookup.
 *
 * @param s Input string identifier
 * @return Unique numeric key
 */
inline key hashString(const std::string& s) {
    auto it = name2id.find(s);
    if (it != name2id.end()) {
        return it->second;
    }

    // Generate initial hash
    key h = static_cast<key>(std::hash<std::string>{}(s));
    // Resolve collisions by incrementing until an unused key is found
    while (id2name.count(h) && id2name[h] != s) {
        ++h;
    }

    // Store bidirectional mappings
    name2id[s] = h;
    id2name[h] = s;
    return h;
}

/**
 * Convert a numeric key back to its original string.
 *
 * @param k Numeric key
 * @return Original string identifier
 * @throws std::out_of_range if the key is unknown
 */
inline const std::string& keyToString(key k) {
    auto it = id2name.find(k);
    if (it == id2name.end()) {
        throw std::out_of_range("keyToString: unknown key");
    }
    return it->second;
}
