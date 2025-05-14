// Mock native fetch using jest-fetch-mock
require('jest-fetch-mock').enableMocks();

const { processStatistics } = require('./index');

const mockData = [
  {
    websiteId: '4f8b36d00000000000000001',
    date: '2019-04-05T00:00:00.000Z',
    chats: 100,
    missedChats: 5,
  },
  {
    websiteId: '4f8b36d00000000000000001',
    date: '2019-04-06T00:00:00.000Z',
    chats: 150,
    missedChats: 10,
  },
  {
    websiteId: '4f8b36d00000000000000002',
    date: '2019-04-05T00:00:00.000Z',
    chats: 50,
    missedChats: 2,
  },
];

describe('processStatistics', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should aggregate stats without date filters', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockData));

    const result = await processStatistics();

    expect(result).toEqual([
      {
        websiteId: '4f8b36d00000000000000001',
        chats: 250,
        missedChats: 15,
      },
      {
        websiteId: '4f8b36d00000000000000002',
        chats: 50,
        missedChats: 2,
      },
    ]);
    expect(fetch).toHaveBeenCalledWith(
      'https://bitbucket.org/!api/2.0/snippets/tawkto/aA8zqE/4f62624a75da6d1b8dd7f70e53af8d36a1603910/files/webstats.json'
    );
  });

  test('should filter stats by start and end date', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockData));

    const result = await processStatistics('2019-04-05', '2019-04-05');

    expect(result).toEqual([
      {
        websiteId: '4f8b36d00000000000000001',
        chats: 100,
        missedChats: 5,
      },
      {
        websiteId: '4f8b36d00000000000000002',
        chats: 50,
        missedChats: 2,
      },
    ]);
  });

  test('should filter stats by start date only', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockData));

    const result = await processStatistics('2019-04-06');

    expect(result).toEqual([
      {
        websiteId: '4f8b36d00000000000000001',
        chats: 150,
        missedChats: 10,
      },
    ]);
  });

  test('should throw error for invalid start date', async () => {
    await expect(processStatistics('invalid-date')).rejects.toThrow('Invalid startDate');
  });

  test('should throw error for start date after end date', async () => {
    await expect(processStatistics('2019-04-07', '2019-04-06')).rejects.toThrow('startDate cannot be after endDate');
  });

  test('should throw error for failed fetch', async () => {
    fetch.mockRejectOnce(new Error('Network error'));

    await expect(processStatistics()).rejects.toThrow('Failed to process statistics: Network error');
  });

  test('should skip invalid entries', async () => {
    const invalidData = [
      ...mockData,
      {
        websiteId: '4f8b36d00000000000000003',
        date: 'invalid-date',
        chats: 10,
        missedChats: 1,
      },
      {
        websiteId: null,
        date: '2019-04-05T00:00:00.000Z',
        chats: 10,
        missedChats: 1,
      },
    ];
    fetch.mockResponseOnce(JSON.stringify(invalidData));

    const result = await processStatistics();

    expect(result).toEqual([
      {
        websiteId: '4f8b36d00000000000000001',
        chats: 250,
        missedChats: 15,
      },
      {
        websiteId: '4f8b36d00000000000000002',
        chats: 50,
        missedChats: 2,
      },
    ]);
  });
});