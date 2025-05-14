const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Fetches and processes chat statistics from the provided URL.
 * @param {string} [startDate] - ISO date string (e.g., '2019-04-05')
 * @param {string} [endDate] - ISO date string (e.g., '2019-04-12')
 * @returns {Promise<Array<{websiteId: string, chats: number, missedChats: number}>>}
 */
async function processStatistics(startDate, endDate) {
    // Validate and normalize date inputs
    const start = startDate ? new Date(startDate + 'T00:00:00.000Z') : null;
    const end = endDate ? new Date(endDate + 'T23:59:59.999Z') : null;

    if (start && isNaN(start.getTime())) throw new Error('Invalid startDate');
    if (end && isNaN(end.getTime())) throw new Error('Invalid endDate');
    if (start && end && start > end) throw new Error('startDate cannot be after endDate');

    try {
        // Use native fetch
        const response = await fetch('https://bitbucket.org/!api/2.0/snippets/tawkto/aA8zqE/4f62624a75da6d1b8dd7f70e53af8d36a1603910/files/webstats.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        if (!Array.isArray(data)) throw new Error('Expected data to be an array');

        // Aggregate statistics
        const statsMap = new Map();

        for (const entry of data) {
            if (!entry.websiteId || typeof entry.chats !== 'number' || typeof entry.missedChats !== 'number' || !entry.date) {
                console.warn('Skipping invalid entry:', entry);
                continue;
            }

            const entryDate = new Date(entry.date);
            if (isNaN(entryDate.getTime())) {
                console.warn('Skipping entry with invalid date:', entry);
                continue;
            }

            // Normalize entry date to UTC midnight for comparison
            const normalizedEntryDate = new Date(Date.UTC(entryDate.getUTCFullYear(), entryDate.getUTCMonth(), entryDate.getUTCDate()));

            // Apply date filtering
            if (start && normalizedEntryDate < start) continue;
            if (end && normalizedEntryDate > end) continue;

            const current = statsMap.get(entry.websiteId) || { chats: 0, missedChats: 0 };
            current.chats += entry.chats;
            current.missedChats += entry.missedChats;
            statsMap.set(entry.websiteId, current);
        }

        // Convert to array and sort by websiteId
        return Array.from(statsMap.entries())
            .map(([websiteId, stats]) => ({
                websiteId,
                chats: stats.chats,
                missedChats: stats.missedChats
            }))
            .sort((a, b) => a.websiteId.localeCompare(b.websiteId));
    } catch (error) {
        throw new Error(`Failed to process statistics: ${error.message}`);
    }
}

// API endpoint
app.get('/api/stats', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const stats = await processStatistics(startDate, endDate);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

// Export for testing
module.exports = { processStatistics };