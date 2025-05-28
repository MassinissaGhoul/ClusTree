const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const scriptsFolderPath = "../../../CppInterface/build";
const uploadsFolderPath = "../../uploads";

// Function to list available scripts
async function listAvailableScripts() {
  try {
    // Read files from the directory
    const files = await fs.promises.readdir(scriptsFolderPath);
    // Filter .exe files
    const exeFiles = files.filter(file => file.endsWith('.exe'));
    return exeFiles;
  } catch (error) {
    console.error('Error reading the folder:', error);
    return [];
  }
}

// Function to execute a script and handle the result file
async function execScript(scriptName, teacher_mail, cluster_name) {
  try {
    // Path to the graph.json file
    const graphFilePath = path.join(uploadsFolderPath, teacher_mail, cluster_name, 'graph.json');
    
    // Check if graph.json exists
    if (!fs.existsSync(graphFilePath)) {
      console.error(`The graph.json file does not exist at ${graphFilePath}`);
      return;
    }

    // Full path to the executable script
    const scriptPath = path.join(scriptsFolderPath, scriptName);

    // Check if the .exe script exists
    if (!fs.existsSync(scriptPath)) {
      console.error(`The script ${scriptName} does not exist at ${scriptPath}`);
      return;
    }

    // Run the script using exec()
    exec(`"${scriptPath}" "${graphFilePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }

      // Log the output from the script
      console.log(`stdout: ${stdout}`);

      // Assuming the script creates a result file (e.g., result.json), you can check for its presence
      const resultFilePath = path.join(resultDirectory, 'result.json');  // Adjust based on your script's output
      if (fs.existsSync(resultFilePath)) {
        console.log(`Result file created: ${resultFilePath}`);
      } else {
        console.log(`No result file found in ${resultDirectory}`);
      }
    });
  } catch (error) {
    console.error('Error executing the script:', error);
  }
}

module.exports = { listAvailableScripts, execScript };
