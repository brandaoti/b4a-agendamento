function serviceMapper(service) {
  return {
    id: service.objectId,
    name: service.name,
    price: service.price,
    duration: service.duration,
  };
}

module.exports = { serviceMapper };
