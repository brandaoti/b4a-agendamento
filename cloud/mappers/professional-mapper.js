
const { specialtyMapper } = require("./specialty-mapper");

function professionalMapper(professional) {
    return {
        id: professional.objectId,
        crm: professional.crm,
        name: professional.name,
        specialties: professional.specialties.map((s) => specialtyMapper(s)),
    }
}

module.exports = { professionalMapper }