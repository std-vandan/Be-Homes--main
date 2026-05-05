const express = require('express');
const router = express.Router();
const multer = require('multer');
const Pdf = require('../models/Installation');
const authMiddleware = require("../middlewares/RBAC/authMiddleware");
const rbacMiddleware = require("../middlewares/RBAC/rbacMiddleware");
const ExecutionPlanning = require('../models/ExecutinPlanning')
const Project = require('../models/Project');
const mongoose = require('mongoose')
const stream = require('stream');
const updateProjectStatus = require("../utils/update");


const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png'
    ) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed!'), false); // Reject the file
    }
};


// Configure multer storage
const upload = multer({ fileFilter });


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

        const pdfs = await Pdf.find(query, '-data -mainFile.data');
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

        const files = await Pdf.find(query, '-data -mainFile.data').exec();
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
router.post('/upload/:id', upload.fields([
    { name: 'mainFile', maxCount: 1 }
]), async (req, res) => {
    try {
        const projectid = req.params.id;

        console.log(req.files['mainFile'][0].mimetype);


        // Save original & converted file to MongoDB
        const newPdf = new Pdf({
            ProjectId: projectid,
            mainFile: {
                name: req.files['mainFile'][0].originalname,
                data: req.files['mainFile'][0].buffer,
                contentType: req.files['mainFile'][0].mimetype,
            }
        });


        await newPdf.save();
        res.status(200).json({ message: 'Files uploaded successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error uploading files', error: error.message });
    }
});




// Genric 
const retrieveFile = async (req, res, fileType) => {
    try {
        const file = await Pdf.findById(req.params.id);

        if (!file || !file[fileType] || !file[fileType].data) {
            return res.status(404).send('File not found');
        }

        const { contentType, data } = file[fileType];

        // Only allow PNG, JPEG, and PDF files
        const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];
        if (!allowedTypes.includes(contentType)) {
            return res.status(400).send('Invalid file type for this endpoint');
        }

        res.set('Content-Type', contentType);
        res.status(200).send(data);
    } catch (err) {
        console.error("Error retrieving file:", err);
        res.status(500).send('Error retrieving file');
    }
};

// Dynamic route for all file types
router.get('/view/:fileType/:id', async (req, res) => {
    const { fileType } = req.params;
    const allowedFields = ["mainFile", "challan", "invoice"];

    if (!allowedFields.includes(fileType)) {
        return res.status(400).send('Invalid file type requested');
    }

    await retrieveFile(req, res, fileType);
});

// Download all 
// router.get('/download/all/:id', async (req, res) => {
//     try {
//         // Find the file by ID in the database
//         const file = await Pdf.findById(req.params.id);
//         if (!file) {
//             return res.status(404).send('File not found');
//         }

//         // Prepare an array of files to be included in the ZIP archive
//         const filesToDownload = [];

//         // Check and add the mainFile file
//         if (file.mainFile && file.mainFile.data) {
//             filesToDownload.push({
//                 name: file.mainFile.name,
//                 data: file.mainFile.data,
//                 contentType: file.mainFile.contentType
//             });
//         }

//         // Check and add the challan file
//         if (file.challan && file.challan.data) {
//             filesToDownload.push({
//                 name: file.challan.name,
//                 data: file.challan.data,
//                 contentType: file.challan.contentType
//             });
//         }

//         // Check and add the invoice file
//         if (file.invoice && file.invoice.data) {
//             filesToDownload.push({
//                 name: file.invoice.name,
//                 data: file.invoice.data,
//                 contentType: file.invoice.contentType
//             });
//         }

//         if (file.lights && file.lights.data) {
//             filesToDownload.push({
//                 name: file.lights.name,
//                 data: file.lights.data,
//                 contentType: file.lights.contentType
//             });
//         }
//         if (file.accessories && file.accessories.data) {
//             filesToDownload.push({
//                 name: file.accessories.name,
//                 data: file.accessories.data,
//                 contentType: file.accessories.contentType
//             });
//         }

//         if (filesToDownload.length === 0) {
//             return res.status(400).send('No valid files to download');
//         }

//         // Set up a ZIP archive
//         const archive = archiver('zip', {
//             zlib: { level: 9 } // Compression level
//         });

//         // Set response headers for downloading a ZIP file
//         res.set({
//             'Content-Type': 'application/zip',
//             'Content-Disposition': `attachment; filename="files_${req.params.id}.zip"`,
//         });

//         // Pipe the archive to the response
//         archive.pipe(res);

//         // Add files to the archive
//         for (let fileItem of filesToDownload) {
//             archive.append(fileItem.data, { name: fileItem.name });
//         }

//         // Finalize the archive (important to close the stream)
//         archive.finalize();

//     } catch (err) {
//         console.error("Error:", err);
//         res.status(500).send('Error downloading files');
//     }
// });

// Download mainFile 

// Function to stream file data
const streamFile = async (req, res, fileType) => {
    try {
        const file = await Pdf.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        if (!file[fileType] || !file[fileType].data) {
            return res.status(400).send('Invalid file data');
        }

        const { data, name, contentType } = file[fileType];

        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${name}"`,
            'Content-Length': data.length
        });

        // Create a readable stream from the buffer
        const readable = new stream.PassThrough();
        readable.end(data);

        // Pipe the stream to response (efficient file downloading)
        readable.pipe(res);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).send('Error downloading file');
    }
};

// Dynamic route to handle all file types
router.get('/download/:fileType/:id', async (req, res) => {
    const { fileType } = req.params;
    const allowedFields = ["mainFile", "challan", "invoice"];

    if (!allowedFields.includes(fileType)) {
        return res.status(400).send('Invalid file type requested');
    }

    await streamFile(req, res, fileType);
});




// Updating Status - Finalized by all
router.post("/Finalized/:id", async (req, res) => {
    try {
        const date = new Date().toISOString().split("T")[0];

        // Find the file by ID and update its status
        const file = await Pdf.findByIdAndUpdate(
            req.params.id,
            { status: "Finalized" },
            { new: true }
        );

        if (!file) return res.status(400).json({ msg: "File not found" });

        // Update ExecutionPlanning & fetch project in parallel
        const [execution, project] = await Promise.all([
            ExecutionPlanning.findOneAndUpdate(
                { ProjectId: file.ProjectId },
                { $set: { "Installation.Final_Date": date } },
                { new: true }
            ),
            Project.findById(file.ProjectId)
        ]);

        if (!project) return res.status(400).json({ msg: "Project not found" });

        // If execution has an Execution_date, update project status
        if (execution && execution.Installation.Execution_date) {
            await updateProjectStatus.updateProjectStatus(
                file.ProjectId,
                execution.Installation.Execution_date,
                execution.Installation.Final_Date
            );
        }

        // Move project to the "Installation" stage
        await Project.findByIdAndUpdate(file.ProjectId, {
            currentStage: "Installation",
            $push: { "addedStages": "Installation" },
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

        // Find the file by ID and update its status

        if (!file) return res.status(400).json({ msg: "File not found" });

        // Fetch the associated project
        const project = await Project.findById(file.ProjectId);
        if (!project) return res.status(400).json({ msg: "Project not found" });

        // Ensure that the file's stage matches the project's current stage
        if ("Installation" !== project.currentStage) {
            return res.status(400).json({ msg: "This file cannot be Not-Finalized at the current stage" });
        }

        const updateFile = await Pdf.findByIdAndUpdate(
            req.params.id,
            { status: "Not-Finalized" },
            { new: true }
        );

        // Logic to get current stage
        let CurrentStage = "";
        if (project.addedStages.length < 2) {
            CurrentStage = "Project Started"
        } else {
            CurrentStage = project.addedStages[project.addedStages.length - 2]
        }

        // Proceed with reverting the stage and clearing the final date
        await Promise.all([
            ExecutionPlanning.findOneAndUpdate(
                { ProjectId: file.ProjectId },
                { $set: { "Installation.Final_Date": null } }
            ),
            Project.findByIdAndUpdate(file.ProjectId, {
                $pull: { "addedStages": "Installation" },
                currentStage: CurrentStage,
                new: true
            })
        ]);

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