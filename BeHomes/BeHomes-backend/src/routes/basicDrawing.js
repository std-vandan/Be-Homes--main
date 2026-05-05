const express = require('express')
const multer = require('multer')
const axios = require('axios')
const dotenv = require('dotenv');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
dotenv.config();
const convertapi = require('convertapi')(process.env.CONVER_API_KEY)
const router = express.Router(process.env.CONVER_API_KEY)
const File = require('../models/BasicDrawing');
const Project = require('../models/Project');
const ExecutionPlanning = require('../models/ExecutinPlanning')
const { log } = require('console');
const authMiddleware = require("../middlewares/RBAC/authMiddleware");
const rbacMiddleware = require("../middlewares/RBAC/rbacMiddleware");
const updateProjectStatus = require("../utils/update")

const app = express();


app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Set up for Multer for file uploads

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/tmp'); // Save files in the temp folder
    },
    filename: (req, file, cb) => {
        // Save the file with its original name
        cb(null, file.originalname);
    },
});


// // To get Uploader Page
// router.get('/upload', (req, res) => {
//     try {
//         res.status(200).render('upload', { data: { message: 'Success' } });

//     } catch (error) {
//         console.error(error);
//         res.status(500).send({ message: 'Error retrieving files' });
//     }
// });







// Updating Status - Finalized by all
router.post("/Finalized/:id", async (req, res) => {
    try {
        const date = new Date().toISOString().split("T")[0];
        const file = await File.findByIdAndUpdate(req.params.id, { status: "Finalized" }, { new: true });

        if (!file) return res.status(400).json({ msg: "File not found" });

        // Update ExecutionPlanning & fetch project in parallel
        const [execution, project] = await Promise.all([
            ExecutionPlanning.findOneAndUpdate(
                { ProjectId: file.ProjectId },
                { $set: { "Basic_Drawing.Final_Date": date } },
                { new: true }
            ),
            Project.findById(file.ProjectId)
        ]);

        if (execution && execution.Basic_Drawing.Execution_date) {
            await updateProjectStatus.updateProjectStatus(file.ProjectId, execution.Basic_Drawing.Execution_date, execution.Basic_Drawing.Final_Date);

            // Determine project status based on dates
            let projectStatus = "Overdue";
            if (execution.Basic_Drawing.Execution_date === execution.Basic_Drawing.Final_Date) {
                projectStatus = "In Progress";
            }

            await Project.findByIdAndUpdate(file.ProjectId, { projectStatus });
        }


        await Project.findByIdAndUpdate(file.ProjectId, {
            $push: { "addedStages": "Basic_Drawing" },
            currentStage: "Basic_Drawing",
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
        // Find the file by ID
        const file = await File.findById(req.params.id);

        // If file is not found, return error
        if (!file) {
            return res.status(400).json({ msg: "File not found" });
        }

        // Fetch the associated project
        const project = await Project.findById(file.ProjectId);
        if (!project) {
            return res.status(400).json({ msg: "Project not found" });
        }

        // Ensure that the file's stage matches the project's current stage
        if ("Basic_Drawing" !== project.currentStage) {
            return res.status(400).json({ msg: "This file cannot be Not-Finalized at the current stage" });
        }

        // Update the file status only if the condition is met
        const updatedFile = await File.findByIdAndUpdate(
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

        // Proceed with reverting the stage and clearing the date
        await Promise.all([
            ExecutionPlanning.findOneAndUpdate(
                { ProjectId: file.ProjectId },
                { $set: { "Basic_Drawing.Final_Date": null } }
            ),

            Project.findByIdAndUpdate(file.ProjectId, {
                currentStage: CurrentStage,
                $pull: { "addedStages": "Basic_Drawing" },
                new: true

            })
        ]);

        console.log(project.addedStages, project.addedStages.length, CurrentStage,);


        res.status(200).json({ msg: "Success" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message || "Something went wrong" });
    }
});






router.get('/files', async (req, res) => {
    try {
        const files = await File.find({}, ' -data -dwgFileData -svgFileData -pdfFileData').exec();

        res.status(200).json({
            files: files,
            message: 'Success'
        });


    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error retrieving files' });
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
        const File = await File.find(query, "createdDate ProjectId"); // Fetch one document, including only the uploadDate field
        res.status(200).json(File); // Respond with the found document
    } catch (error) {
        res.status(500).json({ message: 'Error fetching PDFs', error: error.message });
    }
});


router.get('/files/:id', async (req, res) => {
    const id = req.params.id;
    try {

        const query = {};
        // console.log(id);
        if (mongoose.Types.ObjectId.isValid(id)) {
            query._id = id
        } else {
            query.projectId = id;
        }
        console.log(query);

        const files = await File.findOne(query, '-data -svgFileData -FileData -dwgFileData').exec();
        res.status(200).json({
            files: files,
            message: 'Success'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error retrieving files' });
    }
});

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

        const files = await File.find(query, '-data -svgFileData -FileData -dwgFileData').exec();
        res.status(200).json({
            files: files,
            message: 'Success'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error retrieving files' });
    }
});


// Multer instance with limits and filters
const upload = multer({
    // fileFilter,
    // limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

router.post('/upload/:id', upload.single('File'), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const Extension_Name = path.extname(req.file.originalname).toLowerCase()
        console.log((Extension_Name === ".pdf" || Extension_Name === ".png" || Extension_Name === ".jpeg") ? "True" : "False");


        if (Extension_Name === ".pdf" || Extension_Name === ".png" || Extension_Name === ".jpeg" || Extension_Name === ".jpg") {

            const Projid = req.params.id;


            const newPdf = new File({
                name: req.file.originalname,
                data: req.file.buffer,
                contentType: req.file.mimetype,
                ProjectId: Projid
            });

            await newPdf.save();
            res.status(200).send({ message: 'Success' });

        } else {
            {
                // New Code
                {
                    console.log(Extension_Name);
                    const projectid = req.params.id;
                    let svgname = null;
                    let svgdata = null;

                    console.log('Extension:', req.file.originalname);
                    console.log('MIME Type:', req.file.mimetype);

                    // Check if the uploaded file is a DWG
                    if (req.file.mimetype === "image/vnd.dwg") {
                        // Save DWG file temporarily
                        const dwgFilePath = path.join(__dirname, req.file.originalname);
                        await fs.promises.writeFile(dwgFilePath, req.file.buffer);

                        // Convert DWG to SVG
                        const result = await convertapi.convert('svg', { File: dwgFilePath }, 'dwg');

                        if (!result || !result.file || !result.file.url) {
                            return res.status(500).json({ message: 'Conversion failed' });
                        }

                        // Download the converted SVG file
                        const svgResponse = await fetch(result.file.url);
                        svgdata = Buffer.from(await svgResponse.arrayBuffer()); // ✅ Store SVG Buffer
                        svgname = req.file.originalname.replace('.dwg', '.svg');

                        // Delete Temporary File
                        await fs.promises.unlink(dwgFilePath);
                    }

                    // Save original & converted file to MongoDB
                    const newCad = new File({
                        name: req.file.originalname,
                        data: req.file.buffer,  // ✅ Save the original DWG file data
                        svgFileName: svgname,  // ✅ Save SVG name
                        svgFileData: svgdata,  // ✅ Save SVG Buffer
                        contentType: req.file.mimetype,
                        ProjectId: projectid
                    });

                    await newCad.save();
                }

            }

            res.status(200).send({ message: 'Success' });


        }
    } catch (err) {
        console.error(err);
        res.json({ msg: err.message })
    }
});


router.get('/view/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        console.log(file.svgFileName);

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

        if (contentType === "image/vnd.dwg" && file.svgFileData) {
            contentType = "image/svg+xml";
            fileData = file.svgFileData;
        } else if (contentType === "application/octet-stream" && file.svgFileData) {
            // If it's an octet-stream but an SVG exists, assume it's a DWG and serve SVG
            contentType = "image/svg+xml";
            fileData = file.svgFileData;
        }

        // Ensure only allowed file types are served
        const allowedTypes = ["application/pdf", "image/svg+xml", "image/jpeg", "image/png", "application/octet-stream"];
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


// Download
router.get('/download/:id', async (req, res) => {
    try {
        // Find the file by ID in the database
        const file = await File.findById(req.params.id);
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




// Route to download the SVG file
router.get('/Svg/download/:id', async (req, res) => {
    try {
        const fileId = req.params.id;
        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).send('File not found');
        }

        // Set headers for download
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${file.svgFileName}"`,
        })

        return res.send(file.svgFileData);

    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving the DWG file');
    }
});


router.get('/view/all', async (req, res) => {
    try {
        const file = await File.find();

        res.json({ datas: file })


        if (!file) {
            return res.status(404).send('File not found');
        }
        // res.render('index',{files:file.data})
        // Send the SVG file as a response
        // res.set('Content-Type', 'image/svg+xml');
        // res.send(Buffer.from(file.svgContent, 'base64'));
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

        const files = await File.find(query, "-dwgFileData -svgFileData").exec();
        res.status(200).json({
            files: files,
            message: 'Success'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error retrieving files' });
    }
});


// Endpoint to retrieve and serve SVG file
router.get('/view/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }
        // console.log(Buffer.from(file.svgFileData, 'base64');

        // Send the SVG file as a response  
        res.set('Content-Type', 'image/svg+xml');
        // res.status(200).send(Buffer.from(file.svgFileData, 'base64'));
        // console.log(file);

        res.status(200).send(file.svgFileData);


    } catch (err) {
        res.status(500).send('Error retrieving file from database');
    }
});

router.get('/delete/:id', async (req, res) => {
    const id = req.params.id;
    try {

        const query = {};
        console.log(id);
        if (mongoose.Types.ObjectId.isValid(id)) {
            query._id = id;
        } else {
            query.projectId = id;
        }
        console.log(query);

        const response = await File.findOneAndDelete(query)
        res.status(200).send({ msg: 'Success' });

    } catch (err) {
        console.error(err.msg);
        res.status(400).send({ msg: 'Server Error' });
    }
});


module.exports = router;
