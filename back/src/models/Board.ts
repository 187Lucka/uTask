import mongoose, { Schema, Document } from 'mongoose';

export interface IBoard extends Document {
    name: string;
    description?: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const boardSchema = new Schema<IBoard>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Board = mongoose.model<IBoard>('Board', boardSchema);
