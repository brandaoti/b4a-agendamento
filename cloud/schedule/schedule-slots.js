const { useMasterKey } = require("parse-server/lib/cloud-code/Parse.Cloud");

const Professional = Parse.Object.extend("Professional");
const Schedule = Parse.Object.extend("Schedule");

Parse.Cloud.define("v1-get-scheduling-slots", async (request) => {
    const params = request.params;

    const duration = params.duration;
    const professionalId = params.professionalId;
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);

    const professional = new Professional();
    professional.id = professionalId;
    await professional.fetch({ useMasterKey: true });

    const schedulingQuery = new Parse.Query(Schedule);

    schedulingQuery.equalTo('professional', professional);
    schedulingQuery.greaterThanOrEqualTo('startDate', startDate);
    schedulingQuery.lessThanOrEqualTo('endDate', endDate);
    schedulingQuery.ascending('startDate');

    const schedulings = await schedulingQuery.find({ useMasterKey: true });

    let days = 0;
    const avaliableSlots = [];

    while (days < 30) {

        const currentDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

        days++;

        let weekDay = currentDate.getDay();

        if (weekDay == 0) weekDay = 7;

        const workSlots = professional.get('scheduleRule').filter((s) => s.weekday == 1);


        const avaliableSlotsInDays = [];

        for (const workSlot of workSlots) {
            const diffStart = new Date(workSlot.startTime) - new Date('2000-01-01T00:00:00.000Z');
            const diffEnd = new Date(workSlot.endTime) - new Date('2000-01-01T00:00:00.000Z');

            const workSlotStart = new Date(currentDate.getTime() + diffStart);
            const workSlotEnd = new Date(currentDate.getTime() + diffEnd);


            let minutes = 0;

            while (minutes < 24 * 60) {
                const tempSlotStart = new Date(workSlotStart.getTime() + (minutes * 60 * 1000));;
                const tempSlotEnd = new Date(tempSlotStart.getTime() + (duration * 60 * 1000));

                minutes += professional.get('slotInterval');

                if (tempSlotEnd > workSlotEnd) break;

                for (const schedule of schedulings) {

                    const slotStart = tempSlotStart < schedule.get('endDate');
                    const slotEnd = tempSlotEnd <= schedule.get('endDate');

                    if (tempSlotEnd <= schedule.get('startDate')) {
                        avaliableSlotsInDays.push(
                            {
                                startDate: tempSlotStart.toISOString(),
                                endDate: tempSlotEnd.toISOString(),
                            }
                        );
                        break;

                    } else if (slotEnd || slotStart) {
                        break;

                    } else if (schedule === schedulings[schedulings.length - 1]) {
                        avaliableSlotsInDays.push(
                            {
                                startDate: tempSlotStart.toISOString(),
                                endDate: tempSlotEnd.toISOString(),
                            }
                        );
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

}, {
    fields: {
        duration: {
            required: true,
        },
        professionalId: {
            requered: true,
        }

    }
});
