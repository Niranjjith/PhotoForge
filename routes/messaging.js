import express from "express";
import Message from "../models/Message.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.use(isAuthenticated);

// Send message
router.post("/send", async (req, res) => {
  try {
    const { receiverId, bookingId, message, messageType, voiceNote } = req.body;

    const newMessage = new Message({
      sender: req.session.user._id,
      receiver: receiverId,
      booking: bookingId,
      message: message || "",
      messageType: messageType || "text",
      voiceNote: voiceNote || {},
    });

    await newMessage.save();
    res.json({ message: newMessage, success: true });
  } catch (error) {
    res.status(500).json({ error: "Error sending message" });
  }
});

// Get conversation
router.get("/conversation/:userId", async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.session.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.session.user._id },
      ],
    })
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar")
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
});

// Mark as read
router.post("/:messageId/read", async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.messageId, {
      isRead: true,
      readAt: new Date(),
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error marking message as read" });
  }
});

export default router;

