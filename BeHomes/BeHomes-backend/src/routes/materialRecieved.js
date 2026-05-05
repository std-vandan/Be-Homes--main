const express = require('express');
const router = express.Router();
const multer = require('multer');
const Pdf = require('../models/MaterialRecieved');
const authMiddleware = require("../middlewares/RBAC/authMiddleware");
const rbacMiddleware = require("../middlewares/RBAC/rbacMiddleware");
const archiver = require('archiver');
const ExecutionPlanning = require('../models/ExecutinPlanning')
const Project = require('../models/Project');
const updateProjectStatus = require("../utils/update");
const mongoose = require('mongoose')

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

        const pdfs = await Pdf.find(query, '-data -mainFile.data -hw.data -wooden.data -lights.data -accessories.data  -challan.data -accessories.data');
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

        const files = await Pdf.find(query, '-data -mainFile.data -hw.data -wooden.data -lights.data -accessories.data  -challan.data -invoice.data').exec();
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
    { name: 'mainFile', maxCount: 1 },
    { name: 'hw', maxCount: 1 },
    { name: 'wooden', maxCount: 1 },
    { name: 'lights', maxCount: 1 },
    { name: 'accessories', maxCount: 1 },
    { name: 'challan', maxCount: 1 },
    { name: 'invoice', maxCount: 1 }
]), async (req, res) => {
    try {
        console.log("Upload 1");

        const projectid = req.params.id;

        console.log(req.files['mainFile'][0].mimetype);



        // Save original & converted file to MongoDB
        const newPdf = new Pdf({
            mainFile: {
                name: req.files['mainFile'][0].originalname,
                data: req.files['mainFile'][0].buffer,
                contentType: req.files['mainFile'][0].mimetype,
            },
            hw: req.files['hw']
                ? {
                    name: req.files['hw'][0].originalname,
                    data: req.files['hw'][0].buffer,
                    contentType: req.files['hw'][0].mimetype,
                }
                : undefined,  // ✅ Optional: Only add if exists
            wooden: req.files['wooden']
                ? {
                    name: req.files['wooden'][0].originalname,
                    data: req.files['wooden'][0].buffer,
                    contentType: req.files['wooden'][0].mimetype,
                }
                : undefined,  // ✅ Optional: Only add if exists
            lights: req.files['lights']
                ? {
                    name: req.files['lights'][0].originalname,
                    data: req.files['lights'][0].buffer,
                    contentType: req.files['lights'][0].mimetype,
                }
                : undefined,  // ✅ Optional: Only add if exists
            accessories: req.files['accessories']
                ? {
                    name: req.files['accessories'][0].originalname,
                    data: req.files['accessories'][0].buffer,
                    contentType: req.files['accessories'][0].mimetype,
                }
                : undefined,  // ✅ Optional: Only add if exists
            challan: req.files['challan']
                ? {
                    name: req.files['challan'][0].originalname,
                    data: req.files['challan'][0].buffer,
                    contentType: req.files['challan'][0].mimetype,
                }
                : undefined,  // ✅ Optional: Only add if exists
            invoice: req.files['invoice']
                ? {
                    name: req.files['invoice'][0].originalname,
                    data: req.files['invoice'][0].buffer,
                    contentType: req.files['invoice'][0].mimetype,
                }
                : undefined,  // ✅ Optional: Only add if exists
            ProjectId: projectid
        });


        await newPdf.save();
        res.status(200).json({ message: 'Files uploaded successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error uploading files', error: error.message });
    }
});


// Main View
router.get('/view/mainFile/:id', async (req, res) => {
    try {
        const file = await Pdf.findById(req.params.id);
        console.log(file.mainFile.svgname);

        if (!file) {
            return res.status(404).send('File not found');
        }

        let fileData, contentType;

        if (file.mainFile && file.mainFile.data) {
            contentType = file.mainFile.contentType;
            fileData = file.mainFile.data;
        } else {
            return res.status(404).send('No valid file found');
        }


        // Ensure only PNG & JPEG files are served here
        if (contentType !== "image/png" && contentType !== "image/jpeg" && contentType !== "application/pdf") {
            return res.status(400).send('Invalid file type for this endpoint');
        }

        res.set('Content-Type', contentType);
        res.status(200).send(fileData);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).send('Error retrieving file');
    }
});

// hw view
router.get('/view/hw/:id', async (req, res) => {
    try {
        const file = await Pdf.findById(req.params.id);
        console.log(file.hw.name);

        if (!file) {
            return res.status(404).send('File not found');
        }

        let fileData, contentType;

        if (file.hw && file.hw.data) {
            contentType = file.hw.contentType;
            fileData = file.hw.data;
        } else {
            return res.status(404).send('No valid file found');
        }

        // Ensure only PNG & JPEG files are served here
        if (contentType !== "image/png" && contentType !== "image/jpeg" && contentType !== "application/pdf") {
            return res.status(400).send('Invalid file type for this endpoint');
        }

        res.set('Content-Type', contentType);
        res.status(200).send(fileData);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).send('Error retrieving file');
    }
});

// Site Pic view
router.get('/view/wooden/:id', async (req, res) => {
    try {
        const file = await Pdf.findById(req.params.id);
        console.log(file.wooden.name);

        if (!file) {
            return res.status(404).send('File not found');
        }

        let fileData, contentType;

        if (file.wooden && file.wooden.data) {
            contentType = file.wooden.contentType;
            fileData = file.wooden.data;
        } else {
            return res.status(404).send('No valid file found');
        }

        // Ensure only PNG & JPEG files are served here
        if (contentType !== "image/png" && contentType !== "image/jpeg" && contentType !== "application/pdf") {
            return res.status(400).send('Invalid file type for this endpoint');
        }

        res.set('Content-Type', contentType);
        res.status(200).send(fileData);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).send('Error retrieving file');
    }
});
// Site Pic view
router.get('/view/lights/:id', async (req, res) => {
    try {
        const file = await Pdf.findById(req.params.id);
        console.log(file.lights.name);

        if (!file) {
            return res.status(404).send('File not found');
        }

        let fileData, contentType;

        if (file.lights && file.lights.data) {
            contentType = file.lights.contentType;
            fileData = file.lights.data;
        } else {
            return res.status(404).send('No valid file found');
        }

        // Ensure only PNG & JPEG files are served here
        if (contentType !== "image/png" && contentType !== "image/jpeg" && contentType !== "application/pdf") {
            return res.status(400).send('Invalid file type for this endpoint');
        }

        res.set('Content-Type', contentType);
        res.status(200).send(fileData);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).send('Error retrieving file');
    }
});
// Site Pic view
router.get('/view/accessories/:id', async (req, res) => {
    try {
        const file = await Pdf.findById(req.params.id);
        console.log(file.accessories.name);

        if (!file) {
            return res.status(404).send('File not found');
        }

        let fileData, contentType;

        if (file.accessories && file.accessories.data) {
            contentType = file.accessories.contentType;
            fileData = file.accessories.data;
        } else {
            return res.status(404).send('No valid file found');
        }

        // Ensure only PNG & JPEG files are served here
        if (contentType !== "image/png" && contentType !== "image/jpeg" && contentType !== "application/pdf") {
            return res.status(400).send('Invalid file type for this endpoint');
        }

        res.set('Content-Type', contentType);
        res.status(200).send(fileData);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).send('Error retrieving file');
    }
});
router.get('/view/challan/:id', async (req, res) => {
    try {
        const file = await Pdf.findById(req.params.id);
        console.log(file.challan.name);

        if (!file) {
            return res.status(404).send('File not found');
        }

        let fileData, contentType;

        if (file.challan && file.challan.data) {
            contentType = file.challan.contentType;
            fileData = file.challan.data;
        } else {
            return res.status(404).send('No valid file found');
        }

        // Ensure only PNG & JPEG files are served here
        if (contentType !== "image/png" && contentType !== "image/jpeg" && contentType !== "application/pdf") {
            return res.status(400).send('Invalid file type for this endpoint');
        }

        res.set('Content-Type', contentType);
        res.status(200).send(fileData);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).send('Error retrieving file');
    }
});
// Site Pic view
router.get('/view/invoice/:id', async (req, res) => {
    try {
        const file = await Pdf.findById(req.params.id);
        console.log(file.invoice.name);

        if (!file) {
            return res.status(404).send('File not found');
        }

        let fileData, contentType;

        if (file.invoice && file.invoice.data) {
            contentType = file.invoice.contentType;
            fileData = file.invoice.data;
        } else {
            return res.status(404).send('No valid file found');
        }

        // Ensure only PNG & JPEG files are served here
        if (contentType !== "image/png" && contentType !== "image/jpeg" && contentType !== "application/pdf") {
            return res.status(400).send('Invalid file type for this endpoint');
        }

        res.set('Content-Type', contentType);
        res.status(200).send(fileData);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).send('Error retrieving file');
    }
});


// Download all 
router.get('/download/all/:id', async (req, res) => {
    try {
        // Find the file by ID in the database
        const file = await Pdf.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        // Prepare an array of files to be included in the ZIP archive
        const filesToDownload = [];

        // Check and add the mainFile file
        if (file.mainFile && file.mainFile.data) {
            filesToDownload.push({
                name: file.mainFile.name,
                data: file.mainFile.data,
                contentType: file.mainFile.contentType
            });
        }

        // Check and add the hw file
        if (file.hw && file.hw.data) {
            filesToDownload.push({
                name: file.hw.name,
                data: file.hw.data,
                contentType: file.hw.contentType
            });
        }

        // Check and add the wooden file
        if (file.wooden && file.wooden.data) {
            filesToDownload.push({
                name: file.wooden.name,
                data: file.wooden.data,
                contentType: file.wooden.contentType
            });
        }

        if (file.lights && file.lights.data) {
            filesToDownload.push({
                name: file.lights.name,
                data: file.lights.data,
                contentType: file.lights.contentType
            });
        }
        if (file.accessories && file.accessories.data) {
            filesToDownload.push({
                name: file.accessories.name,
                data: file.accessories.data,
                contentType: file.accessories.contentType
            });
        }

        if (filesToDownload.length === 0) {
            return res.status(400).send('No valid files to download');
        }

        // Set up a ZIP archive
        const archive = archiver('zip', {
            zlib: { level: 9 } // Compression level
        });

        // Set response headers for downloading a ZIP file
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="files_${req.params.id}.zip"`,
        });

        // Pipe the archive to the response
        archive.pipe(res);

        // Add files to the archive
        for (let fileItem of filesToDownload) {
            archive.append(fileItem.data, { name: fileItem.name });
        }

        // Finalize the archive (important to close the stream)
        archive.finalize();

    } catch (err) {
        console.error("Error:", err);
        res.status(500).send('Error downloading files');
    }
});

// Download mainFile 
router.get('/download/mainFile/:id', async (req, res) => {
    try {
        // Find the file by ID in the database
        const file = await Pdf.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        // Ensure the file exists and has data to download
        if (!file.mainFile || !file.mainFile.data) {
            return res.status(400).send('Invalid file data');
        }

        const fileData = file.mainFile.data;
        const fileName = file.mainFile.name;
        const contentType = file.mainFile.contentType;

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
// Download hw 
router.get('/download/hw/:id', async (req, res) => {
    try {
        // Find the file by ID in the database
        const file = await Pdf.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        // Ensure the file exists and has data to download
        if (!file.hw || !file.hw.data) {
            return res.status(400).send('Invalid file data');
        }

        const fileData = file.hw.data;
        const fileName = file.hw.name;
        const contentType = file.hw.contentType;

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
// Download wooden 
router.get('/download/wooden/:id', async (req, res) => {
    try {
        // Find the file by ID in the database
        const file = await Pdf.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        // Ensure the file exists and has data to download
        if (!file.wooden || !file.wooden.data) {
            return res.status(400).send('Invalid file data');
        }

        const fileData = file.wooden.data;
        const fileName = file.wooden.name;
        const contentType = file.wooden.contentType;

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
// Download wooden 
router.get('/download/lights/:id', async (req, res) => {
    try {
        // Find the file by ID in the database
        const file = await Pdf.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        // Ensure the file exists and has data to download
        if (!file.lights || !file.lights.data) {
            return res.status(400).send('Invalid file data');
        }

        const fileData = file.lights.data;
        const fileName = file.lights.name;
        const contentType = file.lights.contentType;

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
router.get('/download/accessories/:id', async (req, res) => {
    try {
        // Find the file by ID in the database
        const file = await Pdf.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        // Ensure the file exists and has data to download
        if (!file.accessories || !file.accessories.data) {
            return res.status(400).send('Invalid file data');
        }

        const fileData = file.accessories.data;
        const fileName = file.accessories.name;
        const contentType = file.accessories.contentType;

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
// Download wooden 
router.get('/download/challan/:id', async (req, res) => {
    try {
        // Find the file by ID in the database
        const file = await Pdf.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        // Ensure the file exists and has data to download
        if (!file.challan || !file.challan.data) {
            return res.status(400).send('Invalid file data');
        }

        const fileData = file.challan.data;
        const fileName = file.challan.name;
        const contentType = file.challan.contentType;

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
router.get('/download/invoice/:id', async (req, res) => {
    try {
        // Find the file by ID in the database
        const file = await Pdf.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        // Ensure the file exists and has data to download
        if (!file.invoice || !file.invoice.data) {
            return res.status(400).send('Invalid file data');
        }

        const fileData = file.invoice.data;
        const fileName = file.invoice.name;
        const contentType = file.invoice.contentType;

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
                { $set: { "Material_Received.Final_Date": date } },
                { new: true }
            ),
            Project.findById(file.ProjectId)
        ]);

        if (!project) return res.status(400).json({ msg: "Project not found" });

        // If execution has an Execution_date, update project status
        if (execution && execution.Material_Received.Execution_date) {
            await updateProjectStatus.updateProjectStatus(
                file.ProjectId,
                execution.Material_Received.Execution_date,
                execution.Material_Received.Final_Date
            );
        }

        // Move project to the "Material_Received" stage
        await Project.findByIdAndUpdate(file.ProjectId, {
            currentStage: "Material_Received",
            $push: { "addedStages": "Material_Received" },
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

        // Fetch the associated project
        const project = await Project.findById(file.ProjectId);
        if (!project) return res.status(400).json({ msg: "Project not found" });

        // Ensure that the file's stage matches the project's current stage
        if ("Material_Received" !== project.currentStage) {
            return res.status(400).json({ msg: "This file cannot be Not-Finalized at the current stage" });
        }

        // Find the file by ID and update its status
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
                { $set: { "Material_Received.Final_Date": null } }
            ),
            Project.findByIdAndUpdate(file.ProjectId, {
                $pull: { "addedStages": "Material_Received" },
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