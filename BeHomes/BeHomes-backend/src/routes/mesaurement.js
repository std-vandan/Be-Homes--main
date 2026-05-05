const express = require('express');
const router = express.Router();
const multer = require('multer');
const archiver = require('archiver');
const Pdf = require('../models/Measurement');
const fs = require('fs').promises;
const path = require('path');
const convertapi = require('convertapi')("secret_HagsN82BHoNH2oiJ")
const authMiddleware = require("../middlewares/RBAC/authMiddleware");
const rbacMiddleware = require("../middlewares/RBAC/rbacMiddleware");
const ExecutionPlanning = require('../models/ExecutinPlanning')
const Project = require('../models/Project');
const mongoose = require('mongoose')
const updateProjectStatus = require("../utils/update");

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type. Only PDFs are allowed!'), false); // Reject the file
    }
};

// Configure multer storage
const upload = multer();


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

        const pdfs = await Pdf.findOne(query, '-data -Main_Upload.data -Main_Upload.svgdata -Site_Pic.data -Site_Vid.data');
        console.log(pdfs.Main_Upload.contentType);



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

        const files = await Pdf.find(query, '-data -Main_Upload.data -Main_Upload.svgdata -Site_Pic.data -Site_Vid.data ').exec();
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
    { name: 'Main_Upload', maxCount: 1 },
    { name: 'Site_Pic', maxCount: 10 }, // ✅ Allow multiple site images
    { name: 'Site_Vid', maxCount: 1 }
]), async (req, res) => {
    try {
        const projectid = req.params.id;
        let svgname = null;
        let svgdata = null;

        console.log("Received Files:", req.files);

        // Check if Main_Upload exists
        if (!req.files['Main_Upload']) {
            return res.status(400).json({ message: "Main Upload file is required" });
        }

        console.log(req.files['Main_Upload'][0].mimetype);

        // Check if the uploaded file is a DWG
        if (["image/vnd.dwg", "application/octet-stream"].includes(req.files['Main_Upload'][0].mimetype)) {
            // Save DWG file temporarily
            const dwgFilePath = path.join(__dirname, req.files['Main_Upload'][0].originalname);
            await fs.writeFile(dwgFilePath, req.files['Main_Upload'][0].buffer);

            // Convert DWG to SVG
            const result = await convertapi.convert('svg', { File: dwgFilePath }, 'dwg');

            if (!result || !result.file || !result.file.url) {
                return res.status(500).json({ message: 'Conversion failed' });
            }

            // Download the converted SVG file
            const svgResponse = await fetch(result.file.url);
            svgdata = Buffer.from(await svgResponse.arrayBuffer());
            svgname = req.files['Main_Upload'][0].originalname.replace('.dwg', '.svg');

            // Delete Temporary File
            await fs.unlink(dwgFilePath);
        }

        // ✅ Fix: Ensure Site_Pic is stored correctly as an array
        let sitePics = [];
        if (req.files['Site_Pic']) {
            sitePics = req.files['Site_Pic'].map(file => ({
                name: file.originalname,
                data: file.buffer,
                contentType: file.mimetype,
            }));
        }

        // Save files to MongoDB
        const newPdf = new Pdf({
            Main_Upload: {
                name: req.files['Main_Upload'][0].originalname,
                data: req.files['Main_Upload'][0].buffer,
                svgname: svgname,
                svgdata: svgdata,
                contentType: req.files['Main_Upload'][0].mimetype,
            },
            Site_Pic: sitePics.length > 0 ? sitePics : undefined, // ✅ Store array only if files exist
            Site_Vid: req.files['Site_Vid'] && req.files['Site_Vid'].length > 0
                ? {
                    name: req.files['Site_Vid'][0].originalname,
                    data: req.files['Site_Vid'][0].buffer,
                    contentType: req.files['Site_Vid'][0].mimetype,
                }
                : undefined,
            ProjectId: projectid
        });

        await newPdf.save();

        res.status(200).json({
            message: 'Files uploaded successfully',
            svgName: svgname,
            sitePics: sitePics.map(pic => pic.name) // ✅ Return site image names
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: 'Error uploading files', error: error.message });
    }
});


// Main Upload
router.get('/view/MainUp/:id', async (req, res) => {
    try {
        const file = await Pdf.findById(req.params.id);
        console.log(file.Main_Upload.svgname);

        if (!file) {
            return res.status(404).send('File not found');
        }

        let fileData, contentType;

        if (file.Main_Upload && file.Main_Upload.data) {
            contentType = file.Main_Upload.contentType;
            fileData = file.Main_Upload.data;
        } else {
            return res.status(404).send('No valid file found');
        }

        // If DWG was converted, serve the SVG instead
        if (contentType === "image/vnd.dwg" && file.Main_Upload.svgdata) {
            contentType = "image/svg+xml";
            fileData = file.Main_Upload.svgdata;
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

// Site Pic view
router.get('/view/SitePic/:id', async (req, res) => {
    try {
        const file = await Pdf.findById(req.params.id);
        console.log(file.Site_Pic.name);

        if (!file) {
            return res.status(404).send('File not found');
        }

        let fileData, contentType;

        if (file.Site_Pic && file.Site_Pic.data) {
            contentType = file.Site_Pic.contentType;
            fileData = file.Site_Pic.data;
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

// Site video
router.get('/view/SiteVid/:id', async (req, res) => {
    try {
        const file = await Pdf.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        if (!file.Site_Vid || !file.Site_Vid.data || file.Site_Vid.contentType !== "video/mp4") {
            return res.status(400).send('Invalid file type for this endpoint');
        }

        const videoBuffer = file.Site_Vid.data;
        const fileSize = videoBuffer.length;
        const range = req.headers.range;

        // If no range request, send the entire video
        if (!range) {
            res.set('Content-Type', 'video/mp4');
            res.set('Content-Length', fileSize);
            return res.status(200).send(videoBuffer);
        }

        // Parse range header (e.g., "bytes=0-")
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize || end >= fileSize) {
            return res.status(416).send('Requested range not satisfiable');
        }

        const chunkSize = end - start + 1;
        const videoChunk = videoBuffer.slice(start, end + 1);

        res.set({
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4',
        });

        res.status(206).send(videoChunk); // Partial content for streaming

    } catch (err) {
        console.error("Error:", err);
        res.status(500).send('Error retrieving video file');
    }
});



// Route to download the PDF file
// router.get('/download/:id', async (req, res) => {
//     try {
//         // Find the file in the database by ID
//         const file = await Pdf.findById(req.params.id);

//         if (!file) {
//             return res.status(404).send('File not found');
//         }

//         // Set headers for downloading the PDF
//         res.set({
//             'Content-Type': 'application/pdf',
//             'Content-Disposition': `attachment; filename="${file.name || 'download.pdf'}"`, // Use file name or default
//         });

//         // Send the file data as a binary stream
//         res.send(file.data); // Assuming `file.data` contains the binary PDF data
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Error retrieving the PDF file');
//     }
// });

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

        // Check and add the Main_Upload file
        if (file.Main_Upload && file.Main_Upload.data) {
            filesToDownload.push({
                name: file.Main_Upload.name,
                data: file.Main_Upload.data,
                contentType: file.Main_Upload.contentType
            });
        }

        // Check and add the Site_Pic file
        if (file.Site_Pic && file.Site_Pic.data) {
            filesToDownload.push({
                name: file.Site_Pic.name,
                data: file.Site_Pic.data,
                contentType: file.Site_Pic.contentType
            });
        }

        // Check and add the Site_Vid file
        if (file.Site_Vid && file.Site_Vid.data) {
            filesToDownload.push({
                name: file.Site_Vid.name,
                data: file.Site_Vid.data,
                contentType: file.Site_Vid.contentType
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

// Download Main_Upload 
router.get('/download/MainUp/:id', async (req, res) => {
    try {
        // Find the file by ID in the database
        const file = await Pdf.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        // Ensure the file exists and has data to download
        if (!file.Main_Upload || !file.Main_Upload.data) {
            return res.status(400).send('Invalid file data');
        }

        const fileData = file.Main_Upload.data;
        const fileName = file.Main_Upload.name;
        const contentType = file.Main_Upload.contentType;

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
// Download Site_Pic 
router.get('/download/SitePic/:id', async (req, res) => {
    try {
        // Find the file by ID in the database
        const file = await Pdf.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        // Ensure the file exists and has data to download
        if (!file.Site_Pic || !file.Site_Pic.data) {
            return res.status(400).send('Invalid file data');
        }

        const fileData = file.Site_Pic.data;
        const fileName = file.Site_Pic.name;
        const contentType = file.Site_Pic.contentType;

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
// Download Site_Vid 
router.get('/download/SiteVid/:id', async (req, res) => {
    try {
        // Find the file by ID in the database
        const file = await Pdf.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        // Ensure the file exists and has data to download
        if (!file.Site_Vid || !file.Site_Vid.data) {
            return res.status(400).send('Invalid file data');
        }

        const fileData = file.Site_Vid.data;
        const fileName = file.Site_Vid.name;
        const contentType = file.Site_Vid.contentType;

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
        const date = new Date().toISOString().split("T")[0]; // Get today's date

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
                { $set: { "Measurement.Final_Date": date } },
                { new: true }
            ),
            Project.findById(file.ProjectId)
        ]);

        if (!project) return res.status(400).json({ msg: "Project not found" });

        // If execution has an Execution_date, update project status
        if (execution && execution.Measurement.Execution_date) {
            await updateProjectStatus.updateProjectStatus(
                file.ProjectId,
                execution.Measurement.Execution_date,
                execution.Measurement.Final_Date
            );
        }

        // Move project to the "Measurement" stage
        await Project.findByIdAndUpdate(file.ProjectId, {
            currentStage: "Measurement",
            $push: { "addedStages": "Measurement" },
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
        if ("Measurement" !== project.currentStage) {
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
                { $set: { "Measurement.Final_Date": null } }
            ),
            Project.findByIdAndUpdate(file.ProjectId, {
                $pull: { "addedStages": "Measurement" },
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