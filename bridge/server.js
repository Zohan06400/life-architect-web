const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/lists', (req, res) => {
    const scriptPath = path.join(__dirname, 'get-lists.js');
    exec(`osascript -l JavaScript "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error}`);
            return res.status(500).json({ error: 'Failed to access Reminders lists' });
        }
        try {
            const data = JSON.parse(stdout);
            res.json(data);
        } catch (e) {
            console.error('Failed to parse AppleScript output:', e);
            res.status(500).json({ error: 'Invalid data format from Reminders' });
        }
    });
});

app.get('/reminders', (req, res) => {
    // UPDATED: Point to .js file
    const scriptPath = path.join(__dirname, 'get-reminders.js');

    // UPDATED: Use -l JavaScript flag
    exec(`osascript -l JavaScript "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error}`);
            return res.status(500).json({ error: 'Failed to access Reminders' });
        }
        if (stderr) {
            console.error(`Script stderr: ${stderr}`);
        }

        try {
            const data = JSON.parse(stdout);
            res.json(data);
        } catch (e) {
            console.error('Failed to parse AppleScript output:', e);
            res.status(500).json({ error: 'Invalid data format from Reminders' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`🍎 Bridge Server running at http://localhost:${PORT}`);
    console.log(`Ready to sync Apple Reminders to Life Architect.`);
});
