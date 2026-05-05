const mongoose = require('mongoose');
const Project = require('../models/Project')

const fileSchema = new mongoose.Schema({
    ProjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project" // Reference to the Pdf model
    },

    mainFile: {
        name: String,
        data: Buffer,
        svgname: String,
        svgdata: Buffer,
        contentType: String,
    },
    elec: {
        name: String,
        data: Buffer,
        contentType: String,
    },
    plumb: {
        name: String,
        data: Buffer,
        contentType: String,
    },
    civ: {
        name: String,
        data: Buffer,
        contentType: String,
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: [
            "Finalized",
            "Not-Finalized"
        ],
        default: "Not-Finalized"
    }
});

module.exports = mongoose.model('WorkingDrawing', fileSchema);