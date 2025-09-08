const express = require('express')
const router = express.Router()
const { createAgent, getAllAgent, deleteAgent} = require('../controllers/salesAgent.controller')

router.post('/agents', createAgent);
router.get('/agents', getAllAgent);
router.delete('/agents/:id', deleteAgent)

module.exports = router;