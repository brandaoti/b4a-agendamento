
const { formatSpeciality } = require("../specialty/format-specialty");

function formatProfessional(p) {
    return {
        id: p.objectId,
        crm: p.crm,
        name: p.name,
        specialties: p.specialties.map((s) => formatSpeciality(s)),
    }
}

module.exports = { formatProfessional }