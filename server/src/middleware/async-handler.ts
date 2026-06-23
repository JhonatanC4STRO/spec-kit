import { Request, Response, NextFunction } from "express";

type AsyncHandler = (req: Request, res: Response) => Promise<void>;

export function asyncHandler(
  handler: AsyncHandler,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res).catch(next);
  };
}
