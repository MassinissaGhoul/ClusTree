const { parse: parseCSV } = require('csv-parse/sync');

/**
 * Check if the buffer is a json or not.
 * @param {Buffer} buffer
 * @returns {boolean}
 */
function isJSON(buffer) {
    try {
        JSON.parse(buffer.toString('utf-8'));
        return true;
    } catch {
        return false;
    }
}

/**
 * Parse a JSON buffer with a "email" list.
 * @param {Buffer} buffer
 * @returns {string[]}
 */
function parseJSON(buffer) {
    const content = buffer.toString('utf-8');
    const data = JSON.parse(content);

    if (Array.isArray(data)) {
        return data;
    }

    throw new Error('Invalid JSON format : expected an array of strings.');
}

/**
 * Parse a CSV buffer with one "email" column.
 * @param {Buffer} buffer
 * @returns {string[]}
 */
function parseCSVEmails(buffer) {
    const content = buffer.toString('utf-8');

    const records = parseCSV(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    if (!records[0] || !records[0].email) {
        throw new Error('The CSV must contain only one column "email".');
    }

    return records.map(record => record.email);
}

/**
 * Parse un buffer CSV ou JSON contenant des e-mails en une liste pure.
 * @param {Buffer} buffer
 * @returns {string[]} Email list
 */
function parseStudentList(buffer) {
    if (isJSON(buffer)) {
        return parseJSON(buffer);
    } else {
        return parseCSVEmails(buffer);
    }
}

module.exports = { parseStudentList };
