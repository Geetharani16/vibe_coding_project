import { Request, Response } from 'express';
export declare const getAllAppliances: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getApplianceById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const addAppliance: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateAppliance: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteAppliance: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=applianceController.d.ts.map