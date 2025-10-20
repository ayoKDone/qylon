// Simple test to verify the service can be imported
describe('Re-engagement Engine Service', () => {
  it('should have proper environment variables set', () => {
    expect(process.env['SUPABASE_URL']).toBeDefined();
    expect(process.env['SUPABASE_SERVICE_ROLE_KEY']).toBeDefined();
    expect(process.env['JWT_SECRET']).toBeDefined();
  });

  it('should have proper types defined', () => {
    expect(() => {
      require('../../types');
    }).not.toThrow();
  });

  it('should be able to import utility modules', () => {
    expect(() => {
      require('../../utils/logger');
      require('../../middleware/errorHandler');
    }).not.toThrow();
  });

  it('should have proper package.json configuration', () => {
    const packageJson = require('../../../package.json');
    expect(packageJson.name).toBe('re-engagement-engine');
    expect(packageJson.version).toBeDefined();
    expect(packageJson.scripts.test).toBeDefined();
  });
});
