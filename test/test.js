const supertest = require("supertest");
const should = require("should");
const server = supertest.agent("http://localhost:3000");

// UNIT test begin
describe("Student and teacher management system", function(){

    // #1 should return home page
    it("should return home page", function(done){
        // calling home page
        server
        .get("/")
        .expect("Content-type",/json/)
        .expect(200) // This is HTTP response
        .end(function(err,res){
            // HTTP status should be 200
            res.status.should.equal(200);
            done();
        });
    });

    it("should register teacher and students successfully", function(done){

        //calling REGISTER api
        server
        .post('/api/register')
        .send({   
            teacher: "teacherrao@gmail.com",   
            students:     
            [       
                "studentdaniel@example.com",       
                "studentsuen@example.com"     
            ] 
            
        } )
        .expect(204)
        .end(function(err,res){
          res.status.should.equal(204);
          done();
        });
      });

    it("should retrieve students who are registered to ALL of the given teachers", function(done){

        //calling REGISTER api
        server
        .get('/api/commonstudents')
        .query({teacher: "teacherken@gmail.com"})
        .expect(200)
        .end(function(err,res){
            res.status.should.equal(200);
            done();
        });
    });

    it("should suspend the given student", function(done){

        //calling REGISTER api
        server
        .post('/api/suspend')
        .send({    
            student:          
                "studentsuen@example.com"
        } )
        .expect(204)
        .end(function(err,res){
            res.status.should.equal(204);
            done();
        });
    });

    it("should retrieve a list of students who can receive a given notification", function(done){

        //calling REGISTER api
        server
        .post('/api/retrievefornotifications')
        .send({   
            teacher:  "teacherken@gmail.com",   
            notification: "Hello students!" 
        })
        .expect(200)
        .end(function(err,res){
            res.status.should.equal(200);
            done();
        });
    });
  
  });