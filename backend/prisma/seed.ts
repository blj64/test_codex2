import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = [
    { name: 'Apple', sku: 'APP', unitType: 'kg', unitPrice: new Prisma.Decimal(2), quantity: new Prisma.Decimal(10) },
    { name: 'Banana', sku: 'BAN', unitType: 'kg', unitPrice: new Prisma.Decimal(1.5), quantity: new Prisma.Decimal(5) },
    { name: 'Milk', sku: 'MILK', unitType: 'unit', unitPrice: new Prisma.Decimal(1.2), quantity: new Prisma.Decimal(20) },
    { name: 'Bread', sku: 'BREAD', unitType: 'unit', unitPrice: new Prisma.Decimal(1), quantity: new Prisma.Decimal(15) },
    { name: 'Cheese', sku: 'CHE', unitType: 'kg', unitPrice: new Prisma.Decimal(8), quantity: new Prisma.Decimal(2) },
    { name: 'Sugar', sku: 'SUG', unitType: 'kg', unitPrice: new Prisma.Decimal(3), quantity: new Prisma.Decimal(7) },
    { name: 'Eggs', sku: 'EGG', unitType: 'unit', unitPrice: new Prisma.Decimal(0.2), quantity: new Prisma.Decimal(50) },
    { name: 'Butter', sku: 'BUT', unitType: 'unit', unitPrice: new Prisma.Decimal(2.5), quantity: new Prisma.Decimal(8) },
  ];
  await prisma.product.createMany({ data: products });

  const prod = await prisma.product.findMany();
  const sale1 = await prisma.sale.create({
    data: {
      date: new Date(),
      total: new Prisma.Decimal(5),
      items: { create: [{ productId: prod[0].id, quantity: new Prisma.Decimal(1), unitPriceSnapshot: prod[0].unitPrice }] },
    },
  });
  const sale2 = await prisma.sale.create({
    data: {
      date: new Date(),
      total: new Prisma.Decimal(3),
      items: { create: [{ productId: prod[2].id, quantity: new Prisma.Decimal(2), unitPriceSnapshot: prod[2].unitPrice }] },
    },
  });
  const sale3 = await prisma.sale.create({
    data: {
      date: new Date(),
      total: new Prisma.Decimal(4),
      items: { create: [{ productId: prod[3].id, quantity: new Prisma.Decimal(4), unitPriceSnapshot: prod[3].unitPrice }] },
    },
  });
}

main().finally(() => prisma.$disconnect());
