import mongoose, { Schema } from 'mongoose';

const categoryAttributeSchema = new Schema(
    {
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        
        code: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        label: {
            type: String,
            required: true,
        },

        dataType: {
            type: String,
            enum: ["string", "number", "boolean", "enum"],
            required: true,
        },

        options: {
            type: [String], // for enum type
            default: [],
        },

        unit: {
            type: String,  // e.g., GB, kg, cm, etc.
        },

        required: {
            type: Boolean,
            default: false,
        },

        isFilterable: {
            type: Boolean,
            default: false,
        },


        isComparable: {
            type: Boolean,
            default: false,
        },

        aiWeight: {
            type: Number,
            default: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },

    { timestamps: true }
);

categoryAttributeSchema.index({ categoryId: 1, code: 1 }, { unique: true });

export const CategoryAttribute  = mongoose.model('CategoryAttribute', categoryAttributeSchema);
