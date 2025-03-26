const { professionalMapper } = require("./professional-mapper");
const { serviceMapper } = require("./service.mapper");

function scheduleMapper(schedule) {
  return {
    id: schedule.objectId,
    status: schedule.status,
    startDate: schedule.startDate.iso,
    endDate: schedule.endDate.iso,
    professional: professionalMapper(schedule.professional),
    services: schedule.services.map((s) => serviceMapper(s)),
  };
}

module.exports = { scheduleMapper };
