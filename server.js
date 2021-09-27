//Step -1 Basic Skeleton

// import express from 'express';

// const app = express();

// app.listen(3000,()=>{
//     console.log('App is running on port 3000');
// })

//routes
// /signin --> POST  --> S /F
// /register --> POST 
// /profile/:userid --> GET
// /image --> POST

//Step - 2
//signin --> POST  --> S /F
// import express from 'express';

// const app = express();

// app.post('/',(req,res)=>{
//     // res.send('siging');
//     res.json('siging');
// })

// app.listen(3000,()=>{
//     console.log('App is running on port 3000');
// })

//Step - 3  --> Practical Example of Signin
import express, { response } from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt-nodejs';
import cors from 'cors';
import knex from 'knex';
import Clarifai from 'clarifai';

const appp = new Clarifai.App({apiKey:'f01ebf1672d94fd2af05a1245e663d56'});

const db = knex({
    client:'pg',
    connection:{
        host:'localhost',
        user:'postgres',
        password:'root',
        database:'project'
    }
});



const app = express();
app.use(cors());
app.use(bodyParser.json());



app.get('/',(req,res)=>{
    res.send(database.users);
})

app.post('/signin',(req,res)=>{



    // res.send('siging');

//     bcrypt.compare("topi", '$2a$10$XRIYzCrSZ7Trxr9/VPqCuOMXnHXOOuAkyrcyK9589AFMbMSFtLkAa', function(err, res) {
//     // res == true
//     console.log(res);
// });


// bcrypt.compare("topii", '$2a$10$XRIYzCrSZ7Trxr9/VPqCuOMXnHXOOuAkyrcyK9589AFMbMSFtLkAa', function(err, res) {
//     // res == true
//     console.log(res);
// });

        const {email,pwd} = req.body;

        if(!email || !pwd){


          return  res.status(400).json('inccorrect form submission');
        }

        db.select('email','hash').from('login').where('email', '=',email )
        .then(data=>{
            const isValid = bcrypt.compareSync(pwd,data[0].hash);
            if(isValid){
                return db.select('*').from('users')
                .where('email','=',email)
                .then(user =>{
                    res.json(user[0])
                    res.send(user[0]);
                }).catch(err=>res.status(400).json('unable to get a user'))

            }
            else{
                res.status(400).json('wrong credentials');
            }
        }).catch(err=> res.status(400).json('wrong credentials'))


});

app.post('/register',(req,res)=>{

    const {email,name,pwd} = req.body;

    //validation / Seurity
    if(!email || !pwd || !name){


        return  res.status(400).json('inccorrect form submission');
      }

    //     bcrypt.hash(pwd, null, null, function(err, hash) {
    //     // Store hash in your password DB.
    //     console.log(hash);
    // });

    // database.users.push({
        
    //     // id:'3',
    //     name:name,
    //     email:email,
    //     pwd:pwd,
    //     entries:0,
    //     jonied: new Date()
    // })


    //  res.json(database.users[(database.users.length)-1]);
    // console.log(database.users);


    //---------DB
    const hash = bcrypt.hashSync(pwd);

    db.transaction(trx =>{
        trx.insert({
            hash: hash,
            email:email
        })
        .into('login')
        .returning('email')
        .then(loginEmail =>{
            return trx('users')
            .returning('*')
            .insert({
                email:loginEmail[0],
                name:name,
                joined:new Date()
            }).then(user =>{
                // res.json(user[0]);
                res.send(user[0]);
            })
        }).then(trx.commit)
            .catch(trx.rollback);
    }).catch(err=>res.status(400).json('unable to register'));
    


    //-----------DB END
    })


app.get('/profile/:id',(req,res)=>{
     const {id} = req.params;
    let found = false;
     database.users.forEach(user=>{
         if(user.id === id){
                found = true;
            return res.json(user);
         }
     })

     if(!found){
         res.status(400).json('not found');
     }

})

app.put('/image',(req,res)=>{
  const {id} = req.body;
  
  db('users').where('id','=',id)
  .increment('entries',1)
  .returning('entries')
  .then(entries=>{
    res.json(entries);
  }).catch(err=>res.status(400).json('unable to get entries'))
})


app.post('/imageurl',(req,res)=>{


    appp.models.predict('a403429f2ddf4b49b307e318f00e528b',req.body.input)
    .then(data=>{
        res.json(data);
    }).catch(err=>res.status(400).json('unable to work with API'))
})

// app.post('/test',(req,res)=>{

//     const {email,name,id} = req.body;

//     db('users').insert({
//             email:email,
//             name :name,
//             id:id,
//             joined:new Date()

//     }).then(response => response.json());

// });


// bcrypt.hash("bacon", null, null, function(err, hash) {
//     // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });


app.listen(4000,()=>{
    console.log('App is running on port 4000');
})

