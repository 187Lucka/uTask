import mongoose, { Schema, Document } from 'mongoose';

export interface IList extends Document {
    name: string;
    boardId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const listSchema = new Schema<IList>({
    name: {
        type: String,
        required: true
    },
    boardId: {
        type: Schema.Types.ObjectId,
        ref: 'Board',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const List = mongoose.model<IList>('List', listSchema);
