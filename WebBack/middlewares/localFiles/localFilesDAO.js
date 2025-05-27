const multer = require('multer');
const path = require('path');

const fs = require('fs');
const { exec } = require('child_process');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const user = req.session.user;
    const cluster = req.params.cluster;

    if (!user || !cluster) {
      return cb(new Error(''));
    }

    const dir = path.join(__dirname, 'uploads', user, cluster);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// <TODO> Use multer