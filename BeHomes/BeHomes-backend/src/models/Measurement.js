const mongoose = require('mongoose');
const Project = require('./Project')

const pdfSchema = new mongoose.Schema({
    ProjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project" // Reference to the Pdf model
    },
    Main_Upload: {
        name: String,
        data: Buffer,
        svgname: String,
        svgdata: Buffer,
        contentType: String,
    },
    Site_Pic: [
        {
            name: String,
            data: Buffer,
            contentType: String
        }
    ],
    Site_Vid: {
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

module.exports = mongoose.model('Measurement', pdfSchema);