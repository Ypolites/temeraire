/**
 * Library Document Validation Schemas
 */
const { z } = require("zod");

const documentCategoryEnum = z.enum([
  "R_gles",
  "Directives_MJ",
  "Campagne",
  "Lore",
]);

const createDocumentSchema = z.object({
  title:    z.string().min(1, "Le titre est requis.").max(200),
  category: documentCategoryEnum,
});

module.exports = { createDocumentSchema };