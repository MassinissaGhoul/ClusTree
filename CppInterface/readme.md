# ClusTree C++ Interface

This project provides a C++ command‑line application that performs graph clustering using simulated annealing. The application reads a JSON‑formatted graph with email‑based node identifiers, partitions the nodes into groups of a specified size, and writes the resulting clusters (with original node names) back to JSON.

## Prerequisites

* **C++17 (or newer)** compiler
* **xmake** build system installed
* **nlohmann/json** library (included as a dependency in the project)
* **std::filesystem** support

## Building with xmake

From the project root:

```bash
# Generate project files and build
xmake
```

This will compile the application and any test targets.

## Available Targets and Run Commands

* **app**: The main clustering application.
* **testGraph**: Unit tests for JSON↔Graph conversion.
* **testSAC**: Unit tests for the Simulated Annealing Clustering logic.

### Run the main application

```bash
xmake run app test.json
```

* `test.json` is your input graph file (see format below).

### Run the graph conversion tests

```bash
xmake run testGraph
```

### Run the clustering tests

```bash
xmake run testSAC
```

## Input JSON Format

The application expects a single JSON file with the following structure:

```json
{
  "CLI": {
    "groupSize": <integer>,
    "outputFolder": "<path/to/output/folder>"
  },
  "Graph": {
    "<nodeName>": [
      {
        "secondNode": "<otherNodeName>",
        "weight": <integer>
      },
      ...
    ],
    ...
  }
}
```

* **CLI.groupSize**: Desired maximum number of nodes per group.
* **CLI.outputFolder**: Relative or absolute path where `result.json` will be written. If the folder does not exist, it will be created automatically.
* **Graph**: A mapping from each node name (string) to an *array* of edge objects. Each edge object contains:

  * **secondNode**: The target node name (string).
  * **weight**: Edge weight (integer).

All node names (e.g. email addresses) are automatically hashed internally to a numeric key, but the output JSON will preserve the original string names.

## Sample Input `test.json`

```json
{
  "CLI": {
    "groupSize": 1,
    "outputFolder": "../../WebBack/uploads/teacher1@mail.com/test"
  },
  "Graph": {
    "student0@mail.com": [
      { "secondNode": "student1@mail.com", "weight": 1 },
      { "secondNode": "student2@mail.com", "weight": 1 }
    ],
    "student1@mail.com": [
      { "secondNode": "student0@mail.com", "weight": 1 },
      { "secondNode": "student2@mail.com", "weight": 1 }
    ]
  }
}
```

## Output

After running:

```bash
xmake run app test.json
```
