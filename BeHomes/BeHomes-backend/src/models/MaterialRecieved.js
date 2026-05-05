const mongoose = require('mongoose');
const Project = require('../models/Project')

const pdfSchema = new mongoose.Schema({
    ProjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project" // Reference to the Pdf model
    },

    mainFile: {
        name: String,
        data: Buffer,
        contentType: String,
    },
    hw: {
        name: String,
        data: Buffer,
        contentType: String,
    },
    wooden: {
        name: String,
        data: Buffer,
        contentType: String,
    },
    lights: {
        name: String,
        data: Buffer,
        contentType: String,
    },
    accessories: {
        name: String,
        data: Buffer,
        contentType: String,
    },
    challan: {
        name: String,
        data: Buffer,
        contentType: String,
    },
    invoice: {
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

module.exports = mongoose.model('MaterialRecievedPdf', pdfSchema);