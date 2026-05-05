const express = require('express')
const Payment = require('../models/Payment')
const router = express.Router();
const authMiddleware = require("../middlewares/RBAC/authMiddleware");
const rbacMiddleware = require("../middlewares/RBAC/rbacMiddleware");
const mongoose = require('mongoose');


router.get('/view', async (req, res) => {
    try {
        const file = await Payment.find();

        if (!file) {
            return res.status(404).send('File not found');
        }

        res.json({ msg: 'Success', files: file });

    } catch (err) {
        res.status(500).send('Error retrieving file from database');
    }
});

router.get('/overdue', async (req, res) => {
    try {
        const today = new Date();

        const overduePayments = await Payment.find({
            status: "Pending",
            // dueDate: { $lt: today } // Finds payments where dueDate is in the past
        });

        if (overduePayments.length === 0) {
            return res.status(404).json({ msg: 'No overdue payments found' });
        }

        res.json({ msg: 'Success', payments: overduePayments });

    } catch (err) {
        console.error("Error retrieving overdue payments:", err);
        res.status(500).json({ error: 'Error retrieving overdue payments' });
    }
});



router.get('/view/:id', async (req, res) => {
    try {
        const response = await Payment.findById(req.params.id);


        if (!response) {
            return res.status(404).send('File not found');
        }
        res.status(200).json({ msg: 'Success', response: response });

    } catch (err) {
        res.status(500).send('Error retrieving file from database');
    }
});
router.get('/view/proj/:id', async (req, res) => {
    const id = req.params.id;
    try {

        const query = {};
        // console.log(id);
        if (mongoose.Types.ObjectId.isValid(id)) {
            query.ProjectId = id;
        } else {
            query.projectId = id;
        }

        const files = await Payment.find(query).exec();
        res.status(200).json({
            files: files,
            message: 'Success'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error });
    }
});


router.post('/create/:id', (req, res) => {
    try {
        const Projid = req.params.id;
        Payment.create({
            ProjectId: Projid,
            paymentType: req.body.paymentType,
            createdDate: req.body.createdDate,
            updatedDate: req.body.updatedDate,
            status: req.body.status,
            PaymentMethod: req.body.PaymentMethod,
            transactionDetails: {
                amount: req.body.transactionDetails.amount,
                date: req.body.date,
                cashDetails: {
                    clientName: req.body.clientName
                },
                chequeDetails: {
                    clientName: req.body.clientName,
                    bank: req.body.bank,
                    branch: req.body.branch,
                    city: req.body.city,
                    chequeNo: req.body.chequeNo,
                    chequeAt: req.body.chequeAt
                },
                onlineDetails: {
                    clientName: req.body.clientName,
                    transactionId: req.body.transactionId,
                    bank: req.body.bank
                }
            }
        });
        res.json({ msg: 'Success' })

    } catch (err) {
        console.log(err.message);
        res.json({ msg: err.message })
    }
})

router.put('/edit/:id', (req, res) => {
    try {
        const id = req.params.id

        const query = {};
        console.log(id);
        if (mongoose.Types.ObjectId.isValid(id)) {
            query._id = id;
        } else {
            query.projectId = id;
        }

        const response = Payment.findByIdAndUpdate(query, req.body)
        if (!response) { res.json({ msg: 'Payment not found' }) }

        res.json({ msg: 'Success' })
    } catch (error) {
        console.log(err.message);
        res.json({ msg: err.message })
    }
})

router.delete('/delete/:id', (req, res) => {
    try {
        const id = req.params.id

        const query = {};
        console.log(id);
        if (mongoose.Types.ObjectId.isValid(id)) {
            query._id = id;
        } else {
            query.projectId = id;
        }

        const response = Payment.findByIdAndDelete(query)
        if (!response) { res.json({ msg: 'Payment not found' }) }

        res.json({ msg: 'Success' })
    } catch (error) {
        console.log(err.message);
        res.json({ msg: err.message })
    }
})


module.exports = router