import Express from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
//import { receiveMessageOnPort } from "worker_threads";
import { Storage } from "@google-cloud/storage";
import fs from 'fs';
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const upload = Express.Router();

const storage = new Storage({
  projectId: "cloud1-340711",
  keyFilename: "./key.json",
});

const bucketname = "cloud1-340711.appspot.com";

let docUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../uploads/"));
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".doc" && ext !== ".docx") {
      return callback(new Error("Only word documents are allowed"));
    }
    callback(null, true);
  },
  limits: {
    fileSize: 2621441,
  },
});

upload.route("/").post(docUpload.single("document"), async function(req, res) {
  if (req.file) {
    console.log("File downloaded at: " + req.file.path);
    //Upload to google cloud
    storage.bucket(bucketname).upload(req.file.path, {
      destination: "uploads/" + req.file.originalname,
      });
    //Convert to base64
    var base64file =  fs.readFileSync(req.file.path, 'base64');
    //Send to PDF Conversion API
    const url = `https://getoutpdf.com/api/convert/document-to-pdf`;
      const headers = {
       //"Content-Type": "application/json",
        "api_key" :  "cd5f6fa01e69020f3b5cafc577d7b84ed947699f029ba6bf408d84b2d3bab127",
        "document" : `${base64file}`
      }
      const response_64 = await axios.post(url, headers);  
         const newfile = new Buffer.from(response_64.data.pdf_base64, 'base64');
         console.log(newfile);

         const NewName = req.file.originalname.replace(path.extname(req.file.originalname),".pdf");
         var FinalLink = "";
        await storage.bucket(bucketname).file(`uploads/${NewName}`).save(newfile);
        FinalLink =
        "https://storage.googleapis.com/cloud1-340711.appspot.com/uploads/" +
        NewName;
    res.send({
      status: "200",
      message: "File uploaded successfully! Processing..",
    });
  }
});

export default upload;
