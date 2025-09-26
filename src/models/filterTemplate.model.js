const mongoose = require('mongoose');

const filterTemplateSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true },
		filters: {
			bought: { type: String, default: 'all' },
			newArrival: { type: String, default: 'all' },
			fulfillment: { type: String, default: 'all' },
			fbaFee: { type: String, default: 'all' },
			price: { type: String, default: 'all' },
			rating: { type: String, default: 'all' },
		},
		description: { type: String, default: '' },
		isDefault: { type: Boolean, default: false },
		createdBy: { type: String, default: 'system' },
	},
	{
		timestamps: true,
	}
);

filterTemplateSchema.index({ name: 1 });
filterTemplateSchema.index({ isDefault: 1 });

module.exports = mongoose.model('FilterTemplate', filterTemplateSchema);
