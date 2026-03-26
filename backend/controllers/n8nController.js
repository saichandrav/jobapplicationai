const triggerWorkflow = async (req, res) => {
  try {
    const { action, payload } = req.body;
    
    console.log(`Received webhook from n8n for action: ${action}`);
    
    if (action === 'auto_apply_complete') {
        console.log("Auto apply completed for job:", payload.jobId);
    }
    
    res.json({ status: 'success', received: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { triggerWorkflow };
