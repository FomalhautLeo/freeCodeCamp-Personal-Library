/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const mongoose = require("mongoose");

const BookModel = mongoose.model(
  "Book",
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    comments: {
      type: [String],
      default: [],
    },
  })
);

module.exports = function (app) {
  mongoose.connect(process.env.DB).then(() => {
    console.log("== Connected to MongoDB");
  });
  app.get(function (req, res) {
    console.log(req.params);
    console.log(req.body);
    console.log(req.url);
    res.json({ msg: "done" });
  });

  app
    .route("/api/books")
    .get(function (req, res) {
      console.log("-- Get books");
      BookModel.find()
        .then((found) => {
          const resArr = found.map((book) => {
            return {
              _id: book.id,
              title: book.title,
              commentcount: book.comments.length,
            };
          });
          console.log(
            "    Found books: ",
            resArr.map((book) => book.title)
          );
          res.json(resArr);
        })
        .catch((err) => {
          console.error("  ** Error finding books");
          console.error(err);
          res.json({ error: err.message });
        });
    })

    .post(function (req, res) {
      const title = req.body.title;
      //response will contain new book object including atleast _id and title
      console.log("-- Add book: ", title);
      if (!title) {
        console.log("   Missing title");
        res.send("missing required field title");
        return;
      }
      const book = new BookModel({
        title,
      });
      book
        .save()
        .then((saved) => {
          if (saved) {
            console.log("   Saved book: ", saved._id.toHexString());
            const retObj = {
              title,
              _id: saved._id,
            };
            res.json(retObj);
          } else {
            console.log("   Save book failed: ", title);
            res.json({ error: "Save book failed: " + title });
          }
        })
        .catch((err) => {
          console.error("** Error saving book: ", title);
          console.error(err);
          res.json({ error: err.message });
        });
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
      console.log("-- Delete all books");
      // delete all
      BookModel.deleteMany({})
        .then(() => {
          res.send("complete delete successful");
        })
        .catch((err) => {
          console.error("  ** Error deleting all books");
          console.error(err);
          res.json({ error: err.message });
        });
    });

  app
    .route("/api/books/:id")
    .get(function (req, res) {
      const id = req.params.id;
      console.log("-- Get book: ", id);
      BookModel.findById(id)
        .select("title comments")
        .then((found) => {
          if (!found) {
            console.log("  Book not found");
            res.send("no book exists");
          } else {
            console.log("  Found book: ", found.title);
            res.json(found);
          }
        })
        .catch((err) => {
          console.error("  ** Error finding books");
          console.error(err);
          res.json({ error: err.message });
        }); //json res format: {"_id": bookid, "title": title, "comments": [comment,comment,...]}
    })

    .post(function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
      //json res format same as .get
      console.log(`-- Add comment of ${bookid}: `, comment);
      if (!comment) {
        console.log("  Missing comment");
        res.send("missing required field comment");
        return;
      }
      BookModel.findByIdAndUpdate(
        bookid,
        { $push: { comments: comment } },
        { new: true }
      )
        .select("title comments")
        .then((found) => {
          if (!found) {
            console.log("  Book not found");
            res.send("no book exists");
          } else {
            console.log("  Found book: ", found.title);
            res.json(found);
          }
        })
        .catch((err) => {
          console.error("  ** Error finding book");
          console.error(err);
          res.json({ error: err.message });
        });
    })

    .delete(function (req, res) {
      const bookid = req.params.id;
      //if successful response will be 'delete successful'
      console.log("-- Delete book: ", bookid);
      if (!bookid) {
        console.log("    Missing bookid");
        res.send("no book exists");
      }
      BookModel.findByIdAndDelete(bookid)
        .then((deleted) => {
          if (!deleted) {
            console.log("  Book not found");
            res.send("no book exists");
          } else {
            console.log("  Remove done");
            res.send("delete successful");
          }
        })
        .catch((err) => {
          console.error("  ** Error deleting book");
          console.error(err);
          res.json({ error: err.message });
        });
    });
};
