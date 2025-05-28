const db = require('../../../db');
jest.mock('../../../db');

const argon2 = require('argon2');
jest.mock('argon2');

const {
  userLogin,
  userRegister,
  deleteUser,
  updateUser,
  getUserInfos
} = require('../../../middlewares/db/userDAO');

describe('userDAO', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('userLogin', () => {
    test('should throw if fields are missing', async () => {
      await expect(userLogin(null, 'pass')).rejects.toThrow('Missing required fields');
      await expect(userLogin('email@example.com', null)).rejects.toThrow('Missing required fields');
    });

    test('should throw if user not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      await expect(userLogin('email@example.com', 'pass')).rejects.toThrow('User does not exist');
    });

    test('should throw if password does not match', async () => {
      db.query.mockResolvedValue({
        rows: [{ password: 'hash' }]
      });
      argon2.verify.mockResolvedValue(false);
      await expect(userLogin('email@example.com', 'pass')).rejects.toThrow('Wrong credentials');
    });

    test('should return userData if login succeeds', async () => {
      const mockUser = {
        id: 1,
        email: 'email@example.com',
        password: 'hash',
        name: 'John',
        family_name: 'Doe',
        role_name: 'teacher'
      };
      db.query.mockResolvedValue({ rows: [mockUser] });
      argon2.verify.mockResolvedValue(true);

      const result = await userLogin('email@example.com', 'password');
      expect(result.userData).toEqual({
        id: 1,
        email: 'email@example.com',
        name: 'John',
        familyName: 'Doe',
        role: 'teacher'
      });
    });
  });

  describe('userRegister', () => {
    test('should throw if fields are missing', async () => {
      await expect(userRegister(null, 'name', 'family', 'pass')).rejects.toThrow('Missing required fields');
    });

    test('should throw if user already exists', async () => {
      process.env.DEFAULT_ROLE_ID = '1';
      argon2.hash.mockResolvedValue('hashed-pass');
      db.query.mockResolvedValue({ rowCount: 0 });
      await expect(userRegister('a@a.com', 'Name', 'Fam', 'pass')).rejects.toThrow('User already registered');
    });

    test('should return user ID if successful', async () => {
      process.env.DEFAULT_ROLE_ID = '1';
      argon2.hash.mockResolvedValue('hashed-pass');
      db.query.mockResolvedValue({ rowCount: 1, rows: [{ id: 42 }] });

      const result = await userRegister('a@a.com', 'Name', 'Fam', 'pass');
      expect(result).toEqual({ id: 42 });
    });
  });

  describe('deleteUser', () => {
    test('should throw if no ID', async () => {
      await expect(deleteUser()).rejects.toThrow('Missing userId');
    });

    test('should delete user', async () => {
      db.query.mockResolvedValue({});
      const result = await deleteUser(3);
      expect(db.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', [3]);
      expect(result).toEqual({ success: true });
    });
  });

  describe('updateUser', () => {
    test('should throw if user not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      await expect(updateUser(1)).rejects.toThrow('User not found');
    });

    test('should update without password change', async () => {
      const user = {
        email: 'e@e.com',
        name: 'John',
        family_name: 'Doe',
        password: 'existing'
      };
      db.query.mockResolvedValueOnce({ rows: [user] }); // SELECT
      db.query.mockResolvedValueOnce({}); // UPDATE

      const result = await updateUser(1, 'new@e.com', null, null, null);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE users'), [
        'new@e.com', 'John', 'Doe', 'existing', 1
      ]);
      expect(result).toEqual({ success: true });
    });

    test('should update with new password', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{
          email: 'a@a.com',
          name: 'A',
          family_name: 'B',
          password: 'oldhash'
        }]
      });
      argon2.hash.mockResolvedValue('newhash');
      db.query.mockResolvedValueOnce({});

      const result = await updateUser(1, null, 'A', 'B', 'newpass');
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE users'), expect.any(Array));
      expect(result).toEqual({ success: true });
    });
  });

  describe('getUserInfos', () => {
    test('should throw if user not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      await expect(getUserInfos(42)).rejects.toThrow('User does not exist');
    });

    test('should return user infos', async () => {
      const mockUser = {
        id: 1,
        email: 'e@e.com',
        name: 'N',
        family_name: 'F',
        register_date: '2024-01-01'
      };
      db.query.mockResolvedValue({ rows: [mockUser] });
      const result = await getUserInfos(1);
      expect(result).toEqual(mockUser);
    });
  });
});
