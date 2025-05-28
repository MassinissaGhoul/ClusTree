// test/dao/clusterFileDAO.test.js
const db = require('../../../db');
jest.mock('../../../db');

const {
  createCluster,
  getClustersForStudent,
  getClustersByOwner,
  linkClusterToGroup,
  linkClusterToCompetence,
  getClusterById
} = require('../../../middlewares/db/clusterDAO');

describe('clusterDAO', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getClustersForStudent should return clusters', async () => {
    const mockClusters = [{ id: 1 }, { id: 2 }];
    db.query.mockResolvedValue({ rows: mockClusters });

    const result = await getClustersForStudent(123);

    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('FROM clusters'), [123]);
    expect(result).toEqual(mockClusters);
  });

  test('getClustersByOwner should return clusters for owner', async () => {
    const mockClusters = [{ id: 1 }, { id: 2 }];
    db.query.mockResolvedValue({ rows: mockClusters });

    const result = await getClustersByOwner(42);

    expect(db.query).toHaveBeenCalledWith('SELECT * FROM clusters WHERE owner_id = $1', [42]);
    expect(result).toEqual(mockClusters);
  });

  test('linkClusterToGroup should insert into cluster_groups', async () => {
    db.query.mockResolvedValue({});

    await linkClusterToGroup(1, 99);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO cluster_groups'),
      [1, 99]
    );
  });

  test('linkClusterToCompetence should insert into cluster_competences', async () => {
    db.query.mockResolvedValue({});

    await linkClusterToCompetence(1, 5);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO cluster_competences'),
      [1, 5]
    );
  });

  test('getClusterById should return a single cluster', async () => {
    const mockCluster = { id: 1, name: 'Test' };
    db.query.mockResolvedValue({ rows: [mockCluster] });

    const result = await getClusterById(1);

    expect(db.query).toHaveBeenCalledWith('SELECT * FROM clusters WHERE id = $1', [1]);
    expect(result).toEqual(mockCluster);
  });
});
