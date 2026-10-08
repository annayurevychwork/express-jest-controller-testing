const request = require('supertest');
const express = require('express');
const sinon = require('sinon');
const Patient = require('./patient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRoutes = require('./patientRouter');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Controller', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  test('should register a new patient', async () => {
    const patientStub = sandbox.stub(Patient, 'create').resolves({ id: 1, username: 'testpatient' });
    const res = await request(app).post('/auth/register').send({ username: 'testpatient', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.username).toBe('testpatient');
    expect(patientStub.calledOnce).toBe(true);
  });

  test('should handle error during patient registration', async () => {
    const patientStub = sandbox.stub(Patient, 'create').throws(new Error('Error occurred'));
    const res = await request(app).post('/auth/register').send({ username: 'testpatient', password: 'password123' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Error occurred');
    expect(patientStub.calledOnce).toBe(true);
  });

  test('should login patient with correct credentials', async () => {
    const patient = { id: 1, username: 'testpatient', password: bcrypt.hashSync('password123', 10) };
    sandbox.stub(Patient, 'findOne').resolves(patient);
    const jwtStub = sandbox.stub(jwt, 'sign').returns('fakeToken');

    const res = await request(app).post('/auth/login').send({ username: 'testpatient', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe('fakeToken');
    expect(jwtStub.calledOnce).toBe(true);
  });

  test('should not login patient with incorrect credentials', async () => {
    sandbox.stub(Patient, 'findOne').resolves(null);

    const res = await request(app).post('/auth/login').send({ username: 'testpatient', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  test('should hash password once during registration', async () => {
    const bcryptSpy = sandbox.spy(bcrypt, 'hash');
    const patientStub = sandbox.stub(Patient, 'create').resolves({ id: 1, username: 'testpatient' });

    await request(app).post('/auth/register').send({ username: 'testpatient', password: 'password123' });

    expect(bcryptSpy.calledOnce).toBe(true);
  });
});
