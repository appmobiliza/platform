import { CourseInfoSchema } from '../../schemas/courseInfo.schema';

// Helper function to safely get first issue path
function getFirstIssuePath(result: ReturnType<typeof CourseInfoSchema.safeParse>): string | undefined {
  if (!result.success) {
    return result.error.issues[0]?.path[0]?.toString();
  }
  return undefined;
}

describe('CourseInfoSchema', () => {
  describe('course validation', () => {
    it('should pass with valid course', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: 'Matutino',
        campus: 'Campus Central',
        matricula: '123456789',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with empty course', () => {
      const result = CourseInfoSchema.safeParse({
        course: '',
        shift: 'Matutino',
        campus: 'Campus Central',
        matricula: '123456789',
      });
      expect(result.success).toBe(false);
      expect(getFirstIssuePath(result)).toBe('course');
    });

    it('should fail when course is missing', () => {
      const result = CourseInfoSchema.safeParse({
        shift: 'Matutino',
        campus: 'Campus Central',
        matricula: '123456789',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('shift validation', () => {
    it('should pass with valid shift', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: 'Matutino',
        campus: 'Campus Central',
        matricula: '123456789',
      });
      expect(result.success).toBe(true);
    });

    it('should pass with different valid shift', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: 'Noturno',
        campus: 'Campus Central',
        matricula: '123456789',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with empty shift', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: '',
        campus: 'Campus Central',
        matricula: '123456789',
      });
      expect(result.success).toBe(false);
      expect(getFirstIssuePath(result)).toBe('shift');
    });

    it('should fail when shift is missing', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        campus: 'Campus Central',
        matricula: '123456789',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('campus validation', () => {
    it('should pass with valid campus', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: 'Matutino',
        campus: 'Campus Central',
        matricula: '123456789',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with empty campus', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: 'Matutino',
        campus: '',
        matricula: '123456789',
      });
      expect(result.success).toBe(false);
      expect(getFirstIssuePath(result)).toBe('campus');
    });

    it('should fail when campus is missing', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: 'Matutino',
        matricula: '123456789',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('matricula validation', () => {
    it('should pass with valid matricula', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: 'Matutino',
        campus: 'Campus Central',
        matricula: '123456789',
      });
      expect(result.success).toBe(true);
    });

    it('should pass with matricula at minimum length (5 chars)', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: 'Matutino',
        campus: 'Campus Central',
        matricula: '12345',
      });
      expect(result.success).toBe(true);
    });

    it('should pass with matricula at maximum length (20 chars)', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: 'Matutino',
        campus: 'Campus Central',
        matricula: '12345678901234567890',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with matricula shorter than 5 chars', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: 'Matutino',
        campus: 'Campus Central',
        matricula: '1234',
      });
      expect(result.success).toBe(false);
      expect(getFirstIssuePath(result)).toBe('matricula');
    });

    it('should fail with empty matricula', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: 'Matutino',
        campus: 'Campus Central',
        matricula: '',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when matricula is missing', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: 'Matutino',
        campus: 'Campus Central',
      });
      expect(result.success).toBe(false);
    });

    it('should fail with matricula exceeding 20 chars', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: 'Matutino',
        campus: 'Campus Central',
        matricula: '1'.repeat(21),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('combined validation', () => {
    it('should fail when all fields are empty', () => {
      const result = CourseInfoSchema.safeParse({
        course: '',
        shift: '',
        campus: '',
        matricula: '',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when only course is valid', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: '',
        campus: '',
        matricula: '',
      });
      expect(result.success).toBe(false);
    });

    it('should fail with completely missing object', () => {
      const result = CourseInfoSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});