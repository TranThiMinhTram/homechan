import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  quantity: {
    type: Number,
    min: 1
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  minOrder: {
    type: Number,
    min: 0
  },
  hotelOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usedCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
discountSchema.index({ hotelOwner: 1 });

const Discount = mongoose.model('Discount', discountSchema);

export default Discount;
