const { json } = require("body-parser");
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { check, validationResult } = require("express-validator");
const connection = require("../db");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const router = express.Router();
const auth = require("../middleware/auth");

router.post(
  "/register",
  [
    check("NAME", "NAME is required").not().isEmpty(),

    check("EMAIL", "Please Enter a Email address").isEmail(),

    check(
      "PASSWORD",
      "Please enter a password with 6 OR more characters"
    ).isLength({ min: 6 }),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let { NAME, EMAIL, PASSWORD } = req.body;
      const USERID = uuidv4();

      const checkingUser = `SELECT * FROM USERS WHERE EMAIL= "${req.body.EMAIL}"`;

      connection.query(checkingUser, async (err, result) => {
        if (result.length > 0) {
          res.status(500).json({ msg: "User Already Registered" });
          console.log("User Already Registered");
        } else {
          const salt = await bcrypt.genSalt(10);

          PASSWORD = await bcrypt.hash(req.body.PASSWORD, salt);

          const sql = `INSERT INTO USERS ( USERID, NAME, EMAIL, PASSWORD ) 
                   VALUES ("${USERID}", "${NAME}", "${EMAIL}", "${PASSWORD}" )`;

          connection.query(sql, (err, result) => {
            if (err) {
              res.status(500).json({ msg: "There is an Error" });
            } else {
              // res.status(200).json({ msg: "User Created Successfully" });
              console.log("User Created Successfully");
            }
          });

          const getUSERID = `SELECT USERID FROM USERS WHERE EMAIL="${EMAIL}"`;
          console.log(getUSERID);
          connection.query(getUSERID, (err, result) => {
            if (err) {
              console.log(err);
            } else {
              const ID = result;
              console.log(ID[0].USERID);

              const payload = {
                user: {
                  id: ID[0].USERID,
                },
              };

              console.log("Getting JWT");

              jwt.sign(
                payload,
                config.get("jwtSecret"),
                { expiresIn: 360000 },
                (err, token) => {
                  if (err) {
                    err;
                  } else {
                    res.json({ token });
                  }
                }
              );
            }
          });
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

router.post(
  "/login",
  [
    check("EMAIL", "Please include a valid email").isEmail(),
    check("PASSWORD", "Password is Required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ALLDETAILS = `SELECT * FROM USERS WHERE EMAIL="${req.body.EMAIL}"`;

    try {
      //@TODO - Check Email User
      const checkingUser = `SELECT EMAIL FROM USERS WHERE EMAIL= "${req.body.EMAIL}"`;

      connection.query(checkingUser, (err, result) => {
        if (result.length == 0 || result.length == []) {
          return res
            .status(500)
            .json({ errors: [{ msg: "Invalid Credentials" }] });
        }
      });

      connection.query(ALLDETAILS, async (err, result) => {
        if (err) {
          console.error(err);
        } else {
          console.log(result);
          const ID = result;
          // console.log(ID[0].PASSWORD)

          const isMatch = await bcrypt.compare(
            req.body.PASSWORD,
            ID[0].PASSWORD
          );
          console.log(isMatch);

          if (!isMatch) {
            return res
              .status(400)
              .json({ errors: [{ msg: "Invalid Credentials" }] });
          }

          const payload = {
            user: {
              id: ID[0].USERID,
            },
          };

          console.log("Getting JWT");

          jwt.sign(
            payload,
            config.get("jwtSecret"),
            { expiresIn: 360000 },
            (err, token) => {
              if (err) {
                err;
              } else {
                res.json({ token });
              }
            }
          );
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

router.get("/", auth, async (req, res) => {
  try {
    const ID = req.user;
    console.log(JSON.stringify(ID));
    const USERID = ID.id;
    const USERDETAILS = `SELECT EMAIL , NAME FROM USERS WHERE USERID="${USERID}"`;
    connection.query(USERDETAILS, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json(result);
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});


module.exports = router;
