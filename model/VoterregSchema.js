const mongoose = require('mongoose');

const VoterregSchema = new mongoose.Schema({
      First_name: {
            type: String,
            required:true
      },

      Last_name:{
            type: String,
            required: true
      },

      Phone:{
            type: Number,
            required: true
      },

      Email:{
            type: String,
            required: true,
            unique: true
      },

      Address:{
            type: String,
            required: true
      },

      Taluka:{
            type: String,
            required: true
      },

      City:{
            type: String,
            required: true
      },

      Pincode:{
            type: Number,
            required: true
      },

      Aadhar:{
            type: Number,
            required: true,
            unique: true
      },

      VoterID:{
            type: Number,
            required: true,
            unique: true
      },

      Password:{
            type: String,
            required: true
      },

      ProfileStatus:{
            type: String,
            required: true
      },

      VoteStatus:{
            type: String,
            required: true
      }

      
})


const Voterreg = mongoose.model('voters',VoterregSchema);

module.exports = Voterreg;