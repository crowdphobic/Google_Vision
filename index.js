const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const vision = require("@google-cloud/vision");
const fs = require("fs");
const path = require("path");

//image folder
var target_dir = "./adidas";

//middlewares
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

//google vision authentication
const client = new vision.ImageAnnotatorClient({
  keyFilename: "apikey.json"
});

app.get("/attribute", async (req, res) => {
  try {
    let labels = [];

    //extracting web attribute of image.
    let webAttribute = await client.webDetection("./adidas/loak.jpg");
    webAttribute = webAttribute[0].webDetection.webEntities;
    for (let i = 0; i < webAttribute.length; i++) {
      if (webAttribute[i].score >= 0.65 && webAttribute[i].description != "") {
        labels.push(webAttribute[i].description);
      }
    }

    //extracting attribute of image
    let labelAttribute = await client.labelDetection("./adidas/loak.jpg");
    labelAttribute = labelAttribute[0].labelAnnotations;
    for (let i = 0; i < labelAttribute.length; i++) {
      if (
        labelAttribute[i].score >= 0.7 &&
        labelAttribute[i].description != ""
      ) {
        if (!labels.includes(labelAttribute[i].description)) {
          labels.push(labelAttribute[i].description);
        }
      }
    }
    res.status(200).json({ labels: labels });
  } catch (error) {
    res.status(400).json({ message: "something went wrong!" });
  }
});

app.listen(3000, () => {
  console.log("listening to 3000");
});
