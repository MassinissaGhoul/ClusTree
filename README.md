# ClusTree Multi-Component Project

This repository encompasses three main components, each with its own dedicated README:

1. **CppInterface**
   A C++ command-line application for graph clustering using simulated annealing.
   See `CppInterface/README.md` for build instructions, JSON format details, and usage.

2. **WebBack**
   A backend service responsible for file handling, uploading, and serving clustering results to clients.
   See `WebBack/README.md` for setup, API endpoints, and configuration.

3. **WebInterface**
   A frontend application providing a user-friendly interface to upload graphs, configure clustering parameters, and view results.
   See `WebInterface/README.md` for installation, development, and deployment instructions.

---

## Shared Graph Construction

All components rely on the same graph data model and JSON conventions:

* **Node identifiers:** Arbitrary strings (e.g., email addresses) in the input JSON. Internally, these are hashed to numeric keys for algorithmic processing. Output JSON always restores the original string identifiers.

* **Input JSON format:**

  ```json
  {
    "CLI": {
      "groupSize": <integer>,
      "outputFolder": "<path/to/output>"
    },
    "Graph": {
      "<nodeName>": [
        { "secondNode": "<otherNodeName>", "weight": <integer> },
        ...
      ],
      ...
    }
  }
  ```

  * `groupSize`: Maximum desired number of nodes per cluster.
  * `outputFolder`: (CppInterface only) where the result JSON will be written.
  * `Graph`: A map from each node to a list of edges.  Each edge has:

    * `secondNode`: the target node name.
    * `weight`: integer weight of the edge.

* **Output JSON format (CppInterface):**

  ```json
  {
    "CLI": { "groupSize": <integer> },
    "Graph": { ...same edges as input... },
    "Groups": {
      "0": ["nodeA","nodeB",...],
      "1": ["nodeC","nodeD",...],
      ...
    }
  }
  ```

  * The `Groups` section maps cluster indices to arrays of original node names.

---

For detailed instructions, navigate to the component of interest and consult its README.
