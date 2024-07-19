const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite("3 Post request Tests", function () {
    test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/projects")
        .set("content-type", "application/json")
        .send({
          issue_title: "Issue",
          issue_text: "Functional Test",
          created_by: "fCC",
          assigned_to: "Dom",
          status_text: "Not Done",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          deleteID = res.body._id;
          assert.equal(res.body.issue_title, "Issue");
          assert.equal(res.body.assigned_to, "Dom");
          assert.equal(res.body.created_by, "fCC");
          assert.equal(res.body.status_text, "Not Done");
          assert.equal(res.body.issue_text, "Functional Test");
          done();
        });
    });
    test("Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/projects")
        .set("content-type", "application/json")
        .send({
          issue_title: "Issue",
          issue_text: "Functional Test",
          created_by: "fCC",
          assigned_to: "",
          status_text: "",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Issue");
          assert.equal(res.body.created_by, "fCC");
          assert.equal(res.body.issue_text, "Functional Test");
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");
          done();
        });
    });
    test("Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/projects")
        .set("content-type", "application/json")
        .send({
          issue_title: "",
          issue_text: "",
          created_by: "fCC",
          assigned_to: "",
          status_text: "",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
  });
  
  //////////////// GET REQUEST TESTS /////////////////////
  suite("3 Get request Tests", function () {
    test("View issues on a project: GET request to /api/issues/{project}", function (done) {
      chai
      .request(server)
      .keepOpen()
      .get("/api/issues/test")
      .end(function (err, res) {
        assert.isArray(res.body);
        done();
        });
    });
    test("View issues on a project with one filter: GET request to /api/issues/{project}.", function (done) {
      chai
      .request(server)
      .keepOpen()
      .get("/api/issues/test?open=true")
      .end(function (err, res) {
        assert.isArray(res.body);
        done();
        });
    });
    test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function (done) {
      chai
      .request(server)
      .keepOpen()
      .get("/api/issues/test?open=false&assigned_to=Jasmine")
      .end(function (err, res) {
        assert.isArray(res.body);
        done();
        });
    });
  });

  //////////////// PUT REQUEST TESTS /////////////////////
  test("Update one field fields on an issue: PUT request to /api/issues/{project}", function (done) {
    // crear un nuevo issue
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/test")
      .send({
        issue_title: "Título de prueba",
        issue_text: "Texto de prueba",
        created_by: "waldo",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        // verificar que res.body._id existe
        assert.isNotNull(res.body._id, "El campo _id no debe ser nulo");

        chai
          .request(server)
          .keepOpen()
          .put("/api/issues/test")
          .send({
            _id: res.body._id,
            open: false,
            assigned_to: "Jasmine",
          })
          .end(function (err, res) {
            assert.equal(res.body.result, "successfully updated");
            done();
          });
      });
  });
  test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function (done) {
    // crear un nuevo issue
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/test")
      .send({
        issue_title: "Título de prueba",
        issue_text: "Texto de prueba",
        created_by: "waldo",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        // verificar que res.body._id existe
        assert.isNotNull(res.body._id, "El campo _id no debe ser nulo");

        chai
          .request(server)
          .keepOpen()
          .put("/api/issues/test")
          .send({
            _id: res.body._id,
            open: false,
            assigned_to: "Jasmine",
          })
          .end(function (err, res) {
            assert.equal(res.body.result, "successfully updated");
            done();
          });
      });
  });
  test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .put("/api/issues/test-data-put")
      .send({
        issue_title: "update",
        issue_text: "update",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "missing _id");

        done();
      });
  });
  test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .put("/api/issues/test-data-put")
      .send({
        _id: "5fe0c500ec2f6f4c1815a770",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "no update field(s) sent");

        done();
      });
  });
  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .put("/api/issues/test-data-put")
      .send({
        _id: "5fe0c500e672341c1815a770",
        issue_title: "update",
        issue_text: "update",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "could not update");

        done();
      });
  });
  //////////////// DELETE REQUEST TESTS /////////////////////
  suite("3 DELETE request Tests", function () {
    test("Delete an issue: DELETE request to /api/issues/projects", function (done) {
      chai
        .request(server)
        .delete("/api/issues/projects")
        .send({
          _id: deleteID,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully deleted");

          done();
        });
    });
    test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .delete("/api/issues/projects")
        .send({
          _id: "5fe0c500ec2f6f4c1815a770invalid",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not delete");

          done();
        });
    });
    test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .delete("/api/issues/projects")
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");

          done();
        });
    });
  });
});