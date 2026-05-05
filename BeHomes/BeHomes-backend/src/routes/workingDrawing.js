const express = require('express')
const multer = require('multer')
const axios = require('axios')
const dotenv = require('dotenv');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
dotenv.config();
const convertapi = require('convertapi')("secret_HagsN82BHoNH2oiJ")
const router = express.Router(process.env.CONVER_API_KEY)
const archiver = require('archiver');
const Pdf = require('../models/WorkingDrawing');
const Project = require('../models/Project');
const ExecutionPlanning = require('../models/ExecutinPlanning')
const authMiddleware = require("../middlewares/RBAC/authMiddleware");
const rbacMiddleware = require("../middlewares/RBAC/rbacMiddleware");
const { log } = require('console');
const updateProjectStatus = require("../utils/update");

const app = express();


app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'application/acad' || // AutoCAD 
        file.mimetype === 'application/dxf' ||  // DXF files
        file.mimetype === 'application/x-dwg' || // DWG files
        file.mimetype === 'image/vnd.dwg' || // Another DWG format
        file.mimetype === 'application/x-dxf' // DXF alternative format
    ) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type. Only PDF, JPG, PNG, and CAD files (DWG, DXF) are allowed!'), false); // Reject the file
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

        const pdfs = await Pdf.findOne(query, '-data -mainFile.data -mainFile.svgdata -elec.data -plumb.data -civ.data');
        console.log(pdfs.mainFile.contentType);



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

        const files = await Pdf.find(query, '-data -mainFile.data -mainFile.svgdata -elec.data -plumb.data -civ.data').exec();
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
    { name: 'elec', maxCount: 1 },
    { name: 'plumb', maxCount: 1 },
    { name: 'civ', maxCount: 1 }
]), async (req, res) => {
    try {
        const projectid = req.params.id;
        let svgname = null;
        let svgdata = null;

        console.log(req.files['mainFile'][0].mimetype);

        // Check if the uploaded file is a DWG
        if (["image/vnd.dwg", "application/octet-stream"].includes(req.files['mainFile'][0].mimetype)) {
            // Save DWG file temporarily
            const dwgFilePath = path.join(__dirname, req.files['mainFile'][0].originalname);
            await fs.promises.writeFile(dwgFilePath, req.files['mainFile'][0].buffer);

            // Convert DWG to SVG
            const result = await convertapi.convert('svg', { File: dwgFilePath }, 'dwg');

            if (!result || !result.file || !result.file.url) {
                return res.status(500).json({ message: 'Conversion failed' });
            }

            // Download the converted SVG file
            const svgResponse = await fetch(result.file.url);
            svgdata = Buffer.from(await svgResponse.arrayBuffer()); // ✅ Store SVG Buffer
            svgname = req.files['mainFile'][0].originalname.replace('.dwg', '.svg');

            // Delete Temporary File
            await fs.promises.unlink(dwgFilePath);
        }

        // Save original & converted file to MongoDB
        const newPdf = new Pdf({
            mainFile: {
                name: req.files['mainFile'][0].originalname,
                data: req.files['mainFile'][0].buffer,
                svgname: svgname,  // ✅ Save SVG name
                svgdata: svgdata,  // ✅ Save SVG Buffer
                contentType: req.files['mainFile'][0].mimetype,
            },
            elec: req.files['elec']
                ? {
                    name: req.files['elec'][0].originalname,
                    data: req.files['elec'][0].buffer,
                    contentType: req.files['elec'][0].mimetype,
                }
                : undefined,  // ✅ Optional: Only add if exists
            plumb: req.files['plumb']
                ? {
                    name: req.files['plumb'][0].originalname,
                    data: req.files['plumb'][0].buffer,
                    contentType: req.files['plumb'][0].mimetype,
                }
                : undefined,  // ✅ Optional: Only add if exists
            civ: req.files['civ']
                ? {
                    name: req.files['civ'][0].originalname,
                    data: req.files['civ'][0].buffer,
                    contentType: req.files['civ'][0].mimetype,
                }
                : undefined,  // ✅ Optional: Only add if exists
            ProjectId: projectid
        });


        await newPdf.save();
        res.status(200).json({ message: 'Files uploaded successfully', svgName: svgname });
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

        // If DWG was converted, serve the SVG instead
        if (contentType === "image/vnd.dwg" && file.mainFile.svgdata) {
            contentType = "image/svg+xml";
            fileData = file.mainFile.svgdata;
        } else if (!contentType) {
            // Default fallback content type
            contentType = "application/octet-stream";
        }


        // Ensure only PDF & SVG files are served here
        if (contentType !== "application/pdf" && contentType !== "image/svg+xml") {
            return res.status(400).send('Invalid file type for this endpoint');
        }

        res.set('Content-Type', contentType);
        res.status(200).send(fileData);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).send('Error retrieving file');
    }
});

// elec view
router.get('/view/elec/:id', async (req, res) => {
    try {
        const file = await Pdf.findById(req.params.id);
        console.log(file.elec.name);

        if (!file) {
            return res.status(404).send('File not found');
        }

        let fileData, contentType;

        if (file.elec && file.elec.data) {
            contentType = file.elec.contentType;
            fileData = file.elec.data;
        } else {
            return res.status(404).send('No valid file found');
        }

        // Ensure only PNG & JPEG files are served here
        if (contentType !== "image/png" && contentType !== "image/jpeg") {
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
router.get('/view/plumb/:id', async (req, res) => {
    try {
        const file = await Pdf.findById(req.params.id);
        console.log(file.plumb.name);

        if (!file) {
            return res.status(404).send('File not found');
        }

        let fileData, contentType;

        if (file.plumb && file.plumb.data) {
            contentType = file.plumb.contentType;
            fileData = file.plumb.data;
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
router.get('/view/civ/:id', async (req, res) => {
    try {
        const file = await Pdf.findById(req.params.id);
        console.log(file.civ.name);

        if (!file) {
            return res.status(404).send('File not found');
        }

        let fileData, contentType;

        if (file.civ && file.civ.data) {
            contentType = file.civ.contentType;
            fileData = file.civ.data;
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

        // Check and add the elec file
        if (file.elec && file.elec.data) {
            filesToDownload.push({
                name: file.elec.name,
                data: file.elec.data,
                contentType: file.elec.contentType
            });
        }

        // Check and add the plumb file
        if (file.plumb && file.plumb.data) {
            filesToDownload.push({
                name: file.plumb.name,
                data: file.plumb.data,
                contentType: file.plumb.contentType
            });
        }

        if (file.civ && file.civ.data) {
            filesToDownload.push({
                name: file.civ.name,
                data: file.civ.data,
                contentType: file.civ.contentType
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
// Download elec 
router.get('/download/elec/:id', async (req, res) => {
    try {
        // Find the file by ID in the database
        const file = await Pdf.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        // Ensure the file exists and has data to download
        if (!file.elec || !file.elec.data) {
            return res.status(400).send('Invalid file data');
        }

        const fileData = file.elec.data;
        const fileName = file.elec.name;
        const contentType = file.elec.contentType;

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
// Download plumb 
router.get('/download/plumb/:id', async (req, res) => {
    try {
        // Find the file by ID in the database
        const file = await Pdf.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        // Ensure the file exists and has data to download
        if (!file.plumb || !file.plumb.data) {
            return res.status(400).send('Invalid file data');
        }

        const fileData = file.plumb.data;
        const fileName = file.plumb.name;
        const contentType = file.plumb.contentType;

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
// Download plumb 
router.get('/download/civ/:id', async (req, res) => {
    try {
        // Find the file by ID in the database
        const file = await Pdf.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        // Ensure the file exists and has data to download
        if (!file.civ || !file.civ.data) {
            return res.status(400).send('Invalid file data');
        }

        const fileData = file.civ.data;
        const fileName = file.civ.name;
        const contentType = file.civ.contentType;

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
                { $set: { "Working_Drawing.Final_Date": date } },
                { new: true }
            ),
            Project.findById(file.ProjectId)
        ]);

        if (!project) return res.status(400).json({ msg: "Project not found" });

        // If execution has an Execution_date, update project status
        if (execution && execution.Working_Drawing.Execution_date) {
            await updateProjectStatus.updateProjectStatus(
                file.ProjectId,
                execution.Working_Drawing.Execution_date,
                execution.Working_Drawing.Final_Date
            );
        }

        // Move project to the "WorkingDrawing" stage
        await Project.findByIdAndUpdate(file.ProjectId, {
            currentStage: "Working_Drawing",
            $push: { "addedStages": "Working_Drawing" },
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
        if ("Working_Drawing" !== project.currentStage) {
            return res.status(400).json({ msg: "This file cannot be Not-Finalized at the current stage" });
        }

        // Find the file by ID and update its status
        const updatedFile = await Pdf.findByIdAndUpdate(
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
                { $set: { "Working_Drawing.Final_Date": null } }
            ),
            Project.findByIdAndUpdate(file.ProjectId, {
                $pull: { "addedStages": "Working_Drawing" },
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
