// Use Parse.Cloud.define to define as many cloud functions as you want.

const { professionalMapper } = require("../mappers/professional-mapper");

const Professional = Parse.Object.extend("Professional");
const Specialty = Parse.Object.extend("Specialty");

Parse.Cloud.define("v1-get-professionals", async (request) => {
	const params = request.params;

	const query = new Parse.Query(Professional);

	query.include("specialties", "insurances", "services");

	if (request.params.specialtyId) {
		const specialty = new Specialty();
		specialty.id = request.params.specialtyId;
		query.equalTo("specialties", specialty);
	}

	if (request.params.lat && request.params.long) {
		const point = new Parse.GeoPoint({ latitude: params.lat, longitude: params.long });
		query.withinKilometers("location", point, request.params.maxDistance || 50);
	}

	if (request.params.limit && request.params.skip) {
		query.limit(params.limit);
		query.skip(params.skip);
	}

	const results = await query.find({ useMasterKey: true });

	return results.map((data) => professionalMapper(data.toJSON()));
}, {
	fields: {}
});
