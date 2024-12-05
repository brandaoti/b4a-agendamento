const { scheduleMapper } = require("../mappers/schedule-mapper");
const { getAvailableSlots } = require("./schedule-slots");

// const Service = Parse.Object.extend("Service");
const Schedule = Parse.Object.extend("Schedule");
const Professional = Parse.Object.extend("Professional");

Parse.Cloud.define(
  "v1-schedule-services",
  async (request) => {
    const params = request.params;

    const serviceIds = params.serviceIds;
    const professionalId = params.professionalId;

    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);

    const queryProfessional = new Parse.Query(Professional);
    queryProfessional.include("services");

    const professional = await queryProfessional.get(professionalId, {
      userMasterKey: true,
    });

    const professionalServices = professional.get("services");

    const services = professionalServices.filter((s) =>
      serviceIds.includes(s.id)
    );

    if (services.length != serviceIds.length) throw "INVALID_SERVICES";

    const duration = services.reduce(
      (partialSum, s) => partialSum + s.get("duration"),
      0
    );

    const availableSlots = await getAvailableSlots({
      duration: duration,
      professionalId: professionalId,
      startDate: startDate,
      endDate: endDate,
    });

    const isAvailable = availableSlots.some((d) =>
      d.slots.some(
        (s) =>
          s.startDate == startDate.toISOString() &&
          s.endDate == endDate.toISOString()
      )
    );

    if (!isAvailable) throw "SLOT_UNAVAILABLE";

    const schedule = new Schedule();

    schedule.set("startDate", startDate);
    schedule.set("endDate", endDate);
    schedule.set("professional", professional);
    schedule.set("user", request.user);
    schedule.set("status", "active");
    schedule.set("services", services);

    await schedule.save(null, { userMasterKey: true });

    return schedule;
  },
  {
    requireUser: true,
  }
);

Parse.Cloud.define(
  "v1-get-user-schedules",
  async (request) => {
    const querySchedule = new Parse.Query(Schedule);

    querySchedule.equalTo("user", request.user);
    querySchedule.include("services", "professional.specialties");

    const result = await querySchedule.find({ userMasterKey: true });

    return result.map((s) => scheduleMapper(s.toJSON()));
  },
  {
    requireUser: true,
  }
);
