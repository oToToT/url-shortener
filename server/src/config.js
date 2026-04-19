const fs = require('node:fs');
const path = require('node:path');

const localConfigPath = path.join(__dirname, 'config.json');

function loadLocalConfig() {
    if (!fs.existsSync(localConfigPath)) {
        return {};
    }

    return JSON.parse(fs.readFileSync(localConfigPath, 'utf8'));
}

const localConfig = loadLocalConfig();

function readConfig(name, fallback) {
    if (typeof process.env[name] !== 'undefined' && process.env[name] !== '') {
        return process.env[name];
    }
    if (typeof localConfig[name] !== 'undefined') {
        return localConfig[name];
    }
    return fallback;
}

function readRequiredConfig(name) {
    const value = readConfig(name);
    if (typeof value === 'undefined' || value === '') {
        throw new Error(`Missing required config: ${name}`);
    }
    return value;
}

function readIntegerConfig(name, fallback) {
    const rawValue = readConfig(name, fallback);
    const value = Number.parseInt(rawValue, 10);

    if (!Number.isInteger(value)) {
        throw new Error(`Invalid integer config for ${name}: ${rawValue}`);
    }

    return value;
}

module.exports = {
    GCP_PROJECT_ID: readConfig('GCP_PROJECT_ID', readConfig('GOOGLE_CLOUD_PROJECT')),
    GCP_KEY_FILENAME: readConfig('GCP_KEY_FILENAME'),
    HOST_ADDR: readRequiredConfig('HOST_ADDR'),
    MAX_TRIES: readIntegerConfig('MAX_TRIES', 100),
    URL_MIN_LENGTH: readIntegerConfig('URL_MIN_LENGTH', 3),
    URL_BASE: readRequiredConfig('URL_BASE'),
};
