const { prisma } = require("../config/prisma");

//solo ofertas activas
async function listActiveOffers() {
  return prisma.offer.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
}

//lista de ofertas
async function listAllOffers() {
  return prisma.offer.findMany({
    orderBy: { createdAt: "desc" },
  });
}

//crear oferta
async function createOffer(data) {
  const {
    title,
    company,
    location,
    hours,
    modality,
    details,
    deadline,
    startDate,
  } = data;

  const offer = await prisma.offer.create({
    data: {
      title,
      company,
      location,
      hours,
      modality,
      details,
      deadline: deadline ? new Date(deadline) : null,
      startDate: startDate ? new Date(startDate) : null,
      isActive: true,
    },
  });

  return offer;
}

//desactivar oferta
async function deactivateOffer(id) {
  return prisma.offer.update({
    where: { id },
    data: { isActive: false },
  });
}

module.exports = {
  listActiveOffers,
  listAllOffers,
  createOffer,
  deactivateOffer,
};
