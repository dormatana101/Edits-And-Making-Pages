import { Request, Response, NextFunction } from "express";
import { Document, Model } from "mongoose";

export interface PaginatedResults<T> {
  next?: { page: number; limit: number };
  previous?: { page: number; limit: number };
  results: T[];
}

export function paginatedResults<T extends Document>(model: Model<T>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = req.query.sort ? JSON.parse(req.query.sort as string) : { createdAt: -1 }; // Default sorting
    const filter = req.query.filter ? JSON.parse(req.query.filter as string) : {}; // Default to no filter

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results: PaginatedResults<T> = { results: [] };

    try {
      const totalDocuments = await model.countDocuments(filter).exec(); // Count only filtered documents

      if (endIndex < totalDocuments) {
        results.next = { page: page + 1, limit };
      }

      if (startIndex > 0) {
        results.previous = { page: page - 1, limit };
      }

      results.results = await model
        .find(filter)
        .sort(sort) 
        .limit(limit)
        .skip(startIndex)
        .exec();

      res.locals.paginatedResults = results;

      next(); 
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };
}
