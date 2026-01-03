const multer = require("multer");//this is use to store files
const path = require("path");//here where to store
const fs = require("fs");


// Absolute path to uploads folder
const uploadDir = path.join(__dirname, "../uploads");

// Create uploads folder if it does not exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

//destination will be uploads folder 
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");//give the name to that uploaded file
    cb(null, uniqueName);//save the given name
  },
});

//check image
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;//allowed extension
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());//check extension of file
  const mimetype = allowedTypes.test(file.mimetype);//check if actual image type
  if (mimetype && extname) return cb(null, true);//valid image and type then ok 
   cb(new Error("Images only"), false);//if mismatched show error
};

const upload = multer({ storage, fileFilter });

module.exports = upload;


