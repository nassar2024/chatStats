const fs = require('fs').promises;
const path = require('path');

// Helper to format date as YYYYMMDD
const getFormattedDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

// Helper to format test results
const formatTestResults = (testResults) => {
  let output = 'Test Results\n';
  output += '='.repeat(50) + '\n\n';

  testResults.testResults.forEach((suite) => {
    output += `Test Suite: ${suite.testFilePath}\n`;
    output += '-'.repeat(50) + '\n';

    suite.testResults.forEach((test) => {
      const status = test.status === 'passed' ? '✓' : '×';
      output += `${status} ${test.fullName} (${test.duration || 0} ms)\n`;
      if (test.status !== 'passed') {
        test.failureMessages.forEach((message) => {
          output += `  Error: ${message}\n`;
        });
      }
    });

    output += '\n';
  });

  output += 'Summary\n';
  output += '-'.repeat(50) + '\n';
  output += `Suites: ${testResults.numTotalTestSuites} total, ${
    testResults.numFailedTestSuites
  } failed\n`;
  output += `Tests: ${testResults.numTotalTests} total, ${
    testResults.numFailedTests
  } failed, ${testResults.numPassedTests} passed\n`;
  output += `Time: ${testResults.testExecTime || 0} s\n`;

  return output;
};

class TestResultLogger {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  async onRunComplete(contexts, results) {
    try {
      const logDir = path.join(__dirname, '../../logs');
      await fs.mkdir(logDir, { recursive: true });

      const date = getFormattedDate();
      const logFile = path.join(logDir, `testCase-${date}.log`);
      const logContent = formatTestResults(results);

      await fs.writeFile(logFile, logContent);
    } catch (error) {
      console.error('Failed to write test results to log:', error);
    }
  }
}

module.exports = TestResultLogger;