// Mock database for development/testing when real database is unavailable
let mockAppliances = [
    {
        id: '1',
        name: 'Refrigerator',
        brand: 'Samsung',
        model: 'RF28R7351SG',
        purchaseDate: new Date('2023-01-15'),
        warrantyDurationMonths: 24,
        serialNumber: 'RF28R7351SG123',
        purchaseLocation: 'Best Buy',
        notes: 'Family refrigerator',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1'
    },
    {
        id: '2',
        name: 'Washing Machine',
        brand: 'LG',
        model: 'WM3900HWA',
        purchaseDate: new Date('2022-05-20'),
        warrantyDurationMonths: 36,
        serialNumber: 'WM3900HWA456',
        purchaseLocation: 'Home Depot',
        notes: 'Front load washer',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1'
    }
];
let mockUsers = [
    {
        id: 'user1',
        email: 'test@example.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];
export const mockDb = {
    select: () => ({
        from: (table) => {
            if (table.name === 'appliances')
                return Promise.resolve(mockAppliances);
            if (table.name === 'users')
                return Promise.resolve(mockUsers);
            return Promise.resolve([]);
        }
    }),
    insert: (table) => ({
        values: (data) => ({
            returning: () => {
                const newItem = { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() };
                if (table.name === 'appliances') {
                    mockAppliances.push(newItem);
                    return Promise.resolve([newItem]);
                }
                if (table.name === 'users') {
                    mockUsers.push(newItem);
                    return Promise.resolve([newItem]);
                }
                return Promise.resolve([newItem]);
            }
        })
    }),
    update: (table) => ({
        set: (updates) => ({
            where: (condition) => ({
                returning: () => {
                    if (table.name === 'appliances') {
                        const index = mockAppliances.findIndex(item => item.id === updates.id);
                        if (index !== -1) {
                            mockAppliances[index] = { ...mockAppliances[index], ...updates, updatedAt: new Date() };
                            return Promise.resolve([mockAppliances[index]]);
                        }
                    }
                    return Promise.resolve([]);
                }
            })
        })
    }),
    delete: (table) => ({
        where: (condition) => ({
            returning: () => {
                if (table.name === 'appliances') {
                    const id = condition._where.left.value;
                    const index = mockAppliances.findIndex(item => item.id === id);
                    if (index !== -1) {
                        const deletedItem = mockAppliances[index];
                        mockAppliances.splice(index, 1);
                        return Promise.resolve([deletedItem]);
                    }
                }
                return Promise.resolve([]);
            }
        })
    })
};
//# sourceMappingURL=mockDatabase.js.map