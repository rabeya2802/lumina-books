const express = require("express");
const { submitContactForm } = require("../controllers/contactController");

const router = express.Router();

/**
 * @route   POST /api/contact
 * @desc    Send a contact form message to the site owner's inbox
 * @access  Public
 */
router.post("/", submitContactForm);

module.exports = router;
