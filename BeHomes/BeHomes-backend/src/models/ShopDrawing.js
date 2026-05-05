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
    elevationFile: {
        name: String,
        data: Buffer,
        contentType: String,
    },
    sectionFile: {
        name: String,
        data: Buffer,
        contentType: String,
    },
    isoFile: {
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

module.exports = mongoose.model('ShopDrawing', fileSchema);