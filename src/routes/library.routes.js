/**
 * Library Document Routes
 *
 * POST   /sessions/:id/documents            — upload a document
 * GET    /sessions/:id/documents            — list documents
 * DELETE /sessions/:id/documents/:docId     — delete a document
 */
const express = require("express");
const router = express.Router({ mergeParams: true });
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { createDocumentSchema } = require("../schemas/library.schema");
const { uploadDocument: uploadDocumentController, getDocuments, deleteDocument } = require("../controllers/library.controller");

router.post("/", authenticate, validate(createDocumentSchema), uploadDocumentController);
router.get("/", authenticate, getDocuments);
router.delete("/:docId", authenticate, deleteDocument);

module.exports = router;