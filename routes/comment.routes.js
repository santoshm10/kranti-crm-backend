const express = require('express')
const router = express.Router()
const { addCommentToLead, getCommentsForLead } = require('../controllers/comment.controller')

router.post('/leads/:id/comments', addCommentToLead);
router.get('/leads/:id/comments', getCommentsForLead);

module.exports = router;