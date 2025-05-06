import { Request, Response } from "express";
import { Message } from "../models/Message";
import { IMessage } from "../interface/types";

export const sendMessage = async (req: Request, res: Response) => {
  const { sender, receiver, content } = req.body;

  try {
    const message = new Message({ sender, receiver, content });
    await message.save();

    // In a real app, use Socket.IO here (see server.ts)
     res.status(201).json({ message });
  } catch (err: any) {
     res.status(500).json({ error: "Server error" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const { userId1, userId2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    }).sort("timestamp");
     res.json({ messages });
  } catch (err: any) {
     res.status(500).json({ error: "Server error" });
  }
};