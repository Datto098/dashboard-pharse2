const FilterTemplate = require('../models/filterTemplate.model');

const createTemplate = async (data) => {
	return await FilterTemplate.create({
		name: data.name,
		filters: {
			bought: data.filters?.bought || 'all',
			newArrival: data.filters?.newArrival || 'all',
			fulfillment: data.filters?.fulfillment || 'all',
			fbaFee: data.filters?.fbaFee || 'all',
			price: data.filters?.price || 'all',
			rating: data.filters?.rating || 'all',
		},
		description: data.description || '',
		isDefault: data.isDefault || false,
		createdBy: data.createdBy || 'user',
	});
};

const getAllTemplates = async () => {
	return await FilterTemplate.find().sort({ isDefault: -1, name: 1 });
};

const getTemplateById = async (id) => {
	return await FilterTemplate.findById(id);
};

const getTemplateByName = async (name) => {
	return await FilterTemplate.findOne({ name });
};

const updateTemplate = async (id, data) => {
	return await FilterTemplate.findByIdAndUpdate(
		id,
		{
			name: data.name,
			filters: {
				bought: data.filters?.bought || 'all',
				newArrival: data.filters?.newArrival || 'all',
				fulfillment: data.filters?.fulfillment || 'all',
				fbaFee: data.filters?.fbaFee || 'all',
				price: data.filters?.price || 'all',
				rating: data.filters?.rating || 'all',
			},
			description: data.description || '',
			isDefault: data.isDefault || false,
		},
		{ new: true }
	);
};

const deleteTemplate = async (id) => {
	return await FilterTemplate.findByIdAndDelete(id);
};

const deleteAllTemplates = async () => {
	return await FilterTemplate.deleteMany();
};

const createDefaultTemplates = async () => {
	const defaultTemplates = [
		{
			name: '≥200 & FBA',
			filters: {
				bought: '200',
				fulfillment: 'FBA',
			},
			description: 'Products with 200+ bought and FBA fulfillment',
			isDefault: true,
			createdBy: 'system',
		},
		{
			name: '≥300 & Fee ≤3',
			filters: {
				bought: '300',
				fbaFee: '0-3',
			},
			description: 'Products with 300+ bought and FBA fee ≤$3',
			isDefault: true,
			createdBy: 'system',
		},
		{
			name: 'New 30d & FBM',
			filters: {
				newArrival: '30',
				fulfillment: 'FBM',
			},
			description: 'New products within 30 days and FBM fulfillment',
			isDefault: true,
			createdBy: 'system',
		},
	];

	for (const template of defaultTemplates) {
		const existing = await FilterTemplate.findOne({ name: template.name });
		if (!existing) {
			await FilterTemplate.create(template);
		}
	}
};

module.exports = {
	createTemplate,
	getAllTemplates,
	getTemplateById,
	getTemplateByName,
	updateTemplate,
	deleteTemplate,
	deleteAllTemplates,
	createDefaultTemplates,
};
