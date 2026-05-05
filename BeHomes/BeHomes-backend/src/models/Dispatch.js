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
    freightCharges: {
        type: mongoose.Schema.Types.Decimal128, // Use Decimal128 for precise financial data
        default: 0.00
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

module.exports = mongoose.model('DispatchPdf', pdfSchema);