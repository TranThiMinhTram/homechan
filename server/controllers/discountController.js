import Discount from '../models/Discount.js';

export const getDiscounts = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'admin') {
            query.hotelOwner = req.user._id;
        }
        const discounts = await Discount.find(query);
        res.json({ success: true, discounts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createDiscount = async (req, res) => {
    try {
        const { code, percentage, quantity, startDate, endDate, minOrder } = req.body;
        const discount = new Discount({
            code: code.toUpperCase(),
            percentage,
            quantity,
            startDate,
            endDate,
            minOrder,
            hotelOwner: req.user.role === 'admin' ? null : req.user._id
        });
        await discount.save();
        res.status(201).json({ success: true, discount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const discount = await Discount.findById(id);
        if (!discount || discount.hotelOwner.toString() !== req.user._id.toString()) {
            return res.status(404).json({ success: false, message: 'Discount not found' });
        }
        await Discount.findByIdAndDelete(id);
        res.json({ success: true, message: 'Discount deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const validateDiscount = async (req, res) => {
    try {
        const { code, totalAmount } = req.body;
        const discount = await Discount.findOne({ code: code.toUpperCase(), isActive: true });
        if (!discount) {
            return res.json({ success: false, message: 'Invalid discount code' });
        }
        const now = new Date();
        if (discount.startDate && now < discount.startDate) {
            return res.json({ success: false, message: 'Discount not yet active' });
        }
        if (discount.endDate && now > discount.endDate) {
            return res.json({ success: false, message: 'Discount expired' });
        }
        if (discount.quantity && discount.usedCount >= discount.quantity) {
            return res.json({ success: false, message: 'Discount limit reached' });
        }
        if (discount.minOrder && totalAmount < discount.minOrder) {
            return res.json({ success: false, message: 'Minimum order not met' });
        }
        res.json({ success: true, discount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, percentage, quantity, startDate, endDate, minOrder } = req.body;

        const discount = await Discount.findById(id);
        if (!discount || (req.user.role !== 'admin' && discount.hotelOwner.toString() !== req.user._id.toString())) {
            return res.status(404).json({ success: false, message: 'Discount not found' });
        }

        discount.code = code.toUpperCase();
        discount.percentage = percentage;
        discount.quantity = quantity;
        discount.startDate = startDate;
        discount.endDate = endDate;
        discount.minOrder = minOrder;

        await discount.save();
        res.json({ success: true, discount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const useDiscount = async (req, res) => {
    try {
        const { code } = req.body;
        const discount = await Discount.findOne({ code: code.toUpperCase() });
        if (!discount) {
            return res.status(404).json({ success: false, message: 'Discount not found' });
        }
        discount.usedCount += 1;
        await discount.save();
        res.json({ success: true, message: 'Discount used' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const toggleDiscountStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const discount = await Discount.findById(id);
        if (!discount || (req.user.role !== 'admin' && discount.hotelOwner.toString() !== req.user._id.toString())) {
            return res.status(404).json({ success: false, message: 'Discount not found' });
        }
        discount.isActive = !discount.isActive;
        await discount.save();
        res.json({ success: true, discount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
