import express, { type Application } from "express";

export const getApp = async (): Promise<Application> => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
  });

  return app;
};
