const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('./patient');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const patient = await Patient.create({ username, password: hashedPassword });
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const patient = await Patient.findOne({ where: { username } });

    if (!patient || !bcrypt.compareSync(password, patient.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: patient.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
