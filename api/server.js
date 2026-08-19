const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, '../db/db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Read database
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { submissions: [] };
  }
};

// Write database
const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// Submit project inquiry
app.post('/api/submit', (req, res) => {
  try {
    const { service, name, email, company, budget, message } = req.body;

    if (!service || !name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = readDB();
    const submission = {
      id: Date.now().toString(),
      service,
      name,
      email,
      company: company || 'N/A',
      budget: budget || 'N/A',
      message,
      status: 'new',
      submittedAt: new Date().toISOString(),
    };

    db.submissions.unshift(submission);
    writeDB(db);

    res.json({ success: true, message: 'Submission received successfully' });
  } catch (error) {
    console.error('Error submitting:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all submissions (admin)
app.get('/api/admin/submissions', (req, res) => {
  try {
    const db = readDB();
    res.json(db.submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update submission status
app.patch('/api/admin/submissions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const db = readDB();
    const submission = db.submissions.find(s => s.id === id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    submission.status = status;
    writeDB(db);

    res.json({ success: true, submission });
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete submission
app.delete('/api/admin/submissions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();

    db.submissions = db.submissions.filter(s => s.id !== id);
    writeDB(db);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
