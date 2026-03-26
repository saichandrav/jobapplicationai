const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  status: { type: String, enum: ['applied', 'interviewing', 'rejected', 'offer'], default: 'applied' },
  appliedAt: { type: Date, default: Date.now },
  notes: { type: String }
});

module.exports = mongoose.model('Application', applicationSchema);
