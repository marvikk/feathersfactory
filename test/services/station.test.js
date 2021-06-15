const assert = require('assert');
const app = require('../../src/app');

describe('\'station\' service', () => {
  it('registered the service', () => {
    const service = app.service('station');

    assert.ok(service, 'Registered the service');
  });
});
