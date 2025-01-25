import { Request, Response, NextFunction } from 'express';
import { Document, Model } from 'mongoose';

export interface PaginatedResults<T> {
  next?: { page: number; limit: number };
  previous?: { page: number; limit: number };
  results: T[];
}
export function paginatedResults<T extends Document>(model: Model<T>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results: PaginatedResults<T> = { results: [] };

    try {
      const totalDocuments = await model.countDocuments().exec();

      if (endIndex < totalDocuments) {
        results.next = { page: page + 1, limit };
      }

      if (startIndex > 0) {
        results.previous = { page: page - 1, limit };
      }

      results.results = await model.find().limit(limit).skip(startIndex).exec();

      res.locals.paginatedResults = results;

      next(); 
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };
}
