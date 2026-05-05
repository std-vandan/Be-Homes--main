const mongoose = require('mongoose');
const Project = require('../models/Project')
const User = require('../models/User')

const paymentSchema = new mongoose.Schema({
    ProjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project" // Reference to the Pdf model
    },
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" // Reference to the Pdf model
    },
    // paymentType: {
    //     type: String,
    //     enum: ['Advance', 'Regular'],
    //     required: true
    // },
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
        type: Date,
        default: Date.now
    },
    // status: {
    //     type: String,
    //     enum: ['Pending', 'Completed', 'Failed'],
    //     default: 'Pending'
    // },
    PaymentMethod: {
        type: String,
        enum: ["Cash", "Cheque", "Online"],
        required: true
    },
    transactionDetails: {
        amount: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            required: true,
            default: Date.now
        },
        cashDetails: {
            clientName: {
                type: String
            }
        },
        chequeDetails: {
            clientName: {
                type: String
            },
            bank: {
                type: String
            },
            branch: {
                type: String
            },
            city: {
                type: String
            },
            chequeNo: {
                type: String
            },
            chequeAt: {
                type: Date,
                default: Date.now
            }
        },
        onlineDetails: {
            clientName: {
                type: String
            },
            transactionId: {
                type: String
            },
            bank: {
                type: String
            }
        }
    }
});

// Pre-save validation to enforce required fields based on paymentMethod
paymentSchema.pre('validate', function (next) {
    if (this.paymentMethod === 'Cash' && !this.transactionDetails.cashDetails.clientName) {
        return next(new Error('Client Name is required for Cash payment.'));
    }
    if (this.paymentMethod === 'Cheque') {
        const chequeFields = ['clientName', 'bank', 'branch', 'city', 'chequeNo', 'chequeAt'];
        for (const field of chequeFields) {
            if (!this.transactionDetails.chequeDetails[field]) {
                return next(new Error(`${field} is required for Cheque payment.`));
            }
        }
    }
    if (this.paymentMethod === 'Online') {
        const onlineFields = ['clientName', 'transactionId', 'bank'];
        for (const field of onlineFields) {
            if (!this.transactionDetails.onlineDetails[field]) {
                return next(new Error(`${field} is required for Online payment.`));
            }
        }
    }
    next();
});


module.exports = mongoose.model('Payment', paymentSchema);