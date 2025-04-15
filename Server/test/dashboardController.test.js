const { AdminDashboard, UserDashboard } = require('../controller/dashboardController');
const User = require('../model/userModel');
const Transaction = require('../model/transactionModel');
const Budget = require('../model/budgetModel');
const Goal = require('../model/goalsAndSavingsModel');

// Mock the models
jest.mock('../model/userModel');
jest.mock('../model/transactionModel');
jest.mock('../model/budgetModel');
jest.mock('../model/goalsAndSavingsModel');

describe('AdminDashboard Controller', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock response
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Setup mock request
        mockRequest = {};
    });

    test('should return dashboard details with status 200 on success', async () => {
        // Mock data
        const mockUsers = [{ _id: 'user1', name: 'Test User' }];
        const mockTransactions = [
            { _id: 'trans1', amount: 100, type: 'Income' },
            { _id: 'trans2', amount: 50, type: 'Expense' }
        ];
        const mockBudgets = [{ _id: 'budget1', category: 'Food', limit: 200 }];

        // Setup mocks
        User.find.mockResolvedValue(mockUsers);
        Transaction.find.mockResolvedValue(mockTransactions);
        Goal.countDocuments.mockResolvedValue(2);
        Budget.find.mockResolvedValue(mockBudgets);

        // Execute the controller
        await AdminDashboard(mockRequest, mockResponse);

        // Assertions
        expect(User.find).toHaveBeenCalled();
        expect(Transaction.find).toHaveBeenCalled();
        expect(Goal.countDocuments).toHaveBeenCalled();
        expect(Budget.find).toHaveBeenCalled();

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Admin Dashboard details ",
            totalTransaction: 150,
            totalGoals: 2,
            users: mockUsers,
            transactions: mockTransactions,
            budget: mockBudgets
        });
    });

    test('should return status 500 with error when an exception occurs', async () => {
        // Setup mock to throw error
        const errorMessage = 'Database connection failed';
        User.find.mockRejectedValue(new Error(errorMessage));

        // Execute the controller
        await AdminDashboard(mockRequest, mockResponse);

        // Assertions
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: expect.any(Error)
        });
    });
});

describe('UserDashboard Controller', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock response
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Setup mock request with user information
        mockRequest = {
            user: {
                _id: 'user123'
            }
        };
    });

    test('should return user dashboard details with status 200 on success', async () => {
        // Mock data
        const mockTransactions = [
            { _id: 'trans1', amount: 100, type: 'Income', userId: 'user123' },
            { _id: 'trans2', amount: 50, type: 'Expense', userId: 'user123' }
        ];
        const mockGoals = [{ _id: 'goal1', target: 1000, userId: 'user123' }];
        const mockBudgets = [{ _id: 'budget1', category: 'Food', limit: 200, userId: 'user123' }];

        // Setup mocks
        Transaction.find.mockResolvedValue(mockTransactions);
        Goal.find.mockResolvedValue(mockGoals);
        Budget.find.mockResolvedValue(mockBudgets);

        // Execute the controller
        await UserDashboard(mockRequest, mockResponse);

        // Assertions
        expect(Transaction.find).toHaveBeenCalledWith({ userId: 'user123' });
        expect(Goal.find).toHaveBeenCalledWith({ userId: 'user123' });
        expect(Budget.find).toHaveBeenCalledWith({ userId: 'user123' });

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "User Dashboard details",
            totalSpent: 50,
            totalIncome: 100,
            transactions: mockTransactions,
            goals: mockGoals,
            budgets: mockBudgets
        });
    });

    test('should return status 401 when no user is found in token', async () => {
        // Setup mock request without user ID
        mockRequest = {
            user: {}
        };

        // Execute the controller
        await UserDashboard(mockRequest, mockResponse);

        // Assertions
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Unauthorized: No user found in token"
        });
    });

    test('should return status 500 with error message when an exception occurs', async () => {
        // Setup mock to throw error
        const errorMessage = 'Database query failed';
        Transaction.find.mockRejectedValue(new Error(errorMessage));

        // Mock console.error to avoid polluting test output
        console.error = jest.fn();

        // Execute the controller
        await UserDashboard(mockRequest, mockResponse);

        // Assertions
        expect(console.error).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: errorMessage
        });
    });
});