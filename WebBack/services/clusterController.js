const path = require('path');
const fs = require('fs');
const localFilesDAO = require('../middlewares/localFiles/localFilesDAO');
const db = require('../db'); 

// List the clusters authorized to the student
async function listStudentClusters(user) {
  const studentId = user.id;
  
  const clusters = await db.getClustersForStudent(studentId); // Replace with the clusterDAO command
  return clusters;
}

// Submit the preferences
async function submitPreferences(user, clusterId, preferences) {
  const studentId = user.id;
  // Save the preferences in the DB
  await db.savePreferences(studentId, clusterId, preferences);
  return { clusterId };
}

// List the clusters made by the teacher
async function listTeacherClusters(user) {
  const teacherId = user.id;
  const clusters = await db.getClustersForTeacher(teacherId);
  return clusters;
}

// Create a cluster
async function createCluster(user, formData) {
  const teacherId = user.id;
  const { clusterName, studentList } = formData;
  

  // <TODO> Replace with the clusterDAO
  const clusterId = await db.createCluster(teacherId, clusterName);
  await db.insertStudentsInCluster(clusterId, studentList);

  await localFilesDAO.initClusterFolder(teacherId, clusterName, studentList);

  return { clusterId, name: clusterName };
}

// Run the scripts
async function runGroupGenerationScript(user, clusterId) {
  const teacherId = user.id;
  const scriptPath = ""; // Replace with the build folder

  const infoFile = ""; // Replace with the json contained in the folder
  const cmd = `& "${scriptPath}" "${infoFile}"`;

  return new Promise((resolve, reject) => {
    require('child_process').exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr));
      resolve(stdout);
    });
  });
}

module.exports = {
  listStudentClusters,
  submitPreferences,
  listTeacherClusters,
  createCluster,
  runGroupGenerationScript
};
