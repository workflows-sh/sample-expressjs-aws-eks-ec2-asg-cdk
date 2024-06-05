const express = require('express');

jest.mock('express');
jest.mock('path');

describe('Api express test', () => {
    let mockApp;
    beforeEach(() => {
        mockApp = {
            listen: jest.fn(),
            set: jest.fn(),
            use: jest.fn(),
            get: jest.fn(),
        };
        express.mockImplementation(() => mockApp);
        jest.clearAllMocks();
    });
    it('should initialize without errors', () => {
        require('./index');
        expect(express).toHaveBeenCalled();
    });
});