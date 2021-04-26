const express = require("express");
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const session = require('express-session');

app.use(session({
  secret: 'shhhhhh',
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

let db = new sqlite3.Database('coworking_registry.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error(err.message);
  }
  
});
db.run('CREATE TABLE IF NOT EXISTS user(id TEXT, full_name TEXT, email_address TEXT, password TEXT, phone TEXT, user_type TEXT)', (result, err) => {
  if (err)
    throw err
});
db.run('CREATE TABLE IF NOT EXISTS property(address TEXT, neighborhood TEXT, square_feet int, parking_garage int, public_transit int', (result, err) => {
  if (err)
    throw err
});
db.run('CREATE TABLE IF NOT EXISTS workspace(p_id int, seats int, smoking int, availability_date TEXT, lease_term TEXT, price REAL', (result, err) => {
  if (err)
    throw err
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth.html', function (req, res) {
  let user;
  if (req.body.redirect == 'register') {
    db.run('INSERT INTO user VALUES("' + req.body.email + '","' + req.body.name + '","' + req.body.email + '","' + req.body.psw + '","' + req.body.phone + '","' + req.body.userType + '")');
    req.session.loggedin = true;
    req.session.userID = req.body.email;
    req.session.userType = req.body.userType;
    res.redirect('/home');
  }
  if (req.body.redirect == 'login') {
    db.get('SELECT * FROM user WHERE id = ? AND password = ?', [req.body.email, req.body.psw], (err, row) => {
      if (err)
        throw err;
      if (row != null) {
        req.session.loggedin = true;
        req.session.userType = row.user_type;
        req.session.userID = row.id;
        res.redirect('/home');
      } else
        res.send('Invalid login');
    });
  }
});

app.get('/home', function (req, res) {
  if (req.session.loggedin) {
    res.sendFile(path.join(__dirname + '/home.html'));
  } else {
    res.redirect('/login');
  }
});

app.get('/user', function (req, res) {
  res.json(req.session);
});

app.get('/owner', function (req, res) {
  if (req.query != null) {

  }
});

app.get('/add-property', function (req, res){
  if(req.query.id != null){
    res.write('<script>let id = ' + req.query.id + '</script>');
  }
  res.sendFile(path.join(__dirname + '/add-property.html'));
})

app.post('/add-property', function (req, res) {
  if (req.body.id == null) {
    db.run('INSERT INTO property VALUES("' + req.body.address + '","' + req.body.neighbourhood + '","' + req.body.squareFeet + '","' + req.body.parkingGarage + '","' + req.body.publicTransit + '")', (result, err) => {
      if (err)
        throw err
    });
  } else {
    let b = req.body;
    db.run('UPDATE user SET address = ?, neighborhood = ?, square_feet = ?, parking_garage = ?, public_transit = ? WHERE id = ?', [b.address, b.neighbourhood, b.squareFeet, b.parkingGarage, b.publicTransit, b.id], (result, err) => {
      if (err)
        throw err
    });
  }
  res.redirect('/home.html');
});

var server = app.listen(8000, () => {
  console.log("Server listening on Port ", server.address().port)
});

/*** Array store instead of db
let users = [];

app.post('/auth.html', function (req, res) {
  if(req.body.redirect == 'register'){
    let user = {id: req.body.email, email: req.body.email, password: req.body.psw, userType: req.body.userType};
    users.push(user);
    req.session.loggedin = true;
    req.session.userID = id;
    req.session.userType = req.body.userType;
    res.redirect('/home');
  }
  if(req.body.redirect == 'login'){
    let userCheck = false;
    let curUser;
    users.forEach(user => {
      if(user.email == req.body.email && user.password == req.body.psw)
      curUser = user;
      userCheck = true;
    });
    if(userCheck){
      req.session.loggedin = true;
      req.session.userType = curUser.userType;
      req.session.userID = curUser.id;
      res.redirect('/home');
    }
      else
      res.send('Invalid login');
  }
});
*/