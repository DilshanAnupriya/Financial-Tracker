// Import necessary modules
const mongoose = require('mongoose');
const {
    createGoal,
    getAllGoals,
    getByGoalId,
    updateGoal,
    deleteGoal,
    updateProgress,
    isComplete
} = require('../controller/goalsAndSavingsController');
const Goals = require('../model/goalsAndSavingsModel');

// Mock the mongoose model
jest.mock('../model/goalsAndSavingsModel');

describe('Goal Controller Tests', () => {
    // Reset all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createGoal', () => {
        it('should create a goal successfully', async () => {
            // Mock data
            const mockGoal = {
                userId: 'userId123',
                name: 'Vacation Fund',
                targetAmount: 5000,
                currentAmount: 0,
                category: 'Vacation',
                allocationPercentage: 10
            };

            // Mock request and response
            const req = {
                body: mockGoal
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock the save method to return the mock goal
            const mockSave = jest.fn().mockResolvedValue();
            Goals.mockImplementation(() => ({
                ...mockGoal,
                save: mockSave
            }));

            // Call the function
            await createGoal(req, res);

            // Assertions
            expect(Goals).toHaveBeenCalledWith(req.body);
            expect(mockSave).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Goal created successfully.',
                goal: expect.objectContaining(mockGoal)
            });
        });

        it('should handle errors when creating a goal', async () => {
            // Mock error
            const errorMessage = 'Database connection error';

            // Mock request
            const req = {
                body: {
                    userId: 'userId123',
                    name: 'Vacation Fund',
                    targetAmount: 5000,
                    allocationPercentage: 10
                }
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock the save method to throw an error
            const mockSave = jest.fn().mockRejectedValue(new Error(errorMessage));
            Goals.mockImplementation(() => ({
                save: mockSave
            }));

            // Call the function
            await createGoal(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: errorMessage
            });
        });
    });

    describe('getAllGoals', () => {
        it('should get all goals with default parameters', async () => {
            // Mock goals data
            const mockGoals = [
                {
                    _id: 'goal1',
                    name: 'Vacation',
                    targetAmount: 5000,
                    currentAmount: 1000,
                    category: 'Vacation'
                },
                {
                    _id: 'goal2',
                    name: 'Emergency Fund',
                    targetAmount: 10000,
                    currentAmount: 5000,
                    category: 'Emergency Fund'
                }
            ];

            // Mock request
            const req = {
                query: {}
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock the find method and its chain
            const mockLimit = jest.fn().mockResolvedValue(mockGoals);
            const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
            const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
            const mockFind = jest.fn().mockReturnValue({ sort: mockSort });

            Goals.find = mockFind;
            Goals.countDocuments = jest.fn().mockResolvedValue(2);

            // Call the function
            await getAllGoals(req, res);

            // Assertions
            expect(mockFind).toHaveBeenCalledWith({});
            expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(mockSkip).toHaveBeenCalledWith(0);
            expect(mockLimit).toHaveBeenCalledWith(10);
            expect(Goals.countDocuments).toHaveBeenCalledWith({});
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Budget List.....',
                list: mockGoals,
                count: 2
            });
        });

        it('should get filtered goals with search parameters', async () => {
            // Mock goals data
            const mockGoals = [
                {
                    _id: 'goal1',
                    name: 'Vacation to Hawaii',
                    targetAmount: 5000,
                    currentAmount: 1000,
                    category: 'Vacation'
                }
            ];

            // Mock request with search parameters
            const req = {
                query: {
                    searchText: 'Vacation',
                    page: 2,
                    size: 5
                }
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Expected filter
            const expectedFilter = {
                category: { $regex: 'Vacation', $options: 'i' }
            };

            // Mock the find method and its chain
            const mockLimit = jest.fn().mockResolvedValue(mockGoals);
            const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
            const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
            const mockFind = jest.fn().mockReturnValue({ sort: mockSort });

            Goals.find = mockFind;
            Goals.countDocuments = jest.fn().mockResolvedValue(1);

            // Call the function
            await getAllGoals(req, res);

            // Assertions
            expect(mockFind).toHaveBeenCalledWith(expectedFilter);
            expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(mockSkip).toHaveBeenCalledWith(5); // (page-1)*size = (2-1)*5 = 5
            expect(mockLimit).toHaveBeenCalledWith(5);
            expect(Goals.countDocuments).toHaveBeenCalledWith(expectedFilter);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Budget List.....',
                list: mockGoals,
                count: 1
            });
        });

        it('should handle errors when fetching goals', async () => {
            // Mock error
            const errorMessage = 'Database query error';

            // Mock request
            const req = {
                query: {}
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock Goals.find to throw an error
            Goals.find = jest.fn().mockImplementation(() => {
                throw new Error(errorMessage);
            });

            // Call the function
            await getAllGoals(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: errorMessage
            });
        });
    });

    describe('getByGoalId', () => {
        it('should get a goal by ID successfully', async () => {
            // Mock goal data
            const mockGoal = {
                _id: 'goal123',
                name: 'Vacation',
                targetAmount: 5000,
                currentAmount: 1000,
                category: 'Vacation'
            };

            // Mock request
            const req = {
                params: {
                    id: 'goal123'
                }
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock findById
            Goals.findById = jest.fn().mockResolvedValue(mockGoal);

            // Call the function
            await getByGoalId(req, res);

            // Assertions
            expect(Goals.findById).toHaveBeenCalledWith('goal123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Goal found successfully.',
                budget: mockGoal
            });
        });

        it('should return 404 when goal is not found', async () => {
            // Mock request
            const req = {
                params: {
                    id: 'nonexistentId'
                }
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock findById to return null (goal not found)
            Goals.findById = jest.fn().mockResolvedValue(null);

            // Call the function
            await getByGoalId(req, res);

            // Assertions
            expect(Goals.findById).toHaveBeenCalledWith('nonexistentId');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Not Found'
            });
        });

        it('should handle errors when fetching a goal by ID', async () => {
            // Mock error
            const errorMessage = 'Database query error';

            // Mock request
            const req = {
                params: {
                    id: 'goal123'
                }
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock findById to throw an error
            Goals.findById = jest.fn().mockRejectedValue(new Error(errorMessage));

            // Call the function
            await getByGoalId(req, res);

            // Assertions
            expect(Goals.findById).toHaveBeenCalledWith('goal123');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: errorMessage
            });
        });
    });

    describe('updateGoal', () => {
        it('should update a goal successfully', async () => {
            // Mock data
            const goalId = 'goal123';
            const updateData = {
                name: 'Updated Vacation',
                targetAmount: 6000
            };

            const updatedGoal = {
                _id: goalId,
                name: 'Updated Vacation',
                targetAmount: 6000,
                currentAmount: 1000,
                category: 'Vacation'
            };

            // Mock request
            const req = {
                params: { id: goalId },
                body: updateData
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock findByIdAndUpdate
            Goals.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedGoal);

            // Call the function
            await updateGoal(req, res);

            // Assertions
            expect(Goals.findByIdAndUpdate).toHaveBeenCalledWith(
                goalId,
                updateData,
                { new: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Goal updated successfully.',
                budget: updatedGoal
            });
        });

        it('should return 404 when goal to update is not found', async () => {
            // Mock request
            const req = {
                params: {
                    id: 'nonexistentId'
                },
                body: {
                    name: 'Updated Name'
                }
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock findByIdAndUpdate to return null (goal not found)
            Goals.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

            // Call the function
            await updateGoal(req, res);

            // Assertions
            expect(Goals.findByIdAndUpdate).toHaveBeenCalledWith(
                'nonexistentId',
                { name: 'Updated Name' },
                { new: true }
            );
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Not Found'
            });
        });

        it('should handle errors when updating a goal', async () => {
            // Mock error
            const errorMessage = 'Database update error';

            // Mock request
            const req = {
                params: {
                    id: 'goal123'
                },
                body: {
                    name: 'Updated Name'
                }
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock findByIdAndUpdate to throw an error
            Goals.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error(errorMessage));

            // Call the function
            await updateGoal(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: errorMessage
            });
        });
    });

    describe('deleteGoal', () => {
        it('should delete a goal successfully', async () => {
            // Mock data
            const goalId = 'goal123';
            const deletedGoal = {
                _id: goalId,
                name: 'Vacation',
                targetAmount: 5000
            };

            // Mock request
            const req = {
                params: { id: goalId }
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock findByIdAndDelete
            Goals.findByIdAndDelete = jest.fn().mockResolvedValue(deletedGoal);

            // Call the function
            await deleteGoal(req, res);

            // Assertions
            expect(Goals.findByIdAndDelete).toHaveBeenCalledWith(goalId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Goal deleted',
                budget: deletedGoal
            });
        });

        it('should return 404 when goal to delete is not found', async () => {
            // Mock request
            const req = {
                params: {
                    id: 'nonexistentId'
                }
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock findByIdAndDelete to return null (goal not found)
            Goals.findByIdAndDelete = jest.fn().mockResolvedValue(null);

            // Call the function
            await deleteGoal(req, res);

            // Assertions
            expect(Goals.findByIdAndDelete).toHaveBeenCalledWith('nonexistentId');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Not Found'
            });
        });

        it('should handle errors when deleting a goal', async () => {
            // Mock error
            const errorMessage = 'Database delete error';

            // Mock request
            const req = {
                params: {
                    id: 'goal123'
                }
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock findByIdAndDelete to throw an error
            Goals.findByIdAndDelete = jest.fn().mockRejectedValue(new Error(errorMessage));

            // Call the function
            await deleteGoal(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: errorMessage
            });
        });
    });

    describe('updateProgress', () => {
        it('should update goal progress successfully', async () => {
            // Mock data
            const goalId = 'goal123';
            const amount = 500;

            const goal = {
                _id: goalId,
                name: 'Vacation',
                targetAmount: 5000,
                currentAmount: 1000,
                transactions: [],
                save: jest.fn().mockResolvedValue(true)
            };

            // Mock request
            const req = {
                params: { id: goalId },
                body: { amount }
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock findById
            Goals.findById = jest.fn().mockResolvedValue(goal);

            // Call the function
            await updateProgress(req, res);

            // Assertions
            expect(Goals.findById).toHaveBeenCalledWith(goalId);
            expect(goal.currentAmount).toBe(1500); // 1000 + 500
            expect(goal.transactions.length).toBe(1);
            expect(goal.transactions[0].amount).toBe(amount);
            expect(goal.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Goal amount update successfully',
                budget: amount
            });
        });

        it('should return 400 when amount is not a positive number', async () => {
            // Test cases for invalid amounts
            const testCases = [
                { amount: 0 },
                { amount: -10 },
                { amount: 'not-a-number' }
            ];

            for (const testCase of testCases) {
                // Mock request
                const req = {
                    params: { id: 'goal123' },
                    body: testCase
                };

                // Mock response
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                };

                // Call the function
                await updateProgress(req, res);

                // Assertions
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'Amount must be a positive number.'
                });
            }
        });

        it('should return 404 when goal is not found for progress update', async () => {
            // Mock request
            const req = {
                params: { id: 'nonexistentId' },
                body: { amount: 500 }
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock findById to return null (goal not found)
            Goals.findById = jest.fn().mockResolvedValue(null);

            // Call the function
            await updateProgress(req, res);

            // Assertions
            expect(Goals.findById).toHaveBeenCalledWith('nonexistentId');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Not Found'
            });
        });

        it('should handle errors when updating progress', async () => {
            // Mock error
            const errorMessage = 'Database update error';

            // Mock request
            const req = {
                params: { id: 'goal123' },
                body: { amount: 500 }
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock findById to throw an error
            Goals.findById = jest.fn().mockRejectedValue(new Error(errorMessage));

            // Call the function
            await updateProgress(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(500);
            // The controller has a bug here, but we'll test what it should do
            expect(res.json).toHaveBeenCalled();
            // Check that it was called with an object containing error
            expect(res.json.mock.calls[0][0]).toHaveProperty('error', errorMessage);
        });
    });

    describe('isComplete', () => {
        it('should return completed status when goal is completed', async () => {
            // Mock data for a completed goal
            const goalId = 'goal123';
            const goal = {
                _id: goalId,
                name: 'Vacation',
                targetAmount: 5000,
                currentAmount: 5500 // More than target
            };

            // Mock request
            const req = {
                params: { id: goalId }
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock findById
            Goals.findById = jest.fn().mockResolvedValue(goal);

            // Call the function
            await isComplete(req, res);

            // Assertions
            expect(Goals.findById).toHaveBeenCalledWith(goalId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'goal is completed successfully.'
            });
        });

        it('should return not complete status when goal is not completed', async () => {
            // Mock data for an incomplete goal
            const goalId = 'goal123';
            const goal = {
                _id: goalId,
                name: 'Vacation',
                targetAmount: 5000,
                currentAmount: 3000 // Less than target
            };

            // Mock request
            const req = {
                params: { id: goalId }
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock findById
            Goals.findById = jest.fn().mockResolvedValue(goal);

            // Call the function
            await isComplete(req, res);

            // Assertions
            expect(Goals.findById).toHaveBeenCalledWith(goalId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'goal is not complete yet'
            });
        });

        it('should return 404 when goal is not found for completion check', async () => {
            // Mock request
            const req = {
                params: { id: 'nonexistentId' }
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock findById to return null (goal not found)
            Goals.findById = jest.fn().mockResolvedValue(null);

            // Call the function
            await isComplete(req, res);

            // Assertions
            expect(Goals.findById).toHaveBeenCalledWith('nonexistentId');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Not Found'
            });
        });

        it('should handle errors when checking completion status', async () => {
            // Mock error
            const errorMessage = 'Database query error';

            // Mock request
            const req = {
                params: { id: 'goal123' }
            };

            // Mock response
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock findById to throw an error
            Goals.findById = jest.fn().mockRejectedValue(new Error(errorMessage));

            // Call the function
            await isComplete(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: errorMessage
            });
        });
    });
});