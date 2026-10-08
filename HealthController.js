const HealthRecord = require('./health');

exports.getHealthRecords = async (req, res) => {
  try {
    const records = await HealthRecord.findAll({ where: { userId: req.user.userId } });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHealthRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findOne({ where: { id: req.params.id, userId: req.user.userId } });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createHealthRecord = async (req, res) => {
  try {
    const { recordType, value, date } = req.body;
    const record = await HealthRecord.create({ 
      recordType, 
      value, 
      date, 
      userId: req.user.userId 
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateHealthRecord = async (req, res) => {
  try {
    const { recordType, value, date } = req.body;
    const [updated] = await HealthRecord.update({ 
      recordType, 
      value, 
      date 
    }, { where: { id: req.params.id, userId: req.user.userId } });
    
    if (!updated) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json({ message: 'Record updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteHealthRecord = async (req, res) => {
  try {
    const deleted = await HealthRecord.destroy({ where: { id: req.params.id, userId: req.user.userId } });
    if (!deleted) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
