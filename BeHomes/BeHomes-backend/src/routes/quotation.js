const express = require('express');
const router = express.Router();
const multer = require('multer');
const Pdf = require('../models/Quotation');
const authMiddleware = require("../middlewares/RBAC/authMiddleware");
const rbacMiddleware = require("../middlewares/RBAC/rbacMiddleware");
const ExecutionPlanning = require('../models/ExecutinPlanning')
const Project = require('../models/Project')
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose')
const updateProjectStatus = require("../utils/update");

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf', '') {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type. Only PDFs are allowed!'), false); // Reject the file
    }
};

// Configure multer storage
const upload = multer({
    // fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});


// Get all PDFs without buffer data
router.get('/all', async (req, res) => {
    try {
        const pdfs = await Pdf.find({}, '-data');
        res.status(200).json(pdfs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching PDFs', error: error.message });
    }
});



// History of the document 
router.get('/history/:id', async (req, res) => {
    const id = req.params.id;
    try {

        const query = {};
        // console.log(id);
        if (mongoose.Types.ObjectId.isValid(id)) {
            query.ProjectId = id;
        } else {
            query.projectId = id;
        }
        const File = await Pdf.find(query, "createdDate ProjectId"); // Fetch one document, including only the uploadDate field
        res.status(200).json(File); // Respond with the found document
    } catch (error) {
        res.status(500).json({ message: 'Error fetching PDFs', error: error.message });
    }
});

// Get specific PDFs without buffer data
router.get('/files/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const query = {};
        // console.log(id);
        if (mongoose.Types.ObjectId.isValid(id)) {
            query._id = id;
        } else {
            query.projectId = id;
        }
        console.log(query);

        const pdfs = await Pdf.find(query, '-data');
        res.status(200).json(pdfs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching PDFs', error: error.message });
    }
});

// Get specific PDFs without buffer data through project ID
router.get('/files/proj/:id', async (req, res) => {
    const id = req.params.id;
    try {

        const query = {};
        // console.log(id);
        if (mongoose.Types.ObjectId.isValid(id)) {
            query.ProjectId = id;
        } else {
            query.projectId = id;
        }
        console.log(query);

        const files = await Pdf.find(query, '-data').exec();
        res.status(200).json({
            files: files,
            message: 'Success'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error retrieving files' });
    }
});

// Handle file upload
router.post('/upload/:id', upload.single('File'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const Extension_Name = path.extname(req.file.originalname).toLowerCase();


        const Projid = req.params.id;

        if ([".pdf", ".png", ".jpeg", ".jpg"].includes(Extension_Name)) {
            const newPdf = new Pdf({
                name: req.file.originalname,
                data: req.file.buffer,
                contentType: req.file.mimetype,
                quotedValue: req.body.quotedValue,
                ProjectId: Projid
            });

            await newPdf.save();
            return res.status(200).send({ message: 'Success' });
        }

        res.status(400).json({ error: 'Unsupported file type' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});



// Endpoint to retrieve and serve PDF file
router.get('/view/:id', async (req, res) => {
    try {
        const file = await Pdf.findById(req.params.id);
        console.log(file);

        if (!file) {
            return res.status(404).send('File not found');
        }

        let fileData, contentType;

        if (file && file.data) {
            contentType = file.contentType;
            fileData = file.data;
        } else {
            return res.status(404).send('No valid file found');
        }

        // If DWG was converted, serve the SVG instead
        if (contentType === "image/vnd.dwg" && file.svgFileData) {
            contentType = "image/svg+xml";
            fileData = file.svgFileData;
        }

        // Ensure only allowed file types are served
        const allowedTypes = ["application/pdf", "image/svg+xml", "image/jpeg", "image/png"];
        if (!allowedTypes.includes(contentType)) {
            return res.status(400).send('Invalid file type for this endpoint');
        }

        res.set('Content-Type', contentType);
        res.status(200).send(fileData);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).send('Error retrieving file');
    }
});


// // Route to download the PDF file
router.get('/download/:id', async (req, res) => {
    try {
        // Find the file by ID in the database
        const file = await Pdf.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        // Ensure the file exists and has data to download
        if (!file || !file.data) {
            return res.status(400).send('Invalid file data');
        }

        const fileData = file.data;
        const fileName = file.name;
        const contentType = file.contentType;

        // Set appropriate headers for file download
        res.set({
            'Content-Type': contentType, // MIME type of the file (PDF, image, video, etc.)
            'Content-Disposition': `attachment; filename="${fileName}"`, // Force download with the original filename
            'Content-Length': fileData.length // Size of the file
        });

        // Send the file as a response (download it)
        res.status(200).send(fileData);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).send('Error downloading file');
    }
});



// Updating Status - Finalized by all
router.post("/Finalized/:id", async (req, res) => {
    try {
        const date = new Date().toISOString().split("T")[0];
        const file = await Pdf.findByIdAndUpdate(req.params.id, { status: "Finalized" }, { new: true });

        if (!file) return res.status(400).json({ msg: "File not found" });

        // Update ExecutionPlanning & fetch project in parallel
        const [execution, project] = await Promise.all([
            ExecutionPlanning.findOneAndUpdate(
                { ProjectId: file.ProjectId },
                { $set: { "Quotation.Final_Date": date } },
                { new: true }
            ),
            Project.findById(file.ProjectId)
        ]);

        if (execution && execution.Quotation.Execution_date) {
            await updateProjectStatus.updateProjectStatus(
                file.ProjectId,
                execution.Quotation.Execution_date,
                execution.Quotation.Final_Date
            );
        }

        await Project.findByIdAndUpdate(file.ProjectId, {
            quotedValue: file.quotedValue,
            projectCategory: "Project",
            currentStage: "Quotation",
            $push: { "addedStages": "Quotation" },
            new: true
        });

        res.status(200).json({ msg: "Success" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: err.message || "Something went wrong" });
    }
});

// Updating Status - Not-Finalized by only admin
router.post("/Not-Finalized/:id", async (req, res) => {
    try {
        const file = await Pdf.findById(req.params.id);


        if (!file) return res.status(400).json({ msg: "File not found" });

        const project = await Project.findById(file.ProjectId);
        if (!project) return res.status(400).json({ msg: "Project not found" });

        if ("Quotation" !== project.currentStage) {
            return res.status(400).json({ msg: "This file cannot be Not-Finalized at the current stage" });
        }
        const updatedFile = await Pdf.findByIdAndUpdate(req.params.id, { status: "Not-Finalized" }, { new: true });

        // Logic to get current stage
        let CurrentStage = "";
        if (project.addedStages.length < 2) {
            CurrentStage = "Project Started"
        } else {
            CurrentStage = project.addedStages[project.addedStages.length - 2]
        }
        await Promise.all([
            ExecutionPlanning.findOneAndUpdate(
                { ProjectId: file.ProjectId },
                { $set: { "Quotation.Final_Date": null } }
            ),
            Project.findByIdAndUpdate(file.ProjectId, {
                quotedValue: null,
                projectCategory: "Prospect",
                $pull: { "addedStages": "Quotation" },
                currentStage: CurrentStage,
                new: true
            })
        ]);
        console.log(project.addedStages, project.addedStages.length, CurrentStage,);


        res.status(200).json({ msg: "Success" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: err.message || "Something went wrong" });
    }
});

// Updating Status
router.delete("/delete/:id", async (req, res) => {
    try {
        const file = await Pdf.findByIdAndDelete(req.params.id)
        if (!file) { return res.status(400).json(msg = "File not found") }
        res.status(200).json(msg = "Success")
    } catch (err) {
        console.log(err.message);
        res.status(500).json(msg = err.message || "Something went wrong")
    }
})





module.exports = router;