import type { Request, Response } from "express";

export async function register(req: Request, res: Response) {
  res.status(201).json({
    message: "register stub",
    received: req.body,
  });
}

export async function login(req: Request, res: Response) {
  res.status(200).json({
    message: "login stub",
    received: req.body,
  });
}

export async function me(req: Request, res: Response) {
  res.status(200).json({
    message: "me stub",
  });
}
