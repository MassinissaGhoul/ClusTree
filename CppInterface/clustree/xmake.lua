-- xmake.lua

add_requires("gtest", { system = false, debug = false })

-- 2. cible principale
target("app")
    set_kind("binary")
    set_languages("cxx17")
    add_includedirs("include")
    add_files("src/*.cpp")

-- 3. cible de test qui génère graph_test
target("testGraph")
    set_kind("binary")
    set_languages("cxx17")
    add_includedirs("include")
    add_files("test/testGraph.cpp")
    add_packages("gtest")

target("testSAC")
    set_kind("binary")
    set_languages("cxx17")
    add_includedirs("include")
    add_files("test/testSimulatedAnnealingClustering.cpp", "src/SimulatedAnnealingClustering.cpp")
    add_packages("gtest")
