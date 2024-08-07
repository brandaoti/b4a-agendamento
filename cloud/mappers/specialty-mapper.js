

function specialtyMapper(specialty) {
    return {
        id: specialty.objectId,
        name: specialty.name,
    }
}

module.exports = { specialtyMapper }