export declare const mockDb: {
    select: () => {
        from: (table: any) => Promise<any[]>;
    };
    insert: (table: any) => {
        values: (data: any) => {
            returning: () => Promise<any[]>;
        };
    };
    update: (table: any) => {
        set: (updates: any) => {
            where: (condition: any) => {
                returning: () => Promise<any[]>;
            };
        };
    };
    delete: (table: any) => {
        where: (condition: any) => {
            returning: () => Promise<any[]>;
        };
    };
};
//# sourceMappingURL=mockDatabase.d.ts.map