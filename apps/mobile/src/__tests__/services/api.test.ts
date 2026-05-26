import {
  parseApiError,
  isValidationError,
  isApiError,
  transformUserResponseToUser,
  transformOnboardingDataToApiRequest,
  authenticateWithGoogle,
  validateSession,
  logout,
  submitOnboarding,
  getUserById,
  endpoints,
  HTTP_STATUS,
  API_ERROR_CODES,
} from '@/services/api';
import type { UserResponse, OnboardingApiRequest } from '@/types/api';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

/**
 * API Service Unit Tests
 * 
 * Tests the API service layer including:
 * - Error parsing functions
 * - Data transformations (snake_case <-> camelCase)
 * - Type guards
 * - Endpoint definitions
 */

describe('API Service', () => {
  describe('parseApiError', () => {
    it('should parse validation error', () => {
      const error = parseApiError({
        code: 'VALIDATION_ERROR',
        message: 'Invalid data',
        details: { name: ['Required'] },
      });
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid data');
      expect(error.details).toEqual({ name: ['Required'] });
    });

    it('should parse server error', () => {
      const error = parseApiError({
        code: 'SERVER_ERROR',
        message: 'Internal error',
      });
      expect(error.code).toBe('SERVER_ERROR');
      expect(error.message).toBe('Internal error');
    });

    it('should parse network error', () => {
      const error = parseApiError({
        code: 'NETWORK_ERROR',
        message: 'Connection failed',
      });
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.message).toBe('Connection failed');
    });

    it('should parse unauthorized error', () => {
      const error = parseApiError({
        code: 'UNAUTHORIZED',
        message: 'Invalid token',
      });
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Invalid token');
    });

    it('should handle invalid token error', () => {
      const error = parseApiError({
        code: 'INVALID_TOKEN',
        message: 'Token expired',
      });
      expect(error.code).toBe('INVALID_TOKEN');
      expect(error.message).toBe('Token expired');
    });

    it('should return SERVER_ERROR for unknown response', () => {
      const error = parseApiError({
        code: 'UNKNOWN',
        message: 'Unknown',
      });
      expect(error.code).toBe('SERVER_ERROR');
      expect(error.message).toBe('Erro desconhecido');
    });

    it('should handle null/undefined response', () => {
      expect(parseApiError(null).code).toBe('NETWORK_ERROR');
      expect(parseApiError(undefined).code).toBe('NETWORK_ERROR');
      expect(parseApiError({}).code).toBe('SERVER_ERROR');
    });

    it('should handle non-object response', () => {
      const error = parseApiError('string response');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.message).toBe('Erro de conexão');
    });

    it('should handle missing message fields', () => {
      const error = parseApiError({ code: 'SERVER_ERROR' });
      expect(error.code).toBe('SERVER_ERROR');
      expect(error.message).toBe('Erro no servidor');
    });
  });

  describe('isValidationError', () => {
    it('should return true for VALIDATION_ERROR with details', () => {
      const error = {
        code: 'VALIDATION_ERROR' as const,
        message: 'Validation failed',
        details: { field: ['Error'] },
      };
      expect(isValidationError(error)).toBe(true);
    });

    it('should return false for VALIDATION_ERROR without details', () => {
      const error = {
        code: 'VALIDATION_ERROR' as const,
        message: 'Validation failed',
      };
      expect(isValidationError(error)).toBe(false);
    });

    it('should return false for other error codes', () => {
      const error = {
        code: 'SERVER_ERROR' as const,
        message: 'Server error',
      };
      expect(isValidationError(error)).toBe(false);
    });
  });

  describe('isApiError', () => {
    it('should return true for valid ApiError object', () => {
      const error = { code: 'SERVER_ERROR', message: 'Error' };
      expect(isApiError(error)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isApiError(null)).toBe(false);
    });

    it('should return false for primitive values', () => {
      expect(isApiError('string')).toBe(false);
      expect(isApiError(123)).toBe(false);
      expect(isApiError(true)).toBe(false);
    });

    it('should return false for object without code', () => {
      expect(isApiError({ message: 'Error' })).toBe(false);
    });

    it('should return false for object with non-string code', () => {
      expect(isApiError({ code: 123, message: 'Error' })).toBe(false);
    });
  });

  describe('transformUserResponseToUser', () => {
    it('should transform API response to frontend User format', () => {
      const apiUser: UserResponse = {
        id: 'user-123',
        name: 'João Silva',
        phone: '82999998888',
        gender: 'Masculino',
        course: 'Ciência da Computação',
        shift: 'Integral',
        campus: 'Campus A.C. Simões',
        matricula: '23415364',
        accessibility: {
          disabilityType: ['physical'],
          needsAudioDescription: false,
        },
        createdAt: '2024-01-01T00:00:00Z',
      };

      const user = transformUserResponseToUser(apiUser);

      expect(user.id).toBe('user-123');
      expect(user.basicInfo.name).toBe('João Silva');
      expect(user.basicInfo.phone).toBe('82999998888');
      expect(user.basicInfo.gender).toBe('Masculino');
      expect(user.courseInfo.course).toBe('Ciência da Computação');
      expect(user.courseInfo.shift).toBe('Integral');
      expect(user.courseInfo.campus).toBe('Campus A.C. Simões');
      expect(user.courseInfo.matricula).toBe('23415364');
      expect(user.accessibilityPrefs.disabilityType).toEqual(['physical']);
      expect(user.accessibilityPrefs.needsAudioDescription).toBe(false);
    });

    it('should handle multiple disability types', () => {
      const apiUser: UserResponse = {
        id: 'user-123',
        name: 'Maria',
        phone: '82999998888',
        gender: 'Feminino',
        course: 'Pedagogia',
        shift: 'Matutino',
        campus: 'Campus CECA',
        matricula: '12345',
        accessibility: {
          disabilityType: ['visual', 'hearing'],
          needsAudioDescription: true,
        },
        createdAt: '2024-01-01T00:00:00Z',
      };

      const user = transformUserResponseToUser(apiUser);

      expect(user.accessibilityPrefs.disabilityType).toEqual(['visual', 'hearing']);
      expect(user.accessibilityPrefs.needsAudioDescription).toBe(true);
    });
  });

  describe('transformOnboardingDataToApiRequest', () => {
    it('should transform frontend data to API request format', () => {
      const data = {
        name: 'João Silva',
        phone: '82999998888',
        gender: 'Masculino',
        course: 'Ciência da Computação',
        shift: 'Integral',
        campus: 'Campus A.C. Simões',
        matricula: '23415364',
        disabilityType: ['physical'],
        needsAudioDescription: false,
      };

      const request = transformOnboardingDataToApiRequest(data);

      expect(request.name).toBe('João Silva');
      expect(request.phone).toBe('82999998888');
      expect(request.gender).toBe('Masculino');
      expect(request.course).toBe('Ciência da Computação');
      expect(request.shift).toBe('Integral');
      expect(request.campus).toBe('Campus A.C. Simões');
      expect(request.matricula).toBe('23415364');
      expect(request.accessibility.disabilityType).toEqual(['physical']);
      expect(request.accessibility.needsAudioDescription).toBe(false);
    });

    it('should handle multiple disability types', () => {
      const data = {
        name: 'Maria',
        phone: '82999998888',
        gender: 'Feminino',
        course: 'Pedagogia',
        shift: 'Matutino',
        campus: 'Campus CECA',
        matricula: '12345',
        disabilityType: ['visual', 'hearing'],
        needsAudioDescription: true,
      };

      const request = transformOnboardingDataToApiRequest(data);

      expect(request.accessibility.disabilityType).toEqual(['visual', 'hearing']);
      expect(request.accessibility.needsAudioDescription).toBe(true);
    });
  });

  describe('endpoints', () => {
    it('should have correct auth endpoints', () => {
      expect(endpoints.auth.google).toBe('/api/auth/google');
      expect(endpoints.auth.session).toBe('/api/auth/session');
    });

    it('should have correct user endpoints', () => {
      expect(endpoints.user.onboarding).toBe('/api/onboarding');
      expect(endpoints.user.byId('user-123')).toBe('/api/user/user-123');
    });

    it('should generate correct byId endpoint', () => {
      expect(endpoints.user.byId('abc')).toBe('/api/user/abc');
      expect(endpoints.user.byId('123')).toBe('/api/user/123');
    });
  });

  describe('HTTP_STATUS', () => {
    it('should have correct status codes', () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.VALIDATION_ERROR).toBe(422);
      expect(HTTP_STATUS.SERVER_ERROR).toBe(500);
    });
  });

  describe('API_ERROR_CODES', () => {
    it('should have correct error codes', () => {
      expect(API_ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(API_ERROR_CODES.SERVER_ERROR).toBe('SERVER_ERROR');
      expect(API_ERROR_CODES.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
      expect(API_ERROR_CODES.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(API_ERROR_CODES.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(API_ERROR_CODES.INVALID_TOKEN).toBe('INVALID_TOKEN');
    });
  });

  describe('authenticateWithGoogle', () => {
    it('should call correct endpoint with POST method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: 'abc123', user: {} }),
      });

      await authenticateWithGoogle('google-token-123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/google'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should return AuthResponse on success', async () => {
      const mockResponse = { token: 'abc123', user: { id: 'user-1', name: 'Test' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authenticateWithGoogle('google-token-123');
      expect(result).toEqual(mockResponse);
    });

    it('should throw ApiError on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ code: 'SERVER_ERROR', message: 'Server error' }),
      });

      await expect(authenticateWithGoogle('invalid-token')).rejects.toMatchObject({
        code: 'SERVER_ERROR',
      });
    });
  });

  describe('validateSession', () => {
    it('should send Bearer token in Authorization header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ valid: true }),
      });

      await validateSession('session-token-123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/session'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer session-token-123',
          }),
        })
      );
    });

    it('should return SessionResponse on success', async () => {
      const mockResponse = { valid: true, user: { id: 'user-1' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await validateSession('valid-token');
      expect(result).toEqual(mockResponse);
    });

    it('should throw ApiError on unauthorized', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ code: 'UNAUTHORIZED', message: 'Invalid token' }),
      });

      await expect(validateSession('expired-token')).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('logout', () => {
    it('should call DELETE method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await logout();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/session'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should return success response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await logout();
      expect(result).toEqual({ success: true });
    });
  });

  describe('submitOnboarding', () => {
    it('should send data with Authorization header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, user: {} }),
      });

      const data: OnboardingApiRequest = {
        name: 'Test',
        phone: '82999998888',
        gender: 'Masculino',
        course: 'CC',
        shift: 'Integral',
        campus: 'Campus A.C. Simões',
        matricula: '23415364',
        accessibility: { disabilityType: ['physical'], needsAudioDescription: false },
      };

      await submitOnboarding(data, 'token123'); // Function adds "Bearer " prefix

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/onboarding'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer token123',
          }),
        })
      );
    });

    it('should return OnboardingResponse on success', async () => {
      const mockResponse = { success: true, user: { id: 'user-1' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const data: OnboardingApiRequest = {
        name: 'Test',
        phone: '82999998888',
        gender: 'Masculino',
        course: 'CC',
        shift: 'Integral',
        campus: 'Campus A.C. Simões',
        matricula: '23415364',
        accessibility: { disabilityType: ['physical'], needsAudioDescription: false },
      };

      const result = await submitOnboarding(data, 'token');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUserById', () => {
    it('should call correct user endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'user-123', name: 'Test' }),
      });

      await getUserById('user-123', 'token'); // Function adds "Bearer " prefix

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/user/user-123'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should return UserResponse on success', async () => {
      const mockUser: UserResponse = {
        id: 'user-123',
        name: 'João Silva',
        phone: '82999998888',
        gender: 'Masculino',
        course: 'CC',
        shift: 'Integral',
        campus: 'Campus A.C. Simões',
        matricula: '23415364',
        accessibility: { disabilityType: ['physical'], needsAudioDescription: false },
        createdAt: '2024-01-01T00:00:00Z',
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      const result = await getUserById('user-123', 'token');
      expect(result).toEqual(mockUser);
    });

    it('should handle 404 not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ code: 'SERVER_ERROR', message: 'Not found' }),
      });

      await expect(getUserById('nonexistent', 'token')).rejects.toMatchObject({
        code: 'SERVER_ERROR',
      });
    });
  });
});