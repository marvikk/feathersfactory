// Initializes the `station` service on path `/station`
const { Station } = require('./station.class');
const createModel = require('../../models/station.model');
const hooks = require('./station.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/station', new Station(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('station');

  service.hooks(hooks);
};
