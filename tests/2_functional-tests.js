/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  // test("#example Test GET /api/books", function (done) {
  //   chai
  //     .request(server)
  //     .get("/api/books")
  //     .end(function (err, res) {
  //       assert.equal(res.status, 200);
  //       assert.isArray(res.body, "response should be an array");
  //       assert.property(
  //         res.body[0],
  //         "commentcount",
  //         "Books in array should contain commentcount"
  //       );
  //       assert.property(
  //         res.body[0],
  //         "title",
  //         "Books in array should contain title"
  //       );
  //       assert.property(
  //         res.body[0],
  //         "_id",
  //         "Books in array should contain _id"
  //       );
  //       done();
  //     });
  // });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function () {
    this.timeout(5000);
    const url = "/api/books/";

    let savedBook;
    const wrongId = "ffffffffffffffffffffffff";

    suite(
      "POST /api/books with title => create book object/expect book object",
      function () {
        test("Test POST /api/books with title", function (done) {
          const testTile = "testA";
          chai
            .request(server)
            .post(url)
            .send({ title: testTile })
            .end(function (err, res) {
              if (err) return done(err);
              const body = res.body;
              assert.strictEqual(res.status, 200);
              assert.strictEqual(res.type, "application/json");
              assert.strictEqual(body.title, testTile);
              savedBook = body;
              assert.match(body._id, /^[0-9a-fA-F]+$/);
              done();
            });
        });

        test("Test POST /api/books with no title given", function (done) {
          chai
            .request(server)
            .post(url)
            .send({})
            .end(function (err, res) {
              if (err) return done(err);
              assert.strictEqual(res.status, 200);
              assert.strictEqual(res.type, "text/html");
              assert.strictEqual(res.text, "missing required field title");
              done();
            });
        });
      }
    );

    suite("GET /api/books => array of books", function () {
      test("Test GET /api/books", function (done) {
        chai
          .request(server)
          .get(url)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, "application/json");
            assert.isArray(res.body);
            done();
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function () {
      test("Test GET /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .get(url + wrongId)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, "text/html");
            assert.strictEqual(res.text, "no book exists");
            done();
          });
      });

      test("Test GET /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .get(url + savedBook._id)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, "application/json");
            assert.deepStrictEqual(res.body.title, savedBook.title);
            assert.deepStrictEqual(res.body._id, savedBook._id);
            assert.isArray(res.body.comments);
            done();
          });
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function () {
        const comment = "test comment A";
        test("Test POST /api/books/[id] with comment", function (done) {
          chai
            .request(server)
            .post(url + savedBook._id)
            .send({ comment })
            .end(function (err, res) {
              if (err) return done(err);
              savedBook.comments = [comment];
              assert.strictEqual(res.status, 200);
              assert.strictEqual(res.type, "application/json");
              assert.deepStrictEqual(res.body, savedBook);
              done();
            });
        });

        test("Test POST /api/books/[id] without comment field", function (done) {
          chai
            .request(server)
            .post(url + savedBook._id)
            .send({})
            .end(function (err, res) {
              if (err) return done(err);
              assert.strictEqual(res.status, 200);
              assert.strictEqual(res.type, "text/html");
              assert.strictEqual(res.text, "missing required field comment");
              done();
            });
        });

        test("Test POST /api/books/[id] with comment, id not in db", function (done) {
          chai
            .request(server)
            .post(url + wrongId)
            .send({ comment: "test comment B" })
            .end(function (err, res) {
              if (err) return done(err);
              assert.strictEqual(res.status, 200);
              assert.strictEqual(res.type, "text/html");
              assert.strictEqual(res.text, "no book exists");
              done();
            });
        });
      }
    );

    suite("DELETE /api/books/[id] => delete book object id", function () {
      test("Test DELETE /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .delete(url + savedBook._id)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, "text/html");
            assert.strictEqual(res.text, "delete successful");
            done();
          });
      });

      test("Test DELETE /api/books/[id] with  id not in db", function (done) {
        chai
          .request(server)
          .delete(url + wrongId)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, "text/html");
            assert.strictEqual(res.text, "no book exists");
            done();
          });
      });
    });
  });
});
