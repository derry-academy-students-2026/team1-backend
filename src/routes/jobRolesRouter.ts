import express from "express";
import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController.js";

const router = express.Router();


const controller = new JobRoleController();

router.get("/", (req, res) => controller.getAll(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));
router.post("/", (req, res) => controller.create(req, res));
//router.put("/:id", (req, res) => controller.update(req, res));
//router.delete("/:id", (req, res) => controller.delete(req, res))

export default router;




/*

// Get all jobs
router.get("/jobs", (req, res) => {
    const jobs = [
        { id: 1, jobRoleName: "Example Job", location: "Derry", capabilityId: 0, bandId: 0, closingDate: "2023-01-01", status: "open " },
    ];
    res.status(200).json(jobs);
});




// Get a single job by ID
router.get("/jobs/:id", (req, res) => {
    const { id } = req.params;
    const job = { id: Number(id), jobRoleName: "Example Job", location: "Derry", capabilityId: 0, bandId: 0, closingDate: "2023-01-01", status: "open " };
    if (!job) {
        return res.status(404).json({ error: "Job not found" });
    }
    res.status(200).json(job);
});


// Create a new job
router.post("/jobs", (req, res) => {
    const { jobRoleName, location, capabilityId, bandId, closingDate, status } = req.body;
    // In a real app, save to database here
    const newJob = {
        id: 2,
        jobRoleName,
        location,
        capabilityId,
        bandId,
        closingDate,
        status
    };
    res.status(201).json(newJob);
});






// Replace a job
router.put("/jobs/:id", (req, res) => {
    const { id } = req.params;
    const { jobRoleName, location, capabilityId, bandId, closingDate, status } = req.body;

    // In a real app, replace in database here
    const updated = { id: Number(id), jobRoleName, location, capabilityId, bandId, closingDate, status };
    res.status(200).json(updated);
});


// Delete a job
router.delete("/jobs/:id", (req, res) => {
    const { id } = req.params;
    // In a real app, delete from database here
    res.status(204).send();
});

*/