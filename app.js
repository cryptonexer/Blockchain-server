const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config({path:'./secure.env'});
const cors = require('cors');
const User = require('./model/PartyregSchema');
const Admin = require('./model/Adminschema');
const Voter = require('./model/VoterregSchema')
const Jwt = require('jsonwebtoken');
const verifypartyuser = require('./middleware/verifyPartyToken');
const verifyvoter = require('./middleware/verifyVoterToken')
const port = process.env.PORT;


//middleware
app.use(express.json());
app.use(cors());
require('./db/conn');

app.use(express.static("build"));



//party register route
app.post('/api/party/register', async (req,res) => {
   const {Party_name,Candidate_name,Email,Slogan,Description,Password,Cpassword} = req.body;

  if(!Party_name || !Candidate_name || !Email || !Slogan || !Description || !Password || !Cpassword){
    return res.json({Status: 'Please Enter all details'});
  }
  if(Password !== Cpassword){
    return res.json({Status: 'Please Enter Same Password'});
  }
  const Stat = "Inactive";
    
    try {
      const newUser = await User.create({
          Party_name: Party_name,
          Candidate_name: Candidate_name,
          Email: Email,
          Slogan: Slogan,
          Description: Description,
          Password: Password,
          Status: Stat,
          Count: 0
        })

        if(newUser){
          res.json({Status:'ok'});
        }
    } catch (error) {
      if(error) throw error;
      res.json({Status: 'error', error: 'Duplicate email'});
      }    
});


//Party Login route
app.post('/api/party/login' , async (req,res) => {
    const user = await User.findOne({Email: req.body.Email, Password:req.body.Password})

    if(user){
      const token = Jwt.sign({
        Party_name: user.Party_name,
        Candidate_name: user.Candidate_name,
        Email: user.Email,
        Slogan: user.Slogan,
        Description: user.Description,
      },process.env.SECRETKEY,{
        expiresIn: 25892000000
      });

      res.json({Status:'ok', data: {
        token,
        user:{
          id: user._id,
          Email: user.Email
        }
      }});
    }
    else{
      res.json({Status:'error', user: false});
    }
});

//Party Profile route
app.get('/api/party/me', verifypartyuser, async (req,res) => {
  const rootuser = await User.findOne({Email: req.Email});   
  return res.json({data:rootuser});
})


//=============================================================================================================

//admin Userdetails route
app.get('/api/party/details', (req,res) => {
     User.find({}).exec((err, result) => {
    if(err) throw err;
    res.send({data:result});
  })
})


//admin Userdetails route for active users
app.get('/api/activeUsers', (req, res) => {
  const Stat = 'Active';

  User.find({ Status: Stat }).exec((err, result1) => {
    if (err) throw err;
    res.send({ data1: result1 });
  })
});


//admin Userdetails route for Inactive users
app.get('/api/deactiveUsers', (req, res) => {
  const Stat = 'Inactive';

  User.find({ Status: Stat }).exec((err, result2) => {
    if (err) throw err;
    res.send({ data2: result2 });
  })
});


//Admin login route 
app.post('/api/adlogin', async (req, res) => {
  const user = await Admin.findOne({ Email: req.body.Email, Password: req.body.Password })

  if (user) {
    res.json({ Status: 'ok' })
  }
  else {
    res.json({ Status: 'error', user: false });
  }
});

//User Control Route: Activate
app.put('/api/activate', async (req, res) => {
  const id = req.body.id;
  const Stat = "Active";
  const update = await User.findByIdAndUpdate(id, { Status: Stat });

  if (update) {
    res.send({ status: update });
  }
  else {
    res.send({ error: 'Not Updated' });
  }
});


//User Control Route: Deactivate
app.put('/api/deactivate', async (req, res) => {
  const id = req.body.id;
  const Stat = "Inactive";
  const update = await User.findByIdAndUpdate(id, { Status: Stat });

  if (update) {
    res.send({ status: update });
  }
  else {
    res.send({ error: 'Not Updated' });
  }
});


//delete users
app.delete('/api/delete/:id', async (req, res) => {
  const id = req.params.id;
  const remove = await User.findByIdAndRemove(id).exec();

  res.send(remove);
})
//===================================================================

//ADMIN CONTROL FOR VOTERS
app.get('/api/Voter/details', (req,res) => {
  Voter.find({}).exec((err, result) => {
 if(err) throw err;
 res.send({data:result});
})
})

app.get('/api/activeVoters', (req, res) => {
  const Stat = 'Verified';

  Voter.find({ ProfileStatus: Stat }).exec((err, result1) => {
    if (err) throw err;
    res.send({ data1: result1 });
  })
});

app.get('/api/deactiveVoters', (req, res) => {
  const Stat = 'NotVerified';

  Voter.find({ ProfileStatus: Stat }).exec((err, result2) => {
    if (err) throw err;
    res.send({ data2: result2 });
  })
});

app.put('/api/Voter/verify', async (req, res) => {
  const id = req.body.id;
  const Stat = "Verified";
  const update = await Voter.findByIdAndUpdate(id, { ProfileStatus: Stat });

  if (update) {
    res.send({ status: update });
  }
  else {
    res.send({ error: 'Not Updated' });
  }
});

app.put('/api/Voter/decline', async (req, res) => {
  const id = req.body.id;
  const Stat = "NotVerified";
  const update = await Voter.findByIdAndUpdate(id, { ProfileStatus: Stat });

  if (update) {
    res.send({ status: update });
  }
  else {
    res.send({ error: 'Not Updated' });
  }
});



//========================================================================================


//Vote Login Route
app.post("/api/voter/register", async (req, res) =>{
  const {First_name, Last_name, Phone, Email, Address, Taluka, City, Pincode, Aadhar, VoterID, Password, Cpassword} = req.body;

  if(!First_name || !Last_name || !Phone || !Email || !Address || !Taluka || !City || !Pincode || !Aadhar || !VoterID || !Password || !Cpassword)
  {
    return res.json({Status: 'Please Enter all details'});
  }

  if(Password !== Cpassword){
    return res.json({Status: 'Please Enter Same Password'});
  }

  const profileStat = "NotVerified";
  const voteStat = "false"

  try{
    const newVoter = await Voter.create({
      First_name: First_name,
      Last_name: Last_name,
      Phone: Phone,
      Email: Email,
      Address: Address,
      Taluka: Taluka,
      City: City,
      Pincode: Pincode,
      Aadhar: Aadhar,
      VoterID: VoterID,
      Password: Password,
      ProfileStatus: profileStat,
      VoteStatus: voteStat
    })

    if(newVoter){
      res.json({Status: 'ok'});
    }
  }
  catch(error){
    if(error) throw error;
    res.json({Status: 'error', error: 'Duplicate Email'});
  }

});


// Voter Login route
app.post('/api/voter/login', async (req, res) => {
  const voter = await Voter.findOne({Email: req.body.Email, Password: req.body.Password});
  

  if(voter){
     
    const token = Jwt.sign({
      First_name: voter.First_name,
      Last_name: voter.Last_name,
      Email: voter.Email

    },process.env.SECRETKEY,{
      expiresIn: 25892000000
    });
    res.json({Status:'ok', data: {
      token,
      voter:{
        id: voter._id,
        Email: voter.Email
      }
    }});
  }
  else{
    res.json({Status:'error', user: false});
  }
})

//Party Profile route
app.get('/api/voter/me', verifyvoter, async (req,res) => {
  const rootuser = await Voter.findOne({Email: req.Email});   
  return res.json({data:rootuser});
})


app.get('/voteballot/vote/:id', function(req, res){
  const id = req.params.id;
  var i = 1;
  User.findById(id).exec((err, result) => {
    
    var count = result.Count;
    var newcount = count + i;


     User.findByIdAndUpdate(id, {Count: newcount}, function(err, result){
       if(err) throw err;
       console.log(result);
       return res.send({Status: newcount});
     })
     
    
   
  });
  
  

  
})

//===================================================================

//server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})