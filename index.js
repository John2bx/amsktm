const express = require('express')
const bcrypt = require('bcrypt')
const app = express()
app.listen(4001, () => console.log('Express API listening on port 4001'))
const { Client } = require('pg')

const Sequelize = require('sequelize')
const sequelize = new Sequelize('postgres://postgres:secret@localhost:5432/postgres')

const User = sequelize.define('users', {
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
}, {
  tableName: 'users'
})
User.sync()

const Clients = sequelize.define('clients', {
  name: Sequelize.STRING,
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  address: Sequelize.TEXT,
  dateOfBirth: Sequelize.DATE
}
 , {
  tableName: 'cients'
})
User.sync()

const Candidate = sequelize.define('candidates', {
  name: Sequelize.STRING,
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  address: Sequelize.TEXT,
  dateOfBirth: Sequelize.DATE
}, {
    tableName: 'candidates'
  })

Candidate.sync()
const jwt = require('jsonwebtoken')

const secret = process.env.JWT_SECRET || 'e9rp^&^*&@9sejg)DSUA)jpfds8394jdsfn,m'

function toJWT(data) {
  return jwt.sign(data, secret, { expiresIn: '2h' })
}

function toData(token) {
  return jwt.verify(token, secret)
}

module.exports = { toJWT, toData }
function auth(req, res, next) {
  const auth = req.headers.authorization && req.headers.authorization.split(' ')
  if (auth && auth[0] === 'Bearer' && auth[1]) {
    try {
      const data = toData(auth[1])
      User
        .findById(data.userId)
        .then(user => {
          if (!user) return next('User does not exist')

          req.user = user
          next()
        })
        .catch(next)
    }
    catch(error) {
      res.status(400).send({
        message: `Error ${error.name}: ${error.message}`,
      })
    }
  }
  else {
    res.status(401).send({
      message: 'Please supply some valid credentials'
    })
  }
}


app.get('/do-something', (request, response) => {
  response.send(`I'll do something, I promise!`)
})

app.get('/candidates', function (req, res, next) {
  Candidate.findAll()
    .then(candidates => {
      res.json({ candidates: candidates })
    })
    .catch(err => {
      res.status(500).json({
        message: 'Something went wrong',
        error: err
      })
    })
})
app.get('/candidates/:id',auth, function (req, res, next) {
  candidateId = req.param.id
  Candidate.findByPk(candidateId)
    .then(candidate => {
      res.json({ candidate: candidate })
    })
    .catch(err => {
      res.status(500).json({
        message: 'Something went wrong',
        error: err
      })
    })
})
const bodyParser = require('body-parser')
app.use(bodyParser.json())

app.post('/candidates', function (req, res) {
  Candidate.create({
    name: 'ekelmans',
    firstName: 'ahouiiii',
    lastName: 'ahouiiii',
    address: 'ADRESJJJEEEEE',
    dateOfBirth: 1553275939
  }).then(candidate => res.status(201).json(candidate))
    .catch(err => {
      res.status(500).json({
        message: 'Something went wrong',
        error: err
      })
    })
})




app.post('/signup', function (req, res) {
  User.create({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }).then(user => res.json(200, {user: user.email}))
    .catch(err => {
      res.status(500).json({
        message: 'Something went wrong',
        error: err
      })
    })
})
app.post('/login', (req, res) => {
  const email = req.body.email
  const password = req.body.password

  if (!email || !password) {
    res.status(400).send({
      message: 'Please supply a valid email and password'
    })
  }
  else {
 // 1. find user based on email address
User
.findOne({
  where: {
    email: req.body.email
  }
})
.then(entity => {
  if (!entity) {
    res.status(400).send({
      message: 'User with that email does not exist'
    })
  }

  // 2. use bcrypt.compareSync to check the password against the stored hash
  if (bcrypt.compareSync(req.body.password, entity.password)) {

    // 3. if the password is correct, return a JWT with the userId of the user (user.id)
    res.send({
      jwt: toJWT({ userId: entity.id })
    })
  }
  else {
    res.status(400).send({
      message: 'Password was incorrect'
    })
  }
})
.catch(err => {
  console.error(err)
  res.status(500).send({
    message: 'Something went wrong'
  })
})

  }
})


const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');
let transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  secure: "true",
  port: "465",
  auth: {
  type: "OAuth2", //Authentication type
  user: "your_email@service.com", //For example, xyz@gmail.com
  clientId: "Your_ClientID",
  clientSecret: "Client_Secret",
  refreshToken: "Refresh_Token"
       }
  });

  let mailOptions = {
    from: "your_email@service.com",
    to: "receiver_email@service.com",
    subject: "This is subject",
    text: "This is email content"};
  var Imap = require("imap"),
    inspect = require("util").inspect;
var fs = require("fs"), fileStream;

var imap = new Imap({
  user: "john9@dewerkshop.info",
  password: "Werkshop01",
  host: "xis24.xenat.com",
  port: 993,
  tls: true
  });

function openInbox(cb) {
imap.openBox("INBOX", true, cb);
  }
imap.once("ready", function() {
openInbox(function(err, box) {
if (err) throw err;
imap.search([ "UNSEEN", ["SINCE", "June 15, 2018"] ], function(err, results) {
if (err) throw err;
var f = imap.fetch(results, { bodies: "" });
f.on("message", function(msg, seqno) {
console.log("Message #%d", seqno);
var prefix = "(#’ + seqno + ‘) ";
msg.on("body", function(stream, info) {
console.log(prefix + "Body");
stream.pipe(fs.createWriteStream("msg-" + seqno + "-body.txt"));
});
msg.once("attributes", function(attrs) {
console.log(prefix + "Attributes: %s", inspect(attrs, false, 8));
});
msg.once("end", function() {
console.log(prefix + "Finished");
});
});
f.once("error", function(err) {
console.log("Fetch error: " + err);
});
f.once("end", function() {
console.log("Done fetching all messages!");
imap.end();});
    });
  });
});
imap.once("error", function(err) {
console.log(err);
});
imap.once("end", function() {
console.log("Connection ended");
});
imap.connect();

const Pop3Command = require('node-pop3');
 
const pop3 = new Pop3Command({
  user: 'john9@dewerkshop.info',
  password: 'Werkshop01',
  host: 'xis24.xenat.com',
})

const msgNum = 1;

// pop3.RETR(msgNum)
// .then((stream) => {
//   // deal with mail stream
// })
// .then(() => pop3.QUIT());

pop3.UIDL()
.then((list) => console.dir(list));

