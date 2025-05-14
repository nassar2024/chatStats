const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Convert exec to return a Promise
const execPromise = util.promisify(exec);

// Get current date in YYYY-MM-DD format
const currentDate = new Date().toISOString().split('T')[0]; // e.g., 2025-05-14
const logDir = path.join(__dirname, 'logs');
const logFile = path.join(logDir, `frontEndTestCase-${currentDate}.log`);

async function runTestsAndLog() {
  try {
    // Ensure logs directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Run vitest and capture output
    const { stdout, stderr } = await execPromise('npx vitest run');

    // Combine stdout and stderr for complete test output
    const output = `${stdout}\n${stderr}`.trim();

    // Write output to log file
    fs.writeFileSync(logFile, output, 'utf8');
    console.log(`Test results saved to ${logFile}`);
  } catch (error) {
    console.error('Error running tests or saving log:', error.message);
    process.exit(1);
  }
}

runTestsAndLog();