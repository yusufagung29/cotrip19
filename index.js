const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');
const session = require('express-session');
const flash = require('connect-flash');
const alert = require('alert');
const bcrypt = require('bcrypt')
    
app.use(cors());
app.use(express.json());
app.set('view engine','ejs');
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret',
    cookie: {maxAge: 60000},
    resave: false,
    saveUninitialized: false
}));
app.use(flash());


app.get("/", (req, res) => {
    res.render("home");
});

app.get("/userlogin", (req, res) => {
    res.render("userlogin");
});

app.get("/createcountry", (req, res) => {
    res.render("createcountry");
});

app.get("/masterlogin", (req, res) => {
    res.render("masterlogin");
});

app.get("/adminlogin", (req, res) => {
    res.render("adminlogin");
});

app.get("/usercreate", (req, res) => {
    res.render("usercreate");
});

app.get("/createadmin", (req, res) => {
    res.render("createadmin");
});

app.get('/masteradmin', function(req, res) {
    const query =  `SELECT * FROM masteradmin;`
    pool.query(query ,[],(err, results) => {
        if (err) {
            redirect("/masterdashboard")
            console.error(err);
            return;
        }
        res.render('masterdashboard', {
            model: results.rows
          });
    });    
});

app.get('/addcountry', function(req, res) {
    const query =  `SELECT * FROM country_status ORDER BY name asc;`
    pool.query(query ,[],(err, results) => {
        if (err) {
            redirect("/masterdashboard")
            console.error(err);
            return;
        }
        res.render('addcountry', {
            model: results.rows
          });
    });    
});

app.post('/deletecountry/:id', function(req, res) {
    const query =  `DELETE FROM country_status WHERE id = $1;`
    const id = [req.params.id];
    pool.query(query ,id ,(err, results) => {
        if (err) {
            console.error(err);
            return;
        }
        res.redirect("/addcountry");
    });    
});

app.post('/deleteadmin/:id', function(req, res) {
    const query =  `DELETE FROM admincred WHERE id = $1;`
    const id = [req.params.id];
    pool.query(query ,id ,(err, results) => {
        if (err) {
            res.redirect("/addadmin");
            alert(err.message);
            console.error(err);
            return;
        }
        res.redirect("/addadmin");
    });    
});

app.post('/createcountry', function(req, res) {
    if(req.body.country == '' || req.body.pop == '' || req.body.vacc == ''){
        res.redirect("/editadmin/:id");
        alert ("please fill all the form")
        return;
    }
    const query =  `INSERT INTO COUNTRY (name,pop,c_vacc) VALUES($1,$2,$3);`
    const country = [`${req.body.country}`,req.body.pop,req.body.vacc];
    pool.query(query ,country ,(err, results) => {
        if (err) {
            res.redirect("/createcountry")
            alert(err.message);
            console.error(err);
            return;
        }
        res.redirect("/addcountry");
    });    
});

app.post('/createadmin', function(req, res) {
    if(req.body.country == '' || req.body.username == '' || req.body.password == ''){
        alert("please fill all the form!");
        res.redirect("/createadmin");
        return;
    }

    const query =  `INSERT INTO admincred (country,username,password) VALUES($1,$2,$3);`
    const country = [`${req.body.country}`,`${req.body.username}`,`${req.body.password}`];
    pool.query(query ,country ,(err, results) => {
        if (err) {
            alert(err.message);
            res.redirect("/createadmin")
            console.error(err);
            return;
        }
        res.redirect("/addadmin");
    });    
});

app.post('/editcountry/:id', function(req, res) {
    const query =  `UPDATE country SET c_vacc = $1 WHERE id = $2;`
    const id = [req.body.vacc,req.params.id];
    pool.query(query ,id ,(err, results) => {
        if (err) {
            res.redirect("/editcountry/:id")
            alert(err.message);
            console.error(err);
            return;
        }
        res.redirect("/addcountry");
    });    
});


app.get('/editcountry/:id', function(req, res) {
    const query =  `SELECT * FROM COUNTRY WHERE id = $1;`
    const id = [req.params.id];
    pool.query(query ,id ,(err, results) => {
        if (err) {
            res.redirect("/addcountry")
            alert(err.message);
            console.error(err);
            return;
        }
        res.render('editcountry', {
            model: results.rows
          });
    });    
});

app.post('/editadmin/:id', function(req, res) {
    if(req.body.username == '' || req.body.password == ''){
        res.redirect("/editadmin/:id");
        alert ("please fill all the form")
        return;
    }
    const query =  `UPDATE admincred SET username = $1, password = $2 WHERE id = $3;`
    const id = [`${req.body.username}`,`${req.body.password}`,req.params.id];
    pool.query(query ,id ,(err, results) => {
        if (err) {
        res.redirect("/editadmin/:id");
        alert(err.message);
            console.error(err);
            return;
        }
        res.redirect("/addadmin");
    });    
});

app.get('/editadmin/:id', function(req, res) {
    const query =  `SELECT * FROM admincred WHERE id = $1;`
    const id = [req.params.id];
    pool.query(query ,id ,(err, results) => {
        if (err) {
            res.redirect("/addadmin");
            alert(err.message);
            console.error(err);
            return;
        }
        res.render('editadmin', {
            model: results.rows
          });
    });    
});

app.get("/addadmin", (req, res) => {
    const query =  `SELECT * FROM admincred ORDER BY country asc;`
    pool.query(query ,[],(err, results) => {
        if (err) {
            res.redirect("/masteradmin")
            alert(err.message);
            console.error(err);
            return;
        }
        res.render('addadmin', {
            model: results.rows
          });
    }); 
});

app.post('/usercreate', (req, res) => {
    if(req.body.username == '' || req.body.password == '' || req.body.name == '' || req.body.passnum == '' || req.body.origin == ''){
        res.redirect("/usercreate");
        alert("please fill all the form");
        return;
    }


    const query1 = `INSERT INTO credential(username,password) VALUES($1, $2)`;
    const query2 = `INSERT INTO tourist (name,pass_num,origin,destination,vacc,gender) VALUES($1, $2, $3, $4, '0', $5)`;
    const credential = [req.body.username, req.body.password];
    const credential2=[req.body.name, req.body.passnum, req.body.origin,
    req.body.destination, req.body.gender];
    pool.query(query2, credential2, (err, results) => {
        if (err) {
            alert(err.message);
            console.error(err);
            return;
        }
    }); 

    pool.query(query1, credential, (err, results) => {
        if (err) {
            res.redirect("/usercreate");
            console.error(err);
            return;
        }
        alert("success creating account");
        res.redirect("/userlogin");
    }); 



});

app.post('/userdestination', function(req, res) {
    const query =  `UPDATE TOURIST SET destination = $1 WHERE id = $2;`
    const user = [`${req.body.destination}`,req.body.id];
    pool.query(query , user, (err, results) => {

        if (err) {
            alert(err.message);
            console.error(err);
            return;
        }
        
        res.redirect(`/userdashboard/${req.body.id}`)
    });    
});

app.get('/userdashboard/:id', function(req, res) {
    const query =  `SELECT * FROM tourist_approval where tourist_approval.id = $1;`
    const user = [req.params.id];
    pool.query(query , user, (err, results) => {
        console.log(user);
        if (err) {
            alert(err.message);
            console.error(err);
            return;
        }
        res.render('userdashboard', {
            model: results.rows
          });
    });    
});

app.post('/userdashboard', function(req, res) {
    if(req.body.username == '' || req.body.password == ''){
        res.redirect("/userlogin");
        alert("Please enter the credential");
        return;
    }

    
    const query =  `SELECT * FROM tourist_approval WHERE tourist_approval.username = $1 AND tourist_approval.password = $2;`
    const user = [`${req.body.username}`,`${req.body.password}`];
    pool.query(query , user, (err, results) => {
        if(results.rows.length == 0){
            alert("Your credential didn't match of our record");
            res.redirect("/userlogin")
        }
        if (err) {
            alert(err.message);
            console.error(err);
            return;
        }
        res.render('userdashboard', {
            model: results.rows
          }); 
          console.log(results.rows);   
    });
});


app.post('/admindashboard', function(req, res) {
    if(req.body.username == '' || req.body.password == ''){
        res.redirect("/adminlogin");
        alert("please enter your credential");
        return;
    }
    const query =  `SELECT name,pop,c_vacc,percentage,c_status from country_cred WHERE username = $1 AND password = $2;`
    const user = [`${req.body.username}`,`${req.body.password}`];
    pool.query(query , user, (err, results) => {
        if(results.rows.length == 0){
            alert("your credential didnt match, please contact the administrator");
            res.redirect("/adminlogin")
        }
        if (err) {
            alert(err.message);
            console.error(err);
            return;
        }
        console.log(results.rows.length);
        res.render('admindashboard', {
            model: results.rows
          }); 
          console.log(results.rows);   
    });
});

app.post('/admindashboard2', function(req, res) {
    const query =  `SELECT name,pop,c_vacc,percentage,c_status from country_cred WHERE name=$1;`
    const user = [`${req.body.origin}`];
    pool.query(query , user, (err, results) => {
        console.log(user);
        if (err) {
            alert(err.message);
            console.error(err);
            return;
        }
        console.log(results.rows.length);
        res.render('admindashboard', {
            model: results.rows
          }); 
          console.log(results.rows);   
    });
});


app.get('/userpass/:id', function(req, res) {
    const query =  `SELECT id,username,password FROM tourist_approval where id = $1;`
    const user = [req.params.id];
    pool.query(query , user, (err, results) => {
        console.log(user);
        if (err) {
            console.error(err);
            return;
        }
        res.render('userpass', {
            model: results.rows
          });
    });    
});

app.post('/userpass', function(req, res) {
    if(req.body.password == '' || req.body.username == ''){
        alert("please fill all the form")
        return;
    }

    const query =  `UPDATE credential SET username = $1, password = $2 WHERE id = $3;`
    const user = [`${req.body.username}`,`${req.body.password}`,req.body.id];
    pool.query(query , user, (err, results) => {
        if (err) {
            alert(err.message);
            console.error(err);
            return;
        }
        
        res.redirect("/userlogin")
    });    
});

app.post('/adminedit', function(req, res) {
    const query =  `SELECT * from tourist WHERE origin = $1 ORDER BY NAME ;`
    const user = [`${req.body.name}`];
    pool.query(query , user, (err, results) => {

        if (err) {
            alert(err.message);
            console.error(err);
            return;
        }
        res.render('adminedit', {
            model: results.rows
          });
    });    
});

app.get('/adminedit/:origin', function(req, res) {
    const query =  `SELECT * from tourist WHERE origin = $1 ORDER BY NAME ;`
    const user = [`${req.params.origin}`];
    pool.query(query , user, (err, results) => {

        if (err) {
            alert(err.message);
            console.error(err);
            return;
        }
        res.render('adminedit', {
            model: results.rows
          });
    });    
});

app.get('/updatevacc/:id', function(req, res) {
    const query =  `SELECT * from tourist WHERE id = $1;`
    const user = [req.params.id];
    pool.query(query , user, (err, results) => {
        console.log(user);
        if (err) {
            alert(err.message);
            console.error(err);
            return;
        }
        res.render('uservacc', {
            model: results.rows
          });
    });    
});

app.post('/updatevacc', function(req, res) {
    const query =  `UPDATE tourist SET VACC = $1 WHERE id =$2;`
    const query1 = `SELECT * from tourist WHERE origin = $1 ORDER BY NAME ;;`
    const user = [`${req.body.vacc}`,req.body.id];
    const user1 = [`${req.body.origin}`];
    pool.query(query , user, (err, results) => {
        if (err) {
            alert(err.message);
            console.error(err);
            return;
        }
    });
    pool.query(query1 , user1, (err, results) => {
        if (err) {
            alert(err);
            console.error(err);
            return;
        }
        res.render('adminedit', {
            model: results.rows
          });
    });      
});

app.post('/masteradmin', function(req, res) {
    if(req.body.username == '' || req.body.password == ''){
        res.redirect("/masterlogin");
        alert ("Username and password must be fill")
        return;
    }
    const query =  `SELECT * from masteradmin WHERE username = $1 AND password = $2;`
    const user = [`${req.body.username}`,`${req.body.password}`];
    pool.query(query , user, (err, results) => {
        if(results.rows.length == 0){
            alert ("You are not my master >:(")
            res.redirect("/masterlogin")
        }
        if (err) {
            alert(err.message);
            console.error(err);
            return;
        }
        console.log(results.rows.length);
        res.render('masterdashboard', {
            model: results.rows
          }); 
          console.log(results.rows);   
    });
});


app.listen(5000,()=>{
    console.log("server started at port 5000");
});