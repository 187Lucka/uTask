import mongoose, { Schema, Document } from 'mongoose';

export interface ICard extends Document {
    title: string;
    description: string;
    listId: mongoose.Types.ObjectId;
    dueDate: string;
    createdAt: Date;
}

const cardSchema = new Schema<ICard>({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    listId: {
        type: Schema.Types.ObjectId,
        ref: 'List',
        required: true
    },
    dueDate: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Card = mongoose.model<ICard>('Card', cardSchema);
