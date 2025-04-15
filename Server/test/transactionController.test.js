const mongoose = require('mongoose');
const { createTransaction } = require('../controller/transactionController');
const Transaction = require('../model/transactionModel');
const Goal = require('../model/goalsAndSavingsModel');
const Budget = require('../model/budgetModel');

jest.mock('../model/goalsAndSavingsModel'); // Mock Goal model
jest.mock('../model/budgetModel'); // Mock Budget model
jest.mock('../model/transactionModel'); // Mock Transaction model

describe('createTransaction', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                userId: new mongoose.Types.ObjectId(), // Use 'new' here
                amount: 100,
                currency: 'USD',
                baseCurrency: 'USD',
                type: 'Income',
                category: 'Salary',
                tags: ['job', 'salary'],
                recurrence: false,
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock console.error to suppress error messages during tests
        console.error = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a transaction successfully', async () => {
        Goal.autoAllocation.mockResolvedValue({ remainingTransactionAmount: 0 });
        Transaction.prototype.save = jest.fn().mockResolvedValue();

        await createTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Transaction created successfully.",
        }));
    });

    it('should return 400 if required fields are missing', async () => {
        req.body.amount = null; // Simulate missing amount

        await createTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Missing required fields: amount, currency, or baseCurrency"
        });
    });

    it('should handle errors when saving transaction', async () => {
        Transaction.prototype.save = jest.fn().mockRejectedValue(new Error('Database error'));

        await createTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Could not create transaction.",
            error: 'Database error'
        });
    });

    it('should handle errors when updating budget', async () => {
        Goal.autoAllocation.mockResolvedValue({ remainingTransactionAmount: 0 });
        Transaction.prototype.save = jest.fn().mockResolvedValue();
        Budget.UpdateBudgetOnTransaction.mockRejectedValue(new Error('Budget update error'));

        await createTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Transaction created successfully.",
        }));
        expect(console.error).toHaveBeenCalledWith("Failed to update budget:", "Budget update error");
    });
});