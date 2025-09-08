const express = require('express');
const router = express.Router()
const { createTags, getAllTags, assignTagsToLead, getLeadsByTag } = require('../controllers/tags.controller')


router.post('/tags', createTags);
router.get('/tags', getAllTags);
router.post('/tags/assign-tag/leads/:id', assignTagsToLead);
router.get('/tags/leads/:tag', getLeadsByTag);

module.exports = router;