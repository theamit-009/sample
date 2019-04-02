const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

module.exports = function(passport) {
    passport.use(
      new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        // Match user
              console.log('email  :'+email);
              console.log('password   :'+password);

              const client = new Client({
                connectionString: process.env.DATABASE_URL,
                ssl: true,
              });
            
              client.connect();
            
              client.query('select email,password from users where email=$1;',[email], (err, result) => {
                if (err) throw err;
                
                if(result.rows[0] == null){
                  //request.flash('error','This user is not registerted !');
                  return done(null, false, { message: 'That email is not registered' });
                }
                else{
                     bcrypt.compare(password, result.rows[0].password, function(err, check) {
                     if (err){
                         console.log('Error while checking password...!');
                     return done();
                  }
                  else if (check){
                      return done(null, [{email: result.rows[0].email, name: result.rows[0].name}]);
                  }
                  else{
                  //  request.flash('error','Incorrect Password !');
                     return done(null, false, { message: 'Incorrect Password' });
                  }
                  });
                }
                  

               // response.send(res);
                client.end();
              });


      })
    );

    passport.serializeUser(function(user, done) {
    done(null, user);
    });

    passport.deserializeUser(function(id, done) {
      done(null, user);
  });
};
