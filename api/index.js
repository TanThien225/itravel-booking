const express = require("express");
const cors = require("cors");
const { default: mongoose } = require("mongoose");

//Data
const User = require("./models/User.js");
const Place = require("./models/Place.js");
const Booking = require("./models/Booking.js");

//encrypt password
const bcrypt = require("bcryptjs");
//jsonwebtoken
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
//image downloader
const imageDownloader = require("image-downloader");
const multer = require("multer");
//Rename file on the server
const fs = require("fs");
require("dotenv").config();
//req.body
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "fdsajaljlgvuemsldfofkosfsaf";

app.use(express.json());
app.use(cookieParser());

//Connect with http://127.0.0.1:4000/uploads/....jpg and display folder uploads image
app.use("/uploads", express.static(__dirname + "/uploads"));

//connect with address
app.use(cors({ credentials: true, origin: "http://127.0.0.1:5173" }));

//password mongoDB VZiniJANxqJpnwaU
//Connect to the database
try {
  mongoose.connect(process.env.MONGO_URL);
} catch (e) {
  console.log("error in connect mongodb");
}

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      resolve(userData);
    });
  });
}

app.get("/test", (req, res) => {
  res.json("test ok");
});

// Sent info to api
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    //Create user adding to mongoDB
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });

    res.json(userDoc);
  } catch (error) {
    // 422 Unprocessable Content
    res.status(442).json(error);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });
  if (!userDoc) {
    res.json("not found");
  }
  //if user was found
  else {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign(
        { email: userDoc.email, id: userDoc._id },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(userDoc);
        }
      );
    } else {
      res.status(422).json("pass failed");
    }
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const { name, email, _id } = await User.findById(userData.id);
      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
});

// logout and change token back to early not save info user anymore
app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

// console.log({ __dirname });
app.post("/upload-by-link", async (req, res) => {
  const { link } = req.body;
  const newName = "photo" + Date.now() + ".jpg";
  await imageDownloader.image({
    url: link,
    dest: __dirname + "/uploads/" + newName,
  });
  res.json(newName);
});

const photosMiddleware = multer({ dest: "uploads/" });
//photos from placesPage: data.set("photos", files);
app.post("/upload", photosMiddleware.array("photos", 100), (req, res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname } = req.files[i];
    //splitting a file path or name using a delimiter (such as a dot .).
    const parts = originalname.split(".");
    // access the last element of the array, duoi
    const ext = parts[parts.length - 1];

    //path final
    const newPath = path + "." + ext;
    fs.renameSync(path, newPath);
    // console.log(newPath);
    uploadedFiles.push(newPath.replace("uploads\\", ""));
  }
  res.json(uploadedFiles);
  // res.json(uploadedFiles.map((path) => path.replace(/\\/g, "/")));
});

app.post("/places", (req, res) => {
  const { token } = req.cookies;
  const {
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = req.body;
  //Check and get id of use to add into owner
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    // const { name, email, _id } = await User.findById(userData.id);
    const placeDoc = await Place.create({
      owner: userData.id,
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    });
    res.json(placeDoc);
  });
});

//get token
app.get("/user-places", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    const { id } = userData;
    res.json(await Place.find({ owner: id }));
  });
});

app.get("/places/:id", async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { id } = req.params;
  res.json(await Place.findById(id));
});

app.put("/places", async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { token } = req.cookies;
  const {
    id,
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.findById(id);
    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price,
      });
      await placeDoc.save();
      res.json("ok");
    }
  });
});

app.get("/places", async (req, res) => {
  res.json(await Place.find());
});

//Get info of customer that booked
app.post("/bookings", async (req, res) => {
  const userData = await getUserDataFromReq(req);
  const {
    place,
    checkInDate,
    checkOutDate,
    numberOfGuests,
    nameCustomer,
    phoneNumber,
    price,
  } = req.body;
  Booking.create({
    place,
    checkInDate,
    checkOutDate,
    numberOfGuests,
    nameCustomer,
    phoneNumber,
    price,
    user: userData.id,
  })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      console.error("Error creating booking:", err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

app.get("/bookings", async (req, res) => {
  const userData = await getUserDataFromReq(req);
  res.json(await Booking.find({ user: userData.id }).populate("place"));
});

app.listen(4000);
