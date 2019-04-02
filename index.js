const express = require('express')
const expressLayouts = require('express-ejs-layouts');
const app=express();
const path = require('path');
const PORT = process.env.PORT || 5000
const { Client } = require('pg');
const bcrypt=require('bcryptjs');
const dotenv=require('dotenv');
const passport=require('passport');
const flash=require('connect-flash');
const session=require('express-session');

require('./config/passport')(passport);

dotenv.config();
//body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


app.set('views', path.join(__dirname, 'views'))
app.use(expressLayouts);
app.set('view engine','ejs');
app.get('/',(request,response)=>{
 // response.send('Hello Amit');
 response.render('welcome');
})

app.get('/register',(request,response)=>{
  //response.send('Hello Amit');
 response.render('register');
 })


 app.post('/register',(request,response)=>{

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });

  client.connect();

  console.log(request.body);
  const { name, email, password, password2 } = request.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    response.render('register', {
      errors,
      name,
      email
    });
  } else {
    //response.send('Hello');
      var flag=false;
      client.query('select * from users where email=$1;',[email], (err, res) => {
      if (err) throw err;

        for (let row of res.rows) {
          console.log(JSON.stringify(row));
          if(email==row.email){
              flag=true;  
              console.log(typeof(flag));
              console.log(flag);
          }
        }
        console.log('outside if- else block'+flag)
        if(flag==true){
          errors.push({msg:'Email is already registered !'})
          response.render('register', {
            errors,
            name,
            email
          });
        }else{
          console.log('Inside else block'+flag)
          var tpassword;
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
              if (err) throw err;
              tpassword = hash;
              console.log('password Inside Salt block: '+tpassword);
              client.query('insert into users ( NAME,EMAIL, PASSWORD) values ($1,$2,$3);',[name,email,tpassword], (err, res) => {
                if (err) throw err;
    
                request.flash(
                'success_msg',
                'You are now registered and can log in'
                 );
                response.redirect('/login');
                client.end(); 
              });
               
            });
          });
        //  console.log('password : '+tpassword);
         
        }

       // client.end();
      });

      
      
      
      

      /*client.query('insert into users ( NAME,EMAIL, PASSWORD) values ($1,$2,$3);',[name,email,password], (err, res) => {
       if (err) throw err;
 
       response.send(res);
       client.end(); 
       }); */

  }

 })



 //login
 app.get('/login',(request,response)=>{
   
  response.render('login');
 })

 app.post('/login',(request,reponse,next)=>{
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(request, reponse, next);
 })


//create table
app.get('/createtable',(request,response)=>{
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });

  client.connect();

  client.query('CREATE TABLE users(   NAME TEXT ,  EMAIL TEXT , PASSWORD TEXT  );', (err, res) => {
    if (err) throw err;
 
    response.send(res);
    client.end();
  });
})

app.get('/insertrows',(request,response)=>{
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });

  client.connect();

  client.query('INSERT INTO employees( NAME, AGE ) VALUES ($1,$2 );',['Prakhar',24], (err, res) => {
    if (err) throw err;
 /* for (let row of res.rows) {
    console.log(JSON.stringify(row));
  } */
    response.send(res);
    client.end();
  });
})


app.get('/getrows',(request,response)=>{
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });

  client.connect();

  client.query('select name,email,password from users;', (err, res) => {
    if (err) throw err;
 /* for (let row of res.rows) {
    console.log(JSON.stringify(row));
  } */
    response.send(res);
    client.end();
  });
})


app.get('/account',(request,response)=>{
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });

  client.connect();

  client.query('select name,phone from salesforce.account;')
    .then(result => console.log(result))
    .catch(e => console.error(e.stack))
    .then(() => client.end())

  //  response.send(result);
 
})


app.listen(PORT,()=>{console.log(`server is running on port : ${PORT}`)})