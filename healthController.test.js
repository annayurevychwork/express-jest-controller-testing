const { getHealthRecords, getHealthRecord, createHealthRecord, updateHealthRecord, deleteHealthRecord } = require('./healthController');
const HealthRecord = require('./health');

jest.mock('./health', () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

describe('Health Tracker Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: 1 },
      params: { id: 1 },
      body: { recordType: 'Exercise', value: 30, date: '2025-03-25' },
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getHealthRecords', () => {
    it('should return health records for the user', async () => {
      const records = [{ id: 1, recordType: 'Exercise', value: 30 }];
      HealthRecord.findAll.mockResolvedValue(records);

      await getHealthRecords(req, res);

      expect(HealthRecord.findAll).toHaveBeenCalledWith({ where: { userId: req.user.userId } });
      expect(res.json).toHaveBeenCalledWith(records);
    });

    it('should return different results on subsequent calls', async () => {
      HealthRecord.findAll
        .mockResolvedValueOnce([{ id: 1, recordType: 'Exercise', value: 30 }]) // перший виклик
        .mockResolvedValueOnce([{ id: 2, recordType: 'Diet', value: 1200 }]); // другий виклик

      await getHealthRecords(req, res); 
      expect(res.json).toHaveBeenCalledWith([{ id: 1, recordType: 'Exercise', value: 30 }]);

      await getHealthRecords(req, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 2, recordType: 'Diet', value: 1200 }]);
    });

    it('should handle errors', async () => {
      const error = new Error('Test Error');
      HealthRecord.findAll.mockRejectedValue(error);

      await getHealthRecords(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });

    it('should find health records by userId and date', async () => {
      const records = [{ id: 1, recordType: 'Exercise', value: 30 }];
      HealthRecord.findAll.mockResolvedValue(records);

      const date = '2025-03-25';
      req.body.date = date;

      await getHealthRecords(req, res);

      expect(HealthRecord.findAll).toHaveBeenCalledWith({
        where: {
          userId: req.user.userId,
          date: expect.stringContaining(date),
        },
      });
    });
  });

  describe('getHealthRecord', () => {
    it('should return the requested health record', async () => {
      const record = { id: 1, recordType: 'Exercise', value: 30 };
      HealthRecord.findOne.mockResolvedValue(record);

      await getHealthRecord(req, res);

      expect(HealthRecord.findOne).toHaveBeenCalledWith({
        where: { id: req.params.id, userId: req.user.userId },
      });
      expect(res.json).toHaveBeenCalledWith(record);
    });

    it('should return 404 if record not found', async () => {
      HealthRecord.findOne.mockResolvedValue(null);

      await getHealthRecord(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Record not found' });
    });

    it('should handle errors', async () => {
      const error = new Error('Test Error');
      HealthRecord.findOne.mockRejectedValue(error);

      await getHealthRecord(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('createHealthRecord', () => {
    it('should create a new health record', async () => {
      const newRecord = { id: 1, recordType: 'Exercise', value: 30, date: '2025-03-25' };
      HealthRecord.create.mockResolvedValue(newRecord);

      await createHealthRecord(req, res);

      expect(HealthRecord.create).toHaveBeenCalledWith({
        recordType: req.body.recordType,
        value: req.body.value,
        date: req.body.date,
        userId: req.user.userId,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newRecord);
    });

    it('should handle errors', async () => {
      const error = new Error('Test Error');
      HealthRecord.create.mockRejectedValue(error);

      await createHealthRecord(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('updateHealthRecord', () => {
    it('should update the health record', async () => {
      HealthRecord.update.mockResolvedValue([1]);

      await updateHealthRecord(req, res);

      expect(HealthRecord.update).toHaveBeenCalledWith(
        { recordType: req.body.recordType, value: req.body.value, date: req.body.date },
        { where: { id: req.params.id, userId: req.user.userId } }
      );
      expect(res.json).toHaveBeenCalledWith({ message: 'Record updated' });
    });

    it('should return 404 if record not found', async () => {
      HealthRecord.update.mockResolvedValue([0]);

      await updateHealthRecord(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Record not found' });
    });

    it('should handle errors', async () => {
      const error = new Error('Test Error');
      HealthRecord.update.mockRejectedValue(error);

      await updateHealthRecord(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('deleteHealthRecord', () => {
    it('should delete the health record', async () => {
      HealthRecord.destroy.mockResolvedValue(1);

      await deleteHealthRecord(req, res);

      expect(HealthRecord.destroy).toHaveBeenCalledWith({ where: { id: req.params.id, userId: req.user.userId } });
      expect(res.json).toHaveBeenCalledWith({ message: 'Record deleted' });
    });

    it('should return 404 if record not found', async () => {
      HealthRecord.destroy.mockResolvedValue(0);

      await deleteHealthRecord(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Record not found' });
    });

    it('should handle errors', async () => {
      const error = new Error('Test Error');
      HealthRecord.destroy.mockRejectedValue(error);

      await deleteHealthRecord(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
