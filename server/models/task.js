const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    title: { type: String, required: true, maxLength: 100 },
    description: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', requried: true },
    description: { type: String, required: true },
    dateCreated: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    status: { type: String, required: true },
    priority: { type: String, required: true },
    assignees: [ { type: Schema.Types.ObjectId, ref: 'Member', required: true } ]
});

module.exports = mongoose.model('Task', TaskSchema);