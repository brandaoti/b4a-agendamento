const Professional = Parse.Object.extend("Professional");
const Schedule = Parse.Object.extend("Schedule");

Parse.Cloud.define(
  "v1-get-scheduling-slots",
  async (request) => {
    const params = request.params;

    const duration = params.duration;
    const professionalId = params.professionalId;
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);

    return getAvailableSlots({
      duration: duration,
      professionalId: professionalId,
      startDate: startDate,
      endDate: endDate,
    });
  },
  {
    fields: {
      duration: { required: true },
      professionalId: { requered: true },
    },
  }
);

module.exports = { getAvailableSlots };

async function getAvailableSlots({
  duration,
  professionalId,
  startDate,
  endDate,
}) {
  const professional = new Professional();
  professional.id = professionalId;
  await professional.fetch({ useMasterKey: true });

  const schedulingQuery = new Parse.Query(Schedule);

  const tempStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
  const tempEndDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);

  schedulingQuery.equalTo("professional", professional);
  schedulingQuery.greaterThanOrEqualTo("startDate", tempStartDate);
  schedulingQuery.lessThanOrEqualTo("endDate", tempEndDate);
  schedulingQuery.ascending("startDate");

  const schedulings = await schedulingQuery.find({ useMasterKey: true });

  let days = 0;
  const avaliableSlots = [];

  while (days < 60) {
    let currentDate = new Date(
      startDate.getTime() + days * 24 * 60 * 60 * 1000
    );
    currentDate.setHours(0, 0, 0, 0);

    days++;

    if (currentDate >= endDate) break;

    let weekDay = currentDate.getDay();
    if (weekDay == 0) weekDay = 7;

    const workSlots = professional
      .get("scheduleRule")
      .filter((s) => s.weekday == weekDay);

    const avaliableSlotsInDays = [];

    for (const workSlot of workSlots) {
      const tempDiffStart = new Date("2000-01-01T00:00:00.000Z");

      const diffStart = new Date(workSlot.startTime) - tempDiffStart;
      const diffEnd = new Date(workSlot.endTime) - tempDiffStart;

      let workSlotStart = new Date(currentDate.getTime() + diffStart);
      let workSlotEnd = new Date(currentDate.getTime() + diffEnd);

      if (workSlotStart < startDate && workSlotEnd > startDate) {
        workSlotStart = startDate;
      } else if (workSlotStart < startDate && workSlotEnd < startDate) {
        continue;
      }

      if (workSlotStart < endDate && workSlotEnd > endDate) {
        workSlotEnd = endDate;
      } else if (workSlotStart > endDate && workSlotEnd > endDate) {
        continue;
      }

      let minutes = 0;

      while (minutes < 24 * 60) {
        const tempSlotStart = new Date(
          workSlotStart.getTime() + minutes * 60 * 1000
        );
        const tempSlotEnd = new Date(
          tempSlotStart.getTime() + duration * 60 * 1000
        );

        minutes += professional.get("slotInterval");

        if (tempSlotEnd > workSlotEnd) break;

        for (const schedule of schedulings) {
          const slotStart = tempSlotStart < schedule.get("endDate");
          const slotEnd = tempSlotEnd <= schedule.get("endDate");

          if (tempSlotEnd <= schedule.get("startDate")) {
            avaliableSlotsInDays.push({
              startDate: tempSlotStart.toISOString(),
              endDate: tempSlotEnd.toISOString(),
            });
            break;
          } else if (slotEnd || slotStart) {
            break;
          } else if (schedule === schedulings[schedulings.length - 1]) {
            avaliableSlotsInDays.push({
              startDate: tempSlotStart.toISOString(),
              endDate: tempSlotEnd.toISOString(),
            });
            break;
          }
        }
      }
    }
    avaliableSlots.push({
      date: currentDate.toISOString(),
      slots: avaliableSlotsInDays,
    });
  }
  return avaliableSlots;
}
