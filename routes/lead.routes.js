const express = require('express')
const router = express.Router()
const { createLead, getAllLeads, updateLead, deleteLead } = require('../controllers/lead.controller')

router.post('/leads', createLead);
router.get('/leads', getAllLeads);
router.patch('/leads/:id', updateLead);
router.delete('/leads/:id', deleteLead);

module.exports = router;