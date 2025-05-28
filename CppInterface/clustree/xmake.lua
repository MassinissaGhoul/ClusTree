-- Create project CLI : xmake project -k vsxmake
add_rules("mode.debug", "mode.release")

-- project
target("graph_app")
    set_kind("binary")
    set_languages("cxx17")

    -- source files
    add_files("src/*.cpp")

    -- include directories
    add_includedirs("include", {public = true})


    -- optional: set output directory
    set_targetdir("$(projectdir)/bin")
