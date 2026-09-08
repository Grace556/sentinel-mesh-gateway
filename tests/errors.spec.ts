import { ValidationError, MeshError } from '../src/errors/meshErrors';

describe('Error Model Tests', () => {
  it('maintains expected hierarchy and properties', () => {
    const valErr = new ValidationError('email', 'Invalid formatting');
    expect(valErr).toBeInstanceOf(MeshError);
    expect(valErr.statusCode).toBe(400);
    expect(valErr.code).toBe('VALIDATION_FAILED');
  });
});
