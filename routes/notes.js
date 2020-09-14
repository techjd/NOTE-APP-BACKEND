const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const { v1: uuidv1 } = require("uuid");
const connection = require("../db");
router.post(
  "/createPost",
  auth,
  [
    check("TITLE", "Title is Required").not().isEmpty(),
    check("DESCRIPTION", "Description is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { TITLE, DESCRIPTION } = req.body;
      console.log(req.body.TITLE, "  ", req.body.DESCRIPTION);
      const NOTESID = uuidv1();

      const ID = req.user;
      console.log(JSON.stringify(ID));
      const USERID = ID.id;

      const INSERTNOTES = `INSERT INTO NOTES (NOTESID, TITLE, DESCRIPTION, USERID) VALUES ("${NOTESID}", "${TITLE}", "${DESCRIPTION}", "${USERID}")`;

      connection.query(INSERTNOTES, (err, result) => {
        if (err) {
          console.error(err);
        } else {
          res.status(200).json({ msg: "Notes Added Successfully" });
          console.log("Note Added");
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

router.get("/allNotes", auth, async (req, res) => {
  const ID = req.user;
  console.log(JSON.stringify(ID));
  const USERID = ID.id;

  const GETALLNOTES = `SELECT * FROM NOTES WHERE USERID="${USERID}"`;

  connection.query(GETALLNOTES, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      return res.status(200).json({ result });
    }
  });
});

router.put("/editNote/:notesid", auth, async (req, res) => {
  const NOTESID = req.params.notesid;
  let { TITLE, DESCRIPTION } = req.body;

  if (TITLE == undefined && DESCRIPTION == undefined) {
    return res.status(200).json({ msg: "Nothing is Modified" });
  } else if (TITLE == undefined && DESCRIPTION.length > 0) {
    const WITHOUTTITLE = `UPDATE NOTES SET DESCRIPTION = "${DESCRIPTION}" WHERE NOTESID = "${NOTESID}"`;
    connection.query(WITHOUTTITLE, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        return res.status(200).json({ msg: result });
      }
    });
  } else if (DESCRIPTION == undefined && TITLE.length > 0) {
    const WITHOUTDESCRIPTION = `UPDATE NOTES SET TITLE = "${TITLE}"  WHERE NOTESID = "${NOTESID}"`;
    connection.query(WITHOUTDESCRIPTION, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        return res.status(200).json({ msg: result });
      }
    });
  } else {
    const EDITNOTES = `UPDATE NOTES SET TITLE = "${TITLE}" , DESCRIPTION = "${DESCRIPTION}" WHERE NOTESID = "${NOTESID}"`;

    connection.query(EDITNOTES, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        return res.status(200).json({ msg: result });
      }
    });
  }
});

router.get("/getNotes/:notesid", auth, async (req, res) => {
  const ID = req.user;
  console.log(JSON.stringify(ID));
  const USERID = ID.id;
  const NOTESID = req.params.notesid;

  const GETALLNOTES = `SELECT TITLE, DESCRIPTION FROM NOTES WHERE NOTESID="${NOTESID}"`;

  connection.query(GETALLNOTES, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      return res.status(200).json({ msg: result });
    }
  });
});

router.delete("/delete/:notesid", auth, async (req, res) => {
  const ID = req.user;
  console.log(JSON.stringify(ID));
  const USERID = ID.id;
  const NOTESID = req.params.notesid;

  const DELETESPECIFICNOTE = `DELETE FROM NOTES WHERE NOTESID="${NOTESID}"`;

  connection.query(DELETESPECIFICNOTE, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      return res.status(200).json({ msg: "Note Deleted Successfully" });
    }
  });
});

module.exports = router;
