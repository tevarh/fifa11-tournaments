const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'fifa11',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

