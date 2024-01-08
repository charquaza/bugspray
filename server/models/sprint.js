const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SprintSchema = new Schema({
   name: { type: String, required: true, maxLength: 100 },
   description: { type: String, required: true },
   project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
   startDate: { type: Date, required: true },
   endDate: { type: Date, required: true }
});

module.exports = mongoose.model('Sprint', SprintSchema);