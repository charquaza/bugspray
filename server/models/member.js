const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MemberSchema = new Schema({
    firstName: { type: String, required: true, maxLength: 100 },
    lastName: { type: String, required: true, maxLength: 100 },
    dateJoined: { type: Date, required: true },
    role: { type: String, required: true, maxLength: 100 },
    privilege: { type: String, required: true, enum: [ 'admin', 'user' ] },
    username: { type: String, required: true, maxLength: 100 },
    password: { type: String, required: true, maxLength: 100 },
    slackMemberId: { type: String, maxLength: 50 }
});

module.exports = mongoose.model('Member', MemberSchema);