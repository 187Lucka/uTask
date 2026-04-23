import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    from: string;
    to: string;
    content: string;
    read: boolean;
    timestamp: Date;
}

const messageSchema = new Schema<IMessage>({
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
messageSchema.index({ from: 1, to: 1 });
messageSchema.index({ to: 1, read: 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
